import { Sparkles } from "lucide-react";

interface ScanningOverlayProps {
  isVisible: boolean;
}

const ScanningOverlay = ({ isVisible }: ScanningOverlayProps) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/25 backdrop-blur-md animate-fade-in-up">
      <div className="glass-strong rounded-[32px] p-8 mx-6 max-w-xs w-full flex flex-col items-center gap-5 animate-scale-in shadow-float">
        {/* Floating animated icon */}
        <div className="glass-icon w-20 h-20 rounded-[24px] flex items-center justify-center animate-float-soft">
          <Sparkles className="w-9 h-9 text-white animate-pulse-soft drop-shadow-md" strokeWidth={2} />
        </div>

        <div className="text-center">
          <h3 className="text-xl font-bold text-foreground mb-1 tracking-tight">
            Analyzing medicine...
          </h3>
          <p className="text-foreground-soft text-sm">
            Please wait while AI identifies the image
          </p>
        </div>

        {/* Animated progress bar */}
        <div className="w-full h-1.5 rounded-full bg-white/40 overflow-hidden">
          <div
            className="h-full rounded-full animate-pulse-soft"
            style={{ background: "var(--gradient-primary-glow)", width: "75%" }}
          />
        </div>
      </div>
    </div>
  );
};

export default ScanningOverlay;
