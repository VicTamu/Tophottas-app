import type { CollectionKey, Product, SizeOption } from '../types/shop';

type ProductCollectionKey = Exclude<CollectionKey, 'all'>;

// Availability is optional on Product: mock data leaves it undefined, which we
// treat as in-stock. Only Shopify-backed products carry real availability.

export const isSizeSoldOut = (product: Product, size: SizeOption) =>
  product.soldOutSizes?.includes(size) ?? false;

export const productMatchesCollection = (
  product: Product,
  collection: CollectionKey
) =>
  collection === 'all' ||
  product.collection === collection ||
  Boolean(product.collectionKeys?.includes(collection));

export const getProductCollectionKey = (
  product: Product,
  preferredCollection?: CollectionKey
): ProductCollectionKey => {
  if (
    preferredCollection &&
    preferredCollection !== 'all' &&
    productMatchesCollection(product, preferredCollection)
  ) {
    return preferredCollection;
  }

  return product.collection;
};

export const isProductSoldOut = (product: Product) => {
  if (product.available === false) {
    return true;
  }

  if (!product.soldOutSizes?.length) {
    return false;
  }

  return product.sizes.every((size) => product.soldOutSizes?.includes(size));
};

export const getFirstAvailableSize = (product: Product): SizeOption =>
  product.sizes.find((size) => !isSizeSoldOut(product, size)) ??
  product.sizes[0] ??
  'M';
