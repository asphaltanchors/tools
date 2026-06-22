import {
  AlertTriangle,
  Database,
  PackageCheck,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import {
  formatCurrency,
  formatPercent,
} from "@/lib/margins/calculations";
import { getMarginTrackerData } from "@/lib/margins/db";
import { MarginModeler } from "./margin-modeler";
import { MarginOperations } from "./margin-operations";

export const dynamic = "force-dynamic";

const metricClass =
  "rounded-lg border-2 border-gray-900 bg-white p-4 shadow-sm";

const statusColor = (value: number | null) => {
  if (value === null) {
    return "bg-gray-100 text-gray-700";
  }

  if (value < 0.35) {
    return "bg-red-100 text-red-700";
  }

  if (value < 0.5) {
    return "bg-yellow-100 text-yellow-700";
  }

  return "bg-green-100 text-green-700";
};

export default async function MarginTrackerPage() {
  const data = await getMarginTrackerData();
  const topRows = [...data.rows].sort((a, b) => {
    if (a.missingInputs.length !== b.missingInputs.length) {
      return b.missingInputs.length - a.missingInputs.length;
    }

    return a.sku.localeCompare(b.sku);
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-8">
        <header className="rounded-lg border-2 border-gray-900 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold font-mono uppercase tracking-tight text-black">
                MARGIN//TRACKER
              </h1>
              <p className="mt-1 text-xs font-mono uppercase tracking-wider text-gray-600">
                Landed cost, tariffs, Shopify SKU data, and gross margin
              </p>
            </div>
            <div className="flex items-center gap-3 rounded border border-gray-300 bg-gray-50 px-3 py-2">
              <Database className="h-4 w-4 text-gray-500" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-gray-700">
                Cloudflare D1
              </span>
              <span
                className={`h-2 w-2 rounded-full ${
                  data.connected ? "bg-green-500" : "bg-yellow-500"
                }`}
              />
            </div>
          </div>
        </header>

        {data.connectionMessage && (
          <div className="flex items-start gap-3 rounded-lg border-2 border-yellow-500 bg-yellow-50 p-4">
            <AlertTriangle className="mt-0.5 h-5 w-5 text-yellow-700" />
            <p className="text-sm font-mono text-yellow-900">
              {data.connectionMessage}
            </p>
          </div>
        )}

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
          <div className={metricClass}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-gray-500">
                Active SKUs
              </span>
              <PackageCheck className="h-5 w-5 text-gray-400" />
            </div>
            <div className="mt-2 text-2xl font-mono font-bold text-black">
              {data.summary.activeSkuCount}
            </div>
          </div>
          <div className={metricClass}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-gray-500">
                Current FX
              </span>
              <TrendingUp className="h-5 w-5 text-gray-400" />
            </div>
            <div className="mt-2 text-2xl font-mono font-bold text-black">
              {data.summary.latestFxRate?.usdCny.toFixed(4) ?? "-"}
            </div>
          </div>
          <div className={metricClass}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-gray-500">
                Cost/layer
              </span>
              <TrendingDown className="h-5 w-5 text-gray-400" />
            </div>
            <div className="mt-2 text-2xl font-mono font-bold text-black">
              {formatCurrency(data.summary.latestShippingPerLayerUsd)}
            </div>
          </div>
          <div className={metricClass}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-gray-500">
                Avg GM
              </span>
              <TrendingUp className="h-5 w-5 text-gray-400" />
            </div>
            <div className="mt-2 text-2xl font-mono font-bold text-black">
              {formatPercent(data.summary.averageGrossMarginPct)}
            </div>
          </div>
          <div className="rounded-lg border-2 border-gray-900 bg-black p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-gray-400">
                Missing inputs
              </span>
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="mt-2 text-2xl font-mono font-bold text-white">
              {data.summary.missingInputCount}
            </div>
          </div>
        </section>

        <MarginOperations products={data.products} connected={data.connected} />

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_360px]">
          <section className="overflow-hidden rounded-lg border-2 border-gray-900 bg-white shadow-sm">
            <div className="border-b-2 border-gray-900 bg-gray-50 px-4 py-3">
              <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-black">
                View: SKU Margin
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] border-collapse text-left font-mono text-xs">
                <thead className="bg-black text-white">
                  <tr>
                    <th className="px-3 py-3 font-bold uppercase tracking-wider">
                      SKU
                    </th>
                    <th className="px-3 py-3 font-bold uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-3 py-3 font-bold uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-3 py-3 font-bold uppercase tracking-wider">
                      HTS
                    </th>
                    <th className="px-3 py-3 text-right font-bold uppercase tracking-wider">
                      COGS
                    </th>
                    <th className="px-3 py-3 text-right font-bold uppercase tracking-wider">
                      Retail
                    </th>
                    <th className="px-3 py-3 text-right font-bold uppercase tracking-wider">
                      GM $
                    </th>
                    <th className="px-3 py-3 text-right font-bold uppercase tracking-wider">
                      GM %
                    </th>
                    <th className="px-3 py-3 font-bold uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {topRows.map((row) => (
                    <tr key={row.sku} className="border-b border-gray-200">
                      <td className="px-3 py-3 font-bold text-black">{row.sku}</td>
                      <td className="max-w-[260px] px-3 py-3 text-gray-700">
                        {row.name}
                      </td>
                      <td className="px-3 py-3 text-gray-700">{row.category}</td>
                      <td className="px-3 py-3 text-gray-700">
                        {row.htsCode ?? "-"}
                      </td>
                      <td className="px-3 py-3 text-right text-gray-900">
                        {formatCurrency(row.cogsUsd)}
                      </td>
                      <td className="px-3 py-3 text-right text-gray-900">
                        {formatCurrency(row.retailUsd)}
                      </td>
                      <td className="px-3 py-3 text-right text-gray-900">
                        {formatCurrency(row.grossMarginUsd)}
                      </td>
                      <td className="px-3 py-3 text-right">
                        <span
                          className={`rounded px-2 py-1 font-bold ${statusColor(
                            row.grossMarginPct,
                          )}`}
                        >
                          {formatPercent(row.grossMarginPct)}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        {row.missingInputs.length ? (
                          <span className="rounded bg-yellow-100 px-2 py-1 font-bold uppercase text-yellow-700">
                            {row.missingInputs.join(", ")}
                          </span>
                        ) : (
                          <span className="rounded bg-green-100 px-2 py-1 font-bold uppercase text-green-700">
                            Complete
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <aside className="overflow-hidden rounded-lg border-2 border-gray-900 bg-white shadow-sm">
            <div className="border-b-2 border-gray-900 bg-gray-50 px-4 py-3">
              <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-black">
                Recent Shipments
              </h2>
            </div>
            <div className="divide-y divide-gray-200">
              {data.shipments.slice(0, 8).map((shipment) => (
                <div key={shipment.id} className="p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-mono text-sm font-bold text-black">
                      {shipment.reference}
                    </div>
                    <div className="text-xs font-mono text-gray-500">
                      {shipment.arrivalDate}
                    </div>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-xs font-mono text-gray-600">
                    <span>{formatCurrency(shipment.totalLandedCostUsd)}</span>
                    <span className="text-right">{shipment.totalLayers} layers</span>
                    <span className="col-span-2 font-bold text-black">
                      {formatCurrency(
                        shipment.totalLandedCostUsd / shipment.totalLayers,
                      )}
                      /layer
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>

        <MarginModeler rows={data.rows} />
      </div>
    </div>
  );
}
