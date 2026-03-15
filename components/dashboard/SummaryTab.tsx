"use client";

import { DashboardData } from "@/lib/types/promise";
import { NetworkHealthBar } from "@/components/simulation/NetworkHealthBar";
import { StatusBadge } from "@/components/promise/StatusBadge";
import { calculateNetworkHealth, identifyBottlenecks } from "@/lib/simulation/cascade";
import { statusBreakdown, domainHealthScores, computeGrade } from "@/lib/simulation/scoring";

interface SummaryTabProps {
  data: DashboardData;
}

export function SummaryTab({ data }: SummaryTabProps) {
  const health = calculateNetworkHealth(data.promises);
  const breakdown = statusBreakdown(data.promises);
  const domainScores = domainHealthScores(data.promises);
  const bottlenecks = identifyBottlenecks(data.promises);
  const grade = computeGrade(health.overall);

  return (
    <div className="space-y-6">
      {/* Top metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border p-6 text-center">
          <p className="text-sm text-gray-500 mb-1">Network Health</p>
          <p className="text-4xl font-bold" style={{ color: health.overall >= 60 ? "#1a5f4a" : health.overall >= 40 ? "#b45309" : "#b91c1c" }}>
            {Math.round(health.overall)}
          </p>
          <p className="text-xs text-gray-400 mt-1">out of 100</p>
          <div className="mt-3">
            <NetworkHealthBar score={health.overall} showLabel={false} />
          </div>
        </div>

        <div className="bg-white rounded-xl border p-6 text-center">
          <p className="text-sm text-gray-500 mb-1">Overall Grade</p>
          <p className="text-4xl font-bold text-gray-900">{grade}</p>
          <p className="text-xs text-gray-400 mt-2">{data.promises.length} promises tracked</p>
        </div>

        <div className="bg-white rounded-xl border p-6 text-center">
          <p className="text-sm text-gray-500 mb-1">Agents</p>
          <p className="text-4xl font-bold text-gray-900">{data.agents.length}</p>
          <p className="text-xs text-gray-400 mt-2">{Object.keys(domainScores).length} domains</p>
        </div>
      </div>

      {/* Status breakdown */}
      <div className="bg-white rounded-xl border p-6">
        <h3 className="font-serif font-semibold text-gray-900 mb-4">Status Breakdown</h3>
        <div className="flex flex-wrap gap-4">
          {(Object.entries(breakdown) as [string, number][]).map(([status, count]) => (
            <div key={status} className="flex items-center gap-2">
              <StatusBadge status={status as any} size="sm" />
              <span className="text-sm font-bold text-gray-900">{count}</span>
            </div>
          ))}
        </div>
        {/* Visual bar */}
        <div className="mt-4 flex h-4 rounded-full overflow-hidden">
          {(Object.entries(breakdown) as [string, number][]).map(([status, count]) => {
            if (count === 0) return null;
            const colors: Record<string, string> = {
              verified: "#1a5f4a",
              declared: "#2563eb",
              degraded: "#b45309",
              violated: "#b91c1c",
              unverifiable: "#7c3aed",
            };
            return (
              <div
                key={status}
                className="h-full"
                style={{
                  width: `${(count / data.promises.length) * 100}%`,
                  backgroundColor: colors[status] || "#6b7280",
                }}
                title={`${status}: ${count}`}
              />
            );
          })}
        </div>
      </div>

      {/* Domain health */}
      <div className="bg-white rounded-xl border p-6">
        <h3 className="font-serif font-semibold text-gray-900 mb-4">Domain Health</h3>
        <div className="space-y-3">
          {Object.entries(domainScores)
            .sort((a, b) => b[1] - a[1])
            .map(([domain, score]) => (
              <NetworkHealthBar key={domain} score={score} label={domain} />
            ))}
        </div>
      </div>

      {/* Bottlenecks */}
      {bottlenecks.length > 0 && (
        <div className="bg-white rounded-xl border p-6">
          <h3 className="font-serif font-semibold text-gray-900 mb-3">Bottleneck Promises</h3>
          <p className="text-sm text-gray-500 mb-3">
            Promises with the most downstream dependents — highest leverage for intervention.
          </p>
          <div className="space-y-2">
            {bottlenecks.slice(0, 5).map((id) => {
              const promise = data.promises.find((p) => p.id === id);
              if (!promise) return null;
              return (
                <div key={id} className="flex items-center gap-2 text-sm">
                  <span className="font-mono text-xs text-gray-500">{id}</span>
                  <StatusBadge status={promise.status} size="xs" />
                  <span className="text-gray-700 truncate">{promise.body}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Grade explanation */}
      <div className="bg-gray-50 rounded-xl border p-6">
        <h3 className="font-serif font-semibold text-gray-900 mb-2">Assessment</h3>
        <p className="text-sm text-gray-700 leading-relaxed">{data.gradeExplanation}</p>
      </div>
    </div>
  );
}
