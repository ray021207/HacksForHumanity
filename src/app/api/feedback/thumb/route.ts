import { NextRequest, NextResponse } from "next/server";
import { appendLog } from "@/lib/logging";
import { TECHNIQUES, type Technique } from "@/lib/generation";

export async function POST(req: NextRequest) {
  let body: { technique?: Technique; value?: "up" | "down" };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.technique || !(TECHNIQUES as readonly string[]).includes(body.technique)) {
    return NextResponse.json({ error: "technique must be one of the known techniques" }, { status: 400 });
  }
  if (body.value !== "up" && body.value !== "down") {
    return NextResponse.json({ error: "value must be 'up' or 'down'" }, { status: 400 });
  }

  // Logged as counts only: technique tag + thumb direction. No situation text.
  await appendLog({ type: "thumb", technique: body.technique, value: body.value });

  return NextResponse.json({ ok: true });
}
