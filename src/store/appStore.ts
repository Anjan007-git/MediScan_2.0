import { create } from "zustand";
import { persist } from "zustand/middleware";

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

const now = Date.now();
const day = 24 * 60 * 60 * 1000;

const seedScans: ScanRecord[] = [
  {
    id: "s1",
    name: "Paracetamol 500mg",
    description: "Pain reliever / Fever reducer",
    status: "safe",
    scannedAt: now - 2 * 60 * 60 * 1000,
    expiry: "Apr 2026",
    saved: true,
  },
  {
    id: "s2",
    name: "Amoxicillin 500mg",
    description: "Antibiotic",
    status: "caution",
    scannedAt: now - 1 * day,
    expiry: "Feb 2026",
  },
  {
    id: "s3",
    name: "Ibuprofen 400mg",
    description: "Pain reliever / Anti-inflammatory",
    status: "safe",
    scannedAt: now - 2 * day,
    expiry: "Jan 2026",
    saved: true,
  },
  {
    id: "s4",
    name: "Cetirizine 10mg",
    description: "Antihistamine / Allergy relief",
    status: "safe",
    scannedAt: now - 5 * day,
    expiry: "Aug 2026",
  },
  {
    id: "s5",
    name: "Aspirin 75mg",
    description: "Blood thinner",
    status: "caution",
    scannedAt: now - 9 * day,
    expiry: "Mar 2026",
  },
];

const seedReceipts: Receipt[] = [
  {
    id: "r1",
    pharmacy: "Apollo Pharmacy",
    date: now - 2 * day,
    total: 1245,
    items: [
      { name: "Paracetamol 500mg", qty: 2, price: 45 },
      { name: "Vitamin C", qty: 1, price: 350 },
      { name: "Cough Syrup", qty: 1, price: 850 },
    ],
  },
  {
    id: "r2",
    pharmacy: "MedPlus",
    date: now - 8 * day,
    total: 850.5,
    items: [
      { name: "Amoxicillin 500mg", qty: 1, price: 480 },
      { name: "Ibuprofen 400mg", qty: 2, price: 370.5 },
    ],
  },
  {
    id: "r3",
    pharmacy: "Netmeds",
    date: now - 15 * day,
    total: 2310,
    items: [
      { name: "Cetirizine 10mg", qty: 3, price: 240 },
      { name: "Multivitamin", qty: 1, price: 870 },
      { name: "Calcium 500mg", qty: 1, price: 450 },
      { name: "Vitamin D3", qty: 1, price: 750 },
    ],
  },
  {
    id: "r4",
    pharmacy: "MedPlus",
    date: now - 35 * day,
    total: 1150,
    items: [
      { name: "Aspirin 75mg", qty: 1, price: 199 },
      { name: "Insulin Pen", qty: 1, price: 750 },
      { name: "Glucose Strips", qty: 1, price: 201 },
    ],
  },
  {
    id: "r5",
    pharmacy: "Apollo Pharmacy",
    date: now - 50 * day,
    total: 125,
    items: [
      { name: "Bandages", qty: 1, price: 75 },
      { name: "Antiseptic", qty: 1, price: 50 },
    ],
  },
];

const seedReminders: Reminder[] = [
  { id: "rm1", medicine: "Paracetamol 500mg", time: "08:00", enabled: true, frequency: "daily" },
  { id: "rm2", medicine: "Amoxicillin 500mg", time: "14:00", enabled: true, frequency: "daily" },
  { id: "rm3", medicine: "Vitamin D", time: "20:00", enabled: false, frequency: "daily" },
];

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: { name: "Alex", greeting: "Your health, our priority" },
      scans: seedScans,
      receipts: seedReceipts,
      reminders: seedReminders,
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
    { name: "mediscan-store" }
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
