import { mockProducts } from '../data/mockProducts';
import type {
  CartItem,
  CatalogService,
  CollectionKey,
  Product,
  ProductFilters,
  SizeOption,
} from '../types/shop';

const STORE_DOMAIN = process.env.EXPO_PUBLIC_SHOPIFY_STORE_DOMAIN;
const STOREFRONT_TOKEN = process.env.EXPO_PUBLIC_SHOPIFY_STOREFRONT_API_TOKEN;
const API_VERSION = process.env.EXPO_PUBLIC_SHOPIFY_API_VERSION ?? '2026-07';

interface ShopifyCartLine {
  id: string;
  merchandise: {
    id: string;
    product: {
      handle: string;
    };
    selectedOptions: Array<{
      name: string;
      value: string;
    }>;
  };
  quantity: number;
}

interface ShopifyCartSnapshot {
  checkoutUrl: string;
  id: string;
  lines: ShopifyCartLine[];
}

const isPlaceholder = (value?: string) => !value || value.includes('your-');

export const isShopifyConfigured = () =>
  !isPlaceholder(STORE_DOMAIN) && !isPlaceholder(STOREFRONT_TOKEN);

const applyFilters = (products: Product[], filters?: ProductFilters) => {
  let next = products;

  if (filters?.collection && filters.collection !== 'all') {
    next = next.filter((product) => product.collection === filters.collection);
  }

  if (filters?.query) {
    const query = filters.query.trim().toLowerCase();
    next = next.filter((product) =>
      [product.name, product.tagline, product.description, product.mood]
        .join(' ')
        .toLowerCase()
        .includes(query)
    );
  }

  return next;
};

const storefrontRequest = async <T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> => {
  if (!isShopifyConfigured()) {
    throw new Error('Shopify Storefront API is not configured.');
  }

  const response = await fetch(
    `https://${STORE_DOMAIN}/api/${API_VERSION}/graphql.json`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': STOREFRONT_TOKEN as string,
      },
      body: JSON.stringify({ query, variables }),
    }
  );

  const payload = (await response.json()) as {
    data?: T;
    errors?: Array<{ message: string }>;
  };

  if (!response.ok || payload.errors?.length) {
    const message =
      payload.errors?.map((error) => error.message).join(', ') ??
      'Shopify request failed.';
    throw new Error(message);
  }

  if (!payload.data) {
    throw new Error('Shopify response did not include data.');
  }

  return payload.data;
};

const shortLabelFromTitle = (title: string) =>
  title
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase();

const inferCollection = (tags: string[]): Exclude<CollectionKey, 'all'> => {
  const normalized = tags.map((tag) => tag.toLowerCase());

  if (normalized.some((tag) => tag.includes('limited'))) return 'limited';
  if (normalized.some((tag) => tag.includes('new'))) return 'new';
  if (normalized.some((tag) => tag.includes('featured') || tag.includes('bestseller'))) {
    return 'bestsellers';
  }

  return 'bestsellers';
};

const pickAccentColor = (handle: string) => {
  const palette = ['#6E8F43', '#A8772A', '#7AA46D', '#4D9249', '#57743F', '#8A6C32'];
  const index = handle
    .split('')
    .reduce((total, character) => total + character.charCodeAt(0), 0);

  return palette[index % palette.length];
};

const parseSizes = (
  variants: Array<{
    selectedOptions: Array<{ name: string; value: string }>;
    title: string;
  }>
): SizeOption[] => {
  const supportedSizes: SizeOption[] = ['S', 'M', 'L', 'XL', 'XXL'];
  const seen = new Set<SizeOption>();

  variants.forEach((variant) => {
    const option = variant.selectedOptions.find(
      ({ name }) => name.toLowerCase() === 'size'
    );
    const candidate = (option?.value ?? variant.title).toUpperCase() as SizeOption;

    if (supportedSizes.includes(candidate) && !seen.has(candidate)) {
      seen.add(candidate);
    }
  });

  return seen.size ? Array.from(seen) : ['M'];
};

