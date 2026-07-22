import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, Flame, Diamond, Check, X, Crown, Zap, TrendingUp, Users, Shield, Palette, Rocket, Target, Award, Eye, BarChart2, Megaphone, Lock } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import ProfileThemePicker from '@/components/profile/ProfileThemePicker';
import { useTheme } from '@/lib/ThemeContext';
import { isAdminEmail } from '@/lib/adminAccess';

const PLANS = [
  {
    id: 'vip',
    name: 'Spicey VIP',
    price: '$11.99',
    period: '/month',
    icon: Crown,
    badge: '👑',
    gradient: 'linear-gradient(135deg, #9B30FF, #6A0DAD)',
    bgColor: 'rgba(155, 48, 255, 0.12)',
    borderColor: 'rgba(155, 48, 255, 0.4)',
    features: [
      { icon: Crown, label: 'Purple Crown VIP Badge', action: 'profile' },
      { icon: Eye, label: 'Verified Profile Status', action: 'profile' },
      { icon: Rocket, label: 'Priority feed & search visibility', action: 'explore' },
      { icon: Palette, label: 'VIP Color Themes (8 exclusive)', action: 'themes' },
      { icon: Zap, label: 'Longer videos & live streams', action: 'create' },
      { icon: BarChart2, label: 'Advanced profile insights', action: 'analytics' },
      { icon: Star, label: 'Early access to new features', action: 'dashboard' },
    ],
  },
  {
    id: 'creator',
    name: 'Spicey Creator',
    price: '$24.99',
    period: '/month',
    icon: Flame,
    badge: '🔥',
    gradient: 'linear-gradient(135deg, #f97316, #ef4444)',
    bgColor: 'rgba(249, 115, 22, 0.1)',
    borderColor: 'rgba(249, 115, 22, 0.3)',
    popular: true,
    features: [
      { icon: Crown, label: 'All VIP features included', action: 'dashboard' },
      { icon: Award, label: 'Creator Flame Badge', action: 'profile' },
      { icon: BarChart2, label: 'Full content analytics', action: 'analytics' },
      { icon: Megaphone, label: 'Post boosting & promotion', action: 'boost' },
      { icon: Target, label: 'Monetization features', action: 'dashboard' },
      { icon: Users, label: 'Priority creator support', action: 'support' },
      { icon: TrendingUp, label: 'Advanced audience insights', action: 'analytics' },
    ],
  },
  {
    id: 'business',
    name: 'Spicey Business',
    price: '$49.99',
    period: '/month',
    icon: Diamond,
    badge: '💎',
    gradient: 'linear-gradient(135deg, #FFD700, #B8860B)',
    bgColor: 'rgba(255, 215, 0, 0.08)',
    borderColor: 'rgba(255, 215, 0, 0.35)',
    features: [
      { icon: Flame, label: 'All Creator features included', action: 'dashboard' },
      { icon: Shield, label: 'Gold Business Badge', action: 'profile' },
      { icon: Target, label: 'Business profile & branding', action: 'settings' },
      { icon: BarChart2, label: 'Business analytics dashboard', action: 'analytics' },
      { icon: Megaphone, label: 'Ad campaigns & promotions', action: 'ads' },
      { icon: Zap, label: 'Priority 24/7 support', action: 'support' },
      { icon: Users, label: 'Team management tools', action: 'dashboard' },
    ],
  },
];

