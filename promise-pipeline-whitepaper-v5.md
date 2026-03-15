**PROMISE PIPELINE**

A Trust Primitive for Commitment Networks

From Accountability Tracking to Predictive Simulation

Conor Nolan-Finkel

Pleco / Promise Pipeline

Version 5.0 — March 2026

*Every institution, law, and AI system rests on a network of
interdependent commitments. So does every team, every relationship, and
every promise we make to ourselves. These commitments are currently
scattered, self-assessed, and invisible to the people they are meant to
protect.
Promise Pipeline provides a trust primitive: a structured, auditable,
simulable graph of who promised what to whom, verified how, and whether
it was kept. By modeling commitments as networks and training on decades
of public data, we move from reactive accountability—did they keep
their promise?—to predictive accountability: will this network of
promises produce the intended outcome?*

**1. The Accountability Gap**

Modern institutions operate on networks of promises. Legislation commits
specific agents to specific outcomes on specific timelines. AI companies
publish safety commitments, model cards, and responsible use policies.
Corporations issue ESG pledges, SLA guarantees, and supply chain
certifications. In every domain, the pattern is the same: autonomous
agents make commitments to stakeholders, and the stakeholders have no
systematic way to verify whether those commitments are being kept.

The accountability infrastructure that does exist is fragmented. In
climate policy, compliance data is scattered across utility filings,
regulatory dockets, and agency reports that no citizen can practically
synthesize. In AI safety, behavioral commitments are buried in blog
posts, model cards, and terms of service that change without notice. In
corporate governance, ESG pledges are self-assessed against
self-selected metrics. In every case, the accountability structures are
present but illegible—visible to specialists who know where to look,
invisible to the stakeholders they are meant to protect.

This paper describes Promise Pipeline, an open-source platform released
under the GNU Affero General Public License (AGPL-3.0) that addresses
this gap by applying Promise Theory to commitment tracking, auditing,
and simulation across domains. The framework treats every
verifiable commitment—whether statutory, corporate, or
algorithmic—as a structured promise with a defined promiser, promisee,
body, verification mechanism, and deadline. By modeling these promises
as a graph of interdependent commitments and applying machine learning
to that graph, Promise Pipeline moves beyond static accountability
dashboards toward a simulation engine capable of answering
counterfactual questions: what happens to this network of promises if a
key commitment fails?

**1.1 Why Existing Approaches Fall Short**

The dominant paradigm in both AI safety and regulatory compliance is
**obligation-based enforcement**: define what agents must do, impose the
rules, and punish violations. This framing has produced real
results—models are measurably safer than three years ago, and
regulated industries do meet compliance thresholds. But obligation-based
systems have structural limitations that better enforcement within the
paradigm cannot resolve.

In distributed systems, Mark Burgess identified this problem two decades
ago: centrally imposed policies consistently fail when autonomous nodes
encounter conditions the policy designer did not anticipate.[^1] His
alternative—having each node publish its own behavioral commitments
(promises)—proved more robust not because the commitments were better
written, but because the architecture handled novelty differently. An
obligation has no mechanism to degrade gracefully. A promise, by design,
can be renegotiated, scoped, and verified by the party it affects.

In organizational management, Sull and Spinosa documented the same
pattern: companies that tracked specific, voluntary commitments
outperformed those that relied on top-down mandates, because
promise-based systems create accountability at the point of action
rather than the point of policy.[^2]

The AI safety community is recapitulating this evolution. Safety
guardrails are defined at training time and deployed uniformly. But
identical output—detailed chemistry instructions, for instance—is
appropriate for a graduate researcher and dangerous in a proliferation
context. Current systems either over-restrict or under-restrict because
the rules are imposed from outside the agent and cannot adapt to
context. Jailbreak research demonstrates this consistently: adversarial
prompts succeed precisely because they exploit the gap between the
conditions the guardrail anticipated and the conditions it encounters.

**1.2 The Legibility Thesis**

The core claim of this paper is not that accountability structures are
absent. It is that they are illegible. The promises exist. The
verification data exists. The failures exist. But no infrastructure
connects them into a representation that a stakeholder—a citizen, a
user, a regulator—can interrogate.

James C. Scott’s concept of legibility is instructive here. Scott argued
that states simplify complex social arrangements into standardized
representations in order to govern them. The problem is not
simplification per se but the loss of local knowledge in the process.
Promise Pipeline inverts this: rather than imposing a top-down schema
that erases nuance, it extracts the commitments that agents have already
made and renders them visible in their full specificity—who promised
what to whom, by when, verified how, and whether it was kept.

The difference between a traditional accountability dashboard and a
promise graph is analogous to the difference between an X-ray and an
MRI. An X-ray gives you a flat projection: you can see that something is
broken, but not how the break relates to surrounding structures. A
promise status dashboard does the same—it shows which commitments are
on track and which are not, in isolation. A promise graph, like an MRI,
provides the volumetric model: the structural relationships between
commitments, the dependency pathways through which failure propagates,
and the downstream effects of any single break. The dashboard tells you
what is broken. The graph tells you what will break next and why. The
simulation engine extends the analogy further—it is the surgical
simulation that models an intervention on the full structural scan
before anyone operates.

The promise graph is, at its most fundamental level, a trust
primitive—a basic building block from which trust relationships can be
composed, observed, and reasoned about. It does not reduce trust to a
single score, a binary, or a credential. It models the full structure of
commitments that trust is built on, and provides the infrastructure to
determine whether that structure is healthy, degrading, or failing.
Credit scores reduce trust to a number derived from financial behavior.
Reputation systems reduce it to an aggregate of subjective opinions.
Blockchain “trustlessness” eliminates the need for trust by making
outcomes deterministic. None of these model the structure of trust
itself—the interdependencies, the cascades, the gap between what was
promised and what was delivered. The promise graph does.

This is infrastructure, not advocacy. The data says what it says.

**2. Promise Theory as Analytical Framework**

Promise Theory, developed by Mark Burgess beginning in 2004 and
elaborated in *Thinking in Promises* (Burgess & Siri, 2014),[^3]
provides a formal framework for reasoning about autonomous agents and
their voluntary commitments. The second edition of *Promise Theory:
Principles and Applications* (Bergstra & Burgess, 2019) extends the
formalism considerably. This paper extracts five ideas that prove useful
for accountability engineering.

**2.1 Promises vs. Obligations**

