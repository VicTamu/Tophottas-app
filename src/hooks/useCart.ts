import * as React from 'react';
import { Linking } from 'react-native';

import {
  addShopifyCartLines,
  createShopifyCart,
  isShopifyConfigured,
  mapShopifyCartToItems,
  removeShopifyCartLine,
  updateShopifyCartLine,
} from '../services/shopify';
import type { CartItem, Product, SizeOption } from '../types/shop';

interface UseCartResult {
  addToCart: (product: Product, size: SizeOption) => Promise<void>;
  cart: CartItem[];
  cartCount: number;
  checkoutUrl: string | null;
  isSyncing: boolean;
  openCheckout: () => Promise<void>;
  subtotal: number;
  syncError: string | null;
  updateCartQuantity: (productId: string, size: SizeOption, delta: number) => Promise<void>;
}

const findCartItem = (items: CartItem[], productId: string, size: SizeOption) =>
  items.find((item) => item.productId === productId && item.selectedSize === size);

export function useCart(products: Product[]): UseCartResult {
  const [cart, setCart] = React.useState<CartItem[]>([]);
  const [shopifyCartId, setShopifyCartId] = React.useState<string | null>(null);
  const [checkoutUrl, setCheckoutUrl] = React.useState<string | null>(null);
  const [isSyncing, setIsSyncing] = React.useState(false);
  const [syncError, setSyncError] = React.useState<string | null>(null);

  const replaceCartFromShopify = React.useCallback(
    (
      nextCart: {
        checkoutUrl: string;
        id: string;
        lines: Array<{
          id: string;
          merchandise: {
            id: string;
            product: { handle: string };
            selectedOptions: Array<{ name: string; value: string }>;
          };
          quantity: number;
        }>;
      }
    ) => {
      setShopifyCartId(nextCart.id);
      setCheckoutUrl(nextCart.checkoutUrl);
      setCart(mapShopifyCartToItems(nextCart, products));
    },
    [products]
  );

  const addToCart = React.useCallback(
    async (product: Product, size: SizeOption) => {
      const variantId = product.shopifyVariantIdsBySize?.[size] ?? product.shopifyVariantId;

      setCart((current) => {
        const existing = findCartItem(current, product.id, size);
        if (existing) {
          return current.map((item) =>
            item.productId === product.id && item.selectedSize === size
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        }

        return [...current, { productId: product.id, quantity: 1, selectedSize: size }];
      });

      if (!isShopifyConfigured() || !variantId) {
        return;
      }

      try {
        setIsSyncing(true);
        setSyncError(null);

        if (!shopifyCartId) {
          const createdCart = await createShopifyCart(variantId);
          replaceCartFromShopify(createdCart);
          return;
        }

        const existingItem = findCartItem(cart, product.id, size);
        if (existingItem?.shopifyLineId) {
          const updatedCart = await updateShopifyCartLine(
            shopifyCartId,
            existingItem.shopifyLineId,
            existingItem.quantity + 1
          );
          replaceCartFromShopify(updatedCart);
          return;
        }

        const updatedCart = await addShopifyCartLines(
          shopifyCartId,
          variantId,
          1
        );
        replaceCartFromShopify(updatedCart);
      } catch (error) {
        setSyncError(
          error instanceof Error ? error.message : 'Failed to sync cart with Shopify.'
        );
      } finally {
        setIsSyncing(false);
      }
    },
    [cart, replaceCartFromShopify, shopifyCartId]
  );

  const updateCartQuantity = React.useCallback(
    async (productId: string, size: SizeOption, delta: number) => {
      const existingItem = findCartItem(cart, productId, size);
      const nextQuantity = (existingItem?.quantity ?? 0) + delta;

      setCart((current) =>
        current
          .map((item) =>
            item.productId === productId && item.selectedSize === size
              ? { ...item, quantity: item.quantity + delta }
              : item
          )
          .filter((item) => item.quantity > 0)
      );

      if (!isShopifyConfigured() || !shopifyCartId || !existingItem?.shopifyLineId) {
        return;
      }

      try {
        setIsSyncing(true);
        setSyncError(null);

        const nextCart =
          nextQuantity <= 0
            ? await removeShopifyCartLine(shopifyCartId, existingItem.shopifyLineId)
            : await updateShopifyCartLine(
                shopifyCartId,
                existingItem.shopifyLineId,
                nextQuantity
              );

        replaceCartFromShopify(nextCart);
      } catch (error) {
        setSyncError(
          error instanceof Error ? error.message : 'Failed to update Shopify cart.'
        );
      } finally {
        setIsSyncing(false);
      }
    },
    [cart, replaceCartFromShopify, shopifyCartId]
  );

  const openCheckout = React.useCallback(async () => {
    if (!checkoutUrl) {
      return;
    }

    await Linking.openURL(checkoutUrl);
  }, [checkoutUrl]);

  const subtotal = React.useMemo(
    () =>
      cart.reduce((sum, item) => {
        const product = products.find((candidate) => candidate.id === item.productId);
        return sum + (product?.price ?? 0) * item.quantity;
      }, 0),
    [cart, products]
  );

  const cartCount = React.useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  return {
    addToCart,
    cart,
    cartCount,
    checkoutUrl,
    isSyncing,
    openCheckout,
    subtotal,
    syncError,
    updateCartQuantity,
  };
}
