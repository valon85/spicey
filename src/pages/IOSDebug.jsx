import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const ROW = ({ label, value, ok }) => (
  <div style={{
    display: 'flex', flexDirection: 'column', gap: 2,
    padding: '10px 14px',
    borderBottom: '1px solid rgba(255,255,255,0.07)',
    background: ok === true ? 'rgba(0,200,100,0.06)' : ok === false ? 'rgba(255,60,60,0.06)' : 'transparent',
  }}>
    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1 }}>{label}</span>
    <span style={{
      fontSize: 13, fontFamily: 'monospace', wordBreak: 'break-all',
      color: ok === true ? '#4ade80' : ok === false ? '#f87171' : '#e2e8f0'
    }}>{String(value ?? 'null')}</span>
  </div>
);

export default function IOSDebug() {
  const [results, setResults] = useState({});
  const [running, setRunning] = useState(false);
  const [logs, setLogs] = useState([]);

  const addLog = (msg) => {
    console.log('[IOS_DEBUG]', msg);
    setLogs(prev => [...prev, `${new Date().toISOString().slice(11, 23)} ${msg}`]);
  };

  const runDiagnostics = async () => {
    setRunning(true);
    setLogs([]);
    const out = {};

    // 1. Capacitor native platform
    try {
      const isNative = window.Capacitor?.isNativePlatform?.() ?? false;
      out.isNativePlatform = { value: isNative, ok: true };
      addLog(`isNativePlatform: ${isNative}`);
    } catch (e) {
      out.isNativePlatform = { value: `ERROR: ${e.message}`, ok: false };
      addLog(`isNativePlatform ERROR: ${e.message}`);
    }

    // 2. Capacitor platform string
    try {
      const platform = window.Capacitor?.getPlatform?.() ?? 'web';
      out.platform = { value: platform, ok: true };
      addLog(`platform: ${platform}`);
    } catch (e) {
      out.platform = { value: `ERROR: ${e.message}`, ok: false };
    }

    // 3. API base URL
    try {
      const protocol = window.location.protocol;
      const isNative = window.Capacitor?.isNativePlatform?.();
      const apiUrl = isNative ? 'https://spicey.live' : window.location.origin;
      out.apiUrl = { value: `${protocol} → ${apiUrl}`, ok: isNative ? apiUrl.startsWith('https') : true };
      addLog(`protocol: ${protocol}, apiUrl: ${apiUrl}`);
    } catch (e) {
      out.apiUrl = { value: `ERROR: ${e.message}`, ok: false };
    }

    // 4. localStorage token
    try {
      const t1 = localStorage.getItem('spicey_session');
      const t2 = localStorage.getItem('token');
      const found = t1 || t2;
      out.lsToken = { value: found ? `YES (${found.substring(0, 20)}...)` : 'MISSING', ok: !!found };
      addLog(`localStorage token: ${found ? 'found' : 'MISSING'}`);
    } catch (e) {
      out.lsToken = { value: `ERROR: ${e.message}`, ok: false };
    }

    // 5. Capacitor Preferences token
    try {
      const { Preferences } = await import('@capacitor/preferences');
      const { value } = await Preferences.get({ key: 'spicey_session' });
      out.capToken = { value: value ? `YES (${value.substring(0, 20)}...)` : 'MISSING', ok: !!value };
      addLog(`Capacitor Preferences token: ${value ? 'found' : 'MISSING'}`);
    } catch (e) {
      out.capToken = { value: `ERROR: ${e.message}`, ok: false };
      addLog(`Capacitor Preferences ERROR: ${e.message}`);
    }

    // 6. auth.me()
    try {
      addLog('Calling base44.auth.me()...');
      const user = await base44.auth.me();
      if (user?.id) {
        out.authMe = { value: `OK — id:${user.id} email:${user.email}`, ok: true };
        addLog(`auth.me() OK: ${user.id} / ${user.email}`);
      } else {
        out.authMe = { value: `No id in response: ${JSON.stringify(user).substring(0, 100)}`, ok: false };
        addLog(`auth.me() returned no id`);
      }
    } catch (e) {
      const status = e?.response?.status || e?.status || 'unknown';
      out.authMe = { value: `ERROR ${status}: ${e.message}`, ok: false };
      addLog(`auth.me() ERROR ${status}: ${e.message}`);
    }

    // 7. Reaction entity test (list then create a test record)
    try {
      addLog('Testing Reaction.filter()...');
      const reactions = await base44.entities.Reaction.filter({ post_id: '__diag_test__' });
      out.reactionFilter = { value: `OK — got ${Array.isArray(reactions) ? reactions.length : '?'} records`, ok: true };
      addLog(`Reaction.filter() OK`);
    } catch (e) {
      const status = e?.response?.status || e?.status || 'unknown';
      out.reactionFilter = { value: `ERROR ${status}: ${e.message}`, ok: false };
      addLog(`Reaction.filter() ERROR ${status}: ${e.message}`);
    }

    // 8. Camera permission
    try {
      if (navigator.permissions) {
        const perm = await navigator.permissions.query({ name: 'camera' });
        out.cameraPermission = { value: perm.state, ok: perm.state === 'granted' };
        addLog(`camera permission: ${perm.state}`);
      } else {
        // iOS WKWebView doesn't support navigator.permissions — try getUserMedia
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        stream.getTracks().forEach(t => t.stop());
        out.cameraPermission = { value: 'granted (getUserMedia succeeded)', ok: true };
        addLog(`camera: getUserMedia succeeded`);
      }
    } catch (e) {
      out.cameraPermission = { value: `DENIED/ERROR: ${e.message}`, ok: false };
      addLog(`camera permission ERROR: ${e.message}`);
    }

    // 9. Notification permission
    try {
      const status = Notification?.permission ?? 'unavailable';
      out.notifPermission = { value: status, ok: status === 'granted' };
      addLog(`notification permission: ${status}`);
    } catch (e) {
      out.notifPermission = { value: `ERROR: ${e.message}`, ok: false };
    }

    // 10. Network reachability — ping the API
    try {
      addLog('Pinging https://spicey.live ...');
      const start = Date.now();
      const resp = await fetch('https://spicey.live/api/admin/ai', { method: 'GET', signal: AbortSignal.timeout(5000) });
      const ms = Date.now() - start;
      out.networkPing = { value: `HTTP ${resp.status} in ${ms}ms`, ok: resp.status < 500 };
      addLog(`network ping: ${resp.status} in ${ms}ms`);
    } catch (e) {
      out.networkPing = { value: `FAILED: ${e.message}`, ok: false };
      addLog(`network ping FAILED: ${e.message}`);
    }

    // 11. MediaRecorder support (AI Talk)
    try {
      const types = ['audio/ogg;codecs=opus', 'audio/mp4', 'audio/webm'];
      const supported = types.filter(t => { try { return MediaRecorder.isTypeSupported(t); } catch { return false; } });
      out.mediaRecorder = { value: supported.length ? supported.join(', ') : 'NONE SUPPORTED', ok: supported.length > 0 };
      addLog(`MediaRecorder supported types: ${supported.join(', ') || 'NONE'}`);
    } catch (e) {
      out.mediaRecorder = { value: `ERROR: ${e.message}`, ok: false };
    }

    setResults(out);
    setRunning(false);
    addLog('=== Diagnostics complete ===');
  };

  useEffect(() => { runDiagnostics(); }, []);

  const LABELS = {
    isNativePlatform: 'Capacitor.isNativePlatform()',
    platform: 'Capacitor.getPlatform()',
    apiUrl: 'API Base URL',
    lsToken: 'Token in localStorage',
    capToken: 'Token in Capacitor Preferences',
    authMe: 'Spicey auth me()',
    reactionFilter: 'Reaction.filter() API call',
    cameraPermission: 'Camera Permission',
    notifPermission: 'Notification Permission',
    networkPing: 'Network Reachability (spicey.live)',
    mediaRecorder: 'MediaRecorder (AI Voice)',
  };

  const passCount = Object.values(results).filter(r => r?.ok === true).length;
  const failCount = Object.values(results).filter(r => r?.ok === false).length;

  return (
    <div style={{ minHeight: '100dvh', background: '#0a0a14', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <div style={{ padding: '20px 16px 12px', paddingTop: 'max(20px, env(safe-area-inset-top))', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 }}>
          iOS Build Diagnostics
        </div>
        <div style={{ fontSize: 22, fontWeight: 700 }}>🔧 Debug Panel</div>
        {Object.keys(results).length > 0 && (
          <div style={{ marginTop: 8, display: 'flex', gap: 12 }}>
            <span style={{ fontSize: 13, color: '#4ade80', fontWeight: 600 }}>✓ {passCount} pass</span>
            <span style={{ fontSize: 13, color: '#f87171', fontWeight: 600 }}>✗ {failCount} fail</span>
          </div>
        )}
      </div>

      {/* Results */}
      <div style={{ margin: '16px', borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
        {Object.entries(LABELS).map(([key, label]) => {
          const r = results[key];
          return (
            <ROW
              key={key}
              label={label}
              value={r ? r.value : (running ? '⏳ testing...' : '—')}
              ok={r?.ok}
            />
          );
        })}
      </div>

      {/* Re-run button */}
      <div style={{ padding: '0 16px 16px' }}>
        <button
          onClick={runDiagnostics}
          disabled={running}
          style={{
            width: '100%', padding: '14px', borderRadius: 12,
            background: running ? 'rgba(255,255,255,0.08)' : 'linear-gradient(135deg, #FF6A00, #C100FF)',
            border: 'none', color: '#fff', fontSize: 15, fontWeight: 700,
            cursor: running ? 'default' : 'pointer',
          }}>
          {running ? '⏳ Running diagnostics...' : '🔄 Re-run All Tests'}
        </button>
      </div>

      {/* Console logs */}
      <div style={{ margin: '0 16px', marginBottom: 32, borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.04)', fontSize: 11, color: 'rgba(255,255,255,0.5)', letterSpacing: 1, textTransform: 'uppercase' }}>
          Console Log [{logs.length}]
        </div>
        <div style={{ padding: '8px 14px', maxHeight: 260, overflowY: 'auto' }}>
          {logs.length === 0 && <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>No logs yet</div>}
          {logs.map((l, i) => (
            <div key={i} style={{ fontSize: 11, fontFamily: 'monospace', color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, wordBreak: 'break-all' }}>
              {l}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
