import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { X, Zap, DollarSign, Target, TrendingUp, Check, Globe, Users } from 'lucide-react';

export default function BoostPostModal({ post, open, onClose }) {
  const [loading, setLoading] = useState(false);
  const [boostAmount, setBoostAmount] = useState(20);
  const [duration, setDuration] = useState(7);
  const [targetAudience, setTargetAudience] = useState('all');
  const [isLightMode, setIsLightMode] = useState(false);

  React.useEffect(() => {
    const check = () => setIsLightMode(document.documentElement.classList.contains('light-mode'));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

  const handleBoost = async () => {
    if (!post) return;
    setLoading(true);
    try {
      const res = await base44.functions.invoke('boostPost', {
        postId: post.id,
        boostAmount,
        duration,
        targetAudience,
      });
      const data = res.data || res;
      if (data.success) {
        alert(data.message);
        onClose();
      }
    } catch (error) {
      const errData = error?.response?.data || error;
      alert(errData?.error || 'Failed to boost post');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  const estimatedReach = boostAmount * 100;

  const bg = isLightMode ? 'rgba(248,244,255,0.98)' : 'rgba(18,10,30,0.98)';
  const textColor = isLightMode ? 'hsl(270,20%,12%)' : 'white';
  const subtextColor = isLightMode ? 'rgba(80,50,120,0.6)' : 'rgba(255,255,255,0.4)';

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50"
        style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      />
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl p-6 pb-10"
        style={{ background: bg, border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="w-10 h-1 rounded-full mx-auto mb-6" style={{ background: 'rgba(255,255,255,0.15)' }} />
        
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}>
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base" style={{ color: textColor }}>Boost Post</h3>
              <p className="text-xs" style={{ color: subtextColor }}>Reach more people</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center" style={{ color: subtextColor }}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 mb-6">
          {/* Budget */}
          <div>
            <label className="text-sm font-semibold mb-2 block" style={{ color: textColor }}>
              Boost Budget: ${boostAmount}
            </label>
            <input
              type="range"
              min="5"
              max="200"
              step="5"
              value={boostAmount}
              onChange={(e) => setBoostAmount(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs mt-1" style={{ color: subtextColor }}>
              <span>$5 min</span>
              <span>$200 max</span>
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="text-sm font-semibold mb-2 block" style={{ color: textColor }}>
              Duration: {duration} days
            </label>
            <input
              type="range"
              min="1"
              max="30"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs mt-1" style={{ color: subtextColor }}>
              <span>1 day</span>
              <span>30 days</span>
            </div>
          </div>

          {/* Target Audience */}
          <div>
            <label className="text-sm font-semibold mb-2 block" style={{ color: textColor }}>Target Audience</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'all', label: 'Everyone', icon: Globe },
                { id: 'local', label: 'Local', icon: Target },
                { id: 'demographic', label: 'Custom', icon: Users },
              ].map((option) => {
                const Icon = option.icon;
                return (
                  <motion.button
                    key={option.id}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setTargetAudience(option.id)}
                    className="p-3 rounded-xl text-center"
                    style={{
                      background: targetAudience === option.id
                        ? 'rgba(249,115,22,0.2)'
                        : 'rgba(255,255,255,0.03)',
                      border: targetAudience === option.id
                        ? '1px solid #f97316'
                        : '1px solid rgba(255,255,255,0.05)',
                    }}>
                    <Icon className="w-4 h-4 mx-auto mb-1" style={{ color: targetAudience === option.id ? '#f97316' : subtextColor }} />
                    <p className="text-xs font-semibold" style={{ color: targetAudience === option.id ? '#f97316' : textColor }}>
                      {option.label}
                    </p>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Estimated Reach */}
          <div className="p-4 rounded-xl" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm" style={{ color: textColor }}>Estimated Reach</span>
              <TrendingUp className="w-4 h-4 text-green-400" />
            </div>
            <p className="text-2xl font-bold" style={{ color: '#22c55e' }}>{estimatedReach.toLocaleString()} users</p>
            <p className="text-xs" style={{ color: subtextColor }}>~{Math.floor(estimatedReach / duration)} users/day</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl text-sm font-bold"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: textColor }}>
            Cancel
          </button>
          <button
            onClick={handleBoost}
            disabled={loading}
            className="flex-1 py-3 rounded-xl text-sm font-bold text-white"
            style={{ 
              background: loading ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #f97316, #ea580c)',
              opacity: loading ? 0.5 : 1
            }}>
            {loading ? 'Boosting...' : `Boost for $${boostAmount}`}
          </button>
        </div>
      </motion.div>
    </>
  );
}