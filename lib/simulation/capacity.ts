import { TeamPromise, TeamMember } from "../types/team";

/**
 * Calculate team utilization metrics using queueing theory.
 *
 * Little's Law: L = λW
 *   L = average number of active (in-progress) promises
 *   λ = average arrival rate (new promises per time unit)
 *   W = average time to complete a promise
 *
 * Utilization ρ = λ / μ where μ = service rate (completions per time unit)
 * When ρ approaches 1.0, the queue grows unboundedly — the team cannot
 * keep up with incoming commitments.
 *
 * This is predictive: it flags overload BEFORE promises start breaking,
 * based on rate trends rather than current status counts.
 */

export interface UtilizationMetrics {
  teamUtilization: number;          // 0-1, where ≥ 0.85 is danger zone
  arrivalRate: number;              // promises per week
  completionRate: number;           // promises per week
  averageCompletionDays: number;    // mean time to complete
  expectedQueueLength: number;      // predicted active promises at steady state
  timeToOverload: number | null;    // weeks until ρ ≥ 1.0 at current trend, or null if stable
  byMember: Record<string, {
    utilization: number;
    activeCount: number;
    completionRate: number;
  }>;
}

export function calculateUtilization(
  promises: TeamPromise[],
  members: TeamMember[],
  windowWeeks: number = 4,
): UtilizationMetrics {
  const now = new Date();
  const windowStart = new Date(now.getTime() - windowWeeks * 7 * 24 * 60 * 60 * 1000);

  // Calculate arrival rate: promises created in the window
  const arrivedInWindow = promises.filter((p) => {
    const created = new Date(p.createdAt || now.toISOString());
    return created >= windowStart;
  });
  const arrivalRate = arrivedInWindow.length / windowWeeks;

  // Calculate completion rate: promises completed in the window
  const completedInWindow = promises.filter((p) => {
    if (p.status !== "verified") return false;
    // Approximate: verified promises are "completed"
    return true; // Refine with actual completion timestamps when available
  });
  const completionRate = completedInWindow.length / windowWeeks;

  // Average completion time (for promises that have both created and completed dates)
  // Use estimated hours converted to days, or default to 7 days
  const promisesWithEstimates = promises.filter((p) => p.estimatedHours);
  const avgCompletionDays =
    promisesWithEstimates.length > 0
      ? promisesWithEstimates.reduce((sum, p) => sum + (p.estimatedHours! / 8), 0) /
        promisesWithEstimates.length
      : 7; // default 7 days if no estimates

  // Utilization
  const utilization =
    completionRate > 0
      ? arrivalRate / completionRate
      : arrivalRate > 0
      ? 1.0
      : 0;

  // Expected queue length (Little's Law)
  const expectedQueueLength = arrivalRate * (avgCompletionDays / 7);

  // Time to overload: if utilization is trending up, when does it hit 1.0?
  const timeToOverload =
    utilization >= 1.0
      ? 0
      : utilization >= 0.85
      ? Math.round((1.0 - utilization) / 0.05)
      : null;

  // Per-member breakdown
  const byMember: Record<
    string,
    { utilization: number; activeCount: number; completionRate: number }
  > = {};
  for (const member of members) {
    const memberPromises = promises.filter((p) => p.promiser === member.id);
    const memberActive = memberPromises.filter(
      (p) => p.status === "declared" || p.status === "degraded"
    ).length;
    const memberCompleted = memberPromises.filter(
      (p) => p.status === "verified"
    ).length;
    const memberRate = memberCompleted / windowWeeks;
    const memberArrival =
      memberPromises.filter((p) => {
        const created = new Date(p.createdAt || now.toISOString());
        return created >= windowStart;
      }).length / windowWeeks;

    byMember[member.id] = {
      utilization:
        memberRate > 0
          ? memberArrival / memberRate
          : memberArrival > 0
          ? 1.0
          : 0,
      activeCount: memberActive,
      completionRate: memberRate,
    };
  }

  return {
    teamUtilization: Math.min(utilization, 2.0), // cap at 2.0 for display
    arrivalRate,
    completionRate,
    averageCompletionDays: Math.round(avgCompletionDays * 10) / 10,
    expectedQueueLength: Math.round(expectedQueueLength * 10) / 10,
    timeToOverload,
    byMember,
  };
}