An obligation is imposed from outside. A promise is declared by the
agent itself. This distinction matters because obligations create
adversarial dynamics—the agent has incentive to find loopholes—while
promises create accountability dynamics: the agent has stated what it
will do, and that statement can be tested against reality. In
legislation, a statute imposes obligations, but the agents subject to it
make specific commitments about how they will comply. Those commitments
are the promises. The `origin` of a promise—whether voluntary,
imposed, or negotiated—affects its reliability: empirically, voluntary
commitments have higher keep rates than imposed ones, because the agent
chose the terms.

**2.2 Promisee-Side Verification**

In Promise Theory, the party affected by a commitment is better
positioned to evaluate it than the party that made it. A utility company
will always report that its emissions plan is on track. The community
breathing the air has a different perspective. Promise Pipeline
operationalizes this principle: verification is designed from the
promisee’s standpoint, using data the promisee can access, rather than
relying on the promiser’s self-assessment.

**2.3 Promise Polarity**

Burgess insists that every complete cooperative interaction requires two
promises: a `+` promise (give/provide) and a `-` promise (accept/use).
A server promising to reply to DNS queries is useless without a resolver
promising to use the replies. In accountability contexts, this surfaces
a critical gap: when a government promises equity protections (`+give`),
but the affected community has no corresponding promise to engage with
verification (`-accept`), the binding is incomplete. The promise may be
fulfilled in isolation with no downstream effect—effort without impact.
Making polarity explicit reveals incomplete bindings as a structural
property of the network, not a failure of any individual promise.

**2.4 Scope**

Every promise has a set of agents who are aware it exists. Bergstra and
Burgess’s analysis of the Boeing 737 Max MCAS failure demonstrates that
Boeing’s behavioral promise for the MCAS system was scoped to the FAA,
with no airlines or pilots included. The promise existed. The agents
most affected by it could not see it. Scope determines who can assess,
depend on, or hold the promiser accountable for a commitment. A promise
where the promisee is not in scope—where the person the promise was
made to cannot verify whether it is being kept—is the formal structure
underlying both the Boeing MCAS failure and the equity verification gap
in HB 2021.

**2.5 The Promise Schema**

Every commitment, regardless of domain, decomposes into a consistent
structure:

-----

**Field**        **Description**

Promiser         The agent making the commitment (a legislator, a
corporation, an AI provider)

Promisee         The agent to whom the commitment is made (citizens,
users, regulators, communities)

Body             The specific content of the commitment, stated
precisely enough to verify

Polarity         Give (+) or accept (−): is the agent promising to
provide something or to receive and use something?

Domain           The category (Emissions, Safety, Uptime, Equity,
Transparency, etc.)

Status           Verified, Declared, Degraded, Violated, or
Unverifiable

Origin           Voluntary, imposed, or negotiated—how the
commitment came into being

Target           The deadline or threshold for fulfillment

Verification     How fulfillment is measured and by whom

Scope            Which agents are aware this promise exists—who
can assess and depend on it

Dependencies     Other promises this commitment requires to succeed

-----

This schema is domain-general by design. The same fields that decompose
an Oregon climate law decompose an AI model card or a corporate ESG
report. The promiser might be a utility company, an AI lab, or a
government agency. The verification mechanism might be an emissions
audit, a benchmark evaluation, or a regulatory filing. The structure is
identical.

**3. Proof of Concept: Oregon HB 2021**

Oregon House Bill 2021 commits the state to 100% clean electricity by
2040.[^4] The law names specific agents (utilities, regulators,
communities), assigns specific commitments (emissions targets, equity
provisions, planning requirements), and establishes verification
mechanisms (regulatory filings, DEQ reports, PUC orders). Five years in,
some of those commitments are on track. Others are broken. But no public
infrastructure makes the full picture visible.

We applied the Promise Network framework to HB 2021, decomposing the
legislation into 20 discrete promises across 7 domains (Emissions,
Planning, Verification, Equity, Affordability, Tribal, Workforce), made
by or to 11 distinct agents. Each promise was annotated with its
statutory reference, deadline, verification mechanism, current status,
and quantitative progress where applicable.

**3.1 What the Decomposition Reveals**

The extraction itself produced findings that are not visible in the
original legislative text or in any single agency’s reporting:

**The PacifiCorp Cascade**

PacifiCorp / Pacific Power’s clean energy plan was rejected by the
Oregon PUC in 2024.[^5] In isolation, this looks like a single planning
failure. In the promise graph, it triggers a cascade: the rejected plan
affects downstream emissions commitments, workforce transition promises,
and equity provisions that depend on the transition proceeding on
schedule. A single promise failure propagates to four or more dependent
promises across three domains.

**The Equity Verification Gap**

Emissions promises have robust verification: DEQ tracks actual emissions
against statutory baselines, and progress is quantitatively measurable.
Equity promises—commitments to environmental justice communities,
affordability protections, tribal consultation—have no comparable
verification infrastructure. In the formal terms introduced in Section
2: these are design flaws, not agent failures. The promises exist in
statute, but they lack corresponding `-accept` promises from the
communities they affect (an incomplete binding), and the communities are
effectively out of scope for verification (a scope gap). The result is
that measurable commitments get accountability, unmeasurable ones get
rhetoric.

**The Affordability Threat**

HB 2021 contains a cost cap that structurally favors electricity rates
over emissions reduction. This is formally a threat: a conditional
promise with negative valuation for the emissions goals. When the clean
energy transition becomes expensive, the cost cap triggers, and
emissions goals yield to affordability goals. Unlike dependency-based
cascades, which propagate downward through structural requirements,
threats propagate laterally—across domains. The cost cap was a
deliberate legislative compromise, but the promise graph makes the
trade-off computable: under what conditions does keeping the
affordability promise require breaking the emissions promise?

**3.2 From Static Dashboard to Dependency Graph**

The initial Promise Pipeline deployment for HB 2021 is a static
accountability dashboard: 20 promises rendered with status indicators,
trajectory charts, and narrative insights. This is useful—it provides
legibility that did not previously exist—but it does not answer the
questions that matter most: What happens next? If PacifiCorp’s plan
continues to be rejected, which promises fail? If the cost cap triggers,
what does the cascade look like? Where should advocacy resources be
focused for maximum impact?

Answering these questions requires a dependency graph—explicit edges
between promises that represent structural prerequisites—and a
propagation engine that can simulate the downstream consequences of
state changes. This is the transition from tracking to simulation, and
it is the central architectural evolution described in this paper.

**4. Proof of Concept: AI Safety Auditing**

AI safety is currently governed by a patchwork of voluntary commitments.
Model cards, responsible use policies, safety benchmarks, and public
statements by AI providers constitute a de facto promise network—but
one that is entirely illegible to the public. No shared representation
exists for tracking whether the safety commitments made by OpenAI,
Anthropic, Google DeepMind, or Meta are being kept, degrading, or being
quietly abandoned.

