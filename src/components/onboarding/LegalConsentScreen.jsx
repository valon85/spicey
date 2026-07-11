import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Check, Shield, FileText, Users, AlertTriangle, Eye, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

// ── Current policy versions — bump these to trigger re-consent for existing users ──
export const CURRENT_TERMS_VERSION = '2.0';
export const CURRENT_PRIVACY_VERSION = '2.0';
export const CURRENT_GUIDELINES_VERSION = '2.0';

const PROHIBITED = [
  'Pornography, nudity, sexually explicit content, or content of a sexual nature',
  'Child Sexual Abuse Material (CSAM) — illegal, immediately reported to law enforcement',
  'Graphic violence, gore, or content glorifying self-harm or suicide',
  'Hate speech targeting individuals based on race, religion, gender, or other protected characteristics',
  'Harassment, threats, intimidation, or coordinated abuse',
  'Fake profiles, impersonation of real people or brands, or bot accounts',
  'Scams, phishing, pyramid schemes, or deceptive financial content',
  'Copyright-infringing material posted without the rights holder\'s permission',
  'Content promoting, facilitating, or glorifying illegal activities',
  'Spam or artificially inflated engagement through automation',
];

const SECTIONS = [
  {
    icon: FileText,
    title: 'Terms of Service',
    color: '#ff5500',
    path: '/terms',
    points: [
      'You are responsible for ALL content you upload, post, or share on Spicey.',
      'You must be at least 13 years old to use Spicey. Users under 18 require parental consent.',
      'By posting content, you grant Spicey a non-exclusive license to display and distribute it on the platform.',
      'Spicey reserves the right to remove any content that violates platform rules — without prior notice.',
      'Accounts violating platform rules may be suspended or permanently banned.',
      'Fake profiles and impersonation of other individuals, brands, or organizations are strictly prohibited.',
      'You may delete your account at any time from Account Settings. Data is permanently removed within 30 days.',
      'SPICEY cooperates fully with law enforcement and will report illegal content as required by law.',
    ],
  },
  {
    icon: Shield,
    title: 'Privacy Policy',
    color: '#e91e8c',
    path: '/privacy',
    points: [
      'We collect account information (email, username, name) and content you create on the platform.',
      'Your data is used to operate, personalize, and improve the platform — not sold to third parties.',
      'We use automated AI moderation systems to review content for safety and policy compliance.',
      'Your IP address and device information may be logged for security, fraud prevention, and legal compliance.',
      'By using Spicey, you consent to data processing as described in the Privacy Policy.',
      'You have the right to access, correct, or delete your personal data at any time.',
      'We may share data with law enforcement when required by applicable law.',
    ],
  },
  {
    icon: Users,
    title: 'Community Guidelines',
    color: '#a733ff',
    path: '/guidelines',
    points: [
      'Be respectful — no harassment, bullying, or abusive behavior toward other users.',
      'Only post content you own or have explicit rights to share.',
      'No hate speech, discrimination, or targeting of protected groups.',
      'No spam, fake engagement, or coordinated inauthentic behavior.',
      'Report violations using the in-app Report button or by emailing info@spicey.live.',
      'Enforcement ranges from content removal to permanent account termination and legal action.',
    ],
  },
];

