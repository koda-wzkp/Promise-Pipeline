"use client";

import { DashboardData } from "@/lib/types/promise";
import { NetworkHealthBar } from "@/components/simulation/NetworkHealthBar";
import { StatusBadge } from "@/components/promise/StatusBadge";
import { calculateNetworkHealth, identifyBottlenecks } from "@/lib/simulation/cascade";
import { statusBreakdown, domainHealthScores, computeGrade, calculateNetworkEntropy, identifyHighLeverageNodes } from "@/lib/simulation/scoring";

interface SummaryTabProps {
  data: DashboardData;
}

export function SummaryTab({ data }: SummaryTabProps) {
  const health = calculateNetworkHealth(data.promises);
  const breakdown = statusBreakdown(data.promises);
  const domainScores = domainHealthScores(data.promises);
  const bottlenecks = identifyBottlenecks(data.promises);
  const grade = computeGrade(health.overall);
  const entropy = calculateNetworkEntropy(data.promises);
  const certainty = Math.round(100 - entropy.overall);
  const leverageNodes = identifyHighLeverageNodes(data.promises);
  const domainEntropy = entropy.byDomain;

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
          <p className="text-sm text-gray-500 mb-1">Network Certainty</p>
          <p className="text-4xl font-bold" style={{ color: certainty >= 70 ? "#1a5f4a" : certainty >= 40 ? "#78350f" : "#991b1b" }}>
            {certainty}
          </p>
          <p className="text-xs text-gray-400 mt-1">out of 100</p>
          <div className="mt-3">
            <NetworkHealthBar score={certainty} showLabel={false} />
          </div>
        </div>

        <div className="bg-white rounded-xl border p-6 text-center">
          <p className="text-sm text-gray-500 mb-1">Overall Grade</p>
          <p className="text-4xl font-bold text-gray-900">{grade}</p>
          <p className="text-xs text-gray-400 mt-1">{data.promises.length} promises, {data.agents.length} agents</p>
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

      {/* Certainty warning */}
      {certainty < 50 && (
        <div className="bg-amber-50 rounded-xl border border-amber-200 p-4">
          <p className="text-sm text-amber-800">
            This network&apos;s assessment has high uncertainty — {entropy.byStatus.unverifiable + entropy.byStatus.declared} promises have no verification mechanism or remain untested.
          </p>
        </div>
      )}

      {/* Domain health */}
      <div className="bg-white rounded-xl border p-6">
        <h3 className="font-serif font-semibold text-gray-900 mb-4">Domain Health</h3>
        <div className="space-y-3">
          {Object.entries(domainScores)
            .sort((a, b) => b[1] - a[1])
            .map(([domain, score]) => {
              const domCertainty = Math.round(100 - (domainEntropy[domain] || 0));
              const hasVerificationGap = domCertainty < 30;
              return (
                <div key={domain}>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-sm font-medium text-gray-700 w-28">{domain}</span>
                    <span className="text-xs text-gray-500">Health: {Math.round(score)}</span>
                    <span className="text-xs" style={{ color: domCertainty >= 70 ? "#1a5f4a" : domCertainty >= 40 ? "#78350f" : "#991b1b" }}>
                      Certainty: {domCertainty}
                    </span>
                    {hasVerificationGap && (
                      <span className="text-xs text-amber-700 font-medium">⚠ Verification gap</span>
                    )}
                  </div>
                  <NetworkHealthBar score={score} showLabel={false} />
                </div>
              );
            })}
        </div>
      </div>

      {/* High-Leverage Promises */}
      {leverageNodes.length > 0 && (
        <div className="bg-white rounded-xl border p-6">
          <h3 className="font-serif font-semibold text-gray-900 mb-3">High-Leverage Promises</h3>
          <p className="text-sm text-gray-500 mb-3">
            Promises ranked by combined dependent count and structural bridge score (betweenness centrality).
          </p>
          <div className="space-y-2">
            {leverageNodes.slice(0, 5).map((node) => {
              const promise = data.promises.find((p) => p.id === node.promiseId);
              if (!promise) return null;
              const medianDeps = leverageNodes.length > 0
                ? leverageNodes[Math.floor(leverageNodes.length / 2)].dependentCount
                : 0;
              const isStructuralBridge = node.betweenness > 0.7 && node.dependentCount < medianDeps;
              return (
                <div key={node.promiseId} className="flex items-center gap-2 text-sm">
                  <span className="font-mono text-xs text-gray-500 w-10">{node.promiseId}</span>
                  <StatusBadge status={promise.status} size="xs" />
                  <span className="text-gray-500 text-xs whitespace-nowrap">
                    {node.dependentCount} dep{node.dependentCount !== 1 ? "s" : ""}
                  </span>
                  <span className="text-xs text-gray-400">|</span>
                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    Bridge: {node.betweenness.toFixed(2)}
                  </span>
                  {isStructuralBridge && (
                    <span className="text-xs text-amber-700 font-medium whitespace-nowrap">← structural bridge</span>
                  )}
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
