import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import {
  ChevronLeft, Search, Download, RefreshCw, Mail, Send,
  Shield, Users, Crown, AlertTriangle, X, Check, Eye, EyeOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ADMIN_EMAILS = ['info@spicey.live', 'valondervishi13@gmail.com', 'vlora.dervisi@gmail.com'];

const VIP_COLORS = {
  vip: { bg: 'rgba(245,158,11,0.2)', text: '#f59e0b', label: 'VIP' },
  creator: { bg: 'rgba(233,30,140,0.2)', text: '#e91e8c', label: 'Creator' },
  business: { bg: 'rgba(119,0,204,0.2)', text: '#a855f7', label: 'Business' },
};

function escapeCSV(val) {
  if (val == null) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function downloadCSV(users) {
  const headers = ['First Name', 'Last Name', 'Email', 'Username', 'Registration Date', 'Location', 'VIP Status', 'Role', 'Followers', 'Posts'];
  const rows = users.map(u => [
    u.first_name, u.last_name, u.email, u.username,
    u.registration_date ? new Date(u.registration_date).toLocaleDateString() : '',
    u.location || '',
    u.vip_status || 'none',
    u.role || 'user',
    u.followers_count || 0,
    u.posts_count || 0,
  ].map(escapeCSV));

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `spicey-users-backup-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function downloadJSON(users) {
  const blob = new Blob([JSON.stringify(users, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `spicey-users-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AdminBackup() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const [broadcastTarget, setBroadcastTarget] = useState(null); // null = all users
  const [broadcastSubject, setBroadcastSubject] = useState('');
  const [broadcastBody, setBroadcastBody] = useState('');
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState(null);
  const [hideEmails, setHideEmails] = useState(true);
  const [backupTs, setBackupTs] = useState(null);

  useEffect(() => {
    base44.auth.me().then(u => {
      if (!u || !ADMIN_EMAILS.includes((u.email || '').toLowerCase())) {
        navigate('/');
      }
    });
    loadUsers();
  }, []);

  const loadUsers = async (q = '', isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await base44.functions.invoke('getAdminUsers', { search: q });
      const d = res.data || res;
      setUsers(d.users || []);
      setTotal(d.total || 0);
      setBackupTs(new Date());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => loadUsers(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const handleSendBroadcast = async () => {
    if (!broadcastSubject.trim() || !broadcastBody.trim()) return;
    setSending(true);
    setSendResult(null);
    try {
      const payload = {
        subject: broadcastSubject,
        body: broadcastBody,
        send_to_all: !broadcastTarget,
        target_user_ids: broadcastTarget ? [broadcastTarget.id] : undefined,
      };
      const res = await base44.functions.invoke('sendAdminBroadcast', payload);
      const d = res.data || res;
      setSendResult({ success: true, sent: d.sent, failed: d.failed });
    } catch (e) {
      setSendResult({ success: false, error: e.message });
    } finally {
      setSending(false);
    }
  };

  const maskedEmail = (email) => {
    if (!hideEmails) return email;
    const [local, domain] = email.split('@');
    return `${local[0]}${'*'.repeat(Math.min(local.length - 1, 5))}@${domain}`;
  };

  const vipUsers = users.filter(u => u.vip_status);
  const adminUsers = users.filter(u => u.role === 'admin');

  return (
    <div className="min-h-screen pb-28" style={{ background: 'rgb(6,3,10)' }}>
      {/* Header */}
      <div className="sticky top-0 z-40 flex items-center gap-3 px-4 py-4"
        style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))', background: 'rgba(6,3,10,0.97)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
        <div className="flex-1">
          <h1 className="font-extrabold text-white text-base">Backup & Export</h1>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
            {backupTs ? `Last refreshed ${backupTs.toLocaleTimeString()}` : 'Loading…'}
          </p>
        </div>
        <button onClick={() => setHideEmails(h => !h)}
          className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.06)' }}>
          {hideEmails ? <EyeOff className="w-4 h-4 text-white/50" /> : <Eye className="w-4 h-4 text-orange-400" />}
        </button>
        <button onClick={() => loadUsers(search, true)} disabled={refreshing}
          className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <RefreshCw className={`w-4 h-4 text-white/60 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="px-4 py-4 space-y-4 max-w-2xl mx-auto">

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total Users', value: total, color: '#ff5500', icon: Users },
            { label: 'VIP Users', value: vipUsers.length, color: '#f59e0b', icon: Crown },
            { label: 'Admins', value: adminUsers.length, color: '#7700cc', icon: Shield },
          ].map(({ label, value, color, icon: Icon }) => (
            <div key={label} className="rounded-2xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2" style={{ background: `${color}22` }}>
                <Icon className="w-4 h-4" style={{ color }} />
              </div>
              <p className="text-lg font-extrabold text-white">{value}</p>
              <p className="text-[10px] text-white/40 uppercase tracking-wider">{label}</p>
            </div>
          ))}
        </div>

        {/* Export / Backup buttons */}
        <div className="rounded-2xl p-4 space-y-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <p className="text-xs font-bold text-white/50 uppercase tracking-wider mb-1">Export & Backup</p>
          <div className="flex gap-2">
            <button
              onClick={() => downloadCSV(users)}
              disabled={!users.length}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold text-white active:scale-95 transition-transform disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg, rgba(255,85,0,0.2), rgba(233,30,140,0.2))', border: '1px solid rgba(255,85,0,0.3)' }}>
              <Download className="w-4 h-4" />
              CSV Export
            </button>
            <button
              onClick={() => downloadJSON(users)}
              disabled={!users.length}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold text-white active:scale-95 transition-transform disabled:opacity-40"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <Download className="w-4 h-4" />
              JSON Backup
            </button>
          </div>
          <button
            onClick={() => { setBroadcastTarget(null); setBroadcastSubject(''); setBroadcastBody(''); setSendResult(null); setBroadcastOpen(true); }}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold text-white active:scale-95 transition-transform"
            style={{ background: 'linear-gradient(135deg, rgba(119,0,204,0.2), rgba(0,170,255,0.2))', border: '1px solid rgba(119,0,204,0.3)' }}>
            <Mail className="w-4 h-4" />
            Broadcast to All {total} Users
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(255,255,255,0.3)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, username, or email…"
            className="w-full pl-11 pr-4 py-3 rounded-2xl text-sm text-white outline-none"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', caretColor: '#ff5500' }}
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4 text-white/30" />
            </button>
          )}
        </div>

        {/* Results count */}
        <p className="text-xs text-white/35">{loading ? 'Loading…' : `Showing ${users.length} of ${total} users`}</p>

        {/* User list */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(255,80,0,0.2)', borderTopColor: '#ff5500' }} />
          </div>
        ) : (
          <div className="space-y-2">
            {users.map(u => (
              <div key={u.id}
                onClick={() => setSelectedUser(u)}
                className="rounded-2xl px-4 py-3 flex items-center gap-3 cursor-pointer active:scale-98 transition-transform"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <img
                  src={u.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.full_name || u.username || 'U')}&background=ff5500&color=fff&size=40`}
                  alt=""
                  className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-sm font-bold text-white truncate">{u.full_name || u.username}</span>
                    {u.vip_status && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold flex-shrink-0"
                        style={{ background: VIP_COLORS[u.vip_status]?.bg, color: VIP_COLORS[u.vip_status]?.text }}>
                        {VIP_COLORS[u.vip_status]?.label}
                      </span>
                    )}
                    {u.role === 'admin' && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold flex-shrink-0"
                        style={{ background: 'rgba(255,85,0,0.2)', color: '#ff5500' }}>ADMIN</span>
                    )}
                  </div>
                  <p className="text-xs text-white/40 truncate">@{u.username} · {maskedEmail(u.email)}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-[10px] text-white/30">{u.registration_date ? new Date(u.registration_date).toLocaleDateString() : '—'}</p>
                  <p className="text-[10px] text-white/20">{u.location || ''}</p>
                </div>
              </div>
            ))}
            {users.length === 0 && !loading && (
              <div className="text-center py-12 text-white/30 text-sm">No users found</div>
            )}
          </div>
        )}
      </div>

      {/* ── User Detail Sheet ── */}
      <AnimatePresence>
        {selectedUser && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedUser(null)}
              className="fixed inset-0 z-50" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }} />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl"
              style={{ background: 'rgba(12,6,20,0.99)', border: '1px solid rgba(255,255,255,0.08)', maxHeight: '85dvh', overflowY: 'auto' }}>

              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.15)' }} />
              </div>

              <div className="px-5 pb-8 space-y-4">
                {/* User header */}
                <div className="flex items-center gap-4 py-3">
                  <img
                    src={selectedUser.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedUser.full_name || 'U')}&background=ff5500&color=fff&size=80`}
                    className="w-16 h-16 rounded-full object-cover"
                    alt=""
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-extrabold text-white">{selectedUser.full_name || selectedUser.username}</h3>
                    <p className="text-sm text-white/50">@{selectedUser.username}</p>
                    {selectedUser.vip_status && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-bold mt-1 inline-block"
                        style={{ background: VIP_COLORS[selectedUser.vip_status]?.bg, color: VIP_COLORS[selectedUser.vip_status]?.text }}>
                        {VIP_COLORS[selectedUser.vip_status]?.label}
                      </span>
                    )}
                  </div>
                  <button onClick={() => setSelectedUser(null)} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.08)' }}>
                    <X className="w-4 h-4 text-white/50" />
                  </button>
                </div>

                {/* Details grid */}
                <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                  {[
                    { label: 'First Name', value: selectedUser.first_name },
                    { label: 'Last Name', value: selectedUser.last_name },
                    { label: 'Email', value: maskedEmail(selectedUser.email) },
                    { label: 'Username', value: `@${selectedUser.username}` },
                    { label: 'Registered', value: selectedUser.registration_date ? new Date(selectedUser.registration_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—' },
                    { label: 'Location', value: selectedUser.location || '—' },
                    { label: 'VIP Status', value: selectedUser.vip_status ? VIP_COLORS[selectedUser.vip_status]?.label : 'None' },
                    { label: 'Account Role', value: selectedUser.role || 'user' },
                    { label: 'Followers', value: (selectedUser.followers_count || 0).toLocaleString() },
                    { label: 'Posts', value: (selectedUser.posts_count || 0).toLocaleString() },
                    { label: 'Terms Accepted', value: selectedUser.consent_accepted_at ? `✅ ${new Date(selectedUser.consent_accepted_at).toLocaleString()}` : '❓ Not recorded' },
                    { label: 'Terms Version', value: selectedUser.consent_terms_version || '—' },
                    { label: 'Consent IP', value: selectedUser.consent_ip || '—' },
                    { label: 'Consent Platform', value: selectedUser.consent_platform || '—' },
                  ].map(({ label, value }, i, arr) => (
                    <div key={label} className="flex items-center justify-between px-4 py-3"
                      style={{ background: i % 2 === 0 ? 'rgba(255,255,255,0.03)' : 'transparent', borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                      <span className="text-xs text-white/40 font-medium">{label}</span>
                      <span className="text-sm text-white font-semibold">{value || '—'}</span>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => { setBroadcastTarget(selectedUser); setBroadcastSubject(''); setBroadcastBody(''); setSendResult(null); setBroadcastOpen(true); setSelectedUser(null); }}
                    className="flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold text-white active:scale-95 transition-transform"
                    style={{ background: 'linear-gradient(135deg, rgba(119,0,204,0.25), rgba(0,170,255,0.2))', border: '1px solid rgba(119,0,204,0.3)' }}>
                    <Mail className="w-4 h-4" />
                    Email User
                  </button>
                  <button
                    onClick={() => downloadCSV([selectedUser])}
                    className="flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold text-white active:scale-95 transition-transform"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <Download className="w-4 h-4" />
                    Export Record
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Broadcast Modal ── */}
      <AnimatePresence>
        {broadcastOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => !sending && setBroadcastOpen(false)}
              className="fixed inset-0 z-50" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }} />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl"
              style={{ background: 'rgba(12,6,20,0.99)', border: '1px solid rgba(255,255,255,0.08)', maxHeight: '90dvh', overflowY: 'auto' }}>

              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.15)' }} />
              </div>

              <div className="px-5 pb-8 space-y-4">
                <div className="flex items-center justify-between py-2">
                  <div>
                    <h3 className="font-extrabold text-white text-base">
                      {broadcastTarget ? `Email ${broadcastTarget.full_name || broadcastTarget.username}` : `Broadcast to All ${total} Users`}
                    </h3>
                    <p className="text-xs text-white/35 mt-0.5">
                      {broadcastTarget ? maskedEmail(broadcastTarget.email) : 'All registered users will receive this email'}
                    </p>
                  </div>
                  <button onClick={() => setBroadcastOpen(false)} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.08)' }}>
                    <X className="w-4 h-4 text-white/50" />
                  </button>
                </div>

                {/* Warning for broadcast */}
                {!broadcastTarget && (
                  <div className="flex items-start gap-3 rounded-2xl p-3" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)' }}>
                    <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-yellow-300">This will send an email to ALL {total} registered users. Use only for important announcements.</p>
                  </div>
                )}

                {sendResult ? (
                  <div className="rounded-2xl p-6 text-center space-y-3" style={{ background: sendResult.success ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${sendResult.success ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}` }}>
                    {sendResult.success ? (
                      <>
                        <Check className="w-10 h-10 text-green-400 mx-auto" />
                        <p className="font-bold text-green-300">Successfully sent to {sendResult.sent} users</p>
                        {sendResult.failed > 0 && <p className="text-xs text-yellow-400">{sendResult.failed} failed</p>}
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-10 h-10 text-red-400 mx-auto" />
                        <p className="text-red-300 text-sm">{sendResult.error}</p>
                      </>
                    )}
                    <button onClick={() => setBroadcastOpen(false)} className="mt-2 px-6 py-2.5 rounded-full text-sm font-bold text-white"
                      style={{ background: 'rgba(255,255,255,0.1)' }}>Close</button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-white/50 font-semibold uppercase tracking-wider block mb-1.5">Subject</label>
                      <input
                        value={broadcastSubject}
                        onChange={e => setBroadcastSubject(e.target.value)}
                        placeholder="e.g. Important Update from Spicey Team"
                        className="w-full px-4 py-3 rounded-2xl text-sm text-white outline-none"
                        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', caretColor: '#ff5500' }}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-white/50 font-semibold uppercase tracking-wider block mb-1.5">
                        Message <span className="normal-case text-white/30">(use {'{name}'} for personalization)</span>
                      </label>
                      <textarea
                        value={broadcastBody}
                        onChange={e => setBroadcastBody(e.target.value)}
                        placeholder={`Hi {name},\n\nWe wanted to reach out with an important update…\n\nBest,\nThe Spicey Team`}
                        rows={8}
                        className="w-full px-4 py-3 rounded-2xl text-sm text-white outline-none resize-none"
                        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', caretColor: '#ff5500' }}
                      />
                    </div>
                    <button
                      onClick={handleSendBroadcast}
                      disabled={sending || !broadcastSubject.trim() || !broadcastBody.trim()}
                      className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold text-white active:scale-95 transition-all disabled:opacity-40"
                      style={{ background: sending ? 'rgba(255,85,0,0.3)' : 'linear-gradient(135deg, #ff5500, #e91e8c)', boxShadow: sending ? 'none' : '0 4px 20px rgba(255,85,0,0.3)' }}>
                      {sending
                        ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending…</>
                        : <><Send className="w-4 h-4" /> Send Email</>
                      }
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}