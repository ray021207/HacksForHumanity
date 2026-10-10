import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

const STT_MODEL_ID = "scribe_v1";

export function isVoiceInputEnabled(): boolean {
  return Boolean(process.env.ELEVENLABS_API_KEY);
}

let cachedClient: ElevenLabsClient | null = null;

export function getElevenLabsClient(): ElevenLabsClient {
  if (!cachedClient) {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      throw new Error("ELEVENLABS_API_KEY is not set. Add it to .env.local to enable voice input.");
    }
    cachedClient = new ElevenLabsClient({ apiKey });
  }
  return cachedClient;
}

/**
 * Transcribes a short audio clip (the situation description, spoken instead
 * of typed) to text. The audio itself is never written to disk or logged —
 * it's held in memory for the duration of this one request and discarded.
 *
 * KNOWN GAP (English-only, by explicit decision — see conversation history):
 * scribe_v1 auto-detects the spoken language and transcribes IN that
 * language; it does not translate. A parent speaking Spanish gets a
 * Spanish transcript back, which then goes to the safety classifier and
 * generator (src/lib/safety.ts, src/lib/generation.ts) as-is. Neither of
 * those prompts currently pins an output language, so the cards could come
 * back in Spanish, English, or an inconsistent mix. If multilingual
 * support is wanted later, the fix belongs in the generation prompt (pin
 * output language to match input) or as an explicit translation step
 * here, not in this function.
 */
export async function transcribeAudio(audio: Buffer, contentType: string): Promise<string> {
  const client = getElevenLabsClient();
  const response = await client.speechToText.convert({
    modelId: STT_MODEL_ID,
    file: {
      data: audio,
      contentType,
      filename: "situation.webm",
    },
  });

  if ("text" in response && typeof response.text === "string") {
    return response.text;
  }
  // Multichannel or webhook response shapes aren't expected here (we always
  // send single-channel audio and never set webhook: true).
  throw new Error("Unexpected speech-to-text response shape");
}