function PolicySection({ section, isLight }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = section.icon;

  return (
    <div className="rounded-2xl overflow-hidden"
      style={{
        background: isLight ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.04)',
        border: isLight ? `1px solid ${section.color}30` : `1px solid ${section.color}25`,
      }}>
      <button onClick={() => setExpanded(v => !v)} className="w-full flex items-center gap-3 px-4 py-3.5 text-left">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${section.color}22` }}>
          <Icon className="w-4 h-4" style={{ color: section.color }} />
        </div>
        <span className="flex-1 font-bold text-sm" style={{ color: isLight ? 'hsl(270,20%,12%)' : 'white' }}>
          {section.title}
        </span>
        <Link to={section.path} target="_blank" onClick={e => e.stopPropagation()} className="mr-2 opacity-50 hover:opacity-100 transition-opacity">
          <Eye className="w-3.5 h-3.5" style={{ color: isLight ? 'hsl(270,20%,40%)' : 'white' }} />
        </Link>
        {expanded
          ? <ChevronUp className="w-4 h-4 flex-shrink-0" style={{ color: isLight ? 'rgba(80,50,120,0.5)' : 'rgba(255,255,255,0.4)' }} />
          : <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: isLight ? 'rgba(80,50,120,0.5)' : 'rgba(255,255,255,0.4)' }} />
        }
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }} className="overflow-hidden">
            <ul className="px-4 pb-4 space-y-2.5" style={{ borderTop: isLight ? `1px solid ${section.color}18` : `1px solid ${section.color}15` }}>
              {section.points.map((pt, i) => (
                <li key={i} className="flex items-start gap-2.5 pt-2">
                  <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: section.color }} />
                  <span className="text-xs leading-relaxed" style={{ color: isLight ? 'rgba(60,35,90,0.75)' : 'rgba(255,255,255,0.55)' }}>{pt}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function LegalConsentScreen({ onAccept, isLight, isReConsent = false }) {
  const [agreed, setAgreed] = useState(false);
  const [prohibitedExpanded, setProhibitedExpanded] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleAccept = async () => {
    if (!agreed || submitting) return;
    setSubmitting(true);
    await onAccept();
    setSubmitting(false);
  };

  const textMain = isLight ? 'hsl(270,20%,12%)' : 'white';
  const textMuted = isLight ? 'rgba(80,50,120,0.55)' : 'rgba(255,255,255,0.4)';
  const textBody = isLight ? 'rgba(60,35,90,0.8)' : 'rgba(255,255,255,0.65)';
  const cardBg = isLight ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.04)';
  const cardBorder = isLight ? '1px solid rgba(160,80,255,0.15)' : '1px solid rgba(255,255,255,0.08)';

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-sm mx-auto flex flex-col gap-4"
      style={{}}>  

      {/* Header */}
      <div className="text-center">
        <h2 className="font-extrabold text-xl" style={{ color: textMain }}>
          {isReConsent ? '📋 Updated Policies' : 'Before you join 👋'}
        </h2>
        <p className="text-sm mt-1" style={{ color: textMuted }}>
          {isReConsent
            ? 'Our Terms, Privacy Policy, and/or Community Guidelines have been updated. Please review and accept to continue.'
            : 'Please review and agree to our policies to create your account'}
        </p>
      </div>

      {/* Re-consent notice */}
      {isReConsent && (
        <div className="rounded-2xl px-4 py-3 flex items-start gap-3" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)' }}>
          <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs leading-relaxed text-yellow-300">You must accept the updated policies to continue using Spicey. Your previous account and data remain unchanged.</p>
        </div>
      )}

      {/* Policy sections */}
      <div className="space-y-2.5">
        {SECTIONS.map(s => (
          <PolicySection key={s.title} section={s} isLight={isLight} />
        ))}
      </div>

      {/* Prohibited content box */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)' }}>
        <button onClick={() => setProhibitedExpanded(v => !v)} className="w-full flex items-center gap-3 px-4 py-3.5 text-left">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(239,68,68,0.15)' }}>
            <AlertTriangle className="w-4 h-4 text-red-400" />
          </div>
          <span className="flex-1 font-bold text-sm text-red-400">Prohibited Content (Required Reading)</span>
          {prohibitedExpanded
            ? <ChevronUp className="w-4 h-4 text-red-400/50" />
            : <ChevronDown className="w-4 h-4 text-red-400/50" />
          }
        </button>
        <AnimatePresence>
          {prohibitedExpanded && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }} className="overflow-hidden">
              <ul className="px-4 pb-4 space-y-2" style={{ borderTop: '1px solid rgba(239,68,68,0.15)' }}>
                {PROHIBITED.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 pt-2">
                    <span className="text-red-400 flex-shrink-0 text-xs mt-0.5">✗</span>
                    <span className="text-xs leading-relaxed" style={{ color: isLight ? 'rgba(60,35,90,0.75)' : 'rgba(255,255,255,0.55)' }}>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Moderation disclosure */}
      <div className="rounded-2xl px-4 py-3 flex items-start gap-3" style={{ background: isLight ? 'rgba(120,0,200,0.05)' : 'rgba(120,0,200,0.08)', border: isLight ? '1px solid rgba(120,0,200,0.15)' : '1px solid rgba(120,0,200,0.2)' }}>
        <Lock className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs leading-relaxed" style={{ color: isLight ? 'rgba(60,35,90,0.75)' : 'rgba(255,255,255,0.5)' }}>
          Spicey uses <span style={{ color: '#a733ff', fontWeight: 600 }}>automated AI moderation systems</span> to review content for safety and policy compliance. Violations may result in content removal, account suspension, or permanent ban. Illegal content is reported to law enforcement.
        </p>
      </div>

      {/* Checkbox agreement */}
      <button onClick={() => setAgreed(v => !v)} className="flex items-start gap-3 w-full text-left py-1">
        <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 transition-all"
          style={{
            background: agreed ? 'linear-gradient(135deg, #ff5500, #e91e8c)' : 'transparent',
            border: agreed ? 'none' : isLight ? '2px solid rgba(120,80,200,0.35)' : '2px solid rgba(255,255,255,0.25)',
            boxShadow: agreed ? '0 0 12px rgba(255,80,0,0.4)' : 'none',
          }}>
          {agreed && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
        </div>
        <p className="text-xs leading-relaxed" style={{ color: textBody }}>
          I have read and agree to the{' '}
          <Link to="/terms" target="_blank" onClick={e => e.stopPropagation()} className="underline font-semibold" style={{ color: '#ff5500' }}>Terms of Service</Link>
          {', '}
          <Link to="/privacy" target="_blank" onClick={e => e.stopPropagation()} className="underline font-semibold" style={{ color: '#e91e8c' }}>Privacy Policy</Link>
          {', and '}
          <Link to="/guidelines" target="_blank" onClick={e => e.stopPropagation()} className="underline font-semibold" style={{ color: '#a733ff' }}>Community Guidelines</Link>
          {'. '}
          I understand that I am responsible for all content I upload, that prohibited content (including CSAM, nudity, hate speech, harassment, scams, impersonation, and copyright violations) is strictly forbidden, that Spicey may use automated systems to review my content, and that violations may result in content removal, account suspension, or permanent ban. I consent to data processing as described in the Privacy Policy.
        </p>
      </button>

      {/* Disabled state hint */}
      {!agreed && (
        <p className="text-center text-xs" style={{ color: isLight ? 'rgba(239,68,68,0.6)' : 'rgba(239,68,68,0.5)' }}>
          You must check the box above to {isReConsent ? 'continue' : 'create your account'}
        </p>
      )}

      {/* CTA */}
      <button
        onClick={handleAccept}
        disabled={!agreed || submitting}
        className="w-full py-3.5 rounded-2xl text-white font-bold text-base flex items-center justify-center gap-2 transition-all"
        style={{
          background: agreed ? 'linear-gradient(135deg, #ff5500, #e91e8c)' : isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.08)',
          boxShadow: agreed ? '0 0 24px rgba(255,80,0,0.45), 0 0 48px rgba(220,30,120,0.2)' : 'none',
          color: agreed ? 'white' : isLight ? 'rgba(80,50,120,0.4)' : 'rgba(255,255,255,0.25)',
          cursor: agreed ? 'pointer' : 'not-allowed',
        }}>
        {submitting
          ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
          : isReConsent ? 'Accept & Continue 🔥' : 'I Agree & Create Account 🔥'}
      </button>

      <p className="text-center text-xs pb-8" style={{ color: isLight ? 'rgba(80,50,120,0.35)' : 'rgba(255,255,255,0.2)' }}>
        Acceptance timestamp, IP address, and device info are recorded for legal compliance.<br />
        You can delete your account at any time from Settings.
      </p>
    </motion.div>
  );
}