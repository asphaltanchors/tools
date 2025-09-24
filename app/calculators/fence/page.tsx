// ABOUTME: Fence calculator placeholder page for future implementation
// ABOUTME: Will calculate fencing materials and apply group derating logic

"use client";

import { FenceIcon, Wrench, Calculator, AlertCircle } from "lucide-react";

export default function FenceCalculator() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-8">
        <header className="bg-white rounded-lg border-2 border-gray-900 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold font-mono text-black tracking-tight uppercase">
                FENCE//CALC
              </h1>
              <p className="text-xs text-gray-600 font-mono mt-1 tracking-wider uppercase">
                Fencing Material Calculator v0.1
              </p>
            </div>
            <FenceIcon className="h-10 w-10 text-gray-400" />
          </div>
        </header>

        <section className="border-2 border-gray-900 bg-white rounded-lg shadow-sm">
          <div className="border-b-2 border-gray-900 px-4 py-3 bg-yellow-50 rounded-t-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <h2 className="text-sm font-mono font-bold text-black uppercase tracking-wider">
                IN DEVELOPMENT
              </h2>
            </div>
          </div>
          <div className="p-8">
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="bg-gray-100 rounded-full p-6">
                  <Wrench className="h-12 w-12 text-gray-500" />
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-lg font-mono font-bold text-gray-800">
                  Coming Soon: Advanced Fence Calculator
                </p>
                <p className="text-sm font-mono text-gray-600 max-w-2xl mx-auto">
                  This calculator will provide comprehensive fencing material calculations with support for:
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
                <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                  <Calculator className="h-6 w-6 text-gray-600 mx-auto mb-2" />
                  <h3 className="font-mono font-bold text-sm text-black uppercase mb-1">Material Calc</h3>
                  <p className="text-xs font-mono text-gray-600">Posts, rails, pickets, and concrete calculations</p>
                </div>
                <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                  <FenceIcon className="h-6 w-6 text-gray-600 mx-auto mb-2" />
                  <h3 className="font-mono font-bold text-sm text-black uppercase mb-1">Group Derating</h3>
                  <p className="text-xs font-mono text-gray-600">Automatic derating for bulk material orders</p>
                </div>
                <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                  <Wrench className="h-6 w-6 text-gray-600 mx-auto mb-2" />
                  <h3 className="font-mono font-bold text-sm text-black uppercase mb-1">Multiple Types</h3>
                  <p className="text-xs font-mono text-gray-600">Support for wood, vinyl, and chain link</p>
                </div>
              </div>
              <div className="pt-4">
                <p className="text-xs font-mono text-gray-500 uppercase tracking-wider">
                  Expected Release: Q1 2025
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}