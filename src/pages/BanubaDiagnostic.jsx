/**
 * Banuba Diagnostic Page — Complete SDK Verification for iOS/TestFlight
 * Tests: SDK loading, token validation, camera permission, player init, effects, AR rendering
 * Shows detailed on-screen status for debugging production builds
 */
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { CheckCircle, XCircle, Loader2, Camera, Zap, Eye, AlertTriangle, Smartphone, FileText, Layers, Hash } from 'lucide-react';

export default function BanubaDiagnostic() {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const playerRef = useRef(null);

  const [steps, setSteps] = useState([
    { id: 1, name: 'Banuba SDK File', status: 'pending', details: '', duration: 0 },
    { id: 2, name: 'Token Validation', status: 'pending', details: '', duration: 0 },
    { id: 3, name: 'Camera Permission', status: 'pending', details: '', duration: 0 },
    { id: 4, name: 'Player Initialization', status: 'pending', details: '', duration: 0 },
    { id: 5, name: 'Effect Loading', status: 'pending', details: '', duration: 0 },
    { id: 6, name: 'AR Face Tracking', status: 'pending', details: '', duration: 0 },
  ]);

  const [consoleLogs, setConsoleLogs] = useState([]);
  const [banubaVersion, setBanubaVersion] = useState('');
  const [faceTracking, setFaceTracking] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [tokenDetails, setTokenDetails] = useState(null);
  const [deviceInfo, setDeviceInfo] = useState({});
  const [cssFilters, setCssFilters] = useState({ applied: false, value: '' });
  const [startTime] = useState(Date.now());

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    setConsoleLogs(prev => [...prev, { timestamp, message, type }]);
  };

  const updateStep = (id, status, details = '', duration = Date.now() - startTime) => {
    setSteps(prev => prev.map(step => 
      step.id === id ? { ...step, status, details, duration } : step
    ));
  };

  // Gather device info
  useEffect(() => {
    const info = {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      vendor: navigator.vendor,
      isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream,
      isCapacitor: !!(window.Capacitor?.isNativePlatform?.() || window.Capacitor?.platform),
      capacitorPlatform: window.Capacitor?.getPlatform?.(),
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
      devicePixelRatio: window.devicePixelRatio,
      webkitVersion: /Version\/([\d.]+)/.exec(navigator.userAgent)?.[1],
    };
    setDeviceInfo(info);
    addLog(`Device: ${info.isIOS ? 'iOS' : 'Non-iOS'} | Capacitor: ${info.isCapacitor ? 'YES' : 'NO'}`);
  }, []);

  // Step 1: Check SDK
  const checkSDK = async () => {
    addLog('Step 1: Checking Banuba SDK file...');
    const stepStart = Date.now();
    
    try {
      // Check if script exists
      const response = await fetch('/banuba/BanubaSDK.js', { method: 'HEAD' });
      if (!response.ok) {
        throw new Error(`SDK file not found (HTTP ${response.status})`);
      }
      
      const contentLength = response.headers.get('content-length');
      addLog(`✓ SDK file exists (${contentLength || 'unknown'} bytes)`);
      
      // Load SDK
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = '/banuba/BanubaSDK.js';
        script.async = true;
        script.onload = () => {
          addLog('✓ SDK script loaded and executed');
          resolve();
        };
        script.onerror = () => reject(new Error('SDK script failed to load'));
        document.head.appendChild(script);
      });
      
      if (typeof window.BanubaPlayer !== 'undefined') {
        updateStep(1, 'success', `SDK loaded (${contentLength || '?'} bytes)`, Date.now() - stepStart);
        addLog('✓ window.BanubaPlayer is available');
        
        // Get version if available
        if (window.BanubaPlayer.version) {
          setBanubaVersion(window.BanubaPlayer.version);
          addLog(`✓ Banuba version: ${window.BanubaPlayer.version}`);
        }
        
        return true;
      } else {
        throw new Error('window.BanubaPlayer is undefined after script load');
      }
    } catch (err) {
      updateStep(1, 'error', err.message, Date.now() - stepStart);
      addLog(`❌ SDK check failed: ${err.message}`, 'error');
      return false;
    }
  };

  // Step 2: Get Token
  const getToken = async () => {
    addLog('Step 2: Fetching Banuba token from backend...');
    const stepStart = Date.now();
    
    try {
      const res = await base44.functions.invoke('getBanubaToken', {});
      const token = res.data?.token;
      
      if (!token) {
        throw new Error('Token is null or undefined');
      }
      
      addLog(`✓ Token received: ${token.substring(0, 20)}...`);
      
      // Decode JWT to check expiration
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const exp = new Date(payload.exp * 1000);
        const now = new Date();
        const isExpired = exp < now;
        const hoursLeft = (exp - now) / (1000 * 60 * 60);
        
        setTokenDetails({
          exp: exp.toISOString(),
          isExpired,
          hoursLeft: hoursLeft.toFixed(1),
          payload: { ...payload, exp: undefined, iat: undefined }
        });
        
        addLog(`✓ Token expires: ${exp.toISOString()}`);
        if (isExpired) {
          addLog('⚠️ WARNING: Token is EXPIRED!', 'error');
          updateStep(2, 'error', 'Token expired', Date.now() - stepStart);
          return null;
        } else {
          addLog(`✓ Token valid for ${hoursLeft.toFixed(1)} more hours`);
        }
      } catch (e) {
        addLog('⚠️ Could not decode JWT token: ' + e.message);
      }
      
      updateStep(2, 'success', `Valid (${tokenDetails?.hoursLeft || '?'}h left)`, Date.now() - stepStart);
      return token;
    } catch (err) {
      updateStep(2, 'error', err.message, Date.now() - stepStart);
      addLog(`❌ Token fetch failed: ${err.message}`, 'error');
      return null;
    }
  };

  // Step 3: Camera Permission
  const checkCamera = async () => {
    addLog('Step 3: Requesting camera permission...');
    const stepStart = Date.now();
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        }
      });
      
      const videoTrack = stream.getVideoTracks()[0];
      const settings = videoTrack.getSettings();
      
      addLog('✓ Camera permission granted');
      addLog(`✓ Stream: ${settings.width}x${settings.height} @ ${settings.frameRate || '?'}fps`);
      
      setCameraStream(stream);
      updateStep(3, 'success', `${settings.width || '?'}x${settings.height || '?'} @ ${settings.frameRate || '?'}fps`, Date.now() - stepStart);
      return true;
    } catch (err) {
      updateStep(3, 'error', err.message, Date.now() - stepStart);
      addLog(`❌ Camera permission denied: ${err.message}`, 'error');
      return false;
    }
  };

  // Step 4: Initialize Player
  const initPlayer = async (token) => {
    addLog('Step 4: Initializing Banuba Player...');
    const stepStart = Date.now();
    
    try {
      if (!window.BanubaPlayer) {
        throw new Error('BanubaPlayer not available');
      }
      
      addLog(`Container ref: ${containerRef.current ? 'EXISTS' : 'NULL'}`);
      
      const player = await window.BanubaPlayer.create({
        container: containerRef.current,
        token: token,
        camera: {
          facingMode: 'user',
          resolution: { width: 1280, height: 720 },
        },
        effects: {
          enable: true,
          default: 'face_retouching',
        },
      });
      
      playerRef.current = player;
      addLog('✓ Player instance created');
      addLog(`✓ Player methods: ${Object.keys(player).slice(0, 12).join(', ')}`);
      
      // Check container for CSS filters
      if (containerRef.current) {
        const computedStyle = window.getComputedStyle(containerRef.current);
        const filter = computedStyle.filter;
        const backdropFilter = computedStyle.backdropFilter;
        setCssFilters({
          applied: filter !== 'none' || backdropFilter !== 'none',
          value: `filter=${filter}, backdrop=${backdropFilter}`
        });
        if (filter !== 'none' || backdropFilter !== 'none') {
          addLog(`⚠️ WARNING: CSS filters detected: ${filter} | ${backdropFilter}`, 'warning');
        } else {
          addLog('✓ No CSS filters on container');
        }
      }
      
      updateStep(4, 'success', `Methods: ${Object.keys(player).length}`, Date.now() - stepStart);
      return player;
    } catch (err) {
      updateStep(4, 'error', err.message, Date.now() - stepStart);
      addLog(`❌ Player initialization failed: ${err.message}`, 'error');
      return null;
    }
  };

  // Step 5: Load Effect
  const loadEffect = async (player) => {
    addLog('Step 5: Loading face retouching effect...');
    const stepStart = Date.now();
    
    try {
      if (!player || !player.setEffect) {
        throw new Error('Player not ready');
      }
      
      await player.setEffect('face_retouching', { intensity: 0.7 });
      addLog('✓ Effect "face_retouching" applied (intensity: 0.7)');
      
      // Check if effect methods exist
      const effectMethods = [
        'setEffect', 'removeEffect', 'getEffect', 
        'setIntensity', 'getIntensity'
      ].filter(m => typeof player[m] === 'function');
      addLog(`✓ Effect methods available: ${effectMethods.join(', ')}`);
      
      updateStep(5, 'success', 'Effect active', Date.now() - stepStart);
      return true;
    } catch (err) {
      updateStep(5, 'error', err.message, Date.now() - stepStart);
      addLog(`❌ Effect load failed: ${err.message}`, 'error');
      return false;
    }
  };

  // Step 6: Verify AR
  const verifyAR = () => {
    addLog('Step 6: Verifying AR face tracking...');
    const stepStart = Date.now();
    
    const checkInterval = setInterval(() => {
      if (playerRef.current?.getFaceTrackingStatus) {
        const hasFace = playerRef.current.getFaceTrackingStatus();
        setFaceTracking(hasFace);
        
        if (hasFace) {
          addLog('✓ Face detected - AR tracking active!');
          updateStep(6, 'success', 'Face tracking ✓', Date.now() - stepStart);
          clearInterval(checkInterval);
        }
      } else {
        addLog('⚠️ getFaceTrackingStatus method not available');
      }
    }, 500);
    
    // Timeout after 10 seconds
    setTimeout(() => {
      clearInterval(checkInterval);
      if (!faceTracking) {
        updateStep(6, 'warning', 'Camera active, no face detected', Date.now() - stepStart);
        addLog('⚠️ Face tracking not detected after 10s');
      }
    }, 10000);
  };

  // Run all tests
  const runDiagnostics = async () => {
    setConsoleLogs([]);
    setFaceTracking(false);
    addLog('═══════════════════════════════════════');
    addLog('Banuba Diagnostic Suite v2.0');
    addLog(`Device: ${deviceInfo.isIOS ? 'iOS' : 'Other'} | Capacitor: ${deviceInfo.isCapacitor ? 'YES' : 'NO'}`);
    addLog('═══════════════════════════════════════');
    
    const sdkReady = await checkSDK();
    if (!sdkReady) return;
    
    const token = await getToken();
    if (!token) return;
    
    const cameraReady = await checkCamera();
    if (!cameraReady) return;
    
    const player = await initPlayer(token);
    if (!player) return;
    
    const effectLoaded = await loadEffect(player);
    if (!effectLoaded) return;
    
    verifyAR();
    
    addLog('═══════════════════════════════════════');
    addLog('Diagnostic suite complete');
    addLog('═══════════════════════════════════════');
  };

  useEffect(() => {
    runDiagnostics();
    
    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        addLog('Player destroyed');
      }
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        addLog('Camera stream stopped');
      }
    };
  }, []);

  const getStatusIcon = (status) => {
    if (status === 'success') return <CheckCircle className="w-5 h-5 text-green-400" />;
    if (status === 'error') return <XCircle className="w-5 h-5 text-red-400" />;
    if (status === 'warning') return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
    return <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />;
  };

  const getStatusColor = (status) => {
    if (status === 'success') return 'border-green-500/30 bg-green-500/10';
    if (status === 'error') return 'border-red-500/30 bg-red-500/10';
    if (status === 'warning') return 'border-yellow-500/30 bg-yellow-500/10';
    return 'border-blue-500/30 bg-blue-500/10';
  };

  const allSuccess = steps.every(s => s.status === 'success');
  const hasErrors = steps.some(s => s.status === 'error');

  return (
    <div className="fixed inset-0 bg-black overflow-auto z-[100]" data-prevent-light-mode="true">
      {/* Header */}
      <div className="sticky top-0 z-50 px-4 py-3"
        style={{ 
          paddingTop: 'max(12px, env(safe-area-inset-top))',
          background: 'rgba(0,0,0,0.9)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
        <div className="flex items-center justify-between">
          <h1 className="text-white font-bold text-lg">🔍 Banuba Diagnostic</h1>
          <button onClick={() => navigate('/')}
            className="px-4 py-2 rounded-full text-xs font-semibold"
            style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }}>
            Close
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Overall Status */}
        <div className={`rounded-2xl p-4 border ${hasErrors ? 'border-red-500/30 bg-red-500/10' : allSuccess ? 'border-green-500/30 bg-green-500/10' : 'border-blue-500/30 bg-blue-500/10'}`}>
          <div className="flex items-center gap-3 mb-2">
            {hasErrors ? (
              <XCircle className="w-8 h-8 text-red-400" />
            ) : allSuccess ? (
              <CheckCircle className="w-8 h-8 text-green-400" />
            ) : (
              <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
            )}
            <div>
              <p className="text-white font-bold text-base">
                {hasErrors ? 'Banuba SDK Failed' : allSuccess ? 'Banuba SDK Working!' : 'Testing...'}
              </p>
              <p className="text-white/60 text-xs">
                {steps.filter(s => s.status === 'success').length}/{steps.length} checks passed
              </p>
            </div>
          </div>
          
          {banubaVersion && (
            <p className="text-white/80 text-xs mt-2">Version: {banubaVersion}</p>
          )}
        </div>

        {/* Device Info */}
        <div className="rounded-2xl border border-white/10 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Smartphone className="w-4 h-4 text-white/60" />
            <p className="text-white font-semibold text-sm">Device Information</p>
          </div>
          <div className="space-y-1 text-xs">
            <p className="text-white/60">Platform: {deviceInfo.platform || 'Unknown'}</p>
            <p className="text-white/60">iOS: {deviceInfo.isIOS ? 'YES ✓' : 'NO'}</p>
            <p className="text-white/60">Capacitor: {deviceInfo.isCapacitor ? 'YES ✓' : 'NO'}</p>
            <p className="text-white/60">Screen: {deviceInfo.innerWidth}x{deviceInfo.innerHeight} @ {deviceInfo.devicePixelRatio}x</p>
            <p className="text-white/60 truncate">UA: {deviceInfo.userAgent?.substring(0, 60)}...</p>
          </div>
        </div>

        {/* Token Details */}
        {tokenDetails && (
          <div className="rounded-2xl border border-white/10 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Hash className="w-4 h-4 text-white/60" />
              <p className="text-white font-semibold text-sm">Token Details</p>
            </div>
            <div className="space-y-1 text-xs">
              <p className={tokenDetails.isExpired ? 'text-red-400' : 'text-green-400'}>
                Status: {tokenDetails.isExpired ? 'EXPIRED ❌' : 'VALID ✓'}
              </p>
              <p className="text-white/60">Expires: {tokenDetails.exp}</p>
              <p className="text-white/60">Time Left: {tokenDetails.hoursLeft} hours</p>
            </div>
          </div>
        )}

        {/* CSS Filters Check */}
        <div className="rounded-2xl border border-white/10 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Layers className="w-4 h-4 text-white/60" />
            <p className="text-white font-semibold text-sm">CSS Filters Check</p>
          </div>
          <div className="space-y-1 text-xs">
            <p className={cssFilters.applied ? 'text-red-400' : 'text-green-400'}>
              Status: {cssFilters.applied ? 'FILTERS DETECTED ❌' : 'CLEAN ✓'}
            </p>
            {cssFilters.value && (
              <p className="text-white/60 truncate">{cssFilters.value}</p>
            )}
          </div>
        </div>

        {/* Step-by-step status */}
        <div className="space-y-2">
          {steps.map(step => (
            <div key={step.id} className={`rounded-xl p-3 border ${getStatusColor(step.status)}`}>
              <div className="flex items-start gap-3">
                {getStatusIcon(step.status)}
                <div className="flex-1">
                  <p className="text-white font-semibold text-sm">{step.name}</p>
                  {step.details && (
                    <p className="text-white/60 text-xs mt-1">{step.details}</p>
                  )}
                  {step.duration > 0 && (
                    <p className="text-white/40 text-[10px] mt-0.5">{step.duration}ms</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Live camera preview */}
        <div className="rounded-2xl border border-white/10 overflow-hidden">
          <div className="px-4 py-3 border-b border-white/10">
            <p className="text-white font-semibold text-sm">📹 Live Camera Preview</p>
          </div>
          <div 
            ref={containerRef} 
            className="w-full aspect-video bg-black"
            style={{ minHeight: 300 }}
          />
          {faceTracking && (
            <div className="px-4 py-2 bg-green-500/20 border-t border-green-500/30">
              <p className="text-green-400 text-xs font-semibold">✓ Face tracking active</p>
            </div>
          )}
        </div>

        {/* Console logs */}
        <div className="rounded-2xl border border-white/10 overflow-hidden">
          <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-white/60" />
              <p className="text-white font-semibold text-sm">Console Logs</p>
            </div>
            <button onClick={() => setConsoleLogs([])}
              className="text-xs text-white/60 hover:text-white">
              Clear
            </button>
          </div>
          <div className="bg-black/80 p-3 max-h-80 overflow-y-auto font-mono text-xs space-y-1">
            {consoleLogs.length === 0 ? (
              <p className="text-white/40">No logs yet...</p>
            ) : (
              consoleLogs.map((log, i) => (
                <div key={i} className={`${log.type === 'error' ? 'text-red-400' : log.type === 'warning' ? 'text-yellow-400' : 'text-white/80'}`}>
                  <span className="text-white/40">[{log.timestamp}]</span> {log.message}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="rounded-2xl border border-white/10 p-4">
          <p className="text-white font-semibold text-sm mb-2">📱 Testing Instructions</p>
          <ol className="text-white/60 text-xs space-y-1 list-decimal list-inside">
            <li>Open this page on iPhone/TestFlight device</li>
            <li>Allow camera permission when prompted</li>
            <li>Wait for all 6 steps to complete</li>
            <li>Check which step fails (red status)</li>
            <li>Read console logs for error details</li>
            <li>Screenshot results and send to support</li>
          </ol>
        </div>

        {/* Retry button */}
        <button onClick={runDiagnostics}
          className="w-full py-4 rounded-2xl font-bold text-white text-sm"
          style={{ background: 'linear-gradient(135deg, #ff5500, #e91e8c)' }}>
          🔄 Retry Diagnostics
        </button>
      </div>
    </div>
  );
}