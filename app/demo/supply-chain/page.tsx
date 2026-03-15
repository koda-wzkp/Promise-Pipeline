"use client";

import { supplyChainDemoData } from "@/lib/data/supply-chain-demo";
import { PromiseCard } from "@/components/promise/PromiseCard";
import { InsightsTab } from "@/components/dashboard/InsightsTab";
import { calculateNetworkHealth } from "@/lib/simulation/cascade";

export default function SupplyChainDemoPage() {
  const health = calculateNetworkHealth(supplyChainDemoData.promises);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#faf9f6" }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="font-serif text-2xl font-bold text-gray-900">
              {supplyChainDemoData.title}
            </h1>
            <span className="px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-800 rounded">
              Static Demo
            </span>
          </div>
          <p className="text-gray-600">{supplyChainDemoData.subtitle}</p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6 text-sm text-amber-800">
          Simulation coming soon — currently showing static accountability data.
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl border p-4 text-center">
            <p className="text-3xl font-bold text-gray-900">{Math.round(health.overall)}</p>
            <p className="text-sm text-gray-500">Network Health</p>
          </div>
          <div className="bg-white rounded-xl border p-4 text-center">
            <p className="text-3xl font-bold text-gray-900">{supplyChainDemoData.grade}</p>
            <p className="text-sm text-gray-500">Grade</p>
          </div>
          <div className="bg-white rounded-xl border p-4 text-center">
            <p className="text-3xl font-bold text-gray-900">{supplyChainDemoData.promises.length}</p>
            <p className="text-sm text-gray-500">Promises</p>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="font-serif text-xl font-semibold text-gray-900 mb-4">Promises</h2>
          <div className="space-y-3">
            {supplyChainDemoData.promises.map((p) => (
              <PromiseCard key={p.id} promise={p} agents={supplyChainDemoData.agents} />
            ))}
          </div>
        </div>

        <div>
          <h2 className="font-serif text-xl font-semibold text-gray-900 mb-4">Insights</h2>
          <InsightsTab insights={supplyChainDemoData.insights} promises={supplyChainDemoData.promises} />
        </div>
      </div>
    </div>
  );
}
