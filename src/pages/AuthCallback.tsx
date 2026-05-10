import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    // Supabase JS auto-detects the session from the URL (hash or ?code=).
    // We just wait for it to be available, then redirect.
    const finish = async () => {
      const { data } = await supabase.auth.getSession();
      if (cancelled) return;
      navigate(data.session ? "/" : "/login", { replace: true });
    };

    const { data: sub } = supabase.auth.onAuthStateChange((_evt, sess) => {
      if (cancelled) return;
      if (sess) navigate("/", { replace: true });
    });

    // Small delay to allow Supabase to process the URL params first
    const t = window.setTimeout(finish, 300);

    return () => {
      cancelled = true;
      window.clearTimeout(t);
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
