import { useState, useEffect } from "react";
import { Sun, Moon, Crown, Sparkles, ShieldCheck, Info, Heart, Bookmark, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  getPlan,
  setPlan,
  getTheme,
  setTheme,
  getWeeklyScanCount,
  getScanLimit,
  getSaved,
} from "@/lib/storage";
import { toast } from "sonner";

const Settings = () => {
  const navigate = useNavigate();
  const [plan, setPlanState] = useState(getPlan());
  const [theme, setThemeState] = useState(getTheme());
  const [scans, setScans] = useState(getWeeklyScanCount());
  const limit = getScanLimit();
  const savedCount = getSaved().length;

  useEffect(() => {
    setScans(getWeeklyScanCount());
  }, []);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    setThemeState(next);
  };

  const handleUpgrade = () => {
    setPlan("premium");
    setPlanState("premium");
    toast.success("Welcome to Premium! Unlimited scans unlocked.");
  };

  const handleDowngrade = () => {
    setPlan("free");
    setPlanState("free");
    toast("Switched to Free plan");
  };

  return (
    <div className="px-5 pt-12 pb-6 max-w-md mx-auto animate-fade-in-up">
      <h1 className="text-2xl font-extrabold text-foreground mb-1 tracking-tight">Settings</h1>
      <p className="text-sm text-muted-foreground mb-5">Customize your MediScan experience</p>

      {/* Subscription */}
      <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground mb-2 px-2">
        Subscription
      </h3>
      <div className="glass-strong rounded-3xl p-5 mb-5 relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-primary-glow/25 blur-3xl pointer-events-none" />
        <div className="relative">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-glow"
                style={{ background: "var(--gradient-primary)" }}
              >
                {plan === "premium" ? <Crown className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
              </div>
              <div>
                <p className="font-bold text-foreground">
                  {plan === "premium" ? "Premium Plan" : "Basic Plan"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {plan === "premium" ? "₹199/month • Unlimited" : "Free • 10 scans/week"}
                </p>
              </div>
            </div>
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                plan === "premium"
                  ? "bg-success/15 text-success border border-success/30"
                  : "glass-subtle text-primary border border-primary/30"
              }`}
            >
              {plan}
            </span>
          </div>

          {plan === "free" && (
            <>
              <div className="glass-subtle rounded-2xl p-3 mb-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-foreground">Weekly scans</span>
                  <span className="text-xs font-bold text-primary">
                    {scans} / {limit}
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-white/40 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, (scans / limit) * 100)}%`,
                      background: "var(--gradient-primary)",
                    }}
                  />
                </div>
              </div>

              <button
                onClick={handleUpgrade}
                className="w-full rounded-full py-3 font-semibold text-white shadow-glow flex items-center justify-center gap-2"
                style={{ background: "var(--gradient-primary)" }}
              >
                <Crown className="w-4 h-4" />
                Upgrade to Premium
              </button>
              <p className="text-[10px] text-center text-muted-foreground mt-2">
                Unlimited scans • Priority processing
              </p>
            </>
          )}

          {plan === "premium" && (
            <button
              onClick={handleDowngrade}
              className="w-full rounded-full py-2.5 text-sm font-semibold text-muted-foreground glass"
            >
              Switch to Free
            </button>
          )}
        </div>
      </div>

      {/* Appearance */}
      <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground mb-2 px-2">
        Appearance
      </h3>
      <div className="glass rounded-2xl divide-y divide-white/30 mb-5 overflow-hidden">
        <button
          onClick={toggleTheme}
          className="w-full px-4 py-3.5 flex items-center gap-3 active:bg-primary/5 transition-colors"
        >
          <div className="w-9 h-9 rounded-xl glass-subtle flex items-center justify-center">
            {theme === "light" ? <Sun className="w-4 h-4 text-primary" /> : <Moon className="w-4 h-4 text-primary" />}
          </div>
          <span className="text-sm font-semibold text-foreground flex-1 text-left">
            {theme === "light" ? "Light mode" : "Dark mode"}
          </span>
          <div
            className={`w-11 h-6 rounded-full p-0.5 transition-colors ${
              theme === "dark" ? "bg-primary" : "bg-muted"
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${
                theme === "dark" ? "translate-x-5" : ""
              }`}
            />
          </div>
        </button>
      </div>

      {/* Library */}
      <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground mb-2 px-2">
        Library
      </h3>
      <div className="glass rounded-2xl divide-y divide-white/30 mb-5 overflow-hidden">
        <button
          onClick={() => navigate("/history")}
          className="w-full px-4 py-3.5 flex items-center gap-3 active:bg-primary/5 transition-colors"
        >
          <div className="w-9 h-9 rounded-xl glass-subtle flex items-center justify-center">
            <Bookmark className="w-4 h-4 text-primary" />
          </div>
          <span className="text-sm font-semibold text-foreground flex-1 text-left">Saved Medicines</span>
          <span className="text-xs text-muted-foreground">{savedCount}</span>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* About */}
      <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground mb-2 px-2">
        About
      </h3>
      <div className="glass rounded-2xl divide-y divide-white/30 mb-5 overflow-hidden">
        <div className="px-4 py-3.5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl glass-subtle flex items-center justify-center">
            <Info className="w-4 h-4 text-primary" />
          </div>
          <span className="text-sm font-semibold text-foreground flex-1">Version</span>
          <span className="text-xs text-muted-foreground font-mono">v1.0.0</span>
        </div>
        <div className="px-4 py-3.5 flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl glass-subtle flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground mb-1">About MediScan</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              MediScan uses AI vision to identify medicines and surface trusted information from
              public drug databases. For educational use — always consult a healthcare professional.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center mt-6 mb-4">
        <p className="text-xs text-muted-foreground inline-flex items-center gap-1">
          Designed by Anjan <Heart className="w-3 h-3 text-danger" fill="currentColor" />
        </p>
      </div>
    </div>
  );
};

export default Settings;
