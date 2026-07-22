import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Bell, X } from 'lucide-react';
import { usePageBackground } from '@/hooks/usePageBackground';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import BottomNav from '../components/feed/BottomNav';

export default function Notifications() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentUser, setCurrentUser] = useState(null);
  const [isLight, setIsLight] = useState(false);
  const pageBg = usePageBackground();

  useEffect(() => {
    base44.auth.me().then(setCurrentUser);
    const check = () => setIsLight(document.documentElement.classList.contains('light-mode'));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-vip-theme'] });
    return () => obs.disconnect();
  }, []);

  const { data: notifications = [], refetch } = useQuery({
    queryKey: ['notifications', currentUser?.id],
    queryFn: async () => {
      const notifs = await base44.entities.Notification.filter({ user_id: currentUser?.id }, '-created_date', 50);
      // Enrich notifications with fresh actor avatar data
      const enriched = await Promise.all(notifs.map(async (n) => {
        if (!n.actor_avatar || n.actor_avatar.includes('ui-avatars.com')) {
          try {
            const profiles = await base44.entities.UserProfile.filter({ user_id: n.actor_id }, '-created_date', 1);
            if (profiles.length > 0 && profiles[0].avatar_url) {
              return { ...n, actor_avatar: profiles[0].avatar_url };
            }
          } catch {}
        }
        return n;
      }));
      return enriched;
    },
    enabled: !!currentUser?.id,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });

  // Mark all as read when opening notifications page
  useEffect(() => {
    if (!currentUser?.id || !notifications.length) return;
    const unread = notifications.filter(n => !n.read);
    if (unread.length > 0) {
      const updatePromises = unread.map(n => base44.entities.Notification.update(n.id, { read: true }));
      Promise.all(updatePromises).then(() => {
        refetch();
        // Also refresh notification count in header
        queryClient.invalidateQueries({ queryKey: ['notification-count', currentUser.id] });
      });
    }
  }, [currentUser?.id]);

  // Real-time only — no polling interval
  useEffect(() => {
    if (!currentUser?.id) return;
    const unsubscribe = base44.entities.Notification.subscribe((event) => {
      if (event.type === 'create' && event.data?.user_id === currentUser.id) {
        queryClient.invalidateQueries({ queryKey: ['notifications', currentUser.id] });
      }
    });
    return unsubscribe;
  }, [currentUser?.id]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = async (notificationId) => {
    await base44.entities.Notification.update(notificationId, { read: true });
  };

  return (
    <div className="fixed inset-0 flex flex-col" style={{ background: pageBg }}>
      {/* Header — fixed, does not scroll */}
      <div className="flex-shrink-0 z-40 flex items-center justify-between px-4 pb-3" style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))', background: isLight ? 'rgba(248,244,255,0.96)' : 'rgba(6,3,10,0.96)', backdropFilter: 'blur(20px)', borderBottom: isLight ? '1px solid rgba(160,80,255,0.12)' : '1px solid rgba(255,255,255,0.05)' }}>
        <button onClick={() => navigate(-1)} className="w-8 h-8 flex items-center justify-center transition" style={{ color: isLight ? 'hsl(270,20%,30%)' : 'rgba(255,255,255,0.6)' }}>
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-orange-500" />
          <h1 className="font-extrabold text-base" style={{ color: isLight ? 'hsl(270,20%,12%)' : 'white' }}>Notifications</h1>
        </div>
        <button onClick={() => navigate('/')} className="w-8 h-8 flex items-center justify-center transition" aria-label="Close notifications" style={{ color: isLight ? 'hsl(270,20%,30%)' : 'rgba(255,255,255,0.72)' }}>
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Accent line */}
      <div className="flex-shrink-0 h-px w-full" style={{ background: 'linear-gradient(to right, transparent, #ff5500, #ee1166, #7700bb, transparent)' }} />

      {/* Scrollable notifications list — only this part scrolls */}
      <div className="flex-1 overflow-y-auto" style={{ paddingBottom: 'max(7rem, env(safe-area-inset-bottom) + 6rem)', borderTop: isLight ? '1px solid rgba(160,80,255,0.08)' : 'none' }}>
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
              style={{ background: isLight ? 'rgba(160,80,255,0.07)' : 'rgba(255,255,255,0.05)', border: isLight ? '1px solid rgba(160,80,255,0.12)' : '1px solid rgba(255,255,255,0.07)' }}>
              <Bell className="w-8 h-8" style={{ color: isLight ? 'rgba(120,80,180,0.3)' : 'rgba(255,255,255,0.2)' }} />
            </div>
            <p className="text-sm font-medium mb-1" style={{ color: isLight ? 'rgba(80,50,120,0.5)' : 'rgba(255,255,255,0.4)' }}>No notifications yet</p>
            <p className="text-xs" style={{ color: isLight ? 'rgba(80,50,120,0.35)' : 'rgba(255,255,255,0.25)' }}>We'll let you know when something happens</p>
          </div>
        ) : (
          notifications.map((notif) => {
            const emojis = { like: '❤️', fire: '🔥', comment: '💬', follow: '👤', follow_request: '🔒', message: '💌', share: '↗️', story: '📱', engagement: '🍿', announcement: '✨', promotion: '🎬' };
            const emoji = emojis[notif.type] || '✨';
            return (
              <button key={notif.id}
                onClick={() => {
                  markAsRead(notif.id);
                  if (notif.type === 'follow' || notif.type === 'follow_request') navigate(`/profile/${notif.actor_id}`);
                  else if (notif.type === 'engagement' && notif.post_id) navigate(`/?postId=${encodeURIComponent(notif.post_id)}`);
                  else if (['engagement', 'announcement', 'promotion'].includes(notif.type)) navigate('/');
                }}
                className="w-full px-4 py-4 text-left flex items-center gap-3 transition active:scale-[0.98]"
                style={{ borderBottom: isLight ? '1px solid rgba(160,80,255,0.07)' : '1px solid rgba(255,255,255,0.04)', background: notif.read ? 'transparent' : (isLight ? 'rgba(255,100,0,0.03)' : 'rgba(255,80,0,0.04)') }}>

                <div className="relative flex-shrink-0">
                  <img src={notif.actor_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(notif.actor_username || 'U')}&background=1a0a2e&color=fff&size=48`}
                    alt={notif.actor_username}
                    className="w-12 h-12 rounded-full object-cover" />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[11px] leading-none"
                    style={{ background: 'linear-gradient(135deg,#1a0a2e,#0d0618)', border: '1.5px solid rgba(255,255,255,0.1)', boxShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
                    {emoji}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-tight" style={{ color: isLight ? 'hsl(270,20%,15%)' : 'white' }}>
                    <span className="font-bold">{notif.actor_username}</span> {notif.message}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: isLight ? 'rgba(80,50,120,0.45)' : 'rgba(255,255,255,0.4)' }}>
                    {new Date(notif.created_date).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}
                  </p>
                </div>

                {!notif.read && (
                  <div className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #ff5500, #e91e8c)' }} />
                )}
              </button>
            );
          })
        )}
      </div>

      <BottomNav />
    </div>
  );
}
