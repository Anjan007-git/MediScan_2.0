import { useRef, useCallback, useEffect, useState } from "react";
import Header from "@/components/Header";
import ScanCard from "@/components/ScanCard";
import FeatureCards from "@/components/FeatureCards";
import CameraCapture from "@/components/CameraCapture";
import ScanningOverlay from "@/components/ScanningOverlay";
import MedicineResult from "@/components/MedicineResult";
import { useMedicineScanner } from "@/hooks/useMedicineScanner";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { isScanning, result, error, scanMedicine, clearResult } = useMedicineScanner();

  const handleScanClick = useCallback(() => {
    setIsCameraOpen(true);
  }, []);

  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleCapture = useCallback(async (imageData: string) => {
    setIsCameraOpen(false);
    await scanMedicine(imageData);
  }, [scanMedicine]);

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image under 10MB.",
        variant: "destructive",
      });
      return;
    }

    console.log("[MediScan] Upload selected", {
      name: file.name,
      type: file.type,
      size: file.size,
      lastModified: file.lastModified,
    });

    const reader = new FileReader();
    reader.onload = async (e) => {
      const imageData = e.target?.result as string;
      await scanMedicine(imageData);
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  }, [scanMedicine, toast]);

  const handleBack = useCallback(() => {
    clearResult();
  }, [clearResult]);

  // Show error toast if scan fails
  useEffect(() => {
    if (error) {
      toast({
        title: "Scan Failed",
        description: error,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  return (
    <div className="min-h-screen pb-8">
      <Header />

      {result?.medicine ? (
        <MedicineResult 
          medicine={result.medicine} 
          confidence={result.confidence} 
          onBack={handleBack} 
        />
      ) : (
        <>
          <ScanCard onScanClick={handleScanClick} onUploadClick={handleUploadClick} />
          <FeatureCards />
        </>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileUpload}
      />

      <CameraCapture
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCapture}
      />

      <ScanningOverlay isVisible={isScanning} />
    </div>
  );
};

export default Index;
