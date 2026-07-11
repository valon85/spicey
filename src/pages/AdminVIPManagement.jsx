import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { 
  Crown, Users, Calendar, Clock, Shield, Trash2, AlertCircle, 
  ChevronLeft, Search, Filter, Sparkles, Zap, Flame, Diamond
} from 'lucide-react';
import BottomNav from '../components/feed/BottomNav';
import GiftVIPModal from '../components/panels/GiftVIPModal';

const DURATIONS = [
  { days: 1, label: '1 Day', icon: Clock },
  { days: 7, label: '7 Days', icon: Calendar },
  { days: 30, label: '30 Days', icon: Calendar },
  { days: 90, label: '90 Days', icon: Calendar },
  { days: 365, label: '1 Year', icon: Calendar },
  { days: 9999, label: 'Lifetime', icon: Sparkles, highlight: true },
];

const PLAN_COLORS = {
  vip: { bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.3)', text: '#3b82f6', icon: Crown },
  creator: { bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)', text: '#ef4444', icon: Flame },
  business: { bg: 'rgba(168,85,247,0.1)', border: 'rgba(168,85,247,0.3)', text: '#a855f7', icon: Diamond },
};

export default function AdminVIPManagement() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [giftModalOpen, setGiftModalOpen] = useState(false);
  const [isLight, setIsLight] = useState(false);
  const [filterPlan, setFilterPlan] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  // Gift search
  const [giftSearch, setGiftSearch] = useState('');
  const [giftResults, setGiftResults] = useState([]);
  const [giftSearching, setGiftSearching] = useState(false);

  useEffect(() => {
    const check = () => setIsLight(document.documentElement.classList.contains('light-mode'));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    base44.auth.me().then(user => {
      setCurrentUser(user);
      // Admin users: info@spicey.live and valondervishi13@gmail.com
      const adminEmails = ['info@spicey.live', 'valondervishi13@gmail.com'];
      const isAdminUser = adminEmails.includes((user?.email || '').toLowerCase());
      setIsAdmin(isAdminUser);
      console.log('[AdminVIP] User:', user?.email, 'Is admin:', isAdminUser);
    });
  }, []);

  const { data: vipData, refetch, isLoading } = useQuery({
    queryKey: ['admin-vip-users'],
    queryFn: () => base44.functions.invoke('getVIPUsers', {}),
    enabled: isAdmin,
    staleTime: 30000,
  });

  const handleRemoveVIP = async (subscription) => {
    if (!confirm(`Remove ${subscription.plan_type.toUpperCase()} access from @${subscription.user_profile?.username}?`)) {
      return;
    }
    
    const reason = prompt('Reason for removal (optional):');
    
    try {
      await base44.functions.invoke('removeVIPAccess', {
        subscriptionId: subscription.id,
        reason: reason || 'Removed by admin',
      });
      await refetch();
    } catch (error) {
      alert('Failed to remove VIP: ' + error.message);
    }
  };

  const handleGiftVIP = (userProfile) => {
    setSelectedUser(userProfile);
    setGiftModalOpen(true);
  };

  const handleGiftSearch = async (q) => {
    setGiftSearch(q);
    if (q.trim().length < 2) { setGiftResults([]); return; }
    setGiftSearching(true);
    try {
      const res = await base44.functions.invoke('searchUsers', { query: q.trim(), limit: 8 });
      setGiftResults(res?.data?.users || res?.data || []);
    } catch { setGiftResults([]); }
    finally { setGiftSearching(false); }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: isLight ? 'hsl(270,25%,96%)' : 'rgb(6,3,10)' }}>
        <div className="text-center px-4">
          <Shield className="w-16 h-16 mx-auto mb-4" style={{ color: isLight ? 'rgba(120,80,180,0.3)' : 'rgba(255,255,255,0.2)' }} />
          <h1 className="text-xl font-bold mb-2" style={{ color: isLight ? 'hsl(270,20%,12%)' : 'white' }}>Access Denied</h1>
          <p style={{ color: isLight ? 'rgba(80,50,120,0.5)' : 'rgba(255,255,255,0.4)' }}>Admin access required</p>
        </div>
      </div>
    );
  }

  const subscriptions = vipData?.subscriptions || [];
  
  // Filter subscriptions based on plan type and search query
  const filteredSubscriptions = subscriptions.filter(sub => {
    const matchesPlan = filterPlan === 'all' || sub.plan_type === filterPlan;
    const matchesSearch = searchQuery === '' || 
      sub.user_profile?.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.user_profile?.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPlan && matchesSearch;
  });

  return (
    <div className="fixed inset-0 flex flex-col" style={{ background: isLight ? 'hsl(270,25%,96%)' : 'rgb(6,3,10)' }}>
      {/* Header */}
      <div className="flex-shrink-0 z-40 flex items-center justify-between px-4 pb-3" 
        style={{ 
          paddingTop: 'max(0.75rem, env(safe-area-inset-top))', 
          background: isLight ? 'rgba(248,244,255,0.96)' : 'rgba(6,3,10,0.96)', 
          backdropFilter: 'blur(20px)', 
          borderBottom: isLight ? '1px solid rgba(160,80,255,0.12)' : '1px solid rgba(255,255,255,0.05)' 
        }}>
        <button onClick={() => navigate(-1)} className="w-8 h-8 flex items-center justify-center" style={{ color: isLight ? 'hsl(270,20%,30%)' : 'rgba(255,255,255,0.6)' }}>
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-2">
          <Crown className="w-5 h-5" style={{ color: '#fbbf24' }} />
          <h1 className="font-extrabold text-base" style={{ color: isLight ? 'hsl(270,20%,12%)' : 'white' }}>VIP Management</h1>
        </div>
        <div className="w-8" />
      </div>

      {/* Gift VIP Search */}
      <div className="flex-shrink-0 px-4 pt-4 pb-3" style={{ borderBottom: isLight ? '1px solid rgba(160,80,255,0.1)' : '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2 mb-2">
          <Crown className="w-4 h-4" style={{ color: '#fbbf24' }} />
          <span className="font-bold text-sm" style={{ color: isLight ? 'hsl(270,20%,12%)' : 'white' }}>Gift VIP to User</span>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: isLight ? 'rgba(80,50,120,0.4)' : 'rgba(255,255,255,0.3)' }} />
          <input
            type="text"
            value={giftSearch}
            onChange={e => handleGiftSearch(e.target.value)}
            placeholder="Search by username, name, or email..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none"
            style={{
              background: isLight ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.06)',
              border: isLight ? '1px solid rgba(160,80,255,0.2)' : '1px solid rgba(255,255,255,0.1)',
              color: isLight ? 'hsl(270,20%,12%)' : 'white',
              fontSize: '16px',
            }}
          />
          {giftSearching && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 rounded-full animate-spin"
              style={{ borderColor: 'rgba(255,80,0,0.2)', borderTopColor: '#ff5500' }} />
          )}
        </div>
        {giftResults.length > 0 && (
          <div className="mt-2 rounded-2xl overflow-hidden"
            style={{ background: isLight ? 'white' : 'rgba(20,10,35,0.98)', border: isLight ? '1px solid rgba(160,80,255,0.15)' : '1px solid rgba(255,255,255,0.09)' }}>
            {giftResults.map(u => (
              <button key={u.user_id || u.id}
                onClick={() => { 
                  console.log('[AdminVIP] Selected user for gifting:', { user_id: u.user_id || u.id, username: u.username, full_name: u.full_name, avatar_url: u.avatar_url });
                  handleGiftVIP({ user_id: u.user_id || u.id, username: u.username, full_name: u.full_name, avatar_url: u.avatar_url }); 
                  setGiftSearch(''); 
                  setGiftResults([]); 
                }}
                className="w-full flex items-center gap-3 px-4 py-3 active:opacity-70 text-left"
                style={{ borderBottom: isLight ? '1px solid rgba(160,80,255,0.07)' : '1px solid rgba(255,255,255,0.04)' }}>
                <img src={u.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.full_name || u.username || 'U')}&background=ff5500&color=fff&size=40`}
                  alt="" className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                <div>
                  <p className="text-sm font-bold" style={{ color: isLight ? 'hsl(270,20%,12%)' : 'white' }}>{u.full_name || u.username}</p>
                  <p className="text-xs" style={{ color: isLight ? 'rgba(80,50,120,0.45)' : 'rgba(255,255,255,0.4)' }}>@{u.username}</p>
                </div>
                <div className="ml-auto px-2.5 py-1 rounded-full text-xs font-semibold"
                  style={{ background: 'linear-gradient(135deg, rgba(255,85,0,0.15), rgba(233,30,140,0.15))', border: '1px solid rgba(255,85,0,0.3)', color: '#ff7040' }}>
                  Gift VIP →
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Stats Bar */}
      <div className="flex-shrink-0 px-4 py-3" style={{ borderBottom: isLight ? '1px solid rgba(160,80,255,0.08)' : '1px solid rgba(255,255,255,0.04)' }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-xl" style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' }}>
              <p className="text-xs font-semibold" style={{ color: '#3b82f6' }}>{subscriptions.filter(s => s.plan_type === 'vip').length} VIP</p>
            </div>
            <div className="px-3 py-1.5 rounded-xl" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <p className="text-xs font-semibold" style={{ color: '#ef4444' }}>{subscriptions.filter(s => s.plan_type === 'creator').length} Creator</p>
            </div>
            <div className="px-3 py-1.5 rounded-xl" style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)' }}>
              <p className="text-xs font-semibold" style={{ color: '#a855f7' }}>{subscriptions.filter(s => s.plan_type === 'business').length} Business</p>
            </div>
          </div>
          <div className="text-xs font-semibold" style={{ color: isLight ? 'rgba(80,50,120,0.5)' : 'rgba(255,255,255,0.4)' }}>
            Total: {subscriptions.length}
          </div>
        </div>
        
        {/* Search & Filter */}
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: isLight ? 'rgba(80,50,120,0.4)' : 'rgba(255,255,255,0.3)' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by username..."
              className="w-full pl-10 pr-4 py-2 rounded-xl text-sm outline-none"
              style={{
                background: isLight ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.04)',
                border: isLight ? '1px solid rgba(160,80,255,0.12)' : '1px solid rgba(255,255,255,0.06)',
                color: isLight ? 'hsl(270,20%,12%)' : 'white',
              }}
            />
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setFilterPlan('all')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition ${filterPlan === 'all' ? 'ring-2 ring-orange-400' : ''}`}
              style={{
                background: filterPlan === 'all' 
                  ? 'linear-gradient(135deg, rgba(255,85,0,0.2), rgba(233,30,140,0.2))' 
                  : (isLight ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.04)'),
                color: filterPlan === 'all' ? '#ff7040' : (isLight ? 'rgba(80,50,120,0.6)' : 'rgba(255,255,255,0.5)'),
                border: isLight ? '1px solid rgba(160,80,255,0.12)' : '1px solid rgba(255,255,255,0.06)',
              }}
            >
              All
            </button>
            <button
              onClick={() => setFilterPlan('vip')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition ${filterPlan === 'vip' ? 'ring-2 ring-blue-400' : ''}`}
              style={{
                background: filterPlan === 'vip' 
                  ? 'rgba(59,130,246,0.2)' 
                  : (isLight ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.04)'),
                color: filterPlan === 'vip' ? '#3b82f6' : (isLight ? 'rgba(80,50,120,0.6)' : 'rgba(255,255,255,0.5)'),
                border: isLight ? '1px solid rgba(160,80,255,0.12)' : '1px solid rgba(255,255,255,0.06)',
              }}
            >
              VIP
            </button>
            <button
              onClick={() => setFilterPlan('creator')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition ${filterPlan === 'creator' ? 'ring-2 ring-red-400' : ''}`}
              style={{
                background: filterPlan === 'creator' 
                  ? 'rgba(239,68,68,0.2)' 
                  : (isLight ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.04)'),
                color: filterPlan === 'creator' ? '#ef4444' : (isLight ? 'rgba(80,50,120,0.6)' : 'rgba(255,255,255,0.5)'),
                border: isLight ? '1px solid rgba(160,80,255,0.12)' : '1px solid rgba(255,255,255,0.06)',
              }}
            >
              Creator
            </button>
            <button
              onClick={() => setFilterPlan('business')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition ${filterPlan === 'business' ? 'ring-2 ring-purple-400' : ''}`}
              style={{
                background: filterPlan === 'business' 
                  ? 'rgba(168,85,247,0.2)' 
                  : (isLight ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.04)'),
                color: filterPlan === 'business' ? '#a855f7' : (isLight ? 'rgba(80,50,120,0.6)' : 'rgba(255,255,255,0.5)'),
                border: isLight ? '1px solid rgba(160,80,255,0.12)' : '1px solid rgba(255,255,255,0.06)',
              }}
            >
              Business
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable List */}
      <div className="flex-1 overflow-y-auto" style={{ paddingBottom: 'max(7rem, env(safe-area-inset-bottom) + 6rem)' }}>
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(255,80,0,0.2)', borderTopColor: '#ff5500' }} />
          </div>
        ) : filteredSubscriptions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <Crown className="w-16 h-16 mb-4" style={{ color: isLight ? 'rgba(120,80,180,0.2)' : 'rgba(255,255,255,0.1)' }} />
            <p style={{ color: isLight ? 'rgba(80,50,120,0.5)' : 'rgba(255,255,255,0.4)' }}>No active VIP subscriptions</p>
          </div>
        ) : (
          filteredSubscriptions.map((sub) => {
            const planColor = PLAN_COLORS[sub.plan_type];
            const PlanIcon = planColor.icon;
            const isExpiringSoon = sub.days_remaining !== 'Lifetime' && parseInt(sub.days_remaining) <= 7;
            
            return (
              <div key={sub.id} 
                className="mx-4 mb-3 p-4 rounded-2xl"
                style={{ 
                  background: isLight ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.04)', 
                  border: isLight ? '1px solid rgba(160,80,255,0.12)' : '1px solid rgba(255,255,255,0.06)' 
                }}>
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <img 
                    src={sub.user_profile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(sub.user_profile?.username || 'U')}&background=ff5500&color=fff&size=64`}
                    alt={sub.user_profile?.username}
                    className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                  />
                  
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-sm truncate" style={{ color: isLight ? 'hsl(270,20%,12%)' : 'white' }}>
                        {sub.user_profile?.full_name || sub.user_profile?.username || 'User'}
                      </h3>
                      <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1`}
                        style={{ background: planColor.bg, border: `1px solid ${planColor.border}`, color: planColor.text }}>
                        <PlanIcon className="w-2.5 h-2.5" />
                        {sub.plan_type.toUpperCase()}
                      </div>
                    </div>
                    
                    <p className="text-xs mb-2" style={{ color: isLight ? 'rgba(80,50,120,0.5)' : 'rgba(255,255,255,0.4)' }}>
                      @{sub.user_profile?.username || 'unknown'}
                    </p>
                    
                    {/* Duration Info */}
                    <div className="flex items-center gap-3 text-xs">
                      <div className="flex items-center gap-1" style={{ color: isLight ? 'rgba(80,50,120,0.6)' : 'rgba(255,255,255,0.5)' }}>
                        <Calendar className="w-3 h-3" />
                        {sub.is_lifetime ? (
                          <span className="font-semibold" style={{ color: '#fbbf24' }}>Lifetime</span>
                        ) : (
                          <span className={isExpiringSoon ? 'text-red-400 font-semibold' : ''}>
                            {sub.days_remaining} days left
                          </span>
                        )}
                      </div>
                      {sub.granted_by_admin_email && (
                        <div className="flex items-center gap-1" style={{ color: isLight ? 'rgba(80,50,120,0.4)' : 'rgba(255,255,255,0.3)' }}>
                          <Shield className="w-3 h-3" />
                          <span className="truncate">Granted by {sub.granted_by_admin_email.split('@')[0]}</span>
                        </div>
                      )}
                    </div>
                    
                    {sub.grant_reason && (
                      <p className="text-[11px] mt-1.5 px-2 py-1 rounded-lg" 
                        style={{ 
                          background: isLight ? 'rgba(160,80,255,0.07)' : 'rgba(255,255,255,0.05)', 
                          color: isLight ? 'rgba(80,50,120,0.6)' : 'rgba(255,255,255,0.4)' 
                        }}>
                        📝 {sub.grant_reason}
                      </p>
                    )}
                  </div>
                  
                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <button 
                      onClick={() => handleGiftVIP(sub.user_profile)}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1"
                      style={{ 
                        background: 'linear-gradient(135deg, rgba(255,85,0,0.15), rgba(233,30,140,0.15))', 
                        border: '1px solid rgba(255,85,0,0.3)', 
                        color: '#ff7040' 
                      }}>
                      <Zap className="w-3 h-3" />
                      Gift
                    </button>
                    <button 
                      onClick={() => handleRemoveVIP(sub)}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1"
                      style={{ 
                        background: 'rgba(220,30,30,0.1)', 
                        border: '1px solid rgba(220,30,30,0.25)', 
                        color: '#dc2626' 
                      }}>
                      <Trash2 className="w-3 h-3" />
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <BottomNav />
      
      {/* Gift VIP Modal */}
      {selectedUser && (
        <GiftVIPModal 
          open={giftModalOpen}
          onClose={() => {
            setGiftModalOpen(false);
            setSelectedUser(null);
          }}
          userProfile={selectedUser}
          onGifted={() => refetch()}
        />
      )}
    </div>
  );
}