export default function SpiceyVIP() {
  const navigate = useNavigate();
  const { theme: activeTheme } = useTheme();
  const [user, setUser] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [isLightMode, setIsLightMode] = useState(false);
  const [themePickerOpen, setThemePickerOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('default');
  const [hasUsedTrial, setHasUsedTrial] = useState(false);

  useEffect(() => {
    const check = () => setIsLightMode(document.documentElement.classList.contains('light-mode'));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    try {
      const currentUser = await base44.auth.me();
      if (!currentUser) return;

      setUser(currentUser);

      // Check if admin account
      if (isAdminEmail(currentUser)) {
        setCurrentSubscription({
          plan_type: 'business',
          status: 'active',
          current_period_end: '2099-12-31T23:59:59.000Z',
          isAdmin: true,
        });
        return;
      }

      const statusResult = await base44.functions.invoke('getUserSubscription');
      const statusData = statusResult?.data || statusResult || {};
      const activeSubscription = statusData.subscription || null;

      if (statusData.hasSubscription || statusData.is_vip) {
        setCurrentSubscription({
          ...activeSubscription,
          plan_type: statusData.planType || activeSubscription?.plan_type || activeSubscription?.plan || 'vip',
        });
      }

      // Load current profile theme + trial status
      const profiles = await base44.entities.UserProfile.filter({ user_id: currentUser.id });
      if (profiles[0]?.profile_theme) setCurrentTheme(profiles[0].profile_theme);

      // Check if user has already used trial (from any previous subscription)
      const allSubs = await base44.entities.Subscription.filter({ user_id: currentUser.id });
      const trialWasUsed = profiles[0]?.trial_used === true || allSubs.some(s => s.trial_used === true);
      setHasUsedTrial(trialWasUsed);
    } catch (err) {
      console.error('Error loading subscription:', err);
    }
  };

  const handleSubscribe = async (planType) => {
    setLoading(true);
    setError('');
    
    try {
      // Check if running in iframe
      if (window.self !== window.top) {
        setError('Subscriptions are only available in the published app. Please open the app in a new tab.');
        setLoading(false);
        return;
      }

      const response = await base44.functions.invoke('stripeCheckout', {
        planType,
        returnUrl: `${window.location.origin}/vip`,
      });
      const data = response.data || response;
      
      // Admin account - already has all features
      if (data.isAdmin) {
        setError('');
        // Refresh subscription status
        await loadSubscription();
        return;
      }
      
      if (data.url) {
        window.location.href = data.url;
      } else if (data.error) {
        setError(data.error);
      }
    } catch (err) {
      setError(err?.message || 'Failed to start checkout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = () => {
    navigate('/settings');
  };

  const handleAccessFeature = (featureType) => {
    if (!featureType) return;
    const hasAccess = ['active', 'trialing'].includes(currentSubscription?.status) || isAdminEmail(user);
    if (!hasAccess) {
      setError('Subscribe to unlock this feature!');
      return;
    }
    switch (featureType) {
      case 'analytics': navigate('/vip-dashboard'); break;
      case 'settings': navigate('/vip-dashboard'); break;
      case 'themes': navigate('/vip-dashboard'); break;
      case 'explore': navigate('/explore'); break;
      case 'profile': navigate('/profile'); break;
      case 'create': navigate('/create'); break;
      case 'support': window.location.href = 'mailto:info@spicey.live?subject=Spicey%20VIP%20Support'; break;
      case 'dashboard': navigate('/vip-dashboard'); break;
      case 'ads': navigate('/vip-dashboard'); break;
      case 'boost': navigate('/vip-dashboard'); break;
      case 'vip':
      case 'creator':
      case 'business':
        navigate('/vip-dashboard'); break;
      default: navigate('/vip-dashboard'); break;
    }
  };

  const bg = isLightMode ? 'hsl(270,25%,96%)' : 'rgb(6,3,10)';
  const cardBg = isLightMode ? 'rgba(255,255,255,0.9)' : 'rgba(20,10,30,0.6)';
  const cardBorder = isLightMode ? '1px solid rgba(160,80,255,0.2)' : '1px solid rgba(255,255,255,0.08)';
  const textColor = isLightMode ? 'hsl(270,20%,12%)' : 'white';
  const subtextColor = isLightMode ? 'rgba(80,50,120,0.6)' : 'rgba(255,255,255,0.4)';

  return (
    <div className="min-h-screen pb-32" style={{ background: bg }}>
      {/* Header */}
      <div className="sticky top-0 z-40 flex items-center gap-3 px-4 py-4"
        style={{ 
          paddingTop: 'max(1rem, env(safe-area-inset-top))',
          background: isLightMode ? 'rgba(248,244,255,0.96)' : 'rgba(8,4,12,0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: isLightMode ? '1px solid rgba(160,80,255,0.12)' : '1px solid rgba(255,255,255,0.05)',
        }}>
        <button onClick={() => navigate(-1)} className="w-8 h-8 flex items-center justify-center" style={{ color: subtextColor }}>
          <X className="w-6 h-6" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold" style={{ color: textColor }}>Spicey Premium</h1>
          <p className="text-xs" style={{ color: subtextColor }}>Unlock exclusive features</p>
        </div>
      </div>

      {/* Hero Section */}
      <div className="px-4 py-8 text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mb-6"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4"
            style={{ 
              background: 'linear-gradient(135deg, #9B30FF, #6A0DAD, #C100FF)',
              boxShadow: '0 0 40px rgba(155,48,255,0.5)',
            }}>
            <Crown className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-extrabold mb-2" style={{ color: textColor }}>
            Unlock Your Full Potential
          </h2>
          <p className="text-sm" style={{ color: subtextColor }}>
            Choose your plan and get exclusive access to premium features
          </p>
        </motion.div>
      </div>

      {/* Current Subscription Banner */}
      {currentSubscription && (
        <div className="px-4 mb-6">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="p-4 rounded-2xl"
            style={{
              background: currentSubscription.isAdmin
                ? 'linear-gradient(135deg, rgba(168,85,247,0.2), rgba(233,30,140,0.2))'
                : 'linear-gradient(135deg, rgba(255,85,0,0.15), rgba(233,30,140,0.15))',
              border: currentSubscription.isAdmin
                ? '2px solid rgba(168,85,247,0.5)'
                : '1px solid rgba(255,85,0,0.3)',
            }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ 
                  background: currentSubscription.isAdmin 
                    ? 'linear-gradient(135deg, #a855f7, #e91e8c)' 
                    : 'rgba(255,85,0,0.2)' 
                }}>
                {currentSubscription.isAdmin ? (
                  <Crown className="w-5 h-5 text-white" />
                ) : (
                  <Check className="w-5 h-5 text-orange-400" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm" style={{ color: textColor }}>
                  {currentSubscription.isAdmin ? '👑 Admin Account - All Features Unlocked' :
                   currentSubscription.plan_type === 'vip' ? 'Spicey VIP' : 
                   currentSubscription.plan_type === 'creator' ? 'Spicey Creator' : 'Spicey Business'}
                </p>
                <p className="text-xs" style={{ color: subtextColor }}>
                  {currentSubscription.isAdmin 
                    ? 'Full access to all premium features for testing' 
                    : `Active until ${new Date(currentSubscription.current_period_end).toLocaleDateString()}`}
                </p>
              </div>
              <div className="flex gap-2 flex-wrap">
                {currentSubscription.isAdmin && (
                  <>
                    <button 
                      onClick={() => navigate('/admin/vip-management')}
                      className="px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1"
                      style={{
                        background: 'linear-gradient(135deg, rgba(255,85,0,0.3), rgba(233,30,140,0.3))',
                        border: '2px solid rgba(255,85,0,0.6)',
                        color: '#ffaa55',
                        boxShadow: '0 0 15px rgba(255,85,0,0.4)',
                      }}>
                      👑 Gift VIP
                    </button>
                    <button 
                      onClick={() => handleAccessFeature('vip')}
                      className="px-3 py-1.5 rounded-full text-xs font-semibold"
                      style={{
                        background: 'rgba(59,130,246,0.3)',
                        border: '1px solid rgba(59,130,246,0.5)',
                        color: '#93c5fd',
                      }}>
                      ⭐ VIP
                    </button>
                    <button 
                      onClick={() => handleAccessFeature('creator')}
                      className="px-3 py-1.5 rounded-full text-xs font-semibold"
                      style={{
                        background: 'rgba(249,115,22,0.3)',
                        border: '1px solid rgba(249,115,22,0.5)',
                        color: '#fdba74',
                      }}>
                      🔥 Creator
                    </button>
                    <button 
                      onClick={() => handleAccessFeature('business')}
                      className="px-3 py-1.5 rounded-full text-xs font-semibold"
                      style={{
                        background: 'rgba(168,85,247,0.3)',
                        border: '1px solid rgba(168,85,247,0.5)',
                        color: '#d8b4fe',
                      }}>
                      💎 Business
                    </button>
                  </>
                )}
                {!currentSubscription.isAdmin && (
                  <button 
                    onClick={handleManageSubscription}
                    className="px-3 py-1.5 rounded-full text-xs font-semibold"
                    style={{
                      background: 'rgba(255,255,255,0.1)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      color: textColor,
                    }}>
                    Manage
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Free Trial Banner */}
      {!currentSubscription && !hasUsedTrial && (
        <div className="px-4 mb-2">
          <motion.div
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="p-4 rounded-2xl flex items-center gap-3"
            style={{
              background: 'linear-gradient(135deg, rgba(255,85,0,0.2), rgba(233,30,140,0.2))',
              border: '2px solid rgba(255,170,0,0.5)',
            }}>
            <span style={{ fontSize: 28 }}>🎁</span>
            <div>
              <p className="font-extrabold text-sm text-white">30 Days FREE for new users!</p>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
                Try any plan free for 30 days — cancel anytime before billing starts.
              </p>
            </div>
          </motion.div>
        </div>
      )}

      {/* Open Dashboard Button — shown only if subscribed */}
      {currentSubscription && (
        <div className="px-4 mb-4">
          <motion.button whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/vip-dashboard')}
            className="w-full py-4 rounded-2xl font-extrabold text-white text-base flex items-center justify-center gap-3"
            style={{
              background: currentSubscription.plan_type === 'creator'
                ? 'linear-gradient(135deg, #f97316, #ef4444)'
                : currentSubscription.plan_type === 'business'
                ? 'linear-gradient(135deg, #FFD700, #B8860B)'
                : 'linear-gradient(135deg, #9B30FF, #6A0DAD)',
              boxShadow: '0 8px 32px rgba(155,48,255,0.4)',
            }}>
            <Crown className="w-5 h-5" />
            Open VIP Dashboard
          </motion.button>
        </div>
      )}

      {/* Plan Cards */}
      <div className="px-4 space-y-4">
        {PLANS.map((plan) => {
          const Icon = plan.icon;
          const isSelected = selectedPlan === plan.id;
          const isCurrentPlan = currentSubscription?.plan_type === plan.id;

          return (
            <motion.div
              key={plan.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              whileTap={{ scale: isCurrentPlan ? 1 : 0.98 }}
              onClick={() => !isCurrentPlan && setSelectedPlan(plan.id)}
              className={`relative p-5 rounded-3xl cursor-pointer transition-all ${
                isSelected ? 'scale-[1.02]' : ''
              }`}
              style={{
                background: plan.popular 
                  ? `linear-gradient(135deg, ${plan.bgColor}, rgba(255,255,255,0.05))`
                  : cardBg,
                border: isSelected || plan.popular
                  ? `2px solid ${plan.borderColor}`
                  : cardBorder,
              }}>
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, #ff5500, #e91e8c)' }}>
                  ⭐ Most Popular
                </div>
              )}

              {/* Header */}
              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: plan.gradient }}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-extrabold" style={{ color: textColor }}>{plan.name}</h3>
                    <span className="text-xl">{plan.badge}</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-extrabold" style={{ color: textColor }}>{plan.price}</span>
                    <span className="text-xs" style={{ color: subtextColor }}>{plan.period}</span>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-2 mb-5">
                {plan.features.map((feature, i) => {
                  const FIcon = feature.icon || Check;
                  const isClickable = !!feature.action && (
                    ['active', 'trialing'].includes(currentSubscription?.status) || isAdminEmail(user)
                  );
                  return (
                    <div key={i}
                      onClick={feature.action ? () => handleAccessFeature(feature.action) : undefined}
                      className="flex items-center gap-2"
                      style={{ cursor: feature.action ? 'pointer' : 'default' }}>
                      <FIcon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: isClickable ? '#22c55e' : 'rgba(255,255,255,0.4)' }} />
                      <span className="text-xs flex-1" style={{ color: textColor }}>{feature.label}</span>
                      {feature.action && isClickable && (
                        <span style={{ fontSize: 9, color: '#22c55e', fontWeight: 700 }}>TAP →</span>
                      )}
                      {feature.action && !isClickable && (
                        <Lock className="w-3 h-3" style={{ color: 'rgba(255,255,255,0.25)' }} />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Action Button */}
              {currentSubscription?.isAdmin ? (
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAccessFeature(plan.id);
                  }}
                  className="w-full py-3 rounded-2xl font-bold text-sm text-white"
                  style={{
                    background: plan.gradient,
                    boxShadow: '0 0 20px rgba(255,85,0,0.3)',
                  }}>
                  🚀 Open {plan.name} Dashboard
                </motion.button>
              ) : isCurrentPlan ? (
                <button
                  disabled
                  className="w-full py-3 rounded-2xl font-bold text-sm"
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: subtextColor,
                  }}>
                  ✓ Current Plan
                </button>
              ) : (
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSubscribe(plan.id);
                  }}
                  disabled={loading}
                  className={`w-full py-3 rounded-2xl font-bold text-sm text-white transition-all ${
                    loading ? 'opacity-70' : ''
                  }`}
                  style={{
                    background: plan.gradient,
                    boxShadow: '0 0 20px rgba(255,85,0,0.3)',
                  }}>
                  {loading ? 'Processing...' : hasUsedTrial ? `Subscribe Now` : `Start 30-Day Free Trial`}
                </motion.button>
              )}
            </motion.div>
          );
        })}
      </div>

      <ProfileThemePicker
        open={themePickerOpen}
        onClose={() => setThemePickerOpen(false)}
        currentTheme={activeTheme || currentTheme}
        hasVIP={!!currentSubscription}
        onThemeChange={(theme) => setCurrentTheme(theme)}
      />

      {/* Error Message */}
      {error && (
        <div className="fixed bottom-24 left-4 right-4 p-4 rounded-2xl text-sm font-semibold"
          style={{
            background: 'rgba(220,30,30,0.15)',
            border: '1px solid rgba(220,30,30,0.4)',
            color: '#ff6b6b',
          }}>
          ⚠️ {error}
        </div>
      )}

      {/* Admin Quick Actions */}
      {currentSubscription?.isAdmin && (
        <div className="px-4 py-6">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="p-5 rounded-3xl"
            style={{
              background: 'linear-gradient(135deg, rgba(255,85,0,0.15), rgba(233,30,140,0.15))',
              border: '2px solid rgba(255,85,0,0.4)',
              boxShadow: '0 0 30px rgba(255,85,0,0.2)',
            }}>
            <div className="flex items-center gap-3 mb-4">
              <Crown className="w-6 h-6 text-orange-400" />
              <h3 className="font-extrabold text-base" style={{ color: textColor }}>Admin Quick Actions</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => navigate('/admin/vip-management')}
                className="p-3 rounded-2xl text-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,85,0,0.2), rgba(233,30,140,0.2))',
                  border: '1px solid rgba(255,85,0,0.4)',
                }}>
                <Crown className="w-5 h-5 mx-auto mb-1 text-orange-400" />
                <p className="text-xs font-bold" style={{ color: '#ffaa55' }}>Gift VIP</p>
                <p className="text-[10px] mt-0.5" style={{ color: subtextColor }}>Grant VIP to users</p>
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => handleAccessFeature('analytics')}
                className="p-3 rounded-2xl text-center"
                style={{
                  background: 'rgba(34,197,94,0.2)',
                  border: '1px solid rgba(34,197,94,0.4)',
                }}>
                <TrendingUp className="w-5 h-5 mx-auto mb-1 text-green-400" />
                <p className="text-xs font-bold" style={{ color: '#86efac' }}>Analytics</p>
                <p className="text-[10px] mt-0.5" style={{ color: subtextColor }}>View stats</p>
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}

      {/* App Theme Picker — visible to all, VIP themes locked */}
      <div className="px-4 mb-2">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => setThemePickerOpen(true)}
          className="w-full p-4 rounded-2xl flex items-center gap-4"
          style={{
            background: 'linear-gradient(135deg, rgba(167,51,255,0.15), rgba(233,30,140,0.15))',
            border: '2px solid rgba(167,51,255,0.4)',
          }}>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #a733ff, #e91e8c)' }}>
            <Palette className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-extrabold text-sm text-white">🎨 App Theme</p>
            <p className="text-[11px] mt-0.5" style={{ color: subtextColor }}>
              {currentSubscription ? 'All themes unlocked — tap to change' : 'Dark & Light free · VIP unlocks 8 color themes'}
            </p>
          </div>
          <div className="flex gap-1 items-center">
            {['#e91e8c','#f59e0b','#3b82f6','#10b981'].map(c => (
              <div key={c} className="w-4 h-4 rounded-full" style={{ background: c }} />
            ))}
          </div>
        </motion.button>
      </div>

      {/* Features Grid */}
      <div className="px-4 py-8 mt-2">
        <h3 className="text-center font-bold mb-6" style={{ color: textColor }}>Why Go Premium?</h3>
        <div className="grid grid-cols-2 gap-4">
          {[
            { icon: Crown, label: 'VIP Purple Badge', desc: 'Crown badge on your profile', action: () => handleAccessFeature('settings') },
            { icon: Rocket, label: 'Priority Visibility', desc: 'Top of search & feed', action: () => handleAccessFeature('explore') },
            { icon: BarChart2, label: 'Analytics', desc: 'Deep insights into growth', action: () => handleAccessFeature('analytics') },
            { icon: Palette, label: 'Color Themes', desc: '8 exclusive VIP themes', action: () => handleAccessFeature('themes') },
            { icon: Megaphone, label: 'Boost Posts', desc: 'Amplify your content reach', action: () => handleAccessFeature('boost') },
            { icon: Zap, label: 'Early Access', desc: 'Try new features first', action: () => handleAccessFeature('settings') },
          ].map((item, i) => (
            <motion.button
              key={i}
              whileTap={{ scale: 0.96 }}
              onClick={item.action}
              className="p-4 rounded-2xl text-center cursor-pointer"
              style={{
                background: cardBg,
                border: cardBorder,
              }}>
              <item.icon className="w-6 h-6 mx-auto mb-2 text-orange-400" />
              <p className="text-xs font-bold" style={{ color: textColor }}>{item.label}</p>
              <p className="text-[10px] mt-0.5" style={{ color: subtextColor }}>{item.desc}</p>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
