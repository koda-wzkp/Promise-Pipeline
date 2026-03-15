import { Promise, Agent, PromiseStatus, PromiseOrigin } from "./promise";
import { NetworkHealthScore } from "./simulation";

export interface TeamMember extends Agent {
  type: "team-member";
  role?: string;
  activePromiseCount: number;
  keptRate: number;
  mtkp: number;
  loadScore: number;
}

export interface TeamPromise extends Promise {
  isTeam: true;
  origin: PromiseOrigin;
  estimatedHours?: number;
  actualHours?: number;
  createdAt: string;
  priority?: "critical" | "high" | "normal" | "low";
}

export interface TeamDashboardData {
  teamName: string;
  members: TeamMember[];
  promises: TeamPromise[];
  health: NetworkHealthScore;
  domains: string[];
  recentActivity: {
    promiseId: string;
    action: "created" | "kept" | "broken" | "renegotiated" | "degraded";
    timestamp: string;
    memberId: string;
  }[];
}

export interface CapacityQuery {
  newPromise: Partial<TeamPromise>;
  assignee: string;
}

export interface CapacityResult {
  canAbsorb: boolean;
  newMemberLoad: number;
  atRiskPromises: string[];
  healthImpact: number;
  recommendation: string;

  // Utilization impact from queueing theory
  utilizationImpact?: {
    before: number;       // team utilization before the new promise
    after: number;        // projected utilization after
    memberBefore: number; // assignee utilization before
    memberAfter: number;  // assignee utilization after
  };
}
