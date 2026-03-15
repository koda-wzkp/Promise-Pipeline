"use client";

import { useState } from "react";
import { Promise as PromiseType, PromiseStatus } from "@/lib/types/promise";
import { StatusBadge } from "@/components/promise/StatusBadge";

interface WhatIfPanelProps {
  promise: PromiseType;
  onSimulate: (promiseId: string, newStatus: PromiseStatus) => void;
  onClose: () => void;
}

const statuses: PromiseStatus[] = [
  "verified",
  "declared",
  "degraded",
  "violated",
  "unverifiable",
];

export function WhatIfPanel({ promise, onSimulate, onClose }: WhatIfPanelProps) {
  const [selectedStatus, setSelectedStatus] = useState<PromiseStatus>(
    promise.status === "verified" ? "violated" : "verified"
  );

  return (
    <div className="bg-white rounded-xl border border-blue-200 shadow-lg p-5">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-serif font-semibold text-gray-900">
          What If Simulation
        </h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
          aria-label="Close What If panel"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-500 mb-1">Selected promise:</p>
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-gray-500">{promise.id}</span>
          <StatusBadge status={promise.status} size="xs" />
        </div>
        <p className="text-sm text-gray-900 mt-1">{promise.body}</p>
      </div>

      <div className="mb-4">
        <label htmlFor="what-if-status" className="text-sm font-medium text-gray-700 block mb-1">
          Change status to:
        </label>
        <select
          id="what-if-status"
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value as PromiseStatus)}
          className="w-full border rounded-lg px-3 py-2 text-sm bg-white"
        >
          {statuses
            .filter((s) => s !== promise.status)
            .map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
        </select>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onSimulate(promise.id, selectedStatus)}
          className="flex-1 py-2 px-4 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          Simulate Cascade
        </button>
        <button
          onClick={onClose}
          className="py-2 px-4 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
