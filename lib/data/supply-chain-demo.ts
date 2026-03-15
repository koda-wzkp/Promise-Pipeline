import { Agent, Promise, Domain, Insight, Trajectory, DashboardData } from "../types/promise";

export const agents: Agent[] = [
  { id: "NKE", name: "Nike", type: "brand", short: "NKE" },
  { id: "PTG", name: "Patagonia", type: "brand", short: "PTG" },
  { id: "FLA", name: "Fair Labor Association", type: "auditor", short: "FLA" },
  { id: "WKR", name: "Factory Workers", type: "community", short: "WKR" },
  { id: "ENV", name: "Environmental Monitors", type: "monitor", short: "ENV" },
];

export const promises: Promise[] = [
  {
    id: "SC-001",
    promiser: "NKE",
    promisee: "WKR",
    body: "Ensure all Tier 1 suppliers comply with Nike Code of Conduct on labor standards",
    domain: "Labor",
    status: "degraded",
    note: "Nike audits Tier 1 suppliers but Tier 2/3 visibility remains limited. FLA reports ongoing violations in Southeast Asian facilities.",
    verification: { method: "audit", source: "Fair Labor Association", metric: "Compliance rate %", frequency: "annual" },
    depends_on: [],
    polarity: "give",
    origin: "voluntary",
  },
  {
    id: "SC-002",
    promiser: "PTG",
    promisee: "ENV",
    body: "Use 100% recycled or renewable materials in products by 2025",
    domain: "Materials",
    status: "degraded",
    target: "2025-12-31",
    progress: 68,
    required: 100,
    note: "Patagonia has achieved ~68% recycled materials. Timeline extended to 2027 for full compliance.",
    verification: { method: "audit", source: "Bluesign", metric: "% recycled materials", frequency: "annual" },
    depends_on: [],
    polarity: "give",
    origin: "voluntary",
  },
  {
    id: "SC-003",
    promiser: "NKE",
    promisee: "ENV",
    body: "Reduce supply chain carbon emissions 30% by 2030 (Scope 3)",
    domain: "Emissions",
    status: "declared",
    target: "2030-12-31",
    progress: 12,
    required: 30,
    note: "Nike has set SBTi-aligned targets but Scope 3 measurement across suppliers is inconsistent.",
    verification: { method: "self-report", source: "Nike Impact Report", metric: "MT CO2e (Scope 3)", frequency: "annual" },
    depends_on: ["SC-001"],
    polarity: "give",
    origin: "voluntary",
  },
  {
    id: "SC-004",
    promiser: "FLA",
    promisee: "WKR",
    body: "Conduct independent audits of member company supply chains annually",
    domain: "Verification",
    status: "verified",
    note: "FLA conducts annual independent assessments. Reports are publicly available.",
    verification: { method: "audit", source: "Fair Labor Association" },
    depends_on: [],
    polarity: "give",
    origin: "negotiated",
  },
  {
    id: "SC-005",
    promiser: "PTG",
    promisee: "WKR",
    body: "Publish complete supplier list with factory names, locations, and worker counts",
    domain: "Transparency",
    status: "verified",
    note: "Patagonia publishes its full supplier list on its website, updated annually.",
    verification: { method: "self-report", source: "Patagonia" },
    depends_on: [],
    polarity: "give",
    origin: "voluntary",
  },
];

export const domains: Domain[] = [
  { name: "Labor", color: "#dc2626", promiseCount: 1, healthScore: 40 },
  { name: "Materials", color: "#059669", promiseCount: 1, healthScore: 55 },
  { name: "Emissions", color: "#d97706", promiseCount: 1, healthScore: 30 },
  { name: "Verification", color: "#7c3aed", promiseCount: 1, healthScore: 90 },
  { name: "Transparency", color: "#2563eb", promiseCount: 1, healthScore: 85 },
];

export const insights: Insight[] = [
  {
    severity: "warning",
    type: "Gap",
    title: "Tier 2/3 Visibility Gap",
    body: "Brand promises apply to Tier 1 suppliers but sub-tier suppliers remain largely invisible. This is the structural equivalent of the equity verification gap in civic promises.",
    promises: ["SC-001", "SC-003"],
  },
  {
    severity: "positive",
    type: "Working",
    title: "Independent Auditing Model",
    body: "FLA's independent audit program provides a verification model that most civic accountability structures lack.",
    promises: ["SC-004"],
  },
];

export const trajectories: Trajectory[] = [];

export const supplyChainDemoData: DashboardData = {
  title: "Supply Chain Accountability",
  subtitle: "Tracking labor, environmental, and transparency promises in global supply chains",
  agents,
  promises,
  domains,
  insights,
  trajectories,
  grade: "C+",
  gradeExplanation: "Leading brands have strong verification for Tier 1 suppliers but structural visibility gaps persist in lower tiers and Scope 3 emissions.",
};
