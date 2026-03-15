import { Promise, PromiseStatus, Threat } from "../types/promise";
import {
  WhatIfQuery,
  CascadeResult,
  AffectedPromise,
  CertaintyImpact,
  NetworkHealthScore,
} from "../types/simulation";
import { calculateNetworkEntropy } from "./scoring";

const STATUS_WEIGHTS: Record<PromiseStatus, number> = {
  verified: 100,
  declared: 60,
  degraded: 30,
  violated: 0,
  unverifiable: 20,
};

const DEGRADATION_ORDER: PromiseStatus[] = [
  "verified",
  "declared",
  "degraded",
  "violated",
];

function degradeStatus(current: PromiseStatus, levels: number = 1): PromiseStatus {
  if (current === "unverifiable") return "unverifiable";
  const idx = DEGRADATION_ORDER.indexOf(current);
  if (idx === -1) return current;
  const newIdx = Math.min(idx + levels, DEGRADATION_ORDER.length - 1);
  return DEGRADATION_ORDER[newIdx];
}

const CERTAINTY_WEIGHTS: Record<PromiseStatus, number> = {
  verified: 1.0,
  violated: 0.9,
  degraded: 0.6,
  declared: 0.3,
  unverifiable: 0.0,
};

/**
 * Propagate certainty changes through verification dependency chains.
 *
 * When a promise that serves as a verification dependency changes status,
 * find all promises whose verification depends on it and compute certainty impact.
 * Certainty is capped at the verifier's certainty level.
 */
export function propagateCertaintyChange(
  promises: Promise[],
  changedPromiseId: string,
  newStatus: PromiseStatus,
): CertaintyImpact[] {
  const impacts: CertaintyImpact[] = [];
  const changedPromise = promises.find(p => p.id === changedPromiseId);
  if (!changedPromise) return impacts;

  // Find all promises whose verification depends on the changed promise
  const verificationDependents = promises.filter(
    p => p.verification?.dependsOnPromise === changedPromiseId
  );

  if (verificationDependents.length === 0) return impacts;

  const verifierCertainty = CERTAINTY_WEIGHTS[newStatus];

  for (const dependent of verificationDependents) {
    const previousCertainty = CERTAINTY_WEIGHTS[dependent.status];
    const newCertainty = Math.min(previousCertainty, verifierCertainty);

    if (newCertainty < previousCertainty) {
      impacts.push({
        promiseId: dependent.id,
        previousCertainty,
        newCertainty,
        reason: `Verification mechanism compromised: ${changedPromise.body.slice(0, 80)} (${changedPromiseId}) ${newStatus}`,
        verificationChainDepth: 1,
      });

      // Recursive: if this dependent is itself a verification dependency
      // for other promises, propagate further
      const downstream = propagateCertaintyChange(
        promises,
        dependent.id,
        dependent.status,
      );

      for (const d of downstream) {
        d.verificationChainDepth += 1;
        d.newCertainty = Math.min(d.newCertainty, newCertainty);
        impacts.push(d);
      }
    }
  }

  return impacts;
}

/**
 * Deterministic cascade propagation engine.
 * Uses BFS to propagate effects through the dependency graph.
 */
