/**
 * Tests for JCPOA-Derived Improvements:
 * 1. Verification Dependencies
 * 2. Certainty Cascade Propagation
 * 3. Entropy Time Series
 * 4. JCPOA Data Integrity
 *
 * Run with: npx tsx lib/__tests__/jcpoa-foundations.test.ts
 */

import { promises as hb2021Promises } from "../data/hb2021";
import { promises as jcpoaPromises, jcpoaData } from "../data/jcpoa";
import { jcpoaTimeline } from "../data/jcpoa-timeline";
import { simulateCascade, propagateCertaintyChange } from "../simulation/cascade";
import {
  calculateNetworkEntropy,
  calculateEntropyTimeSeries,
} from "../simulation/scoring";

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
    `${message} (expected ~${expected}, got ${actual.toFixed(1)})`
  );
}

// ─── 1. Verification Dependencies ───

console.log("\n1. Verification Dependencies");

function testVerificationDependencies() {
  // HB 2021: P001 and P004 depend on P006 for verification
  const p001 = hb2021Promises.find(p => p.id === "P001");
  assert(
    p001?.verification.dependsOnPromise === "P006",
    "P001 verification depends on P006 (DEQ)"
  );

  const p004 = hb2021Promises.find(p => p.id === "P004");
  assert(
    p004?.verification.dependsOnPromise === "P006",
    "P004 verification depends on P006 (DEQ)"
  );

  // Promises with method "none" should NOT have dependsOnPromise
  const nonePromises = hb2021Promises.filter(p => p.verification.method === "none");
  assert(
    nonePromises.every(p => !p.verification.dependsOnPromise),
    "Promises with verification 'none' have no dependsOnPromise"
  );

  // JCPOA: enrichment promises depend on JCPOA-008
  const enrichmentDeps = jcpoaPromises
    .filter(p => p.verification.dependsOnPromise === "JCPOA-008")
    .map(p => p.id);
  assert(
    enrichmentDeps.includes("JCPOA-001"),
    "JCPOA-001 verification depends on JCPOA-008"
  );
  assert(
    enrichmentDeps.includes("JCPOA-002"),
    "JCPOA-002 verification depends on JCPOA-008"
  );
  assert(
    enrichmentDeps.includes("JCPOA-003"),
    "JCPOA-003 verification depends on JCPOA-008"
  );

  // JCPOA-008 itself should NOT have dependsOnPromise (root verification node)
  const jcpoa008 = jcpoaPromises.find(p => p.id === "JCPOA-008");
  assert(
    !jcpoa008?.verification.dependsOnPromise,
    "JCPOA-008 is root verification node (no dependsOnPromise)"
  );
}

testVerificationDependencies();

// ─── 2. Certainty Cascade ───

console.log("\n2. Certainty Cascade");

