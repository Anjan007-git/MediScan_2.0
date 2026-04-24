import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Camera, Upload, X, RotateCcw, Zap, ZapOff, ImageIcon } from "lucide-react";
import { useMedicineScanner } from "@/hooks/useMedicineScanner";
import { fromAiResult } from "@/lib/medicineApi";
import { addHistory, canScan, getWeeklyScanCount, getScanLimit, getPlan, recordScan } from "@/lib/storage";
import { toast } from "sonner";

const Scan = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showLimitModal, setShowLimitModal] = useState(false);

  const { isScanning, result, error, scanMedicine, clearResult } = useMedicineScanner();

  const startCamera = useCallback(async () => {
    try {
      setCameraError(null);
      const m = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      if (videoRef.current) videoRef.current.srcObject = m;
      setStream(m);
    } catch (e) {
      console.error(e);
      setCameraError("Camera unavailable. You can upload an image instead.");
    }
  }, [facingMode]);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      setStream(null);
    }
  }, [stream]);

  useEffect(() => {
    if (params.get("upload") === "1") {
      setTimeout(() => fileInputRef.current?.click(), 100);
    } else {
      startCamera();
    }
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facingMode]);

  const beginScan = async (imgData: string) => {
    if (!canScan()) {
      setShowLimitModal(true);
      return;
    }
    setImagePreview(imgData);
    stopCamera();
    recordScan();
    await scanMedicine(imgData);
  };

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const v = videoRef.current;
    const c = canvasRef.current;
    c.width = v.videoWidth;
    c.height = v.videoHeight;
    c.getContext("2d")?.drawImage(v, 0, 0);
    const data = c.toDataURL("image/jpeg", 0.8);
    beginScan(data);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) return toast.error("Please upload an image file");
    if (f.size > 10 * 1024 * 1024) return toast.error("Image must be under 10 MB");
    const r = new FileReader();
    r.onload = (ev) => beginScan(ev.target?.result as string);
    r.readAsDataURL(f);
    e.target.value = "";
  };

  // navigate to result when scan succeeds
  useEffect(() => {
    if (result?.medicine) {
      const med = fromAiResult(result.medicine);
      const item = addHistory({
        medicine: med,
        imagePreview: imagePreview || undefined,
        confidence: result.confidence,
        source: "scan",
      });
      clearResult();
      navigate(`/medicine/${item.id}`);
    }
  }, [result, imagePreview, clearResult, navigate]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  return (
    <div className="fixed inset-0 z-30 bg-black flex flex-col">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4 pt-5">
        <button
          onClick={() => navigate("/")}
          className="w-11 h-11 rounded-full glass-dark flex items-center justify-center active:scale-95"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-white" />
        </button>
        <div className="glass-dark rounded-full px-5 py-2">
          <span className="text-white font-semibold text-sm tracking-wide">Scan Medicine</span>
        </div>
        <button
          onClick={() => {
            stopCamera();
            setFacingMode((p) => (p === "environment" ? "user" : "environment"));
          }}
          className="w-11 h-11 rounded-full glass-dark flex items-center justify-center active:scale-95"
          aria-label="Switch camera"
        >
          <RotateCcw className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Camera view */}
      <div className="flex-1 relative">
        {cameraError ? (
          <div className="absolute inset-0 flex items-center justify-center p-6">
            <div className="glass-dark rounded-3xl p-6 text-center max-w-sm">
              <ImageIcon className="w-10 h-10 text-white/80 mx-auto mb-3" />
              <p className="text-white mb-4 text-sm">{cameraError}</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-white px-6 py-3 rounded-full font-semibold shadow-glow inline-flex items-center gap-2"
                style={{ background: "var(--gradient-primary)" }}
              >
                <Upload className="w-4 h-4" /> Upload Image
              </button>
            </div>
          </div>
        ) : (
          <>
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />

            {/* Scan frame */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-72 h-72 max-w-[80vw] max-h-[60vh] rounded-[32px] relative">
                <div className="absolute -top-1 -left-1 w-10 h-10 border-t-[3px] border-l-[3px] border-primary-glow rounded-tl-[28px]" />
                <div className="absolute -top-1 -right-1 w-10 h-10 border-t-[3px] border-r-[3px] border-primary-glow rounded-tr-[28px]" />
                <div className="absolute -bottom-1 -left-1 w-10 h-10 border-b-[3px] border-l-[3px] border-primary-glow rounded-bl-[28px]" />
                <div className="absolute -bottom-1 -right-1 w-10 h-10 border-b-[3px] border-r-[3px] border-primary-glow rounded-br-[28px]" />
                <div className="absolute left-3 right-3 h-0.5 bg-primary-glow shadow-glow animate-scan-line" />
              </div>
            </div>

            <div className="absolute bottom-44 left-0 right-0 flex justify-center px-6">
              <div className="glass-dark rounded-full px-5 py-2.5">
                <p className="text-white/90 text-xs font-medium">
                  Position the medicine within the frame
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Bottom controls */}
      <div className="absolute bottom-10 left-0 right-0 flex items-center justify-around px-8">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-14 h-14 rounded-2xl glass-dark flex items-center justify-center active:scale-95"
          aria-label="Upload image"
        >
          <Upload className="w-5 h-5 text-white" />
        </button>

        <button
          onClick={handleCapture}
          disabled={!stream || isScanning}
          className="relative w-20 h-20 rounded-full flex items-center justify-center active:scale-95 transition-transform shadow-float disabled:opacity-60"
          aria-label="Capture"
        >
          <div className="absolute inset-0 rounded-full glass-strong" />
          <div
            className="absolute inset-1.5 rounded-full overflow-hidden glossy flex items-center justify-center"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Camera className="relative w-8 h-8 text-white" strokeWidth={2.2} />
          </div>
        </button>

        <div className="w-14 h-14" />
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
      <canvas ref={canvasRef} className="hidden" />

      {/* Scanning loader */}
      {isScanning && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-md animate-fade-in-up">
          <div className="glass-strong rounded-[32px] p-7 mx-6 max-w-xs w-full flex flex-col items-center gap-4 animate-scale-in">
            {imagePreview && (
              <div className="w-24 h-24 rounded-2xl overflow-hidden glass-subtle p-1">
                <img src={imagePreview} alt="" className="w-full h-full object-cover rounded-xl" />
              </div>
            )}
            <div className="text-center">
              <h3 className="text-lg font-bold text-foreground mb-1">Analyzing medicine…</h3>
              <p className="text-xs text-muted-foreground">AI is identifying your image</p>
            </div>
            <div className="w-full h-1.5 rounded-full bg-white/40 overflow-hidden">
              <div
                className="h-full rounded-full animate-pulse-soft"
                style={{ background: "var(--gradient-primary)", width: "80%" }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Limit modal */}
      {showLimitModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-6">
          <div className="glass-strong rounded-[28px] p-6 max-w-sm w-full text-center animate-scale-in">
            <div
              className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center text-white shadow-glow"
              style={{ background: "var(--gradient-primary)" }}
            >
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-1">Weekly limit reached</h3>
            <p className="text-sm text-muted-foreground mb-4">
              You've used {getWeeklyScanCount()}/{getScanLimit()} free scans this week. Upgrade to
              Premium for unlimited scans.
            </p>
            <button
              onClick={() => {
                setShowLimitModal(false);
                navigate("/settings");
              }}
              className="w-full rounded-full py-3 font-semibold text-white shadow-glow"
              style={{ background: "var(--gradient-primary)" }}
            >
              Upgrade to Premium
            </button>
            <button
              onClick={() => setShowLimitModal(false)}
              className="w-full mt-2 py-2.5 text-sm font-semibold text-muted-foreground"
            >
              Not now
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Scan;
