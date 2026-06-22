"use server";

import { revalidatePath } from "next/cache";

import {
  getMarginDatabase,
  insertFxRate,
  insertShipment,
  insertTariffRate,
  updateProductEconomics,
} from "@/lib/margins/db";
import { syncProductsFromShopify } from "@/lib/margins/shopify";
import type { MarginActionState } from "@/lib/margins/types";

const marginPath = "/tools/margins";

const initialError = (message: string): MarginActionState => ({
  ok: false,
  message,
});

const success = (message: string): MarginActionState => ({
  ok: true,
  message,
});

const formString = (formData: FormData, key: string) => {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
};

const optionalString = (formData: FormData, key: string) => {
  const value = formString(formData, key);
  return value.length > 0 ? value : null;
};

const requiredNumber = (formData: FormData, key: string) => {
  const value = Number(formString(formData, key));

  if (!Number.isFinite(value)) {
    throw new Error(`${key} must be a number.`);
  }

  return value;
};

const optionalNumber = (formData: FormData, key: string) => {
  const raw = formString(formData, key);

  if (!raw) {
    return null;
  }

  const value = Number(raw);

  if (!Number.isFinite(value)) {
    throw new Error(`${key} must be a number.`);
  }

  return value;
};

export async function createShipmentAction(
  _state: MarginActionState,
  formData: FormData,
): Promise<MarginActionState> {
  try {
    const reference = formString(formData, "reference");
    const arrivalDate = formString(formData, "arrivalDate");
    const totalLandedCostUsd = requiredNumber(formData, "totalLandedCostUsd");
    const totalLayers = requiredNumber(formData, "totalLayers");

    if (!reference || !arrivalDate) {
      return initialError("Shipment reference and arrival date are required.");
    }

    if (totalLandedCostUsd <= 0 || totalLayers <= 0) {
      return initialError("Shipment cost and layers must be greater than zero.");
    }

    await insertShipment({
      reference,
      arrivalDate,
      totalLandedCostUsd,
      totalLayers,
      notes: optionalString(formData, "notes"),
    });

    revalidatePath(marginPath);
    return success("Shipment saved.");
  } catch (error) {
    return initialError(error instanceof Error ? error.message : "Shipment save failed.");
  }
}

export async function updateProductEconomicsAction(
  _state: MarginActionState,
  formData: FormData,
): Promise<MarginActionState> {
  try {
    const sku = formString(formData, "sku");

    if (!sku) {
      return initialError("Choose a SKU to update.");
    }

    await updateProductEconomics({
      sku,
      chinaCostCny: optionalNumber(formData, "chinaCostCny"),
      vendorCostUsd: optionalNumber(formData, "vendorCostUsd"),
      anchorsPerLayer: optionalNumber(formData, "anchorsPerLayer"),
      shippingOverrideUsd: optionalNumber(formData, "shippingOverrideUsd"),
      retailPriceUsd: optionalNumber(formData, "retailPriceUsd"),
    });

    revalidatePath(marginPath);
    return success(`${sku} updated.`);
  } catch (error) {
    return initialError(error instanceof Error ? error.message : "SKU update failed.");
  }
}

export async function addFxRateAction(
  _state: MarginActionState,
  formData: FormData,
): Promise<MarginActionState> {
  try {
    const effectiveDate = formString(formData, "effectiveDate");
    const usdCny = requiredNumber(formData, "usdCny");

    if (!effectiveDate || usdCny <= 0) {
      return initialError("FX date and positive rate are required.");
    }

    await insertFxRate({
      effectiveDate,
      usdCny,
      notes: optionalString(formData, "notes"),
    });

    revalidatePath(marginPath);
    return success("FX rate saved.");
  } catch (error) {
    return initialError(error instanceof Error ? error.message : "FX save failed.");
  }
}

export async function addTariffRateAction(
  _state: MarginActionState,
  formData: FormData,
): Promise<MarginActionState> {
  try {
    const effectiveDate = formString(formData, "effectiveDate");
    const htsCode = formString(formData, "htsCode");
    const ratePercent = requiredNumber(formData, "ratePercent");

    if (!effectiveDate || !htsCode || ratePercent < 0) {
      return initialError("Tariff date, HTS code, and rate are required.");
    }

    await insertTariffRate({
      effectiveDate,
      htsCode,
      rate: ratePercent / 100,
      notes: optionalString(formData, "notes"),
    });

    revalidatePath(marginPath);
    return success("Tariff rate saved.");
  } catch (error) {
    return initialError(error instanceof Error ? error.message : "Tariff save failed.");
  }
}

export async function syncShopifyProductsAction(
  _state: MarginActionState,
): Promise<MarginActionState> {
  void _state;

  try {
    const db = await getMarginDatabase();

    if (!db) {
      return initialError("D1 binding MARGIN_DB is not available.");
    }

    const result = await syncProductsFromShopify(db);
    revalidatePath(marginPath);
    return success(`Shopify sync complete: ${result.synced} variants.`);
  } catch (error) {
    return initialError(error instanceof Error ? error.message : "Shopify sync failed.");
  }
}