**4.1 The Guardrail Critique**

Safety guardrails implement obligation-based security: define what the
model must not do, train those constraints in, patch failures when they
surface. The paradigm has produced measurable improvements.[^6] But
guardrails have structural limitations. They are defined at training
time against anticipated conditions. They cannot adapt to novel
contexts. And they create an adversarial dynamic in which users probe
boundaries—a dynamic that jailbreak research exploits
systematically.[^7]

Promise-based auditing does not replace guardrails. It complements them
with a verification layer that asks: are the behavioral commitments
underlying these systems actually being kept? When a provider claims a
hallucination rate below 3% on factual queries, is that claim
verifiable? When it degrades to 4.2%, who knows? The framework makes the
gap between stated commitments and observed behavior measurable and
attributable.

**4.2 Applying the Promise Schema to AI Providers**

We constructed a demonstration promise network for four major AI
providers (OpenAI, Anthropic, Google DeepMind, Meta) and two regulatory
bodies (NIST AI Safety, EU AI Act Authority), extracting 12 promises
across 7 domains: Accuracy, Compliance, Safety, Transparency, Openness,
Performance, and Privacy. Each promise was scored against available
evidence.

Key findings from the demonstration:

- Safety commitments vary significantly: one provider’s harmful output
  rate (0.04%) is an order of magnitude below its stated threshold
  (0.1%), while another’s latency (3.8s) consistently exceeds its SLA
  (2s).
- Transparency promises are the most commonly declared and the least
  verifiable—providers commit to openness but define the terms of
  measurement themselves.
- Drift over time is the pattern most relevant to ongoing auditing: commitments that were met
  at launch degrade as models are updated, fine-tuned, or deprecated.
  Without continuous monitoring, the promise network erodes silently.

**4.3 Cross-Domain Transfer**

The structural parallel between the civic and AI safety verticals is
architectural, not metaphorical. The same schema decomposes both. The
same cascade analysis reveals the same classes of failure. The same
verification gap—measurable commitments get accountability,
unmeasurable ones do not—appears in both domains. This follows from
Promise Theory’s origins in distributed systems: the structural problem
is the same wherever agents make interdependent commitments.

**5. Promise Networks at Every Scale**

The preceding sections describe Promise Pipeline applied to large-scale
institutional accountability: climate legislation, AI safety, corporate
governance. But the framework’s most useful property may be that it
applies identically at the scale of a fifteen-person restaurant, a
three-person creative studio, or a single person’s commitments to the
people in their life and to themselves. This is not an accident. Promise
Theory was designed for systems of autonomous agents at any scale, and
every human relationship—not just every organization—runs on
networks of interdependent commitments.

**5.1 Organizations as Promise Networks**

A restaurant is a dense promise network operating in real time. The
kitchen promises plates in twelve minutes. The server promises accurate
orders to the kitchen and timely service to the customer. The manager
promises the schedule two weeks out. The supplier promises Friday
delivery. The owner promises the landlord rent, the staff fair wages,
the health inspector compliance. Every operational failure is a broken
promise that cascades: when the Friday delivery fails, the Saturday
specials promise breaks, which cascades to the server’s promise to the
customer, which cascades to the revenue promise that funds the rent.
Nobody models this. People experience it as stress, burnout, and
organizational dysfunction.

**5.2 The Team Promise App**

Promise Pipeline for teams is not a task manager with promise branding.
The differentiator is the network and the simulation. Task managers
track work items in isolation. Promise Pipeline tracks commitments and
their interdependencies, then shows what is about to break.

The core features map directly from the institutional verticals:

- The daily view: each team member has active promises—to each
  other, to customers, to the organization. The graph shows
  dependencies. Status is simple: kept, at risk, broken, renegotiated.
- The health barometer: aggregate promise-keeping rates by person,
  team, domain, and time period. Not as surveillance—as a
  diagnostic. A team whose fulfillment rate drops from 85% to 60% over
  two weeks is not underperforming. They are overloaded. The network
  shows where the bottleneck is: too many promises concentrated on a
  single node.
- Workload capacity: if every commitment is modeled with estimated
  effort and dependencies, the system answers whether a team can
  realistically deliver what they have promised this week. When a new
  request arrives, the simulation shows which existing promises it
  puts at risk.
- Realistic forecasting: historical promise-keeping data yields actual
  completion rates rather than optimistic estimates. A promise of type
  X, with dependency structure Y, assigned to team member Z, has
  historically taken 1.4 times the estimated duration. This is the
  same prediction model described in Section 7, applied to operational
  data instead of legislative archives.
- The cascade view: when someone calls in sick, which promises are
  affected? Not just their tasks—the downstream promises that depend
  on their output. The same breadth-first propagation that models
  PacifiCorp’s plan rejection models a sous chef’s absence.

**5.3 Promise Garden: The Personal Promise Layer**

At the smallest scale, Promise Pipeline offers Promise Garden: a free
personal promise tracker built on the same schema as the civic and
organizational verticals. The core metaphor is rewilding a clearcut
forest. The user starts with bare, damaged land. Every promise plants a
seed. Keeping promises grows the garden—trees fill out, water features
develop, wildlife returns. Breaking promises leaves stumps. The garden
is not a gamification layer bolted onto a tracker. It is the data
visualization: each plant species corresponds to a promise type (by
duration and stakes), the health of each plant family reflects the
user’s reliability score in that domain, and dependencies between
personal promises produce visible stress when upstream commitments break.
“Exercise three times a week” depends on “sleep by 11pm.” When the sleep
promise degrades, the exercise plant shows it.

This is not a single-node promise network with no dependencies, as a
naive personal tracker would be. It is a miniature promise graph with the
same structural properties as the civic dashboards—cascade propagation,
domain health scoring, bottleneck identification—rendered as a living
landscape instead of a node-and-edge diagram.

Promise Garden serves three strategic functions. First, it is the entry
point to the ecosystem. A user who watches their garden grow back as they
keep commitments becomes a natural advocate for team adoption—and the
visual language transfers directly, since the garden shares rendering DNA
with the Canopy view used in civic dashboards. Second, it generates data
at the individual level that, anonymized and aggregated, reveals patterns
in how people make and keep commitments—data that improves the
prediction models across all verticals. Third, it demonstrates the
framework’s range: if the same schema that audits state climate
legislation also helps someone keep their weekly commitments, and renders
both as living ecosystems, the domain-generality claim is not
theoretical. It is experienced.

**5.4 The Data Volume Argument**

