export type MarginCategory = "Anchor" | "Adhesive" | "Kit" | "Other";

export type MarginProduct = {
  id: string;
  sku: string;
  name: string;
  category: MarginCategory;
  productFamily: string | null;
  shopifyProductId: string | null;
  shopifyVariantId: string | null;
  htsCode: string | null;
  countryOfOrigin: string | null;
  packConfig: string | null;
  unitsPerPack: number;
  anchorsPerLayer: number | null;
  chinaCostCny: number | null;
  vendorCostUsd: number | null;
  shippingOverrideUsd: number | null;
  retailPriceUsd: number | null;
  active: boolean;
  source: string;
  updatedAt: string | null;
};

export type MarginFxRate = {
  id: string;
  effectiveDate: string;
  usdCny: number;
  notes: string | null;
};

export type MarginTariffRate = {
  id: string;
  effectiveDate: string;
  htsCode: string;
  rate: number;
  notes: string | null;
};

export type MarginShipment = {
  id: string;
  reference: string;
  arrivalDate: string;
  totalLandedCostUsd: number;
  totalLayers: number;
  notes: string | null;
};

export type MarginRow = MarginProduct & {
  baseCostUsd: number;
  tariffRate: number;
  tariffUsd: number;
  shippingUsd: number;
  cogsUsd: number;
  retailUsd: number;
  grossMarginUsd: number;
  grossMarginPct: number | null;
  missingInputs: string[];
};

export type MarginSummary = {
  skuCount: number;
  activeSkuCount: number;
  missingInputCount: number;
  averageGrossMarginPct: number | null;
  atRiskSkuCount: number;
  latestFxRate: MarginFxRate | null;
  latestShipment: MarginShipment | null;
  latestShippingPerLayerUsd: number;
};

export type MarginTrackerData = {
  connected: boolean;
  connectionMessage: string | null;
  products: MarginProduct[];
  rows: MarginRow[];
  shipments: MarginShipment[];
  fxRates: MarginFxRate[];
  tariffRates: MarginTariffRate[];
  summary: MarginSummary;
};

export type MarginActionState = {
  ok: boolean;
  message: string;
};
