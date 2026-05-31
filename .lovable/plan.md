# MediScan Premium System Implementation Plan

## 1. Database Changes (migration)

**New table: `promo_codes`**
- `id`, `code` (unique), `is_active` (bool), `created_at`, `expires_at` (nullable), `max_uses` (nullable int), `used_count` (int default 0)
- RLS: no client access (only service_role reads/writes). No anon/authenticated grants.
- Seed row: `code='ANJANMEDISCAN', is_active=true, max_uses=null`

**New table: `usage_counters`** (server-authoritative counters)
- `user_id` (PK), `medicine_scans_used` int, `medicine_scan_reset_at` timestamptz, `receipt_scans_used` int, `receipt_scan_reset_at` timestamptz, `updated_at`
- RLS: user can SELECT own row only. INSERT/UPDATE/DELETE denied for authenticated (only edge functions via service_role mutate).
- Trigger / default: row auto-created on first use.

**Extend `subscriptions` table** (add columns):
- `billing_type` text (e.g. 'promo', 'paid'), `promo_code` text, `activated_at` timestamptz

## 2. Edge Functions

### `redeem-promo-code`
- Auth: requires JWT (verify in code with `SUPABASE_JWKS`).
- Input: `{ code: string }` (validated with zod, case-sensitive exact match).
- Logic (service_role client):
  1. Look up code in `promo_codes` where `is_active=true`, not expired, `used_count < max_uses` (if max_uses set).
  2. If invalid → return `{ ok: false, error: 'Invalid promo code' }`.
  3. Upsert `subscriptions` row: `plan='premium', billing_type='promo', promo_code=code, activated_at=now(), active=true, status='active'`.
  4. Update `profiles.plan='premium'` via service_role (bypasses plan-change trigger).
  5. Increment `promo_codes.used_count`.
  6. Log activity.
  7. Return `{ ok: true }`.

### `consume-scan`
- Auth: JWT required.
- Input: `{ kind: 'medicine' | 'receipt' }`.
- Logic:
  1. Read user's subscription → if premium, return `{ ok: true, unlimited: true }`.
  2. Read/create `usage_counters` row.
  3. If `kind='medicine'`: if reset_at < now() - 7 days OR null, reset count to 0 and reset_at=now(). If count >= 10 → return `{ ok: false, reason: 'limit', limit: 10, used: 10 }`. Else increment.
  4. If `kind='receipt'`: monthly reset (compare year+month). If count >= 5 → `{ ok: false }`. Else increment.
  5. Return `{ ok: true, used, limit, resetAt }`.

### `get-usage`
- Returns current counters + premium status for the user (applies resets read-only).

## 3. Frontend Changes

### Store (`src/store/appStore.ts`)
- Add `usage: { medicineScansUsed, medicineScanLimit: 10, scanResetAt, receiptScansUsed, receiptScanLimit: 5, receiptResetAt }`.
- Add `isPremium` derived from `plan === 'premium'`.
- Add `setUsage()` action.

### New: `src/lib/premium.ts`
- `isPremium(plan)` helper.
- `consumeScan(kind)` → calls edge function, returns result.
- `redeemPromo(code)` → calls edge function.
- `fetchUsage()` → calls edge function.

### Scan flow (`src/hooks/useMedicineScanner.ts` + `src/pages/Scan.tsx` + `src/pages/UploadImage.tsx`)
- Before scanning: call `consumeScan('medicine')`.
- If blocked → open `LimitReachedModal` (medicine variant) and abort.
- On success → continue + refresh usage in store.

### Receipt flow (`src/pages/ReceiptScan.tsx`)
- Same pattern with `consumeScan('receipt')`.

### New component: `src/components/LimitReachedModal.tsx`
- AlertDialog with title/message per kind, "Upgrade to Premium" → navigate `/settings/premium-payment`, "Cancel".

### New component: `src/components/PromoCodeModal.tsx`
- Dialog with input, Apply/Cancel buttons. Calls `redeemPromo`. On success: refresh subscription, show success toast, close. On failure: error toast.

### `src/pages/PremiumPayment.tsx`
- Remove the "Secure payment powered by Razorpay" section.
- Add new promo code card: gradient/glass card with gift emoji, heading "Have a promo code?", blue underlined "Click here to enter your code" link that opens `PromoCodeModal`.
- Keep all other UI intact.

### Feature gating (frontend hide/disable)
- `Saved.tsx`: limit display to 10 for free users with upgrade CTA when exceeded.
- `History.tsx`: limit to last 7 days for free users with upgrade banner.
- `Receipts.tsx`: limit storage display to 30 days for free.
- `Insights.tsx`: show upgrade overlay over expense analytics sections for free users.
- Use a small `<UpgradeBanner />` component reused across pages.

### Subscription sync (`src/hooks/useDbSync.ts`)
- After redeem, refetch subscription + profile to update `plan` in store.

## 4. Security

- Promo code validation **only** in edge function with service_role client.
- `subscriptions` writes already blocked for clients (existing RESTRICTIVE deny policies).
- `profiles.plan` change blocked for non-service_role via existing trigger.
- `usage_counters` writes only via edge function.
- Edge functions validate JWT in code and use `auth.uid()` from verified token.

## 5. Files to create/edit

**Create:**
- `supabase/migrations/<ts>_premium_system.sql`
- `supabase/functions/redeem-promo-code/index.ts`
- `supabase/functions/consume-scan/index.ts`
- `supabase/functions/get-usage/index.ts`
- `src/lib/premium.ts`
- `src/components/LimitReachedModal.tsx`
- `src/components/PromoCodeModal.tsx`
- `src/components/UpgradeBanner.tsx`

**Edit:**
- `src/store/appStore.ts` (add usage state)
- `src/pages/PremiumPayment.tsx` (replace Razorpay section with promo card)
- `src/hooks/useMedicineScanner.ts` (gate scans)
- `src/pages/ReceiptScan.tsx` (gate receipt scans)
- `src/pages/Saved.tsx`, `src/pages/History.tsx`, `src/pages/Receipts.tsx`, `src/pages/Insights.tsx` (apply limits + upgrade CTAs)
- `src/hooks/useDbSync.ts` (refresh subscription after redeem)

Out of scope for now: PDF export, drug interaction analysis, AI explanation tier differences (these gates would require larger feature work — will note in final response).

Ready to implement on approval.