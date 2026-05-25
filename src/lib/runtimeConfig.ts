// Runtime configuration with hardcoded production fallbacks.
// The Supabase URL and publishable (anon) key are public values — safe to ship
// in the client bundle. Hardcoding them guarantees the production deployment
// (Vercel, custom domains, etc.) always uses the correct backend even if the
// hosting platform's environment variables are missing or stale.

const FALLBACK_SUPABASE_URL = "https://fxquiwgihxzjrjbzcdhq.supabase.co";
const FALLBACK_SUPABASE_PUBLISHABLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4cXVpd2dpaHh6anJqYnpjZGhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg0Mjg0NjcsImV4cCI6MjA5NDAwNDQ2N30.FylPQdl0umVl4LfWYxFg85YG6VjUaJFZYJ4eReaS_dc";

export const SUPABASE_URL =
  (import.meta.env.VITE_SUPABASE_URL as string | undefined) || FALLBACK_SUPABASE_URL;

export const SUPABASE_PUBLISHABLE_KEY =
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined) ||
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ||
  FALLBACK_SUPABASE_PUBLISHABLE_KEY;

if (typeof window !== "undefined") {
  // eslint-disable-next-line no-console
  console.log("[MediScan] runtime config", {
    supabaseUrl: SUPABASE_URL,
    hasPublishableKey: Boolean(SUPABASE_PUBLISHABLE_KEY),
    fromEnv: {
      url: Boolean(import.meta.env.VITE_SUPABASE_URL),
      key: Boolean(
        import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY
      ),
    },
  });
}
