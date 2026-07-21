import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, Camera, Mic, Image, Lock, Trash2, Shield, Eye } from 'lucide-react';

export default function PrivacyPolicy() {
  const navigate = useNavigate();
  const location = useLocation();
  const backTo = location.state?.backTo || '/settings';
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    const check = () => setIsLight(document.documentElement.classList.contains('light-mode'));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

  const bg = isLight ? 'hsl(270,25%,96%)' : 'rgb(6,3,10)';
  const headerBg = isLight ? 'rgba(248,244,255,0.96)' : 'rgba(8,4,12,0.95)';
  const headerBorder = isLight ? '1px solid rgba(160,80,255,0.12)' : '1px solid rgba(255,255,255,0.05)';
  const titleColor = isLight ? 'hsl(270,20%,12%)' : 'white';
  const backColor = isLight ? 'rgba(80,50,120,0.5)' : 'rgba(255,255,255,0.6)';
  const bodyColor = isLight ? 'rgba(60,30,80,0.7)' : 'rgba(255,255,255,0.7)';
  const mutedColor = isLight ? 'rgba(80,50,120,0.5)' : 'rgba(255,255,255,0.5)';
  const permBg = isLight ? 'rgba(255,100,0,0.05)' : 'rgba(255,80,0,0.07)';
  const permBorder = isLight ? '1px solid rgba(255,100,0,0.2)' : '1px solid rgba(255,80,0,0.2)';
  const permText = isLight ? 'rgba(60,30,80,0.7)' : 'rgba(255,255,255,0.55)';
  const permTitle = isLight ? 'hsl(270,20%,12%)' : 'white';
  const footerColor = isLight ? 'rgba(80,50,120,0.4)' : 'rgba(255,255,255,0.35)';
  const footerBorder = isLight ? '1px solid rgba(160,80,255,0.12)' : '1px solid rgba(255,255,255,0.08)';

  return (
    <div className="min-h-screen" style={{ background: bg }}>
      <div className="sticky top-0 z-40 flex items-center gap-3 px-4 py-4"
        style={{ background: headerBg, backdropFilter: 'blur(20px)', borderBottom: headerBorder, paddingTop: 'max(1rem, env(safe-area-inset-top))' }}>
        <button onClick={() => navigate(backTo)} className="w-8 h-8 flex items-center justify-center" style={{ color: backColor }}>
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold" style={{ color: titleColor }}>Privacy Policy</h1>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6 pb-28">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Lock className="w-5 h-5 text-orange-400" />
            <h2 className="text-lg font-bold" style={{ color: titleColor }}>Privacy Policy</h2>
          </div>
          <p className="text-sm" style={{ color: mutedColor }}>Effective Date: July 21, 2026 · Version 3.0</p>
          <p className="text-sm mt-3 leading-relaxed" style={{ color: bodyColor }}>
            SPICEY ("we", "us", or "our") is committed to protecting your personal information and your right to privacy. This Privacy Policy describes how we collect, use, disclose, and safeguard your information when you use the SPICEY mobile application and platform.
          </p>
        </div>

        {/* Device Permissions */}
        <div className="rounded-2xl p-4 space-y-3" style={{ background: permBg, border: permBorder }}>
          <p className="text-sm font-bold text-orange-400 mb-1">📱 Device Permissions We Request</p>
          {[
            { Icon: Camera, color: 'text-orange-400', title: 'Camera', desc: 'Used to take photos and record videos for posts, stories, reels, and live streams. We never access your camera passively or without your explicit action.' },
            { Icon: Mic, color: 'text-pink-400', title: 'Microphone', desc: 'Used to record audio for videos, voice messages, and video/voice calls. Audio is only captured when you actively use these features.' },
            { Icon: Image, color: 'text-purple-400', title: 'Photo Library', desc: 'Used to let you select photos and videos from your library to share. We only access media you explicitly choose to upload.' },
          ].map(({ Icon, color, title, desc }) => (
            <div key={title} className="flex items-start gap-3">
              <Icon className={`w-5 h-5 ${color} flex-shrink-0 mt-0.5`} />
              <div>
                <p className="text-sm font-semibold" style={{ color: permTitle }}>{title}</p>
                <p className="text-xs leading-relaxed" style={{ color: permText }}>{desc}</p>
              </div>
            </div>
          ))}
          <div className="flex items-start gap-3">
            <span className="text-lg flex-shrink-0">🔔</span>
            <div>
              <p className="text-sm font-semibold" style={{ color: permTitle }}>Push Notifications</p>
              <p className="text-xs leading-relaxed" style={{ color: permText }}>Used to alert you of messages, likes, comments, follows, and calls. Manageable at any time in device settings.</p>
            </div>
          </div>
        </div>

        {[
          { num: '1', title: 'Information We Collect', content: (
            <div className="space-y-2 text-sm leading-relaxed" style={{ color: bodyColor }}>
              <p><span className="font-semibold" style={{ color: titleColor }}>Account information:</span> Email address, username, display name, age-eligibility and legal-consent records. Passwords are handled by our authentication provider; SPICEY does not store or display your plaintext password.</p>
              <p><span className="font-semibold" style={{ color: titleColor }}>Profile information:</span> Profile photo, bio, website, location, and any other information you choose to add.</p>
              <p><span className="font-semibold" style={{ color: titleColor }}>User content:</span> Posts, photos, videos, stories, reels, comments, messages, and any other content you create.</p>
              <p><span className="font-semibold" style={{ color: titleColor }}>Usage data:</span> Interactions such as likes, follows, views, and shares — used solely to personalize your experience.</p>
              <p><span className="font-semibold" style={{ color: titleColor }}>Device information:</span> Device type, operating system, and app version for performance and security purposes.</p>
              <p><span className="font-semibold" style={{ color: titleColor }}>Location and calling data:</span> Location you choose to share, call-session metadata, notification preferences, and APNs/VoIP device tokens needed for maps, calls, and notifications.</p>
              <p><span className="font-semibold" style={{ color: titleColor }}>Communications:</span> Direct messages and chat content. Messages are stored to enable the messaging feature.</p>
            </div>
          )},
          { num: '2', title: 'How We Use Your Information', content: (
            <ul className="space-y-1.5 text-sm leading-relaxed" style={{ color: bodyColor }}>
              {[
                'Provide, operate, and improve the SPICEY platform',
                'Enable social features including following, messaging, and content discovery',
                'Send notifications about activity relevant to you',
                'Detect, prevent, and respond to abuse, spam, and policy violations',
                'Conduct AI-powered content moderation to protect platform safety',
                'Comply with legal obligations including law enforcement requests',
                'Respond to support requests and account issues',
              ].map(t => <li key={t} className="flex items-start gap-2"><span className="text-orange-400 flex-shrink-0">•</span>{t}</li>)}
            </ul>
          )},
          { num: '3', title: 'Content Moderation & Safety', content: (
            <div className="space-y-2 text-sm leading-relaxed" style={{ color: bodyColor }}>
              <p>To protect our community, SPICEY uses automated AI systems and human moderation to review content. This includes scanning images and videos for violations of our Community Guidelines, including illegal content such as CSAM, graphic violence, and hate speech.</p>
              <p><span className="font-semibold text-orange-400">Important:</span> Any illegal content detected — particularly content involving the exploitation of minors — will be immediately removed and reported to the National Center for Missing & Exploited Children (NCMEC) and relevant law enforcement agencies as required by law.</p>
            </div>
          )},
          { num: '4', title: 'Data Sharing and Sale', content: <p className="text-sm leading-relaxed" style={{ color: bodyColor }}>We do not sell personal information. We disclose only what is reasonably necessary to service providers that host, secure, deliver, analyze, or support the Platform, and when required or permitted by law to protect users, SPICEY, or the public. Where applicable, you may ask about or object to sale or sharing by contacting info@spicey.live.</p> },
          { num: '5', title: 'Data Security', content: <p className="text-sm leading-relaxed" style={{ color: bodyColor }}>We implement industry-standard security measures including encryption in transit (HTTPS/TLS) and at rest, role-based access controls, and regular security reviews. Despite these measures, no digital platform can guarantee absolute security. You are responsible for maintaining the security of your account credentials.</p> },
          { num: '6', title: 'Data Retention', content: <p className="text-sm leading-relaxed" style={{ color: bodyColor }}>We retain personal data while your account is active and as needed to provide and secure the service. Account deletion removes data from active systems according to our deletion process; limited backups, transaction records, fraud-prevention records, moderation evidence, and information required by law may be retained longer and then deleted or de-identified.</p> },
          { num: '7', title: "Children's Privacy (COPPA)", content: <p className="text-sm leading-relaxed" style={{ color: bodyColor }}>SPICEY is not directed to children under 13 years of age. We do not knowingly collect personal information from children under 13. If we become aware that a child under 13 has provided us with personal information, we will take immediate steps to delete such information and terminate the associated account. Parents who believe their child has created an account should contact us immediately at info@spicey.live.</p> },
          { num: '8', title: 'Your Rights', content: (
            <div className="space-y-2 text-sm leading-relaxed" style={{ color: bodyColor }}>
              <p>Depending on your jurisdiction, you may have the following rights regarding your personal data:</p>
              <ul className="space-y-1">
                {['Right to access your personal data', 'Right to correct inaccurate data', 'Right to deletion ("right to be forgotten")', 'Right to data portability', 'Right to withdraw consent', 'Right to lodge a complaint with a supervisory authority (EEA users)'].map(r => (
                  <li key={r} className="flex items-start gap-2"><span className="text-orange-400 flex-shrink-0">•</span>{r}</li>
                ))}
              </ul>
              <p>To exercise these rights, contact: <a href="mailto:info@spicey.live" className="text-orange-400">info@spicey.live</a></p>
            </div>
          )},
          { num: '9', title: 'AI Features & OpenAI', content: (
            <div className="space-y-2 text-sm leading-relaxed" style={{ color: bodyColor }}>
              <p>SPICEY includes an AI assistant feature called <span className="font-semibold" style={{ color: titleColor }}>Spicey AI</span>, which is powered by OpenAI's API. When you use AI features, your text input is sent to OpenAI's servers for processing.</p>
              <p><span className="font-semibold text-orange-400">Important:</span> AI-generated responses may not always be accurate, complete, or appropriate for every situation. Spicey AI is provided as a helpful tool only — please use your own judgment and do not rely solely on AI responses for important decisions.</p>
              <p>OpenAI's use of data submitted via the API is governed by <a href="https://openai.com/policies/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-orange-400">OpenAI's Privacy Policy</a>. SPICEY does not expose your OpenAI API credentials to users — all AI requests are processed securely on our backend servers.</p>
            </div>
          )},
          { num: '10', title: 'Third-Party Services', content: <p className="text-sm leading-relaxed" style={{ color: bodyColor }}>SPICEY uses service providers such as Supabase (database and authentication), Vercel and Cloudflare (hosting and delivery), Apple APNs (notifications and VoIP), OpenAI (AI features), YouTube/Google (embedded media), Mapbox (maps), Resend (email), and Stripe when payment features are used. Each provider processes only the data needed for its function under its own terms and privacy commitments.</p> },
          { num: '11', title: 'International Data Transfers', content: <p className="text-sm leading-relaxed" style={{ color: bodyColor }}>Your information may be transferred to and processed in countries other than the country in which you reside. These countries may have data protection laws that differ from your country. Where required, we ensure appropriate safeguards are in place for such transfers.</p> },
          { num: '12', title: 'Changes to This Policy', content: <p className="text-sm leading-relaxed" style={{ color: bodyColor }}>We may update this Policy as the Platform and law change. We will identify the effective date and, where required, provide advance notice or request renewed consent. Material changes do not reduce rights granted by applicable law.</p> },
        ].map(({ num, title, content }) => (
          <section key={num}>
            <h3 className="text-base font-bold mb-2" style={{ color: titleColor }}>{num}. {title}</h3>
            {content}
          </section>
        ))}

        <section>
          <div className="flex items-center gap-2 mb-2">
            <Trash2 className="w-4 h-4 text-red-400" />
            <h3 className="text-base font-bold" style={{ color: titleColor }}>Account Deletion</h3>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: bodyColor }}>
            You can permanently delete your account at any time from <span className="text-orange-400 font-semibold">Settings → Account & Safety → Delete Account</span>. All personal data will be permanently removed within 30 days.
          </p>
          <button onClick={() => navigate('/settings')}
            className="mt-3 px-4 py-2 rounded-xl text-sm font-semibold text-white"
            style={{ background: 'rgba(220,30,30,0.2)', border: '1px solid rgba(220,30,30,0.3)' }}>
            Go to Account Settings →
          </button>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-2">
            <Lock className="w-4 h-4 text-orange-400" />
            <h3 className="text-base font-bold" style={{ color: titleColor }}>Contact & Data Requests</h3>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: bodyColor }}>
            For privacy questions, data access requests, or to report a privacy concern, contact our Privacy Team:{' '}
            <a href="mailto:info@spicey.live" className="text-orange-400">info@spicey.live</a>
          </p>
        </section>

        <div className="text-xs pt-4" style={{ color: footerColor, borderTop: footerBorder }}>
          <p>SPICEY · info@spicey.live · © 2026 Spicey. All rights reserved. · Last updated: July 21, 2026</p>
        </div>
      </div>
    </div>
  );
}
