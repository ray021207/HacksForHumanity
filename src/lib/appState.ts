// Client-side app state. Profile scores and responses live only in the
// browser (localStorage) and are sent with each request; the server never
// stores them. See README for the persistence rationale.

export interface ChildInfo {
  id: string;
  ageBand: "13-15" | "16-17" | "18-22" | "23+";
  livingSituation: string;
  nickname?: string; // optional, browser-only, never sent to the server log
}

// TIPI items store a number (1-7); scenario items store the selected option id (string).
export type RawResponses = Record<string, number | string | null>;

export interface AppState {
  consentAccepted: boolean;
  children: ChildInfo[];
  activeChildId: string | null;
  responses: RawResponses;
  goals: string[];
  completedBlocks: string[];
}

const STORAGE_KEY = "parenting-starters:state:v1";

export const EMPTY_STATE: AppState = {
  consentAccepted: false,
  children: [],
  activeChildId: null,
  responses: {},
  goals: [],
  completedBlocks: [],
};

export function loadState(): AppState {
  if (typeof window === "undefined") return EMPTY_STATE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_STATE;
    const parsed = JSON.parse(raw);
    return { ...EMPTY_STATE, ...parsed };
  } catch {
    return EMPTY_STATE;
  }
}

export function saveState(state: AppState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage failures (private mode, quota, etc.) — the wizard
    // just won't survive a refresh in that case.
  }
}

export function clearState(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
