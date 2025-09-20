"use client";

import { useMemo, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DEFAULT_PRODUCT_ID,
  PRODUCTS,
  Product,
} from "@/lib/products";
import {
  DEFAULT_PALLET_ID,
  PALLET_SPECS,
  PalletSpec,
} from "@/lib/pallets";
import {
  calculatePalletBreakdown,
  getProductCapacity,
} from "@/lib/pallet";

type LineItem = {
  id: string;
  productId: string;
  quantity: number;
};

const createLineItem = (index: number): LineItem => ({
  id: `line-${index}`,
  productId: DEFAULT_PRODUCT_ID,
  quantity: 0,
});

export default function Home() {
  const [lineItems, setLineItems] = useState<LineItem[]>([createLineItem(0)]);
  const [lineCounter, setLineCounter] = useState(1);
  const [attempted, setAttempted] = useState(false);
  const [selectedPalletId, setSelectedPalletId] = useState(DEFAULT_PALLET_ID);
  const [mixingMode, setMixingMode] = useState<"single" | "mixed">("single");
  const [calculation, setCalculation] = useState<
    ReturnType<typeof calculatePalletBreakdown> | null
  >(null);

  const productsById = useMemo(() => {
    const map = new Map<string, Product>();
    PRODUCTS.forEach((product) => {
      map.set(product.id, product);
    });
    return map;
  }, []);

  const palletsById = useMemo(() => {
    const map = new Map<string, PalletSpec>();
    PALLET_SPECS.forEach((pallet) => {
      map.set(pallet.id, pallet);
    });
    return map;
  }, []);

  const palletSpec = palletsById.get(selectedPalletId) ?? PALLET_SPECS[0];
  const allowMixing = mixingMode === "mixed";

  const canCalculate =
    Boolean(palletSpec) && lineItems.some((item) => item.quantity > 0);

  const updateLineItem = (id: string, data: Partial<Omit<LineItem, "id">>) => {
    setLineItems((items) =>
      items.map((item) => (item.id === id ? { ...item, ...data } : item)),
    );
  };

  const removeLineItem = (id: string) => {
    setLineItems((items) => {
      if (items.length === 1) {
        return items;
      }
      return items.filter((item) => item.id !== id);
    });
  };

  const handleAddLine = () => {
    setLineItems((items) => [...items, createLineItem(lineCounter)]);
    setLineCounter((current) => current + 1);
  };

  const handleCalculate = () => {
    setAttempted(true);

    if (!palletSpec) {
      setCalculation(null);
      return;
    }

    const selection = lineItems
      .map((item) => {
        const product = productsById.get(item.productId);
        if (!product) {
          return null;
        }
        return {
          product,
          quantityCases: item.quantity,
        };
      })
      .filter((entry): entry is { product: Product; quantityCases: number } =>
        entry !== null && entry.quantityCases > 0,
      );

    if (!selection.length) {
      setCalculation(null);
      return;
    }

    setCalculation(
      calculatePalletBreakdown(selection, palletSpec, {
        allowMixing,
      }),
    );
  };

  return (
    <main className="min-h-screen bg-slate-100 py-8">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4">
        <header className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold font-mono text-slate-900 tracking-tight">
                PALLET//CALC
              </h1>
              <p className="text-sm text-slate-600 font-mono mt-1">
                Technical shipment calculator
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs font-mono text-slate-500 uppercase tracking-wider">
                Pallet Type
              </p>
              <Select
                value={selectedPalletId}
                onValueChange={(value) => {
                  setSelectedPalletId(value);
                }}
              >
                <SelectTrigger className="w-32 h-8 text-xs font-mono bg-slate-100 border-slate-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PALLET_SPECS.map((spec) => (
                    <SelectItem key={spec.id} value={spec.id} className="font-mono text-xs">
                      {spec.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <fieldset className="flex items-center gap-6 text-xs">
            <legend className="font-mono text-slate-600 uppercase tracking-wide mr-2">Mode:</legend>
            <label className="inline-flex items-center gap-1.5 font-mono text-slate-700">
              <input
                type="radio"
                name="pallet-mixing-mode"
                value="single"
                checked={mixingMode === "single"}
                onChange={() => setMixingMode("single")}
                className="h-3 w-3 border-slate-400 text-slate-800"
              />
              Single-SKU
            </label>
            <label className="inline-flex items-center gap-1.5 font-mono text-slate-700">
              <input
                type="radio"
                name="pallet-mixing-mode"
                value="mixed"
                checked={mixingMode === "mixed"}
                onChange={() => setMixingMode("mixed")}
                className="h-3 w-3 border-slate-400 text-slate-800"
              />
              Mixed-SKU
            </label>
          </fieldset>
        </header>


        <section className="rounded-lg border-2 border-slate-300 bg-white">
          <div className="border-b-2 border-slate-200 px-4 py-3 bg-slate-50">
            <h2 className="text-sm font-mono font-bold text-slate-900 uppercase tracking-wider">
              INPUT: Product Quantities [Cases]
            </h2>
          </div>

          <div className="flex flex-col gap-3 px-4 py-4">
            {lineItems.map((item) => {
              const product = productsById.get(item.productId) ?? PRODUCTS[0];
              const capacity = palletSpec
                ? getProductCapacity(product, palletSpec)
                : null;
              const casesPerLayer = capacity?.casesPerLayer ?? 0;
              const maxLayers = capacity?.maxLayers ?? 0;
              const casesPerPallet = capacity?.casesPerPallet ?? 0;
              const fullHeight = capacity?.fullPalletHeightIn ?? 0;

              return (
                <div
                  key={item.id}
                  className="flex flex-col gap-3 rounded border border-slate-300 bg-slate-50 p-3 md:flex-row md:items-start"
                >
                  <div className="flex flex-1 flex-col gap-2">
                    <span
                      id={`${item.id}-product-label`}
                      className="text-xs font-mono font-semibold text-slate-700 uppercase"
                    >
                      SKU
                    </span>
                    <Select
                      value={item.productId}
                      onValueChange={(value) =>
                        updateLineItem(item.id, {
                          productId: value,
                        })
                      }
                    >
                      <SelectTrigger
                        aria-labelledby={`${item.id}-product-label`}
                        className="w-full"
                      >
                        <SelectValue placeholder="Choose a product" />
                      </SelectTrigger>
                      <SelectContent>
                        {PRODUCTS.map((productOption) => (
                          <SelectItem
                            key={productOption.id}
                            value={productOption.id}
                          >
                            {productOption.name} ({productOption.sku})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <dl className="grid grid-cols-4 gap-2 text-xs font-mono">
                      <div>
                        <dt className="font-semibold text-slate-700">Cases/layer</dt>
                        <dd className="text-slate-900 font-bold">{casesPerLayer || "—"}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-slate-700">Layers/pallet</dt>
                        <dd className="text-slate-900 font-bold">{maxLayers || "—"}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-slate-700">Cases/pallet</dt>
                        <dd className="text-slate-900 font-bold">{casesPerPallet || "—"}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-slate-700">Height</dt>
                        <dd className="text-slate-900 font-bold">
                          {fullHeight ? `${Math.round(fullHeight)}"` : "—"}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-mono font-semibold text-slate-700 uppercase">
                      QTY
                    </label>
                    <input
                      type="number"
                      min={0}
                      step={1}
                      inputMode="numeric"
                      className="w-24 h-10 rounded border-2 border-slate-400 bg-white px-2 text-lg font-mono font-bold text-slate-900 text-center focus:border-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-800"
                      value={item.quantity}
                      onChange={(event) => {
                        const nextValue = Number(event.target.value);
                        updateLineItem(item.id, {
                          quantity: Number.isFinite(nextValue) && nextValue >= 0
                            ? Math.floor(nextValue)
                            : 0,
                        });
                      }}
                    />
                    <button
                      type="button"
                      className="text-xs font-mono font-medium text-red-700 hover:text-red-800 uppercase"
                      onClick={() => removeLineItem(item.id)}
                    >
                      DEL
                    </button>
                  </div>
                </div>
              );
            })}

            <div className="flex items-center justify-between pt-2 border-t border-slate-200">
              <button
                type="button"
                className="text-xs font-mono font-bold text-slate-600 hover:text-slate-800 uppercase tracking-wide"
                onClick={handleAddLine}
              >
                [+] ADD SKU
              </button>
              <button
                type="button"
                className="rounded bg-slate-800 px-6 py-2 text-sm font-mono font-bold text-white hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-600 disabled:cursor-not-allowed disabled:bg-slate-400 uppercase tracking-wide"
                onClick={handleCalculate}
                disabled={!canCalculate}
              >
                {'>> CALCULATE'}
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-lg border-2 border-slate-400 bg-white">
          <div className="border-b-2 border-slate-300 px-4 py-3 bg-slate-100">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-mono font-bold text-slate-900 uppercase tracking-wider">
                OUTPUT: Calculation Results
              </h2>
              <div className="text-xs font-mono text-slate-700">
                PALLET: <span className="font-bold">{palletSpec?.name ?? "—"}</span>
              </div>
            </div>
            {palletSpec && (
              <dl className="grid grid-cols-4 gap-3 mt-2 text-xs font-mono text-slate-600">
                <div>
                  <dt className="font-bold">FOOTPRINT</dt>
                  <dd className="font-mono">{Math.round(palletSpec.footprintIn.length)} × {Math.round(palletSpec.footprintIn.width)}&quot;</dd>
                </div>
                <div>
                  <dt className="font-bold">MAX_H</dt>
                  <dd className="font-mono">{Math.round(palletSpec.maxLoadHeightIn)}&quot;</dd>
                </div>
                <div>
                  <dt className="font-bold">BASE_H</dt>
                  <dd className="font-mono">{Math.round(palletSpec.baseHeightIn)}&quot;</dd>
                </div>
                <div>
                  <dt className="font-bold">TARE</dt>
                  <dd className="font-mono">{Math.round(palletSpec.tareWeightLb)} lb</dd>
                </div>
              </dl>
            )}
          </div>

          <div className="px-4 py-4">
            {!attempted && (
              <p className="text-sm font-mono text-slate-600 text-center py-4">
                [NO DATA] - Enter quantities and execute calculation
              </p>
            )}

            {attempted && !calculation && (
              <p className="text-sm font-mono text-amber-700 text-center py-4">
                [ERROR] - At least one product quantity required
              </p>
            )}

            {calculation && calculation.summary.totalPallets > 0 && (
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded border-2 border-slate-600 bg-slate-800 p-4 text-center">
                    <p className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                      PALLETS
                    </p>
                    <p className="text-4xl font-mono font-black text-white">
                      {calculation.summary.totalPallets}
                    </p>
                  </div>
                  <div className="rounded border-2 border-slate-600 bg-slate-800 p-4 text-center">
                    <p className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                      WEIGHT_LB
                    </p>
                    <p className="text-3xl font-mono font-black text-white">
                      {Math.round(calculation.summary.totalWeightLb).toLocaleString("en-US")} lb
                    </p>
                  </div>
                  <div className="rounded border-2 border-slate-600 bg-slate-800 p-4 text-center">
                    <p className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                      MAX_H_IN
                    </p>
                    <p className="text-3xl font-mono font-black text-white">
                      {Math.round(calculation.summary.tallestPalletHeightIn)}&quot;
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  {(() => {
                    // Check if any breakdown has status messages
                    const hasStatusMessages = calculation.breakdowns.some((breakdown) => {
                      const { capacity } = breakdown;
                      return capacity.casesPerLayer === 0 || breakdown.unallocatedCases > 0;
                    });

                    return (
                      <table className="min-w-full divide-y-2 divide-slate-300 text-left text-xs font-mono border border-slate-300">
                        <thead className="bg-slate-200">
                          <tr>
                            <th className="px-3 py-2 font-bold text-slate-800 text-left uppercase">
                              SKU
                            </th>
                            <th className="px-3 py-2 font-bold text-slate-800 text-center uppercase">
                              Cases
                            </th>
                            <th className="px-3 py-2 font-bold text-slate-800 text-center uppercase">
                              Pallets
                            </th>
                            <th className="px-3 py-2 font-bold text-slate-800 text-center uppercase">
                              Full layers
                            </th>
                            <th className="px-3 py-2 font-bold text-slate-800 text-center uppercase">
                              Top layer
                            </th>
                            <th className="px-3 py-2 font-bold text-slate-800 text-center uppercase">
                              Weight
                            </th>
                            {hasStatusMessages && (
                              <th className="px-3 py-2 font-bold text-slate-800 text-left uppercase">
                                Status
                              </th>
                            )}
                          </tr>
                        </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {calculation.breakdowns.map((breakdown) => {
                        const { capacity } = breakdown;

                        const notes: string[] = [];
                        if (capacity.casesPerLayer === 0) {
                          notes.push("Cannot place on this pallet spec");
                        }
                        if (breakdown.unallocatedCases > 0) {
                          notes.push(`Unallocated: ${breakdown.unallocatedCases} cases`);
                        }
                        if (notes.length === 0) {
                          notes.push("—");
                        }


                        return (
                          <tr key={breakdown.product.id} className="hover:bg-slate-50">
                            <td className="px-3 py-2">
                              <div className="font-bold text-slate-900">
                                {breakdown.product.sku}
                              </div>
                              <div className="text-xs text-slate-600">
                                {breakdown.product.name}
                              </div>
                            </td>
                            <td className="px-3 py-2 text-center font-bold text-slate-900">
                              {breakdown.casesRequested}
                            </td>
                            <td className="px-3 py-2 text-center font-bold text-slate-900">
                              {breakdown.palletsInvolved || "—"}
                            </td>
                            <td className="px-3 py-2 text-center font-bold text-slate-900">
                              {breakdown.fullLayers || "—"}
                            </td>
                            <td className="px-3 py-2 text-center text-slate-700">
                              {breakdown.partialLayers.length > 0 ? breakdown.partialLayers.map(l => l.cases).join(",") : "—"}
                            </td>
                            <td className="px-3 py-2 text-center font-bold text-slate-900">
                              {Math.round(breakdown.totalWeightLb).toLocaleString("en-US")} lb
                            </td>
                            {hasStatusMessages && (
                              <td className="px-3 py-2 text-xs text-slate-600">
                                {notes.join(" ")}
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                      </table>
                    );
                  })()}
                </div>

                {calculation.pallets.length > 0 && (
                  <div className="flex flex-col gap-3">
                    <h3 className="text-xs font-mono font-bold text-slate-800 uppercase tracking-wider">
                      PALLET_BREAKDOWN
                    </h3>
                    <div className="flex flex-col gap-2">
                      {calculation.pallets.map((palletDetail) => {
                        const footprintText = palletSpec
                          ? `${Math.round(palletSpec.footprintIn.length)} x ${Math.round(palletSpec.footprintIn.width)}`
                          : "—";
                        const dimensionText = `${footprintText} x ${Math.round(palletDetail.heightIn)}"`;
                        const weightText = `${Math.round(palletDetail.totalWeightLb).toLocaleString("en-US")} lb`;
                        const casesText = `${palletDetail.totalCases}c`;

                        return (
                          <div
                            key={palletDetail.id}
                            className="rounded border border-slate-400 bg-slate-50 p-3"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="text-sm font-mono font-bold text-slate-900">
                                P{palletDetail.id.toString().padStart(2, '0')}
                              </div>
                              <div className="text-xs font-mono text-slate-700">
                                {dimensionText} | {weightText} | {casesText}
                              </div>
                            </div>
                            <div className="grid grid-cols-1 gap-1 text-xs font-mono">
                              {palletDetail.products.map((productAllocation) => {
                                const layerInfo = [];
                                if (productAllocation.fullLayers > 0) {
                                  layerInfo.push(`${productAllocation.fullLayers}FL`);
                                }
                                if (productAllocation.partialCases > 0) {
                                  layerInfo.push(`${productAllocation.partialCases}PL`);
                                }
                                const layerText = layerInfo.length > 0 ? layerInfo.join('+') : '—';

                                return (
                                  <div
                                    key={`${palletDetail.id}-${productAllocation.product.id}`}
                                    className="flex justify-between text-slate-800"
                                  >
                                    <span className="font-bold">
                                      {productAllocation.product.sku}
                                    </span>
                                    <span>
                                      {productAllocation.totalCases}c | {layerText}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
