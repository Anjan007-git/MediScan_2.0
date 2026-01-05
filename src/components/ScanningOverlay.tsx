import { Loader2 } from "lucide-react";

interface ScanningOverlayProps {
  isVisible: boolean;
}

const ScanningOverlay = ({ isVisible }: ScanningOverlayProps) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-foreground/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-card rounded-3xl p-8 shadow-card-hover flex flex-col items-center gap-4 mx-6 max-w-xs w-full">
        <div className="relative">
          <Loader2 className="w-16 h-16 text-primary animate-spin" />
        </div>
        <div className="text-center">
          <h3 className="text-xl font-semibold text-foreground mb-1">
            Scanning medicine...
          </h3>
          <p className="text-muted-foreground text-sm">
            Please wait while we analyze the image
          </p>
        </div>
        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
          <div className="h-full gradient-teal animate-pulse-soft w-3/4" />
        </div>
      </div>
    </div>
  );
};

export default ScanningOverlay;
