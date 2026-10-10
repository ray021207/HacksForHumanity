// Server-side sync for signed-in users. appState.ts remains the in-browser
// draft cache (keystroke-level autosave); once signed in, the server is the
// source of truth and these functions push/pull against it at the same
// "block completed" boundaries the wizard already tracks.

import type { AppState, ChildInfo } from "./appState";

export async function fetchServerState(): Promise<AppState | null> {
  const res = await fetch("/api/me/state", { method: "GET" });
  if (!res.ok) return null;
  return res.json();
}

export interface PushStateResult {
  ok: boolean;
  /** Server-assigned child ids, present whenever `children` was included in the push. */
  children?: ChildInfo[];
}

export async function pushServerState(state: AppState): Promise<PushStateResult | null> {
  const res = await fetch("/api/me/state", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(state),
  });
  if (!res.ok) return null;
  return res.json();
}
