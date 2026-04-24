import { useNavigate } from "react-router-dom";
import { Camera, Upload, Sparkles, Pill, Shield, Zap, ScanSearch, FileText, ShieldCheck, BadgeCheck } from "lucide-react";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="px-5 pt-12 max-w-md mx-auto animate-fade-in-up">
      {/* Logo + Title */}
      <div className="flex flex-col items-center text-center mb-5">
        <div className="relative w-20 h-20 rounded-[28px] flex items-center justify-center shadow-float overflow-hidden mb-4">
          <div className="absolute inset-0" style={{ background: "var(--gradient-primary)" }} />
          <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-transparent" />
          <Pill className="relative w-9 h-9 text-white rotate-45 drop-shadow-lg" strokeWidth={2.2} />
          <Sparkles className="absolute top-2 right-2 w-3.5 h-3.5 text-white/90" strokeWidth={2.5} />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight">
          <span className="text-gradient">Medi</span>
          <span className="text-foreground">Scan</span>
        </h1>
        <p className="text-muted-foreground text-sm mt-2 max-w-[280px] leading-relaxed">
          Scan medicines instantly & get complete details powered by AI
        </p>
      </div>

      {/* Hero card */}
      <div className="glass-strong rounded-[32px] p-6 relative overflow-hidden mb-6">
        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-primary-glow/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-16 w-56 h-56 rounded-full bg-primary/15 blur-3xl pointer-events-none" />

        <div className="relative">
          <h2 className="text-xl font-bold text-foreground mb-1 text-center">
            Identify any medicine
          </h2>
          <p className="text-sm text-muted-foreground text-center mb-5">
            Capture or upload — we'll do the rest
          </p>

          <button
            onClick={() => navigate("/scan")}
            className="glossy shimmer relative w-full rounded-full py-4 px-6 flex items-center justify-center gap-2.5 font-semibold text-white shadow-glow active:scale-[0.97] hover:shadow-float overflow-hidden mb-3"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Camera className="relative w-5 h-5" strokeWidth={2.2} />
            <span className="relative">Scan Now</span>
          </button>

          <button
            onClick={() => navigate("/scan?upload=1")}
            className="glass shimmer w-full rounded-full py-4 px-6 flex items-center justify-center gap-2.5 font-semibold text-primary border border-primary/30 active:scale-[0.97] hover:border-primary/60 hover:shadow-glass-lg transition-all"
          >
            <Upload className="w-5 h-5" strokeWidth={2.2} />
            Upload Image
          </button>
        </div>
      </div>

      {/* How it works */}
      <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground mb-3 px-2">
        How it works
      </h3>
      <div className="space-y-2.5 mb-6">
        {[
          { icon: ScanSearch, title: "Scan / Upload", desc: "Use camera or pick an image" },
          { icon: Sparkles, title: "AI Detects Medicine", desc: "Smart vision recognition" },
          { icon: FileText, title: "Get Full Details", desc: "Uses, dosage, precautions" },
        ].map((step, i) => {
          const Icon = step.icon;
          return (
            <div key={step.title} className="glass rounded-2xl p-4 flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-glow flex-shrink-0"
                style={{ background: "var(--gradient-primary)" }}
              >
                <Icon className="w-5 h-5" strokeWidth={2.4} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground">{step.title}</p>
                <p className="text-xs text-muted-foreground">{step.desc}</p>
              </div>
              <div className="w-7 h-7 rounded-full glass-subtle flex items-center justify-center text-xs font-bold text-primary">
                {i + 1}
              </div>
            </div>
          );
        })}
      </div>

      {/* Trust badges */}
      <div className="grid grid-cols-3 gap-2.5">
        {[
          { icon: Zap, label: "AI Powered" },
          { icon: ShieldCheck, label: "Secure" },
          { icon: BadgeCheck, label: "Verified" },
        ].map((b) => {
          const I = b.icon;
          return (
            <div key={b.label} className="glass rounded-2xl py-3 flex flex-col items-center gap-1">
              <I className="w-4 h-4 text-primary" strokeWidth={2.4} />
              <span className="text-[10px] font-semibold text-foreground/80">{b.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Home;
