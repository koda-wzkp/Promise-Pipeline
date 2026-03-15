"use client";

import { TeamPromise, TeamMember } from "@/lib/types/team";
import { NetworkHealthBar } from "@/components/simulation/NetworkHealthBar";
import { calculateNetworkHealth } from "@/lib/simulation/cascade";
import { statusBreakdown, domainHealthScores } from "@/lib/simulation/scoring";
import { calculateUtilization } from "@/lib/simulation/capacity";

interface TeamHealthBarometerProps {
  promises: TeamPromise[];
  members: TeamMember[];
}

export function TeamHealthBarometer({
  promises,
  members,
}: TeamHealthBarometerProps) {
  const health = calculateNetworkHealth(promises);
  const breakdown = statusBreakdown(promises);
  const domainScores = domainHealthScores(promises);

  const completedPromises = promises.filter(
    (p) => p.status === "verified" || p.status === "violated"
  );
  const keptRate =
    completedPromises.length > 0
      ? promises.filter((p) => p.status === "verified").length /
        completedPromises.length
      : 0;

  // MTKP
  const keptWithDates = promises.filter(
    (p) => p.status === "verified" && p.createdAt
  );
  const mtkp =
    keptWithDates.length > 0
      ? keptWithDates.reduce((sum, p) => {
          const days =
            (Date.now() - new Date(p.createdAt).getTime()) /
            (1000 * 60 * 60 * 24);
          return sum + days;
        }, 0) / keptWithDates.length
      : 0;

  const utilization = calculateUtilization(promises, members);
  const utilizationPct = Math.round(utilization.teamUtilization * 100);

  const healthColor =
    keptRate >= 0.8
      ? "text-green-700"
      : keptRate >= 0.6
      ? "text-amber-700"
      : "text-red-700";

  const utilizationColor =
    utilizationPct < 70
      ? "#1a5f4a"
      : utilizationPct <= 85
      ? "#78350f"
      : "#991b1b";

  const utilizationLabel =
    utilizationPct < 70
      ? "Healthy capacity"
      : utilizationPct <= 85
      ? "Approaching capacity"
      : utilizationPct <= 100
      ? "At capacity"
      : "Overloaded";

  return (
    <div className="space-y-6">
      {/* Main barometer */}
      <div className="bg-white rounded-xl border p-6">
        <h3 className="font-serif font-semibold text-gray-900 mb-4">
          Team Health Barometer
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <p className={`text-3xl font-bold ${healthColor}`}>
              {Math.round(keptRate * 100)}%
            </p>
            <p className="text-xs text-gray-500">Fulfillment rate</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-900">
              {Math.round(health.overall)}
            </p>
            <p className="text-xs text-gray-500">Network health</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-700">
              {promises.filter((p) => p.status === "declared" || p.status === "degraded").length}
            </p>
            <p className="text-xs text-gray-500">Active promises</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-700">
              {mtkp > 0 ? `${Math.round(mtkp)}d` : "—"}
            </p>
            <p className="text-xs text-gray-500">Avg MTKP</p>
          </div>
        </div>

        <NetworkHealthBar score={health.overall} label="Overall Health" />
      </div>

      {/* Utilization */}
      <div className="bg-white rounded-xl border p-6">
        <h3 className="font-serif font-semibold text-gray-900 mb-4">
          Team Utilization
        </h3>
        <div className="flex items-center gap-4 mb-3">
          <p className="text-3xl font-bold" style={{ color: utilizationColor }}>
            {utilizationPct}%
          </p>
          <p className="text-sm" style={{ color: utilizationColor }}>
            {utilizationLabel}
          </p>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-3">
          <div
            className={`h-full rounded-full transition-all${utilizationPct > 100 ? " animate-pulse" : ""}`}
            style={{
              width: `${Math.min(utilizationPct, 100)}%`,
              backgroundColor: utilizationColor,
            }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          <span>Arrival: {utilization.arrivalRate.toFixed(1)} promises/week</span>
          <span>Completion: {utilization.completionRate.toFixed(1)} promises/week</span>
          <span>{utilization.timeToOverload === null ? "Stable" : utilization.timeToOverload === 0 ? "Overloaded" : `~${utilization.timeToOverload}wk to overload`}</span>
        </div>
        {utilization.timeToOverload !== null && utilization.timeToOverload > 0 && (
          <p className="text-xs text-red-700 mt-2">
            At current rates, this team will be unable to keep up in ~{utilization.timeToOverload} weeks.
          </p>
        )}
      </div>

      {/* Domain breakdown */}
      {Object.keys(domainScores).length > 0 && (
        <div className="bg-white rounded-xl border p-6">
          <h3 className="font-serif font-semibold text-gray-900 mb-4">
            Health by Domain
          </h3>
          <div className="space-y-3">
            {Object.entries(domainScores).map(([domain, score]) => (
              <NetworkHealthBar key={domain} score={score} label={domain} />
            ))}
          </div>
        </div>
      )}

      {/* Status counts */}
      <div className="bg-white rounded-xl border p-6">
        <h3 className="font-serif font-semibold text-gray-900 mb-3">
          Status Distribution
        </h3>
        <div className="grid grid-cols-5 gap-2 text-center">
          {Object.entries(breakdown).map(([status, count]) => (
            <div key={status} className="p-2">
              <p className="text-xl font-bold text-gray-900">{count}</p>
              <p className="text-xs text-gray-500 capitalize">{status}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
