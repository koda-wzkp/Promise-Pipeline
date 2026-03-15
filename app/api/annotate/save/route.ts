import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(request: Request) {
  try {
    const { billSlug, billMeta, promise, action } = await request.json();

    const trainingDir = path.join(process.cwd(), "data", "training");
    fs.mkdirSync(trainingDir, { recursive: true });

    const billFile = path.join(trainingDir, `${billSlug}.json`);
    const manifestFile = path.join(trainingDir, "manifest.json");

    // Read existing bill data or initialize
    let billData: any = fs.existsSync(billFile)
      ? JSON.parse(fs.readFileSync(billFile, "utf-8"))
      : {
          bill: billMeta,
          stats: {
            totalCandidates: 0,
            accepted: 0,
            edited: 0,
            rejected: 0,
            skipped: 0,
          },
          promises: [],
        };

    // Upsert by original candidate ID
    const idx = billData.promises.findIndex(
      (p: any) =>
        p._annotation?.originalExtraction?.id ===
        promise._annotation?.originalExtraction?.id
    );
    if (idx >= 0) {
      billData.promises[idx] = promise;
    } else {
      billData.promises.push(promise);
    }

    // Recompute stats
    billData.stats = {
      totalCandidates: billData.promises.length,
      accepted: billData.promises.filter(
        (p: any) => p._annotation?.annotationStatus === "accepted"
      ).length,
      edited: billData.promises.filter((p: any) => p._annotation?.wasEdited)
        .length,
      rejected: billData.promises.filter(
        (p: any) => p._annotation?.annotationStatus === "rejected"
      ).length,
      skipped: billData.promises.filter(
        (p: any) => p._annotation?.annotationStatus === "skipped"
      ).length,
    };

    fs.writeFileSync(billFile, JSON.stringify(billData, null, 2));

    // Update manifest
    let manifest: any = fs.existsSync(manifestFile)
      ? JSON.parse(fs.readFileSync(manifestFile, "utf-8"))
      : { lastUpdated: "", totalVerifiedPromises: 0, bills: [] };

    const billEntry = manifest.bills.find(
      (b: any) => b.slug === billSlug
    );
    const acceptedCount = billData.stats.accepted;

    if (billEntry) {
      billEntry.promiseCount = acceptedCount;
      billEntry.status =
        billData.stats.skipped > 0 ? "in-progress" : "complete";
      billEntry.lastAnnotatedAt = new Date().toISOString();
    } else {
      manifest.bills.push({
        slug: billSlug,
        name: billMeta?.name || billSlug,
        jurisdiction: billMeta?.jurisdiction || "",
        status: "in-progress",
        promiseCount: acceptedCount,
        source: "annotated",
        lastAnnotatedAt: new Date().toISOString(),
      });
    }

    manifest.totalVerifiedPromises = manifest.bills.reduce(
      (sum: number, b: any) => sum + (b.promiseCount || 0),
      0
    );
    manifest.lastUpdated = new Date().toISOString();

    fs.writeFileSync(manifestFile, JSON.stringify(manifest, null, 2));

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to save annotation" },
      { status: 500 }
    );
  }
}
