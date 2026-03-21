import { Pill, Shield, Sparkles } from "lucide-react";

const Header = () => {
  return (
    <header className="relative flex flex-col items-center pt-10 pb-6 px-6 overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
      <div className="absolute -top-10 -left-16 w-48 h-48 rounded-full bg-accent/10 blur-3xl pointer-events-none" />

      {/* Logo + Title */}
      <div className="relative flex items-center gap-4 mb-2">
        <div className="relative w-16 h-16 rounded-2xl gradient-teal shadow-card flex items-center justify-center">
          <Pill className="w-8 h-8 text-primary-foreground rotate-45" strokeWidth={2.5} />
          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-card shadow-card flex items-center justify-center">
            <Sparkles className="w-3 h-3 text-primary" />
          </div>
        </div>
        <div>
          <h1 className="text-4xl font-bold text-gradient leading-tight">MediScan</h1>
          <p className="text-xs font-medium text-primary-muted tracking-wide uppercase">AI-Powered Scanner</p>
        </div>
      </div>

      {/* Tagline pill */}
      <div className="mt-5 w-full max-w-sm">
        <div className="relative bg-card/80 backdrop-blur-md rounded-2xl py-4 px-6 shadow-card border border-border/50 text-center">
          <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest px-3 py-0.5 rounded-full flex items-center gap-1">
            <Shield className="w-3 h-3" />
            Trusted
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed mt-1">
            Instantly identify medicines with AI-powered analysis
          </p>
        </div>
      </div>
    </header>
  );
};

export default Header;
