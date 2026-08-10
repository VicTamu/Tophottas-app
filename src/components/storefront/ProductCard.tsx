import * as React from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { ProductGlyph } from './ProductGlyph';
import { collectionLabels } from '../../constants/storefront';
import { colors, spacing } from '../../theme';
import { isProductSoldOut } from '../../utils/product';
import type { Product } from '../../types/shop';

interface ProductCardProps {
  isAdding?: boolean;
  onAdd: (product: Product) => void;
  onOpen: (product: Product) => void;
  product: Product;
}

export function ProductCard({ isAdding = false, onAdd, onOpen, product }: ProductCardProps) {
  const soldOut = isProductSoldOut(product);
  const disabled = soldOut || isAdding;
  const onSale =
    product.compareAtPrice != null && product.compareAtPrice > product.price;

  return (
    <Pressable
      style={({ pressed }) => [styles.productCard, pressed && styles.cardPressed]}
      onPress={() => onOpen(product)}
    >
      <View style={styles.productGlassHighlight} />
      <View style={styles.productSwatch}>
        {product.imageUrl ? (
          <Image
            source={{ uri: product.imageUrl }}
            style={styles.productImage}
            resizeMode="cover"
            accessibilityLabel={product.imageAltText ?? product.name}
          />
        ) : (
          <ProductGlyph accentColor={colors.brass} label={product.shortLabel} />
        )}
        {soldOut ? (
          <View style={styles.soldOutOverlay}>
            <Text style={styles.soldOutOverlayText}>Sold out</Text>
          </View>
        ) : null}
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.productMeta}>{collectionLabels[product.collection]}</Text>
        <Text style={styles.productName} numberOfLines={1}>
          {product.name}
        </Text>
        <View style={styles.priceRow}>
          <Text style={styles.productPrice}>${product.price.toFixed(2)}</Text>
          {onSale ? (
            <Text style={styles.comparePrice}>
              ${product.compareAtPrice?.toFixed(2)}
            </Text>
          ) : null}
        </View>
      </View>
      <Pressable
        style={({ pressed }) => [
          styles.secondaryButton,
          soldOut && styles.secondaryButtonDisabled,
          pressed && !disabled && styles.buttonPressed,
        ]}
        disabled={disabled}
        onPress={() => onAdd(product)}
      >
        {isAdding && !soldOut ? (
          <ActivityIndicator size="small" color={colors.mutedText} />
        ) : (
          <Text
            style={[
              styles.secondaryButtonText,
              soldOut && styles.secondaryButtonTextDisabled,
            ]}
          >
            {soldOut ? 'Sold out' : 'Add'}
          </Text>
        )}
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  productCard: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 24,
    padding: spacing.md,
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.hairline,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOpacity: 0.16,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 7,
  },
  productGlassHighlight: {
    position: 'absolute',
    top: 1,
    left: 1,
    right: 1,
    height: 42,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  productSwatch: {
    width: 78,
    height: 78,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.goldBorder,
    overflow: 'hidden',
    position: 'relative',
  },
  productImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  productInfo: { flex: 1, gap: 4 },
  productMeta: {
    color: colors.brass,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  comparePrice: {
    color: colors.mutedText,
    fontSize: 13,
    fontWeight: '700',
    textDecorationLine: 'line-through',
  },
  soldOutOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(4,8,5,0.62)',
  },
  soldOutOverlayText: {
    color: '#E8E5D1',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  secondaryButtonDisabled: {
    backgroundColor: 'rgba(255,255,255,0.015)',
    borderColor: colors.hairlineSoft,
  },
  secondaryButtonTextDisabled: {
    color: colors.mutedText,
  },
  productName: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.1,
  },
  productPrice: {
    color: colors.brass,
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 0.15,
  },
  secondaryButton: {
    backgroundColor: 'rgba(255,255,255,0.035)',
    borderRadius: 16,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(242,241,236,0.10)',
  },
  secondaryButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  cardPressed: { opacity: 0.94, transform: [{ scale: 0.985 }] },
  buttonPressed: { opacity: 0.9, transform: [{ scale: 0.975 }] },
});
