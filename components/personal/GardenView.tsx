"use client";

import { PersonalPromise } from "@/lib/types/personal";
import { PromiseStatus } from "@/lib/types/promise";
import { StatusBadge } from "@/components/promise/StatusBadge";

interface GardenViewProps {
  promises: PersonalPromise[];
  onUpdateStatus: (id: string, status: PromiseStatus, reflection?: string) => void;
}

const plantEmoji: Record<string, string[]> = {
  Work: ["🌱", "🌿", "🌳", "💀"],
  Health: ["🌱", "🌸", "🌺", "🥀"],
  Relationships: ["🌱", "🌷", "🌹", "🍂"],
  Creative: ["🌱", "🪴", "🎋", "🍂"],
  Financial: ["🌱", "☘️", "🌲", "🍂"],
};

function getPlantEmoji(domain: string, status: PromiseStatus): string {
  const plants = plantEmoji[domain] || ["🌱", "🌿", "🌳", "💀"];
  switch (status) {
    case "declared":
      return plants[0]; // seed
    case "degraded":
      return plants[1]; // growing but stressed
    case "verified":
      return plants[2]; // fully grown
    case "violated":
      return plants[3]; // dead/stump
    default:
      return plants[0];
  }
}

export function GardenView({ promises, onUpdateStatus }: GardenViewProps) {
  if (promises.length === 0) return null;

  // Group by domain
  const byDomain: Record<string, PersonalPromise[]> = {};
  for (const p of promises) {
    if (!byDomain[p.domain]) byDomain[p.domain] = [];
    byDomain[p.domain].push(p);
  }

  return (
    <div className="space-y-8">
      {Object.entries(byDomain).map(([domain, domainPromises]) => (
        <div key={domain}>
          <h3 className="font-serif font-semibold text-gray-800 mb-3">
            {domain} Grove
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {domainPromises.map((p) => (
              <GardenPlant
                key={p.id}
                promise={p}
                onUpdateStatus={onUpdateStatus}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function GardenPlant({
  promise,
  onUpdateStatus,
}: {
  promise: PersonalPromise;
  onUpdateStatus: (id: string, status: PromiseStatus, reflection?: string) => void;
}) {
  const emoji = getPlantEmoji(promise.domain, promise.status);
  const isActive =
    promise.status === "declared" || promise.status === "degraded";

  return (
    <div
      className={`bg-white rounded-xl border p-4 text-center transition-all hover:shadow-sm ${
        promise.status === "verified"
          ? "border-green-200 bg-green-50/50"
          : promise.status === "violated"
          ? "border-red-200 bg-red-50/30 opacity-70"
          : "border-gray-200"
      }`}
    >
      <div
        className={`text-4xl mb-2 ${
          isActive ? "animate-[pulse_4s_ease-in-out_infinite]" : ""
        }`}
      >
        {emoji}
      </div>
      <p className="text-xs text-gray-700 line-clamp-2 mb-2">{promise.body}</p>
      <StatusBadge status={promise.status} size="xs" />

      {isActive && (
        <div className="mt-3 flex gap-1 justify-center">
          <button
            onClick={() => onUpdateStatus(promise.id, "verified")}
            className="px-2 py-1 text-xs bg-green-50 text-green-700 rounded hover:bg-green-100"
          >
            Kept
          </button>
          <button
            onClick={() => onUpdateStatus(promise.id, "violated")}
            className="px-2 py-1 text-xs bg-red-50 text-red-700 rounded hover:bg-red-100"
          >
            Broken
          </button>
        </div>
      )}

      {promise.target && (
        <p className="text-xs text-gray-400 mt-1">
          By {new Date(promise.target).toLocaleDateString()}
        </p>
      )}
    </div>
  );
}
