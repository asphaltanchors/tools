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
        Boolean(entry) && entry.quantityCases > 0,
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
    <main className="min-h-screen bg-slate-50 py-12">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-6">
        <header className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Pallet Calculator
          </p>
          <h1 className="text-3xl font-semibold text-slate-900">
            Plan shipments without spreadsheets.
          </h1>
          <p className="text-base text-slate-600">
            Select a pallet spec, add product quantities, and calculate pallet
            counts, heights, and ship weights in one step.
          </p>
        </header>

        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-4">
            <h2 className="text-lg font-medium text-slate-900">
              Pallet spec
            </h2>
            <p className="text-sm text-slate-500">
              Choose the pallet footprint and height limits that apply to this
              shipment.
            </p>
          </div>

          <div className="flex flex-col gap-4 px-6 py-6">
            <div className="flex flex-col gap-2">
              <span
                id="pallet-type-label"
                className="text-sm font-medium text-slate-700"
              >
                Pallet type
              </span>
              <Select
                value={selectedPalletId}
                onValueChange={(value) => {
                  setSelectedPalletId(value);
                }}
              >
                <SelectTrigger
                  aria-labelledby="pallet-type-label"
                  className="w-full md:w-80"
                >
                  <SelectValue placeholder="Choose a pallet" />
                </SelectTrigger>
                <SelectContent>
                  {PALLET_SPECS.map((spec) => (
                    <SelectItem key={spec.id} value={spec.id}>
                      {spec.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <fieldset className="flex flex-col gap-2">
              <legend className="text-sm font-medium text-slate-700">
                Pallet strategy
              </legend>
              <p className="text-xs text-slate-500">
                Keep pallets single-SKU by default. Enable optimization to mix
                products on the same pallet when it reduces total count.
              </p>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="radio"
                    name="pallet-mixing-mode"
                    value="single"
                    checked={mixingMode === "single"}
                    onChange={() => setMixingMode("single")}
                    className="h-4 w-4 border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  Single-product pallets
                </label>
                <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="radio"
                    name="pallet-mixing-mode"
                    value="mixed"
                    checked={mixingMode === "mixed"}
                    onChange={() => setMixingMode("mixed")}
                    className="h-4 w-4 border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  Optimize across products
                </label>
              </div>
            </fieldset>

            {palletSpec && (
              <dl className="grid grid-cols-2 gap-3 text-xs text-slate-500 sm:grid-cols-4">
                <div>
                  <dt className="font-medium text-slate-600">Footprint</dt>
                  <dd>
                    {palletSpec.footprintIn.length.toFixed(1)} ×
                    {" "}
                    {palletSpec.footprintIn.width.toFixed(1)} in
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-slate-600">Max height</dt>
                  <dd>{palletSpec.maxLoadHeightIn.toFixed(1)} in</dd>
                </div>
                <div>
                  <dt className="font-medium text-slate-600">Base height</dt>
                  <dd>{palletSpec.baseHeightIn.toFixed(1)} in</dd>
                </div>
                <div>
                  <dt className="font-medium text-slate-600">Tare weight</dt>
                  <dd>{palletSpec.tareWeightLb} lb</dd>
                </div>
                {palletSpec.notes && (
                  <div className="col-span-full text-slate-500">
                    <dt className="font-medium text-slate-600">Notes</dt>
                    <dd>{palletSpec.notes}</dd>
                  </div>
                )}
              </dl>
            )}
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-4">
            <h2 className="text-lg font-medium text-slate-900">
              Product mix
            </h2>
            <p className="text-sm text-slate-500">
              Quantities are in cases. Capacities adjust automatically for the
              selected pallet.
            </p>
          </div>

          <div className="flex flex-col gap-4 px-6 py-6">
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
                  className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-slate-50/50 p-4 md:flex-row md:items-start"
                >
                  <div className="flex flex-1 flex-col gap-2">
                    <span
                      id={`${item.id}-product-label`}
                      className="text-sm font-medium text-slate-700"
                    >
                      Product
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
                    <dl className="grid grid-cols-2 gap-2 text-xs text-slate-500 sm:grid-cols-4">
                      <div>
                        <dt className="font-medium text-slate-600">Cases/layer</dt>
                        <dd>{casesPerLayer || "—"}</dd>
                      </div>
                      <div>
                        <dt className="font-medium text-slate-600">Max layers</dt>
                        <dd>{maxLayers || "—"}</dd>
                      </div>
                      <div>
                        <dt className="font-medium text-slate-600">Cases/pallet</dt>
                        <dd>{casesPerPallet || "—"}</dd>
                      </div>
                      <div>
                        <dt className="font-medium text-slate-600">Full height</dt>
                        <dd>
                          {fullHeight ? `${Math.ceil(fullHeight)} in` : "—"}
                        </dd>
                      </div>
                      {product.notes && (
                        <div className="col-span-full text-slate-500">
                          <dt className="font-medium text-slate-600">Notes</dt>
                          <dd>{product.notes}</dd>
                        </div>
                      )}
                    </dl>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-slate-700">
                      Case quantity
                    </label>
                    <input
                      type="number"
                      min={0}
                      step={1}
                      inputMode="numeric"
                      className="w-32 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
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
                      className="text-left text-xs font-medium text-rose-600 hover:text-rose-700"
                      onClick={() => removeLineItem(item.id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}

            <div className="flex items-center justify-between">
              <button
                type="button"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                onClick={handleAddLine}
              >
                + Add another product
              </button>
              <button
                type="button"
                className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:cursor-not-allowed disabled:bg-indigo-300"
                onClick={handleCalculate}
                disabled={!canCalculate}
              >
                Calculate pallets
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-4">
            <h2 className="text-lg font-medium text-slate-900">
              Results
            </h2>
            <p className="text-sm text-slate-500">
              Totals include pallet tare weights. Pallet: {palletSpec?.name ?? "—"}
            </p>
          </div>

          <div className="px-6 py-6">
            {!attempted && (
              <p className="text-sm text-slate-500">
                Enter quantities and run the calculator to see pallet counts.
              </p>
            )}

            {attempted && !calculation && (
              <p className="text-sm text-amber-600">
                Add at least one product with a quantity above zero to calculate
                pallets.
              </p>
            )}

            {calculation && calculation.summary.totalPallets > 0 && (
              <div className="flex flex-col gap-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="rounded-lg bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      Total pallets
                    </p>
                    <p className="text-2xl font-semibold text-slate-900">
                      {calculation.summary.totalPallets}
                    </p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      Total ship weight
                    </p>
                    <p className="text-2xl font-semibold text-slate-900">
                      {calculation.summary.totalWeightLb.toLocaleString("en-US")}
                      {" lb"}
                    </p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      Tallest pallet height
                    </p>
                    <p className="text-2xl font-semibold text-slate-900">
                      {Math.ceil(calculation.summary.tallestPalletHeightIn)}
                      {" in"}
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-4 py-3 font-medium text-slate-600">
                          Product
                        </th>
                        <th className="px-4 py-3 font-medium text-slate-600">
                          Cases
                        </th>
                        <th className="px-4 py-3 font-medium text-slate-600">
                          Pallets involved
                        </th>
                        <th className="px-4 py-3 font-medium text-slate-600">
                          Full layers
                        </th>
                        <th className="px-4 py-3 font-medium text-slate-600">
                          Top layer
                        </th>
                        <th className="px-4 py-3 font-medium text-slate-600">
                          Notes
                        </th>
                        <th className="px-4 py-3 font-medium text-slate-600">
                          Case weight
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {calculation.breakdowns.map((breakdown) => {
                        const { capacity } = breakdown;
                        const partialText = (() => {
                          if (capacity.casesPerLayer === 0) {
                            return "Does not fit selected pallet";
                          }

                          if (breakdown.partialLayers.length === 0) {
                            return breakdown.fullLayers > 0
                              ? "Full layers only"
                              : "None";
                          }

                          return breakdown.partialLayers
                            .map((layer) => {
                              const suffix =
                                breakdown.partialLayers.length > 1
                                  ? ` (pallet ${layer.palletId})`
                                  : "";
                              return `${layer.cases} cases · ${Math.ceil(layer.heightIn)} in${suffix}`;
                            })
                            .join("; ");
                        })();

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

                        const fullLayerText = capacity.casesPerLayer
                          ? `${breakdown.fullLayers} × ${capacity.casesPerLayer} cases`
                          : "—";

                        return (
                          <tr key={breakdown.product.id} className="bg-white">
                            <td className="px-4 py-3">
                              <div className="font-medium text-slate-900">
                                {breakdown.product.name}
                              </div>
                              <div className="text-xs text-slate-500">
                                {breakdown.product.sku}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-slate-700">
                              {breakdown.casesRequested}
                            </td>
                            <td className="px-4 py-3 text-slate-700">
                              {breakdown.palletsInvolved || "—"}
                            </td>
                            <td className="px-4 py-3 text-slate-700">
                              {fullLayerText}
                            </td>
                            <td className="px-4 py-3 text-slate-700">{partialText}</td>
                            <td className="px-4 py-3 text-slate-700">
                              {notes.join(" · ")}
                            </td>
                            <td className="px-4 py-3 text-slate-700">
                              {breakdown.totalWeightLb.toLocaleString("en-US")}
                              {" lb"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {calculation.pallets.length > 0 && (
                  <div className="flex flex-col gap-3">
                    <h3 className="text-sm font-semibold text-slate-700">
                      Pallet breakdown
                    </h3>
                    <div className="flex flex-col gap-3">
                      {calculation.pallets.map((palletDetail) => {
                        const footprintText = palletSpec
                          ? `${palletSpec.footprintIn.length.toFixed(1)} × ${palletSpec.footprintIn.width.toFixed(1)} in`
                          : "—";
                        const dimensionText = `${footprintText} × ${Math.ceil(palletDetail.heightIn)} in`;
                        const weightText = `${palletDetail.totalWeightLb.toLocaleString("en-US", {
                          maximumFractionDigits: 1,
                          minimumFractionDigits: 1,
                        })} lb`;
                        const casesText = `${palletDetail.totalCases} cases`;

                        return (
                          <div
                            key={palletDetail.id}
                            className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
                          >
                            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                              <div className="text-base font-medium text-slate-900">
                                Pallet {palletDetail.id}
                              </div>
                              <div className="text-sm text-slate-500">
                                {dimensionText} · {weightText} ({casesText})
                              </div>
                            </div>
                            <ul className="mt-3 flex flex-col gap-2 text-sm text-slate-700">
                              {palletDetail.products.map((productAllocation) => {
                                const layersText = [] as string[];
                                if (productAllocation.fullLayers > 0) {
                                  layersText.push(
                                    `${productAllocation.fullLayers} full layer${
                                      productAllocation.fullLayers === 1 ? "" : "s"
                                    } (${productAllocation.casesFromFullLayers} cases)`,
                                  );
                                }
                                if (productAllocation.partialCases > 0) {
                                  const heightText = productAllocation.partialHeightIn
                                    ? ` · ${Math.ceil(productAllocation.partialHeightIn)} in`
                                    : "";
                                  layersText.push(
                                    `top layer: ${productAllocation.partialCases} cases${heightText}`,
                                  );
                                }
                                if (layersText.length === 0) {
                                  layersText.push("—");
                                }

                                return (
                                  <li
                                    key={`${palletDetail.id}-${productAllocation.product.id}`}
                                    className="flex flex-col gap-0.5"
                                  >
                                    <span className="font-medium text-slate-900">
                                      {productAllocation.product.name} ({productAllocation.product.sku})
                                    </span>
                                    <span className="text-xs text-slate-500">
                                      {productAllocation.totalCases} cases · {layersText.join("; ")}
                                    </span>
                                  </li>
                                );
                              })}
                            </ul>
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
