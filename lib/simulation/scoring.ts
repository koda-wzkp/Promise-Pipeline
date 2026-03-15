import { Promise, PromiseStatus } from "../types/promise";

const STATUS_WEIGHTS: Record<PromiseStatus, number> = {
  verified: 100,
  declared: 60,
  degraded: 30,
  violated: 0,
  unverifiable: 20,
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
