import { useRef, useCallback, useState } from "react";
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

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file.",
        variant: "destructive",
      });
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onload = async (e) => {
      const imageData = e.target?.result as string;
      await scanMedicine(imageData);
    };
    reader.readAsDataURL(file);

    // Reset input
    event.target.value = "";
  }, [scanMedicine, toast]);

  const handleBack = useCallback(() => {
    clearResult();
  }, [clearResult]);

  // Show error toast if scan fails
  if (error) {
    toast({
      title: "Scan Failed",
      description: error,
      variant: "destructive",
    });
  }

  return (
    <div className="min-h-screen pb-8">
      {/* Header - Always visible */}
      <Header />

      {/* Main Content */}
      {result ? (
        <MedicineResult medicine={result} onBack={handleBack} />
      ) : (
        <>
          <ScanCard onScanClick={handleScanClick} onUploadClick={handleUploadClick} />
          <FeatureCards />
        </>
      )}

      {/* Hidden file input for upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileUpload}
      />

      {/* Camera Modal */}
      <CameraCapture
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCapture}
      />

      {/* Scanning Overlay */}
      <ScanningOverlay isVisible={isScanning} />
    </div>
  );
};

export default Index;
