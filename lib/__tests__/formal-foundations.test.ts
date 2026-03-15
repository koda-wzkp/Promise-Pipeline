/**
 * Tests for Phase 2 Formal Foundations:
 * 1. Verification Hash Commitments
 * 2. Network Entropy
 * 3. Betweenness Centrality
 * 4. Little's Law Utilization
 *
 * Run with: npx tsx lib/__tests__/formal-foundations.test.ts
 */

import { promises as hb2021Promises } from "../data/hb2021";
import {
  calculateNetworkEntropy,
  identifyHighLeverageNodes,
} from "../simulation/scoring";
import { calculateBetweenness } from "../simulation/graph";
import { calculateUtilization } from "../simulation/capacity";
import { TeamMember, TeamPromise } from "../types/team";

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${message}`);
  } else {
    failed++;
    console.error(`  ✗ ${message}`);
  }
}

function assertApprox(actual: number, expected: number, tolerance: number, message: string) {
  assert(
    Math.abs(actual - expected) <= tolerance,
    `${message} (expected ~${expected}, got ${actual})`
  );
}

// ─── 1. Verification Hash Commitments ───

console.log("\n1. Verification Hash Commitments");

async function testVerificationHash() {
  // Use dynamic import since verification.ts uses crypto.subtle
  const { generateVerificationHash, verifyCommitment } = await import(
    "../utils/verification"
  );

  const testContent = "Oregon DEQ Annual Emissions Report 2024: PGE emissions 45% below baseline.";
  const result = await generateVerificationHash(testContent, "Oregon DEQ Filing Q3 2025");

  assert(typeof result.hash === "string" && result.hash.length === 64, "Hash is 64-char hex string");
  assert(result.sourceDigest === "Oregon DEQ Filing Q3 2025", "Source digest preserved");
  assert(typeof result.timestamp === "string" && result.timestamp.includes("T"), "Timestamp is ISO format");

  // Verify matching content
  const matches = await verifyCommitment(testContent, result.hash);
  assert(matches === true, "Same content verifies correctly");

  // Verify different content does NOT match
  const doesNotMatch = await verifyCommitment("Different content", result.hash);
  assert(doesNotMatch === false, "Different content does not verify");

  // Check HB 2021 promises have commitments where expected
  const promisesWithCommitments = hb2021Promises.filter(
    (p) => p.verification.commitment
  );
  assert(
    promisesWithCommitments.length >= 7,
    `HB 2021 has ${promisesWithCommitments.length} promises with commitments (expected ≥ 7)`
  );

  // Specific promises that should have commitments: P001, P002, P004, P005, P006, P013, P014, P015
  for (const id of ["P001", "P002", "P004", "P005", "P006", "P013", "P014", "P015"]) {
    const p = hb2021Promises.find((p) => p.id === id);
    assert(
      p?.verification.commitment !== undefined,
      `${id} has verification commitment`
    );
  }
}

// ─── 2. Network Entropy ───

console.log("\n2. Network Entropy");

function testNetworkEntropy() {
  const entropy = calculateNetworkEntropy(hb2021Promises);

  // Overall should be moderate (mix of statuses)
  assert(
    entropy.overall > 20 && entropy.overall < 80,
    `Overall entropy is moderate: ${entropy.overall.toFixed(1)}`
  );

  // Equity domain should have highest uncertainty (most unverifiable)
  const equityEntropy = entropy.byDomain["Equity"];
  const emissionsEntropy = entropy.byDomain["Emissions"];
  assert(
    equityEntropy > emissionsEntropy,
    `Equity entropy (${equityEntropy.toFixed(1)}) > Emissions entropy (${emissionsEntropy.toFixed(1)})`
  );

  // Verification domain should have lowest entropy (all verified)
  const verificationEntropy = entropy.byDomain["Verification"];
  assert(
    verificationEntropy === 0,
    `Verification domain has zero entropy: ${verificationEntropy}`
  );

  // Emissions domain should have low entropy (violated = 0.9 certainty, degraded = 0.6)
  assert(
    emissionsEntropy < 30,
    `Emissions has low entropy: ${emissionsEntropy.toFixed(1)}`
  );

  // Status counts should match
  assert(entropy.byStatus.verified === 6, `6 verified promises: ${entropy.byStatus.verified}`);
  assert(entropy.byStatus.violated === 1, `1 violated promise: ${entropy.byStatus.violated}`);
  assert(entropy.byStatus.unverifiable === 3, `3 unverifiable promises: ${entropy.byStatus.unverifiable}`);

  // Verification coverage: promises with method !== "none"
  const noneCount = hb2021Promises.filter((p) => p.verification.method === "none").length;
  const expectedCoverage = ((hb2021Promises.length - noneCount) / hb2021Promises.length) * 100;
  assertApprox(
    entropy.verificationCoverage,
    expectedCoverage,
    0.1,
    `Verification coverage is ${expectedCoverage.toFixed(0)}%`
  );

  // Empty array should return zero entropy
  const emptyEntropy = calculateNetworkEntropy([]);
  assert(emptyEntropy.overall === 0, "Empty array returns zero entropy");
}

testNetworkEntropy();

// ─── 3. Betweenness Centrality ───

console.log("\n3. Betweenness Centrality");

function testBetweennessCentrality() {
  const betweenness = calculateBetweenness(hb2021Promises);

  // P006 (DEQ Verification) should have high betweenness — it bridges emissions & verification
  assert(
    betweenness["P006"] > 0.3,
    `P006 (DEQ Verification) has significant betweenness: ${betweenness["P006"]?.toFixed(2)}`
  );

  // P002 (PGE Plan) should have high betweenness AND high dependents
  assert(
    betweenness["P002"] > 0.3,
    `P002 (PGE Plan) has high betweenness: ${betweenness["P002"]?.toFixed(2)}`
  );

  // Leaf promises with no dependents or dependencies should have low betweenness
  // P010, P012 are leaf-like (no one depends on them)
  assert(
    betweenness["P010"] < 0.1,
    `P010 (leaf-like) has near-zero betweenness: ${betweenness["P010"]?.toFixed(2)}`
  );

  // identifyHighLeverageNodes should rank promises meaningfully
  const leverageNodes = identifyHighLeverageNodes(hb2021Promises);
  assert(leverageNodes.length === hb2021Promises.length, "All promises have leverage scores");

  // Top leverage nodes should include P002, P003, P016 (hub+bridge nodes)
  const topIds = leverageNodes.slice(0, 5).map((n) => n.promiseId);
  assert(
    topIds.includes("P002") || topIds.includes("P016"),
    `Top leverage includes structural hubs: ${topIds.join(", ")}`
  );

  // Leverage combines both metrics
  const p002 = leverageNodes.find((n) => n.promiseId === "P002")!;
  assert(
    p002.leverage > 0,
    `P002 leverage score: ${p002.leverage.toFixed(3)} (deps: ${p002.dependentCount}, betweenness: ${p002.betweenness.toFixed(2)})`
  );
}

testBetweennessCentrality();

// ─── 4. Little's Law Utilization ───

console.log("\n4. Little's Law Utilization");

function testLittlesLawUtilization() {
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  const members: TeamMember[] = [
    {
      id: "m1", name: "Alice", type: "team-member", short: "AL",
      activePromiseCount: 3, keptRate: 0.8, mtkp: 5, loadScore: 0.6,
    },
    {
      id: "m2", name: "Bob", type: "team-member", short: "BO",
      activePromiseCount: 2, keptRate: 0.9, mtkp: 3, loadScore: 0.4,
    },
  ];

  const promises: TeamPromise[] = [
    // Alice: 2 active, 2 completed
    {
      id: "t1", isTeam: true as const, promiser: "m1", promisee: "team", body: "Task 1",
      domain: "dev", status: "declared", note: "", verification: { method: "self-report" },
      depends_on: [], origin: "voluntary", createdAt: oneWeekAgo.toISOString(),
      estimatedHours: 16,
    },
    {
      id: "t2", isTeam: true as const, promiser: "m1", promisee: "team", body: "Task 2",
      domain: "dev", status: "degraded", note: "", verification: { method: "self-report" },
      depends_on: [], origin: "voluntary", createdAt: twoWeeksAgo.toISOString(),
      estimatedHours: 24,
    },
    {
      id: "t3", isTeam: true as const, promiser: "m1", promisee: "team", body: "Task 3",
      domain: "dev", status: "verified", note: "", verification: { method: "self-report" },
      depends_on: [], origin: "voluntary", createdAt: twoWeeksAgo.toISOString(),
      estimatedHours: 8,
    },
    {
      id: "t4", isTeam: true as const, promiser: "m1", promisee: "team", body: "Task 4",
      domain: "dev", status: "verified", note: "", verification: { method: "self-report" },
      depends_on: [], origin: "voluntary", createdAt: twoWeeksAgo.toISOString(),
      estimatedHours: 16,
    },
    // Bob: 1 active, 1 completed
    {
      id: "t5", isTeam: true as const, promiser: "m2", promisee: "team", body: "Task 5",
      domain: "ops", status: "declared", note: "", verification: { method: "self-report" },
      depends_on: [], origin: "voluntary", createdAt: oneWeekAgo.toISOString(),
      estimatedHours: 8,
    },
    {
      id: "t6", isTeam: true as const, promiser: "m2", promisee: "team", body: "Task 6",
      domain: "ops", status: "verified", note: "", verification: { method: "self-report" },
      depends_on: [], origin: "voluntary", createdAt: twoWeeksAgo.toISOString(),
      estimatedHours: 16,
    },
  ];

  const metrics = calculateUtilization(promises, members, 4);

  assert(typeof metrics.teamUtilization === "number", "Team utilization is a number");
  assert(metrics.arrivalRate > 0, `Arrival rate > 0: ${metrics.arrivalRate.toFixed(1)}/week`);
  assert(metrics.completionRate > 0, `Completion rate > 0: ${metrics.completionRate.toFixed(1)}/week`);
  assert(metrics.averageCompletionDays > 0, `Avg completion days > 0: ${metrics.averageCompletionDays}`);
  assert(metrics.expectedQueueLength >= 0, `Expected queue length ≥ 0: ${metrics.expectedQueueLength}`);

  // Per-member breakdown
  assert("m1" in metrics.byMember, "Alice has member metrics");
  assert("m2" in metrics.byMember, "Bob has member metrics");
  assert(
    metrics.byMember["m1"].activeCount === 2,
    `Alice has 2 active: ${metrics.byMember["m1"].activeCount}`
  );
  assert(
    metrics.byMember["m2"].activeCount === 1,
    `Bob has 1 active: ${metrics.byMember["m2"].activeCount}`
  );

  // Overload detection: create an overloaded team
  const heavyPromises: TeamPromise[] = Array.from({ length: 20 }, (_, i) => ({
    id: `h${i}`,
    isTeam: true as const,
    promiser: "m1",
    promisee: "team",
    body: `Heavy task ${i}`,
    domain: "dev",
    status: "declared" as const,
    note: "",
    verification: { method: "self-report" as const },
    depends_on: [],
    origin: "voluntary" as const,
    createdAt: oneWeekAgo.toISOString(),
    estimatedHours: 40,
  }));

  const heavyMetrics = calculateUtilization(heavyPromises, [members[0]], 4);
  assert(
    heavyMetrics.teamUtilization >= 1.0,
    `Overloaded team has utilization ≥ 1.0: ${heavyMetrics.teamUtilization.toFixed(2)}`
  );
  assert(
    heavyMetrics.timeToOverload !== null,
    `Overloaded team triggers overload warning: timeToOverload = ${heavyMetrics.timeToOverload}`
  );

  // Empty team
  const emptyMetrics = calculateUtilization([], [], 4);
  assert(emptyMetrics.teamUtilization === 0, "Empty team has zero utilization");
}

testLittlesLawUtilization();

// ─── Run async tests and report ───

async function run() {
  console.log("\n1. Verification Hash Commitments (async)");
  try {
    await testVerificationHash();
  } catch (e) {
    console.error("  ✗ Verification hash test error:", e);
    failed++;
  }

  console.log(`\n${"=".repeat(50)}`);
  console.log(`Results: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

run();
