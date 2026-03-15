"use client";

import { useState } from "react";
import { PersonalPromise } from "@/lib/types/personal";

interface PromiseCreatorProps {
  onCreate: (promise: PersonalPromise) => void;
}

const defaultDomains = ["Work", "Health", "Relationships", "Creative", "Financial"];

export function PromiseCreator({ onCreate }: PromiseCreatorProps) {
  const [body, setBody] = useState("");
  const [promisee, setPromisee] = useState("self");
  const [domain, setDomain] = useState("Work");
  const [customDomain, setCustomDomain] = useState("");
  const [target, setTarget] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;

    const promise: PersonalPromise = {
      id: `PG-${Date.now()}`,
      isPersonal: true,
      promiser: "self",
      promisee: promisee || "self",
      body: body.trim(),
      domain: customDomain || domain,
      status: "declared",
      note: "",
      verification: { method: "self-report" },
      depends_on: [],
      polarity: "give",
      origin: "voluntary",
      createdAt: new Date().toISOString(),
      target: target || undefined,
    };

    onCreate(promise);
    setBody("");
    setPromisee("self");
    setTarget("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl border p-6 max-w-lg mx-auto"
    >
      <h3 className="font-serif text-lg font-semibold text-gray-900 mb-4">
        Plant a New Promise
      </h3>

      <div className="space-y-4">
        <div>
          <label htmlFor="promise-body" className="block text-sm font-medium text-gray-700 mb-1">
            What are you promising?
          </label>
          <textarea
            id="promise-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm resize-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
            rows={3}
            placeholder="e.g., Exercise three times a week"
            required
          />
        </div>

        <div>
          <label htmlFor="promise-to" className="block text-sm font-medium text-gray-700 mb-1">
            To whom?
          </label>
          <input
            id="promise-to"
            type="text"
            value={promisee}
            onChange={(e) => setPromisee(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm"
            placeholder="self, a person, a group..."
          />
        </div>

        <div>
          <label htmlFor="promise-domain" className="block text-sm font-medium text-gray-700 mb-1">
            Domain
          </label>
          <select
            id="promise-domain"
            value={domain}
            onChange={(e) => {
              setDomain(e.target.value);
              if (e.target.value !== "custom") setCustomDomain("");
            }}
            className="w-full border rounded-lg px-3 py-2 text-sm bg-white"
          >
            {defaultDomains.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
            <option value="custom">Custom...</option>
          </select>
          {domain === "custom" && (
            <input
              type="text"
              value={customDomain}
              onChange={(e) => setCustomDomain(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm mt-2"
              placeholder="Enter custom domain"
              required
            />
          )}
        </div>

        <div>
          <label htmlFor="promise-target" className="block text-sm font-medium text-gray-700 mb-1">
            By when? (optional)
          </label>
          <input
            id="promise-target"
            type="date"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <button
          type="submit"
          className="w-full py-2.5 bg-green-700 text-white text-sm font-medium rounded-lg hover:bg-green-800 transition-colors"
        >
          Plant This Promise
        </button>
      </div>
    </form>
  );
}
