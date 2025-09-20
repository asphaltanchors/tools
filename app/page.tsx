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
  const [mixingMode, setMixingMode] = useState<"single" | "mixed">("mixed");
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
    <main className="min-h-screen bg-white py-8">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4">
        <header className="space-y-4 border-b border-gray-200 pb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold font-mono text-black tracking-tight">
                PALLET//CALC
              </h1>
              <p className="text-sm text-gray-600 font-mono mt-1 tracking-wide">
                TECHNICAL SHIPMENT CALCULATOR
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs font-mono text-gray-500 uppercase tracking-wider mb-1">
                PALLET TYPE
              </p>
              <Select
                value={selectedPalletId}
                onValueChange={(value) => {
                  setSelectedPalletId(value);
                }}
              >
                <SelectTrigger className="w-40 h-10 text-xs font-mono bg-white border-2 border-gray-900 hover:bg-gray-50 focus:ring-2 focus:ring-offset-1 focus:ring-gray-900">
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
          <div className="flex items-center gap-3 text-xs">
            <span className="font-mono text-gray-700 uppercase tracking-wider font-semibold">MODE:</span>
            <button
              type="button"
              onClick={() => setMixingMode(mixingMode === "single" ? "mixed" : "single")}
              className="relative inline-flex h-8 w-[130px] items-center rounded bg-gray-100 border-2 border-gray-900 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
              role="switch"
              aria-checked={mixingMode === "mixed"}
              aria-label="Toggle between Single-SKU and Mixed-SKU modes"
            >
              <span className="sr-only">Toggle pallet mixing mode</span>
              <span
                className={`${
                  mixingMode === "mixed" ? "translate-x-[65px]" : "translate-x-0"
                } inline-block h-8 w-[65px] transform bg-black transition-transform duration-200 ease-in-out absolute`}
              />
              <span
                className={`${
                  mixingMode === "single" ? "text-white" : "text-gray-700"
                } absolute left-0 w-[65px] font-mono text-[11px] font-bold uppercase transition-colors duration-200 pointer-events-none tracking-wider z-10 flex items-center justify-center h-full`}
              >
                SINGLE
              </span>
              <span
                className={`${
                  mixingMode === "mixed" ? "text-white" : "text-gray-700"
                } absolute left-[65px] w-[65px] font-mono text-[11px] font-bold uppercase transition-colors duration-200 pointer-events-none tracking-wider z-10 flex items-center justify-center h-full`}
              >
                MIXED
              </span>
            </button>
          </div>
        </header>


        <section className="border-2 border-gray-900 bg-white">
          <div className="border-b-2 border-gray-900 px-4 py-3 bg-gray-50">
            <h2 className="text-sm font-mono font-bold text-black uppercase tracking-wider">
              INPUT: PRODUCT QUANTITIES [CASES]
            </h2>
          </div>

          <div className="flex flex-col gap-3 px-4 py-4 bg-white">
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
                  className="flex flex-col gap-3 border border-gray-400 bg-gray-50 p-3 md:flex-row md:items-start"
                >
                  <div className="flex flex-1 flex-col gap-2">
                    <span
                      id={`${item.id}-product-label`}
                      className="text-xs font-mono font-bold text-gray-700 uppercase tracking-wider"
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
                        className="w-full h-10 bg-white font-mono text-sm border-2 border-gray-300 hover:border-gray-900 focus:ring-2 focus:ring-gray-900"
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
                        <dt className="font-semibold text-gray-600 uppercase">Cases/L</dt>
                        <dd className="text-black font-bold">{casesPerLayer || "—"}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-gray-600 uppercase">Layers</dt>
                        <dd className="text-black font-bold">{maxLayers || "—"}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-gray-600 uppercase">Total</dt>
                        <dd className="text-black font-bold">{casesPerPallet || "—"}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-gray-600 uppercase">Height</dt>
                        <dd className="text-black font-bold">
                          {fullHeight ? `${Math.round(fullHeight)}"` : "—"}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-mono font-bold text-gray-700 uppercase tracking-wider">
                      QTY
                    </label>
                    <input
                      type="number"
                      min={0}
                      step={1}
                      inputMode="numeric"
                      className="w-24 h-10 border-2 border-gray-900 bg-white px-2 text-lg font-mono font-bold text-black text-center focus:border-black focus:outline-none focus:ring-2 focus:ring-gray-900"
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
                      className="text-xs font-mono font-bold text-red-600 hover:text-red-800 uppercase tracking-wider"
                      onClick={() => removeLineItem(item.id)}
                    >
                      DEL
                    </button>
                  </div>
                </div>
              );
            })}

            <div className="flex items-center justify-between pt-3 border-t-2 border-gray-300">
              <button
                type="button"
                className="text-xs font-mono font-bold text-black hover:text-gray-700 uppercase tracking-wider border-2 border-black px-3 py-1.5 hover:bg-gray-100 transition-colors"
                onClick={handleAddLine}
              >
                [+] ADD SKU
              </button>
              <button
                type="button"
                className="bg-black px-6 py-2 text-sm font-mono font-bold text-white hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 disabled:cursor-not-allowed disabled:bg-gray-400 uppercase tracking-wider transition-colors"
                onClick={handleCalculate}
                disabled={!canCalculate}
              >
                {'>> CALCULATE'}
              </button>
            </div>
          </div>
        </section>

        <section className="border-2 border-gray-900 bg-white">
          <div className="border-b-2 border-gray-900 px-4 py-3 bg-gray-50">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-mono font-bold text-black uppercase tracking-wider">
                OUTPUT: CALCULATION RESULTS
              </h2>
              <div className="text-xs font-mono text-gray-700">
                PALLET: <span className="font-bold">{palletSpec?.name ?? "—"}</span>
              </div>
            </div>
            {palletSpec && (
              <dl className="grid grid-cols-4 gap-3 mt-2 text-xs font-mono text-gray-600">
                <div>
                  <dt className="font-bold uppercase">Footprint</dt>
                  <dd className="font-mono text-black">{Math.round(palletSpec.footprintIn.length)} × {Math.round(palletSpec.footprintIn.width)}&quot;</dd>
                </div>
                <div>
                  <dt className="font-bold uppercase">Max H</dt>
                  <dd className="font-mono text-black">{Math.round(palletSpec.maxLoadHeightIn)}&quot;</dd>
                </div>
                <div>
                  <dt className="font-bold uppercase">Base H</dt>
                  <dd className="font-mono text-black">{Math.round(palletSpec.baseHeightIn)}&quot;</dd>
                </div>
                <div>
                  <dt className="font-bold uppercase">Tare</dt>
                  <dd className="font-mono text-black">{Math.round(palletSpec.tareWeightLb)} lb</dd>
                </div>
              </dl>
            )}
          </div>

          <div className="px-4 py-4">
            {!attempted && (
              <p className="text-sm font-mono text-gray-500 text-center py-8 uppercase tracking-wider">
                [NO DATA] — ENTER QUANTITIES AND EXECUTE CALCULATION
              </p>
            )}

            {attempted && !calculation && (
              <p className="text-sm font-mono text-red-600 text-center py-8 uppercase tracking-wider font-bold">
                [ERROR] — AT LEAST ONE PRODUCT QUANTITY REQUIRED
              </p>
            )}

            {calculation && calculation.summary.totalPallets > 0 && (
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="border-2 border-gray-900 bg-black p-4 text-center">
                    <p className="text-xs font-mono font-bold text-gray-300 uppercase tracking-wider">
                      PALLETS
                    </p>
                    <p className="text-4xl font-mono font-black text-white">
                      {calculation.summary.totalPallets}
                    </p>
                  </div>
                  <div className="border-2 border-gray-900 bg-black p-4 text-center">
                    <p className="text-xs font-mono font-bold text-gray-300 uppercase tracking-wider">
                      WEIGHT
                    </p>
                    <p className="text-3xl font-mono font-black text-white">
                      {Math.round(calculation.summary.totalWeightLb).toLocaleString("en-US")} lb
                    </p>
                  </div>
                  <div className="border-2 border-gray-900 bg-black p-4 text-center">
                    <p className="text-xs font-mono font-bold text-gray-300 uppercase tracking-wider">
                      MAX HEIGHT
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
                      <table className="min-w-full divide-y-2 divide-gray-300 text-left text-xs font-mono border-2 border-gray-300">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-3 py-2 font-bold text-black text-left uppercase tracking-wider">
                              SKU
                            </th>
                            <th className="px-3 py-2 font-bold text-black text-center uppercase tracking-wider">
                              Cases
                            </th>
                            <th className="px-3 py-2 font-bold text-black text-center uppercase tracking-wider">
                              Pallets
                            </th>
                            <th className="px-3 py-2 font-bold text-black text-center uppercase tracking-wider">
                              Full Layers
                            </th>
                            <th className="px-3 py-2 font-bold text-black text-center uppercase tracking-wider">
                              Top Layer
                            </th>
                            <th className="px-3 py-2 font-bold text-black text-center uppercase tracking-wider">
                              Weight
                            </th>
                            {hasStatusMessages && (
                              <th className="px-3 py-2 font-bold text-black text-left uppercase tracking-wider">
                                Status
                              </th>
                            )}
                          </tr>
                        </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
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
                          <tr key={breakdown.product.id} className="hover:bg-gray-50">
                            <td className="px-3 py-2">
                              <div className="font-bold text-black">
                                {breakdown.product.sku}
                              </div>
                              <div className="text-xs text-gray-600">
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
                            className="border-2 border-gray-300 bg-white p-3"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="text-sm font-mono font-bold text-black uppercase">
                                P{palletDetail.id.toString().padStart(2, '0')}
                              </div>
                              <div className="text-xs font-mono text-gray-700">
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
                                    className="flex justify-between text-gray-800"
                                  >
                                    <span className="font-bold text-black">
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
