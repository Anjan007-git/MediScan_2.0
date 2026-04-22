import { useRef, useCallback, useState, useEffect } from "react";
import { X, Camera, RotateCcw } from "lucide-react";

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
      console.error("Camera error:", err);
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
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, startCamera]);

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

  useEffect(() => {
    if (isOpen && !stream) {
      startCamera();
    }
  }, [facingMode, isOpen, stream, startCamera]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-foreground z-50 flex flex-col animate-fade-in-up">
      {/* Glass header */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4">
        <button
          onClick={onClose}
          className="w-11 h-11 rounded-full glass-dark flex items-center justify-center active:scale-95 transition-transform"
        >
          <X className="w-5 h-5 text-white" />
        </button>
        <div className="glass-dark rounded-full px-5 py-2">
          <span className="text-white font-semibold text-sm tracking-wide">Scan Medicine</span>
        </div>
        <button
          onClick={toggleCamera}
          className="w-11 h-11 rounded-full glass-dark flex items-center justify-center active:scale-95 transition-transform"
        >
          <RotateCcw className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Camera View */}
      <div className="flex-1 relative">
        {error ? (
          <div className="absolute inset-0 flex items-center justify-center bg-foreground p-6">
            <div className="glass-dark rounded-3xl p-6 text-center max-w-sm">
              <p className="text-white mb-4">{error}</p>
              <button
                onClick={startCamera}
                className="liquid-button px-6 py-3 rounded-full font-semibold"
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
              <div className="w-72 h-72 rounded-[32px] relative">
                <div className="absolute -top-1 -left-1 w-10 h-10 border-t-[3px] border-l-[3px] border-primary-glow rounded-tl-[28px]" />
                <div className="absolute -top-1 -right-1 w-10 h-10 border-t-[3px] border-r-[3px] border-primary-glow rounded-tr-[28px]" />
                <div className="absolute -bottom-1 -left-1 w-10 h-10 border-b-[3px] border-l-[3px] border-primary-glow rounded-bl-[28px]" />
                <div className="absolute -bottom-1 -right-1 w-10 h-10 border-b-[3px] border-r-[3px] border-primary-glow rounded-br-[28px]" />

                {/* Scanning Line */}
                <div className="absolute left-3 right-3 h-0.5 bg-primary-glow shadow-glow animate-scan-line" />
              </div>
            </div>

            <div className="absolute bottom-32 left-0 right-0 flex justify-center px-6">
              <div className="glass-dark rounded-full px-5 py-2.5">
                <p className="text-white/90 text-sm font-medium">
                  Position the medicine within the frame
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Glass capture button */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center">
        <button
          onClick={handleCapture}
          className="relative w-20 h-20 rounded-full flex items-center justify-center active:scale-95 transition-transform shadow-float"
        >
          <div className="absolute inset-0 rounded-full glass-strong" />
          <div className="absolute inset-1.5 rounded-full glass-icon flex items-center justify-center">
            <Camera className="w-8 h-8 text-white drop-shadow-md" strokeWidth={2.2} />
          </div>
        </button>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default CameraCapture;
