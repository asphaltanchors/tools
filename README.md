# AAC Tools

A set of tools for asphalt anchor contractors:

- **Pallet Calculator**: Calculate shipping pallet requirements for different product configurations
- **Margin Tracker**: Track landed cost, tariffs, Shopify SKU data, and gross margin with Cloudflare D1
- **Barcode Generator**: Generate ITF-14, GS1-128/SSCC, and Code 128 barcodes
- More tools coming soon

## Development

```bash
npm run dev    # Start development server
npm run build  # Build for production
npm run lint   # Run ESLint
```

## Margin Tracker Cloudflare Setup

The margin tracker expects a D1 binding named `MARGIN_DB`.

```bash
npx wrangler d1 create tools-margin-tracker
npx wrangler d1 migrations apply tools-margin-tracker --remote
```

Replace the placeholder `database_id` in `wrangler.jsonc` with the id returned by `wrangler d1 create`.

Optional Shopify Admin sync environment variables:

```bash
SHOPIFY_SHOP_DOMAIN=asphaltanchors.myshopify.com
SHOPIFY_ADMIN_API_VERSION=2026-01
SHOPIFY_ADMIN_ACCESS_TOKEN=shpat_...
```
