/**
 * DEBUG LOGIN PAGE — Standalone, no AuthContext, no redirects, no loops.
 * Visit: /debug-login
 * Purpose: Isolate iOS auth issues step by step.
 */
import React, { useState } from 'react';
import { Preferences } from '@capacitor/preferences';
import { APP_ID } from '@/lib/app-params';
import { base44, persistLogin, TokenStorage } from '@/api/base44Client';

const TOKEN_KEY = 'base44_auth_token';
// HARDCODED — never use appParams.appId at module level, it may be null before storage resolves
const APP_ID_CONST = "69fe90d3bbe7ad47925e4a0a";
const API_BASE = `https://app.base44.com/api/apps/${APP_ID_CONST}/auth`;

const isNative = typeof window !== 'undefined' && window.location.protocol === 'capacitor:';

async function saveToken(token) {
  const results = {};
  // localStorage
  try {
    localStorage.setItem(TOKEN_KEY, token);
    const back = localStorage.getItem(TOKEN_KEY);
    results.localStorage = { saved: true, readBack: back === token ? '✅ MATCH' : '❌ MISMATCH', preview: back?.substring(0, 30) };
  } catch (e) {
    results.localStorage = { error: e.message };
  }
  // Capacitor Preferences
  try {
    await Preferences.set({ key: TOKEN_KEY, value: token });
    const { value } = await Preferences.get({ key: TOKEN_KEY });
    results.capacitor = { saved: true, readBack: value === token ? '✅ MATCH' : '❌ MISMATCH', preview: value?.substring(0, 30) };
  } catch (e) {
    results.capacitor = { error: e.message };
  }
  return results;
}

async function readToken() {
  const results = {};
  try {
    const v = localStorage.getItem(TOKEN_KEY);
    results.localStorage = { found: !!v, preview: v?.substring(0, 30) };
  } catch (e) {
    results.localStorage = { error: e.message };
  }
  try {
    const { value } = await Preferences.get({ key: TOKEN_KEY });
    results.capacitor = { found: !!value, preview: value?.substring(0, 30) };
  } catch (e) {
    results.capacitor = { error: e.message };
  }
  return results;
}

