export type CollectionKey =
  | 'all'
  | 'new'
  | 'bestsellers'
  | 'limited';

export type SizeOption = 'S' | 'M' | 'L' | 'XL' | 'XXL';

export interface Product {
  id: string;
  shopifyHandle: string;
  shopifyVariantId?: string;
  shopifyVariantIdsBySize?: Partial<Record<SizeOption, string>>;
  imageAltText?: string;
  imageUrl?: string;
  name: string;
  shortLabel: string;
  tagline: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  accentColor: string;
  collection: Exclude<CollectionKey, 'all'>;
  collectionKeys?: Exclude<CollectionKey, 'all'>[];
  sizes: SizeOption[];
  /** Overall availability. Undefined means assume in-stock (mock data). */
  available?: boolean;
  /** Sizes whose Shopify variant is not available for sale. */
  soldOutSizes?: SizeOption[];
  featured?: boolean;
  mood: string;
}

export interface ProductFilters {
  query?: string;
  collection?: CollectionKey;
}

export interface CartItem {
  productId: string;
  quantity: number;
  selectedSize: SizeOption;
  shopifyLineId?: string;
}

export interface CatalogService {
  listProducts(filters?: ProductFilters): Promise<Product[]>;
  getFeaturedProducts(): Promise<Product[]>;
}
