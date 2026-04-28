import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Mail, Loader2, ArrowLeft } from "lucide-react";

const ForgotPassword = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setSent(true);
      toast({ title: "Email sent", description: "Check your inbox for a reset link." });
    } catch (err: any) {
      toast({ title: "Failed", description: err?.message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-5 py-10 bg-gradient-to-br from-primary/10 via-background to-primary-glow/10">
      <div className="w-full max-w-md glass-strong rounded-[28px] p-7 shadow-float animate-fade-in-up">
        <Link to="/login" className="inline-flex items-center gap-1 text-sm font-semibold text-primary mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to login
        </Link>
        <h1 className="text-2xl font-extrabold tracking-tight mb-2">Reset password</h1>
        <p className="text-sm text-muted-foreground mb-5">
          Enter your email and we'll send a link to reset your password.
        </p>

        {sent ? (
          <div className="glass-tinted rounded-2xl p-4 text-sm text-foreground/90">
            ✓ Check <strong>{email}</strong> for the reset link.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="glass rounded-2xl px-4 py-3 flex items-center gap-2">
              <Mail className="w-4 h-4 text-primary" strokeWidth={2.4} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="flex-1 bg-transparent outline-none text-sm font-medium"
              />
            </div>
            <button
              type="submit"
              disabled={busy}
              className="glossy w-full rounded-full py-3.5 font-bold text-white shadow-glow active:scale-[0.97] transition disabled:opacity-60 flex items-center justify-center gap-2"
              style={{ background: "var(--gradient-primary)" }}
            >
              {busy && <Loader2 className="w-4 h-4 animate-spin" />}
              Send reset link
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
