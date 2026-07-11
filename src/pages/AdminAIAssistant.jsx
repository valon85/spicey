import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, MicOff, Download, ChevronLeft, Shield, RefreshCw } from 'lucide-react';

const ADMIN_EMAILS = ['info@spicey.live', 'valondervishi13@gmail.com'];

const QUICK_COMMANDS = [
  { icon: '💾', label: 'Save Backup', cmd: 'Save a backup now.' },
  { icon: '📊', label: 'App Statistics', cmd: 'Show app statistics.' },
  { icon: '👥', label: 'New Users Today', cmd: 'Show new users today.' },
  { icon: '📤', label: 'Export All Users', cmd: 'Export all users.' },
  { icon: '🚨', label: 'Flagged Content', cmd: 'Show reports and flagged content.' },
  { icon: '🐛', label: 'Bug Report', cmd: 'Create a bug report.' },
  { icon: '🔧', label: 'Maintenance Report', cmd: 'Create a maintenance report.' },
  { icon: '📝', label: 'Dev Report', cmd: 'Create a developer report for Base44.' },
];

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      {[0, 1, 2].map(i => (
        <motion.div key={i}
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -4, 0] }}
          transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.15 }}
          className="w-2 h-2 rounded-full bg-orange-400" />
      ))}
    </div>
  );
}

