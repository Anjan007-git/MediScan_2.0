import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const MEDICINE_LIMIT = 10;
const RECEIPT_LIMIT = 5;
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return json({ ok: false, error: "Unauthorized" }, 401);
    }

    const anon = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: claimsData, error: claimsErr } = await anon.auth.getClaims(
      authHeader.replace("Bearer ", "")
    );
    if (claimsErr || !claimsData?.claims?.sub) {
      return json({ ok: false, error: "Unauthorized" }, 401);
    }
    const userId = claimsData.claims.sub as string;

    const body = await req.json().catch(() => ({}));
    const kind = body?.kind;
    const peek = !!body?.peek;
    if (kind !== "medicine" && kind !== "receipt") {
      return json({ ok: false, error: "Invalid kind" }, 400);
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check premium
    const { data: sub } = await admin
      .from("subscriptions")
      .select("plan, active")
      .eq("user_id", userId)
      .maybeSingle();
    const isPremium = sub?.plan === "premium" && sub?.active !== false;
    if (isPremium) {
      return json({ ok: true, unlimited: true, isPremium: true });
    }

    // Load or create counters row
    const { data: existing } = await admin
      .from("usage_counters")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    const nowDate = new Date();
    const nowIso = nowDate.toISOString();

    let medicineUsed = existing?.medicine_scans_used ?? 0;
    let medicineResetAt = existing?.medicine_scan_reset_at ?? nowIso;
    let receiptUsed = existing?.receipt_scans_used ?? 0;
    let receiptResetAt = existing?.receipt_scan_reset_at ?? nowIso;

    // Weekly reset for medicine
    if (Date.now() - new Date(medicineResetAt).getTime() >= WEEK_MS) {
      medicineUsed = 0;
      medicineResetAt = nowIso;
    }
    // Monthly reset for receipts (calendar month change)
    const lastRr = new Date(receiptResetAt);
    if (
      lastRr.getUTCFullYear() !== nowDate.getUTCFullYear() ||
      lastRr.getUTCMonth() !== nowDate.getUTCMonth()
    ) {
      receiptUsed = 0;
      receiptResetAt = nowIso;
    }

    if (kind === "medicine") {
      if (medicineUsed >= MEDICINE_LIMIT) {
        await persist();
        return json({
          ok: false,
          reason: "limit",
          kind,
          used: medicineUsed,
          limit: MEDICINE_LIMIT,
          resetAt: medicineResetAt,
        });
      }
      if (!peek) medicineUsed += 1;
    } else {
      if (receiptUsed >= RECEIPT_LIMIT) {
        await persist();
        return json({
          ok: false,
          reason: "limit",
          kind,
          used: receiptUsed,
          limit: RECEIPT_LIMIT,
          resetAt: receiptResetAt,
        });
      }
      if (!peek) receiptUsed += 1;
    }

    await persist();
    return json({
      ok: true,
      isPremium: false,
      medicine: { used: medicineUsed, limit: MEDICINE_LIMIT, resetAt: medicineResetAt },
      receipt: { used: receiptUsed, limit: RECEIPT_LIMIT, resetAt: receiptResetAt },
    });

    async function persist() {
      await admin.from("usage_counters").upsert(
        {
          user_id: userId,
          medicine_scans_used: medicineUsed,
          medicine_scan_reset_at: medicineResetAt,
          receipt_scans_used: receiptUsed,
          receipt_scan_reset_at: receiptResetAt,
        },
        { onConflict: "user_id" }
      );
    }
  } catch (e) {
    console.error("[consume-scan] error", e);
    return json({ ok: false, error: "Server error" }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
