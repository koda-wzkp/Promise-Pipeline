import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#faf9f6" }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="font-serif text-3xl font-bold text-gray-900 mb-6">
          About Promise Pipeline
        </h1>

        <div className="prose prose-gray max-w-none space-y-8">
          <section className="bg-white rounded-xl border p-6">
            <h2 className="font-serif text-xl font-semibold text-gray-900 mb-3">
              What is Promise Pipeline?
            </h2>
            <p className="text-sm text-gray-700 leading-relaxed">
              Promise Pipeline is an open-source platform that applies Promise Theory
              to commitment tracking, auditing, and simulation across domains. It models
              commitments as a network of interdependent promises, enabling cascade
              analysis: when one promise fails, what breaks downstream?
            </p>
          </section>

          <section className="bg-white rounded-xl border p-6">
            <h2 className="font-serif text-xl font-semibold text-gray-900 mb-3">
              Promise Theory
            </h2>
            <p className="text-sm text-gray-700 leading-relaxed mb-3">
              Developed by Mark Burgess, Promise Theory is a framework for understanding
              voluntary cooperation in complex systems. Every agent is autonomous — they
              can only make promises about their own behavior. A complete interaction
              requires both a +give promise (the commitment) and a -accept promise
              (the acknowledgment).
            </p>
            <p className="text-sm text-gray-700 leading-relaxed">
              Promise Pipeline operationalizes this theory for real-world accountability.
              The universal promise schema — with polarity, scope, origin, verification,
              and dependency edges — captures the structural reality of how commitments
              work and fail.
            </p>
          </section>

          <section className="bg-white rounded-xl border p-6">
            <h2 className="font-serif text-xl font-semibold text-gray-900 mb-3">
              The Project
            </h2>
            <p className="text-sm text-gray-700 leading-relaxed mb-3">
              Promise Pipeline is created by Conor Nolan-Finkel. The codebase is
              released under the AGPL-3.0 license from its founding commit.
            </p>
            <ul className="text-sm text-gray-700 space-y-1 list-disc pl-5">
              <li>
                <strong>Civic dashboards</strong> — Oregon HB 2021 demo with full
                cascade simulation
              </li>
              <li>
                <strong>Promise Garden</strong> — Personal promise tracker with
                rewilding metaphor
              </li>
              <li>
                <strong>Team app</strong> — Team promise networks with capacity
                simulation
              </li>
              <li>
                <strong>Demo verticals</strong> — AI safety, infrastructure SLAs,
                supply chain
              </li>
            </ul>
          </section>

          <section className="bg-white rounded-xl border p-6">
            <h2 className="font-serif text-xl font-semibold text-gray-900 mb-3">
              Technology
            </h2>
            <ul className="text-sm text-gray-700 space-y-1 list-disc pl-5">
              <li>Next.js 14+ with App Router</li>
              <li>TypeScript (strict mode)</li>
              <li>Tailwind CSS</li>
              <li>Recharts for data visualization</li>
              <li>Sanity CMS for blog content</li>
              <li>SVG-based network graph visualization</li>
              <li>Deterministic BFS cascade simulation engine</li>
            </ul>
          </section>

          <div className="text-center pt-4">
            <Link
              href="/demo/hb2021"
              className="inline-block px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 text-sm"
            >
              See the HB 2021 Demo
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
