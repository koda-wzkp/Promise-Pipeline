// ─── STATUS ───
export type PromiseStatus =
  | "verified"
  | "declared"
  | "degraded"
  | "violated"
  | "unverifiable";

// ─── POLARITY (v2.1) ───
export type PromisePolarity = "give" | "accept";

// ─── ORIGIN (v2.1) ───
export type PromiseOrigin =
  | "voluntary"
  | "imposed"
  | "negotiated";

// ─── VIOLATION TYPE (v2.1) ───
export type ViolationType =
  | "fault"
  | "flaw"
  | "abandoned"
  | "expired";

// ─── AGENT ───
export type AgentType =
  | "legislator" | "utility" | "regulator" | "community"
  | "auditor" | "provider" | "stakeholder" | "certifier"
  | "brand" | "monitor" | "team-member";

export interface Agent {
  id: string;
  name: string;
  type: AgentType;
  short: string;
}

// ─── VERIFICATION ───
export type VerificationMethod =
  | "filing"
  | "audit"
  | "self-report"
  | "sensor"
  | "benchmark"
  | "none";

export interface VerificationSource {
  method: VerificationMethod;
  source?: string;
  endpoint?: string;
  metric?: string;
  threshold?: {
    operator: "<=" | ">=" | "==" | "<" | ">";
    value: number;
  };
  frequency?: string;
}

// ─── PROMISE (v2.1) ───
export interface Promise {
  id: string;
  ref?: string;
  promiser: string;
  promisee: string;
  body: string;
  domain: string;
  status: PromiseStatus;
  target?: string;
  progress?: number;
  required?: number;
  note: string;
  verification: VerificationSource;
  depends_on: string[];

  // v2.1 additions
  polarity?: PromisePolarity;
  scope?: string[];
  origin?: PromiseOrigin;
  violationType?: ViolationType;
}

// ─── THREAT (v2.1) ───
export interface Threat {
  id: string;
  triggerPromiseId: string;
  triggerCondition: PromiseStatus;
  affectedPromiseIds: string[];
  body: string;
  severity: InsightSeverity;
}

// ─── INSIGHT ───
export type InsightSeverity = "critical" | "warning" | "positive";
export type InsightType =
  | "Cascade"
  | "Gap"
  | "Conflict"
  | "Working"
  | "Drift"
  | "Threat"
  | "IncompleteBinding"
  | "ScopeGap"
  | "DesignFlaw";

export interface Insight {
  severity: InsightSeverity;
  type: InsightType;
  title: string;
  body: string;
  promises: string[];
}

// ─── TRAJECTORY ───
export interface TrajectoryPoint {
  year: number;
  actual?: number;
  projected?: number;
  target?: number;
}

export interface Trajectory {
  agentId: string;
  label: string;
  data: TrajectoryPoint[];
}

// ─── DOMAIN ───
export interface Domain {
  name: string;
  color: string;
  promiseCount: number;
  healthScore: number;
}

// ─── DASHBOARD ───
export interface DashboardData {
  title: string;
  subtitle: string;
  agents: Agent[];
  promises: Promise[];
  domains: Domain[];
  insights: Insight[];
  threats?: Threat[];
  trajectories: Trajectory[];
  grade: string;
  gradeExplanation: string;
}
