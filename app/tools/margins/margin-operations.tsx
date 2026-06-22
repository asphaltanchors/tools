"use client";

import { useActionState, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { RefreshCw, Save, Ship, Tags } from "lucide-react";

import {
  addFxRateAction,
  addTariffRateAction,
  createShipmentAction,
  syncShopifyProductsAction,
  updateProductEconomicsAction,
} from "./actions";
import type { MarginActionState, MarginProduct } from "@/lib/margins/types";

const emptyState: MarginActionState = { ok: false, message: "" };

function SubmitButton({
  children,
  icon,
}: {
  children: string;
  icon: React.ReactNode;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-10 items-center justify-center gap-2 rounded border-2 border-gray-900 bg-black px-4 text-xs font-mono font-bold uppercase tracking-wider text-white transition-colors hover:bg-gray-900 disabled:cursor-not-allowed disabled:bg-gray-500"
    >
      {icon}
      {pending ? "Saving..." : children}
    </button>
  );
}

function StateMessage({ state }: { state: MarginActionState }) {
  if (!state.message) {
    return null;
  }

  return (
    <p
      aria-live="polite"
      className={`text-xs font-mono ${
        state.ok ? "text-green-700" : "text-red-700"
      }`}
    >
      {state.message}
    </p>
  );
}

const fieldClass =
  "h-10 w-full rounded border-2 border-gray-900 bg-white px-3 font-mono text-sm text-black focus:outline-none focus:ring-2 focus:ring-gray-900";

const labelClass =
  "text-[11px] font-mono font-bold uppercase tracking-wider text-gray-600";

export function MarginOperations({
  products,
  connected,
}: {
  products: MarginProduct[];
  connected: boolean;
}) {
  const [shipmentState, shipmentAction] = useActionState(
    createShipmentAction,
    emptyState,
  );
  const [productState, productAction] = useActionState(
    updateProductEconomicsAction,
    emptyState,
  );
  const [fxState, fxAction] = useActionState(addFxRateAction, emptyState);
  const [tariffState, tariffAction] = useActionState(
    addTariffRateAction,
    emptyState,
  );
  const [syncState, syncAction] = useActionState(
    syncShopifyProductsAction,
    emptyState,
  );
  const [selectedSku, setSelectedSku] = useState(products[0]?.sku ?? "");

  const selectedProduct = useMemo(
    () => products.find((product) => product.sku === selectedSku) ?? products[0],
    [products, selectedSku],
  );

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <section className="overflow-hidden rounded-lg border-2 border-gray-900 bg-white shadow-sm">
        <div className="border-b-2 border-gray-900 bg-gray-50 px-4 py-3">
          <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-black">
            Input: Shipment
          </h2>
        </div>
        <form action={shipmentAction} className="grid gap-4 p-4 md:grid-cols-2">
          <label className="space-y-2">
            <span className={labelClass}>Reference</span>
            <input
              name="reference"
              required
              className={fieldClass}
              placeholder="PO / container"
            />
          </label>
          <label className="space-y-2">
            <span className={labelClass}>Arrival date</span>
            <input name="arrivalDate" type="date" required className={fieldClass} />
          </label>
          <label className="space-y-2">
            <span className={labelClass}>Total landed cost</span>
            <input
              name="totalLandedCostUsd"
              type="number"
              min="0"
              step="0.01"
              required
              className={fieldClass}
            />
          </label>
          <label className="space-y-2">
            <span className={labelClass}>Total pallet layers</span>
            <input
              name="totalLayers"
              type="number"
              min="0"
              step="0.01"
              required
              className={fieldClass}
            />
          </label>
          <label className="space-y-2 md:col-span-2">
            <span className={labelClass}>Notes</span>
            <input name="notes" className={fieldClass} placeholder="Optional" />
          </label>
          <div className="flex items-center justify-between gap-3 md:col-span-2">
            <StateMessage state={shipmentState} />
            <SubmitButton icon={<Ship className="h-4 w-4" />}>
              Add shipment
            </SubmitButton>
          </div>
        </form>
      </section>

      <section className="overflow-hidden rounded-lg border-2 border-gray-900 bg-white shadow-sm">
        <div className="border-b-2 border-gray-900 bg-gray-50 px-4 py-3">
          <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-black">
            Input: SKU Economics
          </h2>
        </div>
        <form
          action={productAction}
          className="grid gap-4 p-4 sm:grid-cols-2"
          key={selectedProduct?.sku ?? "empty"}
        >
          <label className="space-y-2 sm:col-span-2">
            <span className={labelClass}>SKU</span>
            <select
              name="sku"
              value={selectedSku}
              onChange={(event) => setSelectedSku(event.target.value)}
              className={fieldClass}
            >
              {products.map((product) => (
                <option key={product.sku} value={product.sku}>
                  {product.sku} - {product.name}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2">
            <span className={labelClass}>China cost CNY</span>
            <input
              name="chinaCostCny"
              type="number"
              min="0"
              step="0.01"
              defaultValue={selectedProduct?.chinaCostCny ?? ""}
              className={fieldClass}
            />
          </label>
          <label className="space-y-2">
            <span className={labelClass}>Vendor cost USD</span>
            <input
              name="vendorCostUsd"
              type="number"
              min="0"
              step="0.01"
              defaultValue={selectedProduct?.vendorCostUsd ?? ""}
              className={fieldClass}
            />
          </label>
          <label className="space-y-2">
            <span className={labelClass}>Anchors/layer</span>
            <input
              name="anchorsPerLayer"
              type="number"
              min="0"
              step="0.01"
              defaultValue={selectedProduct?.anchorsPerLayer ?? ""}
              className={fieldClass}
            />
          </label>
          <label className="space-y-2">
            <span className={labelClass}>Retail USD</span>
            <input
              name="retailPriceUsd"
              type="number"
              min="0"
              step="0.01"
              defaultValue={selectedProduct?.retailPriceUsd ?? ""}
              className={fieldClass}
            />
          </label>
          <label className="space-y-2 sm:col-span-2">
            <span className={labelClass}>Shipping override USD</span>
            <input
              name="shippingOverrideUsd"
              type="number"
              min="0"
              step="0.01"
              defaultValue={selectedProduct?.shippingOverrideUsd ?? ""}
              className={fieldClass}
            />
          </label>
          <div className="flex items-center justify-between gap-3 sm:col-span-2">
            <StateMessage state={productState} />
            <SubmitButton icon={<Save className="h-4 w-4" />}>
              Save SKU
            </SubmitButton>
          </div>
        </form>
      </section>

      <section className="overflow-hidden rounded-lg border-2 border-gray-900 bg-white shadow-sm xl:col-span-2">
        <div className="border-b-2 border-gray-900 bg-gray-50 px-4 py-3">
          <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-black">
            Inputs: Rates and Shopify
          </h2>
        </div>
        <div className="grid gap-4 p-4 lg:grid-cols-3">
          <form action={fxAction} className="grid gap-3">
            <label className="space-y-2">
              <span className={labelClass}>FX effective date</span>
              <input name="effectiveDate" type="date" className={fieldClass} />
            </label>
            <label className="space-y-2">
              <span className={labelClass}>USD/CNY</span>
              <input name="usdCny" type="number" min="0" step="0.0001" className={fieldClass} />
            </label>
            <input name="notes" className={fieldClass} placeholder="Notes" />
            <StateMessage state={fxState} />
            <SubmitButton icon={<Save className="h-4 w-4" />}>Add FX</SubmitButton>
          </form>

          <form action={tariffAction} className="grid gap-3">
            <label className="space-y-2">
              <span className={labelClass}>Tariff effective date</span>
              <input name="effectiveDate" type="date" className={fieldClass} />
            </label>
            <label className="space-y-2">
              <span className={labelClass}>HTS code</span>
              <input name="htsCode" className={fieldClass} placeholder="7316.00" />
            </label>
            <label className="space-y-2">
              <span className={labelClass}>Rate %</span>
              <input name="ratePercent" type="number" min="0" step="0.01" className={fieldClass} />
            </label>
            <StateMessage state={tariffState} />
            <SubmitButton icon={<Tags className="h-4 w-4" />}>
              Add tariff
            </SubmitButton>
          </form>

          <form action={syncAction} className="flex flex-col justify-between gap-4 rounded border border-gray-300 bg-gray-50 p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className={labelClass}>Shopify Admin</span>
                <span
                  className={`rounded px-2 py-1 text-[10px] font-mono font-bold uppercase ${
                    connected
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {connected ? "D1 ready" : "D1 offline"}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono text-gray-600">
                <span>SKU</span>
                <span>Retail</span>
                <span>HTS</span>
                <span>Origin</span>
              </div>
              <StateMessage state={syncState} />
            </div>
            <SubmitButton icon={<RefreshCw className="h-4 w-4" />}>
              Sync Shopify
            </SubmitButton>
          </form>
        </div>
      </section>
    </div>
  );
}