The org and personal verticals transform the training data economics. A
civic bill produces 20 promises. A single restaurant operating for a
month produces hundreds—shift coverage promises, vendor deliveries,
prep completion, maintenance schedules, customer-facing commitments.
Multiply across clients and the labeled data pipeline accelerates by
orders of magnitude. This is the flywheel that makes the ML roadmap in
Section 7 tractable: the civic vertical provides high-quality, carefully
annotated seed data; the org vertical provides volume.

**6. From Tracking to Simulation**

A static dashboard that shows promise statuses is useful. A simulation
engine that models the downstream consequences of commitment changes is
a qualitatively different tool. This section describes the architectural evolution from
accountability tracking to predictive simulation.

**6.1 The Game-State Analogy**

AlphaGo succeeded because it combined a **value network** (given this
board position, who is likely to win?) with a **policy network** (what
is the most promising next move?) and used Monte Carlo Tree Search to
simulate thousands of possible futures from the current state.[^8]

Promise networks have an analogous structure. The current state is the
full graph of active promises, their interdependencies, the track
records of the agents involved, and the resource constraints in play. A
“move” is any state change: a bill amendment, a funding allocation, an
actor reneging on a commitment, a regulatory deadline passing. The value
network equivalent asks: given this promise network state, what is the
probability that a specific outcome is achieved? The policy network
equivalent asks: which intervention has the highest expected impact on
the network’s overall fulfillment rate?

Unlike Go, promise networks operate under incomplete information,
continuous action spaces, and multiple competing objective functions.
This makes the problem harder than board games in important ways. But it
also means that even modest predictive power would be valuable, because
to our knowledge no one is modeling these dynamics systematically. The
baseline is zero.

**6.2 Cascade Propagation**

The simplest form of simulation is deterministic cascade propagation.
Given the dependency graph, if Promise A fails, which downstream
promises are affected? This requires no machine learning—only graph
traversal. But it answers questions that are not currently answerable
with existing tools:

- If PacifiCorp’s clean energy plan is rejected again, which promises
  fail downstream?
- If an AI provider discontinues a model, which safety commitments
  lapse?
- If a supply chain supplier fails an ethics audit, which corporate
  ESG pledges are compromised?

The cascade simulator takes a promise network, a hypothetical state
change, and propagates effects through the dependency graph. Promises
downstream of a failure degrade proportionally. The output is a modified
promise network showing affected nodes, cascade depth, and a summary of
cross-domain impacts. Critically, the type of violation matters for
propagation: a fault (the agent tried and failed—PacifiCorp’s plan
rejection) suggests downstream promises are at risk but recoverable,
while a flaw (the promise was inadequately designed—equity provisions
without verification infrastructure) suggests systemic redesign is
needed. Threats—conditional promises with negative valuation, like the
HB 2021 cost cap—cascade laterally across domains rather than downward
through dependencies.

**6.3 Learned Cascade Weights**

Deterministic propagation treats all dependency edges equally. In
reality, some dependencies are tight (a planning rejection blocks all
downstream implementation) while others are loose (an equity commitment
degrades but doesn’t collapse without its upstream dependency). Machine
learning replaces the binary propagation rules with learned weights
trained on historical data: given that promises of type X failed in the
past, how often did promises of type Y that depended on them also fail?

The civic vertical is the ideal training ground for this. Legislative
archives contain decades of bills, amendments, committee records, and
compliance data. Each historical bill is a promise network with known
outcomes. The training task is: given the structure and features of a
promise network at time T, predict the fulfillment status of each
promise at time T+N. This is a supervised learning problem with real
ground truth labels from public records.

**6.4 Counterfactual Queries**

The user-facing product is an interactive simulation interface. A policy
analyst, advocacy organization, or legislative staffer opens Promise
Pipeline and sees the current promise network for a bill, a sector, or a
jurisdiction. They then pose counterfactual questions:

- What if the funding mechanism changes from carbon tax to
  cap-and-trade?
- What if Senator X loses their primary and their sponsored
  commitments lose their champion?
- What if a coalition of advocacy groups publicly endorses enforcement
  of a specific set of promises?

The simulation re-propagates probabilities through the network and shows
which downstream promises become more or less likely to be kept. This is
the product: interactive counterfactual simulation over promise
networks. Not a dashboard you look at—a model you interrogate.

**6.5 Actor Reliability Modeling**

Historical data enables a second form of prediction: actor reliability
scoring. Given that Agent X has kept N% of past promises in domain Y,
and they have just made a new commitment structurally similar to ones
they have previously broken, the model flags the discrepancy. This is
not opinion. It is pattern recognition against the historical record.

Reliability rate alone is insufficient. Burgess introduces Mean Time to
Keep a Promise (MTKP)—analogous to Mean Time to Repair in reliability
engineering—measuring not just whether promises are kept but how long
they take. An agent who keeps 90% of promises but takes 3x the estimated
time has a different reliability profile than one who keeps 90% on
schedule. For teams, MTKP is the basis for realistic forecasting (a
promise of type X, assigned to agent Z, has historically taken 1.4 times
the estimated duration). For Promise Garden, MTKP by domain determines
which biomes grow fastest.

**6.6 Intervention Targeting**

If an advocacy organization has limited resources, where in the promise
network should they focus for maximum cascading benefit? The simulation
engine can identify high-leverage nodes: promises whose fulfillment or
failure has disproportionate downstream effects. This is the policy
network equivalent from the game-state analogy—it identifies the most
impactful “move” given the current board state.

**7. Technical Architecture and ML Roadmap**

**7.1 Current State**

Promise Pipeline is currently deployed on Railway (backend) and Vercel
(frontend) as a React-based accountability dashboard platform, released
under the AGPL-3.0 license from its founding commit. The backend
implements the promise kernel: schema registration, event logging,
verification, and integrity scoring. The frontend renders the HB 2021
civic dashboard with 20 hand-annotated promises, 11 agents, 7 domains,
emissions trajectories, and narrative insights. Three demonstration
verticals (AI/ML auditing, infrastructure SLAs, supply chain
transparency) show the framework’s applicability across domains.

Critically, all promise data is currently embedded in frontend
components as hardcoded arrays. There is no dependency graph structure.
Cascade insights exist as English-language narratives, not as computable
edges. The transition to a simulation engine requires three
architectural additions: dependency edges in the data model, a graph
traversal engine for cascade propagation, and a machine learning
pipeline for prediction.

**7.2 Phase 2: Dependency Graph and Deterministic Simulation**