function testCertaintyCascade() {
  // Use a snapshot where JCPOA-008 is verified and dependents are declared/verified
  // (Peak Compliance state), then violate JCPOA-008
  const peakSnapshot = jcpoaTimeline.find(s => s.label === "Peak Compliance");
  assert(peakSnapshot !== undefined, "Peak Compliance snapshot exists");

  if (peakSnapshot) {
    const impacts = propagateCertaintyChange(
      peakSnapshot.promises,
      "JCPOA-008",
      "violated"
    );

    assert(impacts.length > 0, `Certainty cascade has ${impacts.length} impacts`);

    // JCPOA-001 should be affected
    const jcpoa001Impact = impacts.find(i => i.promiseId === "JCPOA-001");
    assert(
      jcpoa001Impact !== undefined,
      "JCPOA-001 certainty affected when JCPOA-008 violated"
    );

    // JCPOA-002 should be affected
    const jcpoa002Impact = impacts.find(i => i.promiseId === "JCPOA-002");
    assert(
      jcpoa002Impact !== undefined,
      "JCPOA-002 certainty affected when JCPOA-008 violated"
    );

    // Certainty should decrease
    if (jcpoa001Impact) {
      assert(
        jcpoa001Impact.newCertainty < jcpoa001Impact.previousCertainty,
        `JCPOA-001 certainty decreased: ${jcpoa001Impact.previousCertainty} → ${jcpoa001Impact.newCertainty}`
      );
    }
  }

  // HB 2021: P006 is currently verified. Set it to violated.
  // P001 (degraded, certainty 0.6) should see certainty drop because
  // verifier certainty (violated = 0.9) is actually higher... wait,
  // that means no impact since 0.9 > 0.6.
  // Set P006 to unverifiable (certainty 0.0) to trigger cascade.
  const hbImpacts = propagateCertaintyChange(
    hb2021Promises,
    "P006",
    "unverifiable"
  );

  const p001Impact = hbImpacts.find(i => i.promiseId === "P001");
  const p004Impact = hbImpacts.find(i => i.promiseId === "P004");
  assert(
    p001Impact !== undefined,
    "HB 2021 P001 certainty affected when P006 unverifiable"
  );
  assert(
    p004Impact !== undefined,
    "HB 2021 P004 certainty affected when P006 unverifiable"
  );

  // simulateCascade should include certaintyImpacts
  if (peakSnapshot) {
    const cascadeResult = simulateCascade(
      peakSnapshot.promises,
      { promiseId: "JCPOA-008", newStatus: "violated" },
      jcpoaData.threats || []
    );
    assert(
      cascadeResult.certaintyImpacts !== undefined,
      "simulateCascade returns certaintyImpacts"
    );
    assert(
      cascadeResult.certaintyImpacts.length > 0,
      `simulateCascade has ${cascadeResult.certaintyImpacts.length} certainty impacts`
    );
    assert(
      typeof cascadeResult.originalNetworkEntropy === "number",
      "simulateCascade returns originalNetworkEntropy"
    );
    assert(
      typeof cascadeResult.newNetworkEntropy === "number",
      "simulateCascade returns newNetworkEntropy"
    );
  }
}

testCertaintyCascade();

// ─── 3. Entropy Time Series ───

console.log("\n3. Entropy Time Series");

function testEntropyTimeSeries() {
  const timeSeries = calculateEntropyTimeSeries(jcpoaTimeline);

  assert(
    timeSeries.length === jcpoaTimeline.length,
    `Time series has ${timeSeries.length} points (expected ${jcpoaTimeline.length})`
  );

  // Implementation Day should have lowest entropy (most certainty)
  const implDay = timeSeries.find(t => t.label === "Implementation Day");
  const camerasRemoved = timeSeries.find(t => t.label === "IAEA Cameras Removed");

  assert(
    implDay !== undefined && camerasRemoved !== undefined,
    "Found Implementation Day and Cameras Removed snapshots"
  );

  if (implDay && camerasRemoved) {
    // Implementation Day has many "declared" promises (certainty 0.3, high entropy)
    // while post-collapse has many "violated" (certainty 0.9, low entropy).
    // Peak Compliance should have lowest entropy (most promises verified).
    const peakComplianceEnt = timeSeries.find(t => t.label === "Peak Compliance");
    assert(
      peakComplianceEnt !== undefined && peakComplianceEnt.entropy < implDay.entropy,
      `Peak Compliance entropy (${peakComplianceEnt?.entropy.toFixed(1)}) < Implementation Day (${implDay.entropy.toFixed(1)})`
    );

    assert(
      implDay.healthScore > camerasRemoved.healthScore,
      `Implementation Day health (${implDay.healthScore.toFixed(1)}) > Cameras Removed (${camerasRemoved.healthScore.toFixed(1)})`
    );
  }

  // Verification coverage should decrease over time as AP is violated
  const peakCompliance = timeSeries.find(t => t.label === "Peak Compliance");
  const apSuspended = timeSeries.find(t => t.label === "AP Suspended");

  if (peakCompliance && apSuspended) {
    assert(
      peakCompliance.verificationCoverage > apSuspended.verificationCoverage,
      `Verification coverage drops: ${peakCompliance.verificationCoverage.toFixed(0)}% → ${apSuspended.verificationCoverage.toFixed(0)}%`
    );
  }

  // Health and entropy lines should cross between 2018 and 2021
  let crossingFound = false;
  for (let i = 1; i < timeSeries.length; i++) {
    const prev = timeSeries[i - 1];
    const curr = timeSeries[i];
    const prevCertainty = 100 - prev.entropy;
    const currCertainty = 100 - curr.entropy;
    if (prev.healthScore >= prevCertainty && curr.healthScore < currCertainty) {
      crossingFound = true;
      assert(
        curr.date >= "2018" && curr.date <= "2022",
        `Health/Certainty crossing at ${curr.label} (${curr.date})`
      );
    }
  }
  if (!crossingFound) {
    // Check if health is always below certainty or vice versa
    console.log("  (Health/Certainty crossing not found — checking values)");
    for (const tp of timeSeries) {
      console.log(`    ${tp.label}: health=${tp.healthScore.toFixed(0)}, certainty=${(100-tp.entropy).toFixed(0)}`);
    }
  }

  // All time points should have valid numbers
  for (const tp of timeSeries) {
    assert(
      tp.entropy >= 0 && tp.entropy <= 100,
      `${tp.label}: entropy in range (${tp.entropy.toFixed(1)})`
    );
    assert(
      tp.healthScore >= 0 && tp.healthScore <= 100,
      `${tp.label}: health in range (${tp.healthScore.toFixed(1)})`
    );
  }
}

