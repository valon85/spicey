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

const ADMIN_EMAILS = ['info@spicey.live', 'valondervishi13@gmail.com'];
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
  if (!response.ok) throw new Error(data.message || data.error || `Release request failed (${response.status})`);
  return data;
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

export default function AdminReleaseCenter() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [copiedKey, setCopiedKey] = useState('');
  const [busyKey, setBusyKey] = useState('');
  const [releaseConfig, setReleaseConfig] = useState(null);
  const [notice, setNotice] = useState(null);

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
        if (alive) setReleaseConfig(config);
      } catch (error) {
        if (alive) setNotice({ type: 'error', text: error.message || 'Release status is not available.' });
      }
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
            Publish punon direkt vetëm kur është vendosur Vercel Deploy Hook në server. iOS/Android shfaqin download vetëm nëse ekziston URL reale për build-in; ndryshe japin komandat për Xcode/Android Studio.
          </p>
        </div>

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