export default function DebugLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [log, setLog] = useState([]);
  const [running, setRunning] = useState(false);

  const addLog = (label, data, isError = false) => {
    const entry = { label, data, isError, time: new Date().toISOString().substring(11, 23) };
    console.log(`[DEBUG_LOGIN] ${label}:`, data);
    setLog(prev => [...prev, entry]);
  };

  const runTest = async () => {
    setLog([]);
    setRunning(true);

    addLog('ENVIRONMENT', {
      isNative,
      protocol: window.location.protocol,
      hostname: window.location.hostname,
      platform: navigator.platform,
      userAgent: navigator.userAgent.substring(0, 80),
    });

    // ── STEP 1: LOGIN ──────────────────────────────────────────────────────
    addLog('STEP 1: LOGIN REQUEST', { email, api: API_BASE + '/login' });
    let token = null;
    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });
      const data = await res.json().catch(() => ({}));
      token = data?.access_token || data?.token || null;
      addLog('STEP 1: LOGIN RESPONSE', {
        status: res.status,
        ok: res.ok,
        hasToken: !!token,
        tokenLength: token?.length,
        tokenPreview: token?.substring(0, 40),
        rawKeys: Object.keys(data),
      }, !res.ok);
    } catch (e) {
      addLog('STEP 1: LOGIN ERROR', { error: e.message }, true);
      setRunning(false);
      return;
    }

    if (!token) {
      addLog('STEP 1: ABORTED', { reason: 'No token received from login response' }, true);
      setRunning(false);
      return;
    }

    // ── STEP 2+3+4: SAVE TOKEN via persistLogin (same as production flow) ──
    addLog('STEP 2: CALLING persistLogin(token, email)', {});
    try {
      await persistLogin(token, email.trim().toLowerCase());
      addLog('STEP 2: persistLogin complete', { success: true });
    } catch (e) {
      addLog('STEP 2: persistLogin ERROR', { error: e.message }, true);
    }

    // ── STEP 3: READ TOKEN BACK FROM STORAGE ─────────────────────────────
    addLog('STEP 3: READING TOKEN BACK', {});
    const readResults = await readToken();
    addLog('STEP 3: READ RESULTS', readResults);

    // ── STEP 4 (was 5): CALL auth.me() ───────────────────────────────────
    addLog('STEP 4: CALLING auth.me()', {});
    try {
      const meResult = await base44.auth.me();
      addLog('STEP 4: auth.me() RESULT', {
        rawType: typeof meResult,
        hasId: !!meResult?.id,
        id: meResult?.id,
        email: meResult?.email,
        fullName: meResult?.full_name,
        role: meResult?.role,
        allKeys: meResult ? Object.keys(meResult) : [],
      }, !meResult?.id);
    } catch (e) {
      addLog('STEP 4: auth.me() ERROR', { error: e.message, stack: e.stack?.substring(0, 200) }, true);
    }

    // ── STEP 5: CALL User.filter() ───────────────────────────────────────
    addLog('STEP 5: CALLING User.filter()', { email: email.trim().toLowerCase() });
    try {
      const users = await base44.entities.User.filter(
        { email: email.trim().toLowerCase() },
        '-created_date',
        1
      );
      addLog('STEP 5: User.filter() RESULT', {
        count: users?.length,
        firstId: users?.[0]?.id,
        firstEmail: users?.[0]?.email,
        firstName: users?.[0]?.full_name,
        allKeys: users?.[0] ? Object.keys(users[0]) : [],
      }, !users?.[0]?.id);
    } catch (e) {
      addLog('STEP 5: User.filter() ERROR', { error: e.message }, true);
    }

    // ── STEP 6: DIRECT API auth/me call with token ───────────────────────
    addLog('STEP 6: DIRECT fetch /auth/me with Bearer token', {});
    try {
      const meUrl = `https://app.base44.com/api/apps/${APP_ID_CONST}/auth/me`;
      const res = await fetch(meUrl, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      const data = await res.json().catch(() => ({}));
      addLog('STEP 6: DIRECT /auth/me RESULT', {
        status: res.status,
        ok: res.ok,
        hasId: !!data?.id,
        id: data?.id,
        email: data?.email,
        rawKeys: Object.keys(data),
      }, !res.ok);
    } catch (e) {
      addLog('STEP 6: DIRECT /auth/me ERROR', { error: e.message }, true);
    }

    addLog('✅ ALL STEPS COMPLETE', { check: 'See results above' });
    setRunning(false);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#0a0a0a', color: '#e0e0e0',
      fontFamily: 'monospace', fontSize: 12, overflowY: 'auto', padding: 16, zIndex: 99999,
    }}>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <h1 style={{ color: '#ff5500', marginBottom: 4, fontSize: 18 }}>🔬 DEBUG LOGIN</h1>
        <p style={{ color: '#666', marginBottom: 16, fontSize: 11 }}>
          isNative: <b style={{ color: isNative ? '#4ade80' : '#f87171' }}>{String(isNative)}</b>
          &nbsp;| protocol: <b style={{ color: '#fbbf24' }}>{window.location.protocol}</b>
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
          <input
            type="email" placeholder="Email" value={email}
            onChange={e => setEmail(e.target.value)}
            style={{ padding: '10px 12px', background: '#1a1a1a', border: '1px solid #333', color: '#fff', borderRadius: 8, fontSize: 14 }}
          />
          <input
            type="password" placeholder="Password" value={password}
            onChange={e => setPassword(e.target.value)}
            style={{ padding: '10px 12px', background: '#1a1a1a', border: '1px solid #333', color: '#fff', borderRadius: 8, fontSize: 14 }}
          />
          <button
            onClick={runTest} disabled={running || !email || !password}
            style={{
              padding: '12px 24px', background: running ? '#333' : 'linear-gradient(135deg,#ff5500,#e91e8c)',
              border: 'none', color: '#fff', borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: running ? 'not-allowed' : 'pointer',
            }}>
            {running ? '⏳ Running...' : '▶ Run All Debug Steps'}
          </button>
        </div>

        {log.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {log.map((entry, i) => (
              <div key={i} style={{
                background: entry.isError ? '#2a0a0a' : '#0f1f0f',
                border: `1px solid ${entry.isError ? '#7f1d1d' : '#14532d'}`,
                borderRadius: 6, padding: '8px 12px',
              }}>
                <div style={{ color: entry.isError ? '#f87171' : '#4ade80', fontWeight: 700, marginBottom: 4 }}>
                  [{entry.time}] {entry.label}
                </div>
                <pre style={{ margin: 0, color: '#d1d5db', fontSize: 11, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                  {JSON.stringify(entry.data, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}