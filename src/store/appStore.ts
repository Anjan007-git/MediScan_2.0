import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const STORAGE_KEY_BASE = "mediscan-store";
let CURRENT_USER_ID: string | null = null;

const dynamicStorage = {
  getItem: (_name: string) => {
    if (!CURRENT_USER_ID) return null;
    return localStorage.getItem(`${STORAGE_KEY_BASE}-${CURRENT_USER_ID}`);
  },
  setItem: (_name: string, value: string) => {
    if (!CURRENT_USER_ID) return;
    localStorage.setItem(`${STORAGE_KEY_BASE}-${CURRENT_USER_ID}`, value);
  },
  removeItem: (_name: string) => {
    if (!CURRENT_USER_ID) return;
    localStorage.removeItem(`${STORAGE_KEY_BASE}-${CURRENT_USER_ID}`);
  },
};

/** Bind the persisted store to a user. New users start with empty state. */
export const bindStoreToUser = (userId: string | null, displayName?: string, _avatarUrl?: string) => {
  CURRENT_USER_ID = userId;
  if (!userId) return;
  // Re-hydrate the store from this user's storage slot
  useAppStore.persist.rehydrate();
  // Make sure greeting reflects this user
  setTimeout(() => {
    if (displayName) {
      useAppStore.setState((s) => ({ user: { ...s.user, name: displayName } }));
    }
  }, 0);
};

export type ScanStatus = "safe" | "caution" | "danger";

export interface ScanRecord {
  id: string;
  name: string;
  description: string;
  status: ScanStatus;
  scannedAt: number; // unix ms
  expiry: string; // e.g. "Apr 2026"
  imageUrl?: string;
  saved?: boolean;
}

export interface Receipt {
  id: string;
  pharmacy: string;
  date: number;
  total: number;
  items: { name: string; qty: number; price: number }[];
  imageUrl?: string;
  hidden?: boolean;
}

export interface Reminder {
  id: string;
  medicine: string;
  time: string; // "08:00" (24h)
  enabled: boolean;
  frequency: "daily" | "weekly" | "once";
  lastFiredKey?: string; // YYYY-MM-DD-HH:MM dedupe
}

export interface SavedMedicine {
  id: string;
  name: string;
  generic?: string;
  status: ScanStatus;
  description: string;
  composition?: string;
  uses?: string[];
  savedAt: number;
}

interface AppState {
  user: { name: string; greeting: string };
  scans: ScanRecord[];
  receipts: Receipt[];
  reminders: Reminder[];
  saved: SavedMedicine[];
  settings: {
    notifications: boolean;
    remindersEnabled: boolean;
    safetyAlerts: boolean;
    biometric: boolean;
    darkMode: boolean;
    language: string;
  };
  addScan: (s: ScanRecord) => void;
  addReceipt: (r: Receipt) => void;
  hideReceipt: (id: string) => void;
  deleteReceipt: (id: string) => void;
  toggleSaved: (id: string) => void;
  toggleReminder: (id: string) => void;
  addReminder: (r: Omit<Reminder, "id">) => void;
  deleteReminder: (id: string) => void;
  markReminderFired: (id: string, key: string) => void;
  addSavedMedicine: (m: Omit<SavedMedicine, "id" | "savedAt">) => void;
  removeSavedMedicine: (id: string) => void;
  isMedicineSaved: (name: string) => boolean;
  updateSetting: <K extends keyof AppState["settings"]>(
    key: K,
    value: AppState["settings"][K]
  ) => void;
  clearHistory: () => void;
}

// Seed data removed — new users start with an empty state.

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: { name: "there", greeting: "Your health, our priority" },
      scans: [],
      receipts: [],
      reminders: [],
      saved: [],
      settings: {
        notifications: true,
        remindersEnabled: true,
        safetyAlerts: true,
        biometric: false,
        darkMode: false,
        language: "English",
      },
      addScan: (s) => set((state) => ({ scans: [s, ...state.scans] })),
      addReceipt: (r) => set((state) => ({ receipts: [r, ...state.receipts] })),
      hideReceipt: (id) =>
        set((state) => ({
          receipts: state.receipts.map((r) => (r.id === id ? { ...r, hidden: true } : r)),
        })),
      deleteReceipt: (id) =>
        set((state) => ({ receipts: state.receipts.filter((r) => r.id !== id) })),
      toggleSaved: (id) =>
        set((state) => ({
          scans: state.scans.map((sc) => (sc.id === id ? { ...sc, saved: !sc.saved } : sc)),
        })),
      toggleReminder: (id) =>
        set((state) => ({
          reminders: state.reminders.map((r) =>
            r.id === id ? { ...r, enabled: !r.enabled } : r
          ),
        })),
      addReminder: (r) =>
        set((state) => ({
          reminders: [
            { ...r, id: `rm-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` },
            ...state.reminders,
          ],
        })),
      deleteReminder: (id) =>
        set((state) => ({ reminders: state.reminders.filter((r) => r.id !== id) })),
      markReminderFired: (id, key) =>
        set((state) => ({
          reminders: state.reminders.map((r) =>
            r.id === id ? { ...r, lastFiredKey: key } : r
          ),
        })),
      addSavedMedicine: (m) =>
        set((state) => {
          if (state.saved.some((s) => s.name.toLowerCase() === m.name.toLowerCase())) return state;
          return {
            saved: [
              { ...m, id: `sv-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, savedAt: Date.now() },
              ...state.saved,
            ],
          };
        }),
      removeSavedMedicine: (id) =>
        set((state) => ({ saved: state.saved.filter((s) => s.id !== id) })),
      isMedicineSaved: (name) =>
        get().saved.some((s) => s.name.toLowerCase() === name.toLowerCase()),
      updateSetting: (key, value) =>
        set((state) => ({ settings: { ...state.settings, [key]: value } })),
      clearHistory: () => set({ scans: [] }),
    }),
    {
      name: STORAGE_KEY_BASE,
      storage: createJSONStorage(() => dynamicStorage),
      skipHydration: true, // we hydrate via bindStoreToUser
    }
  )
);

export function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) {
    const date = new Date(ts);
    return `today, ${date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
  }
  const days = Math.floor(hrs / 24);
  if (days === 1) {
    const date = new Date(ts);
    return `yesterday, ${date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
  }
  if (days < 7) {
    const date = new Date(ts);
    return `${days} days ago, ${date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
  }
  return new Date(ts).toLocaleDateString();
}
