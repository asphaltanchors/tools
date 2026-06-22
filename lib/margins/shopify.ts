import type { D1DatabaseLike } from "./db";
import type { MarginCategory } from "./types";

type ShopifyMoney = {
  amount: string;
  currencyCode?: string;
} | null;

type ShopifyVariantNode = {
  id: string;
  sku: string | null;
  title: string;
  price: string | null;
  inventoryItem: {
    harmonizedSystemCode: string | null;
    countryCodeOfOrigin: string | null;
    unitCost: ShopifyMoney;
  } | null;
};

type ShopifyProductNode = {
  id: string;
  title: string;
  productType: string | null;
  vendor: string | null;
  variants: {
    edges: Array<{ node: ShopifyVariantNode }>;
  };
};

type ShopifyProductsResponse = {
  data?: {
    products?: {
      edges: Array<{ node: ShopifyProductNode }>;
      pageInfo: {
        hasNextPage: boolean;
        endCursor: string | null;
      };
    };
  };
  errors?: Array<{ message: string }>;
};

const slugId = (sku: string) =>
  `sku-${sku.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;

const inferCategory = (
  sku: string,
  productTitle: string,
  productType: string | null,
): MarginCategory => {
  const haystack = `${sku} ${productTitle} ${productType ?? ""}`.toLowerCase();

  if (haystack.includes("kit")) {
    return "Kit";
  }

  if (haystack.includes("epx") || haystack.includes("adhesive")) {
    return "Adhesive";
  }

  if (/^01-/.test(sku) || haystack.includes("anchor")) {
    return "Anchor";
  }

  return "Other";
};

const toNumberOrNull = (value: string | null | undefined) => {
  if (!value) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export async function syncProductsFromShopify(db: D1DatabaseLike) {
  const accessToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
  const shopDomain = (
    process.env.SHOPIFY_SHOP_DOMAIN ?? "asphaltanchors.myshopify.com"
  ).replace(/^https?:\/\//, "");
  const apiVersion = process.env.SHOPIFY_ADMIN_API_VERSION ?? "2026-01";

  if (!accessToken) {
    throw new Error("SHOPIFY_ADMIN_ACCESS_TOKEN is not configured.");
  }

  const query = `
    query MarginProducts($cursor: String) {
      products(first: 50, after: $cursor, query: "status:active") {
        edges {
          node {
            id
            title
            productType
            vendor
            variants(first: 100) {
              edges {
                node {
                  id
                  sku
                  title
                  price
                  inventoryItem {
                    harmonizedSystemCode
                    countryCodeOfOrigin
                    unitCost {
                      amount
                      currencyCode
                    }
                  }
                }
              }
            }
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  `;

  let cursor: string | null = null;
  let synced = 0;
  let pages = 0;

  do {
    const response = await fetch(
      `https://${shopDomain}/admin/api/${apiVersion}/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": accessToken,
        },
        body: JSON.stringify({ query, variables: { cursor } }),
      },
    );

    if (!response.ok) {
      throw new Error(`Shopify Admin API returned ${response.status}.`);
    }

    const payload = (await response.json()) as ShopifyProductsResponse;
    const errors = payload.errors?.map((error) => error.message).join("; ");

    if (errors) {
      throw new Error(errors);
    }

    const products = payload.data?.products;

    if (!products) {
      break;
    }

    for (const edge of products.edges) {
      const product = edge.node;

      for (const variantEdge of product.variants.edges) {
        const variant = variantEdge.node;
        const sku = variant.sku?.trim();

        if (!sku) {
          continue;
        }

        const variantLabel =
          variant.title && variant.title !== "Default Title"
            ? ` - ${variant.title}`
            : "";
        const name = `${product.title}${variantLabel}`;
        const category = inferCategory(sku, name, product.productType);
        const retailPriceUsd = toNumberOrNull(variant.price);
        const unitCostUsd = toNumberOrNull(variant.inventoryItem?.unitCost?.amount);

        await db
          .prepare(
            `INSERT INTO margin_products (
              id,
              sku,
              name,
              category,
              product_family,
              shopify_product_id,
              shopify_variant_id,
              hts_code,
              country_of_origin,
              retail_price_usd,
              vendor_cost_usd,
              source,
              updated_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'shopify', datetime('now'))
            ON CONFLICT(sku) DO UPDATE SET
              name = excluded.name,
              category = excluded.category,
              product_family = COALESCE(excluded.product_family, margin_products.product_family),
              shopify_product_id = excluded.shopify_product_id,
              shopify_variant_id = excluded.shopify_variant_id,
              hts_code = COALESCE(excluded.hts_code, margin_products.hts_code),
              country_of_origin = COALESCE(excluded.country_of_origin, margin_products.country_of_origin),
              retail_price_usd = COALESCE(excluded.retail_price_usd, margin_products.retail_price_usd),
              vendor_cost_usd = COALESCE(margin_products.vendor_cost_usd, excluded.vendor_cost_usd),
              source = 'shopify',
              active = 1,
              updated_at = datetime('now')`,
          )
          .bind(
            slugId(sku),
            sku,
            name,
            category,
            product.productType,
            product.id,
            variant.id,
            variant.inventoryItem?.harmonizedSystemCode ?? null,
            variant.inventoryItem?.countryCodeOfOrigin ?? null,
            retailPriceUsd,
            unitCostUsd,
          )
          .run();

        synced += 1;
      }
    }

    cursor = products.pageInfo.endCursor;
    pages += 1;
  } while (cursor && pages < 20);

  return { synced, pages };
}