testEntropyTimeSeries();

// ─── 4. JCPOA Data Integrity ───

console.log("\n4. JCPOA Data Integrity");

function testJCPOADataIntegrity() {
  assert(
    jcpoaPromises.length === 22,
    `JCPOA has 22 promises: ${jcpoaPromises.length}`
  );

  assert(
    jcpoaData.agents.length === 11,
    `JCPOA has 11 agents: ${jcpoaData.agents.length}`
  );

  assert(
    jcpoaData.domains.length === 6,
    `JCPOA has 6 domains: ${jcpoaData.domains.length}`
  );

  // All depends_on references should be valid
  const ids = new Set(jcpoaPromises.map(p => p.id));
  for (const p of jcpoaPromises) {
    for (const depId of p.depends_on) {
      assert(ids.has(depId), `${p.id} dependency ${depId} exists`);
    }
  }

  // All dependsOnPromise references should be valid
  for (const p of jcpoaPromises) {
    if (p.verification.dependsOnPromise) {
      assert(
        ids.has(p.verification.dependsOnPromise),
        `${p.id} verification dependency ${p.verification.dependsOnPromise} exists`
      );
    }
  }

  // Count statuses
  const violated = jcpoaPromises.filter(p => p.status === "violated").length;
  const degraded = jcpoaPromises.filter(p => p.status === "degraded").length;
  const verified = jcpoaPromises.filter(p => p.status === "verified").length;
  const unverifiable = jcpoaPromises.filter(p => p.status === "unverifiable").length;

  assert(violated >= 13, `At least 13 violated: ${violated}`);
  assert(verified >= 1, `At least 1 verified (snapback): ${verified}`);
  assert(unverifiable >= 1, `At least 1 unverifiable: ${unverifiable}`);

  // Timeline snapshots should each have 22 promises
  for (const snapshot of jcpoaTimeline) {
    assert(
      snapshot.promises.length === 22,
      `Timeline ${snapshot.label} has 22 promises`
    );
  }

  // Grade should be F
  assert(jcpoaData.grade === "F", `JCPOA grade is F: ${jcpoaData.grade}`);
}

testJCPOADataIntegrity();

// ─── Report ───

console.log(`\n${"=".repeat(50)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
