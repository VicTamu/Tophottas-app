import { mockProducts } from '../data/mockProducts';
import { isShopifyConfigured, shopifyCatalogService } from './shopify';
import type { CatalogService, Product, ProductFilters } from '../types/shop';
import { productMatchesCollection } from '../utils/product';

const applyFilters = (products: Product[], filters?: ProductFilters) => {
  let next = products;

  if (filters?.collection && filters.collection !== 'all') {
    const collection = filters.collection;
    next = next.filter((product) => productMatchesCollection(product, collection));
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

const mockCatalogService: CatalogService = {
  async listProducts(filters) {
    return applyFilters(mockProducts, filters);
  },

  async getFeaturedProducts() {
    return mockProducts.filter((product) => product.featured);
  },
};

export const catalogService: CatalogService = isShopifyConfigured()
  ? shopifyCatalogService
  : mockCatalogService;
