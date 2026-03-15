"use client";

import { useState, useReducer, useMemo, useCallback } from "react";
import { jcpoaData } from "@/lib/data/jcpoa";
import { jcpoaTimeline } from "@/lib/data/jcpoa-timeline";
import { PromiseStatus } from "@/lib/types/promise";
import { CascadeResult, WhatIfQuery } from "@/lib/types/simulation";
import { simulateCascade } from "@/lib/simulation/cascade";
import { calculateEntropyTimeSeries } from "@/lib/simulation/scoring";
import { SummaryTab } from "@/components/dashboard/SummaryTab";
import { NetworkTab } from "@/components/dashboard/NetworkTab";
import { TimelineTab } from "@/components/dashboard/TimelineTab";
import { PromisesTab } from "@/components/dashboard/PromisesTab";
import { InsightsTab } from "@/components/dashboard/InsightsTab";
import { JCPOAAboutTab } from "@/components/dashboard/JCPOAAboutTab";

type Tab = "summary" | "network" | "timeline" | "promises" | "insights" | "about";

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
        jcpoaData.promises,
        action.query,
        jcpoaData.threats
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
  { id: "timeline", label: "Timeline" },
  { id: "promises", label: "Promises" },
  { id: "insights", label: "Insights" },
  { id: "about", label: "About" },
];

export default function JCPOAPage() {
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

  const timePoints = useMemo(
    () => calculateEntropyTimeSeries(jcpoaTimeline),
    []
  );

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
    <div className="min-h-screen" style={{ backgroundColor: "#f5f0eb" }}>
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="font-serif text-2xl font-bold text-gray-900">
              {jcpoaData.title}
            </h1>
            <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 rounded">
              Case Study
            </span>
          </div>
          <p className="text-gray-600">{jcpoaData.subtitle}</p>
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
                    ? "border-red-700 text-red-800"
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
        {activeTab === "summary" && <SummaryTab data={jcpoaData} />}
        {activeTab === "network" && (
          <NetworkTab
            promises={jcpoaData.promises}
            agents={jcpoaData.agents}
            threats={jcpoaData.threats}
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
        {activeTab === "timeline" && (
          <TimelineTab timePoints={timePoints} />
        )}
        {activeTab === "promises" && (
          <PromisesTab
            promises={jcpoaData.promises}
            agents={jcpoaData.agents}
            onWhatIf={handleWhatIf}
            affectedIds={affectedIds}
            affectedMap={affectedMap}
          />
        )}
        {activeTab === "insights" && (
          <InsightsTab
            insights={jcpoaData.insights}
            promises={jcpoaData.promises}
            onPromiseClick={handleWhatIf}
          />
        )}
        {activeTab === "about" && <JCPOAAboutTab />}
      </div>
    </div>
  );
}
