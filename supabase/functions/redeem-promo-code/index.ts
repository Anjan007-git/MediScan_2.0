import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

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
    const code = typeof body?.code === "string" ? body.code.trim() : "";
    if (!code || code.length > 64) {
      return json({ ok: false, error: "Invalid promo code" }, 400);
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Case-sensitive exact lookup
    const { data: promo, error: promoErr } = await admin
      .from("promo_codes")
      .select("*")
      .eq("code", code)
      .eq("is_active", true)
      .maybeSingle();

    if (promoErr || !promo) {
      return json({ ok: false, error: "Invalid promo code" }, 200);
    }
    if (promo.expires_at && new Date(promo.expires_at).getTime() < Date.now()) {
      return json({ ok: false, error: "Promo code expired" }, 200);
    }
    if (promo.max_uses != null && promo.used_count >= promo.max_uses) {
      return json({ ok: false, error: "Promo code limit reached" }, 200);
    }

    const now = new Date().toISOString();

    // Activate premium subscription
    const { error: subErr } = await admin.from("subscriptions").upsert(
      {
        user_id: userId,
        plan: "premium",
        status: "active",
        active: true,
        billing_type: "promo",
        promo_code: code,
        activated_at: now,
        started_at: now,
      },
      { onConflict: "user_id" }
    );
    if (subErr) {
      console.error("[redeem] subscription upsert failed", subErr);
      return json({ ok: false, error: "Activation failed" }, 500);
    }

    // Update profile plan (bypasses trigger via service_role)
    await admin.from("profiles").update({ plan: "premium" }).eq("user_id", userId);

    // Increment promo usage
    await admin
      .from("promo_codes")
      .update({ used_count: promo.used_count + 1 })
      .eq("id", promo.id);

    // Log activity
    await admin.from("activity_logs").insert({
      user_id: userId,
      action: "promo_redeemed",
      entity_type: "promo_code",
      entity_id: promo.id,
      metadata: { code },
    });

    return json({ ok: true, plan: "premium" });
  } catch (e) {
    console.error("[redeem] error", e);
    return json({ ok: false, error: "Server error" }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
