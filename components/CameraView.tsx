
import React, { useRef, useEffect, useState, useCallback } from 'react';

interface CameraViewProps {
  onCapture: (image: string) => void;
  isScanning: boolean;
}

const CameraView: React.FC<CameraViewProps> = ({ onCapture, isScanning }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setHasPermission(true);
      } catch (err) {
        console.error("Error accessing camera:", err);
        setHasPermission(false);
      }
    }
    startCamera();
  }, []);

  const captureFrame = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.8);
        onCapture(dataUrl.split(',')[1]); // Send only base64 data
      }
    }
  }, [onCapture]);

  if (hasPermission === false) {
    return (
      <div className="flex-1 flex items-center justify-center text-center p-8 text-white/60">
        <p>Camera access denied. Please enable camera permissions to use the Expression Scan.</p>
      </div>
    );
  }

  return (
    <div className="relative flex-1 w-full flex flex-col items-center justify-center overflow-hidden">
      {/* Background Camera Feed */}
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        muted 
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 biometric-overlay z-10" />

      {/* Biometric Mesh Overlay */}
      <div className="relative z-20 w-72 h-72 border-2 border-primary/30 rounded-full flex items-center justify-center">
        <div className="absolute inset-0 border-[1px] border-dashed border-primary/50 rounded-full animate-pulse"></div>
        
        {/* Scanning Frame Corners */}
        <div className="absolute -top-4 -left-4 w-12 h-12 border-t-4 border-l-4 border-primary rounded-tl-xl shadow-[0_0_15px_rgba(244,192,37,0.5)]"></div>
        <div className="absolute -top-4 -right-4 w-12 h-12 border-t-4 border-r-4 border-primary rounded-tr-xl shadow-[0_0_15px_rgba(244,192,37,0.5)]"></div>
        <div className="absolute -bottom-4 -left-4 w-12 h-12 border-b-4 border-l-4 border-primary rounded-bl-xl shadow-[0_0_15px_rgba(244,192,37,0.5)]"></div>
        <div className="absolute -bottom-4 -right-4 w-12 h-12 border-b-4 border-r-4 border-primary rounded-br-xl shadow-[0_0_15px_rgba(244,192,37,0.5)]"></div>
        
        {/* Animated Scan Line */}
        <div className="scan-line z-30" />

        <div className="opacity-40 text-primary">
          <span className="material-symbols-outlined text-8xl" style={{ fontVariationSettings: "'wght' 100" }}>
            face_retouching_natural
          </span>
        </div>
      </div>

      {/* Scanning Status */}
      <div className="z-20 mt-12 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-primary/20 flex items-center gap-2">
        <div className="w-2 h-2 bg-primary rounded-full animate-ping"></div>
        <span className="text-sm font-medium tracking-widest uppercase">Analyzing Micro-Expressions</span>
      </div>

      <canvas ref={canvasRef} className="hidden" />

      {/* Trigger Capture on scan click from parent */}
      <button 
        id="hidden-capture" 
        className="hidden" 
        onClick={captureFrame} 
      />
    </div>
  );
};

export default CameraView;
