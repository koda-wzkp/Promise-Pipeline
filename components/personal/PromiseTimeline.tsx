"use client";

import { useState } from "react";
import { PersonalPromise } from "@/lib/types/personal";
import { PromiseStatus } from "@/lib/types/promise";
import { StatusBadge } from "@/components/promise/StatusBadge";
import { formatDate } from "@/lib/utils/formatting";

interface PromiseTimelineProps {
  promises: PersonalPromise[];
  onUpdateStatus: (id: string, status: PromiseStatus, reflection?: string) => void;
}

export function PromiseTimeline({
  promises,
  onUpdateStatus,
}: PromiseTimelineProps) {
  const [reflectionId, setReflectionId] = useState<string | null>(null);
  const [reflectionText, setReflectionText] = useState("");

  const sorted = [...promises].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const handleUpdateWithReflection = (id: string, status: PromiseStatus) => {
    onUpdateStatus(id, status, reflectionText || undefined);
    setReflectionId(null);
    setReflectionText("");
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />

        {sorted.map((promise) => {
          const isActive =
            promise.status === "declared" || promise.status === "degraded";

          return (
            <div key={promise.id} className="relative pl-10 pb-6">
              <div
                className={`absolute left-2.5 w-3 h-3 rounded-full border-2 bg-white ${
                  promise.status === "verified"
                    ? "border-green-600"
                    : promise.status === "violated"
                    ? "border-red-600"
                    : promise.status === "degraded"
                    ? "border-amber-600"
                    : "border-blue-600"
                }`}
              />

              <div className="bg-white rounded-lg border p-4">
                <div className="flex items-center gap-2 mb-1">
                  <StatusBadge status={promise.status} size="xs" />
                  <span className="text-xs text-gray-400">
                    {formatDate(promise.createdAt)}
                  </span>
                  <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
                    {promise.domain}
                  </span>
                </div>

                <p className="text-sm text-gray-900">{promise.body}</p>

                {promise.promisee !== "self" && (
                  <p className="text-xs text-gray-500 mt-1">
                    To: {promise.promisee}
                  </p>
                )}

                {promise.reflection && (
                  <p className="text-xs text-gray-500 mt-2 italic border-l-2 border-gray-200 pl-2">
                    {promise.reflection}
                  </p>
                )}

                {isActive && (
                  <div className="mt-3">
                    {reflectionId === promise.id ? (
                      <div className="space-y-2">
                        <label htmlFor={`reflection-${promise.id}`} className="sr-only">
                          Reflection note
                        </label>
                        <textarea
                          id={`reflection-${promise.id}`}
                          value={reflectionText}
                          onChange={(e) => setReflectionText(e.target.value)}
                          className="w-full text-xs border rounded px-2 py-1 resize-none"
                          rows={2}
                          placeholder="Optional reflection..."
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              handleUpdateWithReflection(promise.id, "verified")
                            }
                            className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                          >
                            Kept
                          </button>
                          <button
                            onClick={() =>
                              handleUpdateWithReflection(promise.id, "degraded")
                            }
                            className="px-3 py-1 text-xs bg-amber-600 text-white rounded hover:bg-amber-700"
                          >
                            Renegotiate
                          </button>
                          <button
                            onClick={() =>
                              handleUpdateWithReflection(promise.id, "violated")
                            }
                            className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                          >
                            Broken
                          </button>
                          <button
                            onClick={() => setReflectionId(null)}
                            className="px-3 py-1 text-xs border rounded text-gray-600 hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setReflectionId(promise.id)}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Update status...
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
