import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, Send, Phone, Video, Mic, Image as ImageIcon, Smile, Check, CheckCheck, Heart, MoreVertical, Camera, Film, MapPin, Gift, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import CallSheet from '../panels/CallSheet.jsx';

function useIsLightMode() {
  const [isLight, setIsLight] = React.useState(() => document.documentElement.classList.contains('light-mode'));
  React.useEffect(() => {
    const check = () => setIsLight(document.documentElement.classList.contains('light-mode'));
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);
  return isLight;
}

// Shared AudioContext — created on first user interaction to bypass autoplay policy
let sharedAudioCtx = null;
function getAudioCtx() {
  if (!sharedAudioCtx || sharedAudioCtx.state === 'closed') {
    sharedAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return sharedAudioCtx;
}

// Play notification sound with vibration
async function playMessageSound(isCall = false) {
  try {
    const ctx = getAudioCtx();
    if (ctx.state === 'suspended') await ctx.resume();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    if (isCall) {
      // Urgent call tone
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.setValueAtTime(800, now + 0.1);
      osc.frequency.setValueAtTime(920, now + 0.2);
      gain.gain.setValueAtTime(0.7, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc.start(now);
      osc.stop(now + 0.6);
    } else {
      // Message notification
      osc.frequency.value = 880;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc.start(now);
      osc.stop(now + 0.5);
    }
    
    // Add vibration
    if (navigator.vibrate) {
      navigator.vibrate(isCall ? [400, 200, 400, 200, 600] : [200, 100, 200]);
    }
  } catch (e) {}
}

// Show a browser notification if permission granted
function showBrowserNotification(senderName, text) {
  if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
    new Notification(senderName, { body: text, icon: '/favicon.ico' });
  }
}

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(dateStr).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

const INITIAL_MESSAGES = [];

const QUICK_REACTIONS = ['❤️', '🔥', '👍'];

const EMOJI_CATEGORIES = [
  {
    name: 'Reactions',
    emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '🔥', '✨', '⭐', '🌟', '💫', '🎉', '🎊', '🎈', '👑', '💎', '🏆', '🔮', '💯'],
  },
  {
    name: 'Faces',
    emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙', '🥲', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '🥸', '😎', '🤓', '🧐', '😕', '😟', '🙁', '☹️', '😮', '😯', '😲', '😳', '🥺', '😦', '😧', '😨', '😰', '😥', '😢', '😭', '😱', '😖', '😣', '😞', '😓', '😩', '😫', '🥱', '😤', '😡', '😠', '🤬', '😈', '👿', '💀', '☠️', '💩', '🤡', '👹', '👺', '👻', '👽', '👾', '🤖'],
  },
  {
    name: 'Gestures',
    emojis: ['👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💅', '🤳', '💪', '🦾', '🦿', '🦵', '🦶', '👂', '🦻', '👃', '🧠', '🫀', '🫁', '🦷', '🦴', '👀', '👁️', '👅', '👄', '💋', '🩸'],
  },
  {
    name: 'Love',
    emojis: ['💌', '💘', '💝', '💖', '💗', '💓', '💞', '💕', '💟', '❣️', '💔', '❤️', '🧡', '💛', '💚', '💙', '💜', '🤎', '🖤', '🤍', '💏', '👩‍❤️‍👨', '👨‍❤️‍👨', '👩‍❤️‍👩', '💑', '👩‍❤️‍💋‍👨', '👨‍❤️‍💋‍👨', '👩‍❤️‍💋‍👩', '🌹', '🥀', '🌺', '🌸', '🌼', '🌻', '🌷', '💐', '🍫', '🧸', '💍', '💎'],
  },
  {
    name: 'Party',
    emojis: ['🎉', '🎊', '🎈', '🎁', '🎀', '🎂', '🎄', '🎃', '🎆', '🎇', '🧨', '✨', '🎋', '🎍', '🎎', '🎏', '🎐', '🎑', '🧧', '🎗️', '🎟️', '🎫', '🎖️', '🏆', '🏅', '🥇', '🥈', '🥉', '⚽', '⚾', '🥎', '🏀', '🏐', '🏈', '🏉', '🎾', '🥏', '🎳', '🏏', '🏑', '🏒', '🥍', '🏓', '🏸', '🥊', '🥋', '🥅', '⛳', '⛸️', '🎣', '🤿', '🎽', '🎿', '🛷', '🥌', '🎯', '🪀', '🪁', '🎱', '🔮', '🪄', '🧿', '🎮', '🕹️', '🎰', '🎲', '🧩', '🧸', '🪅', '🪆', '♠️', '♥️', '♦️', '♣️', '♟️', '🃏', '🀄', '🎴'],
  },
  {
    name: 'Food',
    emojis: ['🍏', '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶️', '🫑', '🌽', '🥕', '🫒', '🧄', '🧅', '🥔', '🍠', '🥐', '🥯', '🍞', '🥖', '🥨', '🧀', '🥚', '🍳', '🧈', '🥞', '🧇', '🥓', '🥩', '🍗', '🍖', '🦴', '🌭', '🍔', '🍟', '🍕', '🫓', '🥪', '🥙', '🧆', '🌮', '🌯', '🫔', '🥗', '🥘', '🫕', '🥫', '🍝', '🍜', '🍲', '🍛', '🍣', '🍱', '🥟', '🦪', '🍤', '🍙', '🍚', '🍘', '🍥', '🥠', '🥮', '🍢', '🍡', '🍧', '🍨', '🍦', '🥧', '🧁', '🍰', '🎂', '🍮', '🍭', '🍬', '🍫', '🍿', '🍩', '🍪', '🌰', '🥜', '🍯', '🥛', '🍼', '🫖', '☕', '🍵', '🧃', '🥤', '🧋', '🍶', '🍺', '🍻', '🥂', '🍷', '🥃', '🍸', '🍹', '🧉', '🍾', '🧊'],
  },
  {
    name: 'Travel',
    emojis: ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐', '🛻', '🚚', '🚛', '🚜', '🦯', '🦽', '🦼', '🛴', '🚲', '🛵', '🏍️', '🛺', '🚨', '🚔', '🚍', '🚘', '🚖', '🚡', '🚠', '🚟', '🚃', '🚋', '🚞', '🚝', '🚄', '🚅', '🚈', '🚂', '🚆', '🚇', '🚊', '🚉', '✈️', '🛫', '🛬', '🛩️', '💺', '🛰️', '🚀', '🛸', '🚁', '🛶', '⛵', '🚤', '🛥️', '🛳️', '⛴️', '🚢', '⚓', '🪝', '⛽', '🚧', '🚦', '🚥', '🚏', '🗺️', '🗿', '🗽', '🗼', '🏰', '🏯', '🏟️', '🎡', '🎢', '🎠', '⛲', '⛱️', '🏖️', '🏝️', '🏜️', '🌋', '⛰️', '🏔️', '🗻', '🏕️', '⛺', '🛖', '🏠', '🏡', '🏘️', '🏚️', '🏗️', '🏭', '🏢', '🏬', '🏣', '🏤', '🏥', '🏦', '🏨', '🏪', '🏫', '🏩', '💒', '🏛️', '⛪', '🕌', '🕍', '🛕', '🕋', '⛩️', '🛤️', '🛣️', '🗾', '🎑', '🏞️', '🌅', '🌄', '🌠', '🎆', '🎇', '🌇', '🌆', '🏙️', '🌃', '🌌', '🌉', '🌁'],
  },
  {
    name: 'Objects',
    emojis: ['⌚', '📱', '💻', '⌨️', '🖥️', '🖨️', '🖱️', '🖲️', '🕹️', '🗜️', '💽', '💾', '💿', '📀', '📼', '📷', '📸', '📹', '🎥', '📽️', '🎞️', '📞', '☎️', '📟', '📠', '📺', '📻', '🎙️', '🎚️', '🎛️', '🧭', '⏱️', '⏲️', '⏰', '🕰️', '⌛', '⏳', '📡', '🔋', '🔌', '💡', '🔦', '🕯️', '🪔', '🧯', '🛢️', '💸', '💵', '💴', '💶', '💷', '🪙', '💰', '💳', '💎', '⚖️', '🪜', '🧰', '🪛', '🔧', '🔨', '⚒️', '🛠️', '⛏️', '🪚', '🔩', '⚙️', '🪤', '🧱', '⛓️', '🧲', '🔫', '💣', '🧨', '🪓', '🔪', '🗡️', '⚔️', '🛡️', '🚬', '⚰️', '🪦', '⚱️', '🏺', '🔮', '📿', '🧿', '💈', '⚗️', '🔭', '🔬', '🕳️', '🩹', '🩺', '💊', '💉', '🩸', '🧬', '🦠', '🧫', '🧪', '🌡️', '🧹', '🪠', '🧺', '🧻', '🚽', '🚰', '🚿', '🛁', '🛀', '🧼', '🪒', '🪥', '🧽', '🧴', '🛎️', '🔑', '🗝️', '🚪', '🪑', '🛋️', '🛏️', '🛌', '🧸', '🪆', '🖼️', '🪞', '🪟', '🛍️', '🛒', '🎁', '🎈', '🎏', '🎀', '🪄', '🪅', '🎊', '🎉', '🎎', '🏮', '🎐', '🧧', '💌', '📩', '📨', '📧', '💼', '📁', '📂', '🗂️', '📅', '📆', '🗒️', '🗓️', '📇', '📈', '📉', '📊', '📋', '📌', '📍', '📎', '🖇️', '📏', '📐', '✂️', '🗃️', '🗄️', '🗑️', '🔒', '🔓', '🔏', '🔐', '🔑', '🔨'],
  },
  {
    name: 'Symbols',
    emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉️', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐', '⛎', '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓', '🆔', '⚛️', '🉑', '☢️', '☣️', '📴', '📳', '🈶', '🈚', '🈸', '🈺', '🈷️', '✴️', '🆚', '💮', '🉐', '㊙️', '㊗️', '🈴', '🈵', '🈹', '🈲', '🅰️', '🅱️', '🆎', '🆑', '🅾️', '🆘', '❌', '⭕', '🛑', '⛔', '📛', '🚫', '💯', '💢', '♨️', '🚷', '🚯', '🚳', '🚱', '🔞', '📵', '🚭', '❗', '❕', '❓', '❔', '‼️', '⁉️', '🔅', '🔆', '〽️', '⚠️', '🚸', '🔱', '⚜️', '🔰', '♻️', '✅', '🈯', '💹', '❇️', '✳️', '❎', '🌐', '💠', 'Ⓜ️', '🌀', '💤', '🏧', '🚾', '♿', '🅿️', '🛗', '🈳', '🈂️', '🛂', '🛃', '🛄', '🛅', '🚹', '🚺', '🚼', '🚻', '🚮', '🎦', '📶', '🈁', '🔣', 'ℹ️', '🔤', '🔡', '🔠', '🆖', '🆗', '🆙', '🆒', '🆕', '🆓', '0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟', '🔢', '#️⃣', '*️⃣', '⏏️', '▶️', '⏸️', '⏯️', '⏹️', '⏺️', '⏭️', '⏮️', '⏩', '⏪', '⏫', '⏬', '◀️', '🔼', '🔽', '➡️', '⬅️', '🔼', '⬇️', '↗️', '↘️', '↙️', '↖️', '🔃', '🔄', '🔙', '🔚', '🔛', '🔜', '🔝', '🛐', '⚛️', '🕉️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛑', '⛔', '📛', '🚫', '💯', '💢', '♨️', '🚷', '🚯', '🚳', '🚱', '🔞', '📵', '🚭', '❗', '❕', '❓', '❔', '‼️', '⁉️', '🔅', '🔆', '〽️', '⚠️', '🚸', '🔱', '⚜️', '🔰', '♻️', '✅', '🈯', '💹', '❇️', '✳️', '❎', '🌐', '💠', 'Ⓜ️', '🌀', '💤', '🏧', '🚾', '♿', '🅿️', '🛗', '🈳', '🈂️', '🛂', '🛃', '🛄', '🛅', '🚹', '🚺', '🚼', '🚻', '🚮', '🎦', '📶', '🈁', '🔣', 'ℹ️', '🔤', '🔡', '🔠', '🆖', '🆗', '🆙', '🆒', '🆕', '🆓', '0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟', '🔢', '#️⃣', '*️⃣', '⏏️', '▶️', '⏸️', '⏯️', '⏹️', '⏺️', '⏭️', '⏮️', '⏩', '⏪', '⏫', '⏬', '◀️', '🔼', '🔽', '➡️', '⬅️', '🔼', '⬇️', '↗️', '↘️', '↙️', '↖️', '🔃', '🔄', '🔙', '🔚', '🔛', '🔜', '🔝', '🔀', '🔁', '🔂', '📲', '📳', '📴', '📶', '📷', '📸', '📹', '📺', '📻', '🎙️', '🎚️', '🎛️', '🧭', '⏱️', '⏲️', '⏰', '🕰️', '⌛', '⏳', '📡', '🔋', '🔌', '💡', '🔦', '🕯️', '🪔', '🧯', '🛢️', '💸', '💵', '💴', '💶', '💷', '🪙', '💰', '💳', '💎', '⚖️', '🪜', '🧰', '🪛', '🔧', '🔨', '⚒️', '🛠️', '⛏️', '🪚', '🔩', '⚙️', '🪤', '🧱', '⛓️', '🧲', '🔫', '💣', '🧨', '🪓', '🔪', '🗡️', '⚔️', '🛡️', '🚬', '⚰️', '🪦', '⚱️', '🏺', '🔮', '📿', '🧿', '💈', '⚗️', '🔭', '🔬', '🕳️', '🩹', '🩺', '💊', '💉', '🩸', '🧬', '🦠', '🧫', '🧪', '🌡️', '🧹', '🪠', '🧺', '🧻', '🚽', '🚰', '🚿', '🛁', '🛀', '🧼', '🪒', '🪥', '🧽', '🧴', '🛎️', '🔑', '🗝️', '🚪', '🪑', '🛋️', '🛏️', '🛌', '🧸', '🪆', '🖼️', '🪞', '🪟', '🛍️', '🛒', '🎁', '🎈', '🎏', '🎀', '🪄', '🪅', '🎊', '🎉', '🎎', '🏮', '🎐', '🧧', '💌', '📩', '📨', '📧', '💼', '📁', '📂', '🗂️', '📅', '📆', '🗒️', '🗓️', '📇', '📈', '📉', '📊', '📋', '📌', '📍', '📎', '🖇️', '📏', '📐', '✂️', '🗃️', '🗄️', '🗑️', '🔒', '🔓', '🔏', '🔐', '🔑'],
  },
];

