"use client";

import { useState } from "react";
import { Promise as PromiseType, Agent, PromiseStatus } from "@/lib/types/promise";
import { PromiseList } from "@/components/promise/PromiseList";
import { PromiseDetail } from "@/components/promise/PromiseDetail";

interface PromisesTabProps {
  promises: PromiseType[];
  agents: Agent[];
  onWhatIf?: (promiseId: string) => void;
  affectedIds?: Set<string>;
  affectedMap?: Map<string, number>;
}

export function PromisesTab({
  promises,
  agents,
  onWhatIf,
  affectedIds,
  affectedMap,
}: PromisesTabProps) {
  const [selectedPromiseId, setSelectedPromiseId] = useState<string | null>(null);
  const selectedPromise = promises.find((p) => p.id === selectedPromiseId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className={selectedPromise ? "lg:col-span-2" : "lg:col-span-3"}>
        <PromiseList
          promises={promises}
          agents={agents}
          onWhatIf={onWhatIf}
          affectedIds={affectedIds}
          affectedMap={affectedMap}
        />
      </div>

      {selectedPromise && (
        <div className="lg:col-span-1">
          <div className="sticky top-20">
            <PromiseDetail
              promise={selectedPromise}
              allPromises={promises}
              agents={agents}
              onClose={() => setSelectedPromiseId(null)}
              onWhatIf={onWhatIf}
            />
          </div>
        </div>
      )}
    </div>
  );
}
