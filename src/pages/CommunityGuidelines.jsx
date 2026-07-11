import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, Shield, Ban, AlertTriangle, CheckCircle, Heart, Flag } from 'lucide-react';

export default function CommunityGuidelines() {
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
  const footerColor = isLight ? 'rgba(80,50,120,0.4)' : 'rgba(255,255,255,0.35)';
  const footerBorder = isLight ? '1px solid rgba(160,80,255,0.12)' : '1px solid rgba(255,255,255,0.08)';

  const doList = [
    { emoji: '✅', text: 'Be respectful, kind, and inclusive toward all community members' },
    { emoji: '✅', text: 'Share authentic, original content that you own or have rights to share' },
    { emoji: '✅', text: 'Engage constructively — celebrate others, offer positive feedback' },
    { emoji: '✅', text: 'Report content or users that violate these guidelines' },
    { emoji: '✅', text: 'Protect your privacy and that of others' },
    { emoji: '✅', text: 'Use the platform in compliance with all applicable laws' },
  ];

  const dontList = [
    { emoji: '🚫', text: 'Post pornography, nudity, or sexually explicit content of any kind' },
    { emoji: '🚫', text: 'Upload, create, or share content involving the sexual exploitation of minors (CSAM) — this is illegal and will result in immediate account termination and law enforcement referral' },
    { emoji: '🚫', text: 'Share graphic violence, gore, or content glorifying harm or death' },
    { emoji: '🚫', text: 'Harass, bully, threaten, stalk, or intimidate any individual' },
    { emoji: '🚫', text: 'Use hate speech or content targeting people based on race, ethnicity, religion, gender, sexual orientation, disability, or other protected characteristics' },
    { emoji: '🚫', text: 'Impersonate another person, celebrity, brand, or organization' },
    { emoji: '🚫', text: 'Create fake, bot, or spam accounts, or use automation to artificially inflate engagement' },
    { emoji: '🚫', text: 'Spread misinformation, fake news, or deceptive content intended to mislead' },
    { emoji: '🚫', text: 'Conduct scams, phishing, pyramid schemes, or any fraudulent activity' },
    { emoji: '🚫', text: 'Share private information about others without their consent (doxxing)' },
    { emoji: '🚫', text: 'Post content that promotes, glorifies, or facilitates illegal activities' },
    { emoji: '🚫', text: 'Upload copyrighted material without permission from the copyright holder' },
    { emoji: '🚫', text: 'Self-harm content or content encouraging dangerous, life-threatening behavior' },
  ];

  const enforcement = [
    { level: '⚠️ Warning', desc: 'First-time minor violations may receive a warning and content removal.' },
    { level: '🔇 Temporary Suspension', desc: 'Repeated or moderate violations result in temporary account suspension (1–30 days).' },
    { level: '🔒 Permanent Ban', desc: 'Severe or repeated violations result in permanent account termination and device-level block.' },
    { level: '⚖️ Legal Action', desc: 'Illegal content (CSAM, fraud, threats) will be reported to law enforcement. SPICEY cooperates fully with authorities.' },
  ];

  return (
    <div className="min-h-screen" style={{ background: bg }}>
      <div className="sticky top-0 z-40 flex items-center gap-3 px-4 py-4"
        style={{ background: headerBg, backdropFilter: 'blur(20px)', borderBottom: headerBorder, paddingTop: 'max(1rem, env(safe-area-inset-top))' }}>
        <button onClick={() => navigate('/settings')} className="w-8 h-8 flex items-center justify-center" style={{ color: backColor }}>
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold" style={{ color: titleColor }}>Community Guidelines</h1>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6 pb-28">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-5 h-5 text-orange-400" />
            <h2 className="text-lg font-bold" style={{ color: titleColor }}>Community Guidelines</h2>
          </div>
          <p className="text-sm" style={{ color: mutedColor }}>Effective: May 29, 2026</p>
          <p className="text-sm mt-3 leading-relaxed" style={{ color: bodyColor }}>
            SPICEY is built on creativity, authenticity, and mutual respect. These guidelines exist to protect our community and ensure that SPICEY remains a safe, positive, and welcoming space for everyone. By using SPICEY, you agree to follow these guidelines. Violations may result in content removal, account suspension, or permanent bans.
          </p>
        </div>

        {/* Do list */}
        <div className="rounded-2xl p-4 space-y-2.5" style={{ background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.2)' }}>
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <p className="text-sm font-bold text-green-400">What We Encourage</p>
          </div>
          {doList.map(({ emoji, text }) => (
            <div key={text} className="flex items-start gap-2">
              <span className="flex-shrink-0 text-sm">{emoji}</span>
              <p className="text-xs leading-relaxed" style={{ color: bodyColor }}>{text}</p>
            </div>
          ))}
        </div>

        {/* Don't list */}
        <div className="rounded-2xl p-4 space-y-2.5" style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <div className="flex items-center gap-2 mb-1">
            <Ban className="w-4 h-4 text-red-400" />
            <p className="text-sm font-bold text-red-400">What Is Strictly Prohibited</p>
          </div>
          {dontList.map(({ emoji, text }) => (
            <div key={text} className="flex items-start gap-2">
              <span className="flex-shrink-0 text-sm">{emoji}</span>
              <p className="text-xs leading-relaxed" style={{ color: bodyColor }}>{text}</p>
            </div>
          ))}
        </div>

        {/* Content Responsibility */}
        <section>
          <h3 className="text-base font-bold mb-2" style={{ color: titleColor }}>Your Responsibility as a Creator</h3>
          <div className="rounded-2xl p-4" style={{ background: 'rgba(255,80,0,0.07)', border: '1px solid rgba(255,80,0,0.2)' }}>
            <p className="text-sm leading-relaxed" style={{ color: bodyColor }}>
              <span className="font-bold text-orange-400">You are fully responsible for the content you upload.</span> By posting on SPICEY, you confirm that:
            </p>
            <ul className="mt-3 space-y-1.5">
              {[
                'You own the content or have obtained all necessary rights and permissions',
                'The content does not violate anyone\'s copyright, trademark, or privacy rights',
                'The content complies with all applicable laws and regulations',
                'You consent to SPICEY displaying and distributing the content on the platform',
              ].map(t => (
                <li key={t} className="flex items-start gap-2 text-xs" style={{ color: bodyColor }}>
                  <span className="text-orange-400 flex-shrink-0">•</span>{t}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Enforcement */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-yellow-400" />
            <h3 className="text-base font-bold" style={{ color: titleColor }}>Enforcement Actions</h3>
          </div>
          <div className="space-y-2">
            {enforcement.map(({ level, desc }) => (
              <div key={level} className="rounded-xl px-4 py-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <p className="text-sm font-bold" style={{ color: titleColor }}>{level}</p>
                <p className="text-xs mt-0.5 leading-relaxed" style={{ color: bodyColor }}>{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Automated moderation */}
        <section>
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-blue-400" />
            <h3 className="text-base font-bold" style={{ color: titleColor }}>Automated Safety Systems</h3>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: bodyColor }}>
            SPICEY uses AI-powered automated moderation to scan content before and after publishing. Our systems are designed to detect policy violations including illegal content, hate speech, spam, and harmful media. Content flagged by our systems is reviewed and may be removed without prior notice. Legitimate content that is incorrectly flagged can be appealed by contacting us.
          </p>
        </section>

        {/* Reporting */}
        <section>
          <div className="flex items-center gap-2 mb-2">
            <Flag className="w-4 h-4 text-orange-400" />
            <h3 className="text-base font-bold" style={{ color: titleColor }}>How to Report Violations</h3>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: bodyColor }}>
            If you encounter content or behavior that violates these guidelines, please use the <span className="text-orange-400 font-semibold">Report</span> button available on all posts, profiles, comments, messages, and live streams. You can also report directly to:{' '}
            <a href="mailto:info@spicey.live" className="text-orange-400">info@spicey.live</a>
          </p>
          <p className="text-sm leading-relaxed mt-2" style={{ color: bodyColor }}>
            All reports are confidential. Submitting false or malicious reports is itself a violation of these guidelines.
          </p>
        </section>

        {/* Appeal */}
        <section>
          <h3 className="text-base font-bold mb-2" style={{ color: titleColor }}>Appeals</h3>
          <p className="text-sm leading-relaxed" style={{ color: bodyColor }}>
            If you believe your content was removed or your account was actioned in error, you may appeal by contacting us at <a href="mailto:info@spicey.live" className="text-orange-400">info@spicey.live</a> with your username and a description of the situation. We review all appeals fairly and will respond within 7 business days.
          </p>
        </section>

        <div className="text-xs pt-4" style={{ color: footerColor, borderTop: footerBorder }}>
          <p>SPICEY · info@spicey.live · © 2026 Spicey. All rights reserved. · Last updated: May 29, 2026</p>
        </div>
      </div>
    </div>
  );
}