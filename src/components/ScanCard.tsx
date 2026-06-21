import { ScanLine, ImageUp, Stethoscope } from "lucide-react";

interface ScanCardProps {
  onScanClick: () => void;
  onUploadClick: () => void;
}

const ScanCard = ({ onScanClick, onUploadClick }: ScanCardProps) => {
  return (
    <div className="px-6 mt-6 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
      <div className="glass-strong rounded-[32px] p-7 relative overflow-hidden">
        {/* Decorative inner orbs */}
        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-primary-glow/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-16 w-56 h-56 rounded-full bg-primary/15 blur-3xl pointer-events-none" />

        <div className="relative flex flex-col items-center text-center">
          {/* Floating glass icon */}
          <div className="relative mb-6 animate-float-soft">
            <div className="relative w-24 h-24 rounded-[28px] glass-strong flex items-center justify-center shadow-float overflow-hidden">
              <div className="absolute inset-0 gradient-primary opacity-95" />
              <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-transparent" />
              <Stethoscope className="relative w-11 h-11 text-white drop-shadow-lg" strokeWidth={1.6} />
            </div>
            {/* Pulse ring */}
            <div className="absolute inset-0 rounded-[28px] border-2 border-primary/30 animate-pulse-soft" />
          </div>

          <h2 className="text-3xl font-bold text-foreground mb-2 tracking-tight">
            Scan or Upload Medicine
          </h2>

          <p className="text-muted-foreground text-sm mb-8 max-w-[300px] leading-relaxed">
            Take a photo or upload an image of the medicine packaging or tablet
          </p>

          {/* Primary CTA — glossy gradient pill */}
          <button
            onClick={onScanClick}
            className="glossy shimmer relative w-full rounded-full py-5 px-8 flex items-center justify-center gap-3 font-semibold text-lg text-white shadow-glow transition-all duration-300 active:scale-[0.97] hover:shadow-float overflow-hidden"
            style={{ background: "var(--gradient-primary)" }}
          >
            <ScanLine className="relative w-6 h-6" strokeWidth={1.8} />
            <span className="relative">Scan Now</span>
          </button>

          {/* Divider */}
          <div className="flex items-center w-full my-5 gap-3">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-widest">or</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          </div>

          {/* Secondary CTA — glass outlined */}
          <button
            onClick={onUploadClick}
            className="glass shimmer w-full rounded-full py-4 px-8 flex items-center justify-center gap-3 font-semibold text-base text-primary border border-primary/30 transition-all duration-300 active:scale-[0.97] hover:border-primary/60 hover:shadow-glass-lg"
          >
            <ImageUp className="w-5 h-5" strokeWidth={1.8} />
            Upload Image
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScanCard;
