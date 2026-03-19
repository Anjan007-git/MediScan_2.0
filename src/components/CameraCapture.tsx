import { useRef, useCallback, useState, useEffect } from "react";
import { X, Camera, RotateCcw, Shield } from "lucide-react";
import { Link } from "react-router-dom";

const CONSENT_KEY = "mediscan_camera_consent";

interface CameraCaptureProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (imageData: string) => void;
}

const CameraCapture = ({ isOpen, onClose, onCapture }: CameraCaptureProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [hasConsent, setHasConsent] = useState(() => localStorage.getItem(CONSENT_KEY) === "true");

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setStream(mediaStream);
    } catch (err) {
      setError("Unable to access camera. Please check permissions and try again.");
    }
  }, [facingMode]);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  }, [stream]);

  useEffect(() => {
    if (isOpen && hasConsent) {
      startCamera();
    } else if (!isOpen) {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, hasConsent, startCamera]);

  useEffect(() => {
    if (isOpen && hasConsent && !stream) {
      startCamera();
    }
  }, [facingMode, isOpen, hasConsent, stream, startCamera]);

  const handleConsent = () => {
    localStorage.setItem(CONSENT_KEY, "true");
    setHasConsent(true);
  };

  const handleCapture = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL("image/jpeg", 0.8);
        onCapture(imageData);
      }
    }
  }, [onCapture]);

  const toggleCamera = () => {
    stopCamera();
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  };

  if (!isOpen) return null;

  // Consent screen
  if (!hasConsent) {
    return (
      <div className="fixed inset-0 bg-foreground/95 z-50 flex items-center justify-center p-6">
        <div className="bg-card rounded-2xl p-6 max-w-sm w-full shadow-card-hover animate-fade-in">
          <div className="flex items-center justify-center mb-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Shield className="w-7 h-7 text-primary" />
            </div>
          </div>
          <h3 className="text-lg font-bold text-foreground text-center mb-2">
            Camera Access Required
          </h3>
          <p className="text-muted-foreground text-sm text-center leading-relaxed mb-4">
            MediScan needs camera access to scan your medicine. Your images are processed <strong className="text-foreground">locally on your device</strong> and are never stored or transmitted to any server.
          </p>
          <ul className="text-muted-foreground text-xs space-y-1.5 mb-5">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">✓</span> Images stay on your device
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">✓</span> No data sent to external servers
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">✓</span> Camera stops when you close the scanner
            </li>
          </ul>
          <button
            onClick={handleConsent}
            className="w-full gradient-teal text-primary-foreground rounded-xl py-3.5 font-semibold text-sm shadow-card hover:shadow-card-hover transition-all active:scale-[0.98] mb-3"
          >
            I Understand — Continue
          </button>
          <button
            onClick={onClose}
            className="w-full text-muted-foreground text-sm py-2 hover:text-foreground transition-colors"
          >
            Cancel
          </button>
          <Link
            to="/privacy"
            onClick={onClose}
            className="block text-center text-xs text-primary hover:underline mt-3"
          >
            Read our Privacy Policy
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-foreground z-50 flex flex-col">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-foreground/80 to-transparent">
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-card/20 backdrop-blur-sm flex items-center justify-center"
        >
          <X className="w-5 h-5 text-primary-foreground" />
        </button>
        <span className="text-primary-foreground font-medium">Scan Medicine</span>
        <button
          onClick={toggleCamera}
          className="w-10 h-10 rounded-full bg-card/20 backdrop-blur-sm flex items-center justify-center"
        >
          <RotateCcw className="w-5 h-5 text-primary-foreground" />
        </button>
      </div>

      {/* Camera View */}
      <div className="flex-1 relative">
        {error ? (
          <div className="absolute inset-0 flex items-center justify-center bg-foreground p-6">
            <div className="text-center">
              <p className="text-primary-foreground mb-4">{error}</p>
              <button
                onClick={startCamera}
                className="gradient-teal text-primary-foreground px-6 py-3 rounded-xl font-medium"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            {/* Scan Frame Overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-64 h-64 border-2 border-primary rounded-3xl relative">
                <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-xl" />
                <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-xl" />
                <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-xl" />
                <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-xl" />
                <div className="absolute left-2 right-2 h-0.5 bg-primary animate-scan-line" />
              </div>
            </div>
            <p className="absolute bottom-32 left-0 right-0 text-center text-primary-foreground/80 text-sm">
              Position the medicine within the frame
            </p>
          </>
        )}
      </div>

      {/* Capture Button */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center">
        <button
          onClick={handleCapture}
          className="w-20 h-20 rounded-full gradient-teal flex items-center justify-center shadow-card-hover active:scale-95 transition-transform"
        >
          <Camera className="w-8 h-8 text-primary-foreground" />
        </button>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default CameraCapture;
