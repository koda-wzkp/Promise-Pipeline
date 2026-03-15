"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { TeamMember, TeamPromise, TeamDashboardData } from "@/lib/types/team";
import { PromiseStatus, PromiseOrigin } from "@/lib/types/promise";
import { CascadeResult } from "@/lib/types/simulation";
import { simulateCascade, calculateNetworkHealth } from "@/lib/simulation/cascade";
import { TeamPromiseBoard } from "@/components/team/TeamPromiseBoard";
import { TeamHealthBarometer } from "@/components/team/TeamHealthBarometer";
import { MemberLoad } from "@/components/team/MemberLoad";
import { TeamCascadeView } from "@/components/team/TeamCascadeView";

const STORAGE_KEY = "promise-pipeline-team";

type View = "board" | "health" | "members" | "cascade";

function loadTeamData(): TeamDashboardData {
  if (typeof window === "undefined") return defaultTeamData();
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : defaultTeamData();
  } catch {
    return defaultTeamData();
  }
}

function saveTeamData(data: TeamDashboardData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function defaultTeamData(): TeamDashboardData {
  return {
    teamName: "My Team",
    members: [],
    promises: [],
    health: {
      overall: 0,
      byDomain: {},
      byAgent: {},
      bottlenecks: [],
      atRisk: [],
    },
    domains: [],
    recentActivity: [],
  };
}

export default function TeamPage() {
  const [data, setData] = useState<TeamDashboardData>(defaultTeamData());
  const [view, setView] = useState<View>("board");
  const [loaded, setLoaded] = useState(false);
  const [showCreateMember, setShowCreateMember] = useState(false);
  const [showCreatePromise, setShowCreatePromise] = useState(false);

  useEffect(() => {
    setData(loadTeamData());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      const health = calculateNetworkHealth(data.promises);
      const updated = { ...data, health };
      saveTeamData(updated);
    }
  }, [data.promises, data.members, loaded]);

  const addMember = useCallback(
    (name: string, role: string) => {
      const member: TeamMember = {
        id: `TM-${Date.now()}`,
        name,
        type: "team-member",
        short: name.slice(0, 3).toUpperCase(),
        role,
        activePromiseCount: 0,
        keptRate: 0,
        mtkp: 0,
        loadScore: 0,
      };
      setData((prev) => ({
        ...prev,
        members: [...prev.members, member],
      }));
      setShowCreateMember(false);
    },
    []
  );

  const addPromise = useCallback(
    (promise: TeamPromise) => {
      setData((prev) => ({
        ...prev,
        promises: [...prev.promises, promise],
        recentActivity: [
          {
            promiseId: promise.id,
            action: "created",
            timestamp: new Date().toISOString(),
            memberId: promise.promiser,
          },
          ...prev.recentActivity,
        ],
      }));
      setShowCreatePromise(false);
    },
    []
  );

  const updatePromiseStatus = useCallback(
    (id: string, status: PromiseStatus) => {
      setData((prev) => ({
        ...prev,
        promises: prev.promises.map((p) =>
          p.id === id ? { ...p, status } : p
        ),
        recentActivity: [
          {
            promiseId: id,
            action:
              status === "verified"
                ? "kept"
                : status === "violated"
                ? "broken"
                : "degraded",
            timestamp: new Date().toISOString(),
            memberId:
              prev.promises.find((p) => p.id === id)?.promiser || "",
          },
          ...prev.recentActivity,
        ],
      }));
    },
    []
  );

  const views: { id: View; label: string }[] = [
    { id: "board", label: "Board" },
    { id: "health", label: "Health" },
    { id: "members", label: "Members" },
    { id: "cascade", label: "What If" },
  ];

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading team data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#faf9f6" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-serif text-2xl font-bold text-gray-900">
              {data.teamName}
            </h1>
            <p className="text-sm text-gray-500">
              {data.members.length} members · {data.promises.length} promises
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowCreateMember(true)}
              className="px-3 py-1.5 text-sm font-medium border rounded-lg hover:bg-gray-50"
            >
              + Member
            </button>
            <button
              onClick={() => setShowCreatePromise(true)}
              className="px-3 py-1.5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              + Promise
            </button>
          </div>
        </div>

        {/* View tabs */}
        <div className="flex gap-2 mb-6">
          {views.map((v) => (
            <button
              key={v.id}
              onClick={() => setView(v.id)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                view === v.id
                  ? "bg-gray-900 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50 border"
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>

        {/* Add member modal */}
        {showCreateMember && (
          <CreateMemberForm
            onSubmit={addMember}
            onCancel={() => setShowCreateMember(false)}
          />
        )}

        {/* Add promise modal */}
        {showCreatePromise && (
          <CreateTeamPromiseForm
            members={data.members}
            existingPromises={data.promises}
            onSubmit={addPromise}
            onCancel={() => setShowCreatePromise(false)}
          />
        )}

        {/* Content */}
        {view === "board" && (
          <TeamPromiseBoard
            promises={data.promises}
            members={data.members}
            onUpdateStatus={updatePromiseStatus}
          />
        )}
        {view === "health" && (
          <TeamHealthBarometer
            promises={data.promises}
            members={data.members}
          />
        )}
        {view === "members" && (
          <MemberLoad
            promises={data.promises}
            members={data.members}
          />
        )}
        {view === "cascade" && (
          <TeamCascadeView
            promises={data.promises}
            members={data.members}
          />
        )}

        {data.members.length === 0 && !showCreateMember && (
          <div className="text-center py-16 bg-white rounded-xl border">
            <h3 className="font-serif text-lg font-semibold text-gray-700 mb-2">
              Add your first team member
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Start by adding team members, then create promises between them.
            </p>
            <button
              onClick={() => setShowCreateMember(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
            >
              Add Team Member
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function CreateMemberForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (name: string, role: string) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");

  return (
    <div className="bg-white rounded-xl border p-6 mb-6 max-w-md">
      <h3 className="font-serif font-semibold mb-3">Add Team Member</h3>
      <div className="space-y-3">
        <div>
          <label htmlFor="member-name" className="block text-sm font-medium text-gray-700 mb-1">
            Name
          </label>
          <input
            id="member-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm"
            placeholder="Team member name"
          />
        </div>
        <div>
          <label htmlFor="member-role" className="block text-sm font-medium text-gray-700 mb-1">
            Role
          </label>
          <input
            id="member-role"
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm"
            placeholder="e.g., Designer, Engineer"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => name.trim() && onSubmit(name.trim(), role.trim())}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
            disabled={!name.trim()}
          >
            Add
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2 border text-sm rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function CreateTeamPromiseForm({
  members,
  existingPromises,
  onSubmit,
  onCancel,
}: {
  members: TeamMember[];
  existingPromises: TeamPromise[];
  onSubmit: (promise: TeamPromise) => void;
  onCancel: () => void;
}) {
  const [body, setBody] = useState("");
  const [promiser, setPromiser] = useState(members[0]?.id || "");
  const [promisee, setPromisee] = useState(members[0]?.id || "");
  const [domain, setDomain] = useState("General");
  const [target, setTarget] = useState("");
  const [origin, setOrigin] = useState<PromiseOrigin>("negotiated");
  const [dependsOn, setDependsOn] = useState<string[]>([]);
  const [estimatedHours, setEstimatedHours] = useState("");
  const [priority, setPriority] = useState<"normal" | "critical" | "high" | "low">("normal");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim() || !promiser) return;

    const promise: TeamPromise = {
      id: `TP-${Date.now()}`,
      isTeam: true,
      promiser,
      promisee: promisee || promiser,
      body: body.trim(),
      domain,
      status: "declared",
      note: "",
      verification: { method: "self-report" },
      depends_on: dependsOn,
      polarity: "give",
      origin,
      createdAt: new Date().toISOString(),
      target: target || undefined,
      estimatedHours: estimatedHours ? parseFloat(estimatedHours) : undefined,
      priority,
    };

    onSubmit(promise);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl border p-6 mb-6 max-w-lg"
    >
      <h3 className="font-serif font-semibold mb-3">Create Team Promise</h3>
      <div className="space-y-3">
        <div>
          <label htmlFor="tp-body" className="block text-sm font-medium text-gray-700 mb-1">
            What is being promised?
          </label>
          <textarea
            id="tp-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm resize-none"
            rows={2}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="tp-promiser" className="block text-sm font-medium text-gray-700 mb-1">
              Who&apos;s promising?
            </label>
            <select
              id="tp-promiser"
              value={promiser}
              onChange={(e) => setPromiser(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm bg-white"
            >
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="tp-promisee" className="block text-sm font-medium text-gray-700 mb-1">
              To whom?
            </label>
            <select
              id="tp-promisee"
              value={promisee}
              onChange={(e) => setPromisee(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm bg-white"
            >
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
              <option value="team">The team</option>
              <option value="client">A client</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="tp-origin" className="block text-sm font-medium text-gray-700 mb-1">
              Origin
            </label>
            <select
              id="tp-origin"
              value={origin}
              onChange={(e) => setOrigin(e.target.value as PromiseOrigin)}
              className="w-full border rounded-lg px-3 py-2 text-sm bg-white"
            >
              <option value="voluntary">Voluntary (self-committed)</option>
              <option value="imposed">Imposed (manager assigned)</option>
              <option value="negotiated">Negotiated (sprint planning)</option>
            </select>
          </div>
          <div>
            <label htmlFor="tp-priority" className="block text-sm font-medium text-gray-700 mb-1">
              Priority
            </label>
            <select
              id="tp-priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              className="w-full border rounded-lg px-3 py-2 text-sm bg-white"
            >
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="normal">Normal</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="tp-domain" className="block text-sm font-medium text-gray-700 mb-1">
              Domain
            </label>
            <input
              id="tp-domain"
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="tp-target" className="block text-sm font-medium text-gray-700 mb-1">
              Deadline
            </label>
            <input
              id="tp-target"
              type="date"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div>
          <label htmlFor="tp-hours" className="block text-sm font-medium text-gray-700 mb-1">
            Estimated hours (optional)
          </label>
          <input
            id="tp-hours"
            type="number"
            value={estimatedHours}
            onChange={(e) => setEstimatedHours(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm"
            min="0"
            step="0.5"
          />
        </div>

        {existingPromises.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Depends on (select existing promises)
            </label>
            <div className="max-h-32 overflow-y-auto border rounded-lg p-2 space-y-1">
              {existingPromises.map((p) => (
                <label key={p.id} className="flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={dependsOn.includes(p.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setDependsOn([...dependsOn, p.id]);
                      } else {
                        setDependsOn(dependsOn.filter((d) => d !== p.id));
                      }
                    }}
                  />
                  <span className="font-mono text-gray-500">{p.id}</span>
                  <span className="truncate">{p.body}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
          >
            Create Promise
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border text-sm rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
}
