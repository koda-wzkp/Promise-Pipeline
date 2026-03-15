import { Promise, Agent, Threat } from "../types/promise";
import { PromiseGraph, GraphNode, GraphEdge } from "../types/simulation";

/**
 * Build a graph representation from promises and agents.
 */
export function buildPromiseGraph(
  promises: Promise[],
  agents: Agent[],
  threats: Threat[] = []
): PromiseGraph {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];

  // Promise nodes
  for (const p of promises) {
    nodes.push({
      id: p.id,
      type: "promise",
      label: p.body.length > 60 ? p.body.slice(0, 57) + "..." : p.body,
      status: p.status,
      domain: p.domain,
      polarity: p.polarity,
    });
  }

  // Agent nodes
  for (const a of agents) {
    nodes.push({
      id: a.id,
      type: "agent",
      label: a.name,
    });
  }

  // Dependency edges (promise → promise)
  for (const p of promises) {
    for (const depId of p.depends_on) {
      edges.push({
        source: depId,
        target: p.id,
        type: "depends_on",
      });
    }
  }

  // Agent edges
  for (const p of promises) {
    edges.push({
      source: p.promiser,
      target: p.id,
      type: "promiser",
    });
    edges.push({
      source: p.id,
      target: p.promisee,
      type: "promisee",
    });
  }

  // Verification dependency edges
  for (const p of promises) {
    if (p.verification?.dependsOnPromise) {
      edges.push({
        source: p.verification.dependsOnPromise,
        target: p.id,
        type: "verification_dependency",
      });
    }
  }

  // Threat edges
  for (const t of threats) {
    for (const affectedId of t.affectedPromiseIds) {
      edges.push({
        source: t.triggerPromiseId,
        target: affectedId,
        type: "threat",
      });
    }
  }

  return { nodes, edges };
}

/**
 * Simple force-directed layout for graph visualization.
 */
export function layoutGraph(
  graph: PromiseGraph,
  width: number,
  height: number
): PromiseGraph {
  const nodes = graph.nodes.map((n) => ({ ...n }));
  const edges = [...graph.edges];

  // Group promise nodes by domain
  const domainNodes: Record<string, typeof nodes> = {};
  const agentNodes: typeof nodes = [];

  for (const node of nodes) {
    if (node.type === "agent") {
      agentNodes.push(node);
    } else {
      const domain = node.domain || "Other";
      if (!domainNodes[domain]) domainNodes[domain] = [];
      domainNodes[domain].push(node);
    }
  }

  const domains = Object.keys(domainNodes);
  const centerX = width / 2;
  const centerY = height / 2;
  const promiseRadius = Math.min(width, height) * 0.3;
  const agentRadius = Math.min(width, height) * 0.42;

  // Place domain clusters around a circle
  let promiseIdx = 0;
  const totalPromises = nodes.filter((n) => n.type === "promise").length;

  for (let di = 0; di < domains.length; di++) {
    const domainGroup = domainNodes[domains[di]];
    for (let pi = 0; pi < domainGroup.length; pi++) {
      const angle = ((promiseIdx / totalPromises) * Math.PI * 2) - Math.PI / 2;
      const jitter = (pi * 0.15) - ((domainGroup.length - 1) * 0.075);
      domainGroup[pi].x = centerX + Math.cos(angle + jitter) * promiseRadius;
      domainGroup[pi].y = centerY + Math.sin(angle + jitter) * promiseRadius;
      promiseIdx++;
    }
  }

  // Place agent nodes on outer ring
  for (let ai = 0; ai < agentNodes.length; ai++) {
    const angle = ((ai / agentNodes.length) * Math.PI * 2) - Math.PI / 2;
    agentNodes[ai].x = centerX + Math.cos(angle) * agentRadius;
    agentNodes[ai].y = centerY + Math.sin(angle) * agentRadius;
  }

  // Simple force-directed refinement (10 iterations)
  const allNodes = nodes;
  for (let iter = 0; iter < 10; iter++) {
    // Repulsion between promise nodes
    for (let i = 0; i < allNodes.length; i++) {
      for (let j = i + 1; j < allNodes.length; j++) {
        if (allNodes[i].type === "agent" || allNodes[j].type === "agent") continue;
        const dx = (allNodes[j].x || 0) - (allNodes[i].x || 0);
        const dy = (allNodes[j].y || 0) - (allNodes[i].y || 0);
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const minDist = 50;
        if (dist < minDist) {
          const force = (minDist - dist) / dist * 0.5;
          allNodes[i].x! -= dx * force;
          allNodes[i].y! -= dy * force;
          allNodes[j].x! += dx * force;
          allNodes[j].y! += dy * force;
        }
      }
    }

    // Keep nodes within bounds
    for (const node of allNodes) {
      node.x = Math.max(30, Math.min(width - 30, node.x || centerX));
      node.y = Math.max(30, Math.min(height - 30, node.y || centerY));
    }
  }

  return { nodes, edges };
}

