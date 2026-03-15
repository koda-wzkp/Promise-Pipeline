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
import { EntropyTimePoint } from "@/lib/simulation/scoring";

interface TimelineTabProps {
  timePoints: EntropyTimePoint[];
}

export function TimelineTab({ timePoints }: TimelineTabProps) {
  const chartData = timePoints.map((tp) => ({
    date: tp.date.slice(0, 7), // YYYY-MM for axis
    label: tp.label,
    Health: Math.round(tp.healthScore),
    Entropy: Math.round(tp.entropy),
    Certainty: Math.round(100 - tp.entropy),
    "Verification Coverage": Math.round(tp.verificationCoverage),
  }));

  // Find the crossing point (where health dips below certainty)
  let crossingLabel: string | undefined;
  for (let i = 1; i < chartData.length; i++) {
    const prev = chartData[i - 1];
    const curr = chartData[i];
    if (prev.Health >= prev.Certainty && curr.Health < curr.Certainty) {
      crossingLabel = curr.label;
    }
  }

  return (
    <div className="space-y-6">
      {/* Health vs Entropy chart */}
      <div className="bg-white rounded-xl border p-6">
        <h3 className="font-serif font-semibold text-gray-900 mb-1">
          Network State Over Time
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Health measures promise compliance. Certainty measures whether you can verify compliance. Both matter — and they fail independently.
        </p>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11 }}
                stroke="#9ca3af"
              />
              <YAxis
                tick={{ fontSize: 12 }}
                stroke="#9ca3af"
                domain={[0, 100]}
                tickFormatter={(v) => `${v}`}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 8,
                  border: "1px solid #e5e7eb",
                  fontSize: 13,
                }}
                labelFormatter={(label) => {
                  const point = chartData.find((d) => d.date === label);
                  return point?.label ? `${point.label} (${label})` : label;
                }}
              />
              <Legend />

              {/* Reference lines for events */}
              {timePoints
                .filter((tp) => tp.label)
                .map((tp) => (
                  <ReferenceLine
                    key={tp.date}
                    x={tp.date.slice(0, 7)}
                    stroke="#d1d5db"
                    strokeDasharray="3 3"
                  />
                ))}

              {/* Health */}
              <Area
                type="monotone"
                dataKey="Health"
                stroke="#1a5f4a"
                fill="#ecfdf5"
                strokeWidth={2}
                name="Health"
                dot={{ fill: "#1a5f4a", r: 3 }}
              />

              {/* Certainty (100 - entropy) */}
              <Area
                type="monotone"
                dataKey="Certainty"
                stroke="#7c3aed"
                fill="#f5f3ff"
                strokeWidth={2}
                name="Certainty"
                dot={{ fill: "#7c3aed", r: 3 }}
              />

              {/* Verification Coverage */}
              <Area
                type="monotone"
                dataKey="Verification Coverage"
                stroke="#2563eb"
                fill="none"
                strokeWidth={1.5}
                strokeDasharray="5 5"
                name="Verification Coverage"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <div className="w-3 h-0.5 bg-green-800" />
            <span>Health (0-100)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-0.5 bg-purple-600" />
            <span>Certainty (100 - Entropy)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-0.5 bg-blue-600" style={{ borderTop: "1px dashed" }} />
            <span>Verification Coverage %</span>
          </div>
        </div>
      </div>

      {/* Event timeline */}
      <div className="bg-white rounded-xl border p-6">
        <h3 className="font-serif font-semibold text-gray-900 mb-4">
          Key Events
        </h3>
        <div className="space-y-3">
          {timePoints
            .filter((tp) => tp.label)
            .map((tp) => (
              <div key={tp.date} className="flex gap-4 items-start">
                <div className="text-xs font-mono text-gray-400 w-24 shrink-0">
                  {tp.date}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{tp.label}</p>
                  <div className="flex gap-3 mt-1 text-xs text-gray-500">
                    <span>
                      Health:{" "}
                      <span
                        style={{
                          color:
                            tp.healthScore >= 60
                              ? "#1a5f4a"
                              : tp.healthScore >= 30
                              ? "#b45309"
                              : "#b91c1c",
                        }}
                      >
                        {Math.round(tp.healthScore)}
                      </span>
                    </span>
                    <span>
                      Certainty:{" "}
                      <span
                        style={{
                          color:
                            100 - tp.entropy >= 60
                              ? "#1a5f4a"
                              : 100 - tp.entropy >= 30
                              ? "#78350f"
                              : "#991b1b",
                        }}
                      >
                        {Math.round(100 - tp.entropy)}
                      </span>
                    </span>
                    <span>
                      Verification: {Math.round(tp.verificationCoverage)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {crossingLabel && (
        <div className="bg-amber-50 rounded-xl border border-amber-200 p-4">
          <p className="text-sm text-amber-800">
            Health and Certainty lines crossed at <strong>{crossingLabel}</strong> — the moment this network became both unhealthy and unknowable.
          </p>
        </div>
      )}
    </div>
  );
}
