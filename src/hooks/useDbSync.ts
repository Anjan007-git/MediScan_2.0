import { useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useAppStore, type ScanRecord, type SavedMedicine, type Reminder, type Receipt } from "@/store/appStore";
import {
  dbListScans,
  dbListSaved,
  dbListReminders,
  dbListReceipts,
  dbGetSubscription,
  dbUpsertScan,
  dbDeleteScan,
  dbUpsertSaved,
  dbDeleteSaved,
  dbUpsertReminder,
  dbDeleteReminder,
  dbUpsertReceipt,
  dbDeleteReceipt,
  dbUpsertSubscription,
} from "@/lib/db";

const rowToScan = (r: any): ScanRecord => ({
  id: r.id,
  name: r.medicine_name ?? "Unknown",
  description: r.detected_text ?? r.analysis?.composition ?? "",
  status: (r.status as any) ?? (r.confidence >= 90 ? "safe" : r.confidence >= 80 ? "caution" : "danger"),
  scannedAt: new Date(r.created_at).getTime(),
  expiry: r.analysis?.expiry ?? "—",
  imageUrl: r.image_url ?? undefined,
  generic: r.analysis?.generic,
  composition: r.analysis?.composition,
  uses: r.analysis?.uses,
  dosage: r.analysis?.dosage,
  precautions: r.analysis?.precautions,
  warnings: r.analysis?.warnings,
  sideEffects: r.analysis?.sideEffects,
  storage: r.analysis?.storage,
  confidence: r.confidence ?? undefined,
});

const rowToSaved = (r: any): SavedMedicine => ({
  id: r.id,
  name: r.name,
  generic: r.generic ?? undefined,
  composition: r.composition ?? undefined,
  description: r.description ?? "",
  status: (r.status as any) ?? "safe",
  uses: r.uses ?? undefined,
  dosage: r.dosage ?? undefined,
  precautions: r.precautions ?? undefined,
  warnings: r.warnings ?? undefined,
  sideEffects: r.side_effects ?? undefined,
  storage: r.storage ?? undefined,
  savedAt: new Date(r.created_at).getTime(),
});

const rowToReminder = (r: any): Reminder => ({
  id: r.id,
  medicine: r.medicine,
  time: r.time,
  enabled: r.enabled,
  frequency: r.frequency as any,
  lastFiredKey: r.last_fired_key ?? undefined,
});

const rowToReceipt = (r: any): Receipt => ({
  id: r.id,
  pharmacy: r.pharmacy ?? "",
  date: r.receipt_date ? new Date(r.receipt_date).getTime() : new Date(r.created_at).getTime(),
  total: Number(r.total ?? 0),
  items: r.items ?? [],
  imageUrl: r.image_url ?? undefined,
  hidden: !!r.hidden,
  medicines: r.medicines ?? undefined,
  rawText: r.raw_text ?? undefined,
  dateText: r.date_text ?? undefined,
});

/**
 * Hydrates the local store from Supabase on login and mirrors every
 * store mutation (add/update/delete) back to the database.
 */
