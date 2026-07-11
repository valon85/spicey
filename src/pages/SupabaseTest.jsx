import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, CheckCircle, XCircle, Loader, Database, Info } from 'lucide-react';
import { supabase, supabaseConfigured, testSupabaseConnection } from '@/lib/supabaseClient';

export default function SupabaseTest() {
  const navigate = useNavigate();
  const [status, setStatus] = useState(null); // null | 'testing' | 'ok' | 'error'
  const [result, setResult] = useState(null);

  const runTest = async () => {
    setStatus('testing');
    setResult(null);
    const res = await testSupabaseConnection();
    setResult(res);
    setStatus(res.ok ? 'ok' : 'error');
  };

  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  return (
    <div style={{ minHeight: '100%', background: 'rgb(6,3,10)', padding: '0 0 80px' }}>
      {/* Header */}
      <div style={{ paddingTop: 'max(16px, env(safe-area-inset-top))', paddingBottom: 12, background: 'rgba(6,3,10,0.97)', backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 40 }}>
        <div className="flex items-center gap-3 px-4">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <ChevronLeft size={20} color="white" />
          </button>
          <div className="flex items-center gap-2">
            <Database size={20} color="#3ecf8e" />
            <span className="font-bold text-white text-lg">Supabase Connection Test</span>
          </div>
        </div>
      </div>

      <div className="px-4 pt-6 space-y-4">

        {/* Phase badge */}
        <div style={{ background: 'rgba(62,207,142,0.08)', border: '1px solid rgba(62,207,142,0.25)', borderRadius: 12, padding: '10px 14px' }}>
          <p style={{ color: '#3ecf8e', fontSize: 13, fontWeight: 600 }}>Phase 1 — Parallel Setup</p>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12, marginTop: 2 }}>Base44 is still fully active. This is a read-only connectivity test only.</p>
        </div>

        {/* Env variable status */}
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="font-semibold text-sm text-white">Environment Variables</p>
          </div>
          <EnvRow label="VITE_SUPABASE_URL" value={envUrl} />
          <EnvRow label="VITE_SUPABASE_ANON_KEY" value={envKey} />
        </div>

        {/* Instructions if not configured */}
        {!supabaseConfigured && (
          <div style={{ background: 'rgba(255,200,0,0.06)', border: '1px solid rgba(255,200,0,0.2)', borderRadius: 14, padding: 16 }}>
            <div className="flex items-start gap-2">
              <Info size={16} color="#f5a623" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <p className="font-semibold text-sm" style={{ color: '#f5a623' }}>Setup Required</p>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 4, lineHeight: 1.6 }}>
                  1. Create a project at <span style={{ color: '#3ecf8e' }}>supabase.com</span>{'\n'}
                  2. Go to Settings → API{'\n'}
                  3. Add to your <span style={{ color: 'rgba(255,255,255,0.8)' }}>.env</span> file:{'\n'}
                  <span style={{ color: '#3ecf8e', fontFamily: 'monospace' }}>
                    VITE_SUPABASE_URL=https://xxx.supabase.co{'\n'}
                    VITE_SUPABASE_ANON_KEY=eyJ...
                  </span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Test button */}
        <button
          onClick={runTest}
          disabled={status === 'testing' || !supabaseConfigured}
          style={{
            width: '100%', padding: '15px', borderRadius: 16, border: 'none', cursor: supabaseConfigured ? 'pointer' : 'not-allowed',
            background: supabaseConfigured ? 'linear-gradient(135deg, #3ecf8e, #1a9e6e)' : 'rgba(255,255,255,0.06)',
            color: supabaseConfigured ? 'white' : 'rgba(255,255,255,0.3)',
            fontWeight: 700, fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
          {status === 'testing' ? (
            <><Loader size={18} style={{ animation: 'spin 1s linear infinite' }} /> Testing connection…</>
          ) : (
            <><Database size={18} /> Run Connection Test</>
          )}
        </button>

        {/* Result */}
        {result && (
          <div style={{
            background: result.ok ? 'rgba(62,207,142,0.08)' : 'rgba(255,59,48,0.08)',
            border: `1px solid ${result.ok ? 'rgba(62,207,142,0.3)' : 'rgba(255,59,48,0.3)'}`,
            borderRadius: 16, padding: 16,
          }}>
            <div className="flex items-center gap-2 mb-3">
              {result.ok
                ? <CheckCircle size={20} color="#3ecf8e" />
                : <XCircle size={20} color="#FF3B30" />}
              <p className="font-bold" style={{ color: result.ok ? '#3ecf8e' : '#FF3B30', fontSize: 16 }}>
                {result.ok ? 'Connected Successfully' : 'Connection Failed'}
              </p>
            </div>
            {result.latencyMs !== undefined && (
              <ResultRow label="Latency" value={`${result.latencyMs}ms`} />
            )}
            {result.ok && (
              <ResultRow label="Supabase URL" value={envUrl?.replace('https://', '') || '—'} />
            )}
            {result.error && (
              <ResultRow label="Error" value={result.error} danger />
            )}
            {result.ok && (
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 10 }}>
                ✅ Phase 1 complete. Supabase client is ready. No Base44 features were changed.
              </p>
            )}
          </div>
        )}

        {/* What this does NOT do */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: 14 }}>
          <p className="font-semibold text-xs mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>THIS PAGE DOES NOT:</p>
          {['Replace Base44 auth', 'Touch the feed, posts, or media', 'Connect login or messages', 'Affect the iOS build'].map(item => (
            <div key={item} className="flex items-center gap-2 mb-1">
              <span style={{ color: '#FF3B30', fontSize: 12 }}>✗</span>
              <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>{item}</span>
            </div>
          ))}
        </div>

      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function EnvRow({ label, value }) {
  const isSet = !!value;
  return (
    <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
      <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, fontFamily: 'monospace' }}>{label}</span>
      <span style={{ fontSize: 12, fontWeight: 600, color: isSet ? '#3ecf8e' : '#FF3B30' }}>
        {isSet ? `${value.substring(0, 28)}…` : 'NOT SET'}
      </span>
    </div>
  );
}

function ResultRow({ label, value, danger }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-2">
      <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, flexShrink: 0 }}>{label}</span>
      <span style={{ color: danger ? '#FF3B30' : 'rgba(255,255,255,0.8)', fontSize: 12, textAlign: 'right', wordBreak: 'break-all' }}>{value}</span>
    </div>
  );
}