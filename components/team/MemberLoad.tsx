"use client";

import { TeamPromise, TeamMember } from "@/lib/types/team";
import { PromiseStatus } from "@/lib/types/promise";

interface MemberLoadProps {
  promises: TeamPromise[];
  members: TeamMember[];
}

export function MemberLoad({ promises, members }: MemberLoadProps) {
  const memberStats = members.map((member) => {
    const memberPromises = promises.filter((p) => p.promiser === member.id);
    const active = memberPromises.filter(
      (p) => p.status === "declared" || p.status === "degraded"
    );
    const completed = memberPromises.filter(
      (p) => p.status === "verified" || p.status === "violated"
    );
    const kept = memberPromises.filter((p) => p.status === "verified");
    const keptRate = completed.length > 0 ? kept.length / completed.length : 0;

    // Load score: active promises weighted by priority
    const loadScore = active.reduce((sum, p) => {
      const weight =
        p.priority === "critical"
          ? 3
          : p.priority === "high"
          ? 2
          : p.priority === "low"
          ? 0.5
          : 1;
      return sum + weight;
    }, 0);

    const maxLoad = 10; // normalized
    const loadPercent = Math.min(100, (loadScore / maxLoad) * 100);

    return {
      member,
      total: memberPromises.length,
      active: active.length,
      keptRate,
      loadScore,
      loadPercent,
      atRisk: active.filter((p) => p.status === "degraded").length,
    };
  });

  if (members.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border">
        <p className="text-gray-500 text-sm">No team members yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {memberStats.map(({ member, total, active, keptRate, loadPercent, atRisk }) => (
        <div key={member.id} className="bg-white rounded-xl border p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="font-bold text-sm text-blue-700">
                {member.short}
              </span>
            </div>
            <div>
              <p className="font-medium text-gray-900">{member.name}</p>
              {member.role && (
                <p className="text-xs text-gray-500">{member.role}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-3 text-center">
            <div>
              <p className="text-lg font-bold text-gray-900">{active}</p>
              <p className="text-xs text-gray-500">Active</p>
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">{total}</p>
              <p className="text-xs text-gray-500">Total</p>
            </div>
            <div>
              <p className={`text-lg font-bold ${
                keptRate >= 0.8 ? "text-green-700" : keptRate >= 0.6 ? "text-amber-700" : "text-red-700"
              }`}>
                {Math.round(keptRate * 100)}%
              </p>
              <p className="text-xs text-gray-500">Kept</p>
            </div>
          </div>

          {/* Load bar */}
          <div>
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Load</span>
              <span
                className={
                  loadPercent > 80
                    ? "text-red-600 font-medium"
                    : loadPercent > 60
                    ? "text-amber-600"
                    : "text-green-600"
                }
              >
                {Math.round(loadPercent)}%
              </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${loadPercent}%`,
                  backgroundColor:
                    loadPercent > 80
                      ? "#b91c1c"
                      : loadPercent > 60
                      ? "#b45309"
                      : "#1a5f4a",
                }}
              />
            </div>
          </div>

          {atRisk > 0 && (
            <p className="text-xs text-amber-700 mt-2">
              {atRisk} promise{atRisk !== 1 ? "s" : ""} at risk
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
