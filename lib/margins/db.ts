import { getCloudflareContext } from "@opennextjs/cloudflare";

import { buildMarginTrackerData } from "./calculations";
import {
  seedFxRates,
  seedProducts,
  seedShipments,
  seedTariffRates,
} from "./seed";
import type {
  MarginCategory,
  MarginFxRate,
  MarginProduct,
  MarginShipment,
  MarginTariffRate,
  MarginTrackerData,
} from "./types";

type D1Result<T> = {
  results?: T[];
  success: boolean;
  error?: string;
};

type D1PreparedStatement = {
  bind: (...values: unknown[]) => D1PreparedStatement;
  all: <T = Record<string, unknown>>() => Promise<D1Result<T>>;
  run: () => Promise<D1Result<unknown>>;
};

export type D1DatabaseLike = {
  prepare: (query: string) => D1PreparedStatement;
};

type MarginEnv = {
  MARGIN_DB?: D1DatabaseLike;
};

type ProductRow = {
  id: string;
  sku: string;
  name: string;
  category: string;
  product_family: string | null;
  shopify_product_id: string | null;
  shopify_variant_id: string | null;
  hts_code: string | null;
  country_of_origin: string | null;
  pack_config: string | null;
  units_per_pack: number | null;
  anchors_per_layer: number | null;
  china_cost_cny: number | null;
  vendor_cost_usd: number | null;
  shipping_override_usd: number | null;
  retail_price_usd: number | null;
  active: number | null;
  source: string | null;
  updated_at: string | null;
};

type ShipmentRow = {
  id: string;
  reference: string;
  arrival_date: string;
  total_landed_cost_usd: number;
  total_layers: number;
  notes: string | null;
};

type FxRateRow = {
  id: string;
  effective_date: string;
  usd_cny: number;
  notes: string | null;
};

type TariffRateRow = {
  id: string;
  effective_date: string;
  hts_code: string;
  rate: number;
  notes: string | null;
};

const categoryFromDb = (value: string): MarginCategory => {
  if (value === "Anchor" || value === "Adhesive" || value === "Kit") {
    return value;
  }

  return "Other";
};

const numberOrNull = (value: number | null | undefined) =>
  value === null || value === undefined || Number.isNaN(Number(value))
    ? null
    : Number(value);

const mapProduct = (row: ProductRow): MarginProduct => ({
  id: row.id,
  sku: row.sku,
  name: row.name,
  category: categoryFromDb(row.category),
  productFamily: row.product_family,
  shopifyProductId: row.shopify_product_id,
  shopifyVariantId: row.shopify_variant_id,
  htsCode: row.hts_code,
  countryOfOrigin: row.country_of_origin,
  packConfig: row.pack_config,
  unitsPerPack: Number(row.units_per_pack ?? 1),
  anchorsPerLayer: numberOrNull(row.anchors_per_layer),
  chinaCostCny: numberOrNull(row.china_cost_cny),
  vendorCostUsd: numberOrNull(row.vendor_cost_usd),
  shippingOverrideUsd: numberOrNull(row.shipping_override_usd),
  retailPriceUsd: numberOrNull(row.retail_price_usd),
  active: row.active !== 0,
  source: row.source ?? "manual",
  updatedAt: row.updated_at,
});

const mapShipment = (row: ShipmentRow): MarginShipment => ({
  id: row.id,
  reference: row.reference,
  arrivalDate: row.arrival_date,
  totalLandedCostUsd: Number(row.total_landed_cost_usd),
  totalLayers: Number(row.total_layers),
  notes: row.notes,
});

const mapFxRate = (row: FxRateRow): MarginFxRate => ({
  id: row.id,
  effectiveDate: row.effective_date,
  usdCny: Number(row.usd_cny),
  notes: row.notes,
});

const mapTariffRate = (row: TariffRateRow): MarginTariffRate => ({
  id: row.id,
  effectiveDate: row.effective_date,
  htsCode: row.hts_code,
  rate: Number(row.rate),
  notes: row.notes,
});

export async function getMarginDatabase(): Promise<D1DatabaseLike | null> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    return (env as MarginEnv).MARGIN_DB ?? null;
  } catch {
    return null;
  }
}

