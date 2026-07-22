import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { spiceySession } from '@/api/spiceyApi';
import {
  Apple,
  AlertCircle,
  Check,
  ChevronLeft,
  Clipboard,
  Download,
  ExternalLink,
  Globe2,
  Loader2,
  Rocket,
  Shield,
  Smartphone,
} from 'lucide-react';

const ADMIN_EMAILS = ['info@spicey.live', 'valondervishi13@gmail.com', 'vlora.dervisi@gmail.com'];
const PROJECT_PATH = '/Users/spicey/Documents/Codex/2026-06-29/github-plugin-github-openai-curated-remote-2/work/spicey-10-supabase-20260703';

const RELEASE_ACTIONS = [
  {
    key: 'web',
    title: 'Publish Web',
    subtitle: 'Deploy latest Spicey web version to spicey.live',
    icon: Globe2,
    color: '#ff5500',
    command: `cd ${PROJECT_PATH}\nnpx vite build --configLoader runner\nnpx --cache .npm-cache vercel --prod`,
    steps: [
      'Starts Vercel production deploy when Deploy Hook is configured',
      'Publishes the latest connected Vercel project to production',
      'The live site changes only after Vercel finishes the deploy',
    ],
    link: 'https://vercel.com/dashboard',
    linkLabel: 'Open Vercel',
  },
  {
    key: 'ios',
    title: 'Prepare iOS',
    subtitle: 'Sync Capacitor iOS project for Xcode archive',
    icon: Apple,
    color: '#e91e8c',
    command: `cd ${PROJECT_PATH}\nnpm run build\nnpx cap sync ios\nnpx cap open ios`,
    steps: [
      'Runs production build',
      'Syncs files into iOS project',
      'Open Xcode, Archive, then upload with Transporter/TestFlight',
    ],
    link: 'https://appstoreconnect.apple.com/',
    linkLabel: 'Open App Store Connect',
  },
  {
    key: 'android',
    title: 'Prepare Android',
    subtitle: 'Sync Capacitor Android project for APK/AAB build',
    icon: Smartphone,
    color: '#8b5cf6',
    command: `cd ${PROJECT_PATH}\nnpm run build\nnpx cap sync android\nnpx cap open android`,
    steps: [
      'Runs production build',
      'Syncs files into Android project',
      'Open Android Studio and build APK/AAB for testing or Play Console',
    ],
    link: 'https://play.google.com/console/',
    linkLabel: 'Open Play Console',
  },
];

function downloadText(filename, content) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

async function releaseApi(path, options = {}) {
  const token = spiceySession.token();
  const response = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  const text = await response.text();
  let data = {};
  try { data = text ? JSON.parse(text) : {}; } catch (_) {}
  if (!response.ok) throw new Error(getReleaseErrorMessage(data, response.status));
  return data;
}

function getReleaseErrorMessage(data, status) {
  const value = data?.message || data?.error || data?.details?.message || data?.details?.error;
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object') {
    return value.message || value.code || JSON.stringify(value);
  }
  if (data?.details && typeof data.details === 'object') {
    return data.details.message || data.details.code || JSON.stringify(data.details);
  }
  if (status === 404) {
    return 'Release API is not available here. Open Release Center on the dev server or deployed Vercel site, not static preview.';
  }
  return `Release request failed (${status})`;
}

