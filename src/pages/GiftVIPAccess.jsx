import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { X, Gift, Star, Flame, Diamond, Calendar, Mail, User, Check, Crown } from 'lucide-react';

const PLANS = [
  { id: 'vip', name: 'VIP Star', icon: Star, color: '#3b82f6', gradient: 'from-blue-500 to-indigo-500' },
  { id: 'creator', name: 'Creator Fire', icon: Flame, color: '#f97316', gradient: 'from-orange-500 to-red-500' },
  { id: 'business', name: 'Business Diamond', icon: Diamond, color: '#a855f7', gradient: 'from-purple-500 to-pink-500' },
];

const DURATIONS = [
  { months: 1, label: '1 Month' },
  { months: 3, label: '3 Months' },
  { months: 6, label: '6 Months' },
  { months: 12, label: '12 Months' },
  { months: 999, label: 'Lifetime' },
];

export default function GiftVIPAccess() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('vip');
  const [selectedDuration, setSelectedDuration] = useState(3);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientUsername, setRecipientUsername] = useState('');
  const [message, setMessage] = useState('');
  const [isLightMode, setIsLightMode] = useState(false);

  React.useEffect(() => {
    const check = () => setIsLightMode(document.documentElement.classList.contains('light-mode'));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

  const handleSubmit = async () => {
    if (!recipientEmail && !recipientUsername) {
      alert('Please enter recipient email or username');
      return;
    }

    setLoading(true);
    try {
      const res = await base44.functions.invoke('giftVIPAccess', {
        recipientEmail: recipientEmail || null,
        recipientUsername: recipientUsername || null,
        planType: selectedPlan,
        durationMonths: selectedDuration,
        message: message.trim(),
      });
      const data = res.data || res;
      if (data.success) {
        alert(data.message);
        navigate('/admin/email-automation');
      }
    } catch (error) {
      const errData = error?.response?.data || error;
      alert(errData?.error || 'Failed to gift access');
    } finally {
      setLoading(false);
    }
  };

  const bg = isLightMode ? 'hsl(270,25%,96%)' : 'rgb(6,3,10)';
  const cardBg = isLightMode ? 'rgba(255,255,255,0.9)' : 'rgba(20,10,30,0.6)';
  const cardBorder = isLightMode ? '1px solid rgba(168,85,247,0.2)' : '1px solid rgba(168,85,247,0.3)';
  const textColor = isLightMode ? 'hsl(270,20%,12%)' : 'white';
  const subtextColor = isLightMode ? 'rgba(80,50,120,0.6)' : 'rgba(255,255,255,0.4)';

  const selectedPlanData = PLANS.find(p => p.id === selectedPlan);

  return (
    <div className="min-h-screen pb-20" style={{ background: bg }}>
      {/* Header */}
      <div className="sticky top-0 z-40 flex items-center gap-3 px-4 py-4"
        style={{ 
          paddingTop: 'max(1rem, env(safe-area-inset-top))',
          background: isLightMode ? 'rgba(248,244,255,0.96)' : 'rgba(8,4,12,0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: isLightMode ? '1px solid rgba(168,85,247,0.2)' : '1px solid rgba(168,85,247,0.3)',
        }}>
        <button onClick={() => navigate(-1)} className="w-8 h-8 flex items-center justify-center" style={{ color: subtextColor }}>
          <X className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold" style={{ color: textColor }}>Gift VIP Access</h1>
            <Gift className="w-5 h-5 text-pink-400" />
          </div>
          <p className="text-xs" style={{ color: subtextColor }}>Grant premium access to users</p>
        </div>
      </div>

      <div className="px-4 py-6 space-y-4">
        {/* Recipient Info */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          className="p-5 rounded-2xl" style={{ background: cardBg, border: cardBorder }}>
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-purple-400" />
            <h3 className="font-bold" style={{ color: textColor }}>Recipient</h3>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-sm font-semibold mb-2 block" style={{ color: textColor }}>Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: subtextColor }} />
                <input
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: textColor }}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.1)' }} />
              <span className="text-xs" style={{ color: subtextColor }}>OR</span>
              <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.1)' }} />
            </div>

            <div>
              <label className="text-sm font-semibold mb-2 block" style={{ color: textColor }}>Username</label>
              <input
                type="text"
                value={recipientUsername}
                onChange={(e) => setRecipientUsername(e.target.value)}
                placeholder="@username"
                className="w-full px-4 py-3 rounded-xl text-sm"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: textColor }}
              />
            </div>
          </div>
        </motion.div>

        {/* Select Plan */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}
          className="p-5 rounded-2xl" style={{ background: cardBg, border: cardBorder }}>
          <div className="flex items-center gap-2 mb-4">
            <Crown className="w-5 h-5 text-yellow-400" />
            <h3 className="font-bold" style={{ color: textColor }}>Select Plan</h3>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {PLANS.map((plan) => {
              const Icon = plan.icon;
              return (
                <motion.button
                  key={plan.id}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setSelectedPlan(plan.id)}
                  className="p-4 rounded-xl text-center"
                  style={{
                    background: selectedPlan === plan.id
                      ? `rgba(${plan.id === 'vip' ? '59,130,246' : plan.id === 'creator' ? '249,115,22' : '168,85,247'}, 0.2)`
                      : 'rgba(255,255,255,0.03)',
                    border: selectedPlan === plan.id
                      ? `2px solid ${plan.color}`
                      : '1px solid rgba(255,255,255,0.05)',
                  }}>
                  <Icon className="w-6 h-6 mx-auto mb-2" style={{ color: selectedPlan === plan.id ? plan.color : subtextColor }} />
                  <p className="text-xs font-bold" style={{ color: selectedPlan === plan.id ? plan.color : textColor }}>
                    {plan.name}
                  </p>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Select Duration */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15 }}
          className="p-5 rounded-2xl" style={{ background: cardBg, border: cardBorder }}>
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-green-400" />
            <h3 className="font-bold" style={{ color: textColor }}>Duration</h3>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {DURATIONS.map((duration) => (
              <motion.button
                key={duration.months}
                whileTap={{ scale: 0.96 }}
                onClick={() => setSelectedDuration(duration.months)}
                className="p-3 rounded-xl text-sm font-semibold"
                style={{
                  background: selectedDuration === duration.months
                    ? 'rgba(34,197,94,0.2)'
                    : 'rgba(255,255,255,0.03)',
                  border: selectedDuration === duration.months
                    ? '1px solid #22c55e'
                    : '1px solid rgba(255,255,255,0.05)',
                  color: selectedDuration === duration.months ? '#22c55e' : textColor,
                }}>
                {duration.label}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Personal Message */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
          className="p-5 rounded-2xl" style={{ background: cardBg, border: cardBorder }}>
          <div className="flex items-center gap-2 mb-3">
            <Mail className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold" style={{ color: textColor }}>Personal Message (Optional)</h3>
          </div>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Add a personal message to include in the gift notification..."
            rows={3}
            className="w-full p-3 rounded-xl text-sm resize-none"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: textColor }}
          />
        </motion.div>

        {/* Summary */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.25 }}
          className="p-5 rounded-2xl"
          style={{ 
            background: `linear-gradient(135deg, rgba(${selectedPlan?.id === 'vip' ? '59,130,246' : selectedPlan?.id === 'creator' ? '249,115,22' : '168,85,247'}, 0.2), rgba(236,72,153,0.2))`,
            border: `1px solid ${selectedPlanData?.color || '#a855f7'}`,
          }}>
          <h3 className="font-bold mb-3" style={{ color: textColor }}>Gift Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span style={{ color: subtextColor }}>Plan:</span>
              <span className="font-bold" style={{ color: textColor }}>{selectedPlanData?.name}</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: subtextColor }}>Duration:</span>
              <span className="font-bold" style={{ color: textColor }}>
                {selectedDuration === 999 ? 'Lifetime' : `${selectedDuration} Month${selectedDuration > 1 ? 's' : ''}`}
              </span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: subtextColor }}>Recipient:</span>
              <span className="font-bold" style={{ color: textColor }}>{recipientEmail || recipientUsername || '-'}</span>
            </div>
          </div>
        </motion.div>

        {/* Send Button */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleSubmit}
          disabled={loading || (!recipientEmail && !recipientUsername)}
          className="w-full py-4 rounded-2xl text-sm font-bold text-white"
          style={{
            background: loading || (!recipientEmail && !recipientUsername)
              ? 'rgba(255,255,255,0.1)'
              : 'linear-gradient(135deg, #ec4899, #a855f7)',
            opacity: loading || (!recipientEmail && !recipientUsername) ? 0.5 : 1,
            boxShadow: '0 0 30px rgba(236,72,153,0.4)',
          }}>
          {loading ? 'Sending Gift...' : '🎁 Send Gift'}
        </motion.button>

        {/* Info */}
        <div className="p-4 rounded-xl text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <p className="text-xs" style={{ color: subtextColor }}>
            ✓ Recipient will receive notification & email<br/>
            ✓ Badge applied instantly<br/>
            ✓ Premium features activated immediately
          </p>
        </div>
      </div>
    </div>
  );
}