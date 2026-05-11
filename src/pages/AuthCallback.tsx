import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    let redirected = false;

    const getRedirectTarget = () => {
      try {
        const target = localStorage.getItem("mediscan-auth-redirect") || "/";
        localStorage.removeItem("mediscan-auth-redirect");
        return target.startsWith("/") ? target : "/";
      } catch {
        return "/";
      }
    };

    const finish = (target: string) => {
      if (cancelled || redirected) return;
      redirected = true;
      navigate(target, { replace: true });
    };

    // Listen for SIGNED_IN — most reliable signal that the session is live.
    const { data: sub } = supabase.auth.onAuthStateChange((event, sess) => {
      if (cancelled) return;
      if (sess && (event === "SIGNED_IN" || event === "INITIAL_SESSION" || event === "TOKEN_REFRESHED")) {
        finish(getRedirectTarget());
      }
    });

    const run = async () => {
      try {
        const url = new URL(window.location.href);
        const code = url.searchParams.get("code");
        const errorDesc =
          url.searchParams.get("error_description") || url.searchParams.get("error");

        if (errorDesc) {
          finish("/login");
          return;
        }

        // PKCE: exchange ?code= for a session. This will fire SIGNED_IN,
        // which the listener above will pick up.
        if (code) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          if (cancelled) return;
          if (error) {
            finish("/login");
            return;
          }
          if (data.session) {
            finish(getRedirectTarget());
            return;
          }
        }

        // No code (implicit/hash flow or already-exchanged) — check existing session.
        const { data } = await supabase.auth.getSession();
        if (cancelled) return;
        if (data.session) {
          finish(getRedirectTarget());
          return;
        }

        // Still no session: give onAuthStateChange a brief grace window
        // before falling back to login.
        setTimeout(async () => {
          if (cancelled || redirected) return;
          const { data: retry } = await supabase.auth.getSession();
          if (cancelled || redirected) return;
          finish(retry.session ? getRedirectTarget() : "/login");
        }, 1500);
      } catch {
        finish("/login");
      }
    };

    run();

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-primary-glow/10">
      <Loader2 className="w-7 h-7 text-primary animate-spin" />
    </div>
  );
};

export default AuthCallback;
