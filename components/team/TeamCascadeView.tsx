"use client";

import { useState, useMemo } from "react";
import { TeamPromise, TeamMember } from "@/lib/types/team";
import { PromiseStatus } from "@/lib/types/promise";
import { CascadeResult } from "@/lib/types/simulation";
import { simulateCascade, calculateNetworkHealth } from "@/lib/simulation/cascade";
import { PromiseGraphView } from "@/components/network/PromiseGraph";
import { WhatIfPanel } from "@/components/simulation/WhatIfPanel";
import { CascadeResults } from "@/components/simulation/CascadeResults";

interface TeamCascadeViewProps {
  promises: TeamPromise[];
  members: TeamMember[];
}

export function TeamCascadeView({ promises, members }: TeamCascadeViewProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [cascadeResult, setCascadeResult] = useState<CascadeResult | null>(null);

  const selectedPromise = promises.find((p) => p.id === selectedId);

  const affectedIds = useMemo(() => {
    if (!cascadeResult) return new Set<string>();
    return new Set(cascadeResult.affectedPromises.map((a) => a.promiseId));
  }, [cascadeResult]);

  const handleSimulate = (promiseId: string, newStatus: PromiseStatus) => {
    const result = simulateCascade(promises, { promiseId, newStatus });
    setCascadeResult(result);
  };

  const handleReset = () => {
    setSelectedId(null);
    setCascadeResult(null);
  };

  if (promises.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border">
        <p className="text-gray-500 text-sm">
          Create team promises with dependencies to use the cascade simulator.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white rounded-xl border p-4">
        <h3 className="font-serif font-semibold text-gray-900 mb-3">
          Team Promise Network
        </h3>
        <div className="border rounded-lg bg-gray-50">
          <PromiseGraphView
            promises={promises}
            agents={members}
            width={600}
            height={400}
            selectedPromiseId={selectedId}
            affectedIds={affectedIds}
            onNodeClick={setSelectedId}
            showAgentNodes={true}
          />
        </div>
      </div>

      <div className="space-y-4">
        {selectedPromise && !cascadeResult && (
          <WhatIfPanel
            promise={selectedPromise}
            onSimulate={handleSimulate}
            onClose={handleReset}
          />
        )}

        {cascadeResult && (
          <CascadeResults
            result={cascadeResult}
            promises={promises}
            agents={members}
            onReset={handleReset}
          />
        )}

        {!selectedPromise && !cascadeResult && (
          <div className="bg-white rounded-xl border p-6 text-center text-sm text-gray-500">
            Click a promise node to run a What If simulation.
          </div>
        )}
      </div>
    </div>
  );
}
