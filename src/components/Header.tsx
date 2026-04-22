import { Pill, Shield, Sparkles } from "lucide-react";

const Header = () => {
  return (
    <header className="relative flex flex-col items-center pt-12 pb-4 px-6">
      {/* Logo + Title row */}
      <div className="relative flex items-center gap-4 mb-4 animate-fade-in-up">
        {/* Floating liquid glass app icon */}
        <div className="glass-icon w-20 h-20 rounded-[24px] flex items-center justify-center animate-float-soft">
          <Pill className="w-9 h-9 text-white rotate-45 drop-shadow-md" strokeWidth={2.2} />
          <Sparkles className="absolute top-2 right-2 w-3.5 h-3.5 text-white/95" strokeWidth={2.5} />
        </div>

        <div>
          <h1 className="text-5xl font-extrabold leading-none tracking-tight">
            <span className="text-gradient">Medi</span>
            <span className="text-foreground">Scan</span>
          </h1>
          <p className="text-[11px] font-semibold text-foreground-soft tracking-[0.28em] uppercase mt-2">
            AI-Powered Scanner
          </p>
        </div>
      </div>

      {/* Trusted glass capsule */}
      <div
        className="glass rounded-full px-4 py-1.5 inline-flex items-center gap-1.5 mb-5 animate-fade-in-up"
        style={{ animationDelay: "100ms" }}
      >
        <Shield className="w-3.5 h-3.5 text-primary" strokeWidth={2.5} />
        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">Trusted</span>
      </div>

      {/* Tagline glass card */}
      <div
        className="w-full max-w-md glass rounded-[28px] py-5 px-6 text-center animate-fade-in-up"
        style={{ animationDelay: "150ms" }}
      >
        <p className="text-foreground/85 text-base leading-relaxed font-medium">
          Instantly identify medicines with<br />AI-powered analysis
        </p>
      </div>
    </header>
  );
};

export default Header;
