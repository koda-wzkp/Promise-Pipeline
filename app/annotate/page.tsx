"use client";

import { useReducer, useEffect, useCallback, useRef, useState } from "react";
import { PromiseStatus } from "@/lib/types/promise";
import { StatusBadge } from "@/components/promise/StatusBadge";

// ─── TYPES ───

interface BillMeta {
  slug: string;
  name: string;
  jurisdiction: string;
  year?: number;
  citation?: string;
  fetchedAt: string;
}

interface PromiseCandidate {
  id: string;
  ref: string;
  promiser: string;
  promisee: string;
  body: string;
  domain: string;
  status: "declared";
  polarity: "give" | "accept";
  origin: "imposed";
  scope: string[] | null;
  target: string | null;
  progress: number | null;
  required: number | null;
  note: string;
  verification: {
    method: string;
    source: string | null;
    metric: string | null;
    frequency: string | null;
  };
  depends_on: string[];
  sourceText: string;
  confidence: number;
  extractionNotes: string;
}

interface BillSearchResult {
  id: string;
  identifier: string;
  title: string;
  jurisdiction: { name: string };
  session: string;
  abstract?: string;
}

type AnnotationStatus = "accepted" | "rejected" | "skipped";

interface AnnotatedPromise {
  id: string;
  ref?: string;
  promiser: string;
  promisee: string;
  body: string;
  domain: string;
  status: PromiseStatus;
  polarity: "give" | "accept";
  origin: string;
  scope: string[] | null;
  target?: string;
  progress?: number;
  required?: number;
  note: string;
  verification: {
    method: string;
    source?: string;
    metric?: string;
    frequency?: string;
  };
  depends_on: string[];
  _annotation: {
    billSlug: string;
    billName: string;
    jurisdiction: string;
    annotatedAt: string;
    annotationStatus: AnnotationStatus;
    wasEdited: boolean;
    originalExtraction: Partial<PromiseCandidate>;
    sourceText: string;
    confidence: number;
    claudeNotes: string;
  };
}

type Phase = "search" | "extracting" | "annotating" | "complete" | "error";

interface AnnotationState {
  phase: Phase;
  bill: BillMeta | null;
  billText: string;
  candidates: PromiseCandidate[];
  currentIndex: number;
  decisions: Record<string, AnnotationStatus>;
  edits: Record<string, Partial<PromiseCandidate>>;
  extractionError: { type: "parse_failed"; rawText: string } | null;
  searchResults: BillSearchResult[];
  searchLoading: boolean;
  retryCount: number;
}

type AnnotationAction =
  | { type: "SET_SEARCH_RESULTS"; results: BillSearchResult[] }
  | { type: "SET_SEARCH_LOADING"; loading: boolean }
  | { type: "BILL_LOADED"; bill: BillMeta; text: string }
  | { type: "EXTRACTION_COMPLETE"; candidates: PromiseCandidate[] }
  | {
      type: "EXTRACTION_FAILED";
      error: { type: "parse_failed"; rawText: string };
    }
  | { type: "ACCEPT"; id: string; edits?: Partial<PromiseCandidate> }
  | { type: "REJECT"; id: string }
  | { type: "SKIP"; id: string }
  | { type: "PREVIOUS" }
  | { type: "EDIT_FIELD"; id: string; field: string; value: any }
  | { type: "RESET" }
  | { type: "INCREMENT_RETRY" };