/**
 * Get all promises that depend on a given promise (direct + transitive).
 */
export function getDependents(promiseId: string, promises: Promise[]): string[] {
  const dependents = new Map<string, string[]>();
  for (const p of promises) {
    for (const depId of p.depends_on) {
      if (!dependents.has(depId)) dependents.set(depId, []);
      dependents.get(depId)!.push(p.id);
    }
  }

  const result: string[] = [];
  const visited = new Set<string>();
  const queue = [promiseId];

  while (queue.length > 0) {
    const current = queue.shift()!;
    const deps = dependents.get(current) || [];
    for (const dep of deps) {
      if (!visited.has(dep)) {
        visited.add(dep);
        result.push(dep);
        queue.push(dep);
      }
    }
  }

  return result;
}

/**
 * Get all promises that a given promise depends on (direct + transitive).
 */
export function getDependencies(promiseId: string, promises: Promise[]): string[] {
  const promiseMap = new Map(promises.map((p) => [p.id, p]));
  const result: string[] = [];
  const visited = new Set<string>();
  const queue = [promiseId];

  while (queue.length > 0) {
    const current = queue.shift()!;
    const promise = promiseMap.get(current);
    if (!promise) continue;

    for (const depId of promise.depends_on) {
      if (!visited.has(depId)) {
        visited.add(depId);
        result.push(depId);
        queue.push(depId);
      }
    }
  }

  return result;
}

/**
 * Count the number of direct dependents for each promise.
 */
export function countDependents(promises: Promise[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const p of promises) {
    for (const depId of p.depends_on) {
      counts.set(depId, (counts.get(depId) || 0) + 1);
    }
  }
  return counts;
}

/**
 * Calculate betweenness centrality for all promise nodes.
 *
 * Betweenness centrality of node v = fraction of all shortest paths
 * between pairs of other nodes that pass through v.
 *
 * High betweenness = the promise is a critical bridge in the network.
 * Its failure disconnects or weakens connections between clusters.
 *
 * Uses Brandes' algorithm (O(VE) — efficient for small graphs).
 */
export function calculateBetweenness(
  promises: Promise[]
): Record<string, number> {
  const n = promises.length;
  const ids = promises.map((p) => p.id);
  const centrality: Record<string, number> = {};
  for (const id of ids) centrality[id] = 0;

  // Build adjacency list (both directions — depends_on is directional
  // but betweenness considers paths in both directions)
  const adj: Record<string, string[]> = {};
  for (const p of promises) {
    if (!adj[p.id]) adj[p.id] = [];
    for (const dep of p.depends_on) {
      if (!adj[dep]) adj[dep] = [];
      adj[p.id].push(dep);
      adj[dep].push(p.id);
    }
  }

  // Brandes' algorithm
  for (const s of ids) {
    const stack: string[] = [];
    const pred: Record<string, string[]> = {};
    const sigma: Record<string, number> = {};
    const dist: Record<string, number> = {};
    const delta: Record<string, number> = {};

    for (const id of ids) {
      pred[id] = [];
      sigma[id] = 0;
      dist[id] = -1;
      delta[id] = 0;
    }
    sigma[s] = 1;
    dist[s] = 0;

    const queue: string[] = [s];
    while (queue.length > 0) {
      const v = queue.shift()!;
      stack.push(v);
      for (const w of adj[v] || []) {
        if (dist[w] < 0) {
          queue.push(w);
          dist[w] = dist[v] + 1;
        }
        if (dist[w] === dist[v] + 1) {
          sigma[w] += sigma[v];
          pred[w].push(v);
        }
      }
    }

    while (stack.length > 0) {
      const w = stack.pop()!;
      for (const v of pred[w]) {
        delta[v] += (sigma[v] / sigma[w]) * (1 + delta[w]);
      }
      if (w !== s) {
        centrality[w] += delta[w];
      }
    }
  }

  // Normalize to 0-1
  const maxVal = Math.max(...Object.values(centrality), 1);
  for (const id of ids) {
    centrality[id] = centrality[id] / maxVal;
  }

  return centrality;
}
