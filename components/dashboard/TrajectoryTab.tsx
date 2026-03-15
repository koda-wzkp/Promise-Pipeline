"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Trajectory } from "@/lib/types/promise";

interface TrajectoryTabProps {
  trajectories: Trajectory[];
}

export function TrajectoryTab({ trajectories }: TrajectoryTabProps) {
  return (
    <div className="space-y-8">
      {trajectories.map((trajectory) => (
        <div key={trajectory.agentId} className="bg-white rounded-xl border p-6">
          <h3 className="font-serif font-semibold text-gray-900 mb-1">
            {trajectory.label}
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Emissions relative to 2019 baseline (100%)
          </p>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={trajectory.data}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="year"
                  tick={{ fontSize: 12 }}
                  stroke="#9ca3af"
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  stroke="#9ca3af"
                  domain={[0, 110]}
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid #e5e7eb",
                    fontSize: 13,
                  }}
                  formatter={(value: any) => [`${value}%`]}
                />
                <Legend />

                {/* Target line */}
                <Area
                  type="monotone"
                  dataKey="target"
                  stroke="#1a5f4a"
                  fill="#ecfdf5"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Target"
                  dot={false}
                />

                {/* Projected */}
                <Area
                  type="monotone"
                  dataKey="projected"
                  stroke="#b45309"
                  fill="#fffbeb"
                  strokeWidth={2}
                  strokeDasharray="3 3"
                  name="Projected"
                  dot={false}
                />

                {/* Actual */}
                <Area
                  type="monotone"
                  dataKey="actual"
                  stroke="#2563eb"
                  fill="#eff6ff"
                  strokeWidth={2}
                  name="Actual"
                  dot={{ fill: "#2563eb", r: 3 }}
                />

                {/* Key milestone lines */}
                <ReferenceLine x={2030} stroke="#6b7280" strokeDasharray="3 3" label={{ value: "2030", position: "top" }} />
                <ReferenceLine y={20} stroke="#dc2626" strokeDasharray="3 3" opacity={0.4} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 flex gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <div className="w-3 h-0.5 bg-blue-600" />
              <span>Actual emissions</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-0.5 bg-amber-600 border-dashed" style={{ borderTop: "1px dashed" }} />
              <span>Projected path</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-0.5 bg-green-800 border-dashed" style={{ borderTop: "1px dashed" }} />
              <span>Required target</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
