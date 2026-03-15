"use client";

import { Promise as PromiseType, Agent } from "@/lib/types/promise";
import { StatusBadge } from "./StatusBadge";
import { getDomainColor } from "@/lib/utils/colors";
import { getDependents, getDependencies } from "@/lib/simulation/graph";

interface PromiseDetailProps {
  promise: PromiseType;
  allPromises: PromiseType[];
  agents: Agent[];
  onClose: () => void;
  onWhatIf?: (promiseId: string) => void;
}

export function PromiseDetail({
  promise,
  allPromises,
  agents,
  onClose,
  onWhatIf,
}: PromiseDetailProps) {
  const promiser = agents.find((a) => a.id === promise.promiser);
  const promisee = agents.find((a) => a.id === promise.promisee);
  const dependents = getDependents(promise.id, allPromises);
  const dependencies = getDependencies(promise.id, allPromises);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="font-mono text-sm text-gray-500">{promise.id}</span>
            {promise.ref && (
              <span className="font-mono text-sm text-gray-400">{promise.ref}</span>
            )}
            <StatusBadge status={promise.status} size="md" />
          </div>
          <h3 className="text-lg font-serif font-semibold text-gray-900">
            {promise.body}
          </h3>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 p-1"
          aria-label="Close detail view"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div>
          <span className="text-gray-500">Promiser</span>
          <p className="font-medium">{promiser?.name || promise.promiser}</p>
        </div>
        <div>
          <span className="text-gray-500">Promisee</span>
          <p className="font-medium">{promisee?.name || promise.promisee}</p>
        </div>
        <div>
          <span className="text-gray-500">Domain</span>
          <p className="font-medium" style={{ color: getDomainColor(promise.domain) }}>
            {promise.domain}
          </p>
        </div>
        <div>
          <span className="text-gray-500">Verification</span>
          <p className="font-medium">{promise.verification.method}</p>
          {promise.verification.source && (
            <p className="text-xs text-gray-400">{promise.verification.source}</p>
          )}
        </div>
        {promise.target && (
          <div>
            <span className="text-gray-500">Target</span>
            <p className="font-medium">{promise.target}</p>
          </div>
        )}
        {promise.polarity && (
          <div>
            <span className="text-gray-500">Polarity</span>
            <p className="font-medium">
              {promise.polarity === "give" ? "+give" : "-accept"}
            </p>
          </div>
        )}
        {promise.origin && (
          <div>
            <span className="text-gray-500">Origin</span>
            <p className="font-medium capitalize">{promise.origin}</p>
          </div>
        )}
        {promise.violationType && (
          <div>
            <span className="text-gray-500">Violation Type</span>
            <p className="font-medium text-red-700 capitalize">{promise.violationType}</p>
          </div>
        )}
      </div>

      {/* Progress */}
      {promise.progress !== undefined && promise.required !== undefined && (
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-500 mb-1">
            <span>{promise.progress}% progress</span>
            <span>{promise.required}% required</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.min(100, (promise.progress / promise.required) * 100)}%`,
                backgroundColor: promise.progress >= promise.required ? "#1a5f4a" : "#b45309",
              }}
            />
          </div>
        </div>
      )}

      {/* Verification Commitment */}
      {promise.verification.commitment && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
          <div className="flex items-center gap-1.5 mb-1.5">
            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span className="text-xs font-medium text-gray-500">Verification Commitment</span>
          </div>
          <div className="space-y-0.5" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
            <p className="text-xs text-gray-500">
              Verified: {promise.verification.commitment.timestamp}
            </p>
            <p className="text-xs text-gray-500">
              Source: {promise.verification.commitment.sourceDigest}
            </p>
            <p className="text-xs text-gray-500">
              Hash: {promise.verification.commitment.hash.length > 20
                ? `${promise.verification.commitment.hash.slice(0, 8)}...${promise.verification.commitment.hash.slice(-4)}`
                : promise.verification.commitment.hash} (SHA-256)
            </p>
          </div>
        </div>
      )}

      {/* Note */}
      {promise.note && (
        <div className="mb-4">
          <span className="text-sm text-gray-500">Evidence / Notes</span>
          <p className="text-sm text-gray-700 mt-1">{promise.note}</p>
        </div>
      )}

      {/* Dependencies */}
      {dependencies.length > 0 && (
        <div className="mb-4">
          <span className="text-sm text-gray-500 font-medium">
            Depends on ({dependencies.length})
          </span>
          <div className="flex flex-wrap gap-1 mt-1">
            {dependencies.map((id) => {
              const dep = allPromises.find((p) => p.id === id);
              return (
                <span key={id} className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-gray-50 rounded border">
                  <span className="font-mono">{id}</span>
                  {dep && <StatusBadge status={dep.status} size="xs" />}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Dependents */}
      {dependents.length > 0 && (
        <div className="mb-4">
          <span className="text-sm text-gray-500 font-medium">
            Depended on by ({dependents.length})
          </span>
          <div className="flex flex-wrap gap-1 mt-1">
            {dependents.map((id) => {
              const dep = allPromises.find((p) => p.id === id);
              return (
                <span key={id} className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-gray-50 rounded border">
                  <span className="font-mono">{id}</span>
                  {dep && <StatusBadge status={dep.status} size="xs" />}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* What If button */}
      {onWhatIf && (
        <button
          onClick={() => onWhatIf(promise.id)}
          className="mt-2 w-full py-2 px-4 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
        >
          Simulate: What If This Promise Changes?
        </button>
      )}
    </div>
  );
}