function downloadJSON(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

function downloadCSV(data, filename) {
  if (!data || !data.length) return;
  const headers = Object.keys(data[0]);
  const rows = data.map(row => headers.map(h => {
    const v = row[h] == null ? '' : String(row[h]);
    return v.includes(',') || v.includes('"') ? `"${v.replace(/"/g, '""')}"` : v;
  }).join(','));
  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export default function AdminAIAssistant() {
  const navigate = useNavigate();
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);
  const [messages, setMessages] = useState([
    { role: 'ai', text: '🔐 **Admin AI Assistant**\n\nHello! I\'m your secure Admin AI for Spicey. I can help you:\n\n• 💾 Create full platform backups\n• 📊 View app statistics & analytics\n• 📤 Export user data\n• 🚨 Review flagged content & reports\n• 🐛 Generate bug, maintenance & developer reports\n\nWhat would you like to do?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const recognitionRef = useRef(null);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    base44.auth.me().then(u => {
      if (!u || !ADMIN_EMAILS.includes(u.email)) {
        navigate('/');
        return;
      }
      setAuthorized(true);
      setChecking(false);
    });
    setVoiceSupported(typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window));
  }, []);

  useEffect(() => {
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 80);
  }, [messages, loading]);

  const sendCommand = async (overrideText) => {
    const text = (overrideText || input).trim();
    if (!text || loading) return;
    setInput('');

    setMessages(prev => [...prev, { role: 'user', text }]);
    setLoading(true);

    try {
      const res = await base44.functions.invoke('adminAIAssistant', { command: text });
      const d = res.data || res;

      if (d.error) {
        setMessages(prev => [...prev, { role: 'ai', text: `❌ ${d.error}`, isError: true }]);
        return;
      }

      const msg = { role: 'ai', text: d.message || 'Done.' };

      // Attach download payload if backup or export
      if (d.type === 'backup' && d.data) {
        msg.downloadData = d.data;
        msg.downloadFilename = d.filename || 'spicey-backup.json';
        msg.downloadType = 'json';
      }
      if (d.type === 'export_users' && d.data) {
        msg.downloadData = d.data;
        msg.downloadFilename = `spicey-users-${new Date().toISOString().split('T')[0]}.csv`;
        msg.downloadType = 'csv';
      }
      if (d.type === 'reports' && d.data) {
        msg.downloadData = d.data;
        msg.downloadFilename = `spicey-reports-${new Date().toISOString().split('T')[0]}.json`;
        msg.downloadType = 'json';
      }

      setMessages(prev => [...prev, msg]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', text: `❌ Error: ${err.message}`, isError: true }]);
    } finally {
      setLoading(false);
    }
  };

  const startListening = () => {
    if (!voiceSupported) return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SR();
    rec.lang = 'en-US'; rec.continuous = false; rec.interimResults = false;
    rec.onresult = (e) => { setIsListening(false); sendCommand(e.results[0][0].transcript); };
    rec.onerror = () => setIsListening(false);
    rec.onend = () => setIsListening(false);
    recognitionRef.current = rec;
    rec.start();
    setIsListening(true);
  };

  if (checking) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: 'rgb(6,3,10)' }}>
        <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(255,80,0,0.2)', borderTopColor: '#ff5500' }} />
      </div>
    );
  }

  if (!authorized) return null;

  return (
    <div className="fixed inset-0 flex flex-col" style={{ background: 'rgb(6,3,10)' }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 flex-shrink-0"
        style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))', background: 'rgba(6,3,10,0.97)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,85,0,0.15)' }}>
        <button onClick={() => navigate('/admin/dashboard')}
          className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.06)' }}>
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #ff5500, #e91e8c)', boxShadow: '0 0 16px rgba(255,85,0,0.5)' }}>
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h1 className="font-extrabold text-white text-base leading-tight">Admin AI Assistant</h1>
          <p className="text-[10px]" style={{ color: 'rgba(255,85,0,0.7)' }}>🔐 Restricted Access — Admins Only</p>
        </div>
      </div>

      {/* Quick command chips */}
      <div className="flex-shrink-0 px-4 py-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        <div className="flex gap-2">
          {QUICK_COMMANDS.map((qc, i) => (
            <motion.button key={i} whileTap={{ scale: 0.93 }} onClick={() => sendCommand(qc.cmd)}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-bold text-white flex-shrink-0 disabled:opacity-40"
              style={{ background: 'rgba(255,85,0,0.1)', border: '1px solid rgba(255,85,0,0.25)' }}>
              <span>{qc.icon}</span>{qc.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3" style={{ scrollbarWidth: 'none' }}>
        {messages.map((msg, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'ai' && (
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: 'linear-gradient(135deg, #ff5500, #e91e8c)', boxShadow: '0 0 10px rgba(255,85,0,0.4)' }}>
                <Shield className="w-4 h-4 text-white" />
              </div>
            )}
            <div className="max-w-[82%] flex flex-col gap-2">
              <div className="px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap"
                style={msg.role === 'user' ? {
                  background: 'linear-gradient(135deg, #ff5500, #e91e8c)', color: 'white',
                  borderRadius: '20px 20px 4px 20px', boxShadow: '0 0 14px rgba(255,85,0,0.3)',
                } : {
                  background: msg.isError ? 'rgba(239,68,68,0.12)' : 'rgba(255,255,255,0.06)',
                  border: `1px solid ${msg.isError ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.1)'}`,
                  color: msg.isError ? '#fca5a5' : 'rgba(255,255,255,0.88)',
                  borderRadius: '20px 20px 20px 4px',
                }}>
                {msg.text}
              </div>
              {/* Download button for backup/export */}
              {msg.downloadData && (
                <motion.button whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    if (msg.downloadType === 'csv') downloadCSV(msg.downloadData, msg.downloadFilename);
                    else downloadJSON(msg.downloadData, msg.downloadFilename);
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold text-white self-start"
                  style={{ background: 'linear-gradient(135deg, #ff5500, #e91e8c)', boxShadow: '0 0 14px rgba(255,85,0,0.4)' }}>
                  <Download className="w-3.5 h-3.5" />
                  Download {msg.downloadFilename}
                </motion.button>
              )}
            </div>
          </motion.div>
        ))}

        {loading && (
          <div className="flex gap-2.5 justify-start">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #ff5500, #e91e8c)' }}>
              <RefreshCw className="w-4 h-4 text-white animate-spin" />
            </div>
            <div className="px-1 py-1 rounded-2xl" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <TypingDots />
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input bar */}
      <div className="flex-shrink-0 px-4 py-3 gap-2 flex items-end"
        style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))', borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(6,3,10,0.97)' }}>

        <div className="flex-1 flex items-center gap-2 px-4 rounded-2xl"
          style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,85,0,0.2)', minHeight: 48 }}>
          <textarea ref={inputRef} value={input}
            onChange={e => { setInput(e.target.value); e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 96) + 'px'; }}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendCommand(); } }}
            placeholder="Give an admin command…"
            rows={1} className="flex-1 bg-transparent text-sm outline-none resize-none py-3"
            style={{ fontSize: 16, maxHeight: 96, color: 'white', caretColor: '#ff5500' }} />
        </div>

        {voiceSupported && (
          <motion.button whileTap={{ scale: 0.88 }}
            onClick={isListening ? () => { recognitionRef.current?.stop(); setIsListening(false); } : startListening}
            className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{
              background: isListening ? 'rgba(239,68,68,0.25)' : 'rgba(255,85,0,0.15)',
              border: `1px solid ${isListening ? 'rgba(239,68,68,0.5)' : 'rgba(255,85,0,0.3)'}`,
              boxShadow: isListening ? '0 0 14px rgba(239,68,68,0.4)' : 'none',
            }}>
            {isListening ? <MicOff className="w-5 h-5 text-red-400" /> : <Mic className="w-5 h-5 text-orange-400" />}
          </motion.button>
        )}

        <motion.button whileTap={{ scale: 0.9 }} onClick={() => sendCommand()}
          disabled={!input.trim() || loading}
          className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 disabled:opacity-35"
          style={{ background: 'linear-gradient(135deg, #ff5500, #e91e8c)', boxShadow: '0 0 18px rgba(255,85,0,0.5)' }}>
          <Send className="w-4 h-4 text-white" style={{ marginLeft: 2 }} />
        </motion.button>
      </div>
    </div>
  );
}