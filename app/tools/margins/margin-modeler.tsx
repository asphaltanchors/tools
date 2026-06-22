"use client";

import { useMemo, useState } from "react";
import { Calculator } from "lucide-react";

import {
  formatCurrency,
  formatPercent,
} from "@/lib/margins/calculations";
import type { MarginRow } from "@/lib/margins/types";

const fieldClass =
  "h-10 w-full rounded border-2 border-gray-900 bg-white px-3 font-mono text-sm text-black focus:outline-none focus:ring-2 focus:ring-gray-900";

export function MarginModeler({ rows }: { rows: MarginRow[] }) {
  const usableRows = rows.filter((row) => row.retailUsd > 0 || row.cogsUsd > 0);
  const [selectedSku, setSelectedSku] = useState(usableRows[0]?.sku ?? rows[0]?.sku ?? "");
  const [priceChangePct, setPriceChangePct] = useState(0);
  const [discountPct, setDiscountPct] = useState(0);

  const selectedRow = useMemo(
    () => rows.find((row) => row.sku === selectedSku) ?? rows[0],
    [rows, selectedSku],
  );

  const modeled = useMemo(() => {
    const retail = selectedRow?.retailUsd ?? 0;
    const cogs = selectedRow?.cogsUsd ?? 0;
    const listPrice = retail * (1 + priceChangePct / 100);
    const netPrice = listPrice * (1 - discountPct / 100);
    const marginDollars = netPrice - cogs;
    const marginPct = netPrice > 0 ? marginDollars / netPrice : null;

    return {
      listPrice,
      netPrice,
      marginDollars,
      marginPct,
      marginDelta:
        marginPct !== null && selectedRow?.grossMarginPct !== null
          ? marginPct - selectedRow.grossMarginPct
          : null,
    };
  }, [discountPct, priceChangePct, selectedRow]);

  return (
    <section className="overflow-hidden rounded-lg border-2 border-gray-900 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b-2 border-gray-900 bg-gray-50 px-4 py-3">
        <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-black">
          Model: Price and Discount
        </h2>
        <Calculator className="h-4 w-4 text-gray-500" />
      </div>
      <div className="grid gap-4 p-4 lg:grid-cols-[1fr_1fr]">
        <div className="grid gap-4">
          <label className="space-y-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-gray-600">
              SKU
            </span>
            <select
              value={selectedSku}
              onChange={(event) => setSelectedSku(event.target.value)}
              className={fieldClass}
            >
              {rows.map((row) => (
                <option key={row.sku} value={row.sku}>
                  {row.sku} - {row.name}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-gray-600">
              List price change
            </span>
            <input
              type="range"
              min="-30"
              max="30"
              step="1"
              value={priceChangePct}
              onChange={(event) => setPriceChangePct(Number(event.target.value))}
              className="w-full accent-black"
            />
            <div className="h-6 text-sm font-mono font-bold text-black">
              {priceChangePct > 0 ? "+" : ""}
              {priceChangePct}%
            </div>
          </label>
          <label className="space-y-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-gray-600">
              Discount
            </span>
            <input
              type="range"
              min="0"
              max="60"
              step="1"
              value={discountPct}
              onChange={(event) => setDiscountPct(Number(event.target.value))}
              className="w-full accent-black"
            />
            <div className="h-6 text-sm font-mono font-bold text-black">
              {discountPct}%
            </div>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded border border-gray-300 bg-gray-50 p-3">
            <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-gray-500">
              Current retail
            </div>
            <div className="mt-2 text-xl font-mono font-bold text-black">
              {formatCurrency(selectedRow?.retailUsd)}
            </div>
          </div>
          <div className="rounded border border-gray-300 bg-gray-50 p-3">
            <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-gray-500">
              Net price
            </div>
            <div className="mt-2 text-xl font-mono font-bold text-black">
              {formatCurrency(modeled.netPrice)}
            </div>
          </div>
          <div className="rounded border border-gray-300 bg-gray-50 p-3">
            <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-gray-500">
              COGS
            </div>
            <div className="mt-2 text-xl font-mono font-bold text-black">
              {formatCurrency(selectedRow?.cogsUsd)}
            </div>
          </div>
          <div className="rounded border border-gray-300 bg-gray-50 p-3">
            <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-gray-500">
              Modeled GM
            </div>
            <div className="mt-2 text-xl font-mono font-bold text-black">
              {formatPercent(modeled.marginPct)}
            </div>
          </div>
          <div className="rounded border border-gray-300 bg-black p-3 text-white">
            <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-gray-400">
              GM dollars
            </div>
            <div className="mt-2 text-xl font-mono font-bold">
              {formatCurrency(modeled.marginDollars)}
            </div>
          </div>
          <div className="rounded border border-gray-300 bg-black p-3 text-white">
            <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-gray-400">
              GM delta
            </div>
            <div className="mt-2 text-xl font-mono font-bold">
              {formatPercent(modeled.marginDelta)}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