export function simulateCascade(
  promises: Promise[],
  query: WhatIfQuery,
  threats: Threat[] = []
): CascadeResult {
  const promiseMap = new Map(promises.map((p) => [p.id, { ...p }]));
  const originalStatuses = new Map(promises.map((p) => [p.id, p.status]));

  // Build reverse adjacency: for each promise, which promises depend on it?
  const dependents = new Map<string, string[]>();
  for (const p of promises) {
    for (const depId of p.depends_on) {
      if (!dependents.has(depId)) dependents.set(depId, []);
      dependents.get(depId)!.push(p.id);
    }
  }

  // Calculate original network health
  const originalHealth = calculateNetworkHealth(promises).overall;

  // Apply the initial change
  const affected: AffectedPromise[] = [];
  const targetPromise = promiseMap.get(query.promiseId);
  if (!targetPromise) {
    const currentEntropy = calculateNetworkEntropy(promises).overall;
    return {
      query,
      originalNetworkHealth: originalHealth,
      newNetworkHealth: originalHealth,
      affectedPromises: [],
      triggeredThreats: [],
      cascadeDepth: 0,
      domainsAffected: [],
      summary: "Promise not found.",
      certaintyImpacts: [],
      originalNetworkEntropy: currentEntropy,
      newNetworkEntropy: currentEntropy,
    };
  }

  targetPromise.status = query.newStatus;

  // BFS cascade
  const visited = new Set<string>([query.promiseId]);
  const queue: { id: string; depth: number }[] = [];

  // Add direct dependents to queue
  const directDeps = dependents.get(query.promiseId) || [];
  for (const depId of directDeps) {
    queue.push({ id: depId, depth: 1 });
  }

  let maxDepth = 0;
  const triggeredThreatIds: string[] = [];

  while (queue.length > 0) {
    const { id, depth } = queue.shift()!;
    if (visited.has(id)) continue;
    visited.add(id);

    const promise = promiseMap.get(id);
    if (!promise) continue;

    const originalStatus = originalStatuses.get(id)!;

    if (query.newStatus === "violated" || query.newStatus === "degraded") {
      // Degrade dependents, diminishing with depth
      const degradeLevels = Math.max(1, 2 - depth + 1);
      const newStatus = degradeStatus(originalStatus, degradeLevels > 0 ? 1 : 0);

      if (newStatus !== originalStatus) {
        promise.status = newStatus;
        affected.push({
          promiseId: id,
          originalStatus,
          newStatus,
          cascadeDepth: depth,
          reason: `Depends on ${query.promiseId} which changed to ${query.newStatus}`,
        });
        maxDepth = Math.max(maxDepth, depth);

        // Continue propagation
        const nextDeps = dependents.get(id) || [];
        for (const nextId of nextDeps) {
          if (!visited.has(nextId)) {
            queue.push({ id: nextId, depth: depth + 1 });
          }
        }
      }
    } else if (query.newStatus === "unverifiable") {
      // Flag as at risk but don't change status
      affected.push({
        promiseId: id,
        originalStatus,
        newStatus: originalStatus,
        cascadeDepth: depth,
        reason: `Upstream promise ${query.promiseId} is now unverifiable — this promise is at risk`,
      });
      maxDepth = Math.max(maxDepth, depth);
    } else if (query.newStatus === "verified") {
      // Reinforcement: if all dependencies are now verified, mark as reinforced
      const allDepsVerified = promise.depends_on.every(
        (depId) => promiseMap.get(depId)?.status === "verified"
      );
      if (allDepsVerified && originalStatus !== "verified") {
        affected.push({
          promiseId: id,
          originalStatus,
          newStatus: originalStatus,
          cascadeDepth: depth,
          reason: `All dependencies now verified — this promise is reinforced`,
        });
      }
    }
  }

  // Check threats — lateral cascade
  for (const threat of threats) {
    const triggerPromise = promiseMap.get(threat.triggerPromiseId);
    if (triggerPromise && triggerPromise.status === threat.triggerCondition) {
      triggeredThreatIds.push(threat.id);
      for (const affectedId of threat.affectedPromiseIds) {
        if (!visited.has(affectedId)) {
          const promise = promiseMap.get(affectedId);
          if (promise) {
            const origStatus = originalStatuses.get(affectedId)!;
            const newStatus = degradeStatus(origStatus, 1);
            if (newStatus !== origStatus) {
              promise.status = newStatus;
              affected.push({
                promiseId: affectedId,
                originalStatus: origStatus,
                newStatus,
                cascadeDepth: 1,
                reason: `Threat ${threat.id}: ${threat.body}`,
              });
            }
          }
        }
      }
    }
  }

  // Calculate new network health
  const newPromises = Array.from(promiseMap.values());
  const newHealth = calculateNetworkHealth(newPromises).overall;

  // Certainty cascade via verification dependency edges
  const certaintyImpacts = propagateCertaintyChange(
    promises,
    query.promiseId,
    query.newStatus,
  );

  // Entropy before and after
  const originalEntropy = calculateNetworkEntropy(promises).overall;
  const newEntropy = calculateNetworkEntropy(newPromises).overall;

  const domainsAffected = Array.from(
    new Set(
      affected
        .map((a) => promiseMap.get(a.promiseId)?.domain)
        .filter(Boolean) as string[]
    )
  );

  const summary = generateCascadeNarrative(
    {
      query,
      originalNetworkHealth: originalHealth,
      newNetworkHealth: newHealth,
      affectedPromises: affected,
      triggeredThreats: triggeredThreatIds,
      cascadeDepth: maxDepth,
      domainsAffected,
      summary: "",
      certaintyImpacts,
      originalNetworkEntropy: originalEntropy,
      newNetworkEntropy: newEntropy,
    },
    promises
  );

  return {
    query,
    originalNetworkHealth: originalHealth,
    newNetworkHealth: newHealth,
    affectedPromises: affected,
    triggeredThreats: triggeredThreatIds,
    cascadeDepth: maxDepth,
    domainsAffected,
    summary,
    certaintyImpacts,
    originalNetworkEntropy: originalEntropy,
    newNetworkEntropy: newEntropy,
  };
}

