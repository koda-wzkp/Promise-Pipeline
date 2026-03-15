import { NextResponse } from "next/server";
import { hb2021Data } from "@/lib/data/hb2021";

export async function GET() {
  return NextResponse.json(hb2021Data);
}
