import { Camera, Upload, Sparkles } from "lucide-react";
import { MediCard } from "./ui/MediCard";

interface ScanCardProps {
  onScanClick: () => void;
  onUploadClick: () => void;
}

const ScanCard = ({ onScanClick, onUploadClick }: ScanCardProps) => {
  return (
    <div className="px-6 mt-4">
      <MediCard className="bg-gradient-to-br from-primary-light to-card">
        <div className="flex flex-col items-center text-center py-4">
          {/* Sparkle Icon */}
          <div className="text-primary mb-6">
            <Sparkles className="w-16 h-16" strokeWidth={1.5} />
          </div>
          
          {/* Title */}
          <h2 className="text-2xl font-bold text-foreground mb-3">
            Scan or Upload Medicine
          </h2>
          
          {/* Description */}
          <p className="text-muted-foreground text-sm mb-8 max-w-xs">
            Take a photo or upload an image of the medicine packaging or tablet
          </p>
          
          {/* Scan Button */}
          <button
            onClick={onScanClick}
            className="w-full gradient-teal text-primary-foreground rounded-2xl py-6 px-8 flex items-center justify-center gap-3 font-semibold text-lg shadow-card hover:shadow-card-hover transition-all duration-300 active:scale-[0.98]"
          >
            <Camera className="w-6 h-6" />
            Scan Now
          </button>
          
          {/* Upload Button */}
          <button
            onClick={onUploadClick}
            className="w-full mt-4 bg-card text-foreground rounded-2xl py-5 px-8 flex items-center justify-center gap-3 font-medium text-base shadow-card hover:shadow-card-hover transition-all duration-300 active:scale-[0.98]"
          >
            <Upload className="w-5 h-5" />
            Upload Image
          </button>
        </div>
      </MediCard>
    </div>
  );
};

export default ScanCard;
