import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    // Stub: log to console. In production, store in database.
    console.log(`[Beta Signup] ${email} at ${new Date().toISOString()}`);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
