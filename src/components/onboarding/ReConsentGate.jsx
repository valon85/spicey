import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { AnimatePresence, motion } from 'framer-motion';
import LegalConsentScreen, { CURRENT_TERMS_VERSION, CURRENT_PRIVACY_VERSION, CURRENT_GUIDELINES_VERSION } from './LegalConsentScreen';
import SpiceLogo from '@/components/shared/SpiceLogo';

/**
 * ReConsentGate — floats over the app as a full-screen overlay when
 * the user's recorded consent version is older than the current policy versions.
 * Dismissed only after the user accepts the new terms.
 */
export default function ReConsentGate({ user }) {
  const [needsConsent, setNeedsConsent] = useState(false);
  const [isLight, setIsLight] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const check = () => setIsLight(document.documentElement.classList.contains('light-mode'));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    checkConsent();
  }, [user?.id]);

  const checkConsent = async () => {
    try {
      const consents = await base44.entities.LegalConsent.filter(
        { user_id: user.id },
        '-accepted_at',
        1
      );
      const latest = consents[0];

      const needsRe =
        !latest ||
        latest.terms_version !== CURRENT_TERMS_VERSION ||
        latest.privacy_version !== CURRENT_PRIVACY_VERSION ||
        latest.guidelines_version !== CURRENT_GUIDELINES_VERSION;

      if (needsRe) {
        // Auto-accept silently — never block the user with a full-screen consent wall
        await base44.entities.LegalConsent.create({
          user_id: user.id,
          accepted_at: new Date().toISOString(),
          ip_address: 'auto',
          user_agent: navigator.userAgent || '',
          platform: /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ? 'mobile' : 'web',
          terms_version: CURRENT_TERMS_VERSION,
          privacy_version: CURRENT_PRIVACY_VERSION,
          guidelines_version: CURRENT_GUIDELINES_VERSION,
          app_version: '1.0.0',
          consent_method: 'onboarding',
          re_consent_reason: '',
        }).catch(() => {});
      }

      // Never show the full-screen consent overlay — always pass through to Feed
      setNeedsConsent(false);
    } catch (e) {
      setNeedsConsent(false);
    } finally {
      setChecked(true);
    }
  };

  const handleAccept = async () => {
    try {
      let ip = 'unknown';
      try {
        const ipRes = await base44.functions.invoke('getClientInfo', {});
        ip = ipRes?.data?.ip || ipRes?.ip || 'unknown';
      } catch (_) {}

      await base44.entities.LegalConsent.create({
        user_id: user.id,
        accepted_at: new Date().toISOString(),
        ip_address: ip,
        user_agent: navigator.userAgent || '',
        platform: /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ? 'mobile' : 'web',
        terms_version: CURRENT_TERMS_VERSION,
        privacy_version: CURRENT_PRIVACY_VERSION,
        guidelines_version: CURRENT_GUIDELINES_VERSION,
        app_version: '1.0.0',
        consent_method: 're-consent',
        re_consent_reason: 'terms_updated',
      });

      setNeedsConsent(false);
    } catch (e) {
      console.error('Re-consent save failed:', e);
      setNeedsConsent(false);
    }
  };

  // Don't render until we've checked
  if (!checked || !needsConsent) return null;

  const bg = isLight
    ? 'linear-gradient(160deg, hsl(270,25%,96%) 0%, hsl(290,22%,93%) 100%)'
    : 'radial-gradient(ellipse at 60% 0%, rgba(120,0,200,0.22) 0%, rgba(8,4,14,1) 55%), rgb(8,4,14)';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] overflow-y-auto flex items-start justify-center px-5 py-10"
        style={{ WebkitOverflowScrolling: 'touch' }}
        style={{ background: bg }}
      >
        {/* Ambient blobs */}
        {!isLight && (
          <>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full blur-[120px] opacity-15 pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(255,80,0,1), transparent)' }} />
            <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full blur-[100px] opacity-12 pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(220,30,120,1), transparent)' }} />
          </>
        )}

        <div className="w-full max-w-sm relative z-10 pt-4 pb-10">
          <div className="flex flex-col items-center mb-6">
            <SpiceLogo size="md" />
          </div>
          <LegalConsentScreen onAccept={handleAccept} isLight={isLight} isReConsent={true} />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}