/**
 * BanubaCameraWrapper — Real Banuba Face AR SDK for Create screen
 * Sharp camera preview with real-time face tracking effects
 */
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RotateCcw, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';

// Banuba SDK is loaded dynamically from /banuba/BanubaSDK.js

const EFFECTS = [
  { id: 'none', name: 'Natural', category: 'beauty' },
  { id: 'smooth', name: 'Smooth', category: 'beauty' },
  { id: 'glow', name: 'Glow', category: 'beauty' },
  { id: 'porcelain', name: 'Porcelain', category: 'beauty' },
  { id: 'glam', name: 'Glam', category: 'makeup' },
  { id: 'soft', name: 'Soft', category: 'beauty' },
];

export default function BanubaCameraWrapper({ onCapture, onClose }) {
  const containerRef = useRef(null);
  const playerRef = useRef(null);
  const [banubaReady, setBanubaReady] = useState(false);
  const [banubaError, setBanubaError] = useState('');
  const [currentEffect, setCurrentEffect] = useState('smooth');
  const [loading, setLoading] = useState(true);
  const [loadingStep, setLoadingStep] = useState('Initializing...');
  const [effectsOpen, setEffectsOpen] = useState(true); // OPEN BY DEFAULT
  const [facing, setFacing] = useState('user');
  const [faceDetected, setFaceDetected] = useState(false);
  const [debugStatus, setDebugStatus] = useState({ sdk: false, effects: false, face: false });

  // Initialize Banuba SDK with FULL LOGGING
  useEffect(() => {
    let destroyed = false;

    const initBanuba = async () => {
      console.log('[BANUBA] ════════════════════════════════════════');
      console.log('[BANUBA] Starting initialization...');
      setLoadingStep('Getting token...');
      
      try {
        // Step 1: Get Banuba token
        console.log('[BANUBA] Step 1: Fetching token from backend...');
        const res = await base44.functions.invoke('getBanubaToken', {});
        const token = res.data?.token;
        console.log('[BANUBA] Token response:', res.data);
        console.log('[BANUBA] Token received:', token ? token.substring(0, 20) + '...' : 'NULL');
        
        if (!token) {
          console.error('[BANUBA] ❌ Token is NULL or undefined');
          throw new Error('Banuba token not available');
        }
        console.log('[BANUBA] ✓ Token received successfully');

        setLoadingStep('Loading SDK...');
        
        // Step 2: Load Banuba SDK from public folder
        console.log('[BANUBA] Step 2: Loading SDK from public/banuba/BanubaSDK.js...');
        let BanubaPlayer;
        
        try {
          // Load SDK script dynamically
          await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = '/banuba/BanubaSDK.js';
            script.async = true;
            script.onload = resolve;
            script.onerror = () => reject(new Error('Failed to load BanubaSDK.js script'));
            document.head.appendChild(script);
          });
          
          console.log('[BANUBA] SDK script loaded');
          console.log('[BANUBA] window.BanubaPlayer:', typeof window.BanubaPlayer);
          
          BanubaPlayer = window.BanubaPlayer;
          if (!BanubaPlayer) {
            console.error('[BANUBA] ❌ window.BanubaPlayer is undefined');
            throw new Error('BanubaPlayer not found in window');
          }
        } catch (e) {
          console.error('[BANUBA] ❌ Failed to load SDK:', e);
          throw new Error('Failed to load Banuba SDK: ' + e.message);
        }
        console.log('[BANUBA] ✓ SDK loaded successfully');

        if (destroyed) {
          console.log('[BANUBA] ⚠️ Component destroyed, aborting init');
          return;
        }

        setLoadingStep('Starting camera...');
        console.log('[BANUBA] Step 3: Creating player instance...');
        console.log('[BANUBA] Container ref:', containerRef.current ? 'EXISTS' : 'NULL');

        // Step 3: Create player with camera
        const player = await BanubaPlayer.create({
          container: containerRef.current,
          token: token,
          camera: {
            facingMode: facing,
            resolution: { width: 1280, height: 720 },
          },
          effects: {
            enable: true,
            default: 'smooth',
          },
        });

        console.log('[BANUBA] Player created:', player);
        console.log('[BANUBA] Player methods:', Object.keys(player || {}).slice(0, 10));
        
        playerRef.current = player;
        setBanubaReady(true);
        setLoading(false);
        setDebugStatus(prev => ({ ...prev, sdk: true }));
        console.log('[BANUBA] ✓ Player initialized successfully');
        
        // Apply initial effect
        console.log('[BANUBA] Step 4: Applying initial effect (smooth)...');
        await player.setEffect('face_retouching', { intensity: 0.5 });
        console.log('[BANUBA] ✓ Effect applied');
        setDebugStatus(prev => ({ ...prev, effects: true }));
        
        // Monitor face detection
        console.log('[BANUBA] Step 5: Starting face detection monitor...');
        const checkFace = setInterval(() => {
          if (player?.getFaceTrackingStatus) {
            const hasFace = player.getFaceTrackingStatus();
            setFaceDetected(hasFace);
            setDebugStatus(prev => ({ ...prev, face: hasFace }));
            if (hasFace) console.log('[BANUBA] ✓ Face detected!');
          } else {
            console.log('[BANUBA] ⚠️ getFaceTrackingStatus method not available');
          }
        }, 1000);
        
        console.log('[BANUBA] ════════════════════════════════════════');
        console.log('[BANUBA] ✅ INITIALIZATION COMPLETE');
        console.log('[BANUBA] SDK: LOADED');
        console.log('[BANUBA] Effects: ACTIVE');
        console.log('[BANUBA] Face Detection: RUNNING');
        console.log('[BANUBA] ════════════════════════════════════════');
        
        return () => {
          console.log('[BANUBA] Cleaning up face detection interval');
          clearInterval(checkFace);
        };

      } catch (err) {
        console.error('[BANUBA] ════════════════════════════════════════');
        console.error('[BANUBA] ❌ INITIALIZATION FAILED');
        console.error('[BANUBA] Error:', err);
        console.error('[BANUBA] Stack:', err.stack);
        console.error('[BANUBA] ════════════════════════════════════════');
        setBanubaError(err.message || 'Failed to initialize Banuba');
        setLoading(false);
      }
    };

    initBanuba();

    return () => {
      destroyed = true;
      console.log('[BANUBA] Component unmounting, destroying player...');
      if (playerRef.current) {
        playerRef.current.destroy();
        console.log('[BANUBA] Player destroyed');
        playerRef.current = null;
      }
    };
  }, []);

  // Handle camera flip
  const flipCamera = useCallback(async () => {
    if (playerRef.current) {
      const newFacing = facing === 'user' ? 'environment' : 'user';
      setFacing(newFacing);
      await playerRef.current.switchCamera(newFacing);
    }
  }, [facing]);

  // Change effect
  const changeEffect = useCallback(async (effectId) => {
    if (!playerRef.current) return;
    
    setCurrentEffect(effectId);
    
    try {
      if (effectId === 'none') {
        await playerRef.current.setEffect('face_retouching', { intensity: 0 });
      } else if (effectId === 'smooth') {
        await playerRef.current.setEffect('face_retouching', { intensity: 0.5 });
      } else if (effectId === 'glow') {
        await playerRef.current.setEffect('face_retouching', { intensity: 0.7 });
      } else if (effectId === 'porcelain') {
        await playerRef.current.setEffect('face_retouching', { intensity: 0.8 });
      }
    } catch (err) {
      console.error('Effect change failed:', err);
    }
  }, []);

  // Capture photo
  const capturePhoto = useCallback(async () => {
    if (!playerRef.current) return;
    
    try {
      const blob = await playerRef.current.takePhoto();
      const url = URL.createObjectURL(blob);
      onCapture({ url, blob });
    } catch (err) {
      console.error('Capture failed:', err);
    }
  }, [onCapture]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-[70] p-6">
        <Loader2 className="w-10 h-10 text-pink-500 animate-spin mb-4" />
        <p className="text-white/60 text-sm mb-2">{loadingStep}</p>
      </div>
    );
  }

  if (banubaError) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-[70] p-6">
        <div className="max-w-md w-full">
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <p className="text-red-400 font-bold text-sm">Banuba SDK Failed</p>
            </div>
            <p className="text-red-300 text-sm mb-3">{banubaError}</p>
          </div>
          <button onClick={onClose}
            className="w-full px-6 py-3 rounded-full text-white text-sm font-bold"
            style={{ background: 'linear-gradient(135deg,#ff4400,#e91e8c)' }}>
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black overflow-hidden z-[70]" data-prevent-light-mode="true">
      {/* Banuba SDK container — this is where the real camera feed renders */}
      <div 
        ref={containerRef} 
        className="absolute inset-0"
        style={{ 
          filter: 'none !important',
          backdropFilter: 'none !important',
          WebkitFilter: 'none !important',
          WebkitBackdropFilter: 'none !important',
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

      {/* Debug status panel - ALWAYS VISIBLE */}
      <div className="absolute top-20 left-4 z-30">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
            style={{ 
              background: debugStatus.sdk ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)',
              border: debugStatus.sdk ? '1px solid rgba(34,197,94,0.4)' : '1px solid rgba(239,68,68,0.4)'
            }}>
            <div className={`w-2 h-2 rounded-full ${debugStatus.sdk ? 'bg-green-400' : 'bg-red-400'}`} />
            <span className="text-white text-[10px] font-mono">
              SDK {debugStatus.sdk ? 'LOADED ✓' : 'LOADING'}
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
            style={{ 
              background: debugStatus.effects ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)',
              border: debugStatus.effects ? '1px solid rgba(34,197,94,0.4)' : '1px solid rgba(239,68,68,0.4)'
            }}>
            <div className={`w-2 h-2 rounded-full ${debugStatus.effects ? 'bg-green-400' : 'bg-red-400'}`} />
            <span className="text-white text-[10px] font-mono">
              EFFECTS {debugStatus.effects ? 'ACTIVE ✓' : 'LOADING'}
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
            style={{ 
              background: debugStatus.face ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)',
              border: debugStatus.face ? '1px solid rgba(34,197,94,0.4)' : '1px solid rgba(239,68,68,0.4)'
            }}>
            <div className={`w-2 h-2 rounded-full ${debugStatus.face ? 'bg-green-400' : 'bg-red-400'}`} />
            <span className="text-white text-[10px] font-mono">
              FACE {debugStatus.face ? 'DETECTED ✓' : 'NOT FOUND'}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom controls */}
      <div className="absolute bottom-0 left-0 right-0 z-30 flex flex-col items-center"
        style={{ paddingBottom: 'max(20px, calc(env(safe-area-inset-bottom) + 8px))' }}>
        
        {/* Effects carousel - ALWAYS VISIBLE */}
        <div className="mb-6 flex items-center gap-2 overflow-x-auto max-w-full px-4">
          {EFFECTS.map(effect => (
            <button
              key={effect.id}
              onClick={() => changeEffect(effect.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                currentEffect === effect.id
                  ? 'bg-gradient-to-r from-pink-500 to-orange-500 text-white'
                  : 'bg-white/10 text-white/60 border border-white/20'
              }`}
              style={{ backdropFilter: 'none' }}>
              {effect.name}
            </button>
          ))}
        </div>

        {/* Shutter button */}
        <button onClick={capturePhoto}
          className="w-20 h-20 rounded-full border-4 border-white bg-white flex items-center justify-center active:scale-95 transition-transform"
          style={{ boxShadow: '0 0 20px rgba(255,255,255,0.3)' }}>
          <div className="w-16 h-16 rounded-full bg-white" />
        </button>
      </div>

      {/* Effects bottom sheet */}
      <AnimatePresence>
        {effectsOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 z-40"
              style={{ background: 'rgba(0,0,0,0.5)' }}
              onClick={() => setEffectsOpen(false)} />
            
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 32, stiffness: 350 }}
              className="absolute bottom-0 left-0 right-0 z-50 rounded-t-3xl px-5 pt-4 pb-8"
              style={{ 
                background: 'rgba(12,6,20,0.97)',
                backdropFilter: 'blur(24px)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderBottom: 'none'
              }}
              onClick={e => e.stopPropagation()}>
              
              <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mb-4" />
              
              <div className="flex items-center justify-between mb-4">
                <span className="text-white font-bold text-sm">✨ Beauty Effects</span>
                <button onClick={() => setEffectsOpen(false)}
                  className="w-7 h-7 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.1)' }}>
                  <X className="w-3.5 h-3.5 text-white" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {EFFECTS.map(effect => (
                  <button
                    key={effect.id}
                    onClick={() => { changeEffect(effect.id); setEffectsOpen(false); }}
                    className={`py-3 rounded-xl text-xs font-bold transition-all ${
                      currentEffect === effect.id
                        ? 'bg-gradient-to-r from-pink-500 to-orange-500 text-white'
                        : 'bg-white/10 text-white/60 border border-white/20'
                    }`}>
                    {effect.name}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}