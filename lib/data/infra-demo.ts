import { Agent, Promise, Domain, Insight, Trajectory, DashboardData } from "../types/promise";

export const agents: Agent[] = [
  { id: "AWS", name: "Amazon Web Services", type: "provider", short: "AWS" },
  { id: "GCP", name: "Google Cloud", type: "provider", short: "GCP" },
  { id: "AZR", name: "Microsoft Azure", type: "provider", short: "AZR" },
  { id: "CUS", name: "Enterprise Customers", type: "stakeholder", short: "CUS" },
];

export const promises: Promise[] = [
  {
    id: "SLA-001",
    promiser: "AWS",
    promisee: "CUS",
    body: "Maintain 99.99% uptime SLA for compute instances (EC2)",
    domain: "Uptime",
    status: "verified",
    note: "AWS EC2 has maintained >99.99% uptime across most regions. Service credits issued for documented outages.",
    verification: { method: "sensor", source: "AWS Status Page", metric: "Uptime %", frequency: "continuous" },
    depends_on: [],
    polarity: "give",
    origin: "negotiated",
  },
  {
    id: "SLA-002",
    promiser: "GCP",
    promisee: "CUS",
    body: "Maintain 99.95% uptime SLA for Compute Engine",
    domain: "Uptime",
    status: "verified",
    note: "GCP Compute Engine meets SLA targets. Notable outage in Q3 2024 triggered service credits.",
    verification: { method: "sensor", source: "GCP Status Dashboard", metric: "Uptime %", frequency: "continuous" },
    depends_on: [],
    polarity: "give",
    origin: "negotiated",
  },
  {
    id: "SLA-003",
    promiser: "AZR",
    promisee: "CUS",
    body: "Maintain 99.99% uptime SLA for Virtual Machines",
    domain: "Uptime",
    status: "degraded",
    note: "Azure experienced multiple significant outages in 2024. Availability zones mitigate risk but multi-region failures occurred.",
    verification: { method: "sensor", source: "Azure Status", metric: "Uptime %", frequency: "continuous" },
    depends_on: [],
    polarity: "give",
    origin: "negotiated",
  },
  {
    id: "SLA-004",
    promiser: "AWS",
    promisee: "CUS",
    body: "Achieve net-zero carbon emissions across all AWS operations by 2040",
    domain: "Sustainability",
    status: "declared",
    note: "Amazon has committed to net-zero by 2040 via The Climate Pledge. Data center energy mix improving but absolute emissions growing with capacity.",
    verification: { method: "self-report", source: "Amazon Sustainability Report" },
    depends_on: [],
    polarity: "give",
    origin: "voluntary",
  },
  {
    id: "SLA-005",
    promiser: "GCP",
    promisee: "CUS",
    body: "Run on 24/7 carbon-free energy by 2030",
    domain: "Sustainability",
    status: "degraded",
    note: "Google has achieved ~64% carbon-free energy across data centers but 24/7 matching remains a challenge.",
    verification: { method: "audit", source: "Google Environmental Report", metric: "% carbon-free energy", frequency: "annual" },
    depends_on: [],
    polarity: "give",
    origin: "voluntary",
  },
];

export const domains: Domain[] = [
  { name: "Uptime", color: "#2563eb", promiseCount: 3, healthScore: 75 },
  { name: "Sustainability", color: "#059669", promiseCount: 2, healthScore: 45 },
];

export const insights: Insight[] = [
  {
    severity: "positive",
    type: "Working",
    title: "SLA Verification is Automated",
    body: "Unlike civic promises, infrastructure SLAs have sensor-based verification with real-time status pages and contractual service credits.",
    promises: ["SLA-001", "SLA-002", "SLA-003"],
  },
  {
    severity: "warning",
    type: "Gap",
    title: "Sustainability Promises Lack Independent Audit",
    body: "Carbon-free energy commitments rely on self-reporting. No independent sensor verification exists for claimed carbon-free percentages.",
    promises: ["SLA-004", "SLA-005"],
  },
];

export const trajectories: Trajectory[] = [];

export const infraDemoData: DashboardData = {
  title: "Infrastructure SLA Accountability",
  subtitle: "Tracking uptime and sustainability promises across cloud providers",
  agents,
  promises,
  domains,
  insights,
  trajectories,
  grade: "B",
  gradeExplanation: "Infrastructure providers have the strongest verification infrastructure (sensor-based SLAs) but sustainability commitments remain unverified.",
};
