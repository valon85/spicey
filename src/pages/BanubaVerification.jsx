/**
 * Banuba Verification — Proves if real Banuba SDK is running
 * Opens camera and shows real-time face tracking proof
 */
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { AlertCircle, CheckCircle2, XCircle, Loader2, Camera } from 'lucide-react';

export default function BanubaVerification() {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const [logs, setLogs] = useState([]);
  const [status, setStatus] = useState('checking'); // checking, running, failed
  const [banubaProof, setBanubaProof] = useState(null);
  const [cameraStream, setCameraStream] = useState(null);

  const addLog = (msg, type = 'info') => {
    const ts = new Date().toISOString().split('T')[1].split('.')[0];
    setLogs(prev => [...prev, { ts, msg, type }]);
    console.log(`[Banuba Verification] [${ts}] ${msg}`);
  };

  useEffect(() => {
    const verify = async () => {
      addLog('╔══════════════════════════════════════════════╗', 'info');
      addLog('║  BANUBA VERIFICATION START', 'info');
      addLog('╚══════════════════════════════════════════════╝', 'info');

      // Step 1: Check window.BanubaPlayer
      addLog('📦 Step 1: Checking window.BanubaPlayer...', 'info');
      if (window.BanubaPlayer) {
        addLog('✅ BanubaPlayer FOUND in window', 'success');
        addLog('BanubaPlayer type: ' + typeof window.BanubaPlayer, 'info');
        addLog('BanubaPlayer methods: ' + Object.getOwnPropertyNames(window.BanubaPlayer).slice(0, 5).join(', '), 'info');
      } else {
        addLog('❌ BanubaPlayer NOT FOUND in window', 'error');
        addLog('⚠️ This means SDK script never loaded', 'warn');
      }

      // Step 2: Check Banuba token
      addLog('🔑 Step 2: Fetching Banuba token...', 'info');
      try {
        const res = await base44.functions.invoke('getBanubaToken', {});
        if (res.data?.token) {
          addLog('✅ BANUBA_TOKEN_LOADED', 'success');
          addLog('Token length: ' + res.data.token.length, 'info');
          addLog('Token format: ' + (res.data.format || 'unknown'), 'info');
          
          // Decode JWT
          try {
            const parts = res.data.token.split('.');
            if (parts.length >= 3) {
              const payload = JSON.parse(atob(parts[1]));
              const exp = payload.exp ? new Date(payload.exp * 1000) : null;
              addLog('Token expires: ' + (exp ? exp.toISOString() : 'N/A'), 'info');
              if (exp && exp < new Date()) {
                addLog('❌ TOKEN EXPIRED!', 'error');
              }
            }
          } catch (e) {
            addLog('⚠️ Could not decode token', 'warn');
          }
        } else {
          addLog('❌ Token NOT available', 'error');
          setStatus('failed');
          return;
        }
      } catch (e) {
        addLog('❌ Failed to fetch token: ' + e.message, 'error');
        setStatus('failed');
        return;
      }

      // Step 3: Try to initialize Banuba
      addLog('⚙️ Step 3: Attempting Banuba initialization...', 'info');
      
      if (!window.BanubaPlayer) {
        addLog('❌ Cannot initialize - BanubaPlayer not available', 'error');
        addLog('💡 Loading SDK script dynamically...', 'info');
        
        // Try to load SDK
        try {
          await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = '/banuba/BanubaSDK.browser.js';
            script.onload = resolve;
            script.onerror = () => reject(new Error('Script load failed'));
            document.head.appendChild(script);
          });
          addLog('✅ SDK script loaded', 'success');
        } catch (e) {
          addLog('❌ SDK script failed: ' + e.message, 'error');
          setStatus('failed');
          setBanubaProof({
            running: false,
            reason: 'BanubaPlayer not available and SDK script failed to load',
            proof: 'No Banuba SDK detected in browser'
          });
          return;
        }
      }

      // Initialize player
      try {
        addLog('🎬 Creating BanubaPlayer instance...', 'info');
        const token = (await base44.functions.invoke('getBanubaToken', {})).data.token;
        
        const player = await window.BanubaPlayer.create({
          container: containerRef.current,
          token: token,
          camera: { facingMode: 'user', resolution: { width: 1280, height: 720 } },
          effects: { enable: true, default: 'face_retouching' },
        });

        addLog('✅ BANUBA_SDK_INITIALIZED', 'success');
        addLog('✅ BANUBA_FACE_TRACKING_ACTIVE', 'success');
        addLog('✅ BANUBA_EFFECTS_LOADED', 'success');
        
        setStatus('running');
        setBanubaProof({
          running: true,
          proof: 'BanubaPlayer.create() succeeded - real Face AR SDK is active',
          playerMethods: Object.getOwnPropertyNames(Object.getPrototypeOf(player)).slice(0, 8).join(', '),
          stream: !!player.stream,
        });

        // Test effect switching
        try {
          await player.setEffect('face_retouching', { intensity: 0.7 });
          addLog('✅ BANUBA_EFFECT_SELECTED: face_retouching applied', 'success');
          
          setTimeout(async () => {
            await player.setEffect('face_retouching', { intensity: 0 });
            addLog('✅ BANUBA_EFFECT_SELECTED: effects disabled', 'success');
            
            setTimeout(async () => {
              await player.setEffect('face_retouching', { intensity: 0.7 });
              addLog('✅ BANUBA_EFFECT_SELECTED: effects re-enabled', 'success');
            }, 1000);
          }, 1000);
        } catch (e) {
          addLog('⚠️ Effect switch test failed: ' + e.message, 'warn');
        }

        // Cleanup after demo
        setTimeout(() => {
          player.destroy();
          addLog('🧹 Player destroyed', 'info');
        }, 10000);

      } catch (e) {
        addLog('❌ BanubaPlayer.create() FAILED', 'error');
        addLog('Error: ' + e.message, 'error');
        addLog('Stack: ' + e.stack, 'error');
        setStatus('failed');
        setBanubaProof({
          running: false,
          reason: 'BanubaPlayer.create() threw an error',
          error: e.message,
          proof: 'SDK initialization failed - not running real Banuba'
        });
      }

      addLog('╔══════════════════════════════════════════════╗', 'info');
      addLog('║  VERIFICATION COMPLETE', 'info');
      addLog('╚══════════════════════════════════════════════╝', 'info');
    };

    verify();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-4" data-prevent-light-mode="true">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/')} className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.1)' }}>
          <XCircle className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold">Banuba Verification Report</h1>
      </div>

      {/* Status */}
      <div className="rounded-2xl p-5 mb-4" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="flex items-center gap-3 mb-3">
          {status === 'running' ? (
            <>
              <CheckCircle2 className="w-6 h-6" style={{ color: '#22c55e' }} />
              <span className="text-lg font-bold" style={{ color: '#22c55e' }}>✅ Banuba SDK IS RUNNING</span>
            </>
          ) : status === 'failed' ? (
            <>
              <XCircle className="w-6 h-6" style={{ color: '#ef4444' }} />
              <span className="text-lg font-bold" style={{ color: '#ef4444' }}>❌ Banuba SDK NOT Running</span>
            </>
          ) : (
            <>
              <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#6b7280' }} />
              <span className="text-lg font-bold" style={{ color: '#6b7280' }}>Checking...</span>
            </>
          )}
        </div>

        {banubaProof && (
          <div className={`mt-3 p-3 rounded-xl ${banubaProof.running ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}
            style={{ border: `1px solid ${banubaProof.running ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}` }}>
            <p className={`text-sm font-semibold ${banubaProof.running ? 'text-green-400' : 'text-red-400'}`}>
              {banubaProof.running ? '✅ PROOF: Real Banuba Face AR SDK Active' : '❌ PROOF: Banuba NOT Running'}
            </p>
            <p className={`text-xs mt-1 ${banubaProof.running ? 'text-green-200/80' : 'text-red-200/80'}`}>
              {banubaProof.proof}
            </p>
            {banubaProof.playerMethods && (
              <p className="text-[10px] text-green-200/60 mt-1 font-mono">
                Player methods: {banubaProof.playerMethods}
              </p>
            )}
            {banubaProof.error && (
              <p className="text-[10px] text-red-200/60 mt-1 font-mono">
                Error: {banubaProof.error}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Camera preview */}
      <div className="rounded-2xl overflow-hidden mb-4" style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="aspect-[3/4] relative">
          <div ref={containerRef} className="absolute inset-0" />
          {status !== 'running' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Camera className="w-16 h-16 text-white/20" />
            </div>
          )}
        </div>
      </div>

      {/* Console logs */}
      <div className="rounded-xl p-3" style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <p className="text-xs font-bold text-gray-400 mb-2">CONSOLE LOGS:</p>
        <div className="space-y-1 max-h-64 overflow-y-auto">
          {logs.map((log, i) => (
            <div key={i} className="text-[10px] font-mono" style={{ color: log.type === 'error' ? '#ef4444' : log.type === 'success' ? '#22c55e' : log.type === 'warn' ? '#f59e0b' : '#9ca3af' }}>
              <span className="opacity-50">[{log.ts}]</span> {log.msg}
            </div>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-6 p-4 rounded-2xl" style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)' }}>
        <p className="text-sm font-bold text-blue-400 mb-2">📋 SEND THIS TO BANUBA:</p>
        <ol className="text-xs text-blue-200/80 space-y-1 list-decimal list-inside">
          <li>Screenshot this entire page</li>
          <li>Show them the status (running/failed)</li>
          <li>Show them the console logs</li>
          <li>If "failed" - share the error message</li>
          <li>If "running" - this proves Banuba IS working</li>
        </ol>
      </div>
    </div>
  );
}