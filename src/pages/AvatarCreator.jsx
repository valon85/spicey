import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Save, RefreshCw, Sparkles, RotateCcw } from 'lucide-react';
import RPMAvatarCreator from '@/components/avatar/RPMAvatarCreator';
import AvatarViewer3D from '@/components/avatar/AvatarViewer3D';

// 2D AI avatar config (fallback path)
const CUSTOMIZATION = {
  hair: [
    { id: 'h1', label: 'Curly', prompt: 'curly dark hair' },
    { id: 'h2', label: 'Short', prompt: 'short fade haircut' },
    { id: 'h3', label: 'Long', prompt: 'long flowing hair' },
    { id: 'h4', label: 'Cap', prompt: 'wearing a baseball cap' },
    { id: 'h5', label: 'Wavy', prompt: 'wavy styled hair' },
  ],
  outfit: [
    { id: 'o1', label: 'Hoodie', prompt: 'black hoodie with Spicey logo' },
    { id: 'o2', label: 'Jacket', prompt: 'leather jacket' },
    { id: 'o3', label: 'Casual', prompt: 'casual t-shirt' },
    { id: 'o4', label: 'Blazer', prompt: 'stylish blazer' },
  ],
  bg: [
    { id: 'bg1', label: 'Neon', prompt: 'neon purple pink glowing ring background' },
    { id: 'bg2', label: 'Dark', prompt: 'deep dark cinematic background' },
    { id: 'bg3', label: 'Fire', prompt: 'orange fire glow background' },
    { id: 'bg4', label: 'Cyber', prompt: 'cyberpunk city lights background' },
  ],
};

