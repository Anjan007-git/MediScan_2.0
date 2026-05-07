import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface Profile {
  display_name: string | null;
  avatar_url: string | null;
  email: string | null;
}

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  session: null,
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Listener FIRST (no async work inside)
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, sess) => {
      setSession(sess);
      setUser(sess?.user ?? null);
      if (!sess?.user) setProfile(null);
    });

    // 2. Then load existing session
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  // Load profile when user changes (deferred)
  useEffect(() => {
    if (!user) return;
    let active = true;
    setTimeout(async () => {
      const { data } = await supabase
        .from("profiles")
        .select("display_name, avatar_url, email")
        .eq("user_id", user.id)
        .maybeSingle();
      if (active && data) setProfile(data as Profile);
    }, 0);
    return () => {
      active = false;
    };
  }, [user]);

  const signOut = async () => {
    // IMPORTANT: do NOT remove the per-user mediscan-store-<uid> slot.
    // That data must persist so the same account restores its history on next login.
    // Only clear legacy unscoped key (if it ever existed).
    try {
      localStorage.removeItem("mediscan-store");
      localStorage.removeItem("mediscan-onboarded");
    } catch {
      /* ignore */
    }
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ session, user, profile, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
