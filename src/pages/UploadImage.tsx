import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ImagePlus, Loader2 } from "lucide-react";
import { useMedicineScanner } from "@/hooks/useMedicineScanner";
import { useToast } from "@/hooks/use-toast";
import MedicineResult from "@/components/MedicineResult";
import ScanningOverlay from "@/components/ScanningOverlay";
import LimitReachedModal from "@/components/LimitReachedModal";

/** Dedicated Upload Image page — opens gallery picker only.
 *  Does NOT touch the camera or redirect to /scan. */
const UploadImage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isScanning, result, error, limitInfo, clearLimit, scanMedicine, clearResult } = useMedicineScanner();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const autoOpenedRef = useRef(false);

  // Auto-open gallery picker once on mount
  useEffect(() => {
    if (autoOpenedRef.current) return;
    autoOpenedRef.current = true;
    const t = setTimeout(() => fileInputRef.current?.click(), 200);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (error) toast({ title: "Scan failed", description: error, variant: "destructive" });
  }, [error, toast]);

  const handleFile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = "";
      if (!file) return;
      if (!file.type.startsWith("image/")) {
        toast({ title: "Invalid file", description: "Please choose an image.", variant: "destructive" });
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast({ title: "File too large", description: "Max 10MB.", variant: "destructive" });
        return;
      }
      console.log("[MediScan] Upload page file selected", {
        name: file.name,
        type: file.type,
        size: file.size,
        lastModified: file.lastModified,
      });
      const reader = new FileReader();
      reader.onload = (ev) => {
        const data = ev.target?.result as string;
        setPreview(data);
        scanMedicine(data);
      };
      reader.readAsDataURL(file);
    },
    [scanMedicine, toast]
  );

  if (result?.medicine) {
    return (
      <div className="px-2 pt-4">
        <MedicineResult
          medicine={result.medicine}
          confidence={result.confidence}
          onBack={() => {
            clearResult();
            navigate("/");
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen px-5 pt-12 pb-32">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => navigate("/")}
          className="w-10 h-10 rounded-full glass flex items-center justify-center active:scale-95 transition"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Upload Image</h1>
          <p className="text-xs text-muted-foreground">Choose a medicine photo from your gallery</p>
        </div>
      </div>

      {/* Drop / preview zone */}
      <div className="glass rounded-[28px] p-6 flex flex-col items-center text-center">
        <div className="w-full aspect-square max-w-xs rounded-[24px] overflow-hidden flex items-center justify-center border border-white/40 bg-white/30 mb-5">
          {preview ? (
            <img src={preview} alt="Selected" className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center text-muted-foreground p-6">
              <ImagePlus className="w-10 h-10 mb-2 text-primary" strokeWidth={1.8} />
              <p className="text-sm font-medium text-foreground">No image selected</p>
              <p className="text-xs mt-1 max-w-[220px]">
                Pick a clear photo of the medicine label or packaging.
              </p>
            </div>
          )}
        </div>

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isScanning}
          className="w-full max-w-xs rounded-full py-3 font-semibold text-white shadow-glow active:scale-95 transition disabled:opacity-60 flex items-center justify-center gap-2"
          style={{ background: "var(--gradient-primary)" }}
        >
          {isScanning ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Analyzing...
            </>
          ) : preview ? (
            "Choose another image"
          ) : (
            "Choose from Gallery"
          )}
        </button>

        <p className="text-[11px] text-muted-foreground mt-3 max-w-[260px]">
          We never use your camera on this page. Photos are processed securely for medicine
          identification only.
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
      <ScanningOverlay isVisible={isScanning} />
    </div>
  );
};

export default UploadImage;
