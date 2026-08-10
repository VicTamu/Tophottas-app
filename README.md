# Top Shottas App

Lean mobile storefront for an iOS-first shirt brand using Expo React Native, Shopify, and Firebase.

## Why this stack

- Shopify handles the hard commerce parts so we do not build a backend from scratch.
- React Native lets you move fast with JavaScript and reuse your web instincts.
- Firebase free tier gives us room for auth, wishlists, and notifications later without immediate cost.
- Expo keeps iOS setup lighter while you learn mobile development.

## Week-by-week plan

### Week 1: UI only

- Build the home screen, featured drop card, and product list with mock data.
- Decide your brand colors, fonts, spacing, and product photography style.
- Test the app on a physical iPhone with Expo Go if you do not have a Mac.

### Week 2: Shopify catalog

- Create the Shopify store.
- Add products, variants, sizes, prices, descriptions, and images.
- Generate a Storefront API token.

### Week 3: Connect the app

- Replace mock product data with Shopify Storefront API data.
- Add product detail, variant selection, and cart state.
- Use Firebase only for customer-facing extras like favorites or saved profiles.

### Week 4: Checkout and launch

- Hand cart and checkout over to Shopify.
- Add app icons, splash screen, and App Store assets.
- Test purchase flow end-to-end and prepare the iOS release.

## Getting started

1. Install dependencies:

```bash
npm install
```

2. Start the app:

```bash
npm start
```

3. Scan the QR code with Expo Go on an iPhone, or use the iOS simulator on macOS.

## Environment variables

Copy `.env.example` to `.env` and fill in the values when you are ready to connect Shopify and Firebase.

## Immediate next build steps

1. Replace `mockCatalogService` in `src/services/catalog.ts` with a Shopify Storefront API service.
2. Map Shopify products, collections, images, and variants into `src/types/shop.ts`.
3. Replace local cart state in `App.tsx` with Shopify cart creation and checkout URL handoff.
4. Add Firebase only for non-commerce extras like favorites, auth, and notifications.

## Suggested first mobile features

- Home screen
- Shop screen with search and collection filters
- Product detail sheet with size selection
- Cart screen with quantity editing
- Checkout handoff to Shopify
- Favorites backed by Firebase later

## Shopify-ready structure

- `src/types/shop.ts` defines the product, cart, collection, and size shapes the UI uses.
- `src/services/catalog.ts` is the service boundary that currently serves mock data.
- `App.tsx` already uses that service boundary instead of reading mock data directly.
- Each product now includes a `shopifyHandle`, so later data can map cleanly to Storefront API records.
