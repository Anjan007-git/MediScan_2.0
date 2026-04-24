// Local persistence for MediScan: history, saved, theme, subscription/scan-limit.
import type { Medicine } from "./medicineApi";

const HISTORY_KEY = "mediscan:history:v2";
const SAVED_KEY = "mediscan:saved:v2";
const SCANS_KEY = "mediscan:scans:v1";
const PLAN_KEY = "mediscan:plan:v1";
const THEME_KEY = "mediscan:theme:v1";
const RECENT_SEARCH_KEY = "mediscan:recent-searches:v1";

export interface HistoryItem {
  id: string;
  medicine: Medicine;
  scannedAt: number;
  source: "scan" | "search" | "upload";
  imagePreview?: string;
  confidence?: number;
}

const safeRead = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

const safeWrite = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn("[storage] write failed", key, e);
  }
};

// ---------------- History ----------------
export const getHistory = (): HistoryItem[] => safeRead<HistoryItem[]>(HISTORY_KEY, []);

export const addHistory = (item: Omit<HistoryItem, "id" | "scannedAt"> & { id?: string }) => {
  const list = getHistory();
  const entry: HistoryItem = {
    id: item.id || `h_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    scannedAt: Date.now(),
    medicine: item.medicine,
    source: item.source,
    imagePreview: item.imagePreview,
    confidence: item.confidence,
  };
  const next = [entry, ...list].slice(0, 50);
  safeWrite(HISTORY_KEY, next);
  return entry;
};

export const removeHistory = (id: string) => {
  safeWrite(HISTORY_KEY, getHistory().filter((h) => h.id !== id));
};

export const clearHistory = () => safeWrite(HISTORY_KEY, []);

export const getHistoryItem = (id: string) => getHistory().find((h) => h.id === id);

// ---------------- Saved ----------------
export const getSaved = (): HistoryItem[] => safeRead<HistoryItem[]>(SAVED_KEY, []);

export const isSaved = (medicineName: string) =>
  getSaved().some((s) => s.medicine.medicineName.toLowerCase() === medicineName.toLowerCase());

export const toggleSaved = (item: HistoryItem) => {
  const list = getSaved();
  const exists = list.findIndex(
    (s) => s.medicine.medicineName.toLowerCase() === item.medicine.medicineName.toLowerCase()
  );
  if (exists >= 0) {
    list.splice(exists, 1);
    safeWrite(SAVED_KEY, list);
    return false;
  }
  safeWrite(SAVED_KEY, [{ ...item, id: `s_${Date.now()}` }, ...list].slice(0, 50));
  return true;
};

export const removeSaved = (id: string) =>
  safeWrite(SAVED_KEY, getSaved().filter((s) => s.id !== id));

// ---------------- Plan / scan limit ----------------
export type Plan = "free" | "premium";
const FREE_WEEKLY_LIMIT = 10;

export const getPlan = (): Plan => (safeRead<Plan>(PLAN_KEY, "free") as Plan);
export const setPlan = (plan: Plan) => safeWrite(PLAN_KEY, plan);

interface ScanRecord {
  scans: number[]; // timestamps
}

const getScans = (): ScanRecord => safeRead<ScanRecord>(SCANS_KEY, { scans: [] });

export const recordScan = () => {
  const rec = getScans();
  rec.scans.push(Date.now());
  // keep last 100
  rec.scans = rec.scans.slice(-100);
  safeWrite(SCANS_KEY, rec);
};

export const getWeeklyScanCount = () => {
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  return getScans().scans.filter((t) => t >= weekAgo).length;
};

export const getScanLimit = () => FREE_WEEKLY_LIMIT;

export const canScan = () => {
  if (getPlan() === "premium") return true;
  return getWeeklyScanCount() < FREE_WEEKLY_LIMIT;
};

// ---------------- Theme ----------------
export type Theme = "light" | "dark";
export const getTheme = (): Theme => (safeRead<Theme>(THEME_KEY, "light") as Theme);
export const setTheme = (t: Theme) => {
  safeWrite(THEME_KEY, t);
  applyTheme(t);
};
export const applyTheme = (t: Theme) => {
  const root = document.documentElement;
  if (t === "dark") root.classList.add("dark");
  else root.classList.remove("dark");
};

// ---------------- Recent searches ----------------
export const getRecentSearches = (): string[] => safeRead<string[]>(RECENT_SEARCH_KEY, []);
export const addRecentSearch = (q: string) => {
  const trimmed = q.trim();
  if (!trimmed) return;
  const list = getRecentSearches().filter((s) => s.toLowerCase() !== trimmed.toLowerCase());
  list.unshift(trimmed);
  safeWrite(RECENT_SEARCH_KEY, list.slice(0, 10));
};
export const clearRecentSearches = () => safeWrite(RECENT_SEARCH_KEY, []);
