import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        const url = new URL(window.location.href);
        const code = url.searchParams.get("code");
        const errorDesc = url.searchParams.get("error_description") || url.searchParams.get("error");

        if (errorDesc) {
          if (!cancelled) navigate("/login", { replace: true });
          return;
        }

        // PKCE flow: exchange ?code= for a session
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(window.location.href);
          if (error) {
            if (!cancelled) navigate("/login", { replace: true });
            return;
          }
        }
        // Implicit flow with #access_token=... is auto-detected by the client.

        // Confirm session is set, then redirect.
        const { data } = await supabase.auth.getSession();
        if (cancelled) return;
        navigate(data.session ? "/" : "/login", { replace: true });
      } catch {
        if (!cancelled) navigate("/login", { replace: true });
      }
    };

    const { data: sub } = supabase.auth.onAuthStateChange((_evt, sess) => {
      if (cancelled) return;
      if (sess) navigate("/", { replace: true });
    });

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
