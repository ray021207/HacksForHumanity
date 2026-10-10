// Append-only local log of counts only. Never logs situation text, child
// names, birthdates, or anything else that could identify a family member.
// This is the only server-side persistence the MVP has (see README).

import { appendFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";

const LOG_PATH = process.env.EVENTS_LOG_PATH || "logs/events.log";

export type LogEventInput =
  | {
      type: "safety_gate";
      tier: "green" | "amber" | "red";
      ruleTier: "green" | "amber" | "red";
      modelTier: "green" | "amber" | "red";
    }
  | {
      type: "generation";
      tier: "green" | "amber";
      lintPass: boolean;
      usedFallback: boolean;
      attempts: number;
      completionMs: number;
    }
  | {
      type: "thumb";
      technique: string;
      value: "up" | "down";
    };

export type LogEvent = LogEventInput & { ts: string };

let ensuredDir = false;

export async function appendLog(event: LogEventInput): Promise<void> {
  const full: LogEvent = { ...event, ts: new Date().toISOString() };
  try {
    if (!ensuredDir) {
      await mkdir(dirname(LOG_PATH), { recursive: true });
      ensuredDir = true;
    }
    await appendFile(LOG_PATH, JSON.stringify(full) + "\n", "utf-8");
  } catch (err) {
    // Logging must never break the user-facing flow.
    console.error("Failed to append log event", err);
  }
}
