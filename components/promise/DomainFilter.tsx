"use client";

import { getDomainColor } from "@/lib/utils/colors";

interface DomainFilterProps {
  domains: string[];
  selected: string | null;
  onSelect: (domain: string | null) => void;
  vertical?: string;
}

export function DomainFilter({ domains, selected, onSelect, vertical }: DomainFilterProps) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by domain">
      <button
        onClick={() => onSelect(null)}
        className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
          selected === null
            ? "bg-gray-900 text-white border-gray-900"
            : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
        }`}
      >
        All
      </button>
      {domains.map((domain) => {
        const color = getDomainColor(domain, vertical);
        const isActive = selected === domain;
        return (
          <button
            key={domain}
            onClick={() => onSelect(isActive ? null : domain)}
            className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
              isActive
                ? "text-white border-transparent"
                : "bg-white border-gray-300 hover:border-gray-400"
            }`}
            style={
              isActive
                ? { backgroundColor: color, borderColor: color }
                : { color }
            }
          >
            {domain}
          </button>
        );
      })}
    </div>
  );
}
