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

export interface CascadeResult {
  query: WhatIfQuery;
  originalNetworkHealth: number;
  newNetworkHealth: number;
  affectedPromises: AffectedPromise[];
  triggeredThreats: string[];
  cascadeDepth: number;
  domainsAffected: string[];
  summary: string;
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
  type: "depends_on" | "promiser" | "promisee" | "threat";
  weight?: number;
}

export interface PromiseGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}
