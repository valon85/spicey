import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Search, MessageCircle, Mail, User, Shield, Crown, X, Send, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';

const ADMIN_EMAILS = ['info@spicey.live', 'valondervishi13@gmail.com'];

export default function AdminUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [profiles, setProfiles] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const [sentTo, setSentTo] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    base44.auth.me().then(u => {
      if (u && ADMIN_EMAILS.includes((u.email || '').toLowerCase())) {
        setIsAdmin(true);
        loadUsers();
      } else {
        navigate('/settings');
      }
    }).catch(() => navigate('/settings'));
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const [allUsers, allProfiles] = await Promise.all([
        base44.entities.User.list('-created_date', 500),
        base44.entities.UserProfile.list('-created_date', 500),
      ]);
      setUsers(allUsers);
      const profileMap = {};
      allProfiles.forEach(p => { profileMap[p.user_id] = p; });
      setProfiles(profileMap);
    } catch (e) {
      console.error('Failed to load users', e);
    }
    setLoading(false);
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedUser) return;
    setSending(true);
    try {
      await base44.integrations.Core.SendEmail({
        to: selectedUser.email,
        subject: 'Message from Spicey Admin',
        body: messageText.trim(),
        from_name: 'Spicey Team',
      });
      setSentTo(selectedUser.email);
      setMessageText('');
      setTimeout(() => { setSentTo(null); setSelectedUser(null); }, 2000);
    } catch (e) {
      console.error('Failed to send message', e);
    }
    setSending(false);
  };

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    if (!q) return true;
    const p = profiles[u.id];
    return (
      u.email?.toLowerCase().includes(q) ||
      u.full_name?.toLowerCase().includes(q) ||
      p?.username?.toLowerCase().includes(q)
    );
  });

  const getRoleColor = (role) => {
    if (role === 'admin') return '#a78bfa';
    return '#6b7280';
  };

  return (
    <div style={{ minHeight: '100%', background: '#06030a', color: 'white' }}>
      {/* Header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 10,
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '0 16px 14px',
        paddingTop: 'max(16px, env(safe-area-inset-top))',
        background: 'rgba(8,4,12,0.97)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
      }}>
        <button onClick={() => navigate('/settings')}
          style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.5)' }}>
          <ChevronLeft size={22} />
        </button>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 17, fontWeight: 700, margin: 0 }}>All Users</p>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: 0 }}>{users.length} total members</p>
        </div>
        <Shield size={18} color="#a78bfa" />
      </div>

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: 120 }}>
        {/* Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 16, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <Search size={16} color="rgba(255,255,255,0.4)" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email or username..."
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'white', fontSize: 14 }}
          />
          {search && <button onClick={() => setSearch('')}><X size={14} color="rgba(255,255,255,0.4)" /></button>}
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
            <Loader2 size={28} color="#a78bfa" className="animate-spin" />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filtered.map(u => {
              const p = profiles[u.id];
              const avatar = p?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.full_name || 'U')}&background=1a0a2e&color=fff&size=80`;
              return (
                <motion.div key={u.id} whileTap={{ scale: 0.98 }}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderRadius: 18, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer' }}
                  onClick={() => setSelectedUser(u)}>
                  <img src={avatar} alt={u.full_name}
                    style={{ width: 46, height: 46, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '2px solid rgba(167,139,250,0.3)' }}
                    onError={e => { e.target.src = `https://ui-avatars.com/api/?name=U&background=1a0a2e&color=fff&size=80`; }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: 'white', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {u.full_name || 'Unknown'}
                      </p>
                      {u.role === 'admin' && (
                        <span style={{ fontSize: 10, fontWeight: 800, color: '#a78bfa', background: 'rgba(167,139,250,0.15)', borderRadius: 6, padding: '2px 6px' }}>ADMIN</span>
                      )}
                    </div>
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {p?.username ? `@${p.username} · ` : ''}{u.email}
                    </p>
                  </div>
                  <MessageCircle size={18} color="rgba(167,139,250,0.6)" />
                </motion.div>
              );
            })}
            {filtered.length === 0 && (
              <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 14, padding: 32 }}>No users found</p>
            )}
          </div>
        )}
      </div>

      {/* Message Modal */}
      <AnimatePresence>
        {selectedUser && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => { setSelectedUser(null); setMessageText(''); }}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', zIndex: 50 }} />
            <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
              style={{ position: 'fixed', left: 16, right: 16, bottom: 24, zIndex: 51, background: 'rgba(14,8,24,0.99)', border: '1px solid rgba(167,139,250,0.3)', borderRadius: 28, padding: 24, boxShadow: '0 0 40px rgba(167,139,250,0.3)' }}>
              {/* Top accent */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, borderRadius: '28px 28px 0 0', background: 'linear-gradient(90deg,#a78bfa,#e91e8c)' }} />

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Mail size={18} color="#a78bfa" />
                  <div>
                    <p style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>{selectedUser.full_name || 'User'}</p>
                    <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', margin: 0 }}>{selectedUser.email}</p>
                  </div>
                </div>
                <button onClick={() => { setSelectedUser(null); setMessageText(''); }}
                  style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <X size={16} color="rgba(255,255,255,0.6)" />
                </button>
              </div>

              {sentTo ? (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <p style={{ color: '#4ade80', fontWeight: 700, fontSize: 16 }}>✓ Message sent to {sentTo}</p>
                </div>
              ) : (
                <>
                  <textarea
                    value={messageText}
                    onChange={e => setMessageText(e.target.value)}
                    placeholder="Write your message..."
                    rows={4}
                    style={{ width: '100%', padding: '14px', borderRadius: 16, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: 14, outline: 'none', resize: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
                  />
                  <button onClick={handleSendMessage} disabled={!messageText.trim() || sending}
                    style={{ marginTop: 12, width: '100%', padding: '14px', borderRadius: 18, background: messageText.trim() ? 'linear-gradient(135deg,#a78bfa,#e91e8c)' : 'rgba(255,255,255,0.08)', color: 'white', fontWeight: 700, fontSize: 15, border: 'none', cursor: messageText.trim() ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s' }}>
                    {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                    {sending ? 'Sending...' : 'Send Email'}
                  </button>
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}