/**
 * Calculate network health score.
 */
export function calculateNetworkHealth(promises: Promise[]): NetworkHealthScore {
  if (promises.length === 0) {
    return {
      overall: 0,
      byDomain: {},
      byAgent: {},
      bottlenecks: [],
      atRisk: [],
    };
  }

  const overall =
    promises.reduce((sum, p) => sum + STATUS_WEIGHTS[p.status], 0) /
    promises.length;

  // By domain
  const byDomain: Record<string, number> = {};
  const domainPromises: Record<string, Promise[]> = {};
  for (const p of promises) {
    if (!domainPromises[p.domain]) domainPromises[p.domain] = [];
    domainPromises[p.domain].push(p);
  }
  for (const [domain, dps] of Object.entries(domainPromises)) {
    byDomain[domain] =
      dps.reduce((sum, p) => sum + STATUS_WEIGHTS[p.status], 0) / dps.length;
  }

  // By agent (promiser)
  const byAgent: Record<string, number> = {};
  const agentPromises: Record<string, Promise[]> = {};
  for (const p of promises) {
    if (!agentPromises[p.promiser]) agentPromises[p.promiser] = [];
    agentPromises[p.promiser].push(p);
  }
  for (const [agent, aps] of Object.entries(agentPromises)) {
    byAgent[agent] =
      aps.reduce((sum, p) => sum + STATUS_WEIGHTS[p.status], 0) / aps.length;
  }

  // Bottlenecks: promises with most dependents
  const dependentCount = new Map<string, number>();
  for (const p of promises) {
    for (const depId of p.depends_on) {
      dependentCount.set(depId, (dependentCount.get(depId) || 0) + 1);
    }
  }
  const bottlenecks = Array.from(dependentCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id]) => id);

  // At risk: promises whose dependencies include degraded/violated
  const atRisk: string[] = [];
  for (const p of promises) {
    if (p.depends_on.length > 0) {
      const hasFailingDep = p.depends_on.some((depId) => {
        const dep = promises.find((dp) => dp.id === depId);
        return dep && (dep.status === "violated" || dep.status === "degraded");
      });
      if (hasFailingDep) atRisk.push(p.id);
    }
  }

  return { overall, byDomain, byAgent, bottlenecks, atRisk };
}

/**
 * Calculate Mean Time to Keep a Promise (MTKP).
 */
