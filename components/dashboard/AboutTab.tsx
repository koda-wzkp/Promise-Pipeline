"use client";

export function AboutTab() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white rounded-xl border p-6">
        <h3 className="font-serif text-xl font-semibold text-gray-900 mb-3">
          What is Promise Theory?
        </h3>
        <p className="text-sm text-gray-700 leading-relaxed mb-3">
          Promise Theory, developed by Mark Burgess, is a framework for understanding
          voluntary cooperation in complex systems. Unlike top-down obligation models,
          Promise Theory starts from the premise that every agent is autonomous — they
          can only make promises about their own behavior, never impose obligations on others.
        </p>
        <p className="text-sm text-gray-700 leading-relaxed mb-3">
          A <strong>promise</strong> is a declaration of intent by an autonomous agent.
          It has a <em>promiser</em> (who commits), a <em>promisee</em> (who benefits),
          a <em>body</em> (what is committed), and a <em>polarity</em> (+give or -accept).
          A complete interaction requires both: the promiser gives, and the promisee accepts.
        </p>
        <p className="text-sm text-gray-700 leading-relaxed">
          Promise Pipeline applies this theory to real-world accountability by modeling
          commitments as a network of interdependent promises. When one promise fails,
          we can trace the <em>cascade</em> through the dependency graph — which downstream
          commitments break, which domains are affected, and where to intervene.
        </p>
      </div>

      <div className="bg-white rounded-xl border p-6">
        <h3 className="font-serif text-xl font-semibold text-gray-900 mb-3">
          About This Dashboard
        </h3>
        <p className="text-sm text-gray-700 leading-relaxed mb-3">
          This dashboard analyzes Oregon House Bill 2021, the state&apos;s landmark
          clean energy legislation requiring 100% clean electricity by 2040. We model
          the bill as a network of 20 promises made by 11 agents across 7 domains.
        </p>
        <p className="text-sm text-gray-700 leading-relaxed mb-3">
          The <strong>Network</strong> tab lets you run &quot;What If&quot; simulations:
          select any promise, change its status, and see how the cascade propagates
          through the dependency graph. This is what distinguishes Promise Pipeline
          from traditional accountability dashboards — we show not just what&apos;s broken,
          but what breaks next and why.
        </p>
        <p className="text-sm text-gray-700 leading-relaxed">
          Traditional accountability tools are X-rays: flat projections of isolated statuses.
          Promise Pipeline is an MRI: the full structural model — dependencies, cascades,
          and downstream effects.
        </p>
      </div>

      <div className="bg-white rounded-xl border p-6">
        <h3 className="font-serif text-xl font-semibold text-gray-900 mb-3">
          Methodology
        </h3>
        <ul className="text-sm text-gray-700 space-y-2 list-disc pl-5">
          <li>Promise data sourced from Oregon HB 2021 statutory text, PUC filings, and DEQ reports</li>
          <li>Dependencies inferred from legislative structure and regulatory requirements</li>
          <li>Status assessments based on publicly available compliance data as of 2024</li>
          <li>Network health calculated as weighted average: Verified=100, Declared=60, Degraded=30, Violated=0, Unverifiable=20</li>
          <li>Cascade simulation uses deterministic BFS propagation with diminishing degradation by depth</li>
        </ul>
      </div>

      <div className="bg-gray-50 rounded-xl border p-6 text-center">
        <p className="text-sm text-gray-600">
          Promise Pipeline is open source under the AGPL-3.0 license.
        </p>
      </div>
    </div>
  );
}
