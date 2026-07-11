/**
 * Simple Banuba Test - Standalone proof page
 * No UI, just pure SDK testing with big visible results
 */
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { CheckCircle, XCircle, Loader2, Camera } from 'lucide-react';

export default function SimpleBanubaTest() {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const playerRef = useRef(null);

  const [status, setStatus] = useState('loading'); // loading | success | error
  const [message, setMessage] = useState('Starting test...');
  const [logs, setLogs] = useState([]);
  const [tokenInfo, setTokenInfo] = useState(null);
  const [playerInfo, setPlayerInfo] = useState(null);
  const [effectInfo, setEffectInfo] = useState(null);

  const addLog = (msg) => {
    const time = new Date().toISOString().split('T')[1].split('.')[0];
    setLogs(prev => [...prev, `[${time}] ${msg}`]);
    console.log('[BANUBA TEST]', msg);
  };

  useEffect(() => {
    runTest();
    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        addLog('Player destroyed');
      }
    };
  }, []);

  const runTest = async () => {
    try {
      addLog('═══════════════════════════════════════');
      addLog('SIMPLE BANUBA TEST');
      addLog('═══════════════════════════════════════');

      // Step 1: Load SDK
      addLog('Step 1: Loading BanubaSDK.js...');
      setMessage('Loading SDK...');
      
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = '/banuba/BanubaSDK.js';
        script.async = true;
        script.onload = resolve;
        script.onerror = () => reject(new Error('Failed to load BanubaSDK.js'));
        document.head.appendChild(script);
      });
      
      if (!window.BanubaPlayer) {
        throw new Error('window.BanubaPlayer is undefined after script load');
      }
      addLog('✓ SDK loaded successfully');
      addLog(`✓ BanubaPlayer available: ${typeof window.BanubaPlayer}`);
      
      // Get SDK version if available
      if (window.BanubaPlayer.version) {
        addLog(`✓ SDK Version: ${window.BanubaPlayer.version}`);
      } else {
        addLog(`ℹ SDK Version: Not exposed in window.BanubaPlayer.version`);
      }
      
      // Check effect path
      addLog(`ℹ Effect path: face_retouching (built-in)`);
      addLog(`ℹ Note: Built-in effects don't require external files`);

      // Step 2: Get Token
      addLog('Step 2: Getting Banuba token...');
      setMessage('Getting token...');
      
      const res = await base44.functions.invoke('getBanubaToken', {});
      const token = res.data?.token;
      
      if (!token) {
        throw new Error('Token is null');
      }
      addLog(`✓ Token received: ${token.substring(0, 20)}...`);
      
      // Token is a Banuba trial/license token - check format
      const isJWT = token.split('.').length === 3;
      
      if (isJWT) {
        // JWT token - decode expiration
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const tokenExpires = new Date(payload.exp * 1000);
          const hoursLeft = (tokenExpires - new Date()) / (1000 * 60 * 60);
          const tokenValid = hoursLeft > 0;
          
          setTokenInfo({
            type: 'Banuba Trial Token (JWT)',
            expires: tokenExpires.toISOString(),
            localTime: tokenExpires.toLocaleString('en-US', { timeZone: 'America/New_York' }),
            hoursLeft: hoursLeft.toFixed(1),
            valid: tokenValid,
            issuedAt: new Date(payload.iat * 1000).toLocaleString('en-US', { timeZone: 'America/New_York' })
          });
          
          addLog(`✓ Token type: Banuba Trial Token (JWT format)`);
          addLog(`✓ Token expires: ${tokenExpires.toISOString()}`);
          addLog(`✓ Token local time: ${tokenExpires.toLocaleString('en-US', { timeZone: 'America/New_York' })}`);
          addLog(`✓ Token valid for ${hoursLeft.toFixed(1)} hours`);
          
          if (!tokenValid) {
            addLog('❌ TOKEN IS EXPIRED!', 'error');
          }
        } catch (e) {
          addLog('⚠️ Could not decode JWT: ' + e.message);
          setTokenInfo({ type: 'Banuba Trial Token', error: e.message, valid: false });
        }
      } else {
        // License key format - no expiration check possible
        setTokenInfo({
          type: 'Banuba Trial Token (License)',
          length: token.length,
          valid: true,
          preview: token.substring(0, 20) + '...',
          note: '14-day trial license token'
        });
        addLog(`✓ Token type: Banuba Trial Token (License format)`);
        addLog(`✓ Token length: ${token.length} characters`);
        addLog(`✓ Token preview: ${token.substring(0, 20)}...`);
        addLog(`✓ Note: 14-day trial license (no client-side expiration check)`);
      }

      // Step 3: Get Camera
      addLog('Step 3: Getting camera stream...');
      setMessage('Getting camera...');
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      addLog('✓ Camera permission granted');

      // Step 4: Create Player
      addLog('Step 4: Creating Banuba Player...');
      setMessage('Creating player...');
      
      let player;
      try {
        player = await window.BanubaPlayer.create({
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
        addLog('✓ Player created successfully');
        addLog(`✓ Player methods: ${Object.keys(player).slice(0, 12).join(', ')}`);
        setPlayerInfo({
          success: true,
          methods: Object.keys(player).length,
          container: containerRef.current ? 'EXISTS' : 'NULL',
          tokenAccepted: true
        });
      } catch (playerErr) {
        addLog(`❌ Player.create() FAILED`, 'error');
        addLog(`❌ Error name: ${playerErr.name || 'Unknown'}`, 'error');
        addLog(`❌ Error message: ${playerErr.message || 'No message'}`, 'error');
        addLog(`❌ Error stack: ${playerErr.stack || 'No stack'}`, 'error');
        setPlayerInfo({
          success: false,
          error: playerErr.message || 'Unknown error',
          errorName: playerErr.name,
          tokenAccepted: false
        });
        throw new Error(`Player init failed: ${playerErr.message}`);
      }

      // Step 5: Apply Effect
      addLog('Step 5: Applying face retouching effect...');
      setMessage('Applying effect...');
      
      try {
        await player.setEffect('face_retouching', { intensity: 0.7 });
        addLog('✓ Effect applied successfully (intensity: 0.7)');
        setEffectInfo({
          success: true,
          name: 'face_retouching',
          intensity: 0.7,
          applied: true
        });
      } catch (effectErr) {
        addLog(`❌ Effect application FAILED`, 'error');
        addLog(`❌ Error: ${effectErr.message || 'Unknown'}`, 'error');
        setEffectInfo({
          success: false,
          error: effectErr.message || 'Failed to apply effect'
        });
        throw new Error(`Effect failed: ${effectErr.message}`);
      }

      // Step 6: Check Face Tracking
      addLog('Step 6: Checking face tracking...');
      setMessage('Checking face tracking...');
      
      let faceDetected = false;
      for (let i = 0; i < 20; i++) {
        await new Promise(resolve => setTimeout(resolve, 500));
        if (player.getFaceTrackingStatus) {
          faceDetected = player.getFaceTrackingStatus();
          if (faceDetected) {
            addLog('✓ FACE DETECTED! AR tracking active!');
            break;
          }
        }
      }
      
      if (!faceDetected) {
        addLog('⚠️ No face detected after 10 seconds');
      }

      // Success!
      setStatus('success');
      setMessage(faceDetected ? 'BANUBA WORKING! ✓' : 'SDK LOADED (no face)');
      addLog('═══════════════════════════════════════');
      addLog('TEST COMPLETE');
      addLog('═══════════════════════════════════════');

      // Take screenshot after 2 seconds
      setTimeout(() => {
        addLog('📸 Ready for screenshot!');
      }, 2000);

    } catch (err) {
      setStatus('error');
      setMessage('FAILED: ' + err.message);
      addLog(`❌ TEST FAILED: ${err.message}`);
      addLog(`❌ Stack: ${err.stack}`);
      addLog('═══════════════════════════════════════');
    }
  };

  return (
    <div className="fixed inset-0 bg-black overflow-auto" data-prevent-light-mode="true">
      {/* Header */}
      <div className="sticky top-0 z-50 px-4 py-3"
        style={{ 
          paddingTop: 'max(12px, env(safe-area-inset-top))',
          background: 'rgba(0,0,0,0.9)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
        <div className="flex items-center justify-between">
          <h1 className="text-white font-bold text-lg">🧪 Banuba Test</h1>
          <button onClick={() => navigate('/')}
            className="px-4 py-2 rounded-full text-xs font-semibold"
            style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }}>
            Close
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Status Banner */}
        <div className={`rounded-2xl p-6 border text-center ${
          status === 'success' ? 'border-green-500/30 bg-green-500/10' :
          status === 'error' ? 'border-red-500/30 bg-red-500/10' :
          'border-blue-500/30 bg-blue-500/10'
        }`}>
          {status === 'success' ? (
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-3" />
          ) : status === 'error' ? (
            <XCircle className="w-16 h-16 text-red-400 mx-auto mb-3" />
          ) : (
            <Loader2 className="w-16 h-16 text-blue-400 mx-auto mb-3 animate-spin" />
          )}
          <p className="text-white font-bold text-xl mb-1">{message}</p>
          <p className="text-white/60 text-sm">
            {status === 'loading' ? 'Testing Banuba SDK...' : status === 'success' ? 'SDK is working!' : 'See logs below'}
          </p>
        </div>

        {/* Camera Container */}
        <div className="rounded-2xl border border-white/10 overflow-hidden">
          <div className="px-4 py-3 border-b border-white/10">
            <p className="text-white font-semibold text-sm">📹 Live Camera (Banuba SDK)</p>
          </div>
          <div 
            ref={containerRef} 
            className="w-full aspect-video bg-black"
            style={{ minHeight: 400 }}
          />
        </div>

        {/* Test Results Panel */}
        <div className="rounded-2xl border border-white/10 p-4 space-y-3">
          <p className="text-white font-bold text-sm mb-2">📊 Banuba SDK Test Results</p>
          
          {/* SDK Status */}
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              logs.some(l => l.includes('✓ SDK loaded')) ? 'bg-green-500/20' : 'bg-red-500/20'
            }`}>
              {logs.some(l => l.includes('✓ SDK loaded')) ? (
                <CheckCircle className="w-5 h-5 text-green-400" />
              ) : (
                <XCircle className="w-5 h-5 text-red-400" />
              )}
            </div>
            <div className="flex-1">
              <p className="text-white font-semibold text-xs">1. SDK File Loaded</p>
              <p className="text-white/50 text-[10px]">
                {logs.some(l => l.includes('✓ SDK loaded')) ? '✓ BanubaSDK.js loaded' : '❌ Failed'}
              </p>
            </div>
          </div>

          {/* SDK Version */}
          {logs.some(l => l.includes('✓ SDK loaded')) && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-500/20">
                <Loader2 className="w-5 h-5 text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-white font-semibold text-xs">SDK Version</p>
                <p className="text-white/50 text-[10px]">
                  {logs.find(l => l.includes('SDK Version:'))?.split('SDK Version: ')[1] || 'Not exposed'}
                </p>
              </div>
            </div>
          )}

          {/* Token Status */}
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              tokenInfo?.valid ? 'bg-green-500/20' : tokenInfo?.error ? 'bg-red-500/20' : 'bg-blue-500/20'
            }`}>
              {tokenInfo?.valid ? (
                <CheckCircle className="w-5 h-5 text-green-400" />
              ) : tokenInfo?.error ? (
                <XCircle className="w-5 h-5 text-red-400" />
              ) : (
                <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
              )}
            </div>
            <div className="flex-1">
              <p className="text-white font-semibold text-xs">2. Token Format</p>
              <p className="text-white/50 text-[10px]">
                {tokenInfo?.type || 'Loading...'}
              </p>
            </div>
          </div>

          {/* Token Accepted by SDK */}
          {playerInfo && (
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                playerInfo.tokenAccepted ? 'bg-green-500/20' : 'bg-red-500/20'
              }`}>
                {playerInfo.tokenAccepted ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-400" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-white font-semibold text-xs">3. Token Accepted by SDK</p>
                <p className="text-white/50 text-[10px]">
                  {playerInfo.tokenAccepted ? '✓ YES - Token valid' : '❌ NO - Token rejected'}
                </p>
              </div>
            </div>
          )}

          {/* Player Init */}
          {playerInfo && (
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                playerInfo.success ? 'bg-green-500/20' : 'bg-red-500/20'
              }`}>
                {playerInfo.success ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-400" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-white font-semibold text-xs">4. Player.create() Result</p>
                <p className="text-white/50 text-[10px]">
                  {playerInfo.success ? `✓ SUCCESS (${playerInfo.methods} methods)` : `❌ FAILED`}
                </p>
              </div>
            </div>
          )}

          {/* Effect Loading */}
          {effectInfo && (
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                effectInfo.success ? 'bg-green-500/20' : 'bg-red-500/20'
              }`}>
                {effectInfo.success ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-400" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-white font-semibold text-xs">5. Effect Loading</p>
                <p className="text-white/50 text-[10px]">
                  {effectInfo.success ? `✓ ${effectInfo.name} APPLIED (intensity: ${effectInfo.intensity})` : `❌ FAILED`}
                </p>
              </div>
            </div>
          )}

          {/* Effect Path */}
          {effectInfo && effectInfo.success && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-500/20">
                <Loader2 className="w-5 h-5 text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-white font-semibold text-xs">Effect Path</p>
                <p className="text-white/50 text-[10px]">
                  face_retouching (built-in, no external file needed)
                </p>
              </div>
            </div>
          )}

          {/* Face Tracking */}
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              logs.some(l => l.includes('✓ FACE DETECTED')) ? 'bg-green-500/20' : 
              logs.some(l => l.includes('⚠️ No face detected')) ? 'bg-yellow-500/20' : 'bg-blue-500/20'
            }`}>
              {logs.some(l => l.includes('✓ FACE DETECTED')) ? (
                <CheckCircle className="w-5 h-5 text-green-400" />
              ) : logs.some(l => l.includes('⚠️ No face detected')) ? (
                <Loader2 className="w-5 h-5 text-yellow-400 animate-spin" />
              ) : (
                <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
              )}
            </div>
            <div className="flex-1">
              <p className="text-white font-semibold text-xs">6. Face Tracking</p>
              <p className="text-white/50 text-[10px]">
                {logs.some(l => l.includes('✓ FACE DETECTED')) ? '✓ AR tracking active!' : 
                 logs.some(l => l.includes('⚠️ No face detected')) ? '⚠️ No face detected' : 'Checking...'}
              </p>
            </div>
          </div>
        </div>

        {/* Token Details */}
        {tokenInfo && (
          <div className="rounded-2xl border border-white/10 p-4">
            <p className="text-white font-bold text-sm mb-2">🎫 Token Details</p>
            <div className="space-y-1 text-xs">
              <p className="text-white/60">Type: {tokenInfo.type}</p>
              {tokenInfo.length && <p className="text-white/60">Length: {tokenInfo.length} characters</p>}
              {tokenInfo.preview && <p className="text-white/60">Preview: {tokenInfo.preview}</p>}
              {tokenInfo.note && <p className="text-blue-400">{tokenInfo.note}</p>}
              {tokenInfo.expires && (
                <>
                  <p className="text-white/60">Expires: {tokenInfo.expires}</p>
                  <p className="text-white/60">Local Time: {tokenInfo.localTime} (NYC)</p>
                  <p className="text-white/60">Hours Left: {tokenInfo.hoursLeft}h</p>
                </>
              )}
            </div>
          </div>
        )}

        {/* Console Logs */}
        <div className="rounded-2xl border border-white/10 overflow-hidden">
          <div className="px-4 py-3 border-b border-white/10">
            <p className="text-white font-semibold text-sm">📋 Live Logs</p>
          </div>
          <div className="bg-black/80 p-3 font-mono text-xs space-y-1 min-h-[200px]">
            {logs.length === 0 ? (
              <p className="text-white/40">Starting...</p>
            ) : (
              logs.map((log, i) => (
                <div key={i} className={`${
                  log.includes('❌') ? 'text-red-400' : 
                  log.includes('✓') ? 'text-green-400' : 
                  log.includes('⚠️') ? 'text-yellow-400' : 
                  'text-white/80'
                } whitespace-pre-wrap break-words`}>
                  {log}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Retry Button */}
        <button onClick={runTest}
          className="w-full py-4 rounded-2xl font-bold text-white text-sm"
          style={{ background: 'linear-gradient(135deg, #ff5500, #e91e8c)' }}>
          🔄 Retry Test
        </button>
      </div>
    </div>
  );
}