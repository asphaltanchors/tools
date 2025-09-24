// ABOUTME: Dashboard home page showing system overview and quick stats
// ABOUTME: Provides summary cards and system status information

"use client";

import Link from "next/link";
import {
  Package,
  FenceIcon,
  QrCode,
  Calculator,
  TrendingUp,
  Activity,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold font-mono text-black tracking-tight uppercase">
            SYSTEM//DASHBOARD
          </h1>
          <p className="text-sm font-mono text-gray-600 mt-2 tracking-wider uppercase">
            AAC Technical Tools Suite Overview
          </p>
        </header>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white border-2 border-gray-900 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-mono text-gray-600 uppercase tracking-wider">
                  Active Tools
                </p>
                <p className="text-2xl font-mono font-bold text-black mt-1">
                  2
                </p>
              </div>
              <Activity className="h-8 w-8 text-gray-400" />
            </div>
          </div>
          <div className="bg-white border-2 border-gray-900 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-mono text-gray-600 uppercase tracking-wider">
                  Coming Soon
                </p>
                <p className="text-2xl font-mono font-bold text-black mt-1">
                  1
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-gray-400" />
            </div>
          </div>
          <div className="bg-white border-2 border-gray-900 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-mono text-gray-600 uppercase tracking-wider">
                  Total Calcs
                </p>
                <p className="text-2xl font-mono font-bold text-black mt-1">
                  —
                </p>
              </div>
              <Calculator className="h-8 w-8 text-gray-400" />
            </div>
          </div>
          <div className="bg-black border-2 border-gray-900 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-mono text-gray-400 uppercase tracking-wider">
                  Status
                </p>
                <p className="text-sm font-mono font-bold text-green-500 mt-1 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  ONLINE
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Cards */}
        <section className="space-y-6">
          <div>
            <h2 className="text-lg font-mono font-bold text-black uppercase tracking-wider mb-4">
              FEATURED TOOLS
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Link
                href="/calculators/pallet"
                className="group bg-white border-2 border-gray-900 rounded-lg p-6 transition-all hover:shadow-lg hover:scale-[1.02]"
              >
                <div className="flex items-start justify-between mb-4">
                  <Package className="h-8 w-8 text-gray-700 group-hover:text-black" />
                  <span className="text-xs font-mono font-bold text-green-600 bg-green-100 px-2 py-1 rounded">
                    ACTIVE
                  </span>
                </div>
                <h3 className="text-xl font-mono font-bold text-black mb-2">
                  PALLET//CALC
                </h3>
                <p className="text-sm font-mono text-gray-600 mb-4">
                  Advanced pallet optimization with single and mixed-SKU support
                </p>
                <div className="flex items-center justify-between text-xs font-mono text-gray-500">
                  <span>v2.1.0</span>
                  <span className="text-black font-bold group-hover:underline">
                    LAUNCH →
                  </span>
                </div>
              </Link>

              <Link
                href="/calculators/fence"
                className="group bg-white border-2 border-gray-900 rounded-lg p-6 transition-all hover:shadow-lg hover:scale-[1.02] opacity-75"
              >
                <div className="flex items-start justify-between mb-4">
                  <FenceIcon className="h-8 w-8 text-gray-500" />
                  <span className="text-xs font-mono font-bold text-yellow-600 bg-yellow-100 px-2 py-1 rounded">
                    SOON
                  </span>
                </div>
                <h3 className="text-xl font-mono font-bold text-black mb-2">
                  FENCE//CALC
                </h3>
                <p className="text-sm font-mono text-gray-600 mb-4">
                  Fencing material calculator with group derating logic
                </p>
                <div className="flex items-center justify-between text-xs font-mono text-gray-500">
                  <span>v0.1.0</span>
                  <span className="font-bold">IN DEV</span>
                </div>
              </Link>

              <Link
                href="/tools/barcode"
                className="group bg-white border-2 border-gray-900 rounded-lg p-6 transition-all hover:shadow-lg hover:scale-[1.02]"
              >
                <div className="flex items-start justify-between mb-4">
                  <QrCode className="h-8 w-8 text-gray-700 group-hover:text-black" />
                  <span className="text-xs font-mono font-bold text-green-600 bg-green-100 px-2 py-1 rounded">
                    ACTIVE
                  </span>
                </div>
                <h3 className="text-xl font-mono font-bold text-black mb-2">
                  Barcode
                </h3>
                <p className="text-sm font-mono text-gray-600 mb-4">
                  Generate ITF-14 barcodes with bearer bars for GS1 case codes
                </p>
                <div className="flex items-center justify-between text-xs font-mono text-gray-500">
                  <span>v1.0.0</span>
                  <span className="text-black font-bold group-hover:underline">
                    LAUNCH →
                  </span>
                </div>
              </Link>
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h2 className="text-lg font-mono font-bold text-black uppercase tracking-wider mb-4">
              RECENT ACTIVITY
            </h2>
            <div className="bg-white border-2 border-gray-900 rounded-lg">
              <div className="p-6">
                <div className="space-y-3 font-mono text-sm">
                  <div className="flex items-center justify-between py-2 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500">2024.09.24</span>
                      <span className="text-black font-medium">
                        System initialized
                      </span>
                    </div>
                    <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                      SYSTEM
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500">2024.09.24</span>
                      <span className="text-black font-medium">
                        Navigation sidebar added
                      </span>
                    </div>
                    <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                      UI
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500">2024.09.24</span>
                      <span className="text-black font-medium">
                        Pallet calculator deployed
                      </span>
                    </div>
                    <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                      FEATURE
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500">2024.09.24</span>
                      <span className="text-black font-medium">
                        ITF-14 barcode generator launched
                      </span>
                    </div>
                    <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                      FEATURE
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
