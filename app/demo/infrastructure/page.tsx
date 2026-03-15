"use client";

import { infraDemoData } from "@/lib/data/infra-demo";
import { PromiseCard } from "@/components/promise/PromiseCard";
import { InsightsTab } from "@/components/dashboard/InsightsTab";
import { calculateNetworkHealth } from "@/lib/simulation/cascade";

export default function InfrastructureDemoPage() {
  const health = calculateNetworkHealth(infraDemoData.promises);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0f1419", color: "#e5e7eb" }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="font-serif text-2xl font-bold text-white">
              {infraDemoData.title}
            </h1>
            <span className="px-2 py-0.5 text-xs font-medium bg-teal-900 text-teal-300 rounded">
              Static Demo
            </span>
          </div>
          <p className="text-gray-400">{infraDemoData.subtitle}</p>
        </div>

        <div className="bg-teal-900/30 border border-teal-700 rounded-lg p-3 mb-6 text-sm text-teal-300">
          Simulation coming soon — currently showing static accountability data.
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-4 text-center">
            <p className="text-3xl font-bold text-white">{Math.round(health.overall)}</p>
            <p className="text-sm text-gray-400">Network Health</p>
          </div>
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-4 text-center">
            <p className="text-3xl font-bold text-white">{infraDemoData.grade}</p>
            <p className="text-sm text-gray-400">Grade</p>
          </div>
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-4 text-center">
            <p className="text-3xl font-bold text-white">{infraDemoData.promises.length}</p>
            <p className="text-sm text-gray-400">Promises</p>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="font-serif text-xl font-semibold text-white mb-4">Promises</h2>
          <div className="space-y-3">
            {infraDemoData.promises.map((p) => (
              <PromiseCard key={p.id} promise={p} agents={infraDemoData.agents} />
            ))}
          </div>
        </div>

        <div>
          <h2 className="font-serif text-xl font-semibold text-white mb-4">Insights</h2>
          <InsightsTab insights={infraDemoData.insights} promises={infraDemoData.promises} />
        </div>
      </div>
    </div>
  );
}
