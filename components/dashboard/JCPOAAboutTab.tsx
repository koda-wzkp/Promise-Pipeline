"use client";

export function JCPOAAboutTab() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white rounded-xl border p-6">
        <h3 className="font-serif text-xl font-semibold text-gray-900 mb-3">
          About the JCPOA
        </h3>
        <p className="text-sm text-gray-700 leading-relaxed mb-3">
          The Joint Comprehensive Plan of Action (JCPOA) was agreed on July 14, 2015 between
          Iran and the P5+1 (United States, United Kingdom, France, Germany, Russia, China),
          with the European Union as coordinator. It was the most complex arms control agreement
          in history, placing verifiable limits on Iran&apos;s nuclear program in exchange for
          sanctions relief.
        </p>
        <p className="text-sm text-gray-700 leading-relaxed mb-3">
          At its peak, the JCPOA included the most sophisticated verification regime ever
          deployed for nuclear nonproliferation: IAEA continuous monitoring cameras, online
          enrichment monitors, containment seals, Additional Protocol access, and real-time
          surveillance at declared facilities.
        </p>
        <p className="text-sm text-gray-700 leading-relaxed">
          By October 2025, the agreement had collapsed entirely. This dashboard models that
          collapse as a promise network — 22 promises, 11 agents, 6 domains — revealing how
          cascading failures destroyed both the commitments and the verification infrastructure
          that made them auditable.
        </p>
      </div>

      <div className="bg-white rounded-xl border p-6">
        <h3 className="font-serif text-xl font-semibold text-gray-900 mb-3">
          Why Promise Theory?
        </h3>
        <p className="text-sm text-gray-700 leading-relaxed mb-3">
          The JCPOA was explicitly characterized by the U.S. State Department as
          &quot;political commitments&quot; rather than a binding treaty. This makes it a
          textbook promise network: autonomous agents making voluntary commitments with no
          external enforcement mechanism.
        </p>
        <p className="text-sm text-gray-700 leading-relaxed">
          Promise Theory reveals what traditional analysis misses: verification infrastructure
          is itself a promise in the graph, not external to it. When the promises enabling
          verification failed, every promise they verified became uncertain — even those whose
          compliance status hadn&apos;t changed. The JCPOA didn&apos;t just break. It became
          unknowable.
        </p>
      </div>

      <div className="bg-white rounded-xl border p-6">
        <h3 className="font-serif text-xl font-semibold text-gray-900 mb-3">
          Methodology & Sources
        </h3>
        <ul className="text-sm text-gray-700 space-y-2 list-disc pl-5">
          <li>Promise data extracted from the JCPOA text, Annex I (nuclear measures), Annex II (sanctions), and UNSCR 2231</li>
          <li>Status assessments based on IAEA Board of Governors reports (2016-2025)</li>
          <li>Timeline events from IAEA verification reports, U.S. Executive Orders, EU Official Journal, and UNSC records</li>
          <li>Verification dependency chains inferred from the operational requirements of each verification mechanism</li>
          <li>Cascade simulation uses the same deterministic BFS engine as other Promise Pipeline dashboards</li>
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
