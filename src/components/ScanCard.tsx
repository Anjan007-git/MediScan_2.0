import { Camera, Upload, Sparkles } from "lucide-react";

interface ScanCardProps {
  onScanClick: () => void;
  onUploadClick: () => void;
}

const ScanCard = ({ onScanClick, onUploadClick }: ScanCardProps) => {
  return (
    <div className="px-6 mt-6 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
      <div className="glass-strong rounded-[36px] p-7 relative overflow-hidden">
        {/* Inner ambient glow */}
        <div className="absolute -top-20 -right-20 w-56 h-56 rounded-full bg-primary-glow/30 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-20 w-64 h-64 rounded-full bg-primary/20 blur-3xl pointer-events-none" />

        <div className="flex flex-col items-center text-center">
          {/* Floating glass icon */}
          <div className="glass-icon w-24 h-24 rounded-[28px] flex items-center justify-center mb-6 animate-float-soft">
            <Sparkles className="w-11 h-11 text-white drop-shadow-md" strokeWidth={1.8} />
          </div>

          <h2 className="text-3xl font-bold text-foreground mb-2 tracking-tight">
            Scan or Upload Medicine
          </h2>

          <p className="text-foreground-soft text-sm mb-8 max-w-[300px] leading-relaxed">
            Take a photo or upload an image of the medicine packaging or tablet
          </p>

          {/* Primary liquid button */}
          <button
            onClick={onScanClick}
            className="liquid-button w-full rounded-full py-5 px-8 flex items-center justify-center gap-3 font-semibold text-lg"
          >
            <Camera className="w-6 h-6" strokeWidth={2.2} />
            <span>Scan Now</span>
          </button>

          {/* Divider */}
          <div className="flex items-center w-full my-5 gap-3">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-foreground/15 to-transparent" />
            <span className="text-[11px] text-foreground-soft font-medium uppercase tracking-[0.2em]">or</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-foreground/15 to-transparent" />
          </div>

          {/* Secondary glass button */}
          <button
            onClick={onUploadClick}
            className="glass w-full rounded-full py-4 px-8 flex items-center justify-center gap-3 font-semibold text-base text-primary transition-all duration-300 active:scale-[0.97] hover:shadow-glass-lg"
          >
            <Upload className="w-5 h-5" strokeWidth={2.2} />
            Upload Image
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScanCard;
