"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { PersonalStats } from "@/lib/types/personal";
import { NetworkHealthBar } from "@/components/simulation/NetworkHealthBar";

interface DomainBreakdownProps {
  stats: PersonalStats;
}

const COLORS = ["#1a5f4a", "#2563eb", "#b45309", "#7c3aed", "#dc2626", "#0891b2", "#db2777"];

export function DomainBreakdown({ stats }: DomainBreakdownProps) {
  const domains = Object.entries(stats.byDomain);

  if (domains.length === 0) {
    return (
      <div className="bg-white rounded-xl border p-6 text-center text-sm text-gray-500">
        Create promises across different domains to see your breakdown.
      </div>
    );
  }

  const pieData = domains.map(([name, data]) => ({
    name,
    value: data.total,
  }));

  return (
    <div className="bg-white rounded-xl border p-6">
      <h3 className="font-serif font-semibold text-gray-900 mb-4">
        Domain Breakdown
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pie chart */}
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={70}
                dataKey="value"
                label={({ name, value }) => `${name} (${value})`}
              >
                {pieData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Domain health bars */}
        <div className="space-y-3">
          {domains.map(([domain, data], i) => (
            <div key={domain}>
              <NetworkHealthBar
                score={data.keptRate * 100}
                label={`${domain} (${data.total} promises)`}
              />
              {data.mtkp > 0 && (
                <p className="text-xs text-gray-400 mt-0.5">
                  MTKP: {Math.round(data.mtkp)} days
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
