import { PromiseStatus } from "./promise";

export interface WhatIfQuery {
  promiseId: string;
  newStatus: PromiseStatus;
}

export interface AffectedPromise {
  promiseId: string;
  originalStatus: PromiseStatus;
  newStatus: PromiseStatus;
  cascadeDepth: number;
  reason: string;
}

export interface CertaintyImpact {
  promiseId: string;
  previousCertainty: number;    // 0-1
  newCertainty: number;         // 0-1
  reason: string;               // human-readable explanation
  verificationChainDepth: number; // how many links in the verification chain
}

export interface CascadeResult {
  query: WhatIfQuery;
  originalNetworkHealth: number;
  newNetworkHealth: number;
  affectedPromises: AffectedPromise[];
  triggeredThreats: string[];
  cascadeDepth: number;
  domainsAffected: string[];
  summary: string;

  // Certainty cascade effects
  certaintyImpacts: CertaintyImpact[];
  originalNetworkEntropy: number;   // 0-100 before simulation
  newNetworkEntropy: number;        // 0-100 after simulation
}

export interface NetworkHealthScore {
  overall: number;
  byDomain: Record<string, number>;
  byAgent: Record<string, number>;
  bottlenecks: string[];
  atRisk: string[];
  mtkp?: number;
  mtkpByDomain?: Record<string, number>;
  mtkpByAgent?: Record<string, number>;

  // Entropy / uncertainty metrics
  entropy?: {
    overall: number;              // 0-100 uncertainty score
    byDomain: Record<string, number>;
    verificationCoverage: number; // % with verification method !== "none"
  };
}

// ─── GRAPH STRUCTURES ───
export interface GraphNode {
  id: string;
  type: "promise" | "agent";
  label: string;
  status?: PromiseStatus;
  domain?: string;
  polarity?: "give" | "accept";
  x?: number;
  y?: number;
}

export interface GraphEdge {
  source: string;
  target: string;
  type: "depends_on" | "promiser" | "promisee" | "threat" | "verification_dependency";
  weight?: number;
}

export interface PromiseGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}