export default function AvatarCreator() {
  const navigate = useNavigate();

  // State
  const [mode, setMode] = useState('choose'); // choose | rpm | rpm_done | ai_customize | ai_result
  const [glbUrl, setGlbUrl] = useState(null);           // real 3D GLB
  const [aiImageUrl, setAiImageUrl] = useState(null);   // 2D AI fallback image
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);

  const [opts, setOpts] = useState({
    hair: CUSTOMIZATION.hair[0],
    outfit: CUSTOMIZATION.outfit[0],
    bg: CUSTOMIZATION.bg[0],
  });
  const setOpt = (key, val) => setOpts(prev => ({ ...prev, [key]: val }));

  // ── Ready Player Me flow ──────────────────────────────────────────────────
  const handleRPMExport = (url) => {
    console.log('[AvatarCreator] Got GLB URL:', url);
    setGlbUrl(url);
    setMode('rpm_done');
  };

  // ── 2D AI fallback generation ─────────────────────────────────────────────
  const generateAI2D = async () => {
    setGenerating(true);
    setAiImageUrl(null);
    try {
      const prompt = `Hyper-realistic 3D avatar portrait for social media app Spicey.
        Style: cinematic neon-lit ultra-detailed photorealistic render.
        Hair: ${opts.hair.prompt}. Outfit: ${opts.outfit.prompt}. Background: ${opts.bg.prompt}.
        Dramatic neon rim lighting, purple and orange glow, cinematic depth of field.
        Portrait shot, centered face and upper body. No text or watermarks.`;
      const result = await base44.integrations.Core.GenerateImage({ prompt });
      setAiImageUrl(result.url);
      setMode('ai_result');
    } catch (err) {
      console.error('AI generation error:', err);
    }
    setGenerating(false);
  };

  // ── Save to profile ───────────────────────────────────────────────────────
  const saveToProfile = async () => {
    if (saving) return;
    setSaving(true);
    try {
      const user = await base44.auth.me();
      if (!user?.id) throw new Error('Not authenticated');

      const profiles = await base44.entities.UserProfile.filter({ user_id: user.id }, '-created_date', 1);
      const updateData = {};

      if (glbUrl) {
        updateData.avatar_3d_url = glbUrl;
        // Also set a 2D preview from RPM (swap .glb → .png for profile pic thumbnail)
        const previewUrl = glbUrl.replace('.glb', '.png').split('?')[0];
        updateData.avatar_url = previewUrl;
      } else if (aiImageUrl) {
        updateData.avatar_url = aiImageUrl;
      }

      if (profiles[0]) {
        await base44.entities.UserProfile.update(profiles[0].id, updateData);
      }

      if (updateData.avatar_url) {
        await base44.auth.updateMe({ avatar_url: updateData.avatar_url });
      }

      setSaved(true);
      setTimeout(() => navigate('/profile'), 1600);
    } catch (err) {
      console.error('Save error:', err);
    }
    setSaving(false);
  };

  // ════════════════════════════════════════════════════════════════════════════
  // SCREENS
  // ════════════════════════════════════════════════════════════════════════════

  // ── RPM iframe (full screen) ──────────────────────────────────────────────
  if (mode === 'rpm') {
    return <RPMAvatarCreator onAvatarExported={handleRPMExport} onClose={() => setMode('choose')} />;
  }

  // ── Choose method ─────────────────────────────────────────────────────────
  if (mode === 'choose') {
    return (
      <div style={S.page}>
        <BackBtn onClick={() => navigate(-1)} />

        {/* Glow bg */}
        <div style={{ position: 'absolute', top: '10%', left: '5%', width: 280, height: 280, borderRadius: '50%', background: 'rgba(193,0,255,0.1)', filter: 'blur(80px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '15%', right: '5%', width: 240, height: 240, borderRadius: '50%', background: 'rgba(255,45,85,0.08)', filter: 'blur(70px)', pointerEvents: 'none' }} />

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100dvh', padding: '40px 24px', gap: 0 }}>
          <div style={{ fontSize: 64, marginBottom: 8 }}>🧬</div>
          <div style={{ fontSize: 32, fontWeight: 900, background: 'linear-gradient(135deg,#FF6A00,#FF2D55,#C100FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 4, textAlign: 'center' }}>
            Spicey Avatar
          </div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 48, letterSpacing: 1 }}>
            Realistic · Unique · Animated
          </div>

          {/* 3D Option — PRIMARY */}
          <button onClick={() => setMode('rpm')} style={{ ...S.card, marginBottom: 16, width: '100%', maxWidth: 340 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: 'linear-gradient(135deg,#FF6A00,#C100FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>
                🧊
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 3 }}>Real 3D Avatar</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', lineHeight: 1.4 }}>
                  Full 3D GLB model · Live animations · Selfie scan · Powered by Ready Player Me
                </div>
              </div>
            </div>
            <div style={{ marginTop: 12, display: 'flex', gap: 6 }}>
              {['✅ Real GLB file', '✅ Live animations', '✅ Face scan'].map(t => (
                <div key={t} style={{ fontSize: 10, color: 'rgba(255,106,0,0.8)', background: 'rgba(255,106,0,0.1)', border: '1px solid rgba(255,106,0,0.2)', borderRadius: 20, padding: '3px 8px' }}>{t}</div>
              ))}
            </div>
          </button>

          {/* 2D AI Option — FALLBACK */}
          <button onClick={() => setMode('ai_customize')} style={{ ...S.cardSecondary, width: '100%', maxWidth: 340 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>
                ✨
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 16, fontWeight: 600, color: 'rgba(255,255,255,0.8)', marginBottom: 3 }}>AI Portrait Avatar</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', lineHeight: 1.4 }}>
                  AI-generated stylized image · Custom style · Saves as profile picture
                </div>
              </div>
            </div>
          </button>
        </div>
      </div>
    );
  }

  // ── 3D Avatar done — viewer + save ───────────────────────────────────────
  if (mode === 'rpm_done') {
    return (
      <div style={S.page}>
        <BackBtn onClick={() => setMode('rpm')} />
        <div style={{ padding: '72px 16px 140px', maxWidth: 500, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#fff' }}>Your 3D Avatar</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>
              Real GLB · Powered by Ready Player Me
            </div>
          </div>

          {/* 3D Viewer */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20, position: 'relative' }}>
            {/* Neon ring */}
            <div style={{ position: 'absolute', inset: -4, borderRadius: 20, background: 'conic-gradient(from 0deg,#FF6A00,#FF2D55,#C100FF,#FF6A00)', filter: 'blur(16px)', opacity: 0.4, animation: 'ringSpin 5s linear infinite', zIndex: 0 }} />
            <div style={{ position: 'relative', zIndex: 1, borderRadius: 16, overflow: 'hidden', border: '2px solid rgba(255,106,0,0.3)' }}>
              <AvatarViewer3D
                glbUrl={glbUrl}
                fallbackImageUrl={null}
                width={280}
                height={340}
                autoRotate={autoRotate}
              />
            </div>
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginBottom: 24 }}>
            <button
              onClick={() => setAutoRotate(r => !r)}
              style={{ ...S.pill, background: autoRotate ? 'rgba(255,106,0,0.2)' : 'rgba(255,255,255,0.05)', border: `1px solid ${autoRotate ? 'rgba(255,106,0,0.5)' : 'rgba(255,255,255,0.1)'}`, color: autoRotate ? '#FF6A00' : 'rgba(255,255,255,0.5)' }}>
              <RotateCcw size={14} />
              {autoRotate ? 'Rotating' : 'Rotate'}
            </button>
            <button onClick={() => setMode('rpm')} style={{ ...S.pill }}>
              <RefreshCw size={14} />
              Redo
            </button>
          </div>

          {/* GLB info badge */}
          <div style={{ background: 'rgba(0,200,120,0.08)', border: '1px solid rgba(0,200,120,0.2)', borderRadius: 12, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ fontSize: 20 }}>🟢</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#00C878' }}>Real 3D GLB Avatar</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>
                Stored as GLB · Renderable in Three.js · Live animations included
              </div>
            </div>
          </div>
        </div>

        {/* Save bar */}
        <SaveBar saved={saved} saving={saving} onSave={saveToProfile} label="Save 3D Avatar to Profile" />
        <style>{`@keyframes ringSpin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
      </div>
    );
  }

  // ── AI 2D customize ───────────────────────────────────────────────────────
  if (mode === 'ai_customize') {
    return (
      <div style={S.page}>
        <BackBtn onClick={() => setMode('choose')} />
        <div style={{ padding: '72px 16px 120px', maxWidth: 500, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#fff' }}>Style Your Avatar</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>AI-generated portrait</div>
          </div>

          {Object.entries(CUSTOMIZATION).map(([key, options]) => (
            <div key={key} style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', marginBottom: 10 }}>
                {key === 'bg' ? 'Background' : key.charAt(0).toUpperCase() + key.slice(1)}
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {options.map(opt => (
                  <button key={opt.id} onClick={() => setOpt(key, opt)} style={{
                    padding: '8px 14px', borderRadius: 20, cursor: 'pointer',
                    border: opts[key]?.id === opt.id ? '2px solid #FF6A00' : '1px solid rgba(255,255,255,0.1)',
                    background: opts[key]?.id === opt.id ? 'rgba(255,106,0,0.18)' : 'rgba(255,255,255,0.04)',
                    color: opts[key]?.id === opt.id ? '#FF6A00' : 'rgba(255,255,255,0.7)',
                    fontSize: 13, fontWeight: 600,
                  }}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: 16, background: 'linear-gradient(to top,#050008 60%,transparent)', zIndex: 10 }}>
          <button onClick={generateAI2D} disabled={generating}
            style={{ ...S.primaryBtn, width: '100%', maxWidth: 400, margin: '0 auto', display: 'flex', justifyContent: 'center', opacity: generating ? 0.7 : 1 }}>
            {generating ? <><Spin /> Generating…</> : <><Sparkles size={18} /> Generate Avatar</>}
          </button>
        </div>
      </div>
    );
  }

  // ── AI 2D result ──────────────────────────────────────────────────────────
  if (mode === 'ai_result') {
    return (
      <div style={S.page}>
        <BackBtn onClick={() => setMode('ai_customize')} />
        <div style={{ padding: '72px 16px 140px', maxWidth: 500, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#fff' }}>AI Portrait Avatar</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 4 }}>
              Stylized image · Not 3D · Want real 3D?{' '}
              <span onClick={() => setMode('rpm')} style={{ color: '#FF6A00', cursor: 'pointer', fontWeight: 700 }}>Use RPM</span>
            </div>
          </div>

          {aiImageUrl && (
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
              <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', border: '2px solid rgba(255,106,0,0.3)', width: 260, height: 260 }}>
                <img src={aiImageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            </div>
          )}

          <button onClick={() => setMode('ai_customize')} style={{ ...S.secondaryBtn, width: '100%', justifyContent: 'center', marginBottom: 12 }}>
            <RefreshCw size={16} /> Regenerate
          </button>
        </div>

        <SaveBar saved={saved} saving={saving} onSave={saveToProfile} label="Save as Profile Picture" />
      </div>
    );
  }

  return null;
}

// ── Shared sub-components ────────────────────────────────────────────────────

function BackBtn({ onClick }) {
  return (
    <button onClick={onClick} style={{
      position: 'fixed', top: 'max(20px, env(safe-area-inset-top))', left: 16, zIndex: 20,
      background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '50%', width: 40, height: 40,
      display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer',
    }}>
      <ChevronLeft size={20} />
    </button>
  );
}

function SaveBar({ saved, saving, onSave, label }) {
  return (
    <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: 16, background: 'linear-gradient(to top,#050008 60%,transparent)', zIndex: 10 }}>
      {saved ? (
        <div style={{ ...S.primaryBtn, width: '100%', maxWidth: 400, margin: '0 auto', justifyContent: 'center', background: 'linear-gradient(135deg,#00C875,#00A86B)' }}>
          ✓ Saved to Profile!
        </div>
      ) : (
        <button onClick={onSave} disabled={saving} style={{ ...S.primaryBtn, width: '100%', maxWidth: 400, margin: '0 auto', display: 'flex', justifyContent: 'center', opacity: saving ? 0.6 : 1 }}>
          {saving ? <><Spin /> Saving…</> : <><Save size={18} />{' '}{label}</>}
        </button>
      )}
    </div>
  );
}

function Spin() {
  return <div style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', flexShrink: 0, marginRight: 8 }} />;
}



// ── Styles ───────────────────────────────────────────────────────────────────
const S = {
  page: {
    minHeight: '100dvh', background: '#050008', position: 'relative', overflow: 'hidden',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  card: {
    background: 'rgba(255,106,0,0.07)', border: '1.5px solid rgba(255,106,0,0.25)',
    borderRadius: 18, padding: 18, cursor: 'pointer', textAlign: 'left',
    transition: 'all 0.2s',
  },
  cardSecondary: {
    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 18, padding: 18, cursor: 'pointer', textAlign: 'left',
  },
  primaryBtn: {
    padding: '16px 28px', borderRadius: 16,
    background: 'linear-gradient(135deg, #FF6A00, #FF2D55, #C100FF)',
    border: 'none', color: '#fff', fontSize: 16, fontWeight: 700,
    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
    boxShadow: '0 4px 24px rgba(255,106,0,0.4)',
  },
  secondaryBtn: {
    padding: '14px 20px', borderRadius: 16,
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
    color: 'rgba(255,255,255,0.7)', fontSize: 15, fontWeight: 600,
    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
  },
  pill: {
    padding: '8px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600,
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
    color: 'rgba(255,255,255,0.6)', cursor: 'pointer',
    display: 'flex', alignItems: 'center', gap: 6,
  },
};