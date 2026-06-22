import type {
  MarginFxRate,
  MarginProduct,
  MarginRow,
  MarginShipment,
  MarginSummary,
  MarginTariffRate,
  MarginTrackerData,
} from "./types";

const newestFirst = <T extends { effectiveDate: string }>(items: T[]) =>
  [...items].sort((a, b) => b.effectiveDate.localeCompare(a.effectiveDate));

const newestShipmentFirst = (items: MarginShipment[]) =>
  [...items].sort((a, b) => b.arrivalDate.localeCompare(a.arrivalDate));

const roundCurrency = (value: number) => Math.round(value * 100) / 100;

export function formatCurrency(value: number | null | undefined) {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "-";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPercent(value: number | null | undefined) {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "-";
  }

  return new Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value);
}

export function buildMarginTrackerData(input: {
  connected: boolean;
  connectionMessage?: string | null;
  products: MarginProduct[];
  shipments: MarginShipment[];
  fxRates: MarginFxRate[];
  tariffRates: MarginTariffRate[];
}): MarginTrackerData {
  const latestFxRate = newestFirst(input.fxRates)[0] ?? null;
  const latestShipment = newestShipmentFirst(input.shipments).find(
    (shipment) => shipment.totalLayers > 0,
  ) ?? null;
  const latestShippingPerLayerUsd = latestShipment
    ? latestShipment.totalLandedCostUsd / latestShipment.totalLayers
    : 0;

  const tariffByHts = new Map<string, MarginTariffRate>();
  for (const tariff of newestFirst(input.tariffRates)) {
    if (!tariffByHts.has(tariff.htsCode)) {
      tariffByHts.set(tariff.htsCode, tariff);
    }
  }

  const fxRate = latestFxRate?.usdCny && latestFxRate.usdCny > 0
    ? latestFxRate.usdCny
    : 1;

  const rows: MarginRow[] = input.products
    .filter((product) => product.active)
    .map((product) => {
      const missingInputs: string[] = [];
      const hasChinaCost = product.chinaCostCny !== null && product.chinaCostCny > 0;
      const hasVendorCost = product.vendorCostUsd !== null && product.vendorCostUsd > 0;
      const baseCostUsd = hasChinaCost
        ? product.chinaCostCny! / fxRate
        : hasVendorCost
          ? product.vendorCostUsd!
          : 0;

      if (!hasChinaCost && !hasVendorCost && product.category !== "Kit") {
        missingInputs.push("cost");
      }

      const tariffRate = product.htsCode
        ? tariffByHts.get(product.htsCode)?.rate ?? 0
        : 0;
      const tariffUsd = baseCostUsd * tariffRate;

      let shippingUsd = product.shippingOverrideUsd ?? 0;
      if (shippingUsd === 0 && product.category === "Anchor") {
        if (product.anchorsPerLayer && product.anchorsPerLayer > 0) {
          shippingUsd = latestShippingPerLayerUsd / product.anchorsPerLayer;
        } else {
          missingInputs.push("anchors/layer");
        }
      }

      const retailUsd = product.retailPriceUsd ?? 0;
      if (retailUsd <= 0) {
        missingInputs.push("retail");
      }

      const cogsUsd = baseCostUsd + tariffUsd + shippingUsd;
      const grossMarginUsd = retailUsd - cogsUsd;
      const grossMarginPct = retailUsd > 0 ? grossMarginUsd / retailUsd : null;

      return {
        ...product,
        baseCostUsd: roundCurrency(baseCostUsd),
        tariffRate,
        tariffUsd: roundCurrency(tariffUsd),
        shippingUsd: roundCurrency(shippingUsd),
        cogsUsd: roundCurrency(cogsUsd),
        retailUsd: roundCurrency(retailUsd),
        grossMarginUsd: roundCurrency(grossMarginUsd),
        grossMarginPct,
        missingInputs,
      };
    });

  const rowsWithMargin = rows.filter((row) => row.grossMarginPct !== null);
  const averageGrossMarginPct = rowsWithMargin.length
    ? rowsWithMargin.reduce((sum, row) => sum + (row.grossMarginPct ?? 0), 0) /
      rowsWithMargin.length
    : null;

  const summary: MarginSummary = {
    skuCount: input.products.length,
    activeSkuCount: rows.length,
    missingInputCount: rows.filter((row) => row.missingInputs.length > 0).length,
    averageGrossMarginPct,
    atRiskSkuCount: rows.filter(
      (row) => row.grossMarginPct !== null && row.grossMarginPct < 0.35,
    ).length,
    latestFxRate,
    latestShipment,
    latestShippingPerLayerUsd,
  };

  return {
    connected: input.connected,
    connectionMessage: input.connectionMessage ?? null,
    products: input.products,
    rows,
    shipments: newestShipmentFirst(input.shipments),
    fxRates: newestFirst(input.fxRates),
    tariffRates: newestFirst(input.tariffRates),
    summary,
  };
}
