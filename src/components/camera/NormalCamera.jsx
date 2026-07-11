/**
 * NormalCamera — Simple camera without Banuba AR
 * Sharp preview, normal recording, no effects
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { X, RotateCcw, Camera, Video } from 'lucide-react';

export default function NormalCamera({ onCapture, onClose }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [facing, setFacing] = useState('user');
  const [error, setError] = useState('');

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: facing,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setStream(mediaStream);
      setError('');
    } catch (err) {
      console.error('Camera error:', err);
      setError('Camera access denied. Please enable camera permissions.');
    }
  }, [facing, stream]);

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Flip camera
  const flipCamera = () => {
    setFacing(prev => prev === 'user' ? 'environment' : 'user');
  };

  // Capture photo
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      onCapture({ url, blob });
    }, 'image/jpeg', 0.95);
  };

  return (
    <div className="fixed inset-0 bg-black overflow-hidden z-[70]" data-prevent-light-mode="true">
      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Camera preview — sharp, no filters */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          filter: 'none !important',
          WebkitFilter: 'none !important',
          transform: facing === 'user' ? 'scaleX(-1)' : 'none'
        }}
      />

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-4"
        style={{ paddingTop: 'max(14px, env(safe-area-inset-top))' }}>
        <button onClick={onClose}
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.42)', backdropFilter: 'blur(12px)' }}>
          <X className="w-5 h-5 text-white" />
        </button>
        
        <button onClick={flipCamera}
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.42)', backdropFilter: 'blur(12px)' }}>
          <RotateCcw className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="absolute top-20 left-4 right-4 z-30">
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
            <p className="text-red-400 text-sm font-semibold">{error}</p>
          </div>
        </div>
      )}

      {/* Bottom controls */}
      <div className="absolute bottom-0 left-0 right-0 z-30 flex flex-col items-center"
        style={{ paddingBottom: 'max(20px, calc(env(safe-area-inset-bottom) + 8px))' }}>
        
        {/* Shutter button */}
        <button onClick={capturePhoto}
          className="w-20 h-20 rounded-full border-4 border-white bg-white flex items-center justify-center active:scale-95 transition-transform"
          style={{ boxShadow: '0 0 20px rgba(255,255,255,0.3)' }}>
          <div className="w-16 h-16 rounded-full bg-white" />
        </button>
      </div>
    </div>
  );
}