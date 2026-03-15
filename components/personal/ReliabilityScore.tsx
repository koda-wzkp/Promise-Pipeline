"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { PersonalStats } from "@/lib/types/personal";

interface ReliabilityScoreProps {
  stats: PersonalStats;
}

export function ReliabilityScore({ stats }: ReliabilityScoreProps) {
  return (
    <div className="bg-white rounded-xl border p-6">
      <h3 className="font-serif font-semibold text-gray-900 mb-4">
        Reliability Score
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <p className="text-3xl font-bold text-green-700">
            {Math.round(stats.keptRate * 100)}%
          </p>
          <p className="text-xs text-gray-500">Promise-keeping rate</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold text-gray-900">
            {stats.totalPromises}
          </p>
          <p className="text-xs text-gray-500">Total promises</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold text-blue-600">
            {stats.activePromises}
          </p>
          <p className="text-xs text-gray-500">Active</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold text-gray-700">
            {stats.mtkp > 0 ? `${Math.round(stats.mtkp)}d` : "—"}
          </p>
          <p className="text-xs text-gray-500">MTKP (days)</p>
        </div>
      </div>

      {stats.trend.length > 0 && stats.trend.some((t) => t.keptRate > 0) && (
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={stats.trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11 }}
                stroke="#9ca3af"
              />
              <YAxis
                domain={[0, 1]}
                tickFormatter={(v) => `${Math.round(v * 100)}%`}
                tick={{ fontSize: 11 }}
                stroke="#9ca3af"
              />
              <Tooltip
                formatter={(value: any) => [
                  `${Math.round(Number(value) * 100)}%`,
                  "Kept Rate",
                ]}
              />
              <Line
                type="monotone"
                dataKey="keptRate"
                stroke="#1a5f4a"
                strokeWidth={2}
                dot={{ fill: "#1a5f4a", r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
