import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Share, Plus } from 'lucide-react';
import { isIOS, isPWA } from '@/lib/notifications';

const STORAGE_KEY = 'spicey_ios_prompt_dismissed';

export default function IOSInstallPrompt() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Install prompt disabled
    // if (!isIOS()) return;
    // if (isPWA()) return;
    // if (localStorage.getItem(STORAGE_KEY)) return;
    // const t = setTimeout(() => setShow(true), 8000);
    // return () => clearTimeout(t);
  }, []);

  const dismiss = (permanent = false) => {
    setShow(false);
    if (permanent) localStorage.setItem(STORAGE_KEY, '1');
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 80 }}
          transition={{ type: 'spring', damping: 24, stiffness: 300 }}
          className="fixed bottom-24 left-4 right-4 z-[250]"
        >
          <div
            className="relative p-5 rounded-3xl"
            style={{
              background: 'linear-gradient(160deg, #0e0620 0%, #1e0640 50%, #0a0318 100%)',
              border: '1px solid rgba(255,100,30,0.3)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.8), 0 0 30px rgba(255,80,0,0.1)',
            }}
          >
            {/* Close */}
            <button
              onClick={() => dismiss(true)}
              className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.08)' }}
            >
              <X className="w-3.5 h-3.5 text-white/50" />
            </button>

            {/* Icon row */}
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-2xl overflow-hidden flex-shrink-0"
                style={{ border: '1px solid rgba(255,100,30,0.4)' }}>
                <img
                  src="https://media.base44.com/images/public/69fe90d3bbe7ad47925e4a0a/6f5664ee3_25AF8963-CFE6-4D6E-8C5D-A71D6328A9EA.png"
                  alt="Spicey"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="text-white font-bold text-[15px]">Get call & message alerts</p>
                <p className="text-orange-400 text-[12px] font-semibold">Add Spicey to Home Screen</p>
              </div>
            </div>

            <p className="text-white/60 text-[13px] mb-4 leading-relaxed">
              To receive incoming call notifications even when Spicey is closed, add it to your Home Screen as an app.
            </p>

            {/* Steps */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold"
                  style={{ background: 'rgba(255,100,30,0.3)' }}>1</div>
                <div className="flex items-center gap-1.5 text-white/80 text-[13px]">
                  Tap <Share className="w-4 h-4 text-blue-400 flex-shrink-0" /> <span className="font-semibold text-blue-400">Share</span> in Safari
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold"
                  style={{ background: 'rgba(255,100,30,0.3)' }}>2</div>
                <div className="flex items-center gap-1.5 text-white/80 text-[13px]">
                  Tap <Plus className="w-4 h-4 text-white/80" /> <span className="font-semibold text-white">Add to Home Screen</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold"
                  style={{ background: 'rgba(255,100,30,0.3)' }}>3</div>
                <p className="text-white/80 text-[13px]">Open Spicey from the icon — calls will now ring!</p>
              </div>
            </div>

            <button
              onClick={() => dismiss(false)}
              className="mt-4 w-full py-2.5 rounded-xl text-white/50 text-sm"
              style={{ background: 'rgba(255,255,255,0.05)' }}
            >
              Remind me later
            </button>
          </div>

          {/* Arrow pointing down */}
          <div className="flex justify-center mt-2">
            <div className="w-5 h-5 rotate-45"
              style={{
                background: 'linear-gradient(135deg, transparent, #1e0640)',
                border: '1px solid rgba(255,100,30,0.3)',
                borderTop: 'none', borderLeft: 'none',
              }} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}