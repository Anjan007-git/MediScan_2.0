import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "@/lib/runtimeConfig";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
    flowType: "pkce",
  },
});