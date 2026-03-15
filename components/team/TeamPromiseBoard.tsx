"use client";

import { TeamPromise, TeamMember } from "@/lib/types/team";
import { PromiseStatus } from "@/lib/types/promise";
import { StatusBadge } from "@/components/promise/StatusBadge";

interface TeamPromiseBoardProps {
  promises: TeamPromise[];
  members: TeamMember[];
  onUpdateStatus: (id: string, status: PromiseStatus) => void;
}

const columns: { status: PromiseStatus[]; label: string; color: string }[] = [
  { status: ["declared"], label: "Active / Declared", color: "#2563eb" },
  { status: ["degraded"], label: "At Risk / Degraded", color: "#b45309" },
  { status: ["verified"], label: "Kept / Verified", color: "#1a5f4a" },
  { status: ["violated"], label: "Broken / Violated", color: "#b91c1c" },
];

export function TeamPromiseBoard({
  promises,
  members,
  onUpdateStatus,
}: TeamPromiseBoardProps) {
  const memberMap = new Map(members.map((m) => [m.id, m]));

  if (promises.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border">
        <p className="text-gray-500 text-sm">
          No promises yet. Create one to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {columns.map((col) => {
        const colPromises = promises.filter((p) =>
          col.status.includes(p.status)
        );
        return (
          <div key={col.label} className="bg-gray-50 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: col.color }}
              />
              <h4 className="text-sm font-medium text-gray-700">
                {col.label}
              </h4>
              <span className="text-xs text-gray-400">
                {colPromises.length}
              </span>
            </div>

            <div className="space-y-2">
              {colPromises.map((p) => {
                const promiser = memberMap.get(p.promiser);
                return (
                  <div
                    key={p.id}
                    className="bg-white rounded-lg border p-3 text-sm"
                  >
                    <p className="text-gray-900 text-xs mb-2">{p.body}</p>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-medium text-gray-600">
                        {promiser?.name || p.promiser}
                      </span>
                      <span className={`text-xs px-1.5 py-0.5 rounded ${
                        p.origin === "imposed"
                          ? "bg-red-50 text-red-700"
                          : p.origin === "voluntary"
                          ? "bg-green-50 text-green-700"
                          : "bg-blue-50 text-blue-700"
                      }`}>
                        {p.origin}
                      </span>
                      {p.priority && p.priority !== "normal" && (
                        <span className={`text-xs px-1.5 py-0.5 rounded ${
                          p.priority === "critical"
                            ? "bg-red-100 text-red-800"
                            : p.priority === "high"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-gray-100 text-gray-600"
                        }`}>
                          {p.priority}
                        </span>
                      )}
                    </div>
                    {p.target && (
                      <p className="text-xs text-gray-400 mt-1">
                        Due: {new Date(p.target).toLocaleDateString()}
                      </p>
                    )}

                    {/* Status update buttons */}
                    {(p.status === "declared" || p.status === "degraded") && (
                      <div className="flex gap-1 mt-2">
                        <button
                          onClick={() => onUpdateStatus(p.id, "verified")}
                          className="px-2 py-0.5 text-xs bg-green-50 text-green-700 rounded hover:bg-green-100"
                        >
                          Kept
                        </button>
                        <button
                          onClick={() =>
                            onUpdateStatus(
                              p.id,
                              p.status === "declared" ? "degraded" : "violated"
                            )
                          }
                          className="px-2 py-0.5 text-xs bg-amber-50 text-amber-700 rounded hover:bg-amber-100"
                        >
                          {p.status === "declared" ? "At Risk" : "Broken"}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
