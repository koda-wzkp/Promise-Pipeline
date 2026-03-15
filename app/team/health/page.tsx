"use client";

import Link from "next/link";

export default function TeamHealthPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#faf9f6" }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="font-serif text-2xl font-bold text-gray-900 mb-2">
          Team Health Analytics
        </h1>
        <p className="text-gray-500 text-sm mb-6">
          Deeper health analytics are available on the{" "}
          <Link href="/team" className="text-blue-600 hover:underline">
            main team dashboard
          </Link>{" "}
          under the Health tab.
        </p>
        <div className="bg-white rounded-xl border p-8 text-center">
          <p className="text-gray-500">
            Full health analytics view coming soon. Use the team dashboard for
            current health barometer and member load views.
          </p>
          <Link
            href="/team"
            className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
          >
            Go to Team Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
