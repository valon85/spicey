import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Crown, Sparkles, Calendar, Clock, Zap, Heart } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import useScrollLock from '@/hooks/useScrollLock';

const DURATIONS = [
  { days: 1, label: '1 Day', icon: Clock },
  { days: 7, label: '7 Days', icon: Calendar },
  { days: 30, label: '30 Days', icon: Calendar },
  { days: 90, label: '90 Days', icon: Calendar },
  { days: 365, label: '1 Year', icon: Calendar, highlight: true },
  { days: 9999, label: 'Lifetime', icon: Sparkles, premium: true },
];

const PLANS = [
  { type: 'vip', label: 'VIP Star', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', icon: Crown },
  { type: 'creator', label: 'Creator Fire', color: '#ef4444', bg: 'rgba(239,68,68,0.1)', icon: Zap },
  { type: 'business', label: 'Business Diamond', color: '#a855f7', bg: 'rgba(168,85,247,0.1)', icon: Sparkles },
];

export default function GiftVIPModal({ open, onClose, userProfile, onGifted }) {
  const [selectedDuration, setSelectedDuration] = useState(30);
  const [selectedPlan, setSelectedPlan] = useState('vip');
  const [reason, setReason] = useState('');
  const [gifting, setGifting] = useState(false);
  const [isLight, setIsLight] = useState(false);
  
  useScrollLock(open);

  React.useEffect(() => {
    const check = () => setIsLight(document.documentElement.classList.contains('light-mode'));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

  const handleGift = async () => {
    setGifting(true);
    try {
      console.log('[GiftVIPModal] Gifting VIP:', { 
        recipientUserId: userProfile.user_id, 
        planType: selectedPlan, 
        durationDays: selectedDuration,
        reason: reason || 'Gifted by admin'
      });
      
      await base44.functions.invoke('grantVIPAccess', {
        recipientUserId: userProfile.user_id,
        planType: selectedPlan,
        durationDays: selectedDuration,
        reason: reason || 'Gifted by admin',
      });
      
      alert('✅ VIP access granted successfully!');
      onGifted?.();
      onClose();
    } catch (error) {
      console.error('[GiftVIPModal] Error:', error);
      alert('Failed to gift VIP: ' + error.message);
    } finally {
      setGifting(false);
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <>
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50" 
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }} 
        />
        
        {/* Modal */}
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl max-h-[90vh] overflow-y-auto"
          style={{ 
            background: isLight ? 'rgba(248,244,255,0.99)' : 'rgba(15,8,20,0.98)', 
            border: isLight ? '1px solid rgba(160,80,255,0.15)' : '1px solid rgba(255,255,255,0.1)' 
          }}>
          
          {/* Header */}
          <div className="sticky top-0 flex items-center justify-between px-6 pt-5 pb-4"
            style={{ 
              background: isLight ? 'rgba(246,241,255,0.98)' : 'rgba(15,8,20,0.95)', 
              borderBottom: isLight ? '1px solid rgba(160,80,255,0.12)' : '1px solid rgba(255,255,255,0.06)' 
            }}>
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5" style={{ color: '#fbbf24' }} />
              <h3 className="font-extrabold text-lg" style={{ color: isLight ? 'hsl(270,20%,12%)' : 'white' }}>Gift VIP Access</h3>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: isLight ? 'rgba(0,0,0,0.07)' : 'rgba(255,255,255,0.08)' }}>
              <X className="w-4 h-4" style={{ color: isLight ? 'hsl(270,20%,25%)' : 'white' }} />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-6 space-y-6">
            {/* User Info */}
            <div className="flex items-center gap-3 p-3 rounded-2xl"
              style={{ background: isLight ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.04)', border: isLight ? '1px solid rgba(160,80,255,0.1)' : '1px solid rgba(255,255,255,0.06)' }}>
              <img 
                src={userProfile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(userProfile.username)}&background=ff5500&color=fff&size=64`}
                alt={userProfile.username}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <p className="font-bold text-sm" style={{ color: isLight ? 'hsl(270,20%,12%)' : 'white' }}>
                  {userProfile.full_name || userProfile.username}
                </p>
                <p className="text-xs" style={{ color: isLight ? 'rgba(80,50,120,0.5)' : 'rgba(255,255,255,0.4)' }}>
                  @{userProfile.username}
                </p>
              </div>
            </div>

            {/* Plan Selection */}
            <div>
              <h4 className="font-bold text-sm mb-3" style={{ color: isLight ? 'hsl(270,20%,12%)' : 'white' }}>Select Plan</h4>
              <div className="grid grid-cols-3 gap-2">
                {PLANS.map(plan => {
                  const PlanIcon = plan.icon;
                  const isSelected = selectedPlan === plan.type;
                  return (
                    <motion.button
                      key={plan.type}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => setSelectedPlan(plan.type)}
                      className="p-3 rounded-2xl flex flex-col items-center gap-2"
                      style={{
                        background: isSelected ? plan.bg : (isLight ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.04)'),
                        border: isSelected ? `2px solid ${plan.color}` : (isLight ? '1px solid rgba(160,80,255,0.12)' : '1px solid rgba(255,255,255,0.06)'),
                      }}>
                      <PlanIcon className="w-5 h-5" style={{ color: isSelected ? plan.color : (isLight ? 'rgba(80,50,120,0.4)' : 'rgba(255,255,255,0.3)') }} />
                      <span className="text-[11px] font-semibold text-center" style={{ color: isSelected ? plan.color : (isLight ? 'rgba(80,50,120,0.6)' : 'rgba(255,255,255,0.5)') }}>
                        {plan.label}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Duration Selection */}
            <div>
              <h4 className="font-bold text-sm mb-3" style={{ color: isLight ? 'hsl(270,20%,12%)' : 'white' }}>Select Duration</h4>
              <div className="grid grid-cols-3 gap-2">
                {DURATIONS.map(duration => {
                  const DurationIcon = duration.icon;
                  const isSelected = selectedDuration === duration.days;
                  return (
                    <motion.button
                      key={duration.days}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => setSelectedDuration(duration.days)}
                      className={`p-3 rounded-2xl flex flex-col items-center gap-1.5 ${duration.premium ? 'ring-2 ring-yellow-400/50' : ''}`}
                      style={{
                        background: isSelected 
                          ? 'linear-gradient(135deg, rgba(255,85,0,0.15), rgba(233,30,140,0.15))' 
                          : (isLight ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.04)'),
                        border: isSelected 
                          ? '2px solid rgba(255,85,0,0.5)' 
                          : (isLight ? '1px solid rgba(160,80,255,0.12)' : '1px solid rgba(255,255,255,0.06)'),
                      }}>
                      <DurationIcon className="w-4 h-4" style={{ color: isSelected ? '#ff7040' : (isLight ? 'rgba(80,50,120,0.4)' : 'rgba(255,255,255,0.3)') }} />
                      <span className="text-[11px] font-semibold" style={{ color: isSelected ? '#ff7040' : (isLight ? 'rgba(80,50,120,0.6)' : 'rgba(255,255,255,0.5)') }}>
                        {duration.label}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Reason/Note */}
            <div>
              <h4 className="font-bold text-sm mb-2" style={{ color: isLight ? 'hsl(270,20%,12%)' : 'white' }}>
                Add Note (Optional)
              </h4>
              <textarea
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="Why are you gifting this VIP access?"
                rows={3}
                className="w-full p-3 rounded-2xl text-sm outline-none resize-none"
                style={{
                  background: isLight ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.04)',
                  border: isLight ? '1px solid rgba(160,80,255,0.12)' : '1px solid rgba(255,255,255,0.06)',
                  color: isLight ? 'hsl(270,20%,12%)' : 'white',
                }}
              />
            </div>

            {/* Summary */}
            <div className="p-4 rounded-2xl"
              style={{ background: isLight ? 'rgba(255,100,0,0.05)' : 'rgba(255,80,0,0.06)', border: isLight ? '1px solid rgba(255,100,0,0.15)' : '1px solid rgba(255,80,0,0.2)' }}>
              <div className="flex items-center gap-2 mb-2">
                <Heart className="w-4 h-4" style={{ color: '#ff5500' }} />
                <span className="font-bold text-sm" style={{ color: isLight ? 'hsl(270,20%,12%)' : 'white' }}>Summary</span>
              </div>
              <div className="text-xs space-y-1" style={{ color: isLight ? 'rgba(80,50,120,0.6)' : 'rgba(255,255,255,0.5)' }}>
                <p>• Plan: <strong>{PLANS.find(p => p.type === selectedPlan)?.label}</strong></p>
                <p>• Duration: <strong>{DURATIONS.find(d => d.days === selectedDuration)?.label}</strong></p>
                {reason && <p>• Note: {reason}</p>}
              </div>
            </div>

            {/* Action Button */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleGift}
              disabled={gifting}
              className="w-full py-4 rounded-2xl font-black text-base text-white flex items-center justify-center gap-2 disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, #ff5500 0%, #e91e8c 55%, #a733ff 100%)',
                boxShadow: '0 6px 28px rgba(255,60,0,0.4), 0 2px 10px rgba(200,30,120,0.25)',
              }}>
              {gifting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Gift VIP Access</span>
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      </>
    </AnimatePresence>
  );
}