function MsgBubble({ msg, convoImg, onDelete, onReact, isLight }) {
  const isMe = msg.from === 'me';
  const holdTimerRef = React.useRef(null);
  const [showMenu, setShowMenu] = React.useState(false);

  const handlePressStart = () => {
    if (msg.isTemp) return;
    holdTimerRef.current = setTimeout(() => {
      setShowMenu(true);
    }, 700);
  };

  const handlePressEnd = () => {
    clearTimeout(holdTimerRef.current);
  };

  const handleReact = (emoji) => {
    setShowMenu(false);
    onReact(msg.id, emoji);
  };

  const handleDelete = () => {
    setShowMenu(false);
    if (isMe) onDelete(msg.id);
  };

  return (
    <div className={`spicey-chat-row ${isMe ? 'spicey-chat-row-me' : 'spicey-chat-row-them'} relative`}>
      {!isMe && (
        <img src={convoImg} alt=""
          className="spicey-message-avatar"
          loading="lazy" decoding="async" />
      )}

      <div className={`spicey-chat-stack ${isMe ? 'items-end' : 'items-start'}`}>
        <div className={`flex items-center gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
          <div
            onMouseDown={handlePressStart}
            onMouseUp={handlePressEnd}
            onMouseLeave={handlePressEnd}
            onTouchStart={handlePressStart}
            onTouchEnd={handlePressEnd}
            style={{ userSelect: 'none', WebkitUserSelect: 'none', position: 'relative' }}>
            {msg.video ? (
              <div className={`spicey-media-bubble ${isMe ? 'spicey-media-me' : 'spicey-media-them'}`}>
                <video src={msg.video} controls className="w-full object-cover"
                  style={{ maxWidth: '70vw', maxHeight: 300 }} />
                <span className="spicey-media-time">{msg.time}</span>
              </div>
            ) : msg.image ? (
              <div className={`spicey-media-bubble ${isMe ? 'spicey-media-me' : 'spicey-media-them'}`}>
                <img src={msg.image} alt="shared" className="w-full object-cover"
                  style={{ maxWidth: '70vw', maxHeight: 300 }} />
                <span className="spicey-media-time">{msg.time}</span>
                {isMe && <CheckCheck className="spicey-media-checks" />}
              </div>
            ) : msg.audio ? (
              <div className={`spicey-audio-bubble ${isMe ? 'spicey-bubble-me' : 'spicey-bubble-them'}`}>
                <button className="spicey-audio-play"><Play className="w-4 h-4" fill="currentColor" /></button>
                <div className="spicey-waveform" />
                <span className="spicey-audio-time">0:18</span>
              </div>
            ) : (
              <div className={`spicey-message-bubble ${isMe ? 'spicey-bubble-me' : 'spicey-bubble-them'}`}>
                <p>{msg.text}</p>
                <div className="spicey-inline-meta">
                  <span>{msg.time}</span>
                  {isMe && (
                    msg.read
                      ? <CheckCheck className="w-4 h-4" />
                      : <Check className="w-4 h-4" />
                  )}
                </div>
              </div>
            )}
            {msg.reaction && (
              <span className="absolute -bottom-3 right-0 text-base leading-none">{msg.reaction}</span>
            )}
          </div>
        </div>

        {/* Reaction/delete popup menu */}
        <AnimatePresence>
          {showMenu && (
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 6 }}
              transition={{ duration: 0.15 }}
              className={`flex items-center gap-1 px-2 py-1.5 rounded-2xl z-50 ${isMe ? 'self-end' : 'self-start'}`}
              style={{ background: 'rgba(30,15,45,0.95)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(16px)', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
              {QUICK_REACTIONS.map(emoji => (
                <button key={emoji} onClick={() => handleReact(emoji)}
                  className="text-xl w-9 h-9 flex items-center justify-center rounded-xl active:scale-90 transition-transform hover:bg-white/10">
                  {emoji}
                </button>
              ))}
              {isMe && (
                <>
                  <div className="w-px h-5 bg-white/15 mx-1" />
                  <button onClick={handleDelete}
                    className="text-xs font-bold text-red-400 px-2 py-1 rounded-xl hover:bg-red-500/15 active:scale-90 transition-transform">
                    Delete
                  </button>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {!msg.image && !msg.video && (
        <div className="hidden items-center gap-1 px-1">
          <span className="text-[10px] font-medium"
            style={{ color: isLight ? 'rgba(80,50,120,0.45)' : 'rgba(255,255,255,0.22)' }}>{msg.time}</span>
          {isMe && (
            msg.read
              ? <CheckCheck className="w-3 h-3 text-orange-400" />
              : <Check className="w-3 h-3 text-white/25" />
          )}
        </div>
        )}
      </div>
    </div>
  );
}

export default function ChatView({ convo, onBack }) {
  const { setActiveCall } = useAuth();
  const isLight = useIsLightMode();
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [mediaPreview, setMediaPreview] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [sending, setSending] = useState(false);
  const [chatId, setChatId] = useState(convo.chatId || null);
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const [showEmojiPanel, setShowEmojiPanel] = useState(false);
  const [emojiCategory, setEmojiCategory] = useState(0);
  const chatIdRef = useRef(convo.chatId || null);
  const currentUserRef = useRef(null);
  const bottomRef = useRef(null);
  const fileInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const deletedIdsRef = useRef(new Set());
  const inputRef = useRef(null);

  const mapMessages = (msgs, userId, prevMsgs = []) => {
    const prevReactions = Object.fromEntries(prevMsgs.map(m => [m.id, m.reaction]));
    return msgs
      .filter(m => !deletedIdsRef.current.has(m.id))
      .map(m => ({
        id: m.id,
        text: m.text,
        image: m.image_url && !m.image_url.match(/\.(mp4|mov|webm|avi)$/i) ? m.image_url : null,
        video: m.image_url && m.image_url.match(/\.(mp4|mov|webm|avi)$/i) ? m.image_url : null,
        from: m.sender_id === userId ? 'me' : 'them',
        time: timeAgo(m.created_date),
        read: m.read_by?.includes(userId) || false,
        senderId: m.sender_id,
        isTemp: false,
        reaction: prevReactions[m.id] || null,
      }));
  };

  // Unlock audio + request notification permission on first mount
  useEffect(() => {
    const unlock = () => { try { getAudioCtx(); } catch(e) {} };
    document.addEventListener('touchstart', unlock, { once: true });
    document.addEventListener('mousedown', unlock, { once: true });
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
    return () => {
      document.removeEventListener('touchstart', unlock);
      document.removeEventListener('mousedown', unlock);
    };
  }, []);

  // Detect keyboard open/close
  useEffect(() => {
    const handleFocus = () => setKeyboardOpen(true);
    const handleBlur = () => setKeyboardOpen(false);
    const input = inputRef.current;
    if (input) {
      input.addEventListener('focus', handleFocus);
      input.addEventListener('blur', handleBlur);
      return () => {
        input.removeEventListener('focus', handleFocus);
        input.removeEventListener('blur', handleBlur);
      };
    }
  }, []);

  // Load current user and chat history
  useEffect(() => {
    const loadChat = async () => {
      const user = await base44.auth.me();
      setCurrentUser(user);
      currentUserRef.current = user;

      if (!convo.userId) return;

      try {
        let resolvedChatId = convo.chatId || null;

        if (!resolvedChatId) {
          const chatRes = await base44.functions.invoke('getOrCreateChat', { other_user_id: convo.userId });
          const chat = chatRes.data || chatRes;
          resolvedChatId = chat.id;
        }

        setChatId(resolvedChatId);
        chatIdRef.current = resolvedChatId;

        const msgRes = await base44.functions.invoke('getChatMessages', { chat_id: resolvedChatId });
        const msgs = msgRes.data?.messages || [];
        setMessages(prev => mapMessages(msgs, user.id, prev));
      } catch (err) {
        console.error('Failed to load chat:', err);
      }
    };
    loadChat();

    // Fetch only through the membership-checked endpoint. A global message
    // subscription can expose payloads from conversations the user is not in.
    const interval = setInterval(async () => {
      const cid = chatIdRef.current;
      const usr = currentUserRef.current;
      if (!cid || !usr) return;
      try {
        const msgRes = await base44.functions.invoke('getChatMessages', { chat_id: cid });
        const msgs = msgRes.data?.messages || [];
        setMessages(prev => mapMessages(msgs, usr.id, prev));
      } catch (_) {}
    }, 15000);

    return () => { clearInterval(interval); };
  }, [convo.userId, convo.chatId]);

  const scrollContainerRef = useRef(null);
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    // Only auto-scroll if user is near bottom (within 120px)
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    if (distFromBottom < 120) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const send = async () => {
    const content = input?.trim();
    if (!content && !mediaPreview?.url) return;
    if (sending || !currentUser || !convo?.userId) return;
    
    // Snapshot and clear inputs immediately for responsive UX
    const textToSend = content;
    const previewToSend = mediaPreview;
    setInput('');
    setMediaPreview(null);
    setSending(true);

    // Optimistic update
    const newMsg = {
      id: `temp-${Date.now()}`,
      text: textToSend,
      image: previewToSend?.type === 'image' ? previewToSend.url : null,
      video: previewToSend?.type === 'video' ? previewToSend.url : null,
      from: 'me',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false,
      senderId: currentUser.id,
      isTemp: true,
    };
    setMessages(prev => [...prev, newMsg]);

    try {
      // Upload media if present
      let uploadedImageUrl = null;
      if (previewToSend) {
        const uploadRes = await base44.integrations.Core.UploadFile({ file: previewToSend.file });
        uploadedImageUrl = uploadRes.file_url;
      }

      const result = await base44.functions.invoke('sendDirectMessage', {
        chat_id: chatIdRef.current || chatId || convo.chatId,
        receiverId: convo.userId,
        text: textToSend,
        imageUrl: uploadedImageUrl,
      });
      
      const resolvedChatId = chatId || result.data?.chat?.id;
      if (resolvedChatId && resolvedChatId !== chatId) {
        setChatId(resolvedChatId);
        chatIdRef.current = resolvedChatId;
      }

      if (resolvedChatId) {
        const msgRes = await base44.functions.invoke('getChatMessages', { chat_id: resolvedChatId });
        const msgs = msgRes.data?.messages || [];
        setMessages(prev => mapMessages(msgs, currentUser.id, prev));

        // Notify receiver of new message
        base44.functions.invoke('notifyNewMessage', {
          receiver_id: convo.userId,
          sender_id: currentUser.id,
          sender_name: currentUser.full_name || currentUser.email?.split('@')[0],
          message_preview: textToSend || '📷 Image',
          chat_id: resolvedChatId,
        }).catch(() => {});
      }
      } catch (err) {
      console.error('Failed to send message:', err);
      } finally {
      setSending(false);
      }
      };

  const handleReactMessage = (msgId, emoji) => {
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, reaction: m.reaction === emoji ? null : emoji } : m));
  };

  const handleDeleteMessage = async (msgId) => {
    if (!msgId || String(msgId).startsWith('temp-')) return;
    // Track locally so poll doesn't re-add it
    deletedIdsRef.current.add(msgId);
    setMessages(prev => prev.filter(m => m.id !== msgId));
    try {
      await base44.entities.Message.delete(msgId);
    } catch (err) {
      console.error('Failed to delete message:', err);
      // On failure, remove from tracking so it can re-appear
      deletedIdsRef.current.delete(msgId);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setMediaPreview({ url, type: file.type.startsWith('video/') ? 'video' : 'image', file });
  };

  const initiateCall = async (callType) => {
    if (!currentUser || !convo.userId) return;
    try {
      const result = await base44.functions.invoke('initiateCall', {
        receiver_id: convo.userId,
        type: callType
      });
      const callSession = result.data.call_session;
      setActiveCall({
        id: callSession.id,
        caller_id: callSession.caller_id,
        receiver_id: callSession.receiver_id,
        type: callSession.type,
        isIncoming: false,
        callerName: convo.name || currentUser.full_name || 'User',
        callerAvatar: convo.img || null,
        receiverName: convo.name || 'User',
        receiverAvatar: convo.img || null,
      });
    } catch (err) {
      console.error('Failed to initiate call:', err);
    }
  };

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden spicey-chat-screen" style={{ background: isLight ? 'linear-gradient(160deg, #FFFFFF 0%, #F8F8FC 52%, #FFF7F2 100%)' : '#050407', height: '100dvh' }}>
      <style>{`
        .spicey-chat-screen {
          --spicey-orange: #ff6a18;
          --spicey-pink: #ff2e93;
          --spicey-purple: #a42cff;
          color: white;
        }
        .spicey-chat-bg {
          position: absolute;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
          background:
            radial-gradient(circle at 88% 35%, rgba(255, 96, 18, 0.12), transparent 22%),
            radial-gradient(circle at 30% 58%, rgba(160, 44, 255, 0.12), transparent 30%),
            linear-gradient(180deg, #050208 0%, #090513 46%, #030204 100%);
        }
        .spicey-chat-bg::before,
        .spicey-chat-bg::after {
          content: "";
          position: absolute;
          left: -30%;
          width: 165%;
          height: 240px;
          opacity: 0.55;
          filter: blur(14px);
          background:
            linear-gradient(105deg, transparent 4%, rgba(255, 96, 18, 0.18) 24%, rgba(255, 46, 147, 0.42) 48%, rgba(164, 44, 255, 0.24) 66%, transparent 88%);
          border-radius: 50%;
          transform-origin: center;
        }
        .spicey-chat-bg::before {
          top: 28%;
          transform: rotate(-12deg) skewX(-18deg);
        }
        .spicey-chat-bg::after {
          bottom: 12%;
          transform: rotate(-14deg) skewX(-14deg) scale(1.05);
          opacity: 0.66;
        }
        .spicey-chat-wave-line {
          position: absolute;
          left: -22%;
          width: 150%;
          height: 3px;
          background: linear-gradient(90deg, transparent, #ff7a18, #ff2e93 48%, #a42cff, transparent);
          box-shadow: 0 0 20px rgba(255,46,147,0.68), 0 0 42px rgba(255,106,24,0.32);
          opacity: 0.86;
          transform: rotate(-13deg);
        }
        .spicey-chat-wave-line.one { top: 58%; }
        .spicey-chat-wave-line.two { top: 72%; opacity: 0.5; transform: rotate(-15deg); }
        .spicey-chat-header {
          position: relative;
          z-index: 10;
          flex-shrink: 0;
          background:
            radial-gradient(circle at 90% 78%, rgba(255, 90, 20, 0.18), transparent 18%),
            linear-gradient(180deg, rgba(32,8,44,0.88), rgba(13,5,20,0.70));
          border-bottom: 1px solid rgba(255,46,147,0.12);
          backdrop-filter: blur(20px);
        }
        .spicey-chat-topbar {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: max(3rem, calc(env(safe-area-inset-top) + 0.82rem)) 24px 18px;
        }
        .spicey-chat-back {
          color: #ff6a18;
          width: 34px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: flex-start;
          flex-shrink: 0;
        }
        .spicey-chat-profile-ring {
          padding: 3px;
          border-radius: 999px;
          background: conic-gradient(from 20deg, #ff6a18, #ff2e93, #a42cff, #ff6a18);
          box-shadow: 0 0 20px rgba(255,46,147,0.38);
        }
        .spicey-chat-profile-ring img {
          width: 56px;
          height: 56px;
          border-radius: 999px;
          object-fit: cover;
          border: 3px solid #050407;
          display: block;
        }
        .spicey-chat-online-dot {
          position: absolute;
          right: -2px;
          bottom: 4px;
          width: 16px;
          height: 16px;
          border-radius: 999px;
          background: #6bff3d;
          border: 3px solid #050407;
          box-shadow: 0 0 10px rgba(107,255,61,0.6);
        }
        .spicey-chat-title {
          color: white;
          font-size: 22px;
          line-height: 1.05;
          font-weight: 800;
          letter-spacing: -0.03em;
        }
        .spicey-chat-status {
          margin-top: 4px;
          color: #68ff47;
          font-size: 16px;
          line-height: 1;
          font-weight: 600;
        }
        .spicey-chat-action {
          width: 42px;
          height: 42px;
          border-radius: 999px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ff3fa2;
          background: transparent;
          border: 0;
          filter: drop-shadow(0 0 8px rgba(255,46,147,0.42));
        }
        .spicey-chat-row {
          display: flex;
          align-items: flex-end;
          gap: 10px;
          margin: 10px 0;
        }
        .spicey-chat-row-me { justify-content: flex-end; }
        .spicey-chat-row-them { justify-content: flex-start; }
        .spicey-chat-stack {
          display: flex;
          flex-direction: column;
          gap: 3px;
          max-width: min(74vw, 540px);
        }
        .spicey-message-avatar {
          width: 38px;
          height: 38px;
          border-radius: 999px;
          object-fit: cover;
          border: 2px solid transparent;
          background: linear-gradient(#050407, #050407) padding-box,
            linear-gradient(135deg, var(--spicey-orange), var(--spicey-pink), var(--spicey-purple)) border-box;
          box-shadow: 0 0 15px rgba(255, 46, 147, 0.42);
          flex-shrink: 0;
          margin-bottom: 1px;
        }
        .spicey-message-bubble {
          position: relative;
          min-width: 118px;
          padding: 12px 22px 12px 16px;
          border-radius: 22px;
          border: 1px solid transparent;
          background:
            linear-gradient(135deg, rgba(22, 12, 28, 0.9), rgba(44, 16, 57, 0.78)) padding-box,
            linear-gradient(135deg, var(--spicey-orange), var(--spicey-pink), var(--spicey-purple)) border-box;
          box-shadow: 0 9px 18px rgba(0,0,0,0.24), inset 0 1px 0 rgba(255,255,255,0.08);
          backdrop-filter: blur(18px);
        }
        .spicey-bubble-me {
          border-bottom-right-radius: 18px;
          background:
            linear-gradient(135deg, rgba(255, 46, 147, 0.92), rgba(134, 28, 224, 0.95)) padding-box,
            linear-gradient(135deg, rgba(255,255,255,0.72), var(--spicey-pink), var(--spicey-purple)) border-box;
          box-shadow: 0 0 14px rgba(255,46,147,0.18), 0 9px 18px rgba(0,0,0,0.26);
        }
        .spicey-bubble-them {
          border-bottom-left-radius: 18px;
          background:
            radial-gradient(circle at 90% 35%, rgba(255,106,24,0.14), transparent 42%),
            linear-gradient(135deg, rgba(22, 14, 31, 0.88), rgba(42, 29, 56, 0.80)) padding-box,
            linear-gradient(135deg, rgba(164,44,255,0.35), rgba(255,255,255,0.08), rgba(255,106,24,0.25)) border-box;
        }
        .spicey-message-bubble::after,
        .spicey-bubble-me::after,
        .spicey-bubble-them::after { display: none; }
        .spicey-message-bubble p {
          margin: 0;
          color: white;
          font-size: 16px;
          line-height: 1.42;
          font-weight: 500;
          letter-spacing: -0.01em;
          padding-right: 42px;
        }
        .spicey-inline-meta {
          display: flex;
          align-items: center;
          gap: 5px;
          position: absolute;
          right: 13px;
          bottom: 11px;
          color: rgba(255,255,255,0.62);
          font-size: 10px;
          font-weight: 600;
        }
        .spicey-bubble-me .spicey-inline-meta { color: #b98cff; }
        .spicey-media-bubble {
          position: relative;
          overflow: hidden;
          border-radius: 26px;
          border: 1px solid transparent;
          background:
            linear-gradient(#050407, #050407) padding-box,
            linear-gradient(135deg, var(--spicey-orange), var(--spicey-pink), var(--spicey-purple)) border-box;
          box-shadow: 0 16px 30px rgba(0,0,0,0.34);
        }
        .spicey-media-me { border-bottom-right-radius: 9px; }
        .spicey-media-them { border-bottom-left-radius: 9px; }
        .spicey-media-bubble img,
        .spicey-media-bubble video {
          display: block;
          min-width: 235px;
          border-radius: 24px;
        }
        .spicey-media-time {
          position: absolute;
          right: 13px;
          bottom: 12px;
          color: rgba(255,255,255,0.82);
          font-size: 12px;
          font-weight: 700;
          text-shadow: 0 1px 8px rgba(0,0,0,0.8);
        }
        .spicey-media-checks {
          position: absolute;
          right: 12px;
          bottom: 30px;
          width: 17px;
          height: 17px;
          color: #b98cff;
        }
        .spicey-audio-bubble {
          display: flex;
          align-items: center;
          gap: 14px;
          min-width: 250px;
          padding: 12px 16px;
          border-radius: 24px;
          border: 1px solid transparent;
          background:
            linear-gradient(135deg, rgba(22, 12, 28, 0.88), rgba(35, 16, 43, 0.82)) padding-box,
            linear-gradient(135deg, var(--spicey-pink), var(--spicey-orange), var(--spicey-purple)) border-box;
        }
        .spicey-audio-play {
          width: 46px;
          height: 46px;
          border-radius: 999px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ff6a18;
          background: rgba(0,0,0,0.28);
          border: 1px solid rgba(255,46,147,0.5);
        }
        .spicey-waveform {
          flex: 1;
          height: 34px;
          background: repeating-linear-gradient(90deg, #ff2e93 0 3px, transparent 3px 9px);
          mask-image: radial-gradient(ellipse at center, black 56%, transparent 62%);
          opacity: 0.9;
        }
        .spicey-audio-time {
          color: rgba(255,255,255,0.68);
          font-size: 12px;
        }
        .spicey-composer-wrap {
          position: relative;
          z-index: 20;
          padding: 12px 28px max(20px, env(safe-area-inset-bottom));
          background: linear-gradient(to top, rgba(4,3,6,1) 76%, rgba(4,3,6,0));
        }
        .spicey-composer-row {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 62px;
          gap: 13px;
          align-items: center;
        }
        .spicey-plus-btn,
        .spicey-round-btn {
          width: 52px;
          height: 52px;
          border-radius: 999px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ff7a2e;
          font-size: 34px;
          line-height: 1;
          border: 1px solid transparent;
          background:
            linear-gradient(rgba(18, 12, 24, 0.92), rgba(18, 12, 24, 0.92)) padding-box,
            linear-gradient(135deg, var(--spicey-orange), var(--spicey-pink), var(--spicey-purple)) border-box;
          box-shadow: 0 0 18px rgba(255,46,147,0.22);
        }
        .spicey-plus-btn { order: 2; width: 60px; height: 60px; color: white; font-size: 38px; background: linear-gradient(135deg, #ff7a18, #ff2e93 55%, #a42cff); box-shadow: 0 0 26px rgba(255,46,147,0.46), 0 0 34px rgba(255,106,24,0.30); }
        .spicey-input-shell {
          order: 1;
          min-height: 60px;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 0 16px 0 24px;
          border-radius: 999px;
          border: 1px solid transparent;
          background:
            linear-gradient(rgba(22, 15, 31, 0.92), rgba(16, 11, 24, 0.92)) padding-box,
            linear-gradient(135deg, rgba(255,255,255,0.10), rgba(255,46,147,0.28), rgba(164,44,255,0.30)) border-box;
          backdrop-filter: blur(20px);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.06);
        }
        .spicey-input-shell input {
          min-width: 0;
          flex: 1;
          background: transparent;
          outline: none;
          color: white;
          font-size: 17px;
          font-weight: 500;
        }
        .spicey-input-shell input::placeholder { color: rgba(255,255,255,0.34); }
        .spicey-input-icon {
          width: 40px;
          height: 40px;
          border-radius: 999px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ff4db3;
          border: 1px solid rgba(255,46,147,0.35);
          background: rgba(255,255,255,0.03);
        }
        .spicey-send-btn {
          width: 40px;
          height: 40px;
          border-radius: 999px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          background: linear-gradient(135deg, var(--spicey-orange), var(--spicey-pink), var(--spicey-purple));
          box-shadow: 0 0 18px rgba(255,46,147,0.38);
        }
        .spicey-attach-row {
          display: none;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 14px;
          margin-top: 18px;
        }
        .spicey-attach-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 7px;
          color: rgba(255,255,255,0.62);
          font-size: 12px;
          font-weight: 500;
        }
        .spicey-attach-icon {
          width: 52px;
          height: 52px;
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ff7a2e;
          border: 1px solid rgba(255,106,24,0.35);
          background: rgba(255,255,255,0.035);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.06);
        }
        @media (max-width: 380px) {
          .spicey-message-bubble p { font-size: 16px; }
          .spicey-chat-stack { max-width: 76vw; }
          .spicey-attach-row { gap: 8px; }
          .spicey-attach-icon { width: 46px; height: 46px; border-radius: 16px; }
        }
      `}</style>
      <div className="spicey-chat-bg">
        <div className="spicey-chat-wave-line one" />
        <div className="spicey-chat-wave-line two" />
      </div>

      {/* ── Header ── */}
      <div className="spicey-chat-header">
        <div className="spicey-chat-topbar">
          {/* Back */}
          <motion.button onClick={onBack} whileTap={{ scale: 0.88 }}
            className="spicey-chat-back">
            <ChevronLeft className="w-8 h-8" />
          </motion.button>

          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="spicey-chat-profile-ring">
              <img src={convo.img} alt={convo.name} />
            </div>
            {convo.online && (
              <motion.span animate={{ scale: [1, 1.15, 1], opacity: [1, 0.82, 1] }} transition={{ duration: 2, repeat: Infinity }} className="spicey-chat-online-dot" />
            )}
          </div>

          {/* Name + status */}
          <div className="flex-1 min-w-0">
            <p className="spicey-chat-title truncate">{convo.name} <span style={{ color: '#9d55ff', fontSize: 18 }}>✹</span></p>
            <p className="spicey-chat-status">{convo.online ? 'Active now' : 'Last seen recently'}</p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <motion.button whileTap={{ scale: 0.88 }} onClick={() => initiateCall('voice')}
              className="spicey-chat-action">
              <Phone className="w-7 h-7" />
            </motion.button>
            <motion.button whileTap={{ scale: 0.88 }} onClick={() => initiateCall('video')}
              className="spicey-chat-action">
              <Video className="w-7 h-7" />
            </motion.button>
            <motion.button whileTap={{ scale: 0.88 }}
              className="spicey-chat-action">
              <MoreVertical className="w-7 h-7" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* ── Messages ── */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 ios-smooth-scroll" style={{ scrollbarWidth: 'none', userSelect: 'none', WebkitUserSelect: 'none', WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain', contain: 'layout style', willChange: 'scroll-position' }}>
        {/* Date chip */}
        <div className="flex justify-center">
          <span className="text-[11px] font-semibold px-4 py-1.5 rounded-full tracking-wide"
            style={{
              color: isLight ? 'rgba(35,35,45,0.52)' : 'rgba(255,255,255,0.25)',
              background: isLight ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.04)',
              border: isLight ? '1px solid rgba(21,18,28,0.08)' : '1px solid rgba(255,255,255,0.06)',
            }}>
            Today
          </span>
        </div>

        {messages.map((msg) => (
          <MsgBubble key={msg.id} msg={msg} convoImg={convo.img} onDelete={handleDeleteMessage} onReact={handleReactMessage} isLight={isLight} />
        ))}



        <div ref={bottomRef} className="h-1" />
      </div>

      {/* ── Media preview strip ── */}
      <AnimatePresence>
        {mediaPreview && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className="flex-shrink-0 px-4 pb-2">
            <div className="relative inline-block">
              {mediaPreview.type === 'video' ? (
                <div className="h-20 w-20 rounded-2xl overflow-hidden flex items-center justify-center"
                  style={{ border: '2px solid rgba(255,80,0,0.5)', background: 'rgba(0,0,0,0.6)' }}>
                  <video src={mediaPreview.url} className="h-full w-full object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Film className="w-6 h-6 text-white/80" />
                  </div>
                </div>
              ) : (
                <img src={mediaPreview.url} alt="preview" className="h-20 w-20 object-cover rounded-2xl"
                  style={{ border: '2px solid rgba(255,80,0,0.5)' }} />
              )}
              <button onClick={() => setMediaPreview(null)}
                className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold"
                style={{ background: 'linear-gradient(135deg, #ff5500, #e91e8c)' }}>×</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Input bar ── */}
      <div className="spicey-composer-wrap">
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={handleFileChange} />

        <div className="spicey-composer-row">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => fileInputRef.current?.click()} className="spicey-plus-btn" aria-label="Add media">
            +
          </motion.button>

          <div className="spicey-input-shell">
            <input
              ref={inputRef}
              placeholder="Type a message..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              autoCorrect="off"
              spellCheck="false"
              autoCapitalize="off"
            />
            <motion.button
              whileTap={{ scale: 0.88 }}
              onClick={() => setShowEmojiPanel(!showEmojiPanel)}
              className="spicey-input-icon"
              aria-label="Emoji">
              <Smile className="w-5 h-5" />
            </motion.button>

            {(input.trim() || mediaPreview?.url) ? (
              <motion.button
                whileTap={{ scale: 0.88 }}
                onClick={() => send()}
                disabled={sending}
                className="spicey-send-btn disabled:opacity-50"
                aria-label="Send">
                {sending
                  ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <Send className="w-5 h-5" />}
              </motion.button>
            ) : (
              <button className="spicey-input-icon" type="button" aria-label="Voice">
                <Mic className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Emoji/Symbol Panel */}
          <AnimatePresence>
            {showEmojiPanel && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute bottom-full left-0 right-0 mb-2 mx-3 rounded-3xl overflow-hidden"
                style={{
                  background: 'rgba(15,10,25,0.98)',
                  border: '1px solid rgba(255,85,0,0.3)',
                  boxShadow: '0 0 30px rgba(255,85,0,0.3), 0 0 60px rgba(233,30,140,0.2)',
                  backdropFilter: 'blur(20px)',
                  maxHeight: '70vh',
                }}>
                {/* Category tabs */}
                <div className="flex items-center gap-1 p-2 border-b border-white/10 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                  {EMOJI_CATEGORIES.map((cat, idx) => (
                    <button
                      key={cat.name}
                      onClick={() => setEmojiCategory(idx)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition ${emojiCategory === idx ? 'bg-orange-500/20 text-orange-400' : 'text-white/40 hover:text-white/70'}`}>
                      {cat.name}
                    </button>
                  ))}
                </div>
                {/* Emoji grid */}
                <div className="overflow-y-auto p-3" style={{ maxHeight: '50vh' }}>
                  <div className="grid grid-cols-8 gap-2">
                    {EMOJI_CATEGORIES[emojiCategory]?.emojis.map((emoji, i) => (
                      <motion.button
                        key={i}
                        whileTap={{ scale: 0.85 }}
                        onClick={() => {
                          setInput(prev => prev + emoji);
                          setShowEmojiPanel(false);
                        }}
                        className="text-2xl w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/5 active:bg-white/10 transition">
                        {emoji}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {!keyboardOpen && (
          <div className="spicey-attach-row">
            <button className="spicey-attach-btn" onClick={() => fileInputRef.current?.click()}>
              <span className="spicey-attach-icon"><ImageIcon className="w-6 h-6" /></span>
              <span>Gallery</span>
            </button>
            <button className="spicey-attach-btn" onClick={() => fileInputRef.current?.click()}>
              <span className="spicey-attach-icon"><Camera className="w-6 h-6" /></span>
              <span>Camera</span>
            </button>
            <button className="spicey-attach-btn" type="button">
              <span className="spicey-attach-icon"><Mic className="w-6 h-6" /></span>
              <span>Voice</span>
            </button>
            <button className="spicey-attach-btn" type="button">
              <span className="spicey-attach-icon"><MapPin className="w-6 h-6" /></span>
              <span>Location</span>
            </button>
            <button className="spicey-attach-btn" type="button">
              <span className="spicey-attach-icon"><Gift className="w-6 h-6" /></span>
              <span>Gift</span>
            </button>
          </div>
        )}
        </div>

    </div>
  );
}