function reducer(
  state: AnnotationState,
  action: AnnotationAction
): AnnotationState {
  switch (action.type) {
    case "SET_SEARCH_RESULTS":
      return { ...state, searchResults: action.results, searchLoading: false };
    case "SET_SEARCH_LOADING":
      return { ...state, searchLoading: action.loading };
    case "BILL_LOADED":
      return {
        ...state,
        phase: "extracting",
        bill: action.bill,
        billText: action.text,
      };
    case "EXTRACTION_COMPLETE":
      return {
        ...state,
        phase: action.candidates.length > 0 ? "annotating" : "complete",
        candidates: action.candidates,
        currentIndex: 0,
        retryCount: 0,
      };
    case "EXTRACTION_FAILED":
      return {
        ...state,
        phase: "error",
        extractionError: action.error,
      };
    case "ACCEPT": {
      const newDecisions = {
        ...state.decisions,
        [action.id]: "accepted" as const,
      };
      const newEdits = action.edits
        ? { ...state.edits, [action.id]: action.edits }
        : state.edits;
      const nextIndex = state.currentIndex + 1;
      return {
        ...state,
        decisions: newDecisions,
        edits: newEdits,
        currentIndex: nextIndex,
        phase: nextIndex >= state.candidates.length ? "complete" : "annotating",
      };
    }
    case "REJECT": {
      const newDecisions = {
        ...state.decisions,
        [action.id]: "rejected" as const,
      };
      const nextIndex = state.currentIndex + 1;
      return {
        ...state,
        decisions: newDecisions,
        currentIndex: nextIndex,
        phase: nextIndex >= state.candidates.length ? "complete" : "annotating",
      };
    }
    case "SKIP": {
      // Move to end of queue
      const candidates = [...state.candidates];
      const skipped = candidates.splice(state.currentIndex, 1);
      candidates.push(...skipped);
      return {
        ...state,
        candidates,
        decisions: { ...state.decisions, [action.id]: "skipped" as const },
      };
    }
    case "PREVIOUS":
      return {
        ...state,
        currentIndex: Math.max(0, state.currentIndex - 1),
      };
    case "EDIT_FIELD": {
      const existing = state.edits[action.id] || {};
      return {
        ...state,
        edits: {
          ...state.edits,
          [action.id]: { ...existing, [action.field]: action.value },
        },
      };
    }
    case "INCREMENT_RETRY":
      return { ...state, retryCount: state.retryCount + 1 };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

const initialState: AnnotationState = {
  phase: "search",
  bill: null,
  billText: "",
  candidates: [],
  currentIndex: 0,
  decisions: {},
  edits: {},
  extractionError: null,
  searchResults: [],
  searchLoading: false,
  retryCount: 0,
};

// ─── STATES ───
const STATES = [
  "Washington",
  "Virginia",
  "Illinois",
  "New York",
  "New Mexico",
  "Massachusetts",
  "Minnesota",
  "Michigan",
  "California",
  "Oregon",
];

const DOMAINS = [
  "Emissions",
  "Planning",
  "Verification",
  "Equity",
  "Affordability",
  "Tribal",
  "Workforce",
  "Safety",
  "Transparency",
  "Other",
];

// ─── MAIN COMPONENT ───

export default function AnnotatePage() {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#faf9f6" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="mb-6">
          <h1 className="font-serif text-2xl font-bold text-gray-900">
            Promise Annotation Tool
          </h1>
          <p className="text-sm text-gray-500">
            Internal tool for building the Promise Pipeline training dataset.
          </p>
        </div>

        {state.phase === "search" && (
          <SearchPhase state={state} dispatch={dispatch} />
        )}
        {state.phase === "extracting" && <ExtractingPhase state={state} />}
        {state.phase === "annotating" && (
          <AnnotatingPhase state={state} dispatch={dispatch} />
        )}
        {state.phase === "complete" && (
          <CompletePhase state={state} dispatch={dispatch} />
        )}
        {state.phase === "error" && (
          <ErrorPhase state={state} dispatch={dispatch} />
        )}
      </div>
    </div>
  );
}

// ─── SEARCH PHASE ───

function SearchPhase({
  state,
  dispatch,
}: {
  state: AnnotationState;
  dispatch: React.Dispatch<AnnotationAction>;
}) {
  const [query, setQuery] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [manualText, setManualText] = useState("");
  const [showManual, setShowManual] = useState(false);
  const [manualBillName, setManualBillName] = useState("");

  const search = async () => {
    if (!query.trim()) return;
    dispatch({ type: "SET_SEARCH_LOADING", loading: true });

    try {
      const params = new URLSearchParams({
        q: query,
        ...(selectedState && { jurisdiction: selectedState.toLowerCase() }),
        classification: "bill",
        per_page: "10",
      });

      const headers: Record<string, string> = {};
      // Note: OPENSTATES_API_KEY is server-side only. For client-side,
      // we'd need an API route proxy. For now, use without key.

      const response = await fetch(
        `https://v3.openstates.org/bills?${params}`,
        { headers }
      );

      if (response.ok) {
        const data = await response.json();
        dispatch({
          type: "SET_SEARCH_RESULTS",
          results: data.results || [],
        });
      } else {
        dispatch({ type: "SET_SEARCH_RESULTS", results: [] });
      }
    } catch {
      dispatch({ type: "SET_SEARCH_RESULTS", results: [] });
    }
  };

  const loadBill = async (result: BillSearchResult) => {
    const slug = `${result.jurisdiction.name.toLowerCase().replace(/\s+/g, "-")}-${result.identifier.toLowerCase().replace(/\s+/g, "-")}`;
    const bill: BillMeta = {
      slug,
      name: result.title,
      jurisdiction: result.jurisdiction.name,
      citation: result.identifier,
      fetchedAt: new Date().toISOString(),
    };

    // Try to fetch full text
    try {
      const response = await fetch(
        `https://v3.openstates.org/bills/${encodeURIComponent(result.id)}?include=full_text&include=documents`,
        {}
      );

      if (response.ok) {
        const data = await response.json();

        // Check for full text versions
        if (data.versions && data.versions.length > 0) {
          for (const version of data.versions) {
            if (version.links) {
              for (const link of version.links) {
                if (
                  link.media_type === "text/html" ||
                  link.media_type === "text/plain"
                ) {
                  try {
                    const textResponse = await fetch(link.url);
                    if (textResponse.ok) {
                      let text = await textResponse.text();
                      // Strip HTML tags if needed
                      if (link.media_type === "text/html") {
                        text = text.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
                      }
                      if (text.length > 100) {
                        dispatch({ type: "BILL_LOADED", bill, text });
                        triggerExtraction(text, bill, dispatch);
                        return;
                      }
                    }
                  } catch {
                    continue;
                  }
                }
              }
            }
          }
        }
      }
    } catch {
      // Fall through to manual
    }

    // If we get here, no text was found — show manual paste
    setShowManual(true);
    setManualBillName(result.title);
  };

  const loadManualText = () => {
    if (!manualText.trim()) return;
    const slug = manualBillName
      ? manualBillName.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 50)
      : `manual-${Date.now()}`;
    const bill: BillMeta = {
      slug,
      name: manualBillName || "Manual Entry",
      jurisdiction: selectedState || "Unknown",
      fetchedAt: new Date().toISOString(),
    };
    dispatch({ type: "BILL_LOADED", bill, text: manualText });
    triggerExtraction(manualText, bill, dispatch);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Search */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="font-serif text-lg font-semibold text-gray-900 mb-4">
          Search Bills
        </h2>
        <div className="flex gap-2 mb-4">
          <label htmlFor="search-query" className="sr-only">Search bills</label>
          <input
            id="search-query"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 border rounded-lg px-3 py-2 text-sm"
            placeholder="Search bills by state, topic, or bill number"
            onKeyDown={(e) => e.key === "Enter" && search()}
          />
          <label htmlFor="state-filter" className="sr-only">State filter</label>
          <select
            id="state-filter"
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm bg-white"
          >
            <option value="">All States</option>
            {STATES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <button
            onClick={search}
            disabled={state.searchLoading}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {state.searchLoading ? "Searching..." : "Search"}
          </button>
        </div>

        {/* Results */}
        {state.searchResults.length > 0 && (
          <div className="space-y-2">
            {state.searchResults.map((result) => (
              <div
                key={result.id}
                className="border rounded-lg p-3 flex justify-between items-start"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {result.identifier} — {result.title}
                  </p>
                  <p className="text-xs text-gray-500">
                    {result.jurisdiction.name} · {result.session}
                  </p>
                  {result.abstract && (
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                      {result.abstract}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => loadBill(result)}
                  className="ml-3 px-3 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded hover:bg-blue-100 shrink-0"
                >
                  Load
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Manual paste */}
      <div className="bg-white rounded-xl border p-6">
        <button
          onClick={() => setShowManual(!showManual)}
          className="text-sm text-blue-600 hover:underline font-medium"
        >
          {showManual ? "Hide manual paste" : "Paste bill text manually"}
        </button>

        {showManual && (
          <div className="mt-4 space-y-3">
            <div>
              <label htmlFor="manual-bill-name" className="block text-sm font-medium text-gray-700 mb-1">
                Bill name
              </label>
              <input
                id="manual-bill-name"
                type="text"
                value={manualBillName}
                onChange={(e) => setManualBillName(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="e.g., Washington CETA SB 5116"
              />
            </div>
            <div>
              <label htmlFor="manual-text" className="block text-sm font-medium text-gray-700 mb-1">
                Bill text
              </label>
              <textarea
                id="manual-text"
                value={manualText}
                onChange={(e) => setManualText(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm font-mono resize-y"
                rows={10}
                placeholder="Paste the full text of the bill here..."
              />
            </div>
            <button
              onClick={loadManualText}
              disabled={!manualText.trim()}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              Extract Promises
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── EXTRACTION TRIGGER ───

async function triggerExtraction(
  text: string,
  bill: BillMeta,
  dispatch: React.Dispatch<AnnotationAction>
) {
  try {
    const response = await fetch("/api/annotate/extract", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ billText: text, billMeta: bill }),
    });

    const data = await response.json();

    if (data.error === "parse_failed") {
      dispatch({
        type: "EXTRACTION_FAILED",
        error: { type: "parse_failed", rawText: data.rawText },
      });
    } else if (data.candidates) {
      dispatch({
        type: "EXTRACTION_COMPLETE",
        candidates: data.candidates,
      });
    } else {
      dispatch({
        type: "EXTRACTION_FAILED",
        error: {
          type: "parse_failed",
          rawText: JSON.stringify(data),
        },
      });
    }
  } catch (error) {
    dispatch({
      type: "EXTRACTION_FAILED",
      error: {
        type: "parse_failed",
        rawText: String(error),
      },
    });
  }
}

// ─── EXTRACTING PHASE ───

function ExtractingPhase({ state }: { state: AnnotationState }) {
  return (
    <div className="max-w-xl mx-auto text-center py-16">
      <div className="animate-pulse mb-4">
        <div className="w-16 h-16 rounded-full bg-blue-100 mx-auto flex items-center justify-center">
          <svg
            className="w-8 h-8 text-blue-600 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>
      </div>
      <h2 className="font-serif text-xl font-semibold text-gray-900 mb-2">
        Extracting promise candidates...
      </h2>
      <p className="text-sm text-gray-500">
        Analyzing {state.bill?.name || "bill"} with Claude
      </p>
    </div>
  );
}

// ─── ERROR PHASE ───

function ErrorPhase({
  state,
  dispatch,
}: {
  state: AnnotationState;
  dispatch: React.Dispatch<AnnotationAction>;
}) {
  const [editedRaw, setEditedRaw] = useState(
    state.extractionError?.rawText || ""
  );

  const retry = () => {
    if (state.retryCount >= 2) {
      // After 2 retries, let user edit the raw response
      return;
    }
    dispatch({ type: "INCREMENT_RETRY" });
    if (state.bill && state.billText) {
      dispatch({
        type: "BILL_LOADED",
        bill: state.bill,
        text: state.billText,
      });
      triggerExtraction(state.billText, state.bill, dispatch);
    }
  };

  const parseManually = () => {
    try {
      const clean = editedRaw.replace(/```json|```/g, "").trim();
      const candidates = JSON.parse(clean);
      if (Array.isArray(candidates)) {
        dispatch({ type: "EXTRACTION_COMPLETE", candidates });
      }
    } catch {
      alert("Invalid JSON. Please fix and try again.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <h2 className="font-serif text-lg font-semibold text-red-900 mb-2">
          Extraction Failed
        </h2>
        <p className="text-sm text-red-700 mb-4">
          Claude returned a response that couldn&apos;t be parsed as JSON.
          {state.retryCount < 2
            ? " You can retry or view the raw response."
            : " Edit the raw response below to fix the JSON."}
        </p>

        <div className="flex gap-2 mb-4">
          {state.retryCount < 2 && (
            <button
              onClick={retry}
              className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700"
            >
              Retry ({2 - state.retryCount} left)
            </button>
          )}
          <button
            onClick={() => dispatch({ type: "RESET" })}
            className="px-4 py-2 border text-sm rounded-lg hover:bg-gray-50"
          >
            Start Over
          </button>
        </div>

        <div>
          <label htmlFor="raw-response" className="block text-sm font-medium text-gray-700 mb-1">
            Raw response{state.retryCount >= 2 ? " (editable)" : ""}
          </label>
          <textarea
            id="raw-response"
            value={editedRaw}
            onChange={(e) => setEditedRaw(e.target.value)}
            readOnly={state.retryCount < 2}
            className="w-full border rounded-lg px-3 py-2 text-xs font-mono h-48 resize-y"
          />
          {state.retryCount >= 2 && (
            <button
              onClick={parseManually}
              className="mt-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
            >
              Parse Edited JSON
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── ANNOTATING PHASE ───

function AnnotatingPhase({
  state,
  dispatch,
}: {
  state: AnnotationState;
  dispatch: React.Dispatch<AnnotationAction>;
}) {
  const candidate = state.candidates[state.currentIndex];
  if (!candidate) return null;

  const edits = state.edits[candidate.id] || {};
  const getValue = (field: string) =>
    (edits as any)[field] !== undefined
      ? (edits as any)[field]
      : (candidate as any)[field];

  const acceptedCount = Object.values(state.decisions).filter(
    (d) => d === "accepted"
  ).length;
  const rejectedCount = Object.values(state.decisions).filter(
    (d) => d === "rejected"
  ).length;
  const skippedCount = Object.values(state.decisions).filter(
    (d) => d === "skipped"
  ).length;

  const wasEdited = Object.keys(edits).length > 0;

  const handleAccept = async () => {
    const billSlug = state.bill?.slug || "unknown";
    const prefix = billSlug.split("-")[0].toUpperCase();
    const counter = String(acceptedCount + 1).padStart(3, "0");
    const finalId = `${prefix}-${counter}`;

    const annotated: AnnotatedPromise = {
      id: finalId,
      ref: getValue("ref"),
      promiser: getValue("promiser"),
      promisee: getValue("promisee"),
      body: getValue("body"),
      domain: getValue("domain"),
      status: "declared",
      polarity: getValue("polarity"),
      origin: getValue("origin") || "imposed",
      scope: getValue("scope"),
      target: getValue("target") || undefined,
      progress: getValue("progress") || undefined,
      required: getValue("required") || undefined,
      note: getValue("note"),
      verification: {
        method: getValue("verification")?.method || candidate.verification.method,
        source: (getValue("verification")?.source || candidate.verification.source) ?? undefined,
        metric: (getValue("verification")?.metric || candidate.verification.metric) ?? undefined,
        frequency: (getValue("verification")?.frequency || candidate.verification.frequency) ?? undefined,
      },
      depends_on: getValue("depends_on") || [],
      _annotation: {
        billSlug,
        billName: state.bill?.name || "",
        jurisdiction: state.bill?.jurisdiction || "",
        annotatedAt: new Date().toISOString(),
        annotationStatus: "accepted",
        wasEdited,
        originalExtraction: { ...candidate },
        sourceText: candidate.sourceText,
        confidence: candidate.confidence,
        claudeNotes: candidate.extractionNotes,
      },
    };

    // Auto-save
    await fetch("/api/annotate/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        billSlug,
        billMeta: state.bill,
        promise: annotated,
        action: "accept",
      }),
    });

    dispatch({ type: "ACCEPT", id: candidate.id, edits: wasEdited ? edits : undefined });
  };

  const handleReject = async () => {
    const billSlug = state.bill?.slug || "unknown";
    const prefix = billSlug.split("-")[0].toUpperCase();
    const rejCount = rejectedCount + 1;
    const finalId = `${prefix}-REJ-${String(rejCount).padStart(3, "0")}`;

    const annotated: AnnotatedPromise = {
      id: finalId,
      promiser: candidate.promiser,
      promisee: candidate.promisee,
      body: candidate.body,
      domain: candidate.domain,
      status: "declared",
      polarity: candidate.polarity,
      origin: candidate.origin || "imposed",
      scope: candidate.scope,
      note: candidate.note,
      verification: {
        method: candidate.verification.method,
        source: candidate.verification.source ?? undefined,
        metric: candidate.verification.metric ?? undefined,
        frequency: candidate.verification.frequency ?? undefined,
      },
      depends_on: candidate.depends_on || [],
      _annotation: {
        billSlug,
        billName: state.bill?.name || "",
        jurisdiction: state.bill?.jurisdiction || "",
        annotatedAt: new Date().toISOString(),
        annotationStatus: "rejected",
        wasEdited: false,
        originalExtraction: { ...candidate },
        sourceText: candidate.sourceText,
        confidence: candidate.confidence,
        claudeNotes: candidate.extractionNotes,
      },
    };

    await fetch("/api/annotate/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        billSlug,
        billMeta: state.bill,
        promise: annotated,
        action: "reject",
      }),
    });

    dispatch({ type: "REJECT", id: candidate.id });
  };

  const handleSkip = () => {
    dispatch({ type: "SKIP", id: candidate.id });
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT"
      )
        return;

      switch (e.key.toLowerCase()) {
        case "a":
          handleAccept();
          break;
        case "r":
          handleReject();
          break;
        case "s":
          handleSkip();
          break;
        case "arrowleft":
          dispatch({ type: "PREVIOUS" });
          break;
        case "arrowright":
          handleAccept();
          break;
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  const confidenceColor =
    candidate.confidence >= 0.85
      ? "#1a5f4a"
      : candidate.confidence >= 0.65
      ? "#78350f"
      : "#991b1b";

  // Extract commitment_type from extractionNotes
  const commitmentType = candidate.extractionNotes?.match(
    /commitment_type:\s*(\S+)/
  )?.[1];
  const hasIncompleteBinding =
    candidate.extractionNotes?.includes("incomplete_binding:");
  const hasScopeGap = candidate.extractionNotes?.includes("scope_gap:");
  const hasThreat = candidate.extractionNotes?.includes("threat:");

  return (
    <div>
      {/* Progress header */}
      <div className="bg-white border-b px-4 py-3 mb-6 -mx-4 sm:-mx-6 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="text-sm">
            <span className="font-medium text-gray-900">
              {state.bill?.name}
            </span>
            <span className="text-gray-400 ml-4">
              Promise {state.currentIndex + 1} of {state.candidates.length}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="text-green-700">{acceptedCount} accepted</span>
            <span className="text-red-700">{rejectedCount} rejected</span>
            <span className="text-gray-500">{skippedCount} skipped</span>
            <ExportButton state={state} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: Bill text */}
        <div className="lg:col-span-2">
          <BillTextViewer
            text={state.billText}
            sourceText={candidate.sourceText}
          />
        </div>

        {/* Right: Annotation card */}
        <div className="lg:col-span-3">
          <div
            className={`bg-white rounded-xl border p-5 ${
              candidate.confidence < 0.65 ? "border-l-4 border-l-amber-400" : ""
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs text-gray-500">
                  {candidate.id}
                </span>
                <span
                  className="text-xs font-medium px-2 py-0.5 rounded-full"
                  style={{
                    color: confidenceColor,
                    backgroundColor: confidenceColor + "15",
                  }}
                >
                  Confidence: {Math.round(candidate.confidence * 100)}%
                </span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-blue-50 text-blue-700">
                  {getValue("polarity") === "give" ? "+give" : "-accept"}
                </span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-700">
                  {getValue("domain")}
                </span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
                  {getValue("origin") || "imposed"}
                </span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
                  {getValue("verification")?.method || candidate.verification.method}
                </span>
              </div>
            </div>

            {/* Badges for special flags */}
            <div className="flex gap-1 mb-3 flex-wrap">
              {commitmentType && (
                <span className="text-xs px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                  ⚠ {commitmentType} — review domain
                </span>
              )}
              {hasIncompleteBinding && (
                <span className="text-xs px-2 py-0.5 rounded bg-purple-50 text-purple-800 border border-purple-200">
                  Incomplete binding
                </span>
              )}
              {hasScopeGap && (
                <span className="text-xs px-2 py-0.5 rounded bg-orange-50 text-orange-800 border border-orange-200">
                  Scope gap
                </span>
              )}
              {hasThreat && (
                <span className="text-xs px-2 py-0.5 rounded bg-red-50 text-red-800 border border-red-200">
                  Threat
                </span>
              )}
            </div>

            {/* Editable fields */}
            <div className="space-y-3">
              <FieldEditor
                label="Body"
                value={getValue("body")}
                onChange={(v) =>
                  dispatch({
                    type: "EDIT_FIELD",
                    id: candidate.id,
                    field: "body",
                    value: v,
                  })
                }
                type="textarea"
              />
              <div className="grid grid-cols-2 gap-3">
                <FieldEditor
                  label="Promiser"
                  value={getValue("promiser")}
                  onChange={(v) =>
                    dispatch({
                      type: "EDIT_FIELD",
                      id: candidate.id,
                      field: "promiser",
                      value: v,
                    })
                  }
                />
                <FieldEditor
                  label="Promisee"
                  value={getValue("promisee")}
                  onChange={(v) =>
                    dispatch({
                      type: "EDIT_FIELD",
                      id: candidate.id,
                      field: "promisee",
                      value: v,
                    })
                  }
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <SelectEditor
                  label="Polarity"
                  value={getValue("polarity")}
                  options={["give", "accept"]}
                  onChange={(v) =>
                    dispatch({
                      type: "EDIT_FIELD",
                      id: candidate.id,
                      field: "polarity",
                      value: v,
                    })
                  }
                />
                <SelectEditor
                  label="Domain"
                  value={getValue("domain")}
                  options={DOMAINS}
                  onChange={(v) =>
                    dispatch({
                      type: "EDIT_FIELD",
                      id: candidate.id,
                      field: "domain",
                      value: v,
                    })
                  }
                />
                <SelectEditor
                  label="Origin"
                  value={getValue("origin") || "imposed"}
                  options={["imposed", "voluntary", "negotiated"]}
                  onChange={(v) =>
                    dispatch({
                      type: "EDIT_FIELD",
                      id: candidate.id,
                      field: "origin",
                      value: v,
                    })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FieldEditor
                  label="Target date"
                  value={getValue("target") || ""}
                  onChange={(v) =>
                    dispatch({
                      type: "EDIT_FIELD",
                      id: candidate.id,
                      field: "target",
                      value: v || null,
                    })
                  }
                  type="date"
                />
                <FieldEditor
                  label="Ref"
                  value={getValue("ref") || ""}
                  onChange={(v) =>
                    dispatch({
                      type: "EDIT_FIELD",
                      id: candidate.id,
                      field: "ref",
                      value: v,
                    })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FieldEditor
                  label="Progress (%)"
                  value={getValue("progress") ?? ""}
                  onChange={(v) =>
                    dispatch({
                      type: "EDIT_FIELD",
                      id: candidate.id,
                      field: "progress",
                      value: v ? Number(v) : null,
                    })
                  }
                  type="number"
                />
                <FieldEditor
                  label="Required (%)"
                  value={getValue("required") ?? ""}
                  onChange={(v) =>
                    dispatch({
                      type: "EDIT_FIELD",
                      id: candidate.id,
                      field: "required",
                      value: v ? Number(v) : null,
                    })
                  }
                  type="number"
                />
              </div>
              <SelectEditor
                label="Verification method"
                value={getValue("verification")?.method || candidate.verification.method}
                options={["filing", "audit", "self-report", "sensor", "benchmark", "none"]}
                onChange={(v) =>
                  dispatch({
                    type: "EDIT_FIELD",
                    id: candidate.id,
                    field: "verification",
                    value: { ...candidate.verification, ...edits.verification, method: v },
                  })
                }
              />
              <FieldEditor
                label="Note"
                value={getValue("note") || ""}
                onChange={(v) =>
                  dispatch({
                    type: "EDIT_FIELD",
                    id: candidate.id,
                    field: "note",
                    value: v,
                  })
                }
                type="textarea"
              />
              <FieldEditor
                label="Depends on (comma-separated IDs)"
                value={(getValue("depends_on") || []).join(", ")}
                onChange={(v) =>
                  dispatch({
                    type: "EDIT_FIELD",
                    id: candidate.id,
                    field: "depends_on",
                    value: v
                      ? v.split(",").map((s: string) => s.trim()).filter(Boolean)
                      : [],
                  })
                }
              />
              <FieldEditor
                label="Scope (comma-separated agent IDs, empty = public)"
                value={(getValue("scope") || []).join(", ")}
                onChange={(v) =>
                  dispatch({
                    type: "EDIT_FIELD",
                    id: candidate.id,
                    field: "scope",
                    value: v
                      ? v.split(",").map((s: string) => s.trim()).filter(Boolean)
                      : null,
                  })
                }
              />
            </div>

            {/* Extraction metadata */}
            <details className="mt-4">
              <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                Extraction metadata
              </summary>
              <div className="mt-2 space-y-2">
                {candidate.sourceText && (
                  <blockquote className="text-xs text-gray-600 border-l-2 border-gray-200 pl-3 italic">
                    {candidate.sourceText}
                  </blockquote>
                )}
                {candidate.extractionNotes && (
                  <p className="text-xs text-gray-500">
                    <strong>Claude&apos;s notes:</strong>{" "}
                    {candidate.extractionNotes}
                  </p>
                )}
              </div>
            </details>

            {/* Action buttons */}
            <div className="flex gap-2 mt-5">
              <button
                onClick={() => dispatch({ type: "PREVIOUS" })}
                disabled={state.currentIndex === 0}
                className="px-4 py-2 border text-sm rounded-lg hover:bg-gray-50 disabled:opacity-30"
              >
                ← Previous
              </button>
              <button
                onClick={handleSkip}
                className="px-4 py-2 border text-sm rounded-lg hover:bg-gray-50"
              >
                Skip
              </button>
              <button
                onClick={handleReject}
                className="px-4 py-2 bg-red-50 text-red-700 text-sm rounded-lg hover:bg-red-100 border border-red-200"
              >
                Reject
              </button>
              <button
                onClick={handleAccept}
                className="flex-1 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700"
              >
                Accept →
              </button>
            </div>

            {/* Keyboard shortcut legend */}
            <div className="mt-3 flex gap-3 text-xs text-gray-400 justify-center">
              <span>
                <kbd className="px-1 py-0.5 bg-gray-100 rounded">A</kbd> Accept
              </span>
              <span>
                <kbd className="px-1 py-0.5 bg-gray-100 rounded">R</kbd> Reject
              </span>
              <span>
                <kbd className="px-1 py-0.5 bg-gray-100 rounded">S</kbd> Skip
              </span>
              <span>
                <kbd className="px-1 py-0.5 bg-gray-100 rounded">←</kbd>
                <kbd className="px-1 py-0.5 bg-gray-100 rounded">→</kbd> Nav
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── COMPLETE PHASE ───

function CompletePhase({
  state,
  dispatch,
}: {
  state: AnnotationState;
  dispatch: React.Dispatch<AnnotationAction>;
}) {
  const acceptedCount = Object.values(state.decisions).filter(
    (d) => d === "accepted"
  ).length;
  const rejectedCount = Object.values(state.decisions).filter(
    (d) => d === "rejected"
  ).length;

  return (
    <div className="max-w-xl mx-auto text-center py-16">
      <div className="text-5xl mb-4">✅</div>
      <h2 className="font-serif text-xl font-semibold text-gray-900 mb-2">
        Annotation Complete
      </h2>
      <p className="text-gray-600 mb-6">
        {acceptedCount} promises verified from {state.bill?.name || "this bill"}.
        {rejectedCount > 0 && ` ${rejectedCount} rejected.`}
      </p>
      <div className="flex gap-3 justify-center">
        <button
          onClick={() => dispatch({ type: "RESET" })}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          Start New Bill
        </button>
        <ExportButton state={state} />
      </div>
    </div>
  );
}

// ─── HELPER COMPONENTS ───

function BillTextViewer({
  text,
  sourceText,
}: {
  text: string;
  sourceText: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Find and highlight source text
  const lowerText = text.toLowerCase();
  const lowerSource = sourceText?.toLowerCase() || "";
  const matchIndex = lowerSource ? lowerText.indexOf(lowerSource) : -1;

  useEffect(() => {
    if (matchIndex >= 0 && containerRef.current) {
      const highlight = containerRef.current.querySelector("[data-highlight]");
      if (highlight) {
        highlight.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [matchIndex, sourceText]);

  if (matchIndex >= 0) {
    const before = text.slice(0, matchIndex);
    const match = text.slice(matchIndex, matchIndex + sourceText.length);
    const after = text.slice(matchIndex + sourceText.length);

    return (
      <div
        ref={containerRef}
        className="bg-white rounded-xl border p-4 h-[600px] overflow-y-auto"
      >
        <h3 className="font-serif font-semibold text-gray-900 mb-3 text-sm sticky top-0 bg-white pb-2">
          Bill Text
        </h3>
        <div className="text-xs font-mono text-gray-600 whitespace-pre-wrap leading-relaxed">
          {before}
          <span
            data-highlight
            className="px-0.5 rounded"
            style={{ backgroundColor: "#fffbeb", color: "#78350f" }}
          >
            {match}
          </span>
          {after}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="bg-white rounded-xl border p-4 h-[600px] overflow-y-auto"
    >
      <h3 className="font-serif font-semibold text-gray-900 mb-2 text-sm sticky top-0 bg-white pb-2">
        Bill Text
      </h3>
      {sourceText && (
        <p className="text-xs text-amber-700 bg-amber-50 rounded p-2 mb-3">
          Source text not located in document — review manually
        </p>
      )}
      <div className="text-xs font-mono text-gray-600 whitespace-pre-wrap leading-relaxed">
        {text}
      </div>
    </div>
  );
}

function FieldEditor({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  type?: "text" | "textarea" | "date" | "number";
}) {
  const id = `field-${label.toLowerCase().replace(/\s+/g, "-")}`;

  if (type === "textarea") {
    return (
      <div>
        <label htmlFor={id} className="block text-xs font-medium text-gray-600 mb-0.5">
          {label}
        </label>
        <textarea
          id={id}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-full border rounded px-2 py-1 text-sm resize-none"
          rows={2}
        />
      </div>
    );
  }

  return (
    <div>
      <label htmlFor={id} className="block text-xs font-medium text-gray-600 mb-0.5">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border rounded px-2 py-1 text-sm"
        {...(type === "number" ? { min: 0, max: 100 } : {})}
      />
    </div>
  );
}

function SelectEditor({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  const id = `select-${label.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <div>
      <label htmlFor={id} className="block text-xs font-medium text-gray-600 mb-0.5">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border rounded px-2 py-1 text-sm bg-white"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

function ExportButton({ state }: { state: AnnotationState }) {
  const handleExport = async () => {
    if (!state.bill) return;

    try {
      const response = await fetch(
        `/api/annotate/save`,
        { method: "GET" }
      );
      // Create a download from the current bill's data
      // Since we auto-save, just read the file content
    } catch {
      // Fallback: generate from state
    }

    // Generate export from current state
    const exportData = {
      bill: state.bill,
      stats: {
        totalCandidates: state.candidates.length,
        accepted: Object.values(state.decisions).filter((d) => d === "accepted").length,
        rejected: Object.values(state.decisions).filter((d) => d === "rejected").length,
        skipped: Object.values(state.decisions).filter((d) => d === "skipped").length,
      },
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${state.bill.slug || "export"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleExport}
      className="px-3 py-1 text-xs font-medium border rounded-lg hover:bg-gray-50"
    >
      Export JSON
    </button>
  );
}
