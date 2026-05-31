import { supabase } from "@/lib/supabaseClient";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "@/lib/runtimeConfig";

export type ScanKind = "medicine" | "receipt";

export interface ConsumeScanResult {
  ok: boolean;
  unlimited?: boolean;
  isPremium?: boolean;
  reason?: "limit";
  kind?: ScanKind;
  used?: number;
  limit?: number;
  resetAt?: string;
  error?: string;
  medicine?: { used: number; limit: number; resetAt: string };
  receipt?: { used: number; limit: number; resetAt: string };
}

async function authHeaders() {
  const { data } = await supabase.auth.getSession();
  const token = data?.session?.access_token;
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token ?? SUPABASE_PUBLISHABLE_KEY}`,
    apikey: SUPABASE_PUBLISHABLE_KEY,
  };
}

async function callFn(name: string, body: unknown): Promise<any> {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/${name}`, {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify(body ?? {}),
  });
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return { ok: false, error: "Invalid response" };
  }
}

export const consumeScan = (kind: ScanKind, opts?: { peek?: boolean }) =>
  callFn("consume-scan", { kind, peek: opts?.peek }) as Promise<ConsumeScanResult>;

export const redeemPromoCode = (code: string) =>
  callFn("redeem-promo-code", { code }) as Promise<{
    ok: boolean;
    error?: string;
    plan?: string;
  }>;

export const isPremiumPlan = (plan: string | undefined | null) => plan === "premium";
