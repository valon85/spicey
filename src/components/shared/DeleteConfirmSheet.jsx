import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, X } from 'lucide-react';

/**
 * A bottom sheet that asks for delete confirmation.
 * Props:
 *   open: boolean
 *   onClose: () => void
 *   onConfirm: () => void
 *   title?: string
 *   description?: string
 *   loading?: boolean
 */
export default function DeleteConfirmSheet({ open, onClose, onConfirm, title = 'Delete this?', description = 'This action cannot be undone.', loading = false }) {
  if (!open) return null;
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[9998]"
            style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
          />

          {/* Sheet */}
          <motion.div
            key="sheet"
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
            className="fixed bottom-0 left-0 right-0 z-[9999] rounded-t-3xl px-5 pt-4"
            style={{
              paddingBottom: 'max(24px, env(safe-area-inset-bottom, 16px))',
              background: 'rgba(14,7,24,0.99)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            {/* Handle */}
            <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mb-4" />

            {/* Icon */}
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(220,30,30,0.15)', border: '1px solid rgba(220,30,30,0.3)' }}>
              <Trash2 className="w-7 h-7 text-red-400" />
            </div>

            <h3 className="text-white font-extrabold text-lg text-center mb-1">{title}</h3>
            <p className="text-white/45 text-sm text-center mb-6">{description}</p>

            <button
              onClick={onConfirm}
              disabled={loading}
              className="w-full py-4 rounded-2xl font-bold text-white text-base mb-3 disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #dc2626, #b91c1c)', boxShadow: '0 0 20px rgba(220,38,38,0.4)' }}>
              {loading
                ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><Trash2 className="w-4 h-4" /> Delete</>}
            </button>

            <button
              onClick={onClose}
              className="w-full py-4 rounded-2xl font-bold text-white/60 text-base"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              Cancel
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}