export function calculateMTKP(
  promises: Array<Promise & { createdAt?: string; completedAt?: string }>
): {
  overall: number;
  byDomain: Record<string, number>;
  byAgent: Record<string, number>;
} {
  const completedPromises = promises.filter(
    (p) => p.createdAt && p.completedAt && p.status === "verified"
  );

  if (completedPromises.length === 0) {
    return { overall: 0, byDomain: {}, byAgent: {} };
  }

  function avgDays(ps: typeof completedPromises): number {
    if (ps.length === 0) return 0;
    const totalDays = ps.reduce((sum, p) => {
      const created = new Date(p.createdAt!).getTime();
      const completed = new Date(p.completedAt!).getTime();
      return sum + (completed - created) / (1000 * 60 * 60 * 24);
    }, 0);
    return totalDays / ps.length;
  }

  const overall = avgDays(completedPromises);

  const byDomain: Record<string, number> = {};
  const domainGroups: Record<string, typeof completedPromises> = {};
  for (const p of completedPromises) {
    if (!domainGroups[p.domain]) domainGroups[p.domain] = [];
    domainGroups[p.domain].push(p);
  }
  for (const [domain, dps] of Object.entries(domainGroups)) {
    byDomain[domain] = avgDays(dps);
  }

  const byAgent: Record<string, number> = {};
  const agentGroups: Record<string, typeof completedPromises> = {};
  for (const p of completedPromises) {
    if (!agentGroups[p.promiser]) agentGroups[p.promiser] = [];
    agentGroups[p.promiser].push(p);
  }
  for (const [agent, aps] of Object.entries(agentGroups)) {
    byAgent[agent] = avgDays(aps);
  }

  return { overall, byDomain, byAgent };
}

/**
 * Identify bottleneck promises: promises with the most dependents.
 */
export function identifyBottlenecks(promises: Promise[]): string[] {
  const dependentCount = new Map<string, number>();
  for (const p of promises) {
    for (const depId of p.depends_on) {
      dependentCount.set(depId, (dependentCount.get(depId) || 0) + 1);
    }
  }
  return Array.from(dependentCount.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => id);
}

/**
 * Generate a human-readable narrative explaining cascade effects.
 */
export function generateCascadeNarrative(
  result: CascadeResult,
  promises: Promise[]
): string {
  const promiseMap = new Map(promises.map((p) => [p.id, p]));
  const sourcePromise = promiseMap.get(result.query.promiseId);

  if (!sourcePromise) return "Unknown promise.";

  if (result.affectedPromises.length === 0) {
    return `Changing "${sourcePromise.body}" to ${result.query.newStatus} has no downstream effects. This promise has no dependents in the network.`;
  }

  const healthDelta = result.newNetworkHealth - result.originalNetworkHealth;
  const healthDir = healthDelta < 0 ? "decreases" : "increases";

  let narrative = `Changing "${sourcePromise.body}" to ${result.query.newStatus} affects ${result.affectedPromises.length} downstream promise${result.affectedPromises.length !== 1 ? "s" : ""} across ${result.domainsAffected.length} domain${result.domainsAffected.length !== 1 ? "s" : ""} (${result.domainsAffected.join(", ")}). `;

  narrative += `Network health ${healthDir} from ${Math.round(result.originalNetworkHealth)} to ${Math.round(result.newNetworkHealth)} (${healthDelta > 0 ? "+" : ""}${Math.round(healthDelta)}). `;

  if (result.cascadeDepth > 1) {
    narrative += `The cascade reaches ${result.cascadeDepth} levels deep. `;
  }

  if (result.triggeredThreats.length > 0) {
    narrative += `This change triggers ${result.triggeredThreats.length} threat${result.triggeredThreats.length !== 1 ? "s" : ""}, causing lateral cascade effects across domains. `;
  }

  // Highlight most significant affected promise
  const worstAffected = result.affectedPromises.find(
    (a) => a.newStatus === "violated"
  );
  if (worstAffected) {
    const wp = promiseMap.get(worstAffected.promiseId);
    if (wp) {
      narrative += `Most critical impact: "${wp.body}" degrades to violated. `;
    }
  }

  // Certainty cascade effects
  if (result.certaintyImpacts && result.certaintyImpacts.length > 0) {
    narrative += `Additionally, ${result.certaintyImpacts.length} promise${result.certaintyImpacts.length !== 1 ? "s lose" : " loses"} verification certainty through verification dependency chains.`;
  }

  return narrative;
}
