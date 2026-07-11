import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Loader2, Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const AI_OPTIONS = [
  { emoji: '✍️', label: 'Add Caption with AI',          prompt: 'Write a short, punchy, engaging social media caption for this post. Make it feel viral and modern.' },
  { emoji: '🔥', label: 'Generate Hashtags',             prompt: 'Generate 10 trending, relevant hashtags for a social media post. Return only the hashtags separated by spaces.' },
  { emoji: '📈', label: 'Make This Post More Viral',     prompt: 'Give me 3 specific tips to make this social media post go viral. Be concise and actionable.' },
  { emoji: '🎵', label: 'Suggest Music/Audio',           prompt: 'Suggest 5 trending songs or audio tracks that would perfectly match a stylish, moody social media reel. Include artist names.' },
  { emoji: '✨', label: 'Rewrite Bio with AI',           prompt: 'Write a cool, short social media bio for a creator on the Spicey platform. Make it feel energetic and authentic. Max 150 chars.' },
  { emoji: '💡', label: 'Suggest Content Based on Vibe', prompt: 'Suggest 5 creative content ideas for a stylish social media creator who posts nightlife, fashion, and city vibes.' },
  { emoji: '🎬', label: 'Create Post Idea',              prompt: 'Give me one unique, creative social media post idea for a creator who wants to go viral this week.' },
  { emoji: '🌟', label: 'Enhance Lighting/Colors Tip',  prompt: 'Give me 3 quick tips to enhance photo lighting and colors for social media without professional equipment.' },
  { emoji: '🗑️', label: 'Remove Background Tip',        prompt: 'Give me the best free tools or methods to remove a background from a photo for social media posts.' },
];

export default function AIAssistantSheet({ open, onClose }) {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeOption, setActiveOption] = useState(null);

  const handleOption = async (option) => {
    setActiveOption(option.label);
    setResult('');
    setLoading(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({ prompt: option.prompt });
      setResult(typeof res === 'string' ? res : JSON.stringify(res));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setResult('');
    setActiveOption(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={handleClose} className="fixed inset-0 z-50" style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)' }} />

          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl pb-10 overflow-hidden"
            style={{ background: 'linear-gradient(180deg, rgba(28,8,52,0.99), rgba(10,3,22,1))', border: '1px solid rgba(139,92,246,0.2)', maxHeight: '85vh' }}>

            {/* Purple glow accent */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-24 rounded-full blur-[60px] opacity-20 pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(139,92,246,1), transparent)' }} />

            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-white/20" />
            </div>

            <div className="flex items-center justify-between px-5 pb-4 border-b border-white/07">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)' }}>
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-extrabold text-base leading-tight">AI Assistant</h3>
                  <p className="text-[10px] text-purple-400/70">Powered by Spicey AI</p>
                </div>
              </div>
              <button onClick={handleClose} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.07)' }}>
                <X className="w-4 h-4 text-white/60" />
              </button>
            </div>

            <div className="overflow-y-auto" style={{ maxHeight: '70vh' }}>
              {/* AI Result */}
              <AnimatePresence>
                {(loading || result) && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                    className="mx-4 mt-4 rounded-2xl p-4"
                    style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.25)' }}>
                    {loading ? (
                      <div className="flex items-center gap-2.5">
                        <Loader2 className="w-4 h-4 text-purple-400 animate-spin flex-shrink-0" />
                        <p className="text-sm text-purple-300/80 italic">Spicey AI is thinking...</p>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center gap-1.5 mb-2">
                          <Check className="w-3.5 h-3.5 text-green-400" />
                          <p className="text-[11px] font-bold text-green-400 uppercase tracking-wide">{activeOption}</p>
                        </div>
                        <p className="text-sm text-white/85 leading-relaxed whitespace-pre-line">{result}</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Options grid */}
              <div className="px-4 pt-4 pb-2 grid grid-cols-1 gap-2">
                {AI_OPTIONS.map((opt, i) => (
                  <motion.button key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => handleOption(opt)}
                    disabled={loading}
                    className="flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-left active:scale-[0.98] transition-transform disabled:opacity-50"
                    style={{
                      background: activeOption === opt.label
                        ? 'rgba(139,92,246,0.15)'
                        : 'rgba(255,255,255,0.04)',
                      border: activeOption === opt.label
                        ? '1px solid rgba(139,92,246,0.4)'
                        : '1px solid rgba(255,255,255,0.07)',
                    }}>
                    <span className="text-xl flex-shrink-0">{opt.emoji}</span>
                    <span className="text-sm font-semibold text-white/85">{opt.label}</span>
                    {activeOption === opt.label && loading && <Loader2 className="w-4 h-4 text-purple-400 animate-spin ml-auto" />}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}