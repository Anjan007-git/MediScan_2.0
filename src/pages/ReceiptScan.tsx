import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Camera,
  Image as ImageIcon,
  Loader2,
  RotateCw,
  Upload,
  ScanLine,
  CheckCircle2,
  Zap,
  ZapOff,
} from "lucide-react";
import Tesseract from "tesseract.js";
import { useAppStore } from "@/store/appStore";
import { useToast } from "@/hooks/use-toast";
import { consumeScan } from "@/lib/premium";
import LimitReachedModal from "@/components/LimitReachedModal";

interface ParsedReceipt {
  pharmacyName: string;
  date: string;
  dateTs: number;
  medicines: string[];
  totalAmount: number;
  rawText: string;
}

/** Simple but effective OCR receipt parser. */
const parseReceipt = (rawText: string): ParsedReceipt => {
  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  // Pharmacy name = first non-empty line that looks like a name (letters)
  const pharmacyName =
    lines.find((l) => /[A-Za-z]{3,}/.test(l) && !/total|invoice|receipt|bill/i.test(l)) ||
    lines[0] ||
    "Pharmacy";

  // Date detection
  const dateMatch = rawText.match(
    /\b(\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4}|\d{4}[\/\-.]\d{1,2}[\/\-.]\d{1,2})\b/
  );
  let dateStr = dateMatch ? dateMatch[1] : "";
  let dateTs = Date.now();
  if (dateStr) {
    const t = Date.parse(dateStr.replace(/\./g, "/"));
    if (!isNaN(t)) dateTs = t;
  }

  // Total detection — priority: Grand Total > Net Amount > Amount Payable > Total
  const priorityRegexes = [
    /grand\s*total[^\d]*([\d,]+\.?\d*)/i,
    /net\s*amount[^\d]*([\d,]+\.?\d*)/i,
    /amount\s*payable[^\d]*([\d,]+\.?\d*)/i,
    /total\s*amount[^\d]*([\d,]+\.?\d*)/i,
    /\btotal\b[^\d]*([\d,]+\.?\d*)/i,
  ];
  let totalAmount = 0;
  for (const rx of priorityRegexes) {
    const m = rawText.match(rx);
    if (m) {
      totalAmount = parseFloat(m[1].replace(/,/g, ""));
      if (!isNaN(totalAmount) && totalAmount > 0) break;
    }
  }
  // Fallback: pick the largest currency-looking value
  if (!totalAmount) {
    const nums = Array.from(rawText.matchAll(/(\d{1,3}(?:,\d{3})*(?:\.\d{1,2}))|\d+\.\d{2}/g))
      .map((m) => parseFloat((m[1] || m[0]).replace(/,/g, "")))
      .filter((n) => !isNaN(n));
    if (nums.length) totalAmount = Math.max(...nums);
  }

  // Medicines: lines with letters that aren't headers/totals
  const medicines: string[] = [];
  for (const l of lines) {
    if (
      /[A-Za-z]{4,}/.test(l) &&
      !/total|amount|payable|invoice|receipt|bill|pharma|address|phone|gst|tax|date|cash|change/i.test(
        l
      ) &&
      l.length < 60
    ) {
      // Strip price suffix
      const cleaned = l.replace(/[\d.,₹$]+$/g, "").trim();
      if (cleaned.length > 3) medicines.push(cleaned);
    }
    if (medicines.length >= 8) break;
  }

  return {
    pharmacyName,
    date: dateStr || new Date(dateTs).toLocaleDateString(),
    dateTs,
    medicines,
    totalAmount: totalAmount || 0,
    rawText,
  };
};

