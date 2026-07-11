import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Flag, CheckCircle2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const REASONS = [
  { id: 'spam', label: 'Spam or misleading' },
  { id: 'harassment', label: 'Harassment or bullying' },
  { id: 'hate_speech', label: 'Hate speech' },
  { id: 'nudity', label: 'Nudity or sexual content' },
  { id: 'violence', label: 'Violence or dangerous acts' },
  { id: 'false_information', label: 'False information' },
  { id: 'other', label: 'Something else' },
];

export default function ReportSheet({ open, onClose, postId, reportedUserId }) {
  const [selected, setSelected] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!selected) return;
    setSubmitting(true);
    try {
      const user = await base44.auth.me();
      await base44.entities.Report.create({
        reporter_id: user.id,
        reported_user_id: reportedUserId || '',
        post_id: postId || '',
        reason: selected,
        status: 'pending',
      });
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setSelected(null);
        onClose();
      }, 2000);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelected(null);
    setSubmitted(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-[60] bg-black/60" />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[70] rounded-t-3xl overflow-hidden"
            style={{ background: 'rgba(10,5,20,0.98)', border: '1px solid rgba(255,255,255,0.08)', maxHeight: '80vh' }}>

            <div className="w-10 h-1 rounded-full mx-auto mt-3 mb-4" style={{ background: 'rgba(255,255,255,0.15)' }} />

            {submitted ? (
              <div className="flex flex-col items-center justify-center py-12 px-6">
                <CheckCircle2 className="w-14 h-14 text-green-400 mb-4" />
                <h3 className="text-white font-bold text-lg mb-2">Report Submitted</h3>
                <p className="text-white/50 text-sm text-center">Thank you for helping keep SPICEY safe. Our team will review this report.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between px-5 mb-4">
                  <div className="flex items-center gap-2">
                    <Flag className="w-5 h-5 text-red-400" />
                    <p className="text-white font-bold text-base">Report</p>
                  </div>
                  <button onClick={handleClose} className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(255,255,255,0.07)' }}>
                    <X className="w-4 h-4 text-white/60" />
                  </button>
                </div>

                <p className="text-white/50 text-sm px-5 mb-4">Why are you reporting this?</p>

                <div className="overflow-y-auto px-5 pb-8 space-y-2" style={{ maxHeight: '55vh' }}>
                  {REASONS.map(r => (
                    <button key={r.id} onClick={() => setSelected(r.id)}
                      className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-left transition-all"
                      style={{
                        background: selected === r.id ? 'rgba(220,30,30,0.15)' : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${selected === r.id ? 'rgba(220,30,30,0.5)' : 'rgba(255,255,255,0.07)'}`,
                      }}>
                      <span className="text-sm font-semibold text-white">{r.label}</span>
                      {selected === r.id && <div className="w-4 h-4 rounded-full bg-red-500 flex-shrink-0" />}
                    </button>
                  ))}

                  <button onClick={handleSubmit} disabled={!selected || submitting}
                    className="w-full py-4 rounded-2xl font-bold text-white mt-2 disabled:opacity-40"
                    style={{ background: 'linear-gradient(135deg, #dc1e1e, #991111)' }}>
                    {submitting ? 'Submitting...' : 'Submit Report'}
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}