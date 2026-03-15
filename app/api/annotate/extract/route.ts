import { NextResponse } from "next/server";
import { promises as hb2021Promises } from "@/lib/data/hb2021";
import { Promise as PromiseType } from "@/lib/types/promise";

function selectFewShotExamples(allPromises: PromiseType[]): PromiseType[] {
  const targetIds = ["P001", "P010", "P002", "P016", "P018"];
  return targetIds
    .map((id) => allPromises.find((p) => p.id === id))
    .filter(Boolean) as PromiseType[];
}

function buildExtractionSystemPrompt(): string {
  const examples = selectFewShotExamples(hb2021Promises);
  const examplesJson = JSON.stringify(examples, null, 2);

  return `You are a promise extraction engine for Promise Pipeline, a civic accountability platform that applies Promise Theory to legislative analysis.

Your task: read a piece of legislation and extract every discrete promise it contains. A promise is a commitment made by a specific agent to a specific beneficiary, with a verifiable body and (where specified) a deadline and verification mechanism.

## Promise Schema

Every promise you extract must conform to this TypeScript type:

\`\`\`typescript
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
    method: "filing" | "audit" | "self-report" | "sensor" | "benchmark" | "none";
    source: string | null;
    metric: string | null;
    frequency: string | null;
  };
  depends_on: string[];
  sourceText: string;
  confidence: number;
  extractionNotes: string;
}
\`\`\`

## Extraction Rules

1. Be specific. Each promise is atomic — one commitment, one promiser, one deadline where specified.
2. Name the actual agent: "Portland General Electric", not "the utility".
3. Status is always "declared".
4. Convert dates: "by 2030" → "2030-12-31". If unknown, use null.
5. Infer verification from context: filing, audit, self-report, or none. Do NOT invent mechanisms.
6. Confidence: 0.9+ for clear commitments, 0.6-0.8 for ambiguous, <0.5 for uncertain.
7. Always include sourceText — the exact sentence(s) from the bill.
8. Use the jurisdiction's native citation format for ref.
9. Leave depends_on empty — resolved in a second pass.
10. Most legislative promises are "give". Look for "accept" promises too.
11. Origin is always "imposed" for legislative promises.
12. Most are public (scope: null). Flag scope gaps in extractionNotes.
13. If a section creates a conditional degradation mechanism, flag as threat in extractionNotes.
14. If no promises found, return [].

## Few-Shot Examples (from Oregon HB 2021)

${examplesJson}

## Output Format

Return ONLY a JSON array. No preamble, no explanation, no markdown fences.`;
}

function chunkBillText(text: string): string[] {
  const CHUNK_SIZE = 10000;
  const OVERLAP = 800;
  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    chunks.push(text.slice(start, start + CHUNK_SIZE));
    start += CHUNK_SIZE - OVERLAP;
  }
  return chunks;
}

function wordOverlap(a: string, b: string): number {
  const wordsA = new Set(a.toLowerCase().split(/\s+/));
  const wordsB = new Set(b.toLowerCase().split(/\s+/));
  let overlap = 0;
  for (const w of Array.from(wordsA)) {
    if (wordsB.has(w)) overlap++;
  }
  const total = Math.max(wordsA.size, wordsB.size);
  return total > 0 ? overlap / total : 0;
}

export async function POST(request: Request) {
  try {
    const { billText, billMeta } = await request.json();

    if (!billText || typeof billText !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid billText" },
        { status: 400 }
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY not configured" },
        { status: 500 }
      );
    }

    const systemPrompt = buildExtractionSystemPrompt();
    const chunks =
      billText.length > 12000 ? chunkBillText(billText) : [billText];

    let allCandidates: any[] = [];

    for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 8000,
          system: systemPrompt,
          messages: [
            {
              role: "user",
              content: `Extract all promises from this legislation. Return ONLY a JSON array with no preamble, markdown, or explanation.\n\n${chunks[chunkIndex]}`,
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return NextResponse.json(
          { error: "api_error", details: errorText },
          { status: response.status }
        );
      }

      const data = await response.json();
      const rawText = data.content?.[0]?.text ?? "";

      try {
        const clean = rawText.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(clean);

        // Assign chunk-aware IDs
        const candidates = Array.isArray(parsed)
          ? parsed.map((c: any, i: number) => ({
              ...c,
              id: `CANDIDATE-${chunkIndex}-${String(i + 1).padStart(3, "0")}`,
            }))
          : [];

        allCandidates.push(...candidates);
      } catch {
        return NextResponse.json(
          { error: "parse_failed", rawText },
          { status: 422 }
        );
      }
    }

    // Deduplicate by sourceText overlap
    const deduplicated: any[] = [];
    for (const candidate of allCandidates) {
      const isDuplicate = deduplicated.some(
        (existing) =>
          candidate.sourceText &&
          existing.sourceText &&
          wordOverlap(candidate.sourceText, existing.sourceText) > 0.6
      );
      if (!isDuplicate) {
        deduplicated.push(candidate);
      }
    }

    // Second pass: dependency linking (if multiple chunks)
    if (chunks.length > 1 && deduplicated.length > 1) {
      try {
        const depResponse = await fetch(
          "https://api.anthropic.com/v1/messages",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-api-key": apiKey,
              "anthropic-version": "2023-06-01",
            },
            body: JSON.stringify({
              model: "claude-sonnet-4-20250514",
              max_tokens: 4000,
              messages: [
                {
                  role: "user",
                  content: `Review these promise candidates. For each, populate depends_on with the IDs of other candidates that this promise structurally requires to succeed first. Return ONLY a JSON object mapping candidate IDs to their depends_on arrays:\n\n${JSON.stringify(
                    deduplicated.map((c) => ({
                      id: c.id,
                      body: c.body,
                      domain: c.domain,
                    }))
                  )}`,
                },
              ],
            }),
          }
        );

        if (depResponse.ok) {
          const depData = await depResponse.json();
          const depText = depData.content?.[0]?.text ?? "";
          try {
            const depClean = depText.replace(/```json|```/g, "").trim();
            const depMap = JSON.parse(depClean);
            for (const candidate of deduplicated) {
              if (depMap[candidate.id]) {
                candidate.depends_on = depMap[candidate.id];
              }
            }
          } catch {
            // Dependency linking failed — proceed with empty depends_on
          }
        }
      } catch {
        // Dependency linking failed — proceed with empty depends_on
      }
    }

    return NextResponse.json({ candidates: deduplicated });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
