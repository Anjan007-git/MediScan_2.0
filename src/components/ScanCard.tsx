import { Camera, Upload, Sparkles, ArrowRight } from "lucide-react";
import { MediCard } from "./ui/MediCard";

interface ScanCardProps {
  onScanClick: () => void;
  onUploadClick: () => void;
}

const ScanCard = ({ onScanClick, onUploadClick }: ScanCardProps) => {
  return (
    <div className="px-6 mt-4">
      <MediCard className="bg-gradient-to-br from-primary-light via-card to-card border border-border/40 overflow-hidden relative">
        {/* Decorative circle */}
        <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full bg-primary/5 pointer-events-none" />

        <div className="relative flex flex-col items-center text-center py-6">
          {/* Icon with animated ring */}
          <div className="relative mb-6">
            <div className="w-20 h-20 rounded-3xl gradient-teal shadow-card flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-primary-foreground" strokeWidth={1.5} />
            </div>
            <div className="absolute inset-0 w-20 h-20 rounded-3xl border-2 border-primary/30 animate-pulse-soft" />
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Scan or Upload Medicine
          </h2>

          {/* Description */}
          <p className="text-muted-foreground text-sm mb-8 max-w-[280px] leading-relaxed">
            Take a photo or upload an image of the medicine packaging or tablet
          </p>

          {/* Scan Button */}
          <button
            onClick={onScanClick}
            className="group w-full gradient-teal text-primary-foreground rounded-2xl py-5 px-8 flex items-center justify-center gap-3 font-semibold text-lg shadow-card hover:shadow-card-hover transition-all duration-300 active:scale-[0.98]"
          >
            <Camera className="w-6 h-6" />
            Scan Now
            <ArrowRight className="w-5 h-5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
          </button>

          {/* Divider */}
          <div className="flex items-center w-full my-4 gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground font-medium">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Upload Button */}
          <button
            onClick={onUploadClick}
            className="w-full bg-card text-foreground rounded-2xl py-4 px-8 flex items-center justify-center gap-3 font-medium text-base border border-border hover:border-primary/40 hover:shadow-card transition-all duration-300 active:scale-[0.98]"
          >
            <Upload className="w-5 h-5 text-primary" />
            Upload Image
          </button>
        </div>
      </MediCard>
    </div>
  );
};

export default ScanCard;
