"use client";

import { CascadeResult } from "@/lib/types/simulation";
import { Promise as PromiseType, Agent } from "@/lib/types/promise";
import { StatusBadge } from "@/components/promise/StatusBadge";

interface CascadeResultsProps {
  result: CascadeResult;
  promises: PromiseType[];
  agents: Agent[];
  onReset: () => void;
}

export function CascadeResults({
  result,
  promises,
  agents,
  onReset,
}: CascadeResultsProps) {
  const healthDelta = result.newNetworkHealth - result.originalNetworkHealth;
  const promiseMap = new Map(promises.map((p) => [p.id, p]));

  return (
    <div className="bg-white rounded-xl border border-orange-200 shadow-lg p-5">
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-serif font-semibold text-gray-900">
          Cascade Results
        </h3>
        <button
          onClick={onReset}
          className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Reset
        </button>
      </div>

      {/* Health score change */}
      <div className="flex items-center gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="text-center">
          <p className="text-xs text-gray-500">Before</p>
          <p className="text-2xl font-bold text-gray-900">
            {Math.round(result.originalNetworkHealth)}
          </p>
        </div>
        <div className="text-center">
          <span
            className={`text-lg font-bold ${
              healthDelta < 0 ? "text-red-600" : healthDelta > 0 ? "text-green-600" : "text-gray-500"
            }`}
          >
            {healthDelta > 0 ? "+" : ""}
            {Math.round(healthDelta)}
          </span>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500">After</p>
          <p className="text-2xl font-bold text-gray-900">
            {Math.round(result.newNetworkHealth)}
          </p>
        </div>
      </div>

      {/* Summary */}
      <p className="text-sm text-gray-700 mb-4 leading-relaxed">{result.summary}</p>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center p-2 bg-gray-50 rounded">
          <p className="text-xl font-bold text-gray-900">
            {result.affectedPromises.length}
          </p>
          <p className="text-xs text-gray-500">Affected</p>
        </div>
        <div className="text-center p-2 bg-gray-50 rounded">
          <p className="text-xl font-bold text-gray-900">
            {result.domainsAffected.length}
          </p>
          <p className="text-xs text-gray-500">Domains</p>
        </div>
        <div className="text-center p-2 bg-gray-50 rounded">
          <p className="text-xl font-bold text-gray-900">
            {result.cascadeDepth}
          </p>
          <p className="text-xs text-gray-500">Max Depth</p>
        </div>
      </div>

      {/* Triggered threats */}
      {result.triggeredThreats.length > 0 && (
        <div className="mb-4 p-3 bg-red-50 rounded-lg border border-red-200">
          <p className="text-sm font-medium text-red-800 mb-1">
            Triggered Threats
          </p>
          {result.triggeredThreats.map((id) => (
            <p key={id} className="text-xs text-red-700">
              {id}
            </p>
          ))}
        </div>
      )}

      {/* Certainty impacts */}
      {result.certaintyImpacts && result.certaintyImpacts.length > 0 && (
        <div className="mb-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
          <p className="text-sm font-medium text-purple-800 mb-2">
            Certainty Effects ({result.certaintyImpacts.length} promise{result.certaintyImpacts.length !== 1 ? "s" : ""})
          </p>
          <div className="space-y-1.5">
            {result.certaintyImpacts.map((ci) => {
              const promise = promiseMap.get(ci.promiseId);
              return (
                <div key={ci.promiseId} className="text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-gray-500">{ci.promiseId}</span>
                    <span className="text-purple-700">
                      certainty {Math.round(ci.previousCertainty * 100)}% → {Math.round(ci.newCertainty * 100)}%
                    </span>
                  </div>
                  <p className="text-gray-500 ml-4 truncate">{ci.reason}</p>
                </div>
              );
            })}
          </div>
          {result.originalNetworkEntropy !== undefined && (
            <div className="mt-2 pt-2 border-t border-purple-200 text-xs text-purple-800">
              Network Certainty: {Math.round(100 - result.originalNetworkEntropy)} → {Math.round(100 - result.newNetworkEntropy)}
              <span className="ml-1">
                ({Math.round(result.originalNetworkEntropy - result.newNetworkEntropy) > 0 ? "+" : ""}{Math.round((100 - result.newNetworkEntropy) - (100 - result.originalNetworkEntropy))})
              </span>
            </div>
          )}
        </div>
      )}

      {/* Affected promises */}
      {result.affectedPromises.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">
            Affected Promises
          </p>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {result.affectedPromises.map((ap) => {
              const promise = promiseMap.get(ap.promiseId);
              return (
                <div
                  key={ap.promiseId}
                  className="flex items-start gap-2 p-2 bg-gray-50 rounded text-sm"
                >
                  <span className="font-mono text-xs text-gray-500 shrink-0">
                    {ap.promiseId}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-600 truncate">
                      {promise?.body}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <StatusBadge status={ap.originalStatus} size="xs" />
                      <span className="text-xs text-gray-400">→</span>
                      <StatusBadge status={ap.newStatus} size="xs" />
                      <span className="text-xs text-gray-400 ml-1">
                        (depth {ap.cascadeDepth})
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
