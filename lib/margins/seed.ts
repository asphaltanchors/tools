import type {
  MarginFxRate,
  MarginProduct,
  MarginShipment,
  MarginTariffRate,
} from "./types";

export const seedFxRates: MarginFxRate[] = [
  { id: "fx-2025-01-01", effectiveDate: "2025-01-01", usdCny: 7.3, notes: "Spreadsheet seed" },
  { id: "fx-2025-06-01", effectiveDate: "2025-06-01", usdCny: 7.2, notes: "Spreadsheet seed" },
  { id: "fx-2026-01-01", effectiveDate: "2026-01-01", usdCny: 7.15, notes: "Spreadsheet seed" },
  { id: "fx-2026-05-01", effectiveDate: "2026-05-01", usdCny: 7.1, notes: "Spreadsheet seed" },
];

export const seedTariffRates: MarginTariffRate[] = [
  {
    id: "tariff-7316-2025-01-01",
    effectiveDate: "2025-01-01",
    htsCode: "7316.00",
    rate: 0.25,
    notes: "Section 301 sample",
  },
  {
    id: "tariff-7316-2026-05-01",
    effectiveDate: "2026-05-01",
    htsCode: "7316.00",
    rate: 0.3,
    notes: "Current planning rate",
  },
];

export const seedShipments: MarginShipment[] = [
  {
    id: "shipment-seed-2026-05",
    reference: "Seed shipment",
    arrivalDate: "2026-05-01",
    totalLandedCostUsd: 12000,
    totalLayers: 65,
    notes: "Spreadsheet seed: latest cost per layer",
  },
];

const product = (
  id: string,
  sku: string,
  name: string,
  category: MarginProduct["category"],
  productFamily: string | null,
  htsCode: string | null,
  packConfig: string | null,
  unitsPerPack: number,
): MarginProduct => ({
  id,
  sku,
  name,
  category,
  productFamily,
  shopifyProductId: null,
  shopifyVariantId: null,
  htsCode,
  countryOfOrigin: null,
  packConfig,
  unitsPerPack,
  anchorsPerLayer: null,
  chinaCostCny: null,
  vendorCostUsd: null,
  shippingOverrideUsd: null,
  retailPriceUsd: null,
  active: true,
  source: "spreadsheet",
  updatedAt: null,
});

export const seedProducts: MarginProduct[] = [
  product("sku-01-7625-k", "01-7625.K", "AM625 6 pack", "Anchor", "AM625", "7316.00", "6-pack", 6),
  product("sku-01-7625-l", "01-7625.L", "AM625 Metric 216 Pack", "Anchor", "AM625", "7316.00", "216-pack", 216),
  product("sku-01-6310-38k", "01-6310.38K", "SP10-38K", "Anchor", "SP10", "7316.00", "9 x 6-pack case", 54),
  product("sku-01-6310-72l", "01-6310.72L", "SP10-38L72", "Anchor", "SP10", "7316.00", "72-pack case", 72),
  product("sku-01-6310-3sk", "01-6310.3SK", "SP10-38K 304", "Anchor", "SP10", "7316.00", "304 SS case", 54),
  product("sku-01-6310-m1k", "01-6310.M1K", "SP10-M10", "Anchor", "SP10", "7316.00", "Metric case", 54),
  product("sku-01-6310-1sk", "01-6310.1SK", "SP10-M10 304", "Anchor", "SP10", "7316.00", "Metric 304 SS case", 54),
  product("sku-01-6315-38k", "01-6315.38K", "SP12-38K", "Anchor", "SP12", "7316.00", "9 x 6-pack case", 54),
  product("sku-01-6315-3sk", "01-6315.3SK", "SP12-38K 304", "Anchor", "SP12", "7316.00", "304 SS case", 54),
  product("sku-01-6315-3sk-2", "01-6315.3SK-2", "SP12-3SK-2", "Anchor", "SP12", "7316.00", "304 SS case", 54),
  product("sku-01-6315-m1k", "01-6315.M1K", "SP12-M10", "Anchor", "SP12", "7316.00", "Metric case", 54),
  product("sku-01-6315-1sk", "01-6315.1SK", "SP12-M10 304", "Anchor", "SP12", "7316.00", "Metric 304 SS case", 54),
  product("sku-01-6318-71k", "01-6318.71K", "SP18-71K", "Anchor", "SP18", "7316.00", "9 x 6-pack case", 54),
  product("sku-01-6318-7sk", "01-6318.7SK", "SP18-71K 304", "Anchor", "SP18", "7316.00", "304 SS case", 54),
  product("sku-01-6318-m2k", "01-6318.M2K", "SP18-M12", "Anchor", "SP18", "7316.00", "Metric case", 54),
  product("sku-01-6318-2sk", "01-6318.2SK", "SP18-M12 304", "Anchor", "SP18", "7316.00", "Metric 304 SS case", 54),
  product("sku-01-6358-58k", "01-6358.58K", "SP58-58K", "Anchor", "SP58", "7316.00", "6 x 6-pack case", 36),
  product("sku-01-6358-5sk", "01-6358.5SK", "SP58-58K 304", "Anchor", "SP58", "7316.00", "304 SS case", 36),
  product("sku-01-6358-5sk-2", "01-6358.5SK-2", "SP58-5SK-2 304", "Anchor", "SP58", "7316.00", "304 SS case", 36),
  product("sku-01-6358-m6k", "01-6358.M6K", "SP58-58K 316", "Anchor", "SP58", "7316.00", "316 SS case", 36),
  product("sku-01-6358-16k", "01-6358.16K", "SP58-M16", "Anchor", "SP58", "7316.00", "Metric case", 36),
  product("sku-01-6358-6sk", "01-6358.6SK", "SP58-M16 304", "Anchor", "SP58", "7316.00", "Metric 304 SS case", 36),
  product("sku-82-5002-k-ea", "82-5002.K-EA", "EPX2 6-12oz bag (each)", "Adhesive", "EPX2", null, "Each", 1),
  product("sku-82-5002-k", "82-5002.K", "EPX2 Case 6x6-12oz bags", "Adhesive", "EPX2", null, "6-pack MC", 6),
  product("sku-adh-epx2tub2p5-ea", "ADH-EPX2TUB2P5-EA", "EPX2 2.5lb Tub (each)", "Adhesive", "EPX2", null, "Each", 1),
  product("sku-adh-epx2tub2p5", "ADH-EPX2TUB2P5", "EPX2 2.5lb 6-Tub MC", "Adhesive", "EPX2", null, "6-tub MC", 6),
  product("sku-adh-epx2-tub10lb-ea", "ADH-EPX2-TUB10LB-EA", "EPX2 10lb Tub (each)", "Adhesive", "EPX2", null, "Each", 1),
  product("sku-adh-epx2-tub10lb", "ADH-EPX2-TUB10LB", "EPX2 10lb 4-Tub MC", "Adhesive", "EPX2", null, "4-tub MC", 4),
  product("sku-82-6002-ea", "82-6002-EA", "EPX3 Cartridge (each)", "Adhesive", "EPX3", null, "Each", 1),
  product("sku-82-6002", "82-6002", "EPX3 Case 12 Cartridges", "Adhesive", "EPX3", null, "12-pack MC", 12),
  product("sku-kit-sp10-epx2", "KIT-SP10-EPX2", "SP10 Anchor Kit (EPX2 bags)", "Kit", "SP10", null, "Kit", 1),
  product("sku-kit-sp10-epx3", "KIT-SP10-EPX3", "SP10 Anchor Kit (EPX3 tube)", "Kit", "SP10", null, "Kit", 1),
];
