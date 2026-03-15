"use client";

import { TeamPromise, TeamMember } from "@/lib/types/team";
import { NetworkHealthBar } from "@/components/simulation/NetworkHealthBar";
import { calculateNetworkHealth } from "@/lib/simulation/cascade";
import { statusBreakdown, domainHealthScores } from "@/lib/simulation/scoring";

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

  const healthColor =
    keptRate >= 0.8
      ? "text-green-700"
      : keptRate >= 0.6
      ? "text-amber-700"
      : "text-red-700";

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