function ReleaseCard({ action, copiedKey, onCopy, onPublish, busy, releaseConfig }) {
  const Icon = action.icon;
  const copied = copiedKey === action.key;
  const downloadUrl = action.key === 'ios'
    ? releaseConfig?.ios_download_url
    : action.key === 'android'
      ? releaseConfig?.android_download_url
      : '';

  const handleDownload = () => {
    downloadText(
      `spicey-${action.key}-release-steps.txt`,
      [
        `Spicey ${action.title}`,
        '',
        'Run this in Terminal:',
        '',
        action.command,
        '',
        'What this does:',
        ...action.steps.map((step) => `- ${step}`),
      ].join('\n'),
    );
  };

  return (
    <div
      className="rounded-3xl p-4"
      style={{
        background: 'linear-gradient(145deg, rgba(255,255,255,0.09), rgba(255,255,255,0.035))',
        border: `1px solid ${action.color}55`,
        boxShadow: `0 18px 42px ${action.color}20`,
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
          style={{ background: `${action.color}22`, border: `1px solid ${action.color}66` }}
        >
          <Icon className="w-6 h-6" style={{ color: action.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-white font-extrabold text-lg leading-tight">{action.title}</h2>
          <p className="text-white/45 text-sm mt-1">{action.subtitle}</p>
        </div>
      </div>

      <div className="mt-4 rounded-2xl p-3" style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.08)' }}>
        {action.steps.map((step) => (
          <div key={step} className="flex items-center gap-2 py-1">
            <Check className="w-3.5 h-3.5" style={{ color: action.color }} />
            <span className="text-white/65 text-xs">{step}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2 mt-4">
        {action.key === 'web' ? (
          <button
            type="button"
            onClick={() => onPublish(action)}
            disabled={busy}
            className="h-11 rounded-2xl flex items-center justify-center gap-2 text-sm font-bold text-white active:scale-95 transition-transform disabled:opacity-60"
            style={{ background: `linear-gradient(135deg, ${action.color}, #ff2d8d)` }}
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Rocket className="w-4 h-4" />}
            {busy ? 'Publishing' : 'Publish'}
          </button>
        ) : downloadUrl ? (
          <button
            type="button"
            onClick={() => window.open(downloadUrl, '_blank', 'noopener,noreferrer')}
            className="h-11 rounded-2xl flex items-center justify-center gap-2 text-sm font-bold text-white active:scale-95 transition-transform"
            style={{ background: `linear-gradient(135deg, ${action.color}, #ff2d8d)` }}
          >
            <Download className="w-4 h-4" />
            Download
          </button>
        ) : (
          <button
            type="button"
            onClick={handleDownload}
            className="h-11 rounded-2xl flex items-center justify-center gap-2 text-sm font-bold text-white active:scale-95 transition-transform"
            style={{ background: `linear-gradient(135deg, ${action.color}, #ff2d8d)` }}
          >
            <Download className="w-4 h-4" />
            Setup
          </button>
        )}
        <button
          type="button"
          onClick={() => onCopy(action)}
          className="h-11 rounded-2xl flex items-center justify-center gap-2 text-sm font-bold text-white active:scale-95 transition-transform"
          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
        >
          {copied ? <Check className="w-4 h-4" /> : <Clipboard className="w-4 h-4" />}
          {copied ? 'Copied' : action.key === 'web' ? 'Copy Deploy' : 'Copy'}
        </button>
      </div>

      <button
        type="button"
        onClick={() => window.open(action.link, '_blank', 'noopener,noreferrer')}
        className="w-full mt-2 h-10 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold text-white/70 active:scale-95 transition-transform"
        style={{ background: 'rgba(255,255,255,0.045)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <ExternalLink className="w-3.5 h-3.5" />
        {action.linkLabel}
      </button>
    </div>
  );
}

function formatBytes(bytes = 0) {
  if (!bytes) return '';
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = Number(bytes);
  let unit = 0;
  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024;
    unit += 1;
  }
  return `${size.toFixed(size >= 10 || unit === 0 ? 0 : 1)} ${units[unit]}`;
}

function MobileArtifactsPanel({ artifactState, onRefresh }) {
  const [downloadingKey, setDownloadingKey] = useState('');
  const [downloadError, setDownloadError] = useState('');

  const handleDownload = async (artifact) => {
    setDownloadError('');
    if (!artifact?.available || !artifact?.download_url) {
      setDownloadError(`${artifact?.label || 'Build'} nuk eshte gati akoma. Run GitHub Action dhe pastaj shtyp Refresh.`);
      return;
    }

    const downloadWindow = window.open('about:blank', '_blank');
    setDownloadingKey(artifact.key);
    try {
      const result = await releaseApi(artifact.download_url);
      if (result.download_url) {
        if (downloadWindow) {
          downloadWindow.location.href = result.download_url;
        } else {
          window.location.href = result.download_url;
        }
      } else {
        if (downloadWindow) downloadWindow.close();
        setDownloadError('GitHub nuk ktheu download link. Provoje perseri pas Refresh.');
      }
    } catch (error) {
      if (downloadWindow) downloadWindow.close();
      setDownloadError(error.message || 'Download nuk u hap. Provoje perseri.');
    } finally {
      setDownloadingKey('');
    }
  };

  return (
    <div
      className="rounded-3xl p-4"
      style={{
        background: 'linear-gradient(145deg, rgba(255,255,255,0.09), rgba(255,255,255,0.035))',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 18px 42px rgba(0,0,0,0.24)',
      }}
    >
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(255,85,0,0.15)', border: '1px solid rgba(255,85,0,0.28)' }}>
          <Download className="w-5 h-5 text-orange-300" />
        </div>
        <div className="flex-1">
          <p className="text-white font-extrabold text-sm">Direct GitHub Downloads</p>
          <p className="text-white/45 text-xs mt-1">
            Download direkt nga build artifacts: .ipa, .apk dhe .aab.
          </p>
          {artifactState.repository && (
            <p className="text-white/30 text-[11px] mt-1">{artifactState.repository}</p>
          )}
        </div>
        <button
          type="button"
          onClick={onRefresh}
          disabled={artifactState.loading}
          className="h-9 px-3 rounded-2xl text-xs font-bold text-white active:scale-95 transition-transform disabled:opacity-60"
          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
        >
          {artifactState.loading ? 'Loading' : 'Refresh'}
        </button>
      </div>

      {artifactState.error && (
        <p className="mt-3 text-orange-200/85 text-xs leading-relaxed">
          {artifactState.error}
        </p>
      )}
      {downloadError && (
        <p className="mt-3 text-orange-200/85 text-xs leading-relaxed">
          {downloadError}
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-4">
        {(artifactState.artifacts || []).map((artifact) => (
          <button
            key={artifact.key}
            type="button"
            disabled={downloadingKey === artifact.key}
            onClick={() => handleDownload(artifact)}
            className="min-h-[82px] rounded-2xl p-3 text-left active:scale-95 transition-transform disabled:opacity-45"
            style={{
              background: artifact.available
                ? 'linear-gradient(135deg, rgba(255,85,0,0.24), rgba(233,30,140,0.18), rgba(139,92,246,0.18))'
                : 'rgba(255,255,255,0.055)',
              border: artifact.available ? '1px solid rgba(255,85,0,0.28)' : '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-white font-extrabold text-sm">{artifact.label}</span>
              {downloadingKey === artifact.key ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Download className="w-4 h-4 text-white/75" />}
            </div>
            <p className="text-white/45 text-xs mt-2">
              {artifact.available ? `${formatBytes(artifact.size_in_bytes)} ready` : 'Run GitHub Action first'}
            </p>
            {artifact.created_at && (
              <p className="text-white/30 text-[11px] mt-1">
                {new Date(artifact.created_at).toLocaleString()}
              </p>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function AdminReleaseCenter() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [copiedKey, setCopiedKey] = useState('');
  const [busyKey, setBusyKey] = useState('');
  const [savingLinks, setSavingLinks] = useState(false);
  const [releaseConfig, setReleaseConfig] = useState(null);
  const [artifactState, setArtifactState] = useState({ loading: true, error: '', configured: false, repository: '', artifacts: [] });
  const [mobileLinks, setMobileLinks] = useState({ ios_download_url: '', android_download_url: '' });
  const [notice, setNotice] = useState(null);

  const loadMobileArtifacts = async () => {
    setArtifactState((current) => ({ ...current, loading: true, error: '' }));
    try {
      const artifacts = await releaseApi('/api/admin/mobile-artifacts');
      setArtifactState({
        loading: false,
        error: '',
        configured: Boolean(artifacts.configured),
        repository: artifacts.repository || '',
        artifacts: artifacts.artifacts || [],
      });
    } catch (error) {
      setArtifactState((current) => ({
        ...current,
        loading: false,
        error: error.message || 'Could not load GitHub artifacts.',
      }));
    }
  };

  useEffect(() => {
    let alive = true;
    const fallback = setTimeout(() => {
      if (alive) {
        setChecking(false);
        setNotice({ type: 'error', text: 'Could not verify admin session. You can still go back to Settings.' });
      }
    }, 6000);

    base44.auth.me().then(async (user) => {
      if (!alive) return;
      if (!user || !ADMIN_EMAILS.includes((user.email || '').toLowerCase())) {
        navigate('/settings', { replace: true });
        return;
      }
      try {
        const config = await releaseApi('/api/admin/deploy');
        if (alive) {
          setReleaseConfig(config);
          setMobileLinks({
            ios_download_url: config.ios_download_url || '',
            android_download_url: config.android_download_url || '',
          });
        }
      } catch (error) {
        if (alive) setNotice({ type: 'error', text: error.message || 'Release status is not available.' });
      }
      if (alive) await loadMobileArtifacts();
      if (alive) setChecking(false);
    }).catch((error) => {
      if (alive) {
        setNotice({ type: 'error', text: error.message || 'Could not load release panel.' });
        setChecking(false);
      }
    }).finally(() => clearTimeout(fallback));

    return () => {
      alive = false;
      clearTimeout(fallback);
    };
  }, [navigate]);

  const handleCopy = async (action) => {
    await navigator.clipboard.writeText(action.command);
    setCopiedKey(action.key);
    setTimeout(() => setCopiedKey(''), 1800);
  };

  const handlePublish = async (action) => {
    setBusyKey(action.key);
    setNotice(null);
    try {
      const result = await releaseApi('/api/admin/deploy', {
        method: 'POST',
        body: JSON.stringify({ action: 'publish_web' }),
      });
      setNotice({ type: 'success', text: result.message || 'Publish started.' });
    } catch (error) {
      setNotice({
        type: 'error',
        text: error.message || 'Publish could not start. Add VERCEL_DEPLOY_HOOK_URL in Vercel environment variables.',
      });
    } finally {
      setBusyKey('');
    }
  };

  const handleSaveMobileLinks = async () => {
    setSavingLinks(true);
    setNotice(null);
    try {
      const result = await releaseApi('/api/admin/deploy', {
        method: 'POST',
        body: JSON.stringify({
          action: 'save_mobile_links',
          ios_download_url: mobileLinks.ios_download_url,
          android_download_url: mobileLinks.android_download_url,
        }),
      });
      setReleaseConfig((previous) => ({
        ...(previous || {}),
        ios_download_configured: Boolean(result.ios_download_url),
        android_download_configured: Boolean(result.android_download_url),
        ios_download_url: result.ios_download_url || '',
        android_download_url: result.android_download_url || '',
        release_settings_saved: true,
        release_settings_updated_at: result.updated_at || '',
        release_settings_updated_by: result.updated_by || '',
        release_settings_error: '',
      }));
      setMobileLinks({
        ios_download_url: result.ios_download_url || '',
        android_download_url: result.android_download_url || '',
      });
      setNotice({ type: 'success', text: result.message || 'Download links saved.' });
    } catch (error) {
      setNotice({
        type: 'error',
        text: error.message || 'Could not save mobile download links.',
      });
    } finally {
      setSavingLinks(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#050208' }}>
        <div className="w-9 h-9 rounded-full border-2 animate-spin" style={{ borderColor: 'rgba(255,85,0,0.2)', borderTopColor: '#ff5500' }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-10" style={{ background: '#050208' }}>
      <div
        className="sticky top-0 z-40 flex items-center gap-3 px-4 py-4"
        style={{
          paddingTop: 'max(1rem, env(safe-area-inset-top))',
          background: 'rgba(5,2,8,0.92)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <button
          type="button"
          onClick={() => navigate('/settings', { replace: true })}
          className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.07)' }}
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
        <div className="flex-1">
          <h1 className="text-white font-extrabold text-lg">Release Center</h1>
          <p className="text-white/40 text-xs">Publish web and prepare mobile builds</p>
        </div>
        <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,85,0,0.15)' }}>
          <Rocket className="w-5 h-5" style={{ color: '#ff5500' }} />
        </div>
      </div>

      <div className="px-4 py-5 max-w-2xl mx-auto space-y-4">
        <div
          className="rounded-3xl p-4"
          style={{
            background: 'linear-gradient(135deg, rgba(255,85,0,0.16), rgba(233,30,140,0.12), rgba(139,92,246,0.12))',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-orange-300" />
            <p className="text-white font-bold text-sm">Admin-only release buttons</p>
          </div>
          <p className="text-white/55 text-sm leading-relaxed">
            Publish punon direkt kur është vendosur Vercel Deploy Hook. iOS/Android shfaqin Download kur admini ruan linkun real të .ipa, TestFlight, .apk ose .aab.
          </p>
        </div>

        <div
          className="rounded-3xl p-4"
          style={{
            background: 'linear-gradient(145deg, rgba(255,255,255,0.09), rgba(255,255,255,0.035))',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 18px 42px rgba(0,0,0,0.24)',
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Download className="w-4 h-4 text-pink-300" />
            <p className="text-white font-bold text-sm">Mobile download links</p>
          </div>
          <div className="space-y-3">
            <label className="block">
              <span className="text-white/55 text-xs font-bold">iOS link (.ipa / TestFlight)</span>
              <input
                value={mobileLinks.ios_download_url}
                onChange={(event) => setMobileLinks((current) => ({ ...current, ios_download_url: event.target.value }))}
                placeholder="https://..."
                className="mt-1 w-full h-12 rounded-2xl px-4 text-sm font-semibold text-white outline-none"
                style={{ background: 'rgba(0,0,0,0.34)', border: '1px solid rgba(255,255,255,0.1)' }}
              />
            </label>
            <label className="block">
              <span className="text-white/55 text-xs font-bold">Android link (.apk / .aab)</span>
              <input
                value={mobileLinks.android_download_url}
                onChange={(event) => setMobileLinks((current) => ({ ...current, android_download_url: event.target.value }))}
                placeholder="https://..."
                className="mt-1 w-full h-12 rounded-2xl px-4 text-sm font-semibold text-white outline-none"
                style={{ background: 'rgba(0,0,0,0.34)', border: '1px solid rgba(255,255,255,0.1)' }}
              />
            </label>
          </div>
          {releaseConfig?.release_settings_updated_at && (
            <p className="text-white/35 text-xs mt-3">
              Saved {new Date(releaseConfig.release_settings_updated_at).toLocaleString()}
              {releaseConfig.release_settings_updated_by ? ` by ${releaseConfig.release_settings_updated_by}` : ''}
            </p>
          )}
          {releaseConfig?.release_settings_error && (
            <p className="text-orange-200/80 text-xs mt-3 leading-relaxed">
              Storage setup needed: {releaseConfig.release_settings_error}
            </p>
          )}
          <button
            type="button"
            onClick={handleSaveMobileLinks}
            disabled={savingLinks}
            className="w-full mt-4 h-11 rounded-2xl flex items-center justify-center gap-2 text-sm font-bold text-white active:scale-95 transition-transform disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #ff5500, #e91e8c, #8b5cf6)' }}
          >
            {savingLinks ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            {savingLinks ? 'Saving' : 'Save Links'}
          </button>
        </div>

        <MobileArtifactsPanel artifactState={artifactState} onRefresh={loadMobileArtifacts} />

        {notice && (
          <div
            className="rounded-3xl p-4 flex items-start gap-3"
            style={{
              background: notice.type === 'success' ? 'rgba(34,197,94,0.12)' : 'rgba(255,59,48,0.12)',
              border: notice.type === 'success' ? '1px solid rgba(34,197,94,0.3)' : '1px solid rgba(255,59,48,0.3)',
            }}
          >
            {notice.type === 'success' ? <Check className="w-5 h-5 text-green-400 shrink-0" /> : <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />}
            <p className="text-white/75 text-sm leading-relaxed">{notice.text}</p>
          </div>
        )}

        {RELEASE_ACTIONS.map((action) => (
          <ReleaseCard
            key={action.key}
            action={action}
            copiedKey={copiedKey}
            onCopy={handleCopy}
            onPublish={handlePublish}
            busy={busyKey === action.key}
            releaseConfig={releaseConfig}
          />
        ))}
      </div>
    </div>
  );
}
