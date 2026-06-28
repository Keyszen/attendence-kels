import React, { useEffect, useRef, useState } from "react";
import { Camera, RefreshCw, Check, X } from "lucide-react";
import { cn } from "../lib/utils";

interface WebcamCaptureProps {
  onCapture: (base64: string) => void;
  className?: string;
}

export function WebcamCapture({ onCapture, className }: WebcamCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>("");
  const [preview, setPreview] = useState<string | null>(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setError("");
      setPreview(null);
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Gagal mengakses kamera. Pastikan Anda telah memberikan izin.");
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const capture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      const maxWidth = 640;
      let width = video.videoWidth;
      let height = video.videoHeight;

      if (width > maxWidth) {
        const ratio = maxWidth / width;
        width = maxWidth;
        height = height * ratio;
      }

      canvas.width = width;
      canvas.height = height;

      const context = canvas.getContext("2d");
      if (context) {
        context.translate(width, 0);
        context.scale(-1, 1);
        context.drawImage(video, 0, 0, width, height);
        const base64 = canvas.toDataURL("image/jpeg", 0.6);

        setPreview(base64);
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
          setStream(null);
        }
      }
    }
  };

  const handleRetake = () => {
    setPreview(null);
    startCamera();
  };

  const handleSubmit = () => {
    if (preview) {
      onCapture(preview);
    }
  };

  return (
    <div className={cn("relative flex flex-col items-center", className)}>
      {error ? (
        <div className="bg-red-900/30 text-red-400 p-4 rounded-xl text-sm text-center mb-4 border border-red-500/50">
          {error}
          <button
            onClick={startCamera}
            className="mt-2 flex items-center justify-center space-x-2 text-sm font-medium mx-auto text-red-300 hover:underline"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Coba Lagi</span>
          </button>
        </div>
      ) : preview ? (
        <div className="relative w-full max-w-sm aspect-[3/4] overflow-hidden rounded-3xl bg-[#1A1A1A] shadow-sm border border-[#333]">
          <img src={preview} alt="Preview" className="w-full h-full object-cover" />
          <div className="absolute bottom-6 left-0 w-full flex justify-center space-x-4 px-4">
            <button
              onClick={handleRetake}
              className="flex items-center justify-center w-14 h-14 bg-red-500/20 text-red-500 border border-red-500/50 rounded-full hover:bg-red-500/30 transition-colors backdrop-blur-sm"
              aria-label="Ulangi"
            >
              <X className="w-6 h-6" />
            </button>
            <button
              onClick={handleSubmit}
              className="flex items-center justify-center w-14 h-14 bg-green-500/20 text-green-500 border border-green-500/50 rounded-full hover:bg-green-500/30 transition-colors backdrop-blur-sm"
              aria-label="Gunakan Foto"
            >
              <Check className="w-6 h-6" />
            </button>
          </div>
        </div>
      ) : (
        <div className="relative w-full max-w-sm aspect-[3/4] overflow-hidden rounded-3xl bg-[#1A1A1A] shadow-sm border border-[#333]">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="object-cover w-full h-full transform -scale-x-100"
          />
          <button
            onClick={capture}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center justify-center w-16 h-16 bg-[#C8B6A6] rounded-full text-black hover:scale-105 active:scale-95 transition-transform shadow-[0_0_15px_rgba(200,182,166,0.4)] focus:outline-none"
            aria-label="Ambil Foto"
          >
            <Camera className="w-8 h-8" />
          </button>
        </div>
      )}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
