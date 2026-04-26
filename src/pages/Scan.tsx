import { useRef, useCallback, useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Camera, Upload, Sparkles } from "lucide-react";
import CameraCapture from "@/components/CameraCapture";
import ScanningOverlay from "@/components/ScanningOverlay";
import MedicineResult from "@/components/MedicineResult";
import { useMedicineScanner } from "@/hooks/useMedicineScanner";
import { useToast } from "@/hooks/use-toast";

const Scan = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { isScanning, result, error, scanMedicine, clearResult } = useMedicineScanner();

  // Auto-trigger upload from query param
  useEffect(() => {
    if (searchParams.get("upload") === "1") {
      setTimeout(() => fileInputRef.current?.click(), 100);
    }
  }, [searchParams]);

  useEffect(() => {
    if (error) {
      toast({ title: "Scan Failed", description: error, variant: "destructive" });
    }
  }, [error, toast]);

  const handleCapture = useCallback(
    async (imageData: string) => {
      setIsCameraOpen(false);
      await scanMedicine(imageData);
    },
    [scanMedicine]
  );

  const handleFileUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
      if (!file.type.startsWith("image/")) {
        toast({ title: "Invalid file type", description: "Please upload an image.", variant: "destructive" });
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast({ title: "File too large", description: "Please upload an image under 10MB.", variant: "destructive" });
        return;
      }
      const reader = new FileReader();
      reader.onload = async (e) => {
        const imageData = e.target?.result as string;
        await scanMedicine(imageData);
      };
      reader.readAsDataURL(file);
      event.target.value = "";
    },
    [scanMedicine, toast]
  );

  if (result?.medicine) {
    return (
      <div className="px-2 pt-4">
        <MedicineResult
          medicine={result.medicine}
          confidence={result.confidence}
          onBack={() => clearResult()}
        />
      </div>
    );
  }

  return (
    <div className="px-5 pt-12 space-y-6">
      <header className="flex items-center justify-between animate-fade-in-up">
        <button
          onClick={() => navigate("/")}
          className="w-10 h-10 rounded-full glass flex items-center justify-center active:scale-90"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" strokeWidth={2.4} />
        </button>
        <h1 className="text-xl font-bold">Scan Medicine</h1>
        <div className="w-10" />
      </header>

      <section
        className="glass-strong rounded-[28px] p-7 relative overflow-hidden animate-fade-in-up"
        style={{ animationDelay: "80ms" }}
      >
        <div className="absolute -top-20 -right-20 w-56 h-56 rounded-full bg-primary-glow/30 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-20 w-64 h-64 rounded-full bg-primary/15 blur-3xl pointer-events-none" />

        <div className="relative flex flex-col items-center text-center">
          <div className="relative mb-6 animate-float-soft">
            <div className="relative w-24 h-24 rounded-[28px] glass-strong flex items-center justify-center shadow-float overflow-hidden">
              <div className="absolute inset-0 gradient-primary opacity-95" />
              <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-transparent" />
              <Sparkles className="relative w-11 h-11 text-white drop-shadow-lg" strokeWidth={1.8} />
            </div>
            <div className="absolute inset-0 rounded-[28px] border-2 border-primary/30 animate-pulse-soft" />
          </div>

          <h2 className="text-2xl font-bold tracking-tight mb-2">Position medicine in frame</h2>
          <p className="text-sm text-muted-foreground mb-7 max-w-[280px]">
            Take a clear photo or upload an image of the medicine packaging.
          </p>

          <button
            onClick={() => setIsCameraOpen(true)}
            className="glossy shimmer relative w-full rounded-full py-4 px-8 flex items-center justify-center gap-3 font-semibold text-white shadow-glow active:scale-[0.97] transition overflow-hidden"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Camera className="relative w-5 h-5" strokeWidth={2.3} />
            <span className="relative">Open Camera</span>
          </button>

          <div className="flex items-center w-full my-4 gap-3">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">or</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="glass shimmer w-full rounded-full py-3.5 px-8 flex items-center justify-center gap-2 font-semibold text-primary border border-primary/30 active:scale-[0.97] transition"
          >
            <Upload className="w-5 h-5" strokeWidth={2.2} />
            Upload from Gallery
          </button>
        </div>
      </section>

      <div className="glass rounded-2xl p-4 text-xs text-muted-foreground animate-fade-in-up" style={{ animationDelay: "140ms" }}>
        <p className="font-semibold text-foreground mb-1">Tips for best results</p>
        <ul className="space-y-1 list-disc pl-4">
          <li>Ensure good lighting</li>
          <li>Keep the label flat and in focus</li>
          <li>Avoid glare and shadows</li>
        </ul>
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
      <CameraCapture
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCapture}
      />
      <ScanningOverlay isVisible={isScanning} />
    </div>
  );
};

export default Scan;