const mapVariantIdsBySize = (
  variants: Array<{
    id: string;
    selectedOptions: Array<{ name: string; value: string }>;
    title: string;
  }>
): Partial<Record<SizeOption, string>> => {
  const supportedSizes: SizeOption[] = ['S', 'M', 'L', 'XL', 'XXL'];

  return variants.reduce<Partial<Record<SizeOption, string>>>((next, variant) => {
    const option = variant.selectedOptions.find(
      ({ name }) => name.toLowerCase() === 'size'
    );
    const candidate = (option?.value ?? variant.title).toUpperCase() as SizeOption;

    if (supportedSizes.includes(candidate) && !next[candidate]) {
      next[candidate] = variant.id;
    }

    return next;
  }, {});
};

const mapSoldOutSizes = (
  variants: Array<{
    availableForSale: boolean;
    selectedOptions: Array<{ name: string; value: string }>;
    title: string;
  }>
): SizeOption[] => {
  const supportedSizes: SizeOption[] = ['S', 'M', 'L', 'XL', 'XXL'];
  const availability = new Map<SizeOption, boolean>();

  variants.forEach((variant) => {
    const option = variant.selectedOptions.find(
      ({ name }) => name.toLowerCase() === 'size'
    );
    const candidate = (option?.value ?? variant.title).toUpperCase() as SizeOption;

    if (supportedSizes.includes(candidate)) {
      availability.set(
        candidate,
        (availability.get(candidate) ?? false) || variant.availableForSale
      );
    }
  });

  return Array.from(availability.entries())
    .filter(([, isAvailable]) => !isAvailable)
    .map(([size]) => size);
};

const mapProduct = (node: {
  description: string;
  handle: string;
  featuredImage?: {
    altText?: string | null;
    url: string;
  } | null;
  tags: string[];
  title: string;
  variants: {
    nodes: Array<{
      availableForSale: boolean;
      compareAtPrice?: { amount: string } | null;
      id: string;
      price: { amount: string };
      selectedOptions: Array<{ name: string; value: string }>;
      title: string;
    }>;
  };
}): Product => {
  const variants = node.variants.nodes;
  const selectedVariant =
    variants.find((variant) => variant.availableForSale) ?? variants[0];
  const collection = inferCollection(node.tags);
  const fallback = mockProducts.find(
    (product) => product.shopifyHandle === node.handle || product.id === node.handle
  );

  return {
    id: node.handle,
    shopifyHandle: node.handle,
    shopifyVariantId: selectedVariant?.id,
    shopifyVariantIdsBySize: mapVariantIdsBySize(variants),
    imageAltText: node.featuredImage?.altText ?? node.title,
    imageUrl: node.featuredImage?.url,
    name: node.title,
    shortLabel: fallback?.shortLabel ?? shortLabelFromTitle(node.title),
    tagline:
      fallback?.tagline ??
      node.description.split('.').find(Boolean)?.trim() ??
      'Shopify catalog product',
    description: node.description || fallback?.description || node.title,
    price: Number(selectedVariant?.price.amount ?? fallback?.price ?? 0),
    compareAtPrice: selectedVariant?.compareAtPrice
      ? Number(selectedVariant.compareAtPrice.amount)
      : fallback?.compareAtPrice,
    accentColor: fallback?.accentColor ?? pickAccentColor(node.handle),
    collection,
    sizes: parseSizes(variants),
    available: variants.some((variant) => variant.availableForSale),
    soldOutSizes: mapSoldOutSizes(variants),
    featured:
      fallback?.featured ??
      node.tags.some((tag) =>
        ['featured', 'bestseller', 'bestseller'].includes(tag.toLowerCase())
      ),
    mood: fallback?.mood ?? `${collection} drop`,
  };
};

const PRODUCTS_QUERY = `
  query StorefrontProducts($first: Int!) {
    products(first: $first, sortKey: CREATED_AT, reverse: true) {
      nodes {
        title
        handle
        description
        tags
        featuredImage {
          altText
          url
        }
        variants(first: 10) {
          nodes {
            id
            title
            availableForSale
            price {
              amount
            }
            compareAtPrice {
              amount
            }
            selectedOptions {
              name
              value
            }
          }
        }
      }
    }
  }
`;

const CART_FIELDS = `
  id
  checkoutUrl
  lines(first: 50) {
    nodes {
      id
      quantity
      merchandise {
        ... on ProductVariant {
          id
          selectedOptions {
            name
            value
          }
          product {
            handle
          }
        }
      }
    }
  }
`;

