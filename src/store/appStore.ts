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
}

export interface Reminder {
  id: string;
  medicine: string;
  time: string; // "08:00"
  enabled: boolean;
  frequency: "daily" | "weekly";
}

interface AppState {
  user: { name: string; greeting: string };
  scans: ScanRecord[];
  receipts: Receipt[];
  reminders: Reminder[];
  settings: {
    notifications: boolean;
    biometric: boolean;
    darkMode: boolean;
    language: string;
  };
  addScan: (s: ScanRecord) => void;
  toggleSaved: (id: string) => void;
  toggleReminder: (id: string) => void;
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
    pharmacy: "MedPlus Pharmacy",
    date: now - 1 * day,
    total: 24.5,
    items: [
      { name: "Paracetamol 500mg", qty: 2, price: 4.5 },
      { name: "Vitamin C", qty: 1, price: 15.5 },
    ],
  },
  {
    id: "r2",
    pharmacy: "Apollo Pharmacy",
    date: now - 6 * day,
    total: 48.2,
    items: [
      { name: "Amoxicillin 500mg", qty: 1, price: 18.0 },
      { name: "Ibuprofen 400mg", qty: 2, price: 15.1 },
    ],
  },
  {
    id: "r3",
    pharmacy: "1mg Store",
    date: now - 14 * day,
    total: 67.9,
    items: [
      { name: "Cetirizine 10mg", qty: 3, price: 8.3 },
      { name: "Multivitamin", qty: 1, price: 43.0 },
    ],
  },
  {
    id: "r4",
    pharmacy: "Wellness Forever",
    date: now - 22 * day,
    total: 19.9,
    items: [{ name: "Aspirin 75mg", qty: 1, price: 19.9 }],
  },
];

const seedReminders: Reminder[] = [
  { id: "rm1", medicine: "Paracetamol 500mg", time: "08:00", enabled: true, frequency: "daily" },
  { id: "rm2", medicine: "Amoxicillin 500mg", time: "14:00", enabled: true, frequency: "daily" },
  { id: "rm3", medicine: "Vitamin D", time: "20:00", enabled: false, frequency: "daily" },
];

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      user: { name: "Alex", greeting: "Your health, our priority" },
      scans: seedScans,
      receipts: seedReceipts,
      reminders: seedReminders,
      settings: {
        notifications: true,
        biometric: false,
        darkMode: false,
        language: "English",
      },
      addScan: (s) => set((state) => ({ scans: [s, ...state.scans] })),
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
