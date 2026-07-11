import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, Shield, AlertTriangle, Ban, CheckCircle } from 'lucide-react';

export default function TermsOfService() {
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
  const boxBg = isLight ? 'rgba(255,100,0,0.05)' : 'rgba(255,80,0,0.07)';
  const boxBorder = isLight ? '1px solid rgba(255,100,0,0.2)' : '1px solid rgba(255,80,0,0.2)';
  const footerColor = isLight ? 'rgba(80,50,120,0.4)' : 'rgba(255,255,255,0.35)';
  const footerBorder = isLight ? '1px solid rgba(160,80,255,0.12)' : '1px solid rgba(255,255,255,0.08)';

  const prohibitedList = [
    'Uploading, sharing, or distributing pornography, nudity, or sexually explicit content',
    'Child sexual abuse material (CSAM) — strictly prohibited and will be reported to law enforcement',
    'Graphic violence, gore, or content that glorifies self-harm or suicide',
    'Hate speech, racism, discrimination, or content targeting individuals based on protected characteristics',
    'Harassment, bullying, intimidation, or threats of any kind',
    'Impersonation of other individuals, brands, or organizations',
    'Creating fake profiles, spam accounts, or bot accounts',
    'Scams, phishing, pyramid schemes, or deceptive financial content',
    'Uploading copyrighted material without explicit permission from the rights holder',
    'Content that promotes or facilitates illegal activities',
    'Sharing private information of others without their consent (doxxing)',
    'Coordinated inauthentic behavior designed to manipulate platform metrics',
  ];

  const sections = [
    {
      title: '1. Acceptance of Terms',
      body: 'By accessing or using the SPICEY application ("Platform", "we", "us", "our"), you agree to be bound by these Terms of Service ("Terms") and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using this platform. These Terms apply to all visitors, users, and others who access or use the Platform.',
    },
    {
      title: '2. Eligibility',
      body: 'You must be at least 13 years of age to use SPICEY. By using the Platform, you represent and warrant that you meet this age requirement. If you are under 18, you confirm that a parent or legal guardian has reviewed and consented to these Terms on your behalf. SPICEY is not directed to children under 13, and we do not knowingly collect data from children under 13.',
    },
    {
      title: '3. User Accounts & Identity',
      body: 'You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to provide accurate, current, and complete information during registration. Creating multiple accounts to evade bans, impersonate others, or engage in coordinated inauthentic behavior is strictly prohibited and will result in permanent termination of all associated accounts.',
    },
    {
      title: '5. User-Generated Content',
      body: 'You retain ownership of content you create and post on SPICEY. By posting content, you grant SPICEY a non-exclusive, worldwide, royalty-free license to use, display, and distribute your content solely for the purpose of operating the Platform. You are solely responsible for any content you upload, post, share, or transmit. SPICEY does not endorse or verify user-generated content.',
    },
    {
      title: '6. Content Moderation',
      body: 'SPICEY employs automated moderation systems and human review to enforce these Terms. We reserve the right to remove any content that violates our policies, suspend or terminate accounts, and report illegal content to appropriate authorities — including law enforcement — without prior notice. Content removal decisions are final at SPICEY\'s discretion. Users may appeal moderation decisions by contacting info@spicey.live.',
    },
    {
      title: '7. Enforcement & Consequences',
      body: 'Violations of these Terms may result in: (a) content removal, (b) temporary account suspension, (c) permanent account ban and device-level block, (d) legal action, or (e) reporting to law enforcement where required by law. The severity of enforcement depends on the nature and frequency of violations. SPICEY reserves the right to take immediate action for serious violations without warning.',
    },
    {
      title: '8. Privacy & Data Protection',
      body: 'Your use of SPICEY is governed by our Privacy Policy, which is incorporated into these Terms. We handle your personal data in compliance with applicable privacy regulations including GDPR and CCPA. You have the right to access, correct, and delete your personal data as described in our Privacy Policy.',
    },
    {
      title: '9. Intellectual Property',
      body: 'SPICEY\'s name, logo, design, and all platform features are the exclusive intellectual property of SPICEY. You may not reproduce, distribute, or create derivative works from our platform content without express written permission. SPICEY respects intellectual property rights and will respond to valid DMCA takedown requests. To report copyright infringement, contact: info@spicey.live.',
    },
    {
      title: '10. AI Features Disclosure',
      body: 'SPICEY includes an AI assistant ("Spicey AI") powered by OpenAI\'s API. By using AI features, you acknowledge that: (a) Spicey AI is powered by OpenAI technology, not a proprietary model developed by SPICEY; (b) AI-generated responses may not always be accurate, complete, or appropriate — use your own judgment; (c) your voice and text inputs are processed via OpenAI\'s API on secure backend servers; (d) you must not use AI features to generate illegal, harmful, or deceptive content. SPICEY is not liable for decisions made based on AI responses.',
    },
    {
      title: '11. Disclaimer of Warranties',
      body: 'SPICEY is provided "as is" and "as available" without any warranties of any kind, express or implied. We do not warrant that the Platform will be uninterrupted, error-free, or free from viruses or other harmful components. Your use of the Platform is at your sole risk.',
    },
    {
      title: '11. Limitation of Liability',
      body: 'To the fullest extent permitted by applicable law, SPICEY shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Platform, including but not limited to loss of data, loss of profits, or reputational harm.',
    },
    {
      title: '12. Changes to Terms',
      body: 'SPICEY reserves the right to modify these Terms at any time. We will notify users of material changes via in-app notification or email. Continued use of the Platform after changes are posted constitutes acceptance of the revised Terms.',
    },
  ];

  return (
    <div className="min-h-screen" style={{ background: bg }}>
      <div className="sticky top-0 z-40 flex items-center gap-3 px-4 py-4"
        style={{ background: headerBg, backdropFilter: 'blur(20px)', borderBottom: headerBorder, paddingTop: 'max(1rem, env(safe-area-inset-top))' }}>
        <button onClick={() => navigate('/settings')} className="w-8 h-8 flex items-center justify-center" style={{ color: backColor }}>
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold" style={{ color: titleColor }}>Terms of Service</h1>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6 pb-28">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-5 h-5 text-orange-400" />
            <h2 className="text-lg font-bold" style={{ color: titleColor }}>Terms of Service</h2>
          </div>
          <p className="text-sm" style={{ color: mutedColor }}>Effective Date: May 29, 2026 · Last Updated: May 29, 2026</p>
          <p className="text-sm mt-3 leading-relaxed" style={{ color: bodyColor }}>
            Welcome to SPICEY. These Terms of Service govern your access to and use of the SPICEY platform, including our mobile application and all related services. Please read these terms carefully before using the Platform.
          </p>
        </div>

        {/* Prohibited Content — prominent box */}
        <div className="rounded-2xl p-4 space-y-3" style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <div className="flex items-center gap-2 mb-1">
            <Ban className="w-4 h-4 text-red-400" />
            <p className="text-sm font-bold text-red-400">4. Prohibited Content & Conduct</p>
          </div>
          <p className="text-xs leading-relaxed" style={{ color: bodyColor }}>The following content and behaviors are strictly prohibited on SPICEY:</p>
          <ul className="space-y-2">
            {prohibitedList.map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
                <span className="text-xs leading-relaxed" style={{ color: bodyColor }}>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {sections.map(({ title, body }) => (
          <section key={title}>
            <h3 className="text-base font-bold mb-2" style={{ color: titleColor }}>{title}</h3>
            <p className="text-sm leading-relaxed" style={{ color: bodyColor }}>{body}</p>
          </section>
        ))}

        <section>
          <h3 className="text-base font-bold mb-2" style={{ color: titleColor }}>13. Contact</h3>
          <p className="text-sm leading-relaxed" style={{ color: bodyColor }}>
            For questions about these Terms, to report violations, or to submit a DMCA takedown request, contact us at:{' '}
            <a href="mailto:info@spicey.live" className="text-orange-400">info@spicey.live</a>
          </p>
        </section>

        <div className="text-xs pt-4" style={{ color: footerColor, borderTop: footerBorder }}>
          <p>SPICEY · info@spicey.live · © 2026 Spicey. All rights reserved. · Last updated: May 29, 2026</p>
        </div>
      </div>
    </div>
  );
}