export async function getMarginTrackerData(): Promise<MarginTrackerData> {
  const db = await getMarginDatabase();

  if (!db) {
    return buildMarginTrackerData({
      connected: false,
      connectionMessage: "D1 binding MARGIN_DB is not available in this runtime.",
      products: seedProducts,
      shipments: seedShipments,
      fxRates: seedFxRates,
      tariffRates: seedTariffRates,
    });
  }

  try {
    const [productResult, shipmentResult, fxResult, tariffResult] =
      await Promise.all([
        db.prepare(
          `SELECT * FROM margin_products ORDER BY category, sku`,
        ).all<ProductRow>(),
        db.prepare(
          `SELECT * FROM margin_shipments ORDER BY arrival_date DESC, created_at DESC LIMIT 20`,
        ).all<ShipmentRow>(),
        db.prepare(
          `SELECT * FROM margin_fx_rates ORDER BY effective_date DESC LIMIT 20`,
        ).all<FxRateRow>(),
        db.prepare(
          `SELECT * FROM margin_tariff_rates ORDER BY hts_code, effective_date DESC`,
        ).all<TariffRateRow>(),
      ]);

    return buildMarginTrackerData({
      connected: true,
      products: (productResult.results ?? []).map(mapProduct),
      shipments: (shipmentResult.results ?? []).map(mapShipment),
      fxRates: (fxResult.results ?? []).map(mapFxRate),
      tariffRates: (tariffResult.results ?? []).map(mapTariffRate),
    });
  } catch (error) {
    return buildMarginTrackerData({
      connected: false,
      connectionMessage:
        error instanceof Error
          ? `D1 query failed: ${error.message}`
          : "D1 query failed.",
      products: seedProducts,
      shipments: seedShipments,
      fxRates: seedFxRates,
      tariffRates: seedTariffRates,
    });
  }
}

export async function insertShipment(input: {
  reference: string;
  arrivalDate: string;
  totalLandedCostUsd: number;
  totalLayers: number;
  notes: string | null;
}) {
  const db = await getMarginDatabase();

  if (!db) {
    throw new Error("D1 binding MARGIN_DB is not available.");
  }

  await db
    .prepare(
      `INSERT INTO margin_shipments
        (id, reference, arrival_date, total_landed_cost_usd, total_layers, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      crypto.randomUUID(),
      input.reference,
      input.arrivalDate,
      input.totalLandedCostUsd,
      input.totalLayers,
      input.notes,
    )
    .run();
}

export async function updateProductEconomics(input: {
  sku: string;
  chinaCostCny: number | null;
  vendorCostUsd: number | null;
  anchorsPerLayer: number | null;
  shippingOverrideUsd: number | null;
  retailPriceUsd: number | null;
}) {
  const db = await getMarginDatabase();

  if (!db) {
    throw new Error("D1 binding MARGIN_DB is not available.");
  }

  await db
    .prepare(
      `UPDATE margin_products
       SET china_cost_cny = ?,
           vendor_cost_usd = ?,
           anchors_per_layer = ?,
           shipping_override_usd = ?,
           retail_price_usd = ?,
           updated_at = datetime('now')
       WHERE sku = ?`,
    )
    .bind(
      input.chinaCostCny,
      input.vendorCostUsd,
      input.anchorsPerLayer,
      input.shippingOverrideUsd,
      input.retailPriceUsd,
      input.sku,
    )
    .run();
}

export async function insertFxRate(input: {
  effectiveDate: string;
  usdCny: number;
  notes: string | null;
}) {
  const db = await getMarginDatabase();

  if (!db) {
    throw new Error("D1 binding MARGIN_DB is not available.");
  }

  await db
    .prepare(
      `INSERT INTO margin_fx_rates (id, effective_date, usd_cny, notes)
       VALUES (?, ?, ?, ?)`,
    )
    .bind(crypto.randomUUID(), input.effectiveDate, input.usdCny, input.notes)
    .run();
}

export async function insertTariffRate(input: {
  effectiveDate: string;
  htsCode: string;
  rate: number;
  notes: string | null;
}) {
  const db = await getMarginDatabase();

  if (!db) {
    throw new Error("D1 binding MARGIN_DB is not available.");
  }

  await db
    .prepare(
      `INSERT INTO margin_tariff_rates (id, effective_date, hts_code, rate, notes)
       VALUES (?, ?, ?, ?, ?)`,
    )
    .bind(
      crypto.randomUUID(),
      input.effectiveDate,
      input.htsCode,
      input.rate,
      input.notes,
    )
    .run();
}
