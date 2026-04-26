import { useRef, useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Zap,
  ZapOff,
  HelpCircle,
  Sparkles,
  Calendar,
  Image as ImageIcon,
  Camera,
  RotateCw,
} from "lucide-react";
import { useMedicineScanner } from "@/hooks/useMedicineScanner";
import { useToast } from "@/hooks/use-toast";
import MedicineResult from "@/components/MedicineResult";
import ScanningOverlay from "@/components/ScanningOverlay";

type PackType = "Box" | "Blister" | "Bottle";
const PACK_TYPES: PackType[] = ["Box", "Blister", "Bottle"];

const Scan = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { isScanning, result, error, scanMedicine, clearResult } = useMedicineScanner();

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [flashOn, setFlashOn] = useState(false);
  const [packType, setPackType] = useState<PackType>("Box");
  const [showHelp, setShowHelp] = useState(false);

  // Apply dark-mode body styling for this immersive screen
  useEffect(() => {
    document.body.classList.add("scan-dark-mode");
    return () => document.body.classList.remove("scan-dark-mode");
  }, []);

  const startCamera = useCallback(async () => {
    try {
      setCameraError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      if (videoRef.current) videoRef.current.srcObject = mediaStream;
      setStream(mediaStream);
    } catch (err) {
      console.error("Camera error:", err);
      setCameraError("Camera unavailable. Use the gallery upload instead.");
    }
  }, [facingMode]);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      setStream(null);
    }
  }, [stream]);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facingMode]);

  // Toggle torch (works on supported devices)
  useEffect(() => {
    if (!stream) return;
    const track = stream.getVideoTracks()[0];
    const caps = track.getCapabilities?.() as any;
    if (caps?.torch) {
      track.applyConstraints({ advanced: [{ torch: flashOn }] } as any).catch(() => {});
    }
  }, [flashOn, stream]);

  // Auto-trigger upload from query param
  useEffect(() => {
    if (searchParams.get("upload") === "1") {
      setTimeout(() => fileInputRef.current?.click(), 150);
    }
  }, [searchParams]);

  useEffect(() => {
    if (error) toast({ title: "Scan Failed", description: error, variant: "destructive" });
  }, [error, toast]);

  const handleCapture = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    const imageData = canvas.toDataURL("image/jpeg", 0.85);
    scanMedicine(imageData);
  }, [scanMedicine]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file type", description: "Please upload an image.", variant: "destructive" });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max 10MB.", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => scanMedicine(ev.target?.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // If we have a result, render result on light bg
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
    <div className="fixed inset-0 z-30 bg-[#0a0e1a] text-white overflow-hidden">
      {/* Live camera feed (or fallback dark bg) */}
      {stream && !cameraError ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0e1a] via-[#0f1729] to-[#0a0e1a]">
          {/* Subtle ambient blue glow */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full bg-primary/10 blur-[120px]" />
        </div>
      )}

      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/40 pointer-events-none" />

      {/* CONTENT */}
      <div className="relative h-full flex flex-col">
        {/* TOP BAR */}
        <header className="flex items-start justify-between px-5 pt-12 pb-4">
          <button
            onClick={() => setFlashOn((v) => !v)}
            className="flex flex-col items-center gap-1 active:scale-95 transition"
            aria-label="Toggle flash"
          >
            <div
              className={`w-11 h-11 rounded-full glass-dark flex items-center justify-center ${
                flashOn ? "shadow-[0_0_20px_rgba(59,130,246,0.6)] bg-primary/30" : ""
              }`}
            >
              {flashOn ? (
                <Zap className="w-5 h-5 text-primary-glow" strokeWidth={2.4} fill="currentColor" />
              ) : (
                <ZapOff className="w-5 h-5 text-white" strokeWidth={2.2} />
              )}
            </div>
            <span className="text-[11px] font-medium text-white/80">Flash</span>
          </button>

          <div className="text-center pt-1">
            <h1 className="text-xl font-bold tracking-tight">Scan Medicine</h1>
            <p className="text-[13px] text-white/70 mt-0.5">Position the medicine in the frame</p>
          </div>

          <button
            onClick={() => setShowHelp((v) => !v)}
            className="flex flex-col items-center gap-1 active:scale-95 transition"
            aria-label="Help"
          >
            <div className="w-11 h-11 rounded-full glass-dark flex items-center justify-center">
              <HelpCircle className="w-5 h-5 text-white" strokeWidth={2.2} />
            </div>
            <span className="text-[11px] font-medium text-white/80">Help</span>
          </button>
        </header>

        {/* AI HINT PILL */}
        <div className="flex justify-center px-5">
          <div className="glass-dark rounded-full px-4 py-2 inline-flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-primary-glow" strokeWidth={2.6} fill="currentColor" />
            <span className="text-[12px] font-medium text-white/90">
              AI will detect medicine details automatically
            </span>
          </div>
        </div>

        {/* SCAN FRAME */}
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="relative w-full max-w-[340px] aspect-square rounded-[28px]">
            {/* Glowing corner brackets */}
            <CornerBracket className="top-0 left-0 border-t-[3px] border-l-[3px] rounded-tl-[28px]" />
            <CornerBracket className="top-0 right-0 border-t-[3px] border-r-[3px] rounded-tr-[28px]" />
            <CornerBracket className="bottom-0 left-0 border-b-[3px] border-l-[3px] rounded-bl-[28px]" />
            <CornerBracket className="bottom-0 right-0 border-b-[3px] border-r-[3px] rounded-br-[28px]" />

            {/* Animated scanning line */}
            <div className="absolute left-2 right-2 h-[2px] bg-primary-glow rounded-full animate-scan-sweep shadow-[0_0_20px_rgba(96,165,250,0.9),0_0_40px_rgba(59,130,246,0.6)]" />
          </div>
        </div>

        {/* INSTRUCTION CARD */}
        <div className="px-6 pb-3 flex justify-center">
          <div className="glass-dark rounded-full px-4 py-3 inline-flex items-center gap-3 max-w-sm">
            <div className="w-9 h-9 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center shrink-0">
              <Calendar className="w-4 h-4 text-primary-glow" strokeWidth={2.4} />
            </div>
            <p className="text-[12px] leading-snug text-white/90">
              Make sure the text on the medicine box is clear and not blurred.
            </p>
          </div>
        </div>

        {/* CONTROLS */}
        <div className="px-8 pb-3">
          <div className="flex items-center justify-between max-w-sm mx-auto">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center gap-1.5 active:scale-95 transition"
            >
              <div className="w-12 h-12 rounded-full glass-dark flex items-center justify-center">
                <ImageIcon className="w-5 h-5 text-white" strokeWidth={2.2} />
              </div>
              <span className="text-[11px] text-white/80 font-medium">Gallery</span>
            </button>

            {/* CAPTURE */}
            <button
              onClick={handleCapture}
              disabled={isScanning}
              className="relative w-[78px] h-[78px] rounded-full active:scale-95 transition disabled:opacity-60"
              aria-label="Capture"
            >
              <div className="absolute inset-0 rounded-full border-[3px] border-white/90 shadow-[0_0_30px_rgba(96,165,250,0.7)]" />
              <div
                className="absolute inset-[6px] rounded-full flex items-center justify-center shadow-[0_0_24px_rgba(59,130,246,0.8)]"
                style={{ background: "var(--gradient-primary)" }}
              >
                <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/25 to-transparent" />
                <Camera className="relative w-8 h-8 text-white" strokeWidth={2.2} />
              </div>
            </button>

            <button
              onClick={() => setFacingMode((m) => (m === "environment" ? "user" : "environment"))}
              className="flex flex-col items-center gap-1.5 active:scale-95 transition"
            >
              <div className="w-12 h-12 rounded-full glass-dark flex items-center justify-center">
                <RotateCw className="w-5 h-5 text-white" strokeWidth={2.2} />
              </div>
              <span className="text-[11px] text-white/80 font-medium">Flip</span>
            </button>
          </div>
        </div>

        {/* TYPE SELECTOR */}
        <div className="pb-24 flex justify-center px-6">
          <div className="glass-dark rounded-full p-1 inline-flex">
            {PACK_TYPES.map((t) => {
              const active = packType === t;
              return (
                <button
                  key={t}
                  onClick={() => setPackType(t)}
                  className={`px-5 py-2 rounded-full text-[13px] font-semibold transition-all ${
                    active
                      ? "bg-primary/30 text-primary-glow shadow-[inset_0_0_0_1px_rgba(96,165,250,0.4)]"
                      : "text-white/70"
                  }`}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* HELP SHEET */}
      {showHelp && (
        <div
          className="absolute inset-0 z-40 bg-black/60 backdrop-blur-md flex items-end animate-fade-in-up"
          onClick={() => setShowHelp(false)}
        >
          <div
            className="w-full glass-dark rounded-t-[28px] p-6 pb-10 border-t border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold mb-3">Scanning Tips</h3>
            <ul className="space-y-2 text-sm text-white/80">
              <li>• Hold your device steady, ~15cm from the medicine</li>
              <li>• Ensure good lighting — turn on flash if dim</li>
              <li>• Capture the full label or packaging</li>
              <li>• Avoid glare and reflections</li>
            </ul>
            <button
              onClick={() => setShowHelp(false)}
              className="mt-5 w-full rounded-full py-3 font-semibold text-white shadow-glow"
              style={{ background: "var(--gradient-primary)" }}
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* CAMERA ERROR BANNER */}
      {cameraError && (
        <div className="absolute top-32 left-5 right-5 z-30 glass-dark rounded-2xl p-4 border border-warning/30">
          <p className="text-sm text-white/90">{cameraError}</p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileUpload}
      />
      <canvas ref={canvasRef} className="hidden" />
      <ScanningOverlay isVisible={isScanning} />
    </div>
  );
};

const CornerBracket = ({ className }: { className: string }) => (
  <span
    className={`absolute w-12 h-12 border-primary-glow shadow-[0_0_16px_rgba(96,165,250,0.8)] ${className}`}
    style={{ borderColor: "hsl(213 94% 75%)" }}
  />
);

export default Scan;
