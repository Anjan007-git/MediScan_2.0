import { Sparkles } from "lucide-react";

interface ScanningOverlayProps {
  isVisible: boolean;
}

const ScanningOverlay = ({ isVisible }: ScanningOverlayProps) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 backdrop-blur-md animate-fade-in-up">
      <div className="glass-strong rounded-[32px] p-8 mx-6 max-w-xs w-full flex flex-col items-center gap-5 animate-scale-in shadow-float">
        {/* Floating animated icon */}
        <div className="relative w-20 h-20 rounded-[24px] flex items-center justify-center overflow-hidden shadow-glow">
          <div className="absolute inset-0 gradient-primary" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent" />
          <Sparkles className="relative w-9 h-9 text-white animate-pulse-soft" strokeWidth={2} />
          <div className="absolute inset-0 rounded-[24px] border-2 border-white/40 animate-pulse-soft" />
        </div>

        <div className="text-center">
          <h3 className="text-xl font-bold text-foreground mb-1 tracking-tight">
            Analyzing medicine...
          </h3>
          <p className="text-muted-foreground text-sm">
            Please wait while AI identifies the image
          </p>
        </div>

        {/* Animated progress bar */}
        <div className="w-full h-1.5 rounded-full bg-white/40 overflow-hidden">
          <div
            className="h-full rounded-full animate-pulse-soft"
            style={{ background: "var(--gradient-primary)", width: "75%" }}
          />
        </div>
      </div>
    </div>
  );
};

export default ScanningOverlay;
