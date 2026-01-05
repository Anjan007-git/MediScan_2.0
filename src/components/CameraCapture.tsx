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
                
                {/* Scanning Line */}
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
