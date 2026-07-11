import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { CheckCircle2, XCircle, AlertCircle, RefreshCw, Send, Phone } from 'lucide-react';

export default function AdminPushDiagnostics() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [testUserId, setTestUserId] = useState('');
  const [testCallUserId, setTestCallUserId] = useState('');
  const [sending, setSending] = useState(false);
  const [calling, setCalling] = useState(false);

  const checkConfig = async () => {
    setLoading(true);
    setConfig(null);
    try {
      const res = await base44.functions.invoke('testApnsConfig', {});
      setConfig(res.data);
    } catch (e) {
      setConfig({ status: 'ERROR', error: e.message });
    }
    setLoading(false);
  };

  const sendTestPush = async () => {
    if (!testUserId.trim()) return alert('Enter a user ID');
    setSending(true);
    setTestResult(null);
    try {
      const res = await base44.functions.invoke('sendApnsPush', {
        user_id: testUserId.trim(),
        title: '🔔 Test Push Notification',
        body: 'If you see this on your iPhone, APNs is working!',
        data: { type: 'test' },
      });
      setTestResult({ success: res.data?.success, message: JSON.stringify(res.data, null, 2) });
    } catch (e) {
      setTestResult({ success: false, message: e.message });
    }
    setSending(false);
  };

  const sendTestCall = async () => {
    if (!testCallUserId.trim()) return alert('Enter a receiver user ID');
    setCalling(true);
    setTestResult(null);
    try {
      const res = await base44.functions.invoke('initiateCall', {
        receiver_id: testCallUserId.trim(),
        type: 'voice',
      });
      setTestResult({ success: true, message: JSON.stringify(res.data, null, 2) });
    } catch (e) {
      setTestResult({ success: false, message: e.message });
    }
    setCalling(false);
  };

  const StatusIcon = ({ text }) => {
    if (text?.startsWith('✅')) return <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />;
    if (text?.startsWith('❌')) return <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />;
    return <AlertCircle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />;
  };

  return (
    <div className="min-h-screen bg-black p-4 text-white">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-xl font-bold">APNs Push Diagnostics</h1>

        {/* Config Check */}
        <div className="rounded-2xl p-4 space-y-3" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">APNs Configuration</h2>
            <button
              onClick={checkConfig}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold active:scale-95"
              style={{ background: 'linear-gradient(135deg, #ff5500, #e91e8c)' }}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Checking...' : 'Check Config'}
            </button>
          </div>

          {config && (
            <div className="space-y-3">
              {/* Status */}
              <div className={`px-3 py-2 rounded-xl text-sm font-bold ${
                config.status === 'OK' ? 'bg-green-500/20 text-green-300' :
                config.status === 'INCOMPLETE' ? 'bg-yellow-500/20 text-yellow-300' :
                'bg-red-500/20 text-red-300'
              }`}>
                Status: {config.status}
              </div>

              {/* Secrets */}
              {config.report?.secrets && (
                <div className="space-y-1.5">
                  <p className="text-xs font-bold text-white/50 uppercase tracking-wider">Secrets</p>
                  {Object.entries(config.report.secrets).map(([key, val]) => (
                    <div key={key} className="flex items-start gap-2 text-xs">
                      <StatusIcon text={String(val)} />
                      <div>
                        <span className="font-mono text-white/60">{key}:</span>{' '}
                        <span className="text-white/80">{String(val)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Key validation */}
              {config.report?.key_validation && (
                <div className="flex items-start gap-2 text-xs">
                  <StatusIcon text={config.report.key_validation} />
                  <span className="text-white/80">{config.report.key_validation}</span>
                </div>
              )}

              {/* JWT */}
              {config.report?.jwt_generation && (
                <div className="flex items-start gap-2 text-xs">
                  <StatusIcon text={config.report.jwt_generation} />
                  <span className="text-white/80">{config.report.jwt_generation}</span>
                </div>
              )}

              {/* Token counts */}
              {config.report?.registered_tokens && (
                <div className="text-xs p-2 rounded-lg bg-white/5">
                  <span className="text-white/50">Registered tokens: </span>
                  <span className="text-white">VoIP: {config.report.registered_tokens.voip_tokens} / Push: {config.report.registered_tokens.push_tokens} / Profiles: {config.report.registered_tokens.total_profiles}</span>
                </div>
              )}

              {/* Instructions */}
              {config.report?.instructions?.length > 0 && (
                <div className="space-y-1 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                  {config.report.instructions.map((line, i) => (
                    <p key={i} className="text-xs text-yellow-200">{line}</p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Test Push */}
        <div className="rounded-2xl p-4 space-y-3" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <h2 className="font-semibold">Send Test Push Notification</h2>
          <p className="text-xs text-white/50">Enter a user ID (from UserProfile.user_id) to send a test push</p>
          <input
            value={testUserId}
            onChange={e => setTestUserId(e.target.value)}
            placeholder="User ID..."
            className="w-full px-3 py-2.5 rounded-xl text-sm bg-white/10 border border-white/10 text-white placeholder-white/30 outline-none"
          />
          <button
            onClick={sendTestPush}
            disabled={sending}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold active:scale-95"
            style={{ background: 'linear-gradient(135deg, #ff5500, #e91e8c)' }}
          >
            <Send className="w-4 h-4" />
            {sending ? 'Sending...' : 'Send Test Push'}
          </button>
        </div>

        {/* Test VoIP Call */}
        <div className="rounded-2xl p-4 space-y-3" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <h2 className="font-semibold">Send Test VoIP Call</h2>
          <p className="text-xs text-white/50">Enter receiver user ID to send a test VoIP call notification</p>
          <input
            value={testCallUserId}
            onChange={e => setTestCallUserId(e.target.value)}
            placeholder="Receiver User ID..."
            className="w-full px-3 py-2.5 rounded-xl text-sm bg-white/10 border border-white/10 text-white placeholder-white/30 outline-none"
          />
          <button
            onClick={sendTestCall}
            disabled={calling}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold active:scale-95"
            style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}
          >
            <Phone className="w-4 h-4" />
            {calling ? 'Sending...' : 'Test VoIP Call'}
          </button>
        </div>

        {/* Test Result */}
        {testResult && (
          <div className={`rounded-2xl p-4 text-xs font-mono whitespace-pre-wrap ${
            testResult.success ? 'bg-green-500/10 border border-green-500/20 text-green-200' : 'bg-red-500/10 border border-red-500/20 text-red-200'
          }`}>
            {testResult.message}
          </div>
        )}

        {/* Instructions */}
        <div className="rounded-2xl p-4 space-y-2 text-xs text-white/60" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <p className="font-bold text-white/80">Required Setup Checklist</p>
          <p>1. In Apple Developer Portal → Certificates, create an APNs Auth Key (.p8)</p>
          <p>2. Enable capabilities in Xcode: Push Notifications + Voice over IP</p>
          <p>3. Set secrets: APN_KEY_ID, APN_TEAM_ID, APN_BUNDLE_ID, APN_AUTH_KEY, APN_ENV=production</p>
          <p>4. TestFlight must use APN_ENV=production (not sandbox)</p>
          <p>5. Run on a real iPhone (simulator does not support VoIP push)</p>
          <p>6. Open the app on the iPhone first so it registers push & VoIP tokens</p>
        </div>
      </div>
    </div>
  );
}