The immediate next step is adding explicit dependency edges between
promises. For HB 2021, approximately 12 dependency relationships have
been identified (e.g., emissions implementation promises depend on
planning approval; workforce promises depend on the clean energy
transition proceeding). These edges, combined with a breadth-first
search propagation algorithm, enable deterministic cascade simulation
with no ML required.

The frontend gains a “What If” interface: users click any promise,
toggle its status, and see cascade effects highlighted across the
network in real time. This is the minimum viable simulation—and it
demonstrates the core interaction pattern that all subsequent ML
improvements will enhance.

**7.3 Phase 3: ML Foundation**

The machine learning pipeline has four components:

**Promise Extraction (NLP)**

Legislative text is semi-structured. A fine-tuned language model can
parse bills, hearings, press releases, and regulatory filings to extract
promise schemas automatically. The initial approach uses a BERT variant
or similar encoder model fine-tuned on hand-labeled schemas. Every
promise dashboard built for a client is a labeled training
example—this is the data flywheel that makes the platform’s ML
capability a function of its business development.

**Outcome Prediction**

Given a promise’s features (promiser track record, structural position
in the network, policy domain, political configuration), predict the
likelihood of fulfillment. The initial implementation uses
gradient-boosted trees (XGBoost) on tabular features extracted from
promise schemas. This is tractable with limited training data and
upgrades to more complex models as the dataset grows.

**Graph Neural Networks**

The promise network maps naturally to a heterogeneous graph with
different node types (promisers, promises, promisees, conditions). Graph
attention networks (GATs)[^9] learn which connections in the network
matter most—a learned version of the deterministic cascade that
replaces equal-weight propagation with data-driven weights. Frameworks
like PyTorch Geometric and Deep Graph Library provide the infrastructure
for this.

**Anomaly Detection**

Autoencoders or isolation forests on promise embeddings detect promises
that are structurally similar to historically broken ones, or identify
when a network of promises is becoming internally contradictory. This is
the early warning system: it catches the PacifiCorp cascade before it
happens, based on structural similarity to past failures.

**7.4 Ethical Dataset Strategy**

The training data strategy prioritizes public, ethically sourced
datasets:

- Legislative archives (GovInfo API, ProPublica Congress API,
  LegiScan) provide decades of bills, amendments, committee records,
  and compliance data—all public domain, all with measurable
  outcomes.
- Regulatory filings (PUC orders, DEQ reports, SEC filings) provide
  verification data for promise fulfillment across civic and corporate
  domains.
- Client data from promise dashboards, anonymized and aggregated at
  the pattern level (not the content level), feeds the training
  pipeline through standard SaaS data-use terms.

The civic vertical is the ethical “Go board”: structured, public, deep
history, measurable outcomes. It provides the initial training data for
a system that later expands to corporate and AI safety domains where
data is less accessible.

**7.5 Automated Verification Infrastructure**

The promise schema’s verification field currently supports manual
assessment: regulatory filings, audit reports, self-reported data. But
the framework’s most significant planned extension is automated verification
through direct integration with independent data sources—sensors,
public APIs, university research networks, and IoT infrastructure. This
is promisee-side verification with hardware: cutting the promiser out of
the verification loop entirely.

Consider the HB 2021 emissions promises. Currently, promise status
depends on Oregon DEQ quarterly reports based on utility-submitted data.
With sensor integration, the verification layer connects directly to
independent measurement infrastructure:

- University air quality monitoring networks (Oregon State, Portland
  State environmental science departments already operate these
  stations as public research infrastructure).
- EPA AirNow API: real-time air quality data from federal monitoring
  stations, publicly accessible.
- PurpleAir community mesh network: thousands of community-deployed
  particulate sensors with an open API, providing neighborhood-level
  resolution that regulatory monitors cannot match.
- NOAA weather stations: contextual data (temperature inversions, wind
  patterns) that affects emissions readings and improves measurement
  accuracy.
- Smart grid telemetry: where available, actual generation mix data
  versus planned targets, verifying clean energy procurement promises
  at the source.

The promise status shifts from a quarterly human assessment to a
continuous, automated signal. A promise does not wait for a regulatory
report to move from “declared” to “degraded.” The sensor data triggers
the state change in near-real-time.

This pattern generalizes across every vertical. Infrastructure SLA
promises can be verified by independent uptime monitors and latency
probes—tools like Datadog and Pingdom are already verification oracles
for service promises, though they do not frame themselves that way.
Supply chain provenance promises can be verified by IoT sensors on
shipping containers tracking temperature, location, and
chain-of-custody. Municipal environmental commitments—noise
ordinances, light pollution limits, water quality standards—can be
verified by distributed sensor networks that measure what the community
actually experiences, not what the agency reports.

Architecturally, this extends the promise schema’s verification field to
support automated sources: the verification method specifies a data
source, an API endpoint, a metric, a threshold, and a polling frequency.
When the verification method is set to an automated source, Promise
Pipeline queries the endpoint on schedule and updates the promise status
without human intervention. The promise verifies itself from the
promisee’s side.

Universities are natural partners for this
infrastructure. They operate existing sensor networks as public research
goods, their data carries the credibility of institutional neutrality,
they have research incentives to demonstrate policy impact, and the
collaboration creates a natural publication pipeline: a university
monitoring network that verifies legislative promise fulfillment
produces findings that serve both academic and civic audiences. The
university gets a policy-impact story for its research program. Promise
Pipeline gets credible, independent verification infrastructure without
building hardware.

This capability is a Phase 3–4 integration, but the architectural
decision to design the verification field as extensible—supporting
sensor sources alongside manual assessments from the beginning—ensures
that the transition from self-reported to independently verified promise
networks is an extension, not a rewrite.

**7.6 Data Sovereignty and the Contribution Promise**

The org and personal verticals generate the highest volume of training
data, but they also pose the sharpest ethical question: how does a
platform built on a philosophy of voluntary commitments and
accountability handle user data without contradicting its own
principles? If Promise Pipeline preaches promise-keeping but silently
harvests user data, the contradiction will eventually undermine the
framework’s credibility.

The answer is to treat data contribution as a promise within the
framework itself. Users who opt in to share anonymized promise patterns
are making a voluntary commitment to the network—a commitment that is
visible in their own promise dashboard, revocable at any time, and
reciprocated by the platform. The data relationship is itself a promise
network with full transparency.

**Sovereignty Architecture**

Four principles govern data contribution:

- Opt-in, not opt-out. The default is private. Users actively choose
  to contribute. The choice appears in their own promise network as a
  live promise they have made, with status tracking like any other
  commitment.
- Granular control. Users can contribute patterns from some domains
  but not others. Work promises but not personal promises. Operational
  commitments but not interpersonal ones. They define the boundary.
