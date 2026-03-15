"use client";

import { Insight, Promise as PromiseType } from "@/lib/types/promise";
import { StatusBadge } from "@/components/promise/StatusBadge";

interface InsightsTabProps {
  insights: Insight[];
  promises: PromiseType[];
  onPromiseClick?: (promiseId: string) => void;
}

const severityStyles = {
  critical: {
    bg: "bg-red-50",
    border: "border-red-200",
    icon: "text-red-600",
    badge: "bg-red-100 text-red-800",
  },
  warning: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    icon: "text-amber-600",
    badge: "bg-amber-100 text-amber-800",
  },
  positive: {
    bg: "bg-green-50",
    border: "border-green-200",
    icon: "text-green-600",
    badge: "bg-green-100 text-green-800",
  },
};

const typeLabels: Record<string, string> = {
  Cascade: "Cascade Failure",
  Gap: "Verification Gap",
  Conflict: "Structural Conflict",
  Working: "Working Mechanism",
  Drift: "Gradual Drift",
  Threat: "Conditional Threat",
  IncompleteBinding: "Incomplete Binding",
  ScopeGap: "Scope Gap",
  DesignFlaw: "Design Flaw",
};

export function InsightsTab({ insights, promises, onPromiseClick }: InsightsTabProps) {
  const promiseMap = new Map(promises.map((p) => [p.id, p]));

  return (
    <div className="space-y-4">
      {insights.map((insight, i) => {
        const styles = severityStyles[insight.severity];
        return (
          <div
            key={i}
            className={`rounded-xl border p-5 ${styles.bg} ${styles.border}`}
          >
            <div className="flex items-start gap-3">
              <div className={`mt-0.5 ${styles.icon}`}>
                {insight.severity === "critical" && (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                )}
                {insight.severity === "warning" && (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                {insight.severity === "positive" && (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-serif font-semibold text-gray-900">
                    {insight.title}
                  </h3>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${styles.badge}`}>
                    {typeLabels[insight.type] || insight.type}
                  </span>
                </div>

                <p className="text-sm text-gray-700 leading-relaxed mb-3">
                  {insight.body}
                </p>

                {insight.promises.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {insight.promises.map((id) => {
                      const promise = promiseMap.get(id);
                      return (
                        <button
                          key={id}
                          onClick={() => onPromiseClick?.(id)}
                          className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-white/60 rounded border hover:bg-white transition-colors"
                        >
                          <span className="font-mono">{id}</span>
                          {promise && <StatusBadge status={promise.status} size="xs" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