export const useDbSync = () => {
  const { user } = useAuth();
  const hydratedFor = useRef<string | null>(null);
  const knownScans = useRef(new Map<string, ScanRecord>());
  const knownSaved = useRef(new Map<string, SavedMedicine>());
  const knownReminders = useRef(new Map<string, Reminder>());
  const knownReceipts = useRef(new Map<string, Receipt>());
  const knownPlan = useRef<string | null>(null);

  // Hydrate on login
  useEffect(() => {
    if (!user) {
      hydratedFor.current = null;
      knownScans.current.clear();
      knownSaved.current.clear();
      knownReminders.current.clear();
      knownReceipts.current.clear();
      knownPlan.current = null;
      return;
    }
    if (hydratedFor.current === user.id) return;
    hydratedFor.current = user.id;

    (async () => {
      try {
        const [scans, saved, reminders, receipts, sub] = await Promise.all([
          dbListScans(user.id),
          dbListSaved(user.id),
          dbListReminders(user.id),
          dbListReceipts(user.id),
          dbGetSubscription(user.id),
        ]);

        const mappedScans = scans.map(rowToScan);
        const mappedSaved = saved.map(rowToSaved);
        const mappedReminders = reminders.map(rowToReminder);
        const mappedReceipts = receipts.map(rowToReceipt);

        // Merge: prefer DB data, but keep any local-only items the user
        // created while offline (they will be pushed up by the subscribe loop).
        useAppStore.setState((state) => {
          const dbScanIds = new Set(mappedScans.map((s) => s.id));
          const localOnlyScans = state.scans.filter((s) => !dbScanIds.has(s.id));

          const dbSavedNames = new Set(mappedSaved.map((s) => s.name.toLowerCase()));
          const localOnlySaved = state.saved.filter(
            (s) => !dbSavedNames.has(s.name.toLowerCase())
          );

          const dbReminderIds = new Set(mappedReminders.map((r) => r.id));
          const localOnlyReminders = state.reminders.filter((r) => !dbReminderIds.has(r.id));

          const dbReceiptIds = new Set(mappedReceipts.map((r) => r.id));
          const localOnlyReceipts = state.receipts.filter((r) => !dbReceiptIds.has(r.id));

          return {
            scans: [...localOnlyScans, ...mappedScans],
            saved: [...localOnlySaved, ...mappedSaved],
            reminders: [...localOnlyReminders, ...mappedReminders],
            receipts: [...localOnlyReceipts, ...mappedReceipts],
            plan: (sub?.plan as any) ?? state.plan,
          };
        });

        // Seed known maps from DB rows
        mappedScans.forEach((s) => knownScans.current.set(s.id, s));
        mappedSaved.forEach((s) => knownSaved.current.set(s.id, s));
        mappedReminders.forEach((r) => knownReminders.current.set(r.id, r));
        mappedReceipts.forEach((r) => knownReceipts.current.set(r.id, r));
        knownPlan.current = (sub?.plan as any) ?? null;

        // Push local-only items to DB
        const after = useAppStore.getState();
        for (const s of after.scans) if (!knownScans.current.has(s.id)) {
          await dbUpsertScan(user.id, s); knownScans.current.set(s.id, s);
        }
        for (const s of after.saved) if (!knownSaved.current.has(s.id)) {
          await dbUpsertSaved(user.id, s); knownSaved.current.set(s.id, s);
        }
        for (const r of after.reminders) if (!knownReminders.current.has(r.id)) {
          await dbUpsertReminder(user.id, r); knownReminders.current.set(r.id, r);
        }
        for (const r of after.receipts) if (!knownReceipts.current.has(r.id)) {
          await dbUpsertReceipt(user.id, r); knownReceipts.current.set(r.id, r);
        }
      } catch (e) {
        console.warn("[useDbSync] hydrate failed", e);
      }
    })();
  }, [user]);

  // Subscribe: mirror store mutations to DB
  useEffect(() => {
    if (!user) return;
    const unsub = useAppStore.subscribe((state) => {
      const uid = user.id;

      // SCANS
      const scanIds = new Set(state.scans.map((s) => s.id));
      for (const s of state.scans) {
        const prev = knownScans.current.get(s.id);
        if (!prev || JSON.stringify(prev) !== JSON.stringify(s)) {
          knownScans.current.set(s.id, s);
          dbUpsertScan(uid, s);
        }
      }
      for (const id of Array.from(knownScans.current.keys())) {
        if (!scanIds.has(id)) {
          knownScans.current.delete(id);
          dbDeleteScan(id);
        }
      }

      // SAVED
      const savedIds = new Set(state.saved.map((s) => s.id));
      for (const s of state.saved) {
        const prev = knownSaved.current.get(s.id);
        if (!prev || JSON.stringify(prev) !== JSON.stringify(s)) {
          knownSaved.current.set(s.id, s);
          dbUpsertSaved(uid, s);
        }
      }
      for (const id of Array.from(knownSaved.current.keys())) {
        if (!savedIds.has(id)) {
          knownSaved.current.delete(id);
          dbDeleteSaved(id);
        }
      }

      // REMINDERS
      const remIds = new Set(state.reminders.map((r) => r.id));
      for (const r of state.reminders) {
        const prev = knownReminders.current.get(r.id);
        if (!prev || JSON.stringify(prev) !== JSON.stringify(r)) {
          knownReminders.current.set(r.id, r);
          dbUpsertReminder(uid, r);
        }
      }
      for (const id of Array.from(knownReminders.current.keys())) {
        if (!remIds.has(id)) {
          knownReminders.current.delete(id);
          dbDeleteReminder(id);
        }
      }

      // RECEIPTS
      const recIds = new Set(state.receipts.map((r) => r.id));
      for (const r of state.receipts) {
        const prev = knownReceipts.current.get(r.id);
        if (!prev || JSON.stringify(prev) !== JSON.stringify(r)) {
          knownReceipts.current.set(r.id, r);
          dbUpsertReceipt(uid, r);
        }
      }
      for (const id of Array.from(knownReceipts.current.keys())) {
        if (!recIds.has(id)) {
          knownReceipts.current.delete(id);
          dbDeleteReceipt(id);
        }
      }

      // PLAN
      if (state.plan !== knownPlan.current) {
        knownPlan.current = state.plan;
        dbUpsertSubscription(uid, state.plan);
      }
    });
    return () => unsub();
  }, [user]);
};
