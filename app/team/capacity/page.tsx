"use client";

import { useState, useEffect, useMemo } from "react";
import { TeamMember, TeamPromise, CapacityResult } from "@/lib/types/team";
import { PromiseOrigin } from "@/lib/types/promise";
import { calculateNetworkHealth } from "@/lib/simulation/cascade";
import { calculateUtilization } from "@/lib/simulation/capacity";

const STORAGE_KEY = "promise-pipeline-team";

function loadTeamData(): { members: TeamMember[]; promises: TeamPromise[] } {
  if (typeof window === "undefined") return { members: [], promises: [] };
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return { members: [], promises: [] };
    const data = JSON.parse(stored);
    return { members: data.members || [], promises: data.promises || [] };
  } catch {
    return { members: [], promises: [] };
  }
}

export default function CapacityPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [promises, setPromises] = useState<TeamPromise[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Form state
  const [body, setBody] = useState("");
  const [assignee, setAssignee] = useState("");
  const [target, setTarget] = useState("");
  const [estimatedHours, setEstimatedHours] = useState("");
  const [dependsOn, setDependsOn] = useState<string[]>([]);
  const [result, setResult] = useState<CapacityResult | null>(null);

  useEffect(() => {
    const data = loadTeamData();
    setMembers(data.members);
    setPromises(data.promises);
    if (data.members.length > 0) setAssignee(data.members[0].id);
    setLoaded(true);
  }, []);

  const simulate = () => {
    if (!body.trim() || !assignee) return;

    const activeForMember = promises.filter(
      (p) =>
        p.promiser === assignee &&
        (p.status === "declared" || p.status === "degraded")
    );

    const currentLoad = activeForMember.reduce((sum, p) => {
      const weight =
        p.priority === "critical" ? 3 : p.priority === "high" ? 2 : p.priority === "low" ? 0.5 : 1;
      return sum + weight;
    }, 0);

    const newLoad = currentLoad + 1;
    const maxLoad = 10;
    const newLoadPercent = Math.min(100, (newLoad / maxLoad) * 100);

    // Check which existing promises are at risk
    const atRiskPromises = activeForMember
      .filter((p) => p.status === "declared" && newLoadPercent > 80)
      .map((p) => p.id);

    const currentHealth = calculateNetworkHealth(promises);

    // Add hypothetical promise and recalculate
    const hypothetical: TeamPromise = {
      id: "HYPOTHETICAL",
      isTeam: true,
      promiser: assignee,
      promisee: "team",
      body: body.trim(),
      domain: "General",
      status: "declared",
      note: "",
      verification: { method: "self-report" },
      depends_on: dependsOn,
      polarity: "give",
      origin: "negotiated" as PromiseOrigin,
      createdAt: new Date().toISOString(),
      target: target || undefined,
      estimatedHours: estimatedHours ? parseFloat(estimatedHours) : undefined,
    };

    const newHealth = calculateNetworkHealth([...promises, hypothetical]);
    const healthImpact = newHealth.overall - currentHealth.overall;

    const canAbsorb = newLoadPercent < 80 && atRiskPromises.length === 0;

    const recommendation = canAbsorb
      ? `This team member can absorb this commitment. Current load: ${Math.round(newLoadPercent)}%.`
      : newLoadPercent >= 80
      ? `Warning: This puts ${members.find((m) => m.id === assignee)?.name || assignee} at ${Math.round(newLoadPercent)}% load. ${atRiskPromises.length} existing promise${atRiskPromises.length !== 1 ? "s" : ""} become at risk.`
      : `This commitment may impact ${atRiskPromises.length} existing promise${atRiskPromises.length !== 1 ? "s" : ""}.`;

    // Utilization impact
    const utilBefore = calculateUtilization(promises, members);
    const utilAfter = calculateUtilization([...promises, hypothetical], members);
    const memberUtilBefore = utilBefore.byMember[assignee]?.utilization || 0;
    const memberUtilAfter = utilAfter.byMember[assignee]?.utilization || 0;

    setResult({
      canAbsorb,
      newMemberLoad: newLoadPercent,
      atRiskPromises,
      healthImpact,
      recommendation,
      utilizationImpact: {
        before: utilBefore.teamUtilization,
        after: utilAfter.teamUtilization,
        memberBefore: memberUtilBefore,
        memberAfter: memberUtilAfter,
      },
    });
  };

  if (!loaded) return null;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#faf9f6" }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="font-serif text-2xl font-bold text-gray-900 mb-2">
          Capacity Simulator
        </h1>
        <p className="text-gray-500 text-sm mb-6">
          Can the team take this on? Enter a hypothetical new commitment to see
          the impact.
        </p>

        {members.length === 0 ? (
          <div className="bg-white rounded-xl border p-8 text-center text-gray-500 text-sm">
            Add team members first on the team dashboard.
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border p-6 space-y-4">
              <div>
                <label htmlFor="cap-body" className="block text-sm font-medium text-gray-700 mb-1">
                  What&apos;s the new commitment?
                </label>
                <textarea
                  id="cap-body"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm resize-none"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="cap-assignee" className="block text-sm font-medium text-gray-700 mb-1">
                    Assign to
                  </label>
                  <select
                    id="cap-assignee"
                    value={assignee}
                    onChange={(e) => setAssignee(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm bg-white"
                  >
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="cap-target" className="block text-sm font-medium text-gray-700 mb-1">
                    Deadline
                  </label>
                  <input
                    id="cap-target"
                    type="date"
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <button
                onClick={simulate}
                disabled={!body.trim()}
                className="w-full py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Simulate Impact
              </button>
            </div>

            {result && (
              <div className={`rounded-xl border p-6 ${
                result.canAbsorb ? "bg-green-50 border-green-200" : "bg-amber-50 border-amber-200"
              }`}>
                <h3 className="font-serif font-semibold text-gray-900 mb-2">
                  {result.canAbsorb ? "Capacity Available" : "Capacity Warning"}
                </h3>
                <p className="text-sm text-gray-700 mb-4">{result.recommendation}</p>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="text-xl font-bold">{Math.round(result.newMemberLoad)}%</p>
                    <p className="text-xs text-gray-500">New load</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold">{result.atRiskPromises.length}</p>
                    <p className="text-xs text-gray-500">At risk</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold">
                      {result.healthImpact > 0 ? "+" : ""}
                      {Math.round(result.healthImpact)}
                    </p>
                    <p className="text-xs text-gray-500">Health impact</p>
                  </div>
                </div>

                {result.utilizationImpact && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500 font-medium mb-2">Utilization Impact</p>
                    <div className="grid grid-cols-2 gap-3 text-center text-xs">
                      <div>
                        <p className="text-sm font-bold text-gray-700">
                          {Math.round(result.utilizationImpact.before * 100)}% → {Math.round(result.utilizationImpact.after * 100)}%
                        </p>
                        <p className="text-gray-500">Team utilization</p>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-700">
                          {Math.round(result.utilizationImpact.memberBefore * 100)}% → {Math.round(result.utilizationImpact.memberAfter * 100)}%
                        </p>
                        <p className="text-gray-500">Assignee utilization</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
