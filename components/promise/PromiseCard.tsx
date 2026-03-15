"use client";

import { Promise as PromiseType, Agent } from "@/lib/types/promise";
import { StatusBadge } from "./StatusBadge";
import { getDomainColor } from "@/lib/utils/colors";

interface PromiseCardProps {
  promise: PromiseType;
  agents: Agent[];
  onWhatIf?: (promiseId: string) => void;
  onSelect?: (promiseId: string) => void;
  isAffected?: boolean;
  cascadeDepth?: number;
  compact?: boolean;
}

export function PromiseCard({
  promise,
  agents,
  onWhatIf,
  onSelect,
  isAffected,
  cascadeDepth,
  compact,
}: PromiseCardProps) {
  const promiserAgent = agents.find((a) => a.id === promise.promiser);
  const promiseeAgent = agents.find((a) => a.id === promise.promisee);
  const domainColor = getDomainColor(promise.domain);

  return (
    <div
      className={`bg-white rounded-lg border transition-all ${
        isAffected
          ? "border-red-300 shadow-md cascade-pulse"
          : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
      } ${compact ? "p-3" : "p-4"}`}
      style={isAffected ? { borderLeftWidth: 4, borderLeftColor: "#b91c1c" } : { borderLeftWidth: 4, borderLeftColor: domainColor }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs text-gray-500">{promise.id}</span>
            {promise.ref && (
              <span className="font-mono text-xs text-gray-400">{promise.ref}</span>
            )}
            <StatusBadge status={promise.status} size="xs" />
          </div>

          <p className={`text-gray-900 ${compact ? "text-sm" : "text-sm leading-relaxed"}`}>
            {promise.body}
          </p>

          <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
            <span className="font-medium" title="Promiser">
              {promiserAgent?.short || promise.promiser}
            </span>
            <span>→</span>
            <span title="Promisee">
              {promiseeAgent?.short || promise.promisee}
            </span>
            <span
              className="px-1.5 py-0.5 rounded text-xs"
              style={{ color: domainColor, backgroundColor: domainColor + "15" }}
            >
              {promise.domain}
            </span>
            {promise.polarity && (
              <span className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
                {promise.polarity === "give" ? "+give" : "-accept"}
              </span>
            )}
            {promise.origin && (
              <span className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
                {promise.origin}
              </span>
            )}
          </div>

          {/* Progress bar */}
          {promise.progress !== undefined && promise.required !== undefined && (
            <div className="mt-2">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>{promise.progress}% progress</span>
                <span>{promise.required}% required</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, (promise.progress / promise.required) * 100)}%`,
                    backgroundColor:
                      promise.progress >= promise.required ? "#1a5f4a" : "#b45309",
                  }}
                />
              </div>
            </div>
          )}

          {/* Dependencies */}
          {promise.depends_on.length > 0 && !compact && (
            <div className="mt-2 text-xs text-gray-500">
              <span className="font-medium">Depends on:</span>{" "}
              {promise.depends_on.map((id, i) => (
                <span key={id}>
                  <button
                    onClick={() => onSelect?.(id)}
                    className="text-blue-600 hover:underline"
                  >
                    {id}
                  </button>
                  {i < promise.depends_on.length - 1 && ", "}
                </span>
              ))}
            </div>
          )}

          {/* Cascade info */}
          {isAffected && cascadeDepth !== undefined && (
            <div className="mt-2 text-xs font-medium text-red-700">
              Cascade depth: {cascadeDepth}
            </div>
          )}
        </div>

        {/* What If button */}
        {onWhatIf && (
          <button
            onClick={() => onWhatIf(promise.id)}
            className="shrink-0 px-2 py-1 text-xs font-medium text-blue-700 bg-blue-50 rounded hover:bg-blue-100 transition-colors"
          >
            What If?
          </button>
        )}
      </div>

      {/* Violation type */}
      {promise.violationType && promise.status === "violated" && !compact && (
        <div className="mt-2 text-xs text-red-700 bg-red-50 rounded px-2 py-1">
          Violation type: <span className="font-medium">{promise.violationType}</span>
        </div>
      )}

      {/* Note */}
      {!compact && promise.note && (
        <p className="mt-2 text-xs text-gray-500 leading-relaxed">{promise.note}</p>
      )}
    </div>
  );
}
