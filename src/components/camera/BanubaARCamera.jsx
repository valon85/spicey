/**
 * BanubaARCamera — Real Banuba Face AR SDK with Snapchat/Instagram-style effects
 * Auto-initializes on mount with face tracking, beauty effects, and AR masks
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, RotateCcw, Camera as CameraIcon, Sparkles, Zap, Smile,
  Loader2, AlertCircle, Check, Download
} from 'lucide-react';

// Banuba beauty effects (built-in)
const BEAUTY_EFFECTS = [
  { id: 'face_retouching', name: 'Beauty', intensity: 0.7, icon: Sparkles },
  { id: 'none', name: 'Original', intensity: 0, icon: CameraIcon },
];

// AR masks/lenses (loaded from Banuba assets)
const AR_MASKS = [
  { id: 'cat_ears', name: 'Cat Ears', type: 'mask' },
  { id: 'dog_face', name: 'Dog Face', type: 'mask' },
  { id: 'butterfly', name: 'Butterfly', type: 'mask' },
  { id: 'flowers', name: 'Flowers', type: 'mask' },
  { id: 'sunglasses', name: 'Sunglasses', type: 'mask' },
  { id: 'makeup', name: 'Makeup', type: 'mask' },
];

export default function BanubaARCamera({ onClose, onCapture }) {
  const containerRef = useRef(null);
  const playerRef = useRef(null);
  const streamRef = useRef(null);
  
  const [banubaReady, setBanubaReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingStep, setLoadingStep] = useState('Initializing camera...');
  const [error, setError] = useState('');
  const [currentEffect, setCurrentEffect] = useState('face_retouching');
  const [currentMask, setCurrentMask] = useState(null);
  const [facingMode, setFacingMode] = useState('user');
  const [capturing, setCapturing] = useState(false);
  const [debugLogs, setDebugLogs] = useState([]);

  // Add console log with timestamp
  const addLog = useCallback((message, type = 'info', data = null) => {
    const ts = new Date().toISOString().split('T')[1].split('.')[0];
    const log = `[${ts}] ${message}`;
    console.log(log, data || '');
    setDebugLogs(prev => [...prev, { ts, message, type, data }]);
  }, []);

  // Initialize Banuba SDK
  useEffect(() => {
    let destroyed = false;
    let player = null;

    const initBanuba = async () => {
      console.log('╔══════════════════════════════════════════════╗');
      console.log('║  BANUBA AR CAMERA INITIALIZING');
      console.log('╚══════════════════════════════════════════════╝');
      
      addLog('🎭 ════════ BANUBA SDK INIT START ════════', 'info');
      setLoadingStep('Getting Banuba token...');

      try {
        // Step 1: Get Banuba token
        addLog('📡 Step 1: Fetching Banuba token from backend...', 'info');
        const res = await base44.functions.invoke('getBanubaToken', {});
        
        if (!res.data?.token) {
          throw new Error('BANUBA_TOKEN_NOT_AVAILABLE');
        }

        const token = res.data.token;
        addLog('✅ BANUBA_TOKEN_LOADED', 'success', { 
          length: token.length, 
          format: res.data.format 
        });

        // Decode and validate token
        try {
          const parts = token.split('.');
          if (parts.length >= 3) {
            const payload = JSON.parse(atob(parts[1]));
            const expDate = payload.exp ? new Date(payload.exp * 1000) : null;
            const isExpired = expDate && expDate < new Date();
            
            addLog('📋 Token decoded', 'info', {
              expires: expDate?.toISOString() || 'N/A',
              expired: isExpired,
            });

            if (isExpired) {
              throw new Error('BANUBA_TOKEN_EXPIRED');
            }
          }
        } catch (e) {
          addLog('⚠️ Could not decode token', 'warn');
        }

        // Step 2: Load Banuba SDK script
        setLoadingStep('Loading Banuba SDK...');
        addLog('📦 Step 2: Loading Banuba SDK script...', 'info');

        if (!window.BanubaPlayer) {
          addLog('⏳ BanubaPlayer not found, loading script from /banuba/...', 'info');
          
          await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = '/banuba/BanubaSDK.browser.js';
            script.async = true;
            script.type = 'application/javascript';
            
            script.onload = () => {
              addLog('✅ Banuba SDK script loaded', 'success');
              resolve();
            };
            
            script.onerror = (e) => {
              addLog('❌ Failed to load Banuba SDK script', 'error', e);
              reject(new Error('BANUBA_SDK_SCRIPT_NOT_FOUND'));
            };
            
            document.head.appendChild(script);
            addLog('📝 Script tag added to document head', 'info');
            
            // Timeout after 15 seconds
            setTimeout(() => reject(new Error('BANUBA_SDK_SCRIPT_TIMEOUT')), 15000);
          });
        } else {
          addLog('✅ BanubaPlayer already exists in window', 'success');
        }

        // Step 3: Verify SDK is available
        setLoadingStep('Verifying SDK...');
        addLog('🔍 Step 3: Verifying BanubaPlayer availability...', 'info');
        
        if (destroyed) {
          addLog('⚠️ Component destroyed before SDK init', 'warn');
          return;
        }

        if (!window.BanubaPlayer) {
          throw new Error('BANUBA_PLAYER_NOT_FOUND');
        }

        addLog('✅ BanubaPlayer found:', 'success', { type: typeof window.BanubaPlayer });
        addLog('BanubaPlayer methods:', 'info', Object.getOwnPropertyNames(window.BanubaPlayer).slice(0, 10));

        // Step 4: Create Banuba player
        setLoadingStep('Starting face tracking...');
        addLog('🎬 Step 4: Creating BanubaPlayer instance...', 'info');
        addLog('Container ref:', 'info', containerRef.current ? 'EXISTS' : 'NULL');

        const startTime = Date.now();
        
        player = await window.BanubaPlayer.create({
          container: containerRef.current,
          token: token,
          camera: {
            facingMode: facingMode,
            resolution: { width: 1280, height: 720 },
          },
          effects: {
            enable: true,
            default: 'face_retouching',
          },
          quality: 'high',
          enableFaceTracking: true,
        });

        const initTime = Date.now() - startTime;
        addLog(`✅ BANUBA_SDK_INITIALIZED in ${initTime}ms`, 'success');
        addLog('🎭 BANUBA_FACE_TRACKING_ACTIVE', 'success');

        playerRef.current = player;
        streamRef.current = player.stream;
        setBanubaReady(true);
        setLoading(false);

        addLog('🎉 ════════ BANUBA INIT SUCCESS ════════', 'success');
        addLog('╔══════════════════════════════════════════════╗', 'info');
        addLog('║  BANUBA AR CAMERA READY', 'info');
        addLog('╚══════════════════════════════════════════════╝', 'info');

        // Step 5: Apply default beauty effect
        setLoadingStep('Applying effects...');
        addLog('💄 Step 5: Applying default beauty effect...', 'info');
        
        try {
          await player.setEffect('face_retouching', { 
            intensity: 0.7,
            smoothness: 0.6,
            eye_enhancement: 0.5,
          });
          addLog('✅ BANUBA_EFFECTS_LOADED', 'success', { effect: 'face_retouching' });
          setCurrentEffect('face_retouching');
        } catch (effectErr) {
          addLog('⚠️ Could not apply default effect', 'warn', effectErr.message);
        }

      } catch (err) {
        console.error('❌ ════════ BANUBA INIT FAILED ════════');
        console.error('Error type:', err.constructor.name);
        console.error('Error message:', err.message);
        console.error('Stack:', err.stack);
        
        addLog('❌ ════════ BANUBA INIT FAILED ════════', 'error');
        addLog('Error: ' + err.message, 'error');
        
        setError(err.message || 'Failed to initialize Banuba SDK');
        setLoading(false);
      }
    };

    initBanuba();

    return () => {
      console.log('🧹 Cleaning up Banuba player...');
      addLog('🧹 Cleanup: Destroying Banuba player...', 'info');
      destroyed = true;
      
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
          addLog('✅ Player destroyed', 'info');
        } catch (e) {
          addLog('⚠️ Error destroying player', 'warn', e.message);
        }
        playerRef.current = null;
      }
      
      // Remove SDK script
      const script = document.querySelector('script[src="/banuba/BanubaSDK.browser.js"]');
      if (script) {
        script.remove();
        addLog('🗑️ Script tag removed', 'info');
      }
    };
  }, [addLog, facingMode]);

  // Change beauty effect
  const changeBeautyEffect = useCallback(async (effectId) => {
    if (!playerRef.current) {
      addLog('⚠️ No player instance', 'warn');
      return;
    }

    addLog('💄 BANUBA_EFFECT_SELECTED', 'info', { effect: effectId });
    setCurrentEffect(effectId);

    try {
      if (effectId === 'none') {
        await playerRef.current.setEffect('face_retouching', { intensity: 0 });
        addLog('✅ Beauty effects disabled', 'success');
      } else {
        await playerRef.current.setEffect('face_retouching', { 
          intensity: 0.7,
          smoothness: 0.6,
          eye_enhancement: 0.5,
        });
        addLog('✅ Beauty effect applied', 'success', { intensity: 0.7 });
      }
    } catch (err) {
      addLog('❌ Failed to apply effect', 'error', err.message);
    }
  }, [addLog]);

  // Apply AR mask
  const applyMask = useCallback(async (maskId) => {
    if (!playerRef.current) {
      addLog('⚠️ No player instance', 'warn');
      return;
    }

    addLog('🎭 Applying AR mask', 'info', { mask: maskId });
    setCurrentMask(maskId === currentMask ? null : maskId);

    try {
      if (maskId === currentMask || maskId === 'none') {
        // Remove current mask
        await playerRef.current.removeEffect();
        addLog('✅ AR mask removed', 'success');
        setCurrentMask(null);
      } else {
        // Apply new mask (Banuba loads from assets)
        await playerRef.current.setEffect(maskId, {});
        addLog('✅ AR mask applied', 'success', { mask: maskId });
      }
    } catch (err) {
      addLog('❌ Failed to apply AR mask', 'error', err.message);
    }
  }, [currentMask, addLog]);

  // Flip camera
  const flipCamera = useCallback(async () => {
    addLog('🔄 Flipping camera...', 'info');
    if (playerRef.current) {
      const newFacing = facingMode === 'user' ? 'environment' : 'user';
      setFacingMode(newFacing);
      try {
        await playerRef.current.switchCamera(newFacing);
        addLog('✅ Camera flipped', 'success', { facing: newFacing });
      } catch (err) {
        addLog('❌ Failed to flip camera', 'error', err.message);
      }
    }
  }, [facingMode, addLog]);

  // Capture photo
  const capturePhoto = useCallback(async () => {
    if (!playerRef.current || capturing) return;
    
    setCapturing(true);
    addLog('📸 Capturing photo...', 'info');

    try {
      const blob = await playerRef.current.takePhoto();
      const url = URL.createObjectURL(blob);
      addLog('✅ Photo captured', 'success', { size: blob.size, url });
      
      if (onCapture) {
        onCapture(url);
      }
    } catch (err) {
      addLog('❌ Capture failed', 'error', err.message);
      setError('Failed to capture photo');
    } finally {
      setCapturing(false);
    }
  }, [capturing, onCapture, addLog]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-[70] p-6" data-prevent-light-mode="true">
        <Loader2 className="w-12 h-12 text-pink-500 animate-spin mb-4" />
        <p className="text-white/80 text-sm font-semibold mb-2">{loadingStep}</p>
        <p className="text-white/40 text-xs mb-4">Please wait while Banuba SDK loads...</p>
        
        {/* Debug info */}
        <div className="w-full max-w-md bg-white/5 rounded-lg p-3 max-h-40 overflow-y-auto">
          <p className="text-white/60 text-xs font-mono mb-2">Init Log:</p>
          {debugLogs.slice(-6).map((log, i) => (
            <p key={i} className="text-white/40 text-[10px] font-mono truncate">
              {log.ts} {log.message}
            </p>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-[70] p-6" data-prevent-light-mode="true">
        <div className="max-w-md w-full">
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-5 mb-4">
            <div className="flex items-center gap-3 mb-3">
              <AlertCircle className="w-6 h-6 text-red-400" />
              <p className="text-red-400 font-bold text-base">Banuba SDK Failed to Load</p>
            </div>
            <p className="text-red-300 text-sm mb-4">{error}</p>
            
            <div className="mt-4">
              <p className="text-white/40 text-xs font-bold mb-2">Troubleshooting:</p>
              <ul className="text-white/30 text-xs space-y-1">
                <li>• Check BANUBA_CLIENT_TOKEN secret is set</li>
                <li>• Verify token is not expired</li>
                <li>• Ensure /banuba/BanubaSDK.browser.js exists</li>
                <li>• iOS requires WASM MIME type: application/wasm</li>
              </ul>
            </div>
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
      {/* Banuba SDK container - this renders the AR camera */}
      <div ref={containerRef} className="absolute inset-0" />

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-4"
        style={{ paddingTop: 'max(14px, env(safe-area-inset-top))' }}>
        <button onClick={onClose}
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.15)' }}>
          <X className="w-5 h-5 text-white" />
        </button>
        
        <button onClick={flipCamera}
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.15)' }}>
          <RotateCcw className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Bottom controls */}
      <div className="absolute bottom-0 left-0 right-0 z-30 flex flex-col items-center"
        style={{ paddingBottom: 'max(20px, calc(env(safe-area-inset-bottom) + 8px))' }}>
        
        {/* Effect carousel - Snapchat/Instagram style */}
        <div className="flex items-center gap-3 mb-6 overflow-x-auto max-w-full px-4 py-2"
          style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
          {/* Beauty effects */}
          {BEAUTY_EFFECTS.map(effect => {
            const Icon = effect.icon;
            return (
              <motion.button
                key={effect.id}
                onClick={() => changeBeautyEffect(effect.id)}
                whileTap={{ scale: 0.9 }}
                className={`flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                  currentEffect === effect.id 
                    ? 'bg-gradient-to-r from-pink-500 to-orange-500 text-white scale-110' 
                    : 'bg-white/10 text-white/60 border border-white/20'
                }`}
                style={{ boxShadow: currentEffect === effect.id ? '0 0 20px rgba(255,80,0,0.6)' : 'none' }}>
                <Icon className="w-7 h-7" />
              </motion.button>
            );
          })}
          
          {/* AR masks */}
          {AR_MASKS.map(mask => (
            <motion.button
              key={mask.id}
              onClick={() => applyMask(mask.id)}
              whileTap={{ scale: 0.9 }}
              className={`flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                currentMask === mask.id 
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white scale-110' 
                  : 'bg-white/10 text-white/60 border border-white/20'
              }`}
              style={{ boxShadow: currentMask === mask.id ? '0 0 20px rgba(233,30,140,0.6)' : 'none' }}>
              <Sparkles className="w-7 h-7" />
            </motion.button>
          ))}
        </div>

        {/* Shutter button */}
        <button 
          onClick={capturePhoto}
          disabled={capturing}
          className="w-20 h-20 rounded-full border-4 border-white bg-white flex items-center justify-center active:scale-95 transition-transform disabled:opacity-50"
          style={{ boxShadow: '0 0 20px rgba(255,255,255,0.3)' }}>
          {capturing ? (
            <Loader2 className="w-8 h-8 animate-spin" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-white" />
          )}
        </button>
      </div>

      {/* Debug panel (optional, remove in production) */}
      <div className="absolute top-20 left-4 z-40 max-w-xs">
        <details className="bg-black/60 backdrop-filter blur-lg rounded-lg p-2">
          <summary className="text-white/60 text-[10px] font-mono cursor-pointer">Debug Logs</summary>
          <div className="mt-2 space-y-1 max-h-48 overflow-y-auto">
            {debugLogs.slice(-10).map((log, i) => (
              <p key={i} className="text-white/40 text-[9px] font-mono">
                <span className={log.type === 'error' ? 'text-red-400' : log.type === 'success' ? 'text-green-400' : 'text-white/50'}>
                  {log.message}
                </span>
              </p>
            ))}
          </div>
        </details>
      </div>
    </div>
  );
}