- Anonymization at the edge. Promise patterns are stripped of
  identifying content before they leave the user’s context. The
  platform never sees the specific content of a promise. It sees the
  schema: an agent of a given type promised a deliverable in a given
  domain with a given deadline, and the promise was kept, broken, or
  renegotiated. The structure, the timing, the outcome—not the
  content.
- Revocable. Users can withdraw their data contribution at any time.
  When they do, their contributed patterns are removed from future
  training batches. This is the right to be forgotten applied to
  promise patterns.

**Privacy-Preserving Training Pipeline**

The anonymization-at-the-edge principle describes what is stripped from
contributed data. The training pipeline describes how the remaining
patterns—which still contain structural features useful for
re-identification—are processed to prevent triangulation of
individuals while preserving the granularity that makes the models
useful.

The core tension is real: granular promise-pattern data (domain,
duration, stakes, completion timing, dependency structure) produces
better prediction models, but the same granularity enables
re-identification through quasi-identifier combination. Sweeney (1997)
demonstrated that 87% of Americans are uniquely identifiable from ZIP
code, birthdate, and gender alone. Promise patterns carry analogous
quasi-identifiers: a user who makes a “health” promise with a 90-day
duration, a “work” promise due on a specific Friday, and a “relationship”
promise with a particular dependency structure may be uniquely
identifiable even after content is stripped.

The solution is a four-layer privacy pipeline applied to all contributed
data before it enters the training set:

First, temporal batching. Contributed patterns are held in a staging
buffer and released to the training pipeline only in periodic batches.
This breaks the timing correlation between when a pattern was generated
and when it enters training—an adversary who knows a user made a
promise on Tuesday cannot correlate it to a training example that
appeared on Tuesday. Batch windows are configurable; larger batches
provide stronger privacy but slower model improvement.

Second, k-anonymity enforcement within batches. Before a batch releases,
every pattern must share its quasi-identifiers (domain, promise type,
duration tier, outcome) with at least k-1 other patterns in the same
batch. Patterns too unique for the current batch are held back for the
next cycle, where more structurally similar patterns may have
accumulated. This guarantees that no individual’s contribution is
distinguishable from at least k-1 others.

Third, differential privacy on continuous features. Calibrated Laplace
noise is added to duration, completion time, reliability score, and
other continuous fields before training. The noise magnitude is tuned by
a privacy budget (epsilon) that bounds the maximum information leakage
per pattern. This provides a formal mathematical guarantee: even with
arbitrary auxiliary data, an adversary cannot determine with confidence
whether any specific individual’s data was in the training set.

Fourth, temporal jitter. Within each batch, timestamps are randomly
perturbed by a configurable window (days to weeks). This destroys
within-batch timing correlation without affecting the model’s ability to
learn seasonal or cyclical patterns, which operate on longer timescales.

These four techniques are complementary, not alternatives. Batching
alone does not prevent re-identification within a batch. k-anonymity
alone does not handle timing attacks. Differential privacy alone can
degrade model quality if the noise budget is too aggressive. Combined,
each layer covers the others’ gaps, and less of each is needed
individually.

An important practical constraint: in the early stage of the platform,
the user base may be too small for k-anonymity thresholds to be met
frequently. The pipeline handles this by design—patterns that cannot
meet the k threshold simply accumulate in the staging buffer until the
population grows. Early-stage training data is sparser but
provably safer. As the user base expands, batch frequency and granularity
increase together.

**Reciprocal Value**

Data contribution must be reciprocated. Several mechanisms ensure that
contributors receive concrete value in return:

- Enhanced predictions. Contributors’ promise forecasting is trained
  on the broader dataset. Non-contributors get the tool with generic
  predictions only. The contribution literally improves the
  contributor’s own experience—a natural consequence of
  participating in a shared learning system, not a bribe.
- Aggregate insights. Contributors receive anonymized benchmark
  reports: fulfillment rates by industry, team size, domain, and
  promise type. They can see where their organization sits relative to
  the broader pattern. Non-contributors get the tool but not the
  benchmarks.
- Network health credits. Contributing data earns credits that offset
  subscription costs for the team tier. A direct, transparent
  exchange: contribute data, pay less.

The guiding principle is that the data relationship should be as legible
as the commitment relationships the platform tracks. If Promise
Pipeline’s own data practices would receive a “degraded” or
“unverifiable” status in its own schema, something is wrong. The
platform must be auditable by its own standards.

**8. Five-Year Roadmap: 2026–2031**

**Year 1 (2026): Foundation and First Proof**

-----

**Milestone**      **Description**

Q1–Q2             HB 2021 dependency graph + deterministic cascade
simulator. Interactive “What If” UI. Unified
whitepaper published (Alignment Forum, personal
site). Next.js migration of platform. Codebase
released under AGPL-3.0 from day one—the
simulation engine, promise schema, and graph
analysis tools are open source immediately.

Q3                 Promise extraction NLP: first fine-tuned model on
hand-labeled legislative schemas. Second civic
vertical (federal climate bill or state-level
housing legislation). 100+ labeled promise
instances.

Q4                 Public launch of HB 2021 simulation dashboard.
Outreach to Oregon media, civic tech organizations,
and climate advocacy groups. First external
validation: a journalist or researcher uses the tool
in published work.

-----

**Key metrics:** 3 civic verticals deployed, 200+ labeled promises, NLP
extraction achieving 70%+ F1 on held-out schemas, first media citation,
public AGPL-3.0 repository with contributor documentation.

**Year 2 (2027): ML Layer and First Revenue**

-----

**Milestone**      **Description**

Q1–Q2             Outcome prediction model (XGBoost on promise
features). Actor reliability scoring from historical
legislative data. Launch Promise Garden—the free
personal promise app—as ecosystem entry point. Launch corporate ESG
vertical: first paying client using promise
dashboards for supply chain or sustainability
reporting.

Q3–Q4             Team/org promise app launch ($29–199/month tiers).
First small business clients (restaurants, creative
studios, agencies). Learned cascade weights replace
deterministic propagation. Graph neural network
prototype on promise networks. API access for
researchers and journalists. 500+ labeled promises
across 3+ domains. Seed funding or grant revenue
sufficient to sustain development.

-----

**Key metrics:** First paying clients (corporate and team verticals),
Promise Garden launched with 1,000+ users, prediction accuracy above
baseline on held-out legislative data, 500+ labeled promises, GNN
prototype operational.

**Year 3 (2028): Simulation Engine**

-----

**Milestone**      **Description**

