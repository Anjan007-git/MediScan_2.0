import { useRef, useCallback, useState } from "react";
import { Camera, Upload, ImageIcon } from "lucide-react";
import { MediCard } from "@/components/ui/MediCard";
import CameraCapture from "@/components/CameraCapture";
import ScanningOverlay from "@/components/ScanningOverlay";
import MedicineResult from "@/components/MedicineResult";
import { useMedicineScanner } from "@/hooks/useMedicineScanner";
import { useScanHistory } from "@/hooks/useScanHistory";
import { useToast } from "@/hooks/use-toast";

const ScanPage = () => {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { isScanning, result, error, scanMedicine, clearResult } = useMedicineScanner();
  const { addToHistory } = useScanHistory();

  const processImage = useCallback(
    async (imageData: string) => {
      await scanMedicine(imageData);
    },
    [scanMedicine]
  );

  const handleCapture = useCallback(
    async (imageData: string) => {
      setIsCameraOpen(false);
      await processImage(imageData);
    },
    [processImage]
  );

  const handleFileUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
      if (!file.type.startsWith("image/")) {
        toast({ title: "Invalid file type", description: "Please upload an image file.", variant: "destructive" });
        return;
      }
      const MAX_FILE_SIZE = 10 * 1024 * 1024;
      if (file.size > MAX_FILE_SIZE) {
        toast({ title: "File too large", description: "Please upload an image smaller than 10 MB.", variant: "destructive" });
        return;
      }
      const reader = new FileReader();
      reader.onload = async (e) => {
        const imageData = e.target?.result as string;
        await processImage(imageData);
      };
      reader.readAsDataURL(file);
      event.target.value = "";
    },
    [processImage, toast]
  );

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (!file || !file.type.startsWith("image/")) {
        toast({ title: "Invalid file", description: "Please drop an image file.", variant: "destructive" });
        return;
      }
      const MAX_FILE_SIZE = 10 * 1024 * 1024;
      if (file.size > MAX_FILE_SIZE) {
        toast({ title: "File too large", description: "Please upload an image smaller than 10 MB.", variant: "destructive" });
        return;
      }
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const imageData = ev.target?.result as string;
        await processImage(imageData);
      };
      reader.readAsDataURL(file);
    },
    [processImage, toast]
  );

  const handleBack = useCallback(() => {
    if (result) addToHistory(result);
    clearResult();
  }, [clearResult, result, addToHistory]);

  if (error) {
    toast({ title: "Scan Failed", description: error, variant: "destructive" });
  }

  if (result) {
    return (
      <div className="min-h-screen">
        <MedicineResult medicine={result} onBack={handleBack} />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground text-center mb-2">
          Scan Medicine
        </h1>
        <p className="text-muted-foreground text-center text-sm mb-8">
          Capture or upload a photo of medicine packaging or tablet
        </p>

        {/* Drag & Drop Zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all mb-6 ${
            isDragging
              ? "border-primary bg-primary/5"
              : "border-border bg-card hover:border-primary/40"
          }`}
        >
          <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-foreground font-medium mb-1">
            Drag & drop an image here
          </p>
          <p className="text-muted-foreground text-sm mb-4">or use the buttons below</p>
          <p className="text-xs text-muted-foreground">Supports JPG, PNG, WEBP</p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => setIsCameraOpen(true)}
            className="gradient-teal text-primary-foreground rounded-xl py-4 px-6 flex items-center justify-center gap-3 font-semibold text-base shadow-card hover:shadow-card-hover transition-all active:scale-[0.98]"
          >
            <Camera className="w-5 h-5" />
            Open Camera
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-card text-foreground rounded-xl py-4 px-6 flex items-center justify-center gap-3 font-medium text-base shadow-card hover:shadow-card-hover transition-all active:scale-[0.98] border border-border"
          >
            <Upload className="w-5 h-5" />
            Upload Image
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileUpload}
        />
      </div>

      <CameraCapture
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCapture}
      />
      <ScanningOverlay isVisible={isScanning} />
    </div>
  );
};

export default ScanPage;
