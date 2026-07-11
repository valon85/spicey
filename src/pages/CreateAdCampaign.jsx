import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { X, DollarSign, Target, Users, Globe, Calendar, TrendingUp, Check } from 'lucide-react';

export default function CreateAdCampaign() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [campaignData, setCampaignData] = useState({
    campaignName: '',
    budget: 50,
    duration: 7,
    targetAudience: 'all',
    ageRange: '18-65',
    locations: ['US'],
    interests: [],
  });
  const [isLightMode, setIsLightMode] = useState(false);

  React.useEffect(() => {
    const check = () => setIsLightMode(document.documentElement.classList.contains('light-mode'));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke('createAdCampaign', {
        campaignName: campaignData.campaignName,
        budget: campaignData.budget,
        duration: campaignData.duration,
        targetAudience: {
          age_range: campaignData.ageRange,
          locations: campaignData.locations,
          interests: campaignData.interests.length > 0 ? campaignData.interests : ['all'],
        },
      });
      const data = res.data || res;
      if (data.success) {
        alert(data.message);
        navigate('/business/dashboard');
      }
    } catch (error) {
      const errData = error?.response?.data || error;
      alert(errData?.error || 'Failed to create campaign');
    } finally {
      setLoading(false);
    }
  };

  const bg = isLightMode ? 'hsl(270,25%,96%)' : 'rgb(6,3,10)';
  const cardBg = isLightMode ? 'rgba(255,255,255,0.9)' : 'rgba(20,10,30,0.6)';
  const cardBorder = isLightMode ? '1px solid rgba(168,85,247,0.2)' : '1px solid rgba(168,85,247,0.3)';
  const textColor = isLightMode ? 'hsl(270,20%,12%)' : 'white';
  const subtextColor = isLightMode ? 'rgba(80,50,120,0.6)' : 'rgba(255,255,255,0.4)';

  const estimatedReach = campaignData.budget * 150;

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
          <h1 className="text-lg font-bold" style={{ color: textColor }}>Create Ad Campaign</h1>
          <p className="text-xs" style={{ color: subtextColor }}>Step {step} of 3</p>
        </div>
      </div>

      <div className="px-4 py-6 space-y-4">
        {step === 1 && (
          <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
            className="p-5 rounded-2xl" style={{ background: cardBg, border: cardBorder }}>
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="w-5 h-5 text-green-400" />
              <h3 className="font-bold" style={{ color: textColor }}>Budget & Duration</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold mb-2 block" style={{ color: textColor }}>Campaign Name</label>
                <input
                  type="text"
                  value={campaignData.campaignName}
                  onChange={(e) => setCampaignData({ ...campaignData, campaignName: e.target.value })}
                  placeholder="My First Campaign"
                  className="w-full p-3 rounded-xl text-sm"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: textColor }}
                />
              </div>

              <div>
                <label className="text-sm font-semibold mb-2 block" style={{ color: textColor }}>
                  Budget: ${campaignData.budget}
                </label>
                <input
                  type="range"
                  min="20"
                  max="1000"
                  step="10"
                  value={campaignData.budget}
                  onChange={(e) => setCampaignData({ ...campaignData, budget: parseInt(e.target.value) })}
                  className="w-full"
                />
                <div className="flex justify-between text-xs mt-1" style={{ color: subtextColor }}>
                  <span>$20 min</span>
                  <span>$1000 max</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold mb-2 block" style={{ color: textColor }}>
                  Duration: {campaignData.duration} days
                </label>
                <input
                  type="range"
                  min="1"
                  max="90"
                  value={campaignData.duration}
                  onChange={(e) => setCampaignData({ ...campaignData, duration: parseInt(e.target.value) })}
                  className="w-full"
                />
                <div className="flex justify-between text-xs mt-1" style={{ color: subtextColor }}>
                  <span>1 day</span>
                  <span>90 days</span>
                </div>
              </div>

              <div className="p-4 rounded-xl" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)' }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm" style={{ color: textColor }}>Estimated Reach</span>
                  <TrendingUp className="w-4 h-4 text-green-400" />
                </div>
                <p className="text-2xl font-bold" style={{ color: '#22c55e' }}>{estimatedReach.toLocaleString()} users</p>
                <p className="text-xs" style={{ color: subtextColor }}>~{Math.floor(estimatedReach / campaignData.duration)} users/day</p>
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!campaignData.campaignName}
                className="w-full py-3 rounded-xl text-sm font-bold text-white"
                style={{ 
                  background: campaignData.campaignName ? 'linear-gradient(135deg, #22c55e, #16a34a)' : 'rgba(255,255,255,0.1)',
                  opacity: campaignData.campaignName ? 1 : 0.5
                }}>
                Next: Target Audience
              </button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
            className="p-5 rounded-2xl" style={{ background: cardBg, border: cardBorder }}>
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-orange-400" />
              <h3 className="font-bold" style={{ color: textColor }}>Target Audience</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold mb-2 block" style={{ color: textColor }}>Age Range</label>
                <select
                  value={campaignData.ageRange}
                  onChange={(e) => setCampaignData({ ...campaignData, ageRange: e.target.value })}
                  className="w-full p-3 rounded-xl text-sm"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: textColor }}>
                  <option value="18-24">18-24</option>
                  <option value="18-34">18-34</option>
                  <option value="18-65">18-65 (All Adults)</option>
                  <option value="25-44">25-44</option>
                  <option value="35-54">35-54</option>
                  <option value="45-65">45-65</option>
                  <option value="65+">65+</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold mb-2 block" style={{ color: textColor }}>Locations</label>
                <div className="grid grid-cols-2 gap-2">
                  {['US', 'UK', 'CA', 'AU', 'DE', 'FR', 'BR', 'IN'].map((country) => (
                    <motion.button
                      key={country}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => {
                        const locations = campaignData.locations.includes(country)
                          ? campaignData.locations.filter(c => c !== country)
                          : [...campaignData.locations, country];
                        setCampaignData({ ...campaignData, locations });
                      }}
                      className="p-3 rounded-xl text-sm font-semibold"
                      style={{
                        background: campaignData.locations.includes(country)
                          ? 'rgba(59,130,246,0.2)'
                          : 'rgba(255,255,255,0.03)',
                        border: campaignData.locations.includes(country)
                          ? '1px solid #3b82f6'
                          : '1px solid rgba(255,255,255,0.05)',
                        color: campaignData.locations.includes(country) ? '#3b82f6' : textColor
                      }}>
                      {country}
                    </motion.button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 rounded-xl text-sm font-bold"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: textColor }}>
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 py-3 rounded-xl text-sm font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}>
                  Next: Review
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
            className="p-5 rounded-2xl" style={{ background: cardBg, border: cardBorder }}>
            <div className="flex items-center gap-2 mb-4">
              <Check className="w-5 h-5 text-green-400" />
              <h3 className="font-bold" style={{ color: textColor }}>Review & Launch</h3>
            </div>

            <div className="space-y-3 mb-6">
              <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <p className="text-xs" style={{ color: subtextColor }}>Campaign Name</p>
                <p className="text-sm font-bold" style={{ color: textColor }}>{campaignData.campaignName || 'Unnamed'}</p>
              </div>
              <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <p className="text-xs" style={{ color: subtextColor }}>Budget</p>
                <p className="text-sm font-bold" style={{ color: textColor }}>${campaignData.budget} USD</p>
              </div>
              <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <p className="text-xs" style={{ color: subtextColor }}>Duration</p>
                <p className="text-sm font-bold" style={{ color: textColor }}>{campaignData.duration} days</p>
              </div>
              <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <p className="text-xs" style={{ color: subtextColor }}>Age Range</p>
                <p className="text-sm font-bold" style={{ color: textColor }}>{campaignData.ageRange}</p>
              </div>
              <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <p className="text-xs" style={{ color: subtextColor }}>Locations</p>
                <p className="text-sm font-bold" style={{ color: textColor }}>{campaignData.locations.join(', ')}</p>
              </div>
              <div className="p-4 rounded-xl" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)' }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm" style={{ color: textColor }}>Total Estimated Reach</span>
                  <TrendingUp className="w-4 h-4 text-green-400" />
                </div>
                <p className="text-2xl font-bold" style={{ color: '#22c55e' }}>{estimatedReach.toLocaleString()} users</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="flex-1 py-3 rounded-xl text-sm font-bold"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: textColor }}>
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 py-3 rounded-xl text-sm font-bold text-white"
                style={{ 
                  background: loading ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #22c55e, #16a34a)',
                  opacity: loading ? 0.5 : 1
                }}>
                {loading ? 'Launching...' : `Launch Campaign`}
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}