import { supabase } from "@/lib/supabaseClient";
import type {
  ScanRecord,
  SavedMedicine,
  Reminder,
  Receipt,
  Plan,
} from "@/store/appStore";

/** ---------- PROFILE ---------- */
export const dbGetProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) console.warn("[db] getProfile", error);
  return data;
};

export const dbUpdateProfile = async (
  userId: string,
  patch: Partial<{ display_name: string; avatar_url: string; plan: Plan; preferences: any }>
) => {
  const { error } = await supabase.from("profiles").update(patch).eq("user_id", userId);
  if (error) console.warn("[db] updateProfile", error);
};

/** ---------- SCANS ---------- */
export const dbListScans = async (userId: string) => {
  const { data, error } = await supabase
    .from("scans")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) console.warn("[db] listScans", error);
  return data ?? [];
};

export const dbUpsertScan = async (userId: string, s: ScanRecord) => {
  const { error } = await supabase.from("scans").upsert(
    {
      id: s.id,
      user_id: userId,
      medicine_name: s.name,
      detected_text: s.description,
      analysis: {
        generic: s.generic,
        composition: s.composition,
        uses: s.uses,
        dosage: s.dosage,
        precautions: s.precautions,
        warnings: s.warnings,
        sideEffects: s.sideEffects,
        storage: s.storage,
        expiry: s.expiry,
      },
      image_url: s.imageUrl ?? null,
      source: "camera",
      confidence: s.confidence ?? null,
      status: s.status,
      is_medicine: true,
      created_at: new Date(s.scannedAt).toISOString(),
    },
    { onConflict: "id" }
  );
  if (error) console.warn("[db] upsertScan", error);
};

export const dbDeleteScan = async (id: string) => {
  const { error } = await supabase.from("scans").delete().eq("id", id);
  if (error) console.warn("[db] deleteScan", error);
};

/** ---------- SAVED MEDICINES ---------- */
export const dbListSaved = async (userId: string) => {
  const { data, error } = await supabase
    .from("saved_medicines")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) console.warn("[db] listSaved", error);
  return data ?? [];
};

export const dbUpsertSaved = async (userId: string, m: SavedMedicine) => {
  const { error } = await supabase.from("saved_medicines").upsert(
    {
      id: m.id,
      user_id: userId,
      name: m.name,
      generic: m.generic ?? null,
      composition: m.composition ?? null,
      description: m.description ?? null,
      status: m.status,
      uses: m.uses ?? null,
      dosage: m.dosage ?? null,
      precautions: m.precautions ?? null,
      warnings: m.warnings ?? null,
      side_effects: m.sideEffects ?? null,
      storage: m.storage ?? null,
      created_at: new Date(m.savedAt).toISOString(),
    },
    { onConflict: "user_id,name" }
  );
  if (error) console.warn("[db] upsertSaved", error);
};

export const dbDeleteSaved = async (id: string) => {
  const { error } = await supabase.from("saved_medicines").delete().eq("id", id);
  if (error) console.warn("[db] deleteSaved", error);
};

/** ---------- REMINDERS ---------- */
export const dbListReminders = async (userId: string) => {
  const { data, error } = await supabase
    .from("reminders")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) console.warn("[db] listReminders", error);
  return data ?? [];
};

export const dbUpsertReminder = async (userId: string, r: Reminder) => {
  const { error } = await supabase.from("reminders").upsert(
    {
      id: r.id,
      user_id: userId,
      medicine: r.medicine,
      time: r.time,
      frequency: r.frequency,
      enabled: r.enabled,
      last_fired_key: r.lastFiredKey ?? null,
    },
    { onConflict: "id" }
  );
  if (error) console.warn("[db] upsertReminder", error);
};

export const dbDeleteReminder = async (id: string) => {
  const { error } = await supabase.from("reminders").delete().eq("id", id);
  if (error) console.warn("[db] deleteReminder", error);
};

/** ---------- RECEIPTS ---------- */
export const dbListReceipts = async (userId: string) => {
  const { data, error } = await supabase
    .from("receipts")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) console.warn("[db] listReceipts", error);
  return data ?? [];
};

export const dbUpsertReceipt = async (userId: string, r: Receipt) => {
  const { error } = await supabase.from("receipts").upsert(
    {
      id: r.id,
      user_id: userId,
      pharmacy: r.pharmacy,
      total: r.total,
      receipt_date: r.date ? new Date(r.date).toISOString() : null,
      date_text: r.dateText ?? null,
      image_url: r.imageUrl ?? null,
      raw_text: r.rawText ?? null,
      items: r.items ?? [],
      medicines: r.medicines ?? null,
      hidden: !!r.hidden,
    },
    { onConflict: "id" }
  );
  if (error) console.warn("[db] upsertReceipt", error);
};

export const dbDeleteReceipt = async (id: string) => {
  const { error } = await supabase.from("receipts").delete().eq("id", id);
  if (error) console.warn("[db] deleteReceipt", error);
};

/** ---------- SUBSCRIPTION ---------- */
export const dbGetSubscription = async (userId: string) => {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) console.warn("[db] getSubscription", error);
  return data;
};

export const dbUpsertSubscription = async (userId: string, plan: Plan) => {
  const { error } = await supabase.from("subscriptions").upsert(
    {
      user_id: userId,
      plan,
      status: "active",
      active: true,
    },
    { onConflict: "user_id" }
  );
  if (error) console.warn("[db] upsertSubscription", error);
};

/** ---------- ACTIVITY LOG ---------- */
export const dbLogActivity = async (
  userId: string,
  action: string,
  entityType?: string,
  entityId?: string,
  metadata?: any
) => {
  const { error } = await supabase.from("activity_logs").insert({
    user_id: userId,
    action,
    entity_type: entityType ?? null,
    entity_id: entityId ?? null,
    metadata: metadata ?? {},
  });
  if (error) console.warn("[db] logActivity", error);
};
