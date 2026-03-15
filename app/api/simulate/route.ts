import { NextResponse } from "next/server";
import { simulateCascade } from "@/lib/simulation/cascade";
import { hb2021Data } from "@/lib/data/hb2021";
import { WhatIfQuery } from "@/lib/types/simulation";

export async function POST(request: Request) {
  try {
    const query: WhatIfQuery = await request.json();

    if (!query.promiseId || !query.newStatus) {
      return NextResponse.json(
        { error: "Missing promiseId or newStatus" },
        { status: 400 }
      );
    }

    const result = simulateCascade(
      hb2021Data.promises,
      query,
      hb2021Data.threats
    );

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}
