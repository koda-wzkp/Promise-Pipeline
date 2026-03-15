import { Promise, PromiseStatus } from "../types/promise";
import { promises as basePromises } from "./jcpoa";

/**
 * JCPOA Historical Snapshots — status of all 22 promises at key dates.
 *
 * Each snapshot creates a full copy of the promise array with statuses
 * adjusted to that point in time. Used for entropy time series calculation.
 */

type StatusOverrides = Partial<Record<string, PromiseStatus>>;

function createSnapshot(
  date: string,
  label: string,
  overrides: StatusOverrides
): { date: string; label: string; promises: Promise[] } {
  return {
    date,
    label,
    promises: basePromises.map((p) => ({
      ...p,
      status: overrides[p.id] ?? p.status,
    })),
  };
}

// ─── Implementation Day: Jan 16, 2016 ───
// Iran is complying. IAEA has full access. Sanctions being lifted.
const implementationDay: StatusOverrides = {
  "JCPOA-001": "declared",  // Complying, not yet independently verified for full period
  "JCPOA-002": "declared",
  "JCPOA-003": "declared",
  "JCPOA-004": "declared",
  "JCPOA-005": "declared",
  "JCPOA-006": "declared",
  "JCPOA-007": "declared",
  "JCPOA-008": "verified",  // AP implemented
  "JCPOA-009": "verified",  // IAEA cameras operational
  "JCPOA-010": "degraded",  // PMD file closed with caveats
  "JCPOA-011": "verified",  // U.S. sanctions lifted
  "JCPOA-012": "verified",  // EU sanctions lifted
  "JCPOA-013": "verified",  // UNSCR 2231 in effect
  "JCPOA-014": "verified",  // No new sanctions yet
  "JCPOA-015": "verified",  // Non-interference maintained
  "JCPOA-016": "declared",  // Trade normalization beginning
  "JCPOA-017": "declared",  // SWIFT access being restored
  "JCPOA-018": "unverifiable", // Dispute mechanism untested
  "JCPOA-019": "declared",  // Sunset adherence on track
  "JCPOA-020": "declared",  // Snapback not yet invoked
  "JCPOA-021": "declared",  // Civil nuclear cooperation starting
  "JCPOA-022": "degraded",  // Missile tests ongoing
};

// ─── Peak Compliance: Jan 2018 ───
// Two years in. IAEA has confirmed compliance in 10+ quarterly reports.
const peakCompliance: StatusOverrides = {
  "JCPOA-001": "verified",
  "JCPOA-002": "verified",
  "JCPOA-003": "verified",
  "JCPOA-004": "verified",
  "JCPOA-005": "verified",
  "JCPOA-006": "verified",
  "JCPOA-007": "verified",
  "JCPOA-008": "verified",
  "JCPOA-009": "verified",
  "JCPOA-010": "degraded",
  "JCPOA-011": "verified",
  "JCPOA-012": "verified",
  "JCPOA-013": "verified",
  "JCPOA-014": "verified",
  "JCPOA-015": "verified",
  "JCPOA-016": "degraded",  // Trade below expectations
  "JCPOA-017": "degraded",  // SWIFT access limited
  "JCPOA-018": "unverifiable",
  "JCPOA-019": "verified",
  "JCPOA-020": "declared",
  "JCPOA-021": "degraded",
  "JCPOA-022": "degraded",
};

// ─── U.S. Withdrawal: May 8, 2018 ───
// U.S. exits. Iran still complying at this point.
const usWithdrawal: StatusOverrides = {
  ...peakCompliance,
  "JCPOA-011": "violated",  // Sanctions reimposed
  "JCPOA-014": "violated",  // New sanctions
  "JCPOA-015": "violated",  // Non-interference violated
};

// ─── Iran Begins Violations: July 1, 2019 ───
// Iran exceeds enrichment cap, begins centrifuge expansion.
const iranViolations: StatusOverrides = {
  ...usWithdrawal,
  "JCPOA-001": "violated",  // Exceeded 3.67%
  "JCPOA-002": "violated",  // Advanced centrifuges
  "JCPOA-003": "violated",  // Fordow enrichment resumed
  "JCPOA-005": "violated",  // R&D limits breached
  "JCPOA-006": "violated",  // New construction
  "JCPOA-012": "degraded",  // EU relief meaningless
  "JCPOA-016": "degraded",
  "JCPOA-017": "degraded",
  "JCPOA-019": "violated",
  "JCPOA-021": "degraded",
};

// ─── AP Suspended: Feb 23, 2021 ───
// Iran suspends Additional Protocol. Massive certainty cascade.
const apSuspended: StatusOverrides = {
  ...iranViolations,
  "JCPOA-004": "violated",  // Heavy water violations
  "JCPOA-007": "degraded",  // Reprocessing unverifiable
  "JCPOA-008": "violated",  // AP suspended
  "JCPOA-009": "degraded",  // Monitoring severely limited
  "JCPOA-012": "degraded",
  "JCPOA-016": "degraded",
  "JCPOA-017": "degraded",
  "JCPOA-021": "degraded",
  "JCPOA-022": "violated",
};

// ─── IAEA Cameras Removed: June 8, 2022 ───
// Iran removes IAEA cameras. Continuous monitoring gone.
const camerasRemoved: StatusOverrides = {
  ...apSuspended,
  "JCPOA-009": "violated",  // Cameras removed
  "JCPOA-010": "degraded",  // PMD cooperation nil
  "JCPOA-012": "degraded",
};

// ─── Snapback Activated: September 28, 2025 ───
// UK triggers snapback. UNSC resolutions restored.
const snapback: StatusOverrides = {
  ...camerasRemoved,
  "JCPOA-013": "violated",  // Prior resolutions restored = JCPOA-013 reversed
  "JCPOA-020": "verified",  // Snapback mechanism worked
};

// ─── Iran Declares JCPOA Terminated: October 18, 2025 ───
// Final state: near-total collapse.
const terminated: StatusOverrides = {
  "JCPOA-001": "violated",
  "JCPOA-002": "violated",
  "JCPOA-003": "violated",
  "JCPOA-004": "violated",
  "JCPOA-005": "violated",
  "JCPOA-006": "violated",
  "JCPOA-007": "degraded",
  "JCPOA-008": "violated",
  "JCPOA-009": "violated",
  "JCPOA-010": "degraded",
  "JCPOA-011": "violated",
  "JCPOA-012": "degraded",
  "JCPOA-013": "violated",
  "JCPOA-014": "violated",
  "JCPOA-015": "violated",
  "JCPOA-016": "violated",
  "JCPOA-017": "violated",
  "JCPOA-018": "unverifiable",
  "JCPOA-019": "violated",
  "JCPOA-020": "verified",
  "JCPOA-021": "violated",
  "JCPOA-022": "violated",
};

export const jcpoaTimeline: { date: string; label: string; promises: Promise[] }[] = [
  createSnapshot("2016-01-16", "Implementation Day", implementationDay),
  createSnapshot("2018-01-16", "Peak Compliance", peakCompliance),
  createSnapshot("2018-05-08", "U.S. Withdrawal", usWithdrawal),
  createSnapshot("2019-07-01", "Iran Begins Violations", iranViolations),
  createSnapshot("2021-02-23", "AP Suspended", apSuspended),
  createSnapshot("2022-06-08", "IAEA Cameras Removed", camerasRemoved),
  createSnapshot("2025-09-28", "Snapback Activated", snapback),
  createSnapshot("2025-10-18", "Iran Declares JCPOA Terminated", terminated),
];
