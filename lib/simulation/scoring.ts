import { Promise, PromiseStatus } from "../types/promise";
import { calculateBetweenness } from "./graph";

const STATUS_WEIGHTS: Record<PromiseStatus, number> = {
  verified: 100,
  declared: 60,
  degraded: 30,
  violated: 0,
  unverifiable: 20,
};

const CERTAINTY_WEIGHTS: Record<PromiseStatus, number> = {
  verified: 1.0,
  violated: 0.9,
  degraded: 0.6,
  declared: 0.3,
  unverifiable: 0.0,
};

/**
 * Compute a letter grade from a 0-100 health score.
 */
export function computeGrade(score: number): string {
  if (score >= 93) return "A";
  if (score >= 90) return "A-";
  if (score >= 87) return "B+";
  if (score >= 83) return "B";
  if (score >= 80) return "B-";
  if (score >= 77) return "C+";
  if (score >= 73) return "C";
  if (score >= 70) return "C-";
  if (score >= 67) return "D+";
  if (score >= 63) return "D";
  if (score >= 60) return "D-";
  return "F";
}

/**
 * Calculate the health score for an array of promises.
 */
export function healthScore(promises: Promise[]): number {
  if (promises.length === 0) return 0;
  return (
    promises.reduce((sum, p) => sum + STATUS_WEIGHTS[p.status], 0) /
    promises.length
  );
}

/**
 * Get status breakdown counts.
 */
export function statusBreakdown(
  promises: Promise[]
): Record<PromiseStatus, number> {
  const counts: Record<PromiseStatus, number> = {
    verified: 0,
    declared: 0,
    degraded: 0,
    violated: 0,
    unverifiable: 0,
  };
  for (const p of promises) {
    counts[p.status]++;
  }
  return counts;
}

/**
 * Calculate domain health scores.
 */
export function domainHealthScores(
  promises: Promise[]
): Record<string, number> {
  const byDomain: Record<string, Promise[]> = {};
  for (const p of promises) {
    if (!byDomain[p.domain]) byDomain[p.domain] = [];
    byDomain[p.domain].push(p);
  }
  const scores: Record<string, number> = {};
  for (const [domain, dps] of Object.entries(byDomain)) {
    scores[domain] = healthScore(dps);
  }
  return scores;
}

/**
 * Calculate agent reliability scores.
 */
export function agentReliabilityScores(
  promises: Promise[]
): Record<string, { score: number; total: number }> {
  const byAgent: Record<string, Promise[]> = {};
  for (const p of promises) {
    if (!byAgent[p.promiser]) byAgent[p.promiser] = [];
    byAgent[p.promiser].push(p);
  }
  const scores: Record<string, { score: number; total: number }> = {};
  for (const [agent, aps] of Object.entries(byAgent)) {
    scores[agent] = { score: healthScore(aps), total: aps.length };
  }
  return scores;
}

/**
 * Generate a narrative grade explanation.
 */
export function generateGradeExplanation(
  promises: Promise[],
  grade: string
): string {
  const breakdown = statusBreakdown(promises);
  const total = promises.length;
  const verifiedPct = Math.round((breakdown.verified / total) * 100);
  const violatedPct = Math.round((breakdown.violated / total) * 100);
  const unverifiablePct = Math.round((breakdown.unverifiable / total) * 100);

  const parts: string[] = [];

  if (verifiedPct > 50) {
    parts.push(`${verifiedPct}% of promises are verified, indicating strong follow-through`);
  }
  if (violatedPct > 0) {
    parts.push(
      `${breakdown.violated} promise${breakdown.violated !== 1 ? "s" : ""} violated`
    );
  }
  if (unverifiablePct > 10) {
    parts.push(
      `${breakdown.unverifiable} promise${breakdown.unverifiable !== 1 ? "s" : ""} lack verification mechanisms`
    );
  }
  if (breakdown.degraded > 0) {
    parts.push(
      `${breakdown.degraded} promise${breakdown.degraded !== 1 ? "s are" : " is"} degraded`
    );
  }

  return `Grade: ${grade}. ${parts.join(". ")}.`;
}

/**
 * Calculate network entropy — how much uncertainty exists in the network.
 *
 * Returns 0-100 where:
 *   0 = complete certainty (all promises verified or confirmed violated)
 *   100 = complete uncertainty (all promises unverifiable)
 *
 * This is distinct from health: a network can be healthy but uncertain
 * (many declared promises not yet tested) or unhealthy but certain
 * (many confirmed violations).
 */
export function calculateNetworkEntropy(promises: Promise[]): {
  overall: number;
  byDomain: Record<string, number>;
  byStatus: Record<PromiseStatus, number>;
  verificationCoverage: number;
} {
  if (promises.length === 0)
    return {
      overall: 0,
      byDomain: {},
      byStatus: {
        verified: 0,
        declared: 0,
        degraded: 0,
        violated: 0,
        unverifiable: 0,
      },
      verificationCoverage: 0,
    };

  // Overall uncertainty
  const uncertainties = promises.map(
    (p) => 1.0 - CERTAINTY_WEIGHTS[p.status]
  );
  const overall =
    (uncertainties.reduce((a, b) => a + b, 0) / promises.length) * 100;

  // By domain
  const byDomain: Record<string, number> = {};
  const domainGroups: Record<string, Promise[]> = {};
  for (const p of promises) {
    if (!domainGroups[p.domain]) domainGroups[p.domain] = [];
    domainGroups[p.domain].push(p);
  }
  for (const [domain, group] of Object.entries(domainGroups)) {
    const domUncertainties = group.map(
      (p) => 1.0 - CERTAINTY_WEIGHTS[p.status]
    );
    byDomain[domain] =
      (domUncertainties.reduce((a, b) => a + b, 0) / group.length) * 100;
  }

  // Status counts
  const byStatus: Record<PromiseStatus, number> = {
    verified: 0,
    declared: 0,
    degraded: 0,
    violated: 0,
    unverifiable: 0,
  };
  for (const p of promises) byStatus[p.status]++;

  // Verification coverage
  const withVerification = promises.filter(
    (p) => p.verification.method !== "none"
  ).length;
  const verificationCoverage = (withVerification / promises.length) * 100;

  return { overall, byDomain, byStatus, verificationCoverage };
}

/**
 * Identify high-leverage promises using both dependent count
 * and betweenness centrality.
 *
 * Returns promises sorted by a combined leverage score:
 *   leverage = 0.5 * normalizedDependentCount + 0.5 * betweennessCentrality
 *
 * This catches both "hub" nodes (many dependents) and "bridge" nodes
 * (few dependents but critical structural position).
 */
export function identifyHighLeverageNodes(
  promises: Promise[]
): {
  promiseId: string;
  dependentCount: number;
  betweenness: number;
  leverage: number;
}[] {
  const betweenness = calculateBetweenness(promises);

  // Count dependents (reverse dependency)
  const dependentCounts: Record<string, number> = {};
  for (const p of promises) dependentCounts[p.id] = 0;
  for (const p of promises) {
    for (const dep of p.depends_on) {
      if (dependentCounts[dep] !== undefined) {
        dependentCounts[dep]++;
      }
    }
  }

  const maxDeps = Math.max(...Object.values(dependentCounts), 1);

  return promises
    .map((p) => ({
      promiseId: p.id,
      dependentCount: dependentCounts[p.id] || 0,
      betweenness: betweenness[p.id] || 0,
      leverage:
        0.5 * ((dependentCounts[p.id] || 0) / maxDeps) +
        0.5 * (betweenness[p.id] || 0),
    }))
    .sort((a, b) => b.leverage - a.leverage);
}