Q1–Q2             Full counterfactual simulation interface: users pose
“what if” questions and receive probabilistic
cascade projections. Anomaly detection: automatic
flagging of promises structurally similar to
historically broken ones. AI safety vertical moves
from demonstration to production: first AI provider
or regulator uses Promise Pipeline for behavioral
auditing.

Q3–Q4             Intervention targeting: identify highest-leverage
nodes for resource allocation. Multi-jurisdiction
civic coverage (3+ states or federal). First
automated verification integrations: university
sensor networks, EPA AirNow, PurpleAir APIs feeding
promise status in real time. International climate
agreement vertical (Paris Agreement commitment
tracking). 2,000+ labeled promises.

-----

**Key metrics:** Simulation engine live with probabilistic cascades, 3+
paying verticals (civic, corporate, AI), intervention targeting
demonstrably identifies high-leverage promises, 2,000+ labeled promises.

**Year 4 (2029): Domain Expansion and Transfer Learning**

-----

**Milestone**      **Description**

Q1–Q2             Transfer learning across domains: models trained on
civic promise networks improve corporate prediction,
and vice versa. The domain-general promise ontology
proves its value as a shared representation layer.
Supply chain transparency vertical at scale.
Infrastructure SLA auditing for cloud providers.

Q3–Q4             Community-contributed domain coverage: external
contributors extend the promise schema to new
verticals (housing, education, healthcare policy)
using the open extraction pipeline. Enterprise tier
for large organizations with custom promise
networks and dedicated support. Governance model
for community contributions to the core schema.
10,000+ labeled promises.

-----

**Key metrics:** Cross-domain transfer demonstrably improves prediction,
active open-source community with external contributors across 5+
domains, enterprise clients, schema governance model operational,
10,000+ labeled promises.

**Year 5 (2030–2031): The Commitment Graph**

By Year 5, Promise Pipeline operates a domain-general commitment
graph—a structured, auditable, simulable representation of
interdependent promises across civic, corporate, AI, and international
domains. The graph connects legislative commitments to the corporate
commitments they regulate to the AI systems those corporations deploy. A
failure at any level propagates visibly through the network.

-----

**Milestone**      **Description**

The Platform       Promise Pipeline as infrastructure: any organization
can model its commitment network, simulate
consequences, and publish accountability dashboards.
The schema is the standard. The open codebase is
the foundation. The accumulated data and community
are what make the simulation engine durable.

The Research       Published results on promise network dynamics: what
structural features predict commitment fulfillment
across domains? Collaboration with political
science, organizational behavior, and AI safety
research communities.

The Impact         Citizens can see, in a single interface, whether the
promises made to them—by their government, their
employers, their AI tools, their supply chains—are
being kept. The accountability structures that were
always present are finally legible.

-----

**9. Defensibility**

Four structural advantages compound over time:

**9.1 Open Source Under AGPL-3.0**

Promise Pipeline is released under the GNU Affero General Public License
from its founding commit. This is a strategic decision, not an
ideological gesture.

The AGPL requires that anyone who modifies the code and offers it as a
network service must release their modifications under the same license.
This creates an asymmetric advantage: the codebase is fully transparent
and auditable—anyone can inspect the simulation engine, verify the
cascade logic, and confirm that the promise schema does what it claims.
But a cloud provider or well-funded competitor cannot take the codebase,
build a proprietary SaaS product on top of it, and capture the market
without contributing their improvements back. The license enforces
reciprocity at the infrastructure level.

This matters for three reasons. First, a platform that claims to make
accountability structures legible cannot be a black box itself. The AGPL
ensures that Promise Pipeline’s own code is as auditable as the promise
networks it models. A proprietary accountability tool asks stakeholders
to trust the tool maker. An open-source one lets them verify. For a
platform whose thesis is that trust should be structural rather than
reputational, the code must be open.

Second, the AGPL accelerates adoption without sacrificing sustainability.
Researchers, journalists, civic technologists, and advocacy organizations
can deploy their own instances, extend the schema for new domains, and
build on the simulation engine—all without permission or payment. This
expands the promise graph’s coverage faster than any proprietary
go-to-market strategy could. The constraint the AGPL imposes is narrow
and precise: if you run a modified version as a service, your
modifications are shared. Individual use, research use, internal
organizational use, and non-network deployment are all unrestricted.

Third, the license creates a natural boundary between the open
infrastructure and the commercial service layer. The simulation engine,
the promise schema, the graph analysis tools, and the extraction pipeline
are open. The hosted platform—with managed instances, client support,
data pipelines, and the accumulated training data—is the product. This
is the model established by PostgreSQL and Linux: the infrastructure is
open, the expertise and operations are the business. The AGPL is
specifically chosen over the MIT or Apache licenses because permissive
licenses do not prevent proprietary capture—a permissively licensed
trust primitive can be absorbed into a proprietary platform and offered
as a feature rather than infrastructure.

**9.2 The Trust Primitive**

The promise graph is a trust primitive (Section 1.2): a basic building
block from which trust relationships can be composed, observed, and
reasoned about. The formal schema—grounded in Promise Theory and
structured enough for ML to learn over—is what turns tracking into
simulation. Anyone can build a legislative tracker. The promise graph is
what makes trust computable without reducing it to a score.

**9.3 The Data Flywheel**

The dual-source training data flywheel described in Section 5.4—civic
seed data plus organizational volume—is the engine that drives the
platform from deterministic rules to learned prediction. The open-source
codebase amplifies this: community-deployed instances that opt in to the
data contribution framework (Section 7.6) expand the training dataset
beyond what any single organization could produce. The AGPL ensures that
improvements to the extraction pipeline flow back to the commons, while
the data sovereignty architecture ensures that contribution is voluntary,
granular, and revocable.

**9.4 The Network Effects**

As more actors and domains are modeled, the promise graph grows richer.
Cross-domain dependencies become visible: a federal funding promise
affects state legislative promises, which affect municipal
implementation promises, which affect corporate compliance promises. The
simulation becomes more accurate because the graph is more complete.

The open-source strategy compounds this: independent deployments for new
jurisdictions, new policy domains, and new organizational contexts each
produce promise networks that, when contributed, enrich the global
graph. A proprietary platform grows only through its own sales pipeline.
An open platform with AGPL protections grows through every deployment
that opts into the shared data layer—while the license ensures that no
single actor can capture the accumulated network without reciprocating.

**10. Conclusion**