const ReceiptScan = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addReceipt } = useAppStore();

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [camReady, setCamReady] = useState(false);
  const [camError, setCamError] = useState<string>("");
  const [preview, setPreview] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [parsed, setParsed] = useState<ParsedReceipt | null>(null);
  const [flashOn, setFlashOn] = useState(false);
  const [limitOpen, setLimitOpen] = useState(false);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  const startCamera = useCallback(async () => {
    stopCamera();
    setCamError("");
    setCamReady(false);
    if (!navigator.mediaDevices?.getUserMedia) {
      setCamError("Camera not supported on this device.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        try {
          await videoRef.current.play();
        } catch {/* */}
      }
      setCamReady(true);
    } catch (e: any) {
      setCamError(e?.message || "Unable to access camera.");
    }
  }, [stopCamera]);

  useEffect(() => {
    if (!preview) startCamera();
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preview]);

  // Torch toggle
  useEffect(() => {
    const stream = streamRef.current;
    if (!stream || !camReady) return;
    const track = stream.getVideoTracks()[0];
    const caps = track?.getCapabilities?.() as any;
    if (caps?.torch) {
      track.applyConstraints({ advanced: [{ torch: flashOn }] } as any).catch(() => {});
    }
  }, [flashOn, camReady]);

  const runOCR = useCallback(
    async (imageData: string) => {
      setProcessing(true);
      setProgress(0);
      try {
        const { data } = await Tesseract.recognize(imageData, "eng", {
          logger: (m) => {
            if (m.status === "recognizing text") {
              setProgress(Math.round(m.progress * 100));
            }
          },
        });
        const result = parseReceipt(data.text);
        setParsed(result);
      } catch (e: any) {
        toast({
          title: "OCR failed",
          description: e?.message || "Could not read text from image.",
          variant: "destructive",
        });
      } finally {
        setProcessing(false);
      }
    },
    [toast]
  );

  const handleCapture = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !camReady) return;
    const v = videoRef.current;
    const c = canvasRef.current;
    c.width = v.videoWidth || 1280;
    c.height = v.videoHeight || 720;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(v, 0, 0);
    const data = c.toDataURL("image/jpeg", 0.85);
    setPreview(data);
    stopCamera();
    runOCR(data);
  }, [camReady, runOCR, stopCamera]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", variant: "destructive" });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max 10MB.", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const data = ev.target?.result as string;
      setPreview(data);
      stopCamera();
      runOCR(data);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!parsed) return;
    addReceipt({
      id: `r${Date.now()}`,
      pharmacy: parsed.pharmacyName,
      date: parsed.dateTs,
      total: parsed.totalAmount,
      items: parsed.medicines.map((m) => ({ name: m, qty: 1, price: 0 })),
      imageUrl: preview || undefined,
      medicines: parsed.medicines,
      rawText: parsed.rawText,
      dateText: parsed.date,
    });
    toast({
      title: "Receipt saved",
      description: `${parsed.pharmacyName} • ₹${parsed.totalAmount.toFixed(2)}`,
    });
    navigate("/receipts");
  };

  const handleRetake = () => {
    setPreview(null);
    setParsed(null);
    setProgress(0);
  };

  // ============== RESULT VIEW ==============
  if (parsed && preview) {
    return (
      <div className="min-h-screen px-5 pt-12 pb-32 bg-background">
        <header className="flex items-center gap-3 mb-5">
          <button
            onClick={handleRetake}
            className="w-11 h-11 rounded-full glass flex items-center justify-center active:scale-95"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" strokeWidth={2.4} />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">Receipt Details</h1>
            <p className="text-xs text-muted-foreground">Review extracted information</p>
          </div>
        </header>

        <div
          className="rounded-[24px] p-5 mb-4 shadow-lg"
          style={{
            background: "rgba(255,255,255,0.92)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.6)",
          }}
        >
          <img
            src={preview}
            alt="Receipt"
            className="w-full max-h-64 object-contain rounded-2xl border border-border/40 mb-4"
          />
          <div className="space-y-3">
            <Field label="Pharmacy / Store" value={parsed.pharmacyName} />
            <Field label="Date" value={parsed.date} />
            <div
              className="rounded-2xl p-4 flex items-center justify-between text-white shadow-glow"
              style={{ background: "var(--gradient-primary)" }}
            >
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider opacity-90">
                  Total Amount
                </p>
                <p className="text-3xl font-extrabold mt-0.5">
                  ₹
                  {parsed.totalAmount.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
              <CheckCircle2 className="w-9 h-9 opacity-90" strokeWidth={2.2} />
            </div>
            {parsed.medicines.length > 0 && (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Detected Items ({parsed.medicines.length})
                </p>
                <ul className="space-y-1.5">
                  {parsed.medicines.map((m, i) => (
                    <li
                      key={i}
                      className="text-sm text-foreground bg-muted/40 rounded-lg px-3 py-2"
                    >
                      {m}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleRetake}
            className="glass rounded-full py-3.5 font-semibold text-foreground active:scale-95"
          >
            Retake
          </button>
          <button
            onClick={handleSave}
            className="rounded-full py-3.5 font-bold text-white shadow-glow active:scale-95"
            style={{ background: "var(--gradient-primary)" }}
          >
            Save Receipt
          </button>
        </div>
      </div>
    );
  }

  // ============== SCANNER VIEW ==============
  return (
    <div className="fixed inset-0 z-30 bg-[#0a0e1a] text-white overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`absolute inset-0 w-full h-full object-cover transition-opacity ${
          camReady && !preview ? "opacity-100" : "opacity-0"
        }`}
      />
      {preview && (
        <img src={preview} alt="" className="absolute inset-0 w-full h-full object-cover" />
      )}
      {!camReady && !preview && (
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0e1a] via-[#0f1729] to-[#0a0e1a]" />
      )}
      <div className="absolute inset-0 bg-black/40" />

      <div className="relative h-full flex flex-col">
        <header className="flex items-center justify-between px-5 pt-12 pb-4">
          <button
            onClick={() => navigate("/receipts")}
            className="w-11 h-11 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center active:scale-95"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" strokeWidth={2.4} />
          </button>
          <div className="text-center">
            <h1 className="text-lg font-bold">Scan Receipt</h1>
            <p className="text-[12px] text-white/70 mt-0.5">Position receipt in the frame</p>
          </div>
          <button
            onClick={() => setFlashOn((v) => !v)}
            className={`w-11 h-11 rounded-full backdrop-blur-md flex items-center justify-center active:scale-95 border border-white/15 ${
              flashOn ? "bg-primary/30 shadow-[0_0_20px_rgba(59,130,246,0.6)]" : "bg-white/10"
            }`}
            aria-label="Toggle flash"
          >
            {flashOn ? (
              <Zap className="w-5 h-5 text-primary-glow" strokeWidth={2.4} fill="currentColor" />
            ) : (
              <ZapOff className="w-5 h-5 text-white" strokeWidth={2.2} />
            )}
          </button>
        </header>

        <div className="flex justify-center px-5 mb-2">
          <div className="bg-white/10 backdrop-blur-md rounded-full px-4 py-2 inline-flex items-center gap-2 border border-white/15">
            <ScanLine className="w-3.5 h-3.5 text-primary-glow" strokeWidth={2.6} />
            <span className="text-[12px] font-medium">OCR will extract pharmacy, date & total</span>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center px-6">
          <div className="relative w-full max-w-[340px] aspect-[3/4] rounded-[28px] border-2 border-white/40 overflow-hidden">
            {camReady && !preview && !processing && (
              <div className="absolute left-3 right-3 h-[2px] bg-primary-glow rounded-full animate-scan-sweep shadow-[0_0_20px_rgba(96,165,250,0.9)]" />
            )}
            {processing && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60">
                <Loader2 className="w-8 h-8 text-primary-glow animate-spin mb-3" />
                <p className="text-sm font-semibold">Reading receipt…</p>
                <p className="text-xs text-white/70 mt-1">{progress}%</p>
              </div>
            )}
            {camError && !preview && (
              <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
                <p className="text-sm text-white/90">{camError}</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-4 px-5 py-2.5 rounded-full bg-white/15 text-sm font-semibold"
                >
                  Upload from Gallery
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="px-8" style={{ paddingBottom: `calc(120px + env(safe-area-inset-bottom, 0px))` }}>
          <div className="flex items-center justify-between max-w-sm mx-auto">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center gap-1.5 active:scale-95"
              disabled={processing}
            >
              <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/15">
                <ImageIcon className="w-5 h-5 text-white" strokeWidth={2.2} />
              </div>
              <span className="text-[11px] text-white/80 font-medium">Gallery</span>
            </button>

            <button
              onClick={handleCapture}
              disabled={!camReady || processing}
              className="relative w-[78px] h-[78px] rounded-full active:scale-95 disabled:opacity-50"
              aria-label="Capture"
            >
              <div className="absolute inset-0 rounded-full border-[3px] border-white/90 shadow-[0_0_30px_rgba(96,165,250,0.6)]" />
              <div
                className="absolute inset-[6px] rounded-full flex items-center justify-center shadow-[0_0_24px_rgba(59,130,246,0.7)]"
                style={{ background: "var(--gradient-primary)" }}
              >
                <Camera className="w-8 h-8 text-white" strokeWidth={2.2} />
              </div>
            </button>

            <button
              onClick={startCamera}
              className="flex flex-col items-center gap-1.5 active:scale-95"
              disabled={processing}
            >
              <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/15">
                <RotateCw className="w-5 h-5 text-white" strokeWidth={2.2} />
              </div>
              <span className="text-[11px] text-white/80 font-medium">Reset</span>
            </button>
          </div>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

const Field = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-xl px-4 py-3 bg-muted/40 border border-border/40">
    <p className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">
      {label}
    </p>
    <p className="text-sm font-semibold text-foreground mt-0.5 break-words">
      {value || "—"}
    </p>
  </div>
);

export default ReceiptScan;
