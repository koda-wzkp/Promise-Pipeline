import { Agent, Promise, Domain, Insight, Trajectory, DashboardData } from "../types/promise";

export const agents: Agent[] = [
  { id: "OAI", name: "OpenAI", type: "provider", short: "OAI" },
  { id: "ANT", name: "Anthropic", type: "provider", short: "ANT" },
  { id: "GOO", name: "Google DeepMind", type: "provider", short: "GOO" },
  { id: "NIS", name: "NIST", type: "regulator", short: "NIS" },
  { id: "CIV", name: "Civil Society", type: "community", short: "CIV" },
];

export const promises: Promise[] = [
  {
    id: "AI-001",
    promiser: "OAI",
    promisee: "CIV",
    body: "Publish model cards with safety evaluations for all frontier models before release",
    domain: "Transparency",
    status: "degraded",
    note: "Model cards published but safety evaluation detail varies significantly across releases.",
    verification: { method: "self-report", source: "OpenAI" },
    depends_on: [],
    polarity: "give",
    origin: "voluntary",
  },
  {
    id: "AI-002",
    promiser: "ANT",
    promisee: "CIV",
    body: "Maintain responsible scaling policy with defined capability thresholds",
    domain: "Safety",
    status: "verified",
    note: "Anthropic's RSP is published and updated. ASL levels defined with clear thresholds.",
    verification: { method: "self-report", source: "Anthropic" },
    depends_on: [],
    polarity: "give",
    origin: "voluntary",
  },
  {
    id: "AI-003",
    promiser: "GOO",
    promisee: "NIS",
    body: "Participate in pre-deployment safety testing for frontier AI models",
    domain: "Safety",
    status: "declared",
    note: "Commitment made but the testing framework is still being defined by NIST.",
    verification: { method: "benchmark", source: "NIST AI Safety Institute" },
    depends_on: [],
    polarity: "give",
    origin: "voluntary",
  },
  {
    id: "AI-004",
    promiser: "OAI",
    promisee: "CIV",
    body: "Implement robust content provenance for AI-generated media",
    domain: "Transparency",
    status: "declared",
    note: "C2PA metadata support announced but not yet deployed across all products.",
    verification: { method: "none" },
    depends_on: ["AI-001"],
    polarity: "give",
    origin: "voluntary",
  },
  {
    id: "AI-005",
    promiser: "NIS",
    promisee: "CIV",
    body: "Publish AI safety evaluation framework for frontier model assessment",
    domain: "Verification",
    status: "degraded",
    note: "NIST AI RMF published but frontier-specific evaluation benchmarks remain incomplete.",
    verification: { method: "filing", source: "NIST" },
    depends_on: [],
    polarity: "give",
    origin: "imposed",
  },
];

export const domains: Domain[] = [
  { name: "Safety", color: "#dc2626", promiseCount: 2, healthScore: 65 },
  { name: "Transparency", color: "#2563eb", promiseCount: 2, healthScore: 45 },
  { name: "Verification", color: "#7c3aed", promiseCount: 1, healthScore: 30 },
];

export const insights: Insight[] = [
  {
    severity: "warning",
    type: "Gap",
    title: "Voluntary Commitments Lack Enforcement",
    body: "All AI safety promises are voluntary. There is no statutory enforcement mechanism comparable to Oregon HB 2021's regulatory structure.",
    promises: ["AI-001", "AI-002", "AI-003"],
  },
  {
    severity: "positive",
    type: "Working",
    title: "Responsible Scaling as a Model",
    body: "Anthropic's RSP represents the most structured voluntary commitment in the AI safety space, with defined capability thresholds triggering additional safeguards.",
    promises: ["AI-002"],
  },
];

export const trajectories: Trajectory[] = [];

export const aiDemoData: DashboardData = {
  title: "AI Safety Accountability",
  subtitle: "Tracking AI safety promises across frontier model developers",
  agents,
  promises,
  domains,
  insights,
  trajectories,
  grade: "C",
  gradeExplanation: "AI safety commitments are largely voluntary and lack independent verification. Strong intentions, weak accountability infrastructure.",
};