const CART_CREATE_MUTATION = `
  mutation CartCreate($input: CartInput) {
    cartCreate(input: $input) {
      cart {
        ${CART_FIELDS}
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const CART_LINES_ADD_MUTATION = `
  mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        ${CART_FIELDS}
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const CART_LINES_UPDATE_MUTATION = `
  mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart {
        ${CART_FIELDS}
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const CART_LINES_REMOVE_MUTATION = `
  mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        ${CART_FIELDS}
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const extractCart = <
  T extends {
    cart?: ShopifyCartSnapshot | null;
    userErrors?: Array<{ message: string }>;
  }
>(
  payload: T
) => {
  if (payload.userErrors?.length) {
    throw new Error(payload.userErrors.map((error) => error.message).join(', '));
  }

  if (!payload.cart) {
    throw new Error('Shopify cart response did not include a cart.');
  }

  return payload.cart;
};

export const shopifyCatalogService: CatalogService = {
  async listProducts(filters) {
    const data = await storefrontRequest<{
      products: {
        nodes: Array<{
          description: string;
          featuredImage?: {
            altText?: string | null;
            url: string;
          } | null;
          handle: string;
          tags: string[];
          title: string;
          variants: {
            nodes: Array<{
              availableForSale: boolean;
              compareAtPrice?: { amount: string } | null;
              id: string;
              price: { amount: string };
              selectedOptions: Array<{ name: string; value: string }>;
              title: string;
            }>;
          };
        }>;
      };
    }>(PRODUCTS_QUERY, { first: 24 });

    return applyFilters(data.products.nodes.map(mapProduct), filters);
  },

  async getFeaturedProducts() {
    const products = await this.listProducts();
    return products.filter((product) => product.featured).slice(0, 6);
  },
};

export const createShopifyCart = async (variantId?: string) => {
  const data = await storefrontRequest<{
    cartCreate: {
      cart: ShopifyCartSnapshot | null;
      userErrors: Array<{ message: string }>;
    };
  }>(CART_CREATE_MUTATION, {
    input: variantId
      ? {
          lines: [{ merchandiseId: variantId, quantity: 1 }],
        }
      : {},
  });

  return extractCart(data.cartCreate);
};

export const addShopifyCartLines = async (cartId: string, variantId: string, quantity = 1) => {
  const data = await storefrontRequest<{
    cartLinesAdd: {
      cart: ShopifyCartSnapshot | null;
      userErrors: Array<{ message: string }>;
    };
  }>(CART_LINES_ADD_MUTATION, {
    cartId,
    lines: [{ merchandiseId: variantId, quantity }],
  });

  return extractCart(data.cartLinesAdd);
};

export const updateShopifyCartLine = async (
  cartId: string,
  lineId: string,
  quantity: number
) => {
  const data = await storefrontRequest<{
    cartLinesUpdate: {
      cart: ShopifyCartSnapshot | null;
      userErrors: Array<{ message: string }>;
    };
  }>(CART_LINES_UPDATE_MUTATION, {
    cartId,
    lines: [{ id: lineId, quantity }],
  });

  return extractCart(data.cartLinesUpdate);
};

export const removeShopifyCartLine = async (cartId: string, lineId: string) => {
  const data = await storefrontRequest<{
    cartLinesRemove: {
      cart: ShopifyCartSnapshot | null;
      userErrors: Array<{ message: string }>;
    };
  }>(CART_LINES_REMOVE_MUTATION, {
    cartId,
    lineIds: [lineId],
  });

  return extractCart(data.cartLinesRemove);
};

export const mapShopifyCartToItems = (
  cart: ShopifyCartSnapshot,
  products: Product[]
): CartItem[] =>
  cart.lines.map((line) => {
    const selectedSize =
      (line.merchandise.selectedOptions.find(
        ({ name }) => name.toLowerCase() === 'size'
      )?.value.toUpperCase() as SizeOption | undefined) ?? 'M';
    const product =
      products.find(
        (item) =>
          item.shopifyVariantId === line.merchandise.id ||
          item.shopifyHandle === line.merchandise.product.handle
      ) ??
      mockProducts.find(
        (item) =>
          item.shopifyVariantId === line.merchandise.id ||
          item.shopifyHandle === line.merchandise.product.handle
      );

    return {
      productId: product?.id ?? line.merchandise.product.handle,
      quantity: line.quantity,
      selectedSize,
      shopifyLineId: line.id,
    };
  });
