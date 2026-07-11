/**
 * BanubaCamera — Real Banuba Face AR SDK integration
 * Professional face tracking, beauty effects, AR masks/lenses
 * 
 * DETAILED LOGGING: Every initialization step is logged for iOS debugging
 */
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RotateCcw, Loader2, AlertCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const BEAUTY_EFFECTS = [
  { id: 'none', name: 'Natural', intensity: 0 },
  { id: 'smooth', name: 'Smooth', intensity: 0.5 },
  { id: 'glow', name: 'Glow', intensity: 0.7 },
  { id: 'porcelain', name: 'Porcelain', intensity: 0.8 },
];

export default function BanubaCamera({ onClose }) {
  const videoRef = useRef(null);
  const banubaContainerRef = useRef(null);
  const playerRef = useRef(null);
  const [banubaReady, setBanubaReady] = useState(false);
  const [banubaError, setBanubaError] = useState('');
  const [currentEffect, setCurrentEffect] = useState('smooth');
  const [loading, setLoading] = useState(true);
  const [loadingStep, setLoadingStep] = useState('Initializing...');
  const [facing, setFacing] = useState('user');
  const [debugInfo, setDebugInfo] = useState([]);

  // Helper: Add debug log
  const addDebugLog = useCallback((message, data = null) => {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    const log = `[${timestamp}] ${message}`;
    console.log(log, data || '');
    setDebugInfo(prev => [...prev, { message, data, timestamp }]);
  }, []);

  // Initialize Banuba SDK
  useEffect(() => {
    let destroyed = false;

    const initBanuba = async () => {
      addDebugLog('🎭 ════════ BANUBA INIT START ════════');
      setLoadingStep('Getting token...');

      try {
        // Step 1: Get Banuba token from backend
        addDebugLog('📡 Step 1: Fetching Banuba token from backend...');
        const res = await base44.functions.invoke('getBanubaToken', {});
        addDebugLog('✅ Token response received', { 
          hasToken: !!res.data?.token, 
          tokenLength: res.data?.token?.length,
          fullResponse: res.data 
        });
        
        const token = res.data?.token;
        
        if (!token) {
          const err = 'Banuba token not available - check BANUBA_CLIENT_TOKEN secret';
          addDebugLog('❌ ERROR: ' + err);
          setBanubaError(err);
          setLoading(false);
          return;
        }

        // Decode and validate token
        try {
          const tokenParts = token.split('.');
          if (tokenParts.length >= 2) {
            const payload = JSON.parse(atob(tokenParts[1]));
            addDebugLog('🔐 Token decoded successfully', {
              exp: payload.exp ? new Date(payload.exp * 1000).toISOString() : 'N/A',
              iat: payload.iat ? new Date(payload.iat * 1000).toISOString() : 'N/A',
              sub: payload.sub || 'N/A'
            });
            
            // Check if token is expired
            if (payload.exp && payload.exp < Date.now() / 1000) {
              const err = 'Banuba token is EXPIRED - please regenerate';
              addDebugLog('❌ ERROR: ' + err);
              setBanubaError(err);
              setLoading(false);
              return;
            }
          }
        } catch (decodeErr) {
          addDebugLog('⚠️ Warning: Could not decode token', decodeErr.message);
        }

        setLoadingStep('Loading SDK script...');
        addDebugLog('📦 Step 2: Loading Banuba SDK script...');
        
        // Check if BanubaPlayer already exists (from NPM package)
        if (window.BanubaPlayer) {
          addDebugLog('✅ BanubaPlayer already exists in window');
        } else {
          addDebugLog('⏳ BanubaPlayer not found, loading script...');
          
          // Load Banuba SDK script with timeout
          const scriptLoadPromise = new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = '/banuba/BanubaSDK.browser.js';
            script.async = true;
            script.type = 'application/javascript';
            
            script.onload = () => {
              addDebugLog('✅ SDK script loaded successfully');
              resolve();
            };
            
            script.onerror = (e) => {
              const err = 'Failed to load Banuba SDK script - file not found at /banuba/BanubaSDK.browser.js';
              addDebugLog('❌ ERROR: ' + err, e);
              reject(new Error(err));
            };
            
            document.head.appendChild(script);
            addDebugLog('📝 Script tag added to document head');
          });

          // Timeout after 10 seconds
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Script load timeout after 10s')), 10000);
          });

          await Promise.race([scriptLoadPromise, timeoutPromise]);
        }

        // Verify SDK is available
        setLoadingStep('Verifying SDK...');
        addDebugLog('🔍 Step 3: Verifying BanubaPlayer availability...');
        addDebugLog('window object keys:', Object.keys(window).filter(k => k.toLowerCase().includes('banuba')));
        
        if (destroyed) {
          addDebugLog('⚠️ Component destroyed before SDK init');
          return;
        }

        if (!window.BanubaPlayer) {
          const err = 'BanubaPlayer not found on window object after script load';
          addDebugLog('❌ ERROR: ' + err);
          setBanubaError(err);
          setLoading(false);
          return;
        }

        addDebugLog('✅ BanubaPlayer found:', typeof window.BanubaPlayer);
        addDebugLog('BanubaPlayer methods:', Object.getOwnPropertyNames(window.BanubaPlayer));

        setLoadingStep('Creating player...');
        addDebugLog('🎬 Step 4: Creating BanubaPlayer instance...');
        addDebugLog('Container ref:', banubaContainerRef.current ? 'EXISTS' : 'NULL');
        addDebugLog('Container HTML:', banubaContainerRef.current?.innerHTML || 'EMPTY');

        // Initialize Banuba player
        const startTime = Date.now();
        
        const player = await window.BanubaPlayer.create({
          container: banubaContainerRef.current,
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

        const initTime = Date.now() - startTime;
        addDebugLog('✅ Player created in ' + initTime + 'ms');
        addDebugLog('Player instance methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(player)));

        playerRef.current = player;
        setBanubaReady(true);
        setLoading(false);
        addDebugLog('🎉 ════════ BANUBA INIT SUCCESS ════════');

        // Apply initial beauty effect
        setLoadingStep('Applying effects...');
        addDebugLog('💄 Step 5: Applying initial beauty effect...');
        
        try {
          await player.setEffect('face_retouching', { intensity: 0.5 });
          addDebugLog('✅ Beauty effect applied successfully');
        } catch (effectErr) {
          addDebugLog('⚠️ Warning: Could not apply effect', effectErr.message);
        }

      } catch (err) {
        addDebugLog('❌ ════════ BANUBA INIT FAILED ════════');
        addDebugLog('Error type:', err.constructor.name);
        addDebugLog('Error message:', err.message);
        addDebugLog('Error stack:', err.stack);
        
        setBanubaError(err.message || 'Failed to initialize Banuba SDK');
        setLoading(false);
      }
    };

    initBanuba();

    return () => {
      addDebugLog('🧹 Cleanup: Destroying Banuba player...');
      destroyed = true;
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
          addDebugLog('✅ Player destroyed');
        } catch (e) {
          addDebugLog('⚠️ Error destroying player', e.message);
        }
        playerRef.current = null;
      }
      const script = document.querySelector('script[src="/banuba/BanubaSDK.browser.js"]');
      if (script) {
        script.remove();
        addDebugLog('🗑️ Script tag removed');
      }
    };
  }, [addDebugLog]);

  // Handle camera flip
  const flipCamera = useCallback(async () => {
    addDebugLog('🔄 Flipping camera...');
    if (playerRef.current) {
      const newFacing = facing === 'user' ? 'environment' : 'user';
      setFacing(newFacing);
      try {
        await playerRef.current.switchCamera(newFacing);
        addDebugLog('✅ Camera flipped to ' + newFacing);
      } catch (err) {
        addDebugLog('❌ Failed to flip camera', err.message);
      }
    } else {
      addDebugLog('⚠️ No player instance available');
    }
  }, [facing, addDebugLog]);

  // Change beauty effect
  const changeEffect = useCallback(async (effectId) => {
    addDebugLog('💄 Changing effect to ' + effectId);
    if (!playerRef.current) {
      addDebugLog('⚠️ No player instance');
      return;
    }
    
    const effect = BEAUTY_EFFECTS.find(e => e.id === effectId);
    if (!effect) {
      addDebugLog('⚠️ Effect not found: ' + effectId);
      return;
    }

    setCurrentEffect(effectId);

    try {
      if (effectId === 'none') {
        await playerRef.current.setEffect('face_retouching', { intensity: 0 });
        addDebugLog('✅ Effects disabled');
      } else {
        await playerRef.current.setEffect('face_retouching', { 
          intensity: effect.intensity,
          smoothness: effect.intensity,
          eye_enhancement: effect.intensity * 0.6,
          face_slimming: effect.intensity * 0.3,
        });
        addDebugLog('✅ Effect applied:', { intensity: effect.intensity });
      }
    } catch (err) {
      addDebugLog('❌ Failed to apply effect', err.message);
    }
  }, [addDebugLog]);

  // Capture photo
  const capturePhoto = useCallback(async () => {
    addDebugLog('📸 Capturing photo...');
    if (!playerRef.current) {
      addDebugLog('⚠️ No player instance');
      return;
    }
    
    try {
      const blob = await playerRef.current.takePhoto();
      const url = URL.createObjectURL(blob);
      addDebugLog('✅ Photo captured:', { url, size: blob.size });
      // You can navigate to editor or pass the URL via callback
    } catch (err) {
      addDebugLog('❌ Capture failed', err.message);
    }
  }, [addDebugLog]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-[70] p-6">
        <Loader2 className="w-10 h-10 text-pink-500 animate-spin mb-4" />
        <p className="text-white/60 text-sm mb-2">{loadingStep}</p>
        <p className="text-white/40 text-xs">{debugInfo.length} steps logged</p>
        
        {/* Debug info panel */}
        <div className="mt-6 w-full max-w-md bg-white/5 rounded-lg p-3 max-h-48 overflow-y-auto">
          <p className="text-white/60 text-xs font-mono mb-2">Init Log:</p>
          {debugInfo.slice(-5).map((log, i) => (
            <p key={i} className="text-white/40 text-xs font-mono truncate">
              {log.timestamp} {log.message}
            </p>
          ))}
        </div>
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
              <p className="text-red-400 font-bold text-sm">Banuba SDK Failed to Load</p>
            </div>
            <p className="text-red-300 text-sm mb-3">{banubaError}</p>
            
            <div className="mt-4">
              <p className="text-white/40 text-xs font-bold mb-2">Troubleshooting:</p>
              <ul className="text-white/30 text-xs space-y-1">
                <li>• Check BANUBA_CLIENT_TOKEN secret is set</li>
                <li>• Verify token is not expired</li>
                <li>• Ensure /banuba/* files exist in public folder</li>
                <li>• iOS may require WASM MIME type configuration</li>
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
      {/* Banuba SDK container */}
      <div ref={banubaContainerRef} className="absolute inset-0" />

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

      {/* Bottom controls */}
      <div className="absolute bottom-0 left-0 right-0 z-30 flex flex-col items-center"
        style={{ paddingBottom: 'max(20px, calc(env(safe-area-inset-bottom) + 8px))' }}>
        
        {/* Effect selector */}
        <div className="flex items-center gap-3 mb-6 overflow-x-auto max-w-full px-4">
          {BEAUTY_EFFECTS.map(effect => (
            <button key={effect.id} onClick={() => changeEffect(effect.id)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                currentEffect === effect.id 
                  ? 'bg-gradient-to-r from-pink-500 to-orange-500 text-white' 
                  : 'bg-white/10 text-white/60 border border-white/20'
              }`}>
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
    </div>
  );
}