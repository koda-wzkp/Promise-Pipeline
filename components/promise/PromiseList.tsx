"use client";

import { useState, useMemo } from "react";
import { Promise as PromiseType, Agent, PromiseStatus } from "@/lib/types/promise";
import { PromiseCard } from "./PromiseCard";
import { DomainFilter } from "./DomainFilter";

interface PromiseListProps {
  promises: PromiseType[];
  agents: Agent[];
  onWhatIf?: (promiseId: string) => void;
  affectedIds?: Set<string>;
  affectedMap?: Map<string, number>;
}

export function PromiseList({
  promises,
  agents,
  onWhatIf,
  affectedIds,
  affectedMap,
}: PromiseListProps) {
  const [domainFilter, setDomainFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<PromiseStatus | null>(null);
  const [agentFilter, setAgentFilter] = useState<string | null>(null);

  const domains = useMemo(
    () => Array.from(new Set(promises.map((p) => p.domain))),
    [promises]
  );

  const agentIds = useMemo(
    () => Array.from(new Set(promises.map((p) => p.promiser))),
    [promises]
  );

  const filtered = useMemo(() => {
    return promises.filter((p) => {
      if (domainFilter && p.domain !== domainFilter) return false;
      if (statusFilter && p.status !== statusFilter) return false;
      if (agentFilter && p.promiser !== agentFilter) return false;
      return true;
    });
  }, [promises, domainFilter, statusFilter, agentFilter]);

  const statuses: PromiseStatus[] = [
    "verified",
    "declared",
    "degraded",
    "violated",
    "unverifiable",
  ];

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="space-y-3">
        <DomainFilter domains={domains} selected={domainFilter} onSelect={setDomainFilter} />

        <div className="flex flex-wrap gap-2">
          <label className="sr-only" htmlFor="status-filter">Filter by status</label>
          <select
            id="status-filter"
            className="text-sm border rounded-lg px-3 py-1.5 bg-white"
            value={statusFilter || ""}
            onChange={(e) =>
              setStatusFilter(
                (e.target.value as PromiseStatus) || null
              )
            }
          >
            <option value="">All statuses</option>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>

          <label className="sr-only" htmlFor="agent-filter">Filter by agent</label>
          <select
            id="agent-filter"
            className="text-sm border rounded-lg px-3 py-1.5 bg-white"
            value={agentFilter || ""}
            onChange={(e) => setAgentFilter(e.target.value || null)}
          >
            <option value="">All agents</option>
            {agentIds.map((id) => {
              const agent = agents.find((a) => a.id === id);
              return (
                <option key={id} value={id}>
                  {agent?.name || id}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-gray-500">
        {filtered.length} of {promises.length} promises
      </p>

      {/* Promise cards */}
      <div className="space-y-3">
        {filtered.map((p) => (
          <PromiseCard
            key={p.id}
            promise={p}
            agents={agents}
            onWhatIf={onWhatIf}
            isAffected={affectedIds?.has(p.id)}
            cascadeDepth={affectedMap?.get(p.id)}
          />
        ))}
      </div>
    </div>
  );
}
