"use client";

import { useEffect, useRef, useState } from "react";

type Status = "checking" | "unavailable" | "idle" | "recording" | "transcribing" | "error";

/**
 * A mic button that records a short clip and sends it to
 * /api/voice/transcribe (ElevenLabs speech-to-text) for the "describe your
 * situation" screen. Renders nothing if voice input isn't configured
 * (no ELEVENLABS_API_KEY) or the browser has no microphone API.
 *
 * The transcript lands in the same editable textarea the parent types
 * into — nothing is auto-submitted, and the audio itself is never saved
 * (see src/app/api/voice/transcribe/route.ts).
 */
export function VoiceInputButton({ onTranscript }: { onTranscript: (text: string) => void }) {
  const [status, setStatus] = useState<Status>("checking");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
          if (!cancelled) setStatus("unavailable");
          return;
        }
        const res = await fetch("/api/voice/transcribe");
        const data = await res.json();
        if (!cancelled) setStatus(data.enabled ? "idle" : "unavailable");
      } catch {
        if (!cancelled) setStatus("unavailable");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function startRecording() {
    setErrorMessage(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        await sendForTranscription(blob);
      };

      recorder.start();
      setStatus("recording");
    } catch {
      setStatus("error");
      setErrorMessage("Couldn't access the microphone. You can still type.");
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    setStatus("transcribing");
  }

  async function sendForTranscription(blob: Blob) {
    try {
      const formData = new FormData();
      formData.append("audio", blob, "situation.webm");
      const res = await fetch("/api/voice/transcribe", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Transcription failed");
      onTranscript(data.text as string);
      setStatus("idle");
    } catch {
      setStatus("error");
      setErrorMessage("Couldn't transcribe that. You can still type.");
    }
  }

  if (status === "checking" || status === "unavailable") return null;

  return (
    <div className="mt-2 flex items-center gap-1">
      {status === "recording" ? (
        <button
          type="button"
          onClick={stopRecording}
          className="bg-primary-fg rounded-pill text-d16 flex items-center gap-1 px-3 py-1 font-medium text-primary-bg"
        >
          <span className="bg-accent rounded-pill size-1 animate-pulse" />
          Stop recording
        </button>
      ) : (
        <button
          type="button"
          onClick={startRecording}
          disabled={status === "transcribing"}
          className="bg-primary-fg rounded-pill text-d16 flex items-center gap-1 px-3 py-1 font-medium text-primary-bg disabled:opacity-50"
        >
          {status === "transcribing" ? "Transcribing..." : "Speak"}
        </button>
      )}
      {errorMessage && <span className="text-accent text-d16">{errorMessage}</span>}
    </div>
  );
}
