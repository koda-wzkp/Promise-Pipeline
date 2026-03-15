"use client";

import { useState, useReducer, useMemo, useCallback } from "react";
import { hb2021Data } from "@/lib/data/hb2021";
import { PromiseStatus } from "@/lib/types/promise";
import { CascadeResult, WhatIfQuery } from "@/lib/types/simulation";
import { simulateCascade } from "@/lib/simulation/cascade";
import { SummaryTab } from "@/components/dashboard/SummaryTab";
import { NetworkTab } from "@/components/dashboard/NetworkTab";
import { TrajectoryTab } from "@/components/dashboard/TrajectoryTab";
import { PromisesTab } from "@/components/dashboard/PromisesTab";
import { InsightsTab } from "@/components/dashboard/InsightsTab";
import { AboutTab } from "@/components/dashboard/AboutTab";

type Tab = "summary" | "network" | "trajectory" | "promises" | "insights" | "about";

type SimulationState = {
  mode: "actual" | "simulating";
  activeQuery: WhatIfQuery | null;
  cascadeResult: CascadeResult | null;
  selectedPromise: string | null;
};

type SimulationAction =
  | { type: "SELECT_PROMISE"; promiseId: string }
  | { type: "RUN_SIMULATION"; query: WhatIfQuery }
  | { type: "CLEAR_SIMULATION" }
  | { type: "RESET" };

function simulationReducer(
  state: SimulationState,
  action: SimulationAction
): SimulationState {
  switch (action.type) {
    case "SELECT_PROMISE":
      return {
        ...state,
        selectedPromise: action.promiseId,
        cascadeResult: null,
      };
    case "RUN_SIMULATION":
      const result = simulateCascade(
        hb2021Data.promises,
        action.query,
        hb2021Data.threats
      );
      return {
        mode: "simulating",
        activeQuery: action.query,
        cascadeResult: result,
        selectedPromise: action.query.promiseId,
      };
    case "CLEAR_SIMULATION":
      return {
        mode: "actual",
        activeQuery: null,
        cascadeResult: null,
        selectedPromise: null,
      };
    case "RESET":
      return {
        mode: "actual",
        activeQuery: null,
        cascadeResult: null,
        selectedPromise: null,
      };
    default:
      return state;
  }
}

const tabs: { id: Tab; label: string }[] = [
  { id: "summary", label: "Summary" },
  { id: "network", label: "Network" },
  { id: "trajectory", label: "Trajectory" },
  { id: "promises", label: "Promises" },
  { id: "insights", label: "Insights" },
  { id: "about", label: "About" },
];

export default function HB2021Page() {
  const [activeTab, setActiveTab] = useState<Tab>("summary");
  const [simState, dispatch] = useReducer(simulationReducer, {
    mode: "actual",
    activeQuery: null,
    cascadeResult: null,
    selectedPromise: null,
  });

  const affectedIds = useMemo(() => {
    if (!simState.cascadeResult) return new Set<string>();
    return new Set(simState.cascadeResult.affectedPromises.map((a) => a.promiseId));
  }, [simState.cascadeResult]);

  const affectedMap = useMemo(() => {
    if (!simState.cascadeResult) return new Map<string, number>();
    const map = new Map<string, number>();
    simState.cascadeResult.affectedPromises.forEach((a) => {
      map.set(a.promiseId, a.cascadeDepth);
    });
    return map;
  }, [simState.cascadeResult]);

  const handleWhatIf = useCallback(
    (promiseId: string) => {
      dispatch({ type: "SELECT_PROMISE", promiseId });
      setActiveTab("network");
    },
    []
  );

  const handleSimulate = useCallback(
    (promiseId: string, newStatus: PromiseStatus) => {
      dispatch({
        type: "RUN_SIMULATION",
        query: { promiseId, newStatus },
      });
    },
    []
  );

  const handleReset = useCallback(() => {
    dispatch({ type: "RESET" });
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#faf9f6" }}>
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="font-serif text-2xl font-bold text-gray-900">
              {hb2021Data.title}
            </h1>
            <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded">
              Live Demo
            </span>
          </div>
          <p className="text-gray-600">{hb2021Data.subtitle}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 -mb-px overflow-x-auto" role="tablist">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-green-700 text-green-800"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.label}
                {tab.id === "network" && simState.mode === "simulating" && (
                  <span className="ml-1.5 w-2 h-2 inline-block rounded-full bg-amber-500" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === "summary" && <SummaryTab data={hb2021Data} />}
        {activeTab === "network" && (
          <NetworkTab
            promises={hb2021Data.promises}
            agents={hb2021Data.agents}
            threats={hb2021Data.threats}
            selectedPromiseId={simState.selectedPromise}
            cascadeResult={simState.cascadeResult}
            affectedIds={affectedIds}
            onNodeClick={(id) =>
              dispatch({ type: "SELECT_PROMISE", promiseId: id })
            }
            onSimulate={handleSimulate}
            onReset={handleReset}
          />
        )}
        {activeTab === "trajectory" && (
          <TrajectoryTab trajectories={hb2021Data.trajectories} />
        )}
        {activeTab === "promises" && (
          <PromisesTab
            promises={hb2021Data.promises}
            agents={hb2021Data.agents}
            onWhatIf={handleWhatIf}
            affectedIds={affectedIds}
            affectedMap={affectedMap}
          />
        )}
        {activeTab === "insights" && (
          <InsightsTab
            insights={hb2021Data.insights}
            promises={hb2021Data.promises}
            onPromiseClick={handleWhatIf}
          />
        )}
        {activeTab === "about" && <AboutTab />}
      </div>
    </div>
  );
}
