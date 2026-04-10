/**
 * Client-side history using localStorage.
 * Stores last 30 pill identification results per browser.
 */

export interface HistoryEntry {
  id: string;
  type: "photo" | "manual";
  timestamp: number;
  thumbnail?: string;
  pills: {
    name: string;
    shape?: string;
    color?: string;
    imprint?: string;
  }[];
  query?: { shape?: string; color?: string; imprint?: string }; // for manual search
}

const STORAGE_KEY = "pillscan_history";
const MAX_ENTRIES = 30;

export function saveToHistory(entry: Omit<HistoryEntry, "id">): void {
  if (typeof window === "undefined") return;
  try {
    const existing = loadHistory();
    const newEntry: HistoryEntry = { ...entry, id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}` };
    const updated = [newEntry, ...existing].slice(0, MAX_ENTRIES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn("Failed to save history", e);
  }
}

export function loadHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function deleteHistoryEntry(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const filtered = loadHistory().filter((e) => e.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch {}
}

export function clearHistory(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
