/**
 * BanubaFaceARCamera — REAL Banuba Face AR SDK using @banuba/webar npm package
 * This uses the official Banuba WebAR SDK with proper initialization
 */
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { X, RotateCcw, Sparkles, Camera as CameraIcon, Loader2, AlertCircle } from 'lucide-react';

export default function BanubaFaceARCamera({ onClose, onCapture }) {
  const containerRef = useRef(null);
  const playerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [loadingStep, setLoadingStep] = useState('Initializing...');
  const [error, setError] = useState('');
  const [banubaReady, setBanubaReady] = useState(false);
  const [currentEffect, setCurrentEffect] = useState('face_retouching');
  const [debugLogs, setDebugLogs] = useState([]);
  const navigate = useNavigate();

  const addLog = useCallback((msg, type = 'info', data = null) => {
    const ts = new Date().toISOString().split('T')[1].split('.')[0];
    const log = `[${ts}] ${msg}`;
    console.log(log, data || '');
    setDebugLogs(prev => [...prev, { ts, msg, type, data }]);
  }, []);

  useEffect(() => {
    let destroyed = false;

    const initBanuba = async () => {
      console.log('╔══════════════════════════════════════════════╗');
      console.log('║  BANUBA FACE AR SDK - INIT START');
      console.log('╚══════════════════════════════════════════════╝');
      
      addLog('🎭 ════════ BANUBA SDK INIT ════════', 'info');
      setLoadingStep('Getting Banuba token...');

      try {
        // Step 1: Get token
        addLog('📡 Step 1: Fetching Banuba token...', 'info');
        const res = await base44.functions.invoke('getBanubaToken', {});
        
        if (!res.data?.token) {
          throw new Error('BANUBA_TOKEN_NOT_AVAILABLE - Check dashboard secrets');
        }

        const token = res.data.token;
        addLog('✅ BANUBA_TOKEN_LOADED', 'success', { 
          length: token.length,
          format: res.data.format,
          preview: token.substring(0, 20) + '...'
        });

        // Validate token
        try {
          const parts = token.split('.');
          if (parts.length >= 3) {
            const payload = JSON.parse(atob(parts[1]));
            const exp = payload.exp ? new Date(payload.exp * 1000) : null;
            const isExpired = exp && exp < new Date();
            addLog('📋 Token decoded', 'info', {
              expires: exp?.toISOString() || 'N/A',
              expired: isExpired,
            });
            if (isExpired) throw new Error('TOKEN_EXPIRED');
          }
        } catch (e) {
          addLog('⚠️ Token decode skipped (may be API key format)', 'warn');
        }

        // Step 2: Load Banuba WebAR SDK from NPM
        setLoadingStep('Loading Banuba SDK...');
        addLog('📦 Step 2: Loading @banuba/webar SDK...', 'info');

        // Import Banuba WebAR SDK (already installed via npm)
        let BanubaPlayer;
        try {
          const BanubaModule = await import('@banuba/webar');
          BanubaPlayer = BanubaModule.BanubaPlayer || BanubaModule.default?.BanubaPlayer;
          addLog('✅ Banuba SDK module loaded', 'success');
        } catch (importErr) {
          addLog('❌ Failed to import @banuba/webar', 'error', importErr.message);
          throw new Error('BANUBA_SDK_NOT_INSTALLED - @banuba/webar package missing');
        }
        
        if (!BanubaPlayer) {
          throw new Error('BanubaPlayer not exported from @banuba/webar');
        }

        addLog('✅ BanubaPlayer class available', 'success');

        // Step 3: Verify container
        setLoadingStep('Preparing camera...');
        addLog('🔍 Step 3: Verifying container...', 'info');
        
        if (destroyed) {
          addLog('⚠️ Component destroyed', 'warn');
          return;
        }

        if (!containerRef.current) {
          throw new Error('Container ref is NULL - cannot mount Banuba player');
        }

        addLog('✅ Container exists', 'success');

        // Step 4: Create Banuba player
        setLoadingStep('Starting face tracking...');
        addLog('🎬 Step 4: Creating BanubaPlayer...', 'info');

        const startTime = Date.now();
        
        try {
          playerRef.current = new BanubaPlayer({
            container: containerRef.current,
            token: token,
            cameraConfig: {
              facingMode: 'user',
              resolution: { width: 1280, height: 720 },
            },
            effectsConfig: {
              enable: true,
            },
          });

          const initTime = Date.now() - startTime;
          addLog(`✅ BANUBA_SDK_INITIALIZED in ${initTime}ms`, 'success');
          addLog('🎭 BANUBA_FACE_TRACKING_ACTIVE', 'success');
          
          setBanubaReady(true);
          setLoading(false);
          addLog('🎉 ════════ BANUBA READY ════════', 'success');

          // Step 5: Apply default effect
          addLog('💄 Step 5: Applying default effect...', 'info');
          try {
            await playerRef.current.setEffect('face_retouching', { intensity: 0.7 });
            addLog('✅ BANUBA_EFFECTS_LOADED', 'success', { effect: 'face_retouching', intensity: 0.7 });
            setCurrentEffect('face_retouching');
          } catch (effectErr) {
            addLog('⚠️ Effect apply warning', 'warn', effectErr.message);
          }

        } catch (playerErr) {
          addLog('❌ BanubaPlayer creation failed', 'error', {
            message: playerErr.message,
            stack: playerErr.stack,
            name: playerErr.name,
          });
          throw playerErr;
        }

      } catch (err) {
        console.error('❌ ════════ BANUBA INIT FAILED ════════');
        console.error('Error:', err.message);
        console.error('Stack:', err.stack);
        
        addLog('❌ ════════ BANUBA INIT FAILED ════════', 'error');
        addLog(`Error: ${err.message}`, 'error');
        
        setError(err.message || 'Failed to initialize Banuba SDK');
        setLoading(false);
      }
    };

    initBanuba();

    return () => {
      console.log('🧹 Cleaning up Banuba...');
      addLog('🧹 Cleanup...', 'info');
      destroyed = true;
      
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
          addLog('✅ Player destroyed', 'info');
        } catch (e) {
          addLog('⚠️ Destroy error', 'warn', e.message);
        }
        playerRef.current = null;
      }
    };
  }, [addLog]);

  // Change effect
  const changeEffect = useCallback(async (effectId) => {
    if (!playerRef.current) {
      addLog('⚠️ No player', 'warn');
      return;
    }

    addLog('💄 BANUBA_EFFECT_SELECTED', 'info', { effect: effectId });
    setCurrentEffect(effectId);

    try {
      if (effectId === 'none') {
        await playerRef.current.setEffect('face_retouching', { intensity: 0 });
        addLog('✅ Effects disabled', 'success');
      } else {
        await playerRef.current.setEffect('face_retouching', { intensity: 0.7 });
        addLog('✅ Effect applied', 'success');
      }
    } catch (err) {
      addLog('❌ Effect failed', 'error', err.message);
    }
  }, [addLog]);

  // Capture
  const capture = useCallback(async () => {
    if (!playerRef.current) return;
    try {
      const blob = await playerRef.current.takePhoto();
      const url = URL.createObjectURL(blob);
      addLog('✅ Photo captured', 'success', { size: blob.size });
      onCapture?.(url);
    } catch (err) {
      addLog('❌ Capture failed', 'error', err.message);
    }
  }, [addLog, onCapture]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-[70] p-6" data-prevent-light-mode="true">
        <Loader2 className="w-12 h-12 text-pink-500 animate-spin mb-4" />
        <p className="text-white/80 text-sm font-semibold mb-2">{loadingStep}</p>
        <p className="text-white/40 text-xs mb-4">Loading Banuba Face AR SDK...</p>
        
        <div className="w-full max-w-md bg-white/5 rounded-lg p-3 max-h-48 overflow-y-auto">
          <p className="text-white/60 text-xs font-mono mb-2">Console Logs:</p>
          {debugLogs.slice(-8).map((log, i) => (
            <p key={i} className={`text-[10px] font-mono truncate ${
              log.type === 'error' ? 'text-red-400' : 
              log.type === 'success' ? 'text-green-400' : 'text-white/50'
            }`}>
              {log.ts} {log.msg}
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
              <p className="text-red-400 font-bold text-base">Banuba SDK Failed</p>
            </div>
            <p className="text-red-300 text-sm mb-4">{error}</p>
            
            <div className="mt-4">
              <p className="text-white/40 text-xs font-bold mb-2">Required:</p>
              <ul className="text-white/30 text-xs space-y-1">
                <li>1. @banuba/webar npm package installed</li>
                <li>2. BANUBA_CLIENT_TOKEN secret set (not expired)</li>
                <li>3. Valid Banuba WebAR license token</li>
              </ul>
            </div>
          </div>
          
          <button onClick={() => navigate('/')}
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
      {/* Banuba SDK renders here */}
      <div ref={containerRef} className="absolute inset-0" />

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-4"
        style={{ paddingTop: 'max(14px, env(safe-area-inset-top))' }}>
        <button onClick={onClose}
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.15)' }}>
          <X className="w-5 h-5 text-white" />
        </button>
        
        <button
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.15)' }}>
          <RotateCcw className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Bottom controls */}
      <div className="absolute bottom-0 left-0 right-0 z-30 flex flex-col items-center"
        style={{ paddingBottom: 'max(20px, calc(env(safe-area-inset-bottom) + 8px))' }}>
        
        {/* Effect carousel */}
        <div className="flex items-center gap-3 mb-6 overflow-x-auto max-w-full px-4 py-2">
          {[
            { id: 'face_retouching', name: 'Beauty', icon: Sparkles },
            { id: 'none', name: 'Original', icon: CameraIcon },
          ].map(effect => {
            const Icon = effect.icon;
            return (
              <motion.button
                key={effect.id}
                onClick={() => changeEffect(effect.id)}
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
        </div>

        {/* Shutter */}
        <button onClick={capture}
          className="w-20 h-20 rounded-full border-4 border-white bg-white flex items-center justify-center active:scale-95 transition-transform"
          style={{ boxShadow: '0 0 20px rgba(255,255,255,0.3)' }}>
          <div className="w-16 h-16 rounded-full bg-white" />
        </button>
      </div>

      {/* Debug panel */}
      <div className="absolute top-20 left-4 z-40 max-w-xs">
        <details className="bg-black/60 backdrop-filter blur-lg rounded-lg p-2">
          <summary className="text-white/60 text-[10px] font-mono cursor-pointer">Banuba Logs</summary>
          <div className="mt-2 space-y-1 max-h-48 overflow-y-auto">
            {debugLogs.slice(-12).map((log, i) => (
              <p key={i} className="text-white/40 text-[9px] font-mono">
                <span className={log.type === 'error' ? 'text-red-400' : log.type === 'success' ? 'text-green-400' : 'text-white/50'}>
                  {log.msg}
                </span>
              </p>
            ))}
          </div>
        </details>
      </div>
    </div>
  );
}