The accountability structures for AI safety, climate policy, corporate
governance, and supply chain transparency already exist. They are
scattered, self-assessed, and invisible to the people they are meant to
protect. The same is true at the scale of a restaurant, a creative
studio, a single person’s weekly commitments, and the promises we make
to the people we love. Promise Pipeline is open-source
infrastructure—released under the AGPL-3.0 from its founding
commit—for making them legible, auditable, and simulable, from the
promises we make to ourselves to the commitments nations make to their
citizens.

The core technical contribution is the application of Promise Theory—a
well-established framework from distributed systems—to domains where
commitments are made but not systematically tracked. The promise schema
provides a universal representation. The dependency graph reveals
structural relationships that are invisible in narrative reporting. The
simulation engine enables counterfactual reasoning about commitment
networks. And the machine learning pipeline, trained on ethically
sourced public data, moves the system from deterministic tracking to
probabilistic prediction.

The civic vertical—Oregon HB 2021—demonstrates that the framework
produces non-obvious findings (cascade failures, verification gaps,
incomplete bindings, structural threats) from a single piece of
legislation. The AI safety vertical demonstrates that the same classes
of structural problems appear wherever agents make interdependent
commitments. The domain-generality is architectural.

The decision to open the codebase under the AGPL from day one reflects a
structural conviction: accountability infrastructure cannot be
proprietary. A tool that makes promises legible must itself be legible.
The AGPL ensures that the simulation engine, the promise schema, and the
extraction pipeline are available to anyone who needs them—while
preventing proprietary capture by requiring that modifications to
network-deployed instances are shared. The code is open. The data
flywheel, the accumulated training set, and the hosted service layer are
what sustain the project.

The five-year roadmap describes a path from the current static dashboard
to a domain-general simulation engine. Each phase is useful on its own:
the static dashboard provides legibility, the dependency graph enables
cascade analysis, the deterministic simulator supports counterfactual
queries, and the ML pipeline enables prediction. The vision is not
contingent on achieving the final state. Every intermediate step
delivers value.

In a world where the gap between stated commitments and observed
behavior is the central accountability question—in AI safety, in
climate policy, in corporate governance, and in the promises we make to
one another and to ourselves—the infrastructure for answering that
question systematically does not yet exist. The promise graph is the trust
primitive that makes it possible. Promise Pipeline builds it, in the
open.

**References**

Bai, Y., et al. (2022). Constitutional AI: Harmlessness from AI
Feedback. *arXiv preprint arXiv:2212.08073.*

Bender, E. M., Gebru, T., McMillan-Major, A., & Shmitchell, S. (2021).
On the Dangers of Stochastic Parrots: Can Language Models Be Too Big?
*Proceedings of FAccT 2021.* ACM.

Blodgett, S. L., Barocas, S., Daumé III, H., & Wallach, H. (2020).
Language (Technology) Is Power: A Critical Survey of Bias in NLP.
*Proceedings of the 58th Annual Meeting of the ACL.* Association for
Computational Linguistics.

Burgess, M. (2004). An approach to understanding policy based on
autonomy and voluntary cooperation. *Proceedings of the 5th IFIP/IEEE
International Workshop on Distributed Systems: Operations and
Management.* Springer.

Bergstra, J. A., & Burgess, M. (2019). *Promise Theory: Principles and
Applications* (2nd ed.). χtAxis Press.

Bergstra, J. A., & Burgess, M. (2019). A Promise Theoretic Account of
the Boeing 737 Max MCAS Algorithm Affair. *arXiv:2001.01543.*

Burgess, M. (2015). *In Search of Certainty: The Science of Our
Information Infrastructure.* O’Reilly Media.

Burgess, M., & Siri, J. (2014). *Thinking in Promises: Designing Systems
for Cooperation.* O’Reilly Media.

European Parliament and Council. (2024). Regulation (EU) 2024/1689
(Artificial Intelligence Act). *Official Journal of the European Union.*

Kipf, T. N., & Welling, M. (2017). Semi-supervised classification with
graph convolutional networks. *Proceedings of ICLR.*

Oregon Citizens’ Utility Board. (2024). 100% Clean Electricity: How Are
Utilities Doing? *oregoncub.org.*

Oregon Department of Environmental Quality. (2025). Oregon Clean Energy
Targets: Verification Orders. *oregon.gov/deq.*

Oregon Legislative Assembly. (2021). House Bill 2021, Enrolled. *81st
Oregon Legislative Assembly, 2021 Regular Session.*

Oregon Public Utility Commission. (2024). Order No. 24-002, Docket UM
2273. *apps.puc.state.or.us.*

Perez, E., et al. (2022). Red Teaming Language Models with Language
Models. *arXiv preprint arXiv:2202.03286.*

Scott, J. C. (1998). *Seeing Like a State: How Certain Schemes to
Improve the Human Condition Have Failed.* Yale University Press.

Silver, D., et al. (2016). Mastering the game of Go with deep neural
networks and tree search. *Nature,* 529(7587), 484–489.

Sull, D., & Spinosa, C. (2007). Promise-based management: The essence of
execution. *Harvard Business Review,* 85(4), 78–86.

Sweeney, L. (1997). Weaving technology and policy together to maintain
confidentiality. *Journal of Law, Medicine & Ethics,* 25(2–3), 98–110.

Veličković, P., et al. (2018). Graph attention networks. *Proceedings of
ICLR.*

Wei, A., et al. (2023). Jailbroken: How Does LLM Safety Training Fail?
*arXiv preprint arXiv:2307.02483.*

[^1]: Burgess, M. (2004). An approach to understanding policy based on
autonomy and voluntary cooperation. Proceedings of the 5th IFIP/IEEE
International Workshop on Distributed Systems: Operations and
Management.

[^2]: Sull, D., & Spinosa, C. (2007). Promise-based management: The
essence of execution. Harvard Business Review, 85(4), 78–86.

[^3]: Burgess, M., & Siri, J. (2014). Thinking in Promises: Designing
Systems for Cooperation. O’Reilly Media.

[^4]: Oregon Legislative Assembly. (2021). House Bill 2021, Enrolled.
81st Oregon Legislative Assembly, 2021 Regular Session.

[^5]: Oregon Public Utility Commission. (2024). Order No. 24-002, Docket
UM 2273.

[^6]: Bai, Y., et al. (2022). Constitutional AI: Harmlessness from AI
Feedback. arXiv preprint arXiv:2212.08073.

[^7]: Wei, A., et al. (2023). Jailbroken: How Does LLM Safety Training
Fail? arXiv preprint arXiv:2307.02483.

[^8]: Silver, D., et al. (2016). Mastering the game of Go with deep
neural networks and tree search. Nature, 529(7587), 484–489.

[^9]: Veličković, P., et al. (2018). Graph attention networks.
Proceedings of ICLR.