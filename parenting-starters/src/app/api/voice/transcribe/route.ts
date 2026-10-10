import { NextRequest, NextResponse } from "next/server";
import { transcribeAudio, isVoiceInputEnabled } from "@/lib/elevenlabs-client";

// Lets the client check whether voice input is configured before showing
// the mic button at all, without needing an env var exposed to the browser.
export async function GET() {
  return NextResponse.json({ enabled: isVoiceInputEnabled() });
}

// Transcribes a recorded clip for the "describe your situation" mic button.
// The audio is read into memory for this one request and never persisted —
// no file is written, and nothing is logged (see src/lib/logging.ts, which
// this route never calls).
export async function POST(req: NextRequest) {
  if (!isVoiceInputEnabled()) {
    return NextResponse.json(
      { error: "Voice input is not configured on this server (ELEVENLABS_API_KEY is unset)." },
      { status: 501 }
    );
  }

  const formData = await req.formData();
  const file = formData.get("audio");
  if (!(file instanceof Blob)) {
    return NextResponse.json({ error: "Expected a multipart 'audio' field." }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  try {
    const text = await transcribeAudio(buffer, file.type || "audio/webm");
    return NextResponse.json({ text });
  } catch (err) {
    console.error("Speech-to-text failed", err);
    return NextResponse.json({ error: "Transcription failed. You can type instead." }, { status: 502 });
  }
}
