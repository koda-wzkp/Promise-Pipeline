"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { PersonalPromise, PersonalStats } from "@/lib/types/personal";
import { PromiseStatus } from "@/lib/types/promise";
import { PromiseCreator } from "@/components/personal/PromiseCreator";
import { GardenView } from "@/components/personal/GardenView";
import { PromiseTimeline } from "@/components/personal/PromiseTimeline";
import { ReliabilityScore } from "@/components/personal/ReliabilityScore";
import { DomainBreakdown } from "@/components/personal/DomainBreakdown";

type View = "garden" | "timeline" | "create" | "stats";

const STORAGE_KEY = "promise-garden-data";

function loadPromises(): PersonalPromise[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function savePromises(promises: PersonalPromise[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(promises));
}

function calculateStats(promises: PersonalPromise[]): PersonalStats {
  const completed = promises.filter(
    (p) => p.status === "verified" || p.status === "violated"
  );
  const kept = completed.filter((p) => p.status === "verified");
  const broken = completed.filter((p) => p.status === "violated");
  const active = promises.filter(
    (p) => p.status === "declared" || p.status === "degraded"
  );

  const keptRate = completed.length > 0 ? kept.length / completed.length : 0;

  // MTKP
  const keptWithDates = kept.filter((p) => p.createdAt && p.completedAt);
  const mtkp =
    keptWithDates.length > 0
      ? keptWithDates.reduce((sum, p) => {
          const days =
            (new Date(p.completedAt!).getTime() - new Date(p.createdAt).getTime()) /
            (1000 * 60 * 60 * 24);
          return sum + days;
        }, 0) / keptWithDates.length
      : 0;

  // By domain
  const byDomain: PersonalStats["byDomain"] = {};
  const mtkpByDomain: Record<string, number> = {};
  const allDomains = Array.from(new Set(promises.map((p) => p.domain)));

  for (const domain of allDomains) {
    const dp = promises.filter((p) => p.domain === domain);
    const dCompleted = dp.filter(
      (p) => p.status === "verified" || p.status === "violated"
    );
    const dKept = dp.filter((p) => p.status === "verified");
    const dBroken = dp.filter((p) => p.status === "violated");
    const dActive = dp.filter(
      (p) => p.status === "declared" || p.status === "degraded"
    );

    const dKeptWithDates = dKept.filter((p) => p.createdAt && p.completedAt);
    const dMtkp =
      dKeptWithDates.length > 0
        ? dKeptWithDates.reduce((sum, p) => {
            const days =
              (new Date(p.completedAt!).getTime() - new Date(p.createdAt).getTime()) /
              (1000 * 60 * 60 * 24);
            return sum + days;
          }, 0) / dKeptWithDates.length
        : 0;

    byDomain[domain] = {
      total: dp.length,
      kept: dKept.length,
      broken: dBroken.length,
      active: dActive.length,
      keptRate: dCompleted.length > 0 ? dKept.length / dCompleted.length : 0,
      mtkp: dMtkp,
    };
    mtkpByDomain[domain] = dMtkp;
  }

  // Monthly trend (last 6 months)
  const trend: PersonalStats["trend"] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthStr = month.toLocaleDateString("en-US", {
      month: "short",
      year: "2-digit",
    });
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
    const monthCompleted = completed.filter((p) => {
      if (!p.completedAt) return false;
      const d = new Date(p.completedAt);
      return d <= monthEnd;
    });
    const monthKept = monthCompleted.filter((p) => p.status === "verified");
    trend.push({
      month: monthStr,
      keptRate: monthCompleted.length > 0 ? monthKept.length / monthCompleted.length : 0,
    });
  }

  return {
    totalPromises: promises.length,
    activePromises: active.length,
    keptRate,
    mtkp,
    mtkpByDomain,
    byDomain,
    trend,
  };
}

export default function PersonalPage() {
  const [promises, setPromises] = useState<PersonalPromise[]>([]);
  const [view, setView] = useState<View>("garden");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setPromises(loadPromises());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) savePromises(promises);
  }, [promises, loaded]);

  const stats = useMemo(() => calculateStats(promises), [promises]);

  const handleCreate = useCallback((promise: PersonalPromise) => {
    setPromises((prev) => [...prev, promise]);
    setView("garden");
  }, []);

  const handleUpdateStatus = useCallback(
    (id: string, status: PromiseStatus, reflection?: string) => {
      setPromises((prev) =>
        prev.map((p) => {
          if (p.id !== id) return p;
          return {
            ...p,
            status,
            reflection: reflection || p.reflection,
            completedAt:
              status === "verified" || status === "violated"
                ? new Date().toISOString()
                : p.completedAt,
          };
        })
      );
    },
    []
  );

  const views: { id: View; label: string }[] = [
    { id: "garden", label: "Garden" },
    { id: "timeline", label: "Timeline" },
    { id: "stats", label: "Stats" },
    { id: "create", label: "+ New Promise" },
  ];

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-sky-lightest to-white">
        <p className="text-gray-500">Loading your garden...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-sky-lightest to-white">
      {/* Header */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 pb-4">
        <h1 className="font-serif text-2xl font-bold text-gray-900">
          Promise Garden
        </h1>
        <p className="text-gray-600 text-sm mt-1">
          Your personal promise tracker. Every promise plants a seed. Keeping them grows the garden.
        </p>
      </div>

      {/* View tabs */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 mb-6">
        <div className="flex gap-2">
          {views.map((v) => (
            <button
              key={v.id}
              onClick={() => setView(v.id)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                view === v.id
                  ? "bg-green-700 text-white"
                  : v.id === "create"
                  ? "bg-green-50 text-green-700 hover:bg-green-100"
                  : "bg-white text-gray-700 hover:bg-gray-50 border"
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-12">
        {view === "garden" && (
          <GardenView
            promises={promises}
            onUpdateStatus={handleUpdateStatus}
          />
        )}
        {view === "timeline" && (
          <PromiseTimeline
            promises={promises}
            onUpdateStatus={handleUpdateStatus}
          />
        )}
        {view === "stats" && (
          <div className="space-y-6">
            <ReliabilityScore stats={stats} />
            <DomainBreakdown stats={stats} />
          </div>
        )}
        {view === "create" && <PromiseCreator onCreate={handleCreate} />}

        {promises.length === 0 && view !== "create" && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🌱</div>
            <h3 className="font-serif text-lg font-semibold text-gray-700 mb-2">
              Your garden is empty
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Plant your first promise to start growing your garden.
            </p>
            <button
              onClick={() => setView("create")}
              className="px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 text-sm font-medium"
            >
              Create Your First Promise
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
