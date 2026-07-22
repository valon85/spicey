/**
 * AITalkMode — Voice AI conversation mode
 */
import React, { useState, useRef, useEffect } from 'react';
import { useAI } from '@/lib/AIContext';
import { spiceyApi } from '@/api/spiceyApi';

const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'sq', name: 'Shqip' },
  { code: 'ar', name: 'العربية' },
  { code: 'zh', name: '中文' },
  { code: 'hr', name: 'Hrvatski' },
  { code: 'da', name: 'Dansk' },
  { code: 'nl', name: 'Nederlands' },
  { code: 'fi', name: 'Suomi' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'el', name: 'Ελληνικά' },
  { code: 'he', name: 'עברית' },
  { code: 'hi', name: 'हिन्दी' },
  { code: 'id', name: 'Bahasa Indonesia' },
  { code: 'it', name: 'Italiano' },
  { code: 'ja', name: '日本語' },
  { code: 'ko', name: '한국어' },
  { code: 'mk', name: 'Македонски' },
  { code: 'ms', name: 'Bahasa Melayu' },
  { code: 'no', name: 'Norsk' },
  { code: 'fa', name: 'فارسی' },
  { code: 'pl', name: 'Polski' },
  { code: 'pt', name: 'Português' },
  { code: 'ro', name: 'Română' },
  { code: 'ru', name: 'Русский' },
  { code: 'sr', name: 'Српски' },
  { code: 'es', name: 'Español' },
  { code: 'sv', name: 'Svenska' },
  { code: 'tl', name: 'Tagalog' },
  { code: 'ta', name: 'தமிழ்' },
  { code: 'th', name: 'ไทย' },
  { code: 'tr', name: 'Türkçe' },
  { code: 'uk', name: 'Українська' },
  { code: 'ur', name: 'اردو' },
  { code: 'vi', name: 'Tiếng Việt' },
];

const VOICE_OPTIONS = [
  { id: 'sage', name: 'Sage', desc: 'Calm, closest to ChatGPT style' },
  { id: 'coral', name: 'Coral', desc: 'Natural, warm' },
  { id: 'ballad', name: 'Ballad', desc: 'Smooth' },
  { id: 'verse', name: 'Verse', desc: 'Expressive' },
  { id: 'ash', name: 'Ash', desc: 'Deep' },
  { id: 'shimmer', name: 'Shimmer', desc: 'Bright' },
];

const GREETINGS = {
  en: "Hi, I'm Spicey AI. I'm listening.",
  sq: "Përshëndetje, jam Spicey AI. Po të dëgjoj.",
  ar: "مرحباً، أنا Spicey AI! كيف يمكنني مساعدتك اليوم؟",
  zh: "你好，我是 Spicey AI！今天我能帮你什么？",
  hr: "Bok, ja sam Spicey AI! Kako ti mogu pomoći danas?",
  da: "Hej, jeg er Spicey AI! Hvordan kan jeg hjælpe dig i dag?",
  nl: "Hoi, ik ben Spicey AI! Waarmee kan ik je vandaag helpen?",
  fi: "Hei, olen Spicey AI! Miten voin auttaa sinua tänään?",
  fr: "Bonjour, je suis Spicey AI! Comment puis-je vous aider aujourd'hui?",
  de: "Hallo, ich bin Spicey AI! Wie kann ich dir heute helfen?",
  el: "Γεια, είμαι το Spicey AI! Πώς μπορώ να βοηθήσω σήμερα;",
  he: "שלום, אני Spicey AI! איך אוכל לעזור לך היום?",
  hi: "नमस्ते, मैं Spicey AI हूँ! आज मैं आपकी कैसे मदद कर सकता हूँ?",
  id: "Hai, saya Spicey AI! Apa yang bisa saya bantu hari ini?",
  it: "Ciao, sono Spicey AI! Come posso aiutarti oggi?",
  ja: "こんにちは、Spicey AI です！今日はどうお手伝いできますか？",
  ko: "안녕하세요, 저는 Spicey AI입니다! 오늘 무엇을 도와드릴까요?",
  mk: "Здраво, јас сум Spicey AI! Како можам да помогнам денес?",
  ms: "Hai, saya Spicey AI! Bagaimana saya boleh bantu hari ini?",
  no: "Hei, jeg er Spicey AI! Hvordan kan jeg hjelpe deg i dag?",
  fa: "سلام، من Spicey AI هستم! امروز چطور می‌توانم کمک کنم؟",
  pl: "Cześć, jestem Spicey AI! Jak mogę dziś pomóc?",
  pt: "Olá, eu sou Spicey AI! Como posso ajudar hoje?",
  ro: "Salut, sunt Spicey AI! Cum te pot ajuta astăzi?",
  ru: "Привет, я Spicey AI! Чем я могу помочь сегодня?",
  sr: "Zdravo, ja sam Spicey AI! Kako mogu da pomognem danas?",
  es: "¡Hola, soy Spicey AI! ¿Cómo puedo ayudarte hoy?",
  sv: "Hej, jag är Spicey AI! Hur kan jag hjälpa dig idag?",
  tl: "Hi, ako si Spicey AI! Paano kita matutulungan ngayon?",
  ta: "வணக்கம், நான் Spicey AI! இன்று எப்படி உதவலாம்?",
  th: "สวัสดี ฉันคือ Spicey AI! วันนี้ให้ช่วยอะไรได้บ้าง?",
  tr: "Merhaba, ben Spicey AI! Bugün sana nasıl yardımcı olabilirim?",
  uk: "Привіт, я Spicey AI! Як я можу допомогти сьогодні?",
  ur: "ہیلو، میں Spicey AI ہوں! آج میں آپ کی کیسے مدد کر سکتا ہوں؟",
  vi: "Xin chào, tôi là Spicey AI! Hôm nay tôi có thể giúp gì cho bạn?",
};

const LANGUAGE_NAMES = Object.fromEntries(SUPPORTED_LANGUAGES.map((lang) => [lang.code, lang.name]));

function getGreeting(lang) {
  return GREETINGS[lang] || GREETINGS.en;
}

function getSpeechLang(lang) {
  const map = {
    sq: 'sq-AL',
    en: 'en-US',
    ar: 'ar-SA',
    zh: 'zh-CN',
    hr: 'hr-HR',
    da: 'da-DK',
    nl: 'nl-NL',
    fi: 'fi-FI',
    fr: 'fr-FR',
    de: 'de-DE',
    el: 'el-GR',
    he: 'he-IL',
    hi: 'hi-IN',
    id: 'id-ID',
    it: 'it-IT',
    ja: 'ja-JP',
    ko: 'ko-KR',
    mk: 'mk-MK',
    ms: 'ms-MY',
    no: 'nb-NO',
    fa: 'fa-IR',
    pl: 'pl-PL',
    pt: 'pt-PT',
    ro: 'ro-RO',
    ru: 'ru-RU',
    sr: 'sr-RS',
    es: 'es-ES',
    sv: 'sv-SE',
    tl: 'fil-PH',
    ta: 'ta-IN',
    th: 'th-TH',
    tr: 'tr-TR',
    uk: 'uk-UA',
    ur: 'ur-PK',
    vi: 'vi-VN',
  };
  return map[lang] || lang || 'en-US';
}

function getBestMimeType() {
  // Prefer ogg/opus and mp4 — Whisper handles these best
  // Avoid webm;codecs=opus which often fails Whisper's decoder
  const types = [
    'audio/ogg;codecs=opus',
    'audio/mp4',
    'audio/mpeg',
    'audio/webm;codecs=opus',
    'audio/webm',
  ];
  for (const t of types) {
    try { if (MediaRecorder.isTypeSupported(t)) return t; } catch (e) {}
  }
  return '';
}

const SILENCE_THRESHOLD = 0.018;
const SILENCE_DURATION_MS = 1050;
const MIN_SPEECH_MS = 450;
const MIN_AUDIO_BYTES = 1200; // minimum meaningful audio size in preview/mobile browsers

export default function AITalkMode({ onClose }) {
  const { close, setPhase } = useAI();

  const [status, setStatus] = useState('idle');
  const [isLight, setIsLight] = useState(false);
  const [showLangPicker, setShowLangPicker] = useState(false);
  const [showVoicePicker, setShowVoicePicker] = useState(false);
  const [selectedLang, setSelectedLang] = useState('en');
  const [selectedVoice, setSelectedVoice] = useState('sage');
  const [previewingVoice, setPreviewingVoice] = useState('');
  const [aiText, setAiText] = useState(getGreeting('en'));
  const [voiceLevel, setVoiceLevel] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [micBlocked, setMicBlocked] = useState(false);
  const [micPermission, setMicPermission] = useState('unknown');
  const [textInput, setTextInput] = useState('');
  const [inputFocused, setInputFocused] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', text: "Hi, I'm Spicey AI. Choose your language, then speak or type anything.", time: '' },
  ]);

  // Refs — avoid stale closures
  const statusRef = useRef('idle');
  const selectedLangRef = useRef('en');
  const selectedVoiceRef = useRef('sage');
  const conversationHistoryRef = useRef([]);
  const isBusyRef = useRef(false);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const audioRef = useRef(null);
  const animFrameRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const speechStartedRef = useRef(false);
  const speechStartTimeRef = useRef(0);
  const mimeTypeRef = useRef('');
  const recognitionRef = useRef(null);
  const transcriptRef = useRef('');
  const voiceModeRef = useRef('openai-tts');
  const realtimePcRef = useRef(null);
  const realtimeChannelRef = useRef(null);
  const realtimeAudioRef = useRef(null);
  const realtimeStreamRef = useRef(null);
  const realtimeReadyRef = useRef(false);
  const realtimeClosingRef = useRef(false);
  const listenTimeoutRef = useRef(null);
  const restartListenRef = useRef(null);

  const startListeningRef = useRef(null);
  const processAudioRef = useRef(null);
  const triggerSendRef = useRef(null);
  const playGreetingRef = useRef(null);
  const autoMicAttemptedRef = useRef(false);
  const micPrimedRef = useRef(false);

  const setStatusBoth = (s) => {
    setStatus(s);
    statusRef.current = s;
  };

  const restartListeningSoon = (delay = 350) => {
    if (restartListenRef.current) clearTimeout(restartListenRef.current);
    restartListenRef.current = setTimeout(() => {
      restartListenRef.current = null;
      if (!isBusyRef.current && statusRef.current === 'idle' && micPrimedRef.current) startListeningRef.current?.();
    }, delay);
  };

  const refreshMicPermission = async () => {
    try {
      if (!navigator?.permissions?.query) return 'unknown';
      const permission = await navigator.permissions.query({ name: 'microphone' });
      setMicPermission(permission.state);
      permission.onchange = () => setMicPermission(permission.state);
      return permission.state;
    } catch (error) {
      setMicPermission('unknown');
      return 'unknown';
    }
  };

  const requestMicAccess = async () => {
    if (isBusyRef.current) return false;
    setErrorMsg('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: false,
      });
      stream.getTracks().forEach((track) => track.stop());
      micPrimedRef.current = true;
      setMicBlocked(false);
      setMicPermission('granted');
      setAiText('Mic is on. Speak naturally.');
      setTimeout(() => startListeningRef.current?.(), 120);
      return true;
    } catch (error) {
      micPrimedRef.current = false;
      setMicBlocked(true);
      setMicPermission(error?.name === 'NotAllowedError' ? 'denied' : 'blocked');
      setErrorMsg(error?.name === 'NotAllowedError'
        ? 'Microphone is blocked for this page. Open browser site settings and allow microphone.'
        : 'Microphone could not start. Check your computer input device.');
      setStatusBoth('idle');
      setPhase('stopped');
      return false;
    }
  };

  const safeVoiceChat = async (payload = {}) => {
    try {
      const data = await spiceyApi.ai.voiceChat(payload);
      if (data?.error) throw new Error(data.error);
      return data;
    } catch (error) {
      const lang = payload.language || selectedLangRef.current || 'en';
      const fallbackText = payload.is_greeting
        ? getGreeting(lang)
        : `I heard you. ${payload.text_override ? `You said: "${payload.text_override}".` : 'Ask me anything and I will help.'}`;
      return {
        transcription: payload.text_override || '',
        ai_text: fallbackText,
        text: fallbackText,
        speech_url: '',
        no_speech: false,
      };
    }
  };

  useEffect(() => { selectedLangRef.current = selectedLang; }, [selectedLang]);
  useEffect(() => { selectedVoiceRef.current = selectedVoice; }, [selectedVoice]);

  useEffect(() => {
    refreshMicPermission();
  }, []);

  useEffect(() => {
    const nav = document.getElementById('bottom-nav');
    const previousDisplay = nav?.style.display || '';
    if (nav) nav.style.display = 'none';
    document.body.classList.add('spicey-talk-open');
    return () => {
      if (nav) nav.style.display = previousDisplay;
      document.body.classList.remove('spicey-talk-open');
    };
  }, []);

  const sendRealtimeEvent = (event) => {
    const channel = realtimeChannelRef.current;
    if (!channel || channel.readyState !== 'open') return false;
    channel.send(JSON.stringify(event));
    return true;
  };

  const stopRealtime = () => {
    realtimeClosingRef.current = true;
    realtimeReadyRef.current = false;
    try { realtimeChannelRef.current?.close?.(); } catch (e) {}
    realtimeChannelRef.current = null;
    try { realtimePcRef.current?.close?.(); } catch (e) {}
    realtimePcRef.current = null;
    if (realtimeStreamRef.current) {
      realtimeStreamRef.current.getTracks().forEach((track) => track.stop());
      realtimeStreamRef.current = null;
    }
    if (realtimeAudioRef.current) {
      realtimeAudioRef.current.pause();
      realtimeAudioRef.current.srcObject = null;
      realtimeAudioRef.current = null;
    }
    setTimeout(() => { realtimeClosingRef.current = false; }, 0);
  };

  const interruptRealtime = () => {
    sendRealtimeEvent({ type: 'response.cancel' });
    setStatusBoth('listening');
    setPhase('listening');
    setVoiceLevel(0.25);
  };

  const startRealtimeSession = async () => {
    try {
      voiceModeRef.current = 'realtime';
      stopMic();
      stopRealtime();
      isBusyRef.current = true;
      setErrorMsg('');
      setStatusBoth('thinking');
      setPhase('thinking');
      setAiText("Connecting Spicey AI voice...");

      const activeLang = selectedLangRef.current;
      const activeLanguageName = LANGUAGE_NAMES[activeLang] || 'the selected language';
      const activeGreeting = getGreeting(activeLang);
      const realtimeSession = await spiceyApi.ai.getRealtimeSession({ voice: selectedVoiceRef.current, language: activeLang });
      const { client_secret } = realtimeSession || {};
      if (!client_secret) throw new Error(realtimeSession?.error || 'Realtime voice token missing');

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: false,
      });
      realtimeStreamRef.current = stream;

      const pc = new RTCPeerConnection();
      realtimePcRef.current = pc;

      const remoteAudio = new Audio();
      remoteAudio.autoplay = true;
      remoteAudio.playsInline = true;
      realtimeAudioRef.current = remoteAudio;

      pc.ontrack = (event) => {
        remoteAudio.srcObject = event.streams[0];
        remoteAudio.play().catch(() => {
          setErrorMsg('');
        });
      };

      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      const dc = pc.createDataChannel('oai-events');
      realtimeChannelRef.current = dc;

      dc.onopen = () => {
        realtimeReadyRef.current = true;
        isBusyRef.current = false;
        setStatusBoth('listening');
        setPhase('listening');
        setAiText(activeGreeting);
        sendRealtimeEvent({
          type: 'session.update',
          session: {
            type: 'realtime',
            instructions: `You are Spicey AI, a warm natural voice assistant. The selected language is ${activeLanguageName}. Start in that language and reply in that language unless the user clearly switches language. Speak naturally like ChatGPT Voice, not like a translator. Keep responses short for voice. If the user interrupts, stop and listen.`,
            audio: {
              input: {
                transcription: { model: 'whisper-1' },
                turn_detection: {
                  type: 'server_vad',
                  threshold: 0.5,
                  prefix_padding_ms: 300,
                  silence_duration_ms: 450,
                  create_response: true,
                  interrupt_response: true,
                },
              },
            },
          },
        });
        sendRealtimeEvent({
          type: 'response.create',
          response: {
            instructions: `Say this greeting naturally in ${activeLanguageName}: "${activeGreeting}"`,
          },
        });
      };

      dc.onmessage = (event) => {
        let msg;
        try { msg = JSON.parse(event.data); } catch (_) { return; }
        if (msg.type === 'response.audio.delta') {
          setStatusBoth('speaking');
          setPhase('speaking');
          setVoiceLevel(0.65);
        } else if (msg.type === 'response.audio.done' || msg.type === 'response.done') {
          setStatusBoth('listening');
          setPhase('listening');
          setVoiceLevel(0);
        } else if (msg.type === 'response.audio_transcript.delta' || msg.type === 'response.text.delta') {
          if (msg.delta) setAiText((prev) => `${prev || ''}${msg.delta}`);
        } else if (msg.type === 'response.audio_transcript.done' || msg.type === 'response.text.done') {
          if (msg.transcript || msg.text) setAiText(msg.transcript || msg.text);
        } else if (msg.type === 'conversation.item.input_audio_transcription.completed') {
          if (msg.transcript) transcriptRef.current = msg.transcript;
        } else if (msg.type === 'input_audio_buffer.speech_started') {
          interruptRealtime();
        } else if (msg.type === 'error') {
          setErrorMsg(msg.error?.message || 'Realtime voice error.');
        }
      };

      dc.onclose = () => {
        realtimeReadyRef.current = false;
        if (!realtimeClosingRef.current) {
          setStatusBoth('idle');
          setErrorMsg('Voice disconnected. Reconnecting...');
          setTimeout(() => startRealtimeSession(), 1200);
        }
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const answerResponse = await fetch('https://api.openai.com/v1/realtime/calls', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${client_secret}`,
          'Content-Type': 'application/sdp',
        },
        body: offer.sdp,
      });

      const answerSdp = await answerResponse.text();
      if (!answerResponse.ok) throw new Error(answerSdp || 'Realtime connection failed');
      await pc.setRemoteDescription({ type: 'answer', sdp: answerSdp });
    } catch (error) {
      console.error('[AITalk Realtime] failed:', error);
      isBusyRef.current = false;
      realtimeReadyRef.current = false;
      setStatusBoth('idle');
      setPhase('stopped');
      voiceModeRef.current = 'openai-tts';
      setErrorMsg('');
    }
  };

  // Light mode detection
  useEffect(() => {
    const check = () => setIsLight(document.documentElement.classList.contains('light-mode'));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

  // ── STOP MIC ──
  const stopMic = () => {
    if (animFrameRef.current) { cancelAnimationFrame(animFrameRef.current); animFrameRef.current = null; }
    if (restartListenRef.current) { clearTimeout(restartListenRef.current); restartListenRef.current = null; }
    if (listenTimeoutRef.current) { clearTimeout(listenTimeoutRef.current); listenTimeoutRef.current = null; }
    if (silenceTimerRef.current) { clearTimeout(silenceTimerRef.current); silenceTimerRef.current = null; }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try { mediaRecorderRef.current.stop(); } catch (e) {}
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setVoiceLevel(0);
  };

  // ── FULL CLEANUP ──
  const fullCleanup = () => {
    isBusyRef.current = false;
    stopMic();
    stopRealtime();
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    try { window.speechSynthesis?.cancel?.(); } catch (e) {}
  };

  const speakText = () => Promise.resolve();

  // ── PLAY AUDIO ──
  const playAudio = (url) => new Promise((resolve) => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    const audio = new Audio(url);
    audioRef.current = audio;
    audio.volume = 0.82;
    audio.playbackRate = 1.0;
    let resolved = false;
    const done = () => { if (!resolved) { resolved = true; clearTimeout(timeout); resolve(); } };
    const timeout = setTimeout(() => { console.warn('[AITalk] audio timeout'); done(); }, 15000);
    audio.onended = done;
    audio.onerror = (e) => { console.warn('[AITalk] audio error', e); done(); };
    audio.play().then(() => {
      console.log('[AITalk] audio playing OK');
    }).catch((err) => {
      console.warn('[AITalk] play() blocked:', err.message);
      done();
    });
  });

  const previewVoice = async (voiceId) => {
    if (previewingVoice) return;
    setPreviewingVoice(voiceId);
    const sample = `Hi, I'm Spicey AI. This is the ${VOICE_OPTIONS.find((voice) => voice.id === voiceId)?.name || voiceId} voice.`;
    try {
      const data = await safeVoiceChat({
        text_override: sample,
        language: selectedLangRef.current,
        voice: voiceId,
        mime_type: 'audio/webm',
      });
      if (data?.speech_url) await playAudio(data.speech_url);
      else await speakText(data?.ai_text || sample);
    } finally {
      setPreviewingVoice('');
    }
  };

  // ── START LISTENING (stored in ref to avoid stale closures) ──
  startListeningRef.current = async () => {
    if (isBusyRef.current) return;
    const s = statusRef.current;
    if (s === 'listening' || s === 'thinking' || s === 'speaking') return;

    setErrorMsg('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      streamRef.current = stream;
      setMicBlocked(false);
      setErrorMsg('');

      const mimeType = getBestMimeType();
      mimeTypeRef.current = mimeType;
      chunksRef.current = [];
      transcriptRef.current = '';
      speechStartedRef.current = false;
      speechStartTimeRef.current = 0;

      const mr = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      mr.ondataavailable = (e) => { if (e.data?.size > 0) chunksRef.current.push(e.data); };
      mr.start(250);
      listenTimeoutRef.current = setTimeout(() => {
        listenTimeoutRef.current = null;
        if (statusRef.current === 'listening') triggerSendRef.current?.();
      }, 6000);

      setStatusBoth('listening');
      setPhase('listening');

      const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (Recognition) {
        try {
          const recognition = new Recognition();
          recognition.lang = getSpeechLang(selectedLangRef.current);
          recognition.interimResults = true;
          recognition.continuous = true;
          recognition.onresult = (event) => {
            let text = '';
            for (let i = event.resultIndex; i < event.results.length; i += 1) {
              text += event.results[i][0]?.transcript || '';
            }
            if (text.trim()) transcriptRef.current = text.trim();
          };
          recognition.onerror = () => {};
          recognitionRef.current = recognition;
          recognition.start();
        } catch (e) {
          recognitionRef.current = null;
        }
      }

      // Silence detection
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 512;
        ctx.createMediaStreamSource(stream).connect(analyser);
        const data = new Float32Array(analyser.frequencyBinCount);

        const tick = () => {
          if (statusRef.current !== 'listening') { setVoiceLevel(0); return; }
          analyser.getFloatTimeDomainData(data);
          const rms = Math.sqrt(data.reduce((s, v) => s + v * v, 0) / data.length);
          setVoiceLevel(Math.min(rms * 10, 1));

          if (rms > SILENCE_THRESHOLD) {
            if (!speechStartedRef.current) {
              speechStartedRef.current = true;
              speechStartTimeRef.current = Date.now();
            }
            if (silenceTimerRef.current) { clearTimeout(silenceTimerRef.current); silenceTimerRef.current = null; }
          } else if (speechStartedRef.current && !silenceTimerRef.current) {
            if (Date.now() - speechStartTimeRef.current >= MIN_SPEECH_MS) {
              silenceTimerRef.current = setTimeout(() => {
                silenceTimerRef.current = null;
                if (statusRef.current === 'listening') triggerSendRef.current?.();
              }, SILENCE_DURATION_MS);
            }
          }
          animFrameRef.current = requestAnimationFrame(tick);
        };
        tick();
      } catch (e) { console.warn('[AITalk] Analyser error:', e); }

    } catch (err) {
      console.error('[AITalk] Mic error:', err);
      micPrimedRef.current = false;
      setMicBlocked(true);
      setMicPermission(err?.name === 'NotAllowedError' ? 'denied' : 'blocked');
      setErrorMsg(err?.name === 'NotAllowedError'
        ? 'Microphone is blocked for this page. Allow microphone in browser settings.'
        : 'Microphone is not active.');
      setStatusBoth('idle');
    }
  };

  // ── TRIGGER SEND ──
  triggerSendRef.current = () => {
    if (statusRef.current !== 'listening' || isBusyRef.current) return;
    isBusyRef.current = true;
    setStatusBoth('thinking');
    setPhase('thinking');
    if (listenTimeoutRef.current) { clearTimeout(listenTimeoutRef.current); listenTimeoutRef.current = null; }
    if (silenceTimerRef.current) { clearTimeout(silenceTimerRef.current); silenceTimerRef.current = null; }

    const mr = mediaRecorderRef.current;
    try { recognitionRef.current?.stop?.(); } catch (e) {}
    recognitionRef.current = null;
    if (!mr || mr.state === 'inactive') {
      processAudioRef.current?.();
    } else {
      mr.onstop = () => processAudioRef.current?.();
      stopMic();
    }
  };

  // ── PROCESS AUDIO ──
  processAudioRef.current = async () => {
    const chunks = chunksRef.current;
    const totalSize = chunks.reduce((s, c) => s + c.size, 0);
    const transcript = transcriptRef.current.trim();

    if (!transcript && (!chunks.length || totalSize < MIN_AUDIO_BYTES)) {
      isBusyRef.current = false;
      setStatusBoth('idle');
      setPhase('stopped');
      restartListeningSoon(250);
      return;
    }

    try {
      const mr = mediaRecorderRef.current;
      // Always send clean mime type without codec params — Whisper needs this
      const usedMime = (mr?.mimeType && mr.mimeType !== '') ? mr.mimeType : (mimeTypeRef.current || 'audio/webm');
      const cleanMime = usedMime.split(';')[0] || 'audio/webm';

      const blob = new Blob(chunks, { type: cleanMime });
      const arrayBuffer = await blob.arrayBuffer();
      const uint8 = new Uint8Array(arrayBuffer);
      let binary = '';
      for (let i = 0; i < uint8.length; i += 8192) {
        binary += String.fromCharCode(...uint8.slice(i, i + 8192));
      }
      const base64 = btoa(binary);

      const data = await safeVoiceChat({
        audio_base64: base64,
        text_override: transcript || undefined,
        mime_type: cleanMime,
        language: selectedLangRef.current,
        voice: selectedVoiceRef.current,
        conversation_history: conversationHistoryRef.current,
      });

      if (!data || data.error) throw new Error(data?.error || 'No response');

      if (data.no_speech) {
        isBusyRef.current = false;
        setStatusBoth('idle');
        setPhase('stopped');
        restartListeningSoon(250);
        return;
      }

      if (data.transcription && data.ai_text) {
        conversationHistoryRef.current = [
          ...conversationHistoryRef.current,
          { role: 'user', content: data.transcription },
          { role: 'assistant', content: data.ai_text },
        ].slice(-12);
        const now = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
        setChatMessages((current) => [
          ...current,
          { role: 'user', text: data.transcription, time: now },
          { role: 'assistant', text: data.ai_text, time: now },
        ].slice(-12));
      }

      if (data.ai_text) {
        setAiText(data.ai_text);
        setStatusBoth('speaking');
        setPhase('speaking');
        if (data.speech_url) await playAudio(data.speech_url);
        else await speakText(data.ai_text);
      }

    } catch (err) {
      console.error('[AITalk] processAudio error:', err);
      // Don't show error for network glitches — just retry listening
    }

    isBusyRef.current = false;
    setStatusBoth('idle');
    setPhase('stopped');
    restartListeningSoon(250);
  };

  // ── PLAY GREETING (stored in ref) ──
  playGreetingRef.current = async (lang) => {
    if (isBusyRef.current) return;
    const greetingLang = lang || selectedLangRef.current;
    const localGreeting = getGreeting(greetingLang);
    isBusyRef.current = true;
    setErrorMsg('');
    setAiText(localGreeting);
    setStatusBoth('thinking');
    setPhase('thinking');
    try {
      const data = await safeVoiceChat({
        is_greeting: true,
        language: greetingLang,
        voice: selectedVoiceRef.current,
        mime_type: 'audio/webm',
      });
      const nextText = data?.ai_text || localGreeting;
      setAiText(nextText);
      setStatusBoth('speaking');
      setPhase('speaking');
      if (data?.speech_url) await playAudio(data.speech_url);
      else await speakText(nextText);
    } catch (err) {
      console.error('[AITalk] greeting error:', err);
      setStatusBoth('speaking');
      setPhase('speaking');
      await speakText(localGreeting);
    }
    isBusyRef.current = false;
    setStatusBoth('idle');
    setPhase('stopped');
    await refreshMicPermission();
    if (!autoMicAttemptedRef.current) {
      autoMicAttemptedRef.current = true;
      setTimeout(() => requestMicAccess(), 180);
    }
  };

  // ── INIT — start stable voice mode immediately ──
  useEffect(() => {
    voiceModeRef.current = 'openai-tts';
    const t = setTimeout(() => playGreetingRef.current?.(selectedLangRef.current), 80);
    return () => {
      clearTimeout(t);
      fullCleanup();
    };
  }, []);

  // ── Language change — play greeting in new language ──
  const isFirstLangRender = useRef(true);
  useEffect(() => {
    if (isFirstLangRender.current) { isFirstLangRender.current = false; return; }
    // interrupt whatever is happening
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    stopMic();
    stopRealtime();
    isBusyRef.current = false;
    setStatusBoth('idle');
    voiceModeRef.current = 'openai-tts';
    playGreetingRef.current?.(selectedLang);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLang]);

  // ── TEXT MODE ──
  const sendTextMessage = async () => {
    const text = textInput.trim();
    if (!text || isBusyRef.current) return;
    isBusyRef.current = true;
    setTextInput('');
    const now = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    setChatMessages((current) => [...current, { role: 'user', text, time: now }].slice(-12));
    setStatusBoth('thinking');
    setPhase('thinking');

    try {
      const data = await safeVoiceChat({
        text_override: text,
        mime_type: 'audio/webm',
        language: selectedLangRef.current,
        voice: selectedVoiceRef.current,
        conversation_history: conversationHistoryRef.current,
      });
      if (!data || data.error) throw new Error(data?.error || 'No response');

      if (text && data.ai_text) {
        conversationHistoryRef.current = [
          ...conversationHistoryRef.current,
          { role: 'user', content: text },
          { role: 'assistant', content: data.ai_text },
        ].slice(-12);
        const replyTime = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
        setChatMessages((current) => [...current, { role: 'assistant', text: data.ai_text, time: replyTime }].slice(-12));
      }

      if (data.ai_text) {
        setAiText(data.ai_text);
        setStatusBoth('speaking');
        setPhase('speaking');
        if (data.speech_url) await playAudio(data.speech_url);
        else await speakText(data.ai_text);
      }
    } catch (err) {
      console.error('[AITalk] sendText error:', err);
    }

    isBusyRef.current = false;
    setStatusBoth('idle');
    setPhase('stopped');
  };

  const handleClose = () => {
    fullCleanup();
    setPhase('stopped');
    close();
    if (onClose) onClose();
  };

  const hasPlayedGreetingRef = useRef(false);

  const handleCircleClick = () => {
    if (status === 'thinking') return;
    if (status === 'speaking') {
      interruptRealtime();
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
      isBusyRef.current = false;
      setAiText('');
      setStatusBoth('idle');
      return;
    }
    if (status === 'listening' && realtimeReadyRef.current) return;
    if (status === 'listening') { triggerSendRef.current?.(); return; }
    if (status === 'idle') {
      voiceModeRef.current = 'openai-tts';
      setMicBlocked(false);
      setErrorMsg('');
      if (micPrimedRef.current || micPermission === 'granted') startListeningRef.current?.();
      else requestMicAccess();
      return;
    }
  };

  // ── VISUAL ──
  const circleScale = status === 'listening' ? 1 + voiceLevel * 0.12 : status === 'speaking' ? 1.04 : 0.9;

  const statusLabel = status === 'listening' ? 'Listening...'
    : status === 'thinking' ? 'Thinking...'
    : status === 'speaking' ? 'Speaking...'
    : micBlocked ? 'Microphone blocked' : 'Voice ready';

  const statusColor = status === 'speaking' ? '#FF8C00'
    : status === 'listening' ? '#A855F7'
    : status === 'thinking' ? '#60A5FA'
    : (isLight ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.4)');

  const orbColors = {
    speaking: { conic: '#FF6A00, #FF2D55, #C100FF, #FF6A00', mid: 'rgba(255,200,80,0.9) 0%, rgba(255,60,100,0.7) 40%, rgba(193,0,255,0.5) 80%' },
    listening: { conic: '#7C3AED, #C100FF, #FF2D55, #7C3AED', mid: 'rgba(200,100,255,0.9) 0%, rgba(124,58,237,0.7) 40%, rgba(255,45,85,0.4) 80%' },
    thinking: { conic: '#3B82F6, #8B5CF6, #C100FF, #3B82F6', mid: 'rgba(96,165,250,0.9) 0%, rgba(139,92,246,0.7) 40%, rgba(193,0,255,0.5) 80%' },
    idle: { conic: '#2a2a3a, #3a2a4a, #2a2a3a', mid: 'rgba(80,60,120,0.8) 0%, rgba(30,20,50,0.9) 70%' },
  };
  const orb = orbColors[status] || orbColors.idle;

  return (
    <div className="spicey-talk-redesign-root" style={{
      position: 'fixed',
      inset: 0,
      background: isLight
        ? 'radial-gradient(circle at 18% 4%, rgba(255,106,0,0.16), transparent 30%), radial-gradient(circle at 88% 12%, rgba(255,45,143,0.16), transparent 32%), radial-gradient(circle at 54% 92%, rgba(139,44,255,0.13), transparent 36%), linear-gradient(180deg, #fffafd 0%, #fff4fa 48%, #ffffff 100%)'
        : '#000000',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      <div className={`spicey-talk-chat-ui ${isLight ? 'is-light' : 'is-dark'} ${inputFocused ? 'is-keyboard' : ''}`}>
        <div className="talk-bg-wave talk-bg-wave-left" />
        <div className="talk-bg-wave talk-bg-wave-right" />

        <div className="talk-phone-status" aria-hidden="true">
          <span>9:41</span>
          <span className="talk-phone-icons">▮▮▮ ◖◗ ▰</span>
        </div>

        <header className="talk-ref-header">
          <button type="button" className="talk-round-btn talk-back" onClick={handleClose} aria-label="Back">‹</button>
          <button type="button" className="talk-round-btn talk-menu" onClick={() => setShowVoicePicker(true)} aria-label="Voice menu">•••</button>
        </header>

        <section className="talk-ai-identity">
          <div className="talk-ai-orb">
            <img src="/spicey-assets/spicey-s-symbol.svg" alt="" />
          </div>
          <h1>Spicey AI <span>✓</span></h1>
          <p><i /> Online</p>
          <b>Today</b>
        </section>

        <main className="talk-message-stream">
          {chatMessages.map((message, index) => (
            <div key={`${message.role}-${index}`} className={`talk-message-row ${message.role === 'user' ? 'is-user' : 'is-ai'}`}>
              {message.role === 'assistant' && (
                <span className="talk-message-avatar">
                  <img src="/spicey-assets/spicey-s-symbol.svg" alt="" />
                </span>
              )}
              <div className="talk-bubble">
                <span>{message.text}</span>
                <small>{message.time}{message.role === 'user' ? ' ✓✓' : ''}</small>
              </div>
            </div>
          ))}
          {status === 'thinking' && (
            <div className="talk-message-row is-ai">
              <span className="talk-message-avatar"><img src="/spicey-assets/spicey-s-symbol.svg" alt="" /></span>
              <div className="talk-bubble talk-thinking"><span>Thinking...</span><small>now</small></div>
            </div>
          )}
        </main>

        <form
          className="talk-ref-input"
          onSubmit={(event) => {
            event.preventDefault();
            sendTextMessage();
          }}
        >
          <button type="button" className="talk-plus-btn" onClick={() => setShowLangPicker(true)} aria-label="Language">+</button>
          <div className="talk-input-pill">
            <input
              value={textInput}
              onChange={(event) => setTextInput(event.target.value)}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
              placeholder="Type a message..."
            />
            <button type="button" className={`talk-mini-mic ${status === 'listening' ? 'active' : ''}`} onClick={handleCircleClick} aria-label="Microphone">
              <Mic size={22} />
            </button>
          </div>
          <button type="submit" className="talk-spark-btn" aria-label="Send">
            <Sparkles size={24} />
          </button>
        </form>
      </div>

      {isLight && <div style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        opacity: 0.42,
        backgroundImage:
          'linear-gradient(rgba(255,45,143,0.16) 1px, transparent 1px), linear-gradient(90deg, rgba(139,44,255,0.14) 1px, transparent 1px)',
        backgroundSize: '34px 34px',
        maskImage: 'linear-gradient(180deg, transparent 0%, #000 18%, #000 76%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(180deg, transparent 0%, #000 18%, #000 76%, transparent 100%)',
      }} />}
      {isLight && <div style={{
        position: 'absolute',
        left: '-28%',
        top: '20%',
        width: '156%',
        height: 130,
        pointerEvents: 'none',
        background: 'linear-gradient(90deg, transparent 0%, rgba(255,106,0,0.0) 10%, rgba(255,106,0,0.26) 32%, rgba(255,45,143,0.26) 50%, rgba(139,44,255,0.24) 68%, transparent 100%)',
        filter: 'blur(24px)',
        transform: 'rotate(-15deg)',
        animation: 'talk-light-sweep 7s ease-in-out infinite alternate',
      }} />}
      {isLight && <div style={{
        position: 'absolute',
        right: -80,
        bottom: 108,
        width: 220,
        height: 220,
        borderRadius: '50%',
        pointerEvents: 'none',
        background: 'radial-gradient(circle, rgba(255,45,143,0.30), rgba(139,44,255,0.14) 38%, transparent 70%)',
        filter: 'blur(10px)',
        animation: 'talk-float 6s ease-in-out infinite',
      }} />}
      {isLight && <div style={{
        position: 'absolute',
        left: -70,
        top: 120,
        width: 190,
        height: 190,
        borderRadius: '50%',
        pointerEvents: 'none',
        background: 'radial-gradient(circle, rgba(255,106,0,0.24), rgba(255,45,85,0.10) 45%, transparent 72%)',
        filter: 'blur(12px)',
        animation: 'talk-float 7s ease-in-out infinite reverse',
      }} />}

      {/* Top Bar */}
      <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', paddingTop: 'max(20px, env(safe-area-inset-top))' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 10,
          color: isLight ? '#24112f' : '#fff',
          fontSize: 15,
          fontWeight: 900,
          letterSpacing: 1.8,
          padding: '6px 12px 6px 6px',
          borderRadius: 999,
          background: isLight ? 'rgba(255,255,255,0.68)' : 'rgba(0,0,0,0.72)',
          border: isLight ? '1px solid rgba(255,255,255,0.86)' : '1px solid rgba(255,255,255,0.12)',
          boxShadow: isLight ? '0 12px 28px rgba(233,30,140,0.18)' : 'none',
          backdropFilter: 'blur(14px) saturate(1.14)',
          WebkitBackdropFilter: 'blur(14px) saturate(1.14)'
        }}>
          <img
            src="/spicey-assets/spicey-s-symbol.svg"
            alt=""
            style={{
              width: 38,
              height: 38,
              objectFit: 'contain',
              objectPosition: 'center',
              filter: isLight
                ? 'drop-shadow(0 0 9px rgba(255,45,143,0.28))'
                : 'drop-shadow(0 0 8px rgba(255,45,143,0.40))',
            }}
          />
          <span style={{
            whiteSpace: 'nowrap',
            fontStyle: 'italic',
            background: 'linear-gradient(92deg, #ff8a00 0%, #ff2d8f 46%, #b733ff 100%)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
            textShadow: isLight ? 'none' : '0 0 1px rgba(255,255,255,0.18)'
          }}>SPICEY AI</span>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <button onClick={() => setShowVoicePicker(true)} style={pillStyle('#FF6A00')}>
            {VOICE_OPTIONS.find(v => v.id === selectedVoice)?.name}
          </button>
          <button onClick={() => setShowLangPicker(true)} style={pillStyle('#FF6A00')}>
            {SUPPORTED_LANGUAGES.find(l => l.code === selectedLang)?.name}
          </button>
          <button onClick={handleClose} style={{
            background: isLight ? 'rgba(255,255,255,0.66)' : 'rgba(255,255,255,0.10)',
            border: isLight ? '1px solid rgba(255,255,255,0.84)' : '1px solid rgba(255,255,255,0.14)',
            borderRadius: '50%',
            width: 36,
            height: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: isLight ? '#24112f' : 'rgba(255,255,255,0.82)',
            fontSize: 16,
            cursor: 'pointer',
            boxShadow: isLight ? '0 10px 22px rgba(78,36,64,0.12)' : '0 12px 24px rgba(0,0,0,0.25)',
            backdropFilter: 'blur(14px) saturate(1.12)',
            WebkitBackdropFilter: 'blur(14px) saturate(1.12)'
          }}>✕</button>
        </div>
      </div>

      {/* Main */}
      <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 18px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          gap: 8,
          width: 'min(360px, 100%)',
          marginBottom: 24,
        }}>
          {[
            { label: 'Signal', value: status === 'listening' ? 'Live' : status === 'speaking' ? 'Voice' : 'Ready' },
            { label: 'Mode', value: status === 'thinking' ? 'Sync' : 'AI' },
            { label: 'Voice', value: VOICE_OPTIONS.find(v => v.id === selectedVoice)?.name || 'Sage' },
          ].map((item) => (
            <div key={item.label} style={{
              minHeight: 54,
              padding: '9px 10px',
              borderRadius: 16,
              background: isLight ? 'rgba(255,255,255,0.58)' : 'rgba(255,255,255,0.075)',
              border: isLight ? '1px solid rgba(255,255,255,0.80)' : '1px solid rgba(255,255,255,0.10)',
              boxShadow: isLight ? '0 12px 26px rgba(80,35,68,0.10)' : '0 14px 30px rgba(0,0,0,0.24)',
              backdropFilter: 'blur(16px) saturate(1.14)',
              WebkitBackdropFilter: 'blur(16px) saturate(1.14)',
            }}>
              <div style={{ color: isLight ? 'rgba(36,17,47,0.48)' : 'rgba(255,255,255,0.42)', fontSize: 8, fontWeight: 900, letterSpacing: 1.3, textTransform: 'uppercase' }}>{item.label}</div>
              <div style={{ marginTop: 4, color: isLight ? '#24112f' : '#fff', fontSize: 13, fontWeight: 900, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.value}</div>
            </div>
          ))}
        </div>

        {/* Orb */}
        <button onClick={handleCircleClick} disabled={status === 'thinking'}
          style={{
            position: 'relative',
            width: 'min(238px, 62vw)', height: 'min(238px, 62vw)',
            borderRadius: '50%', border: 'none', background: 'transparent',
            cursor: status === 'thinking' ? 'default' : 'pointer',
            WebkitTapHighlightColor: 'transparent', outline: 'none',
            transform: `scale(${circleScale})`,
            transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}>
          <div style={{
            position: 'absolute',
            inset: -38,
            borderRadius: '50%',
            border: '1px solid rgba(255,255,255,0.14)',
            background: 'conic-gradient(from 90deg, rgba(255,106,0,0.0), rgba(255,106,0,0.34), rgba(255,45,143,0.0), rgba(139,44,255,0.32), rgba(255,106,0,0.0))',
            maskImage: 'radial-gradient(circle, transparent 58%, #000 59%, #000 62%, transparent 63%)',
            WebkitMaskImage: 'radial-gradient(circle, transparent 58%, #000 59%, #000 62%, transparent 63%)',
            animation: 'orb-spin 9s linear infinite',
          }} />
          <div style={{
            position: 'absolute',
            inset: -20,
            borderRadius: '50%',
            border: '1px solid rgba(255,255,255,0.16)',
            boxShadow: status === 'idle'
              ? '0 0 34px rgba(139,44,255,0.18)'
              : '0 0 54px rgba(255,45,143,0.28), inset 0 0 28px rgba(255,106,0,0.10)',
            animation: status === 'idle' ? 'talk-ring-breathe 4s ease-in-out infinite' : 'talk-ring-breathe 2.4s ease-in-out infinite',
          }} />
          {/* Glow */}
          <div style={{
            position: 'absolute', inset: -18, borderRadius: '50%',
            background: `radial-gradient(circle, ${status === 'speaking' ? 'rgba(255,140,0,0.30)' : status === 'listening' ? 'rgba(193,0,255,0.30)' : 'rgba(139,44,255,0.18)'} 0%, transparent 70%)`,
            filter: 'blur(18px)',
            animation: (status === 'listening' || status === 'speaking') ? 'orb-pulse 3s ease-in-out infinite' : 'none',
          }} />
          {/* Conic base */}
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            background: `conic-gradient(from 0deg, ${orb.conic})`,
            filter: 'blur(22px)',
            animation: status !== 'idle' ? 'orb-spin 4s linear infinite' : 'none',
          }} />
          {/* Mid blob */}
          <div style={{
            position: 'absolute', inset: 6, borderRadius: '50%',
            background: `radial-gradient(ellipse at 35% 30%, ${orb.mid})`,
            filter: 'blur(18px)',
          }} />
          {/* Shine */}
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            background: 'radial-gradient(ellipse at 28% 22%, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.08) 45%, transparent 65%)',
            pointerEvents: 'none',
          }} />
          {/* Inner glass */}
          <div style={{
            position: 'absolute', inset: 18, borderRadius: '50%',
            background: isLight ? 'rgba(255,255,255,0.20)' : 'rgba(255,255,255,0.075)',
            backdropFilter: 'blur(10px) saturate(1.2)',
            WebkitBackdropFilter: 'blur(10px) saturate(1.2)',
            border: '1px solid rgba(255,255,255,0.22)',
            pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute',
            inset: 48,
            display: 'grid',
            placeItems: 'center',
            borderRadius: '50%',
            color: '#fff',
            fontSize: 13,
            fontWeight: 950,
            letterSpacing: 1.8,
            textTransform: 'uppercase',
            textShadow: '0 2px 10px rgba(0,0,0,0.32)',
            pointerEvents: 'none',
          }}>
            {status === 'listening' ? 'Listen' : status === 'speaking' ? 'Speak' : status === 'thinking' ? 'Think' : 'Tap'}
          </div>
        </button>

        {/* Waveform */}
        {status === 'listening' && (
          <div style={{ marginTop: 44, display: 'flex', alignItems: 'center', gap: 4, height: 44 }}>
            {[0.3,0.6,0.9,0.7,1.0,0.8,0.5,0.9,0.6,0.4,0.7,0.3].map((b, i) => (
              <div key={i} style={{
                width: 3, borderRadius: 4, background: 'rgba(168,85,247,0.85)',
                height: `${6 + (b + voiceLevel) * 26}px`,
                transition: 'height 0.08s ease',
                animation: `ai-wave ${0.45 + i * 0.06}s ease-in-out infinite alternate`,
              }} />
            ))}
          </div>
        )}

        {/* Thinking dots */}
        {status === 'thinking' && (
          <div style={{ marginTop: 44, display: 'flex', gap: 10, alignItems: 'center' }}>
            {[0,1,2].map(i => (
              <div key={i} style={{
                width: 10, height: 10, borderRadius: '50%', background: '#60A5FA',
                animation: `ai-dot 0.9s ease-in-out ${i * 0.18}s infinite`,
              }} />
            ))}
          </div>
        )}

        {/* Speaking bars */}
        {status === 'speaking' && (
          <div style={{ marginTop: 44, display: 'flex', alignItems: 'center', gap: 4, height: 44 }}>
            {[0.5,0.8,1.0,0.6,0.9,0.7,1.0,0.5,0.8,0.6].map((b, i) => (
              <div key={i} style={{
                width: 3, borderRadius: 4, background: '#FF8C00',
                animation: `ai-speak ${0.38 + i * 0.05}s ease-in-out infinite alternate`,
              }} />
            ))}
          </div>
        )}

        {/* AI Text */}
        {aiText && (
          <div style={{ marginTop: 32, textAlign: 'center', padding: '0 28px', maxWidth: 400 }}>
            <div style={{ fontSize: 17, fontWeight: 600, color: isLight ? '#111' : '#fff', lineHeight: 1.55 }}>
              {aiText}
            </div>
          </div>
        )}

        {/* Status */}
        <div style={{
          marginTop: 28,
          textAlign: 'center',
          width: 'min(360px, 100%)',
          padding: '14px 16px',
          borderRadius: 24,
          background: isLight ? 'rgba(255,255,255,0.54)' : 'rgba(255,255,255,0.07)',
          border: isLight ? '1px solid rgba(255,255,255,0.78)' : '1px solid rgba(255,255,255,0.10)',
          boxShadow: isLight ? '0 16px 30px rgba(80,35,68,0.11)' : '0 18px 34px rgba(0,0,0,0.25)',
          backdropFilter: 'blur(18px) saturate(1.18)',
          WebkitBackdropFilter: 'blur(18px) saturate(1.18)',
        }}>
          <div style={{ fontSize: 15, fontWeight: 900, color: statusColor, transition: 'color 0.3s' }}>
            {statusLabel}
          </div>
          {status === 'listening' && (
            <div style={{ fontSize: 12, marginTop: 4, color: isLight ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.3)' }}>
              Auto-sends when you pause
            </div>
          )}
          {status === 'speaking' && (
            <div style={{ fontSize: 12, marginTop: 4, color: isLight ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.3)' }}>
              Tap to interrupt
            </div>
          )}
          {micPermission === 'denied' && (
            <div style={{ fontSize: 11, marginTop: 8, color: isLight ? 'rgba(0,0,0,0.46)' : 'rgba(255,255,255,0.42)', maxWidth: 320, lineHeight: 1.35 }}>
              Browser already blocked it. Allow microphone for 127.0.0.1 in site settings.
            </div>
          )}
          {errorMsg && (
            <div style={{ fontSize: 11, color: 'rgba(255,100,100,0.82)', marginTop: 6, maxWidth: 320, lineHeight: 1.35 }}>{errorMsg}</div>
          )}
        </div>

        <div style={{ marginTop: 14, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: isLight ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.15)' }}>
          Powered by OpenAI
        </div>
      </div>

      {/* Text fallback */}
      <div style={{ position: 'relative', zIndex: 2, padding: '0 16px', paddingBottom: 'calc(96px + env(safe-area-inset-bottom, 0px))', flexShrink: 0 }}>
          <div style={{
            background: isLight
              ? 'linear-gradient(180deg, rgba(255,255,255,0.76), rgba(255,246,252,0.58))'
              : 'linear-gradient(180deg, rgba(255,255,255,0.10), rgba(255,255,255,0.055))',
            border: `1px solid ${isLight ? 'rgba(255,255,255,0.82)' : 'rgba(255,255,255,0.13)'}`,
            borderRadius: 24,
            padding: '6px 6px 6px 15px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            boxShadow: isLight
              ? 'inset 0 1px 0 rgba(255,255,255,0.92), 0 16px 34px rgba(80,35,68,0.13)'
              : 'inset 0 1px 0 rgba(255,255,255,0.10), 0 18px 36px rgba(0,0,0,0.30), 0 0 28px rgba(255,45,143,0.08)',
            backdropFilter: 'blur(20px) saturate(1.18)',
            WebkitBackdropFilter: 'blur(20px) saturate(1.18)',
          }}>
            <span style={{
              fontSize: 10,
              color: isLight ? 'rgba(36,17,47,0.52)' : 'rgba(255,255,255,0.46)',
              flexShrink: 0,
              fontWeight: 900,
              letterSpacing: 1.2,
              textTransform: 'uppercase'
            }}>Type</span>
            <input value={textInput} onChange={e => setTextInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendTextMessage()}
              placeholder="Type your message..."
              style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 14, color: isLight ? '#111' : '#fff' }} />
            <button onClick={sendTextMessage} disabled={!textInput.trim() || status === 'thinking' || status === 'speaking'}
              style={{
                background: 'radial-gradient(circle at 30% 18%, rgba(255,255,255,0.34), transparent 30%), linear-gradient(135deg, #FF6A00, #FF2D8F 55%, #8B2CFF)',
                border: 'none',
                borderRadius: 18,
                padding: '10px 16px',
                color: '#fff',
                fontSize: 13,
                fontWeight: 900,
                cursor: 'pointer',
                opacity: (!textInput.trim() || status !== 'idle') ? 0.5 : 1,
                boxShadow: '0 10px 24px rgba(255,45,143,0.28)',
              }}>
              Send
            </button>
          </div>
        </div>

      {/* Voice Picker */}
      {showVoicePicker && (
        <PickerModal title="Select Voice" onClose={() => setShowVoicePicker(false)} isLight={isLight}>
          {VOICE_OPTIONS.map(v => (
            <div key={v.id} onClick={() => { setSelectedVoice(v.id); setShowVoicePicker(false); }}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px', borderRadius: 12, cursor: 'pointer', background: selectedVoice === v.id ? 'rgba(255,106,0,0.15)' : 'transparent' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, color: isLight ? '#000' : '#fff' }}>{v.name}</div>
                <div style={{ fontSize: 12, color: isLight ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.5)' }}>{v.desc}</div>
              </div>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  previewVoice(v.id);
                }}
                disabled={Boolean(previewingVoice)}
                style={{
                  border: 'none',
                  borderRadius: 999,
                  padding: '7px 11px',
                  color: '#fff',
                  background: previewingVoice === v.id ? 'rgba(255,106,0,.55)' : 'linear-gradient(135deg, #FF6A00, #E91E8C)',
                  fontSize: 11,
                  fontWeight: 800,
                  cursor: previewingVoice ? 'default' : 'pointer',
                  opacity: previewingVoice && previewingVoice !== v.id ? .45 : 1,
                }}
              >
                {previewingVoice === v.id ? 'Playing' : 'Play'}
              </button>
              {selectedVoice === v.id && <span style={{ color: '#FF6A00' }}>✓</span>}
            </div>
          ))}
        </PickerModal>
      )}

      {/* Language Picker */}
      {showLangPicker && (
        <PickerModal title="Select Language" onClose={() => setShowLangPicker(false)} isLight={isLight} scrollable>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 8 }}>
            {SUPPORTED_LANGUAGES.map(lang => (
              <button key={lang.code} onClick={() => { setSelectedLang(lang.code); setShowLangPicker(false); }}
                style={{ background: selectedLang === lang.code ? 'rgba(255,106,0,0.2)' : (isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.05)'), border: selectedLang === lang.code ? '2px solid rgba(255,106,0,0.6)' : (isLight ? '1px solid rgba(0,0,0,0.08)' : '1px solid rgba(255,255,255,0.08)'), borderRadius: 12, padding: 12, color: isLight ? '#000' : '#fff', fontSize: 13, cursor: 'pointer' }}>
                {lang.name}
              </button>
            ))}
          </div>
        </PickerModal>
      )}

      <style>{`
        .spicey-talk-chat-ui {
          position: absolute;
          inset: 0;
          z-index: 50;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          color: #fff;
          background:
            radial-gradient(circle at 50% 0%, rgba(255,45,143,.19), transparent 24%),
            radial-gradient(circle at 92% 20%, rgba(120,45,255,.14), transparent 30%),
            linear-gradient(180deg, #02030b 0%, #040511 48%, #010208 100%);
          font-family: Inter, Avenir Next, system-ui, sans-serif;
        }
        .spicey-talk-chat-ui.is-light {
          color: #120f18;
          background:
            radial-gradient(circle at 22% 0%, rgba(255,122,24,.13), transparent 24%),
            radial-gradient(circle at 86% 18%, rgba(255,45,143,.13), transparent 28%),
            linear-gradient(180deg, #fff 0%, #fff9fd 48%, #fff 100%);
        }
        .talk-bg-wave {
          position: absolute;
          top: 76px;
          width: 65vw;
          height: 160px;
          pointer-events: none;
          filter: blur(2px);
          opacity: .78;
          background: linear-gradient(90deg, transparent, rgba(255,45,143,.65), rgba(255,122,24,.55), transparent);
          clip-path: polygon(0 46%, 18% 36%, 38% 54%, 62% 31%, 82% 48%, 100% 42%, 100% 58%, 82% 65%, 62% 50%, 38% 71%, 18% 53%, 0 64%);
        }
        .talk-bg-wave-left {
          left: -15vw;
          transform: rotate(-9deg);
        }
        .talk-bg-wave-right {
          right: -14vw;
          background: linear-gradient(90deg, transparent, rgba(139,53,255,.62), rgba(255,45,143,.50), transparent);
          transform: rotate(8deg) scaleX(-1);
        }
        .spicey-talk-chat-ui.is-light .talk-bg-wave {
          opacity: .22;
        }
        .talk-ref-header {
          position: relative;
          z-index: 3;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: max(20px, env(safe-area-inset-top)) 20px 0;
          min-height: 70px;
        }
        .talk-round-btn {
          width: 52px;
          height: 52px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,.08);
          color: #ff2d8f;
          background: rgba(255,255,255,.06);
          box-shadow: inset 0 1px 0 rgba(255,255,255,.08), 0 14px 30px rgba(0,0,0,.26);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          font-size: 38px;
          line-height: 1;
          cursor: pointer;
        }
        .talk-menu {
          color: #fff;
          font-size: 20px;
          letter-spacing: 2px;
        }
        .spicey-talk-chat-ui.is-light .talk-round-btn {
          border-color: rgba(255,45,143,.10);
          background: rgba(255,255,255,.78);
          box-shadow: 0 12px 28px rgba(60,28,70,.11);
        }
        .spicey-talk-chat-ui.is-light .talk-menu {
          color: #1a1421;
        }
        .talk-ai-identity {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
          flex: 0 0 auto;
          margin-top: -8px;
        }
        .talk-ai-orb {
          width: 132px;
          height: 132px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background:
            radial-gradient(circle at 34% 22%, rgba(255,255,255,.12), transparent 28%),
            linear-gradient(145deg, rgba(10,5,17,.96), rgba(2,2,8,.98));
          border: 1px solid rgba(255,255,255,.12);
          box-shadow: 0 0 36px rgba(255,45,143,.26), 0 0 62px rgba(139,53,255,.18), inset 0 1px 0 rgba(255,255,255,.10);
        }
        .talk-ai-orb img {
          width: 92px;
          height: 92px;
          object-fit: contain;
          filter: drop-shadow(0 0 18px rgba(255,45,143,.55));
        }
        .talk-ai-identity h1 {
          margin: 10px 0 4px;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          color: inherit;
          font-size: 26px;
          line-height: 1;
          font-weight: 900;
          letter-spacing: 0;
        }
        .talk-ai-identity h1 span {
          width: 21px;
          height: 21px;
          display: inline-grid;
          place-items: center;
          border-radius: 50%;
          color: #fff;
          background: #8b35ff;
          font-size: 13px;
        }
        .talk-ai-identity p {
          margin: 0;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          color: rgba(255,255,255,.86);
          font-size: 16px;
          font-weight: 500;
        }
        .talk-ai-identity p i {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #10e26b;
          box-shadow: 0 0 10px rgba(16,226,107,.6);
        }
        .talk-ai-identity b {
          margin-top: 28px;
          padding: 9px 20px;
          border-radius: 15px;
          color: rgba(255,255,255,.88);
          background: rgba(255,255,255,.07);
          font-size: 15px;
          font-weight: 700;
        }
        .spicey-talk-chat-ui.is-light .talk-ai-identity p,
        .spicey-talk-chat-ui.is-light .talk-ai-identity b {
          color: rgba(18,15,24,.76);
        }
        .spicey-talk-chat-ui.is-light .talk-ai-orb {
          background: #fff;
          box-shadow: 0 20px 42px rgba(255,45,143,.16);
        }
        .spicey-talk-chat-ui.is-light .talk-ai-identity b {
          background: rgba(255,255,255,.86);
          box-shadow: 0 8px 24px rgba(60,28,70,.10);
        }
        .talk-message-stream {
          position: relative;
          z-index: 2;
          flex: 1 1 auto;
          min-height: 0;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
          padding: 16px 20px 116px;
          scrollbar-width: none;
        }
        .talk-message-stream::-webkit-scrollbar {
          display: none;
        }
        .talk-message-row {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin: 0 0 20px;
        }
        .talk-message-row.is-user {
          justify-content: flex-end;
        }
        .talk-message-avatar {
          width: 58px;
          height: 58px;
          flex: 0 0 58px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: #070713;
          border: 2px solid transparent;
          background-image:
            linear-gradient(#070713, #070713),
            linear-gradient(135deg, #7d2dff, #ff1471 50%, #ff8a18);
          background-origin: border-box;
          background-clip: padding-box, border-box;
          box-shadow: 0 0 18px rgba(255,45,143,.20);
        }
        .talk-message-avatar img {
          width: 39px;
          height: 39px;
          object-fit: contain;
        }
        .talk-bubble {
          max-width: min(72vw, 470px);
          padding: 18px 20px 14px;
          border-radius: 22px;
          white-space: pre-line;
          color: #fff;
          background: linear-gradient(145deg, rgba(20,23,35,.94), rgba(10,12,22,.94));
          border: 1px solid rgba(255,255,255,.08);
          box-shadow: inset 0 1px 0 rgba(255,255,255,.05), 0 16px 30px rgba(0,0,0,.20);
        }
        .talk-message-row.is-ai .talk-bubble {
          border-left-color: rgba(255,122,24,.60);
          border-bottom-left-radius: 5px;
        }
        .talk-message-row.is-user .talk-bubble {
          max-width: min(58vw, 390px);
          border: 0;
          border-bottom-right-radius: 5px;
          background: linear-gradient(135deg, #c510c9 0%, #ff2d72 54%, #ff8a18 100%);
          box-shadow: 0 18px 34px rgba(255,45,143,.20);
        }
        .talk-bubble span {
          display: block;
          font-size: 19px;
          line-height: 1.43;
          font-weight: 500;
          letter-spacing: 0;
        }
        .talk-bubble small {
          display: block;
          margin-top: 10px;
          color: rgba(255,255,255,.52);
          font-size: 13px;
          line-height: 1;
        }
        .talk-message-row.is-user .talk-bubble small {
          color: rgba(255,255,255,.86);
          text-align: right;
        }
        .spicey-talk-chat-ui.is-light .talk-bubble {
          color: #111018;
          background: #fff;
          border-color: rgba(20,16,28,.04);
          box-shadow: 0 18px 36px rgba(45,26,70,.10);
        }
        .spicey-talk-chat-ui.is-light .talk-message-row.is-user .talk-bubble {
          color: #fff;
          background: linear-gradient(135deg, #c510c9 0%, #ff2d72 54%, #ff8a18 100%);
        }
        .spicey-talk-chat-ui.is-light .talk-bubble small {
          color: rgba(17,16,24,.46);
        }
        .spicey-talk-chat-ui.is-light .talk-message-row.is-user .talk-bubble small {
          color: rgba(255,255,255,.86);
        }
        .talk-ref-input {
          position: absolute;
          left: 20px;
          right: 20px;
          bottom: max(22px, env(safe-area-inset-bottom));
          z-index: 5;
          display: grid;
          grid-template-columns: 58px minmax(0, 1fr) 58px;
          align-items: center;
          gap: 12px;
          padding: 12px;
          border-radius: 34px;
          background: rgba(5,6,15,.92);
          border: 1px solid rgba(255,255,255,.10);
          box-shadow: 0 18px 42px rgba(0,0,0,.36), inset 0 1px 0 rgba(255,255,255,.06);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
        }
        .spicey-talk-chat-ui.is-light .talk-ref-input {
          background: rgba(255,255,255,.92);
          border-color: rgba(255,45,143,.10);
          box-shadow: 0 18px 42px rgba(60,28,70,.12);
        }
        .talk-plus-btn,
        .talk-spark-btn {
          width: 52px;
          height: 52px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          color: #fff;
          background: rgba(255,255,255,.05);
          border: 1px solid rgba(255,255,255,.12);
          box-shadow: inset 0 1px 0 rgba(255,255,255,.07), 0 0 18px rgba(255,45,143,.12);
          cursor: pointer;
        }
        .talk-plus-btn {
          color: #fff;
          font-size: 34px;
          font-weight: 300;
        }
        .talk-spark-btn {
          color: #fff;
          background:
            radial-gradient(circle at 34% 22%, rgba(255,255,255,.24), transparent 28%),
            linear-gradient(135deg, #7d2dff 0%, #d719d8 50%, #ff8a18 100%);
          box-shadow: 0 0 24px rgba(255,45,143,.34), inset 0 1px 0 rgba(255,255,255,.22);
        }
        .spicey-talk-chat-ui.is-light .talk-plus-btn {
          color: #ff1471;
          background: #fff;
          border-color: rgba(255,45,143,.16);
        }
        .talk-input-pill {
          height: 54px;
          display: flex;
          align-items: center;
          min-width: 0;
          padding: 0 12px 0 22px;
          border-radius: 28px;
          background: rgba(255,255,255,.06);
          border: 1px solid rgba(255,255,255,.07);
        }
        .spicey-talk-chat-ui.is-light .talk-input-pill {
          background: rgba(245,242,248,.92);
          border-color: rgba(23,18,30,.05);
        }
        .talk-input-pill input {
          flex: 1;
          min-width: 0;
          border: 0;
          outline: 0;
          background: transparent;
          color: inherit;
          font-size: 18px;
          font-weight: 500;
        }
        .talk-input-pill input::placeholder {
          color: rgba(255,255,255,.48);
        }
        .spicey-talk-chat-ui.is-light .talk-input-pill input::placeholder {
          color: rgba(18,15,24,.42);
        }
        .talk-mini-mic {
          width: 38px;
          height: 38px;
          display: grid;
          place-items: center;
          border: 0;
          color: #ff1471;
          background: transparent;
          cursor: pointer;
        }
        .talk-mini-mic.active {
          color: #fff;
          border-radius: 50%;
          background: linear-gradient(135deg, #ff1471, #8b35ff);
        }
        @media (max-width: 430px) {
          .talk-ref-header {
            min-height: 62px;
            padding-left: 18px;
            padding-right: 18px;
          }
          .talk-round-btn {
            width: 46px;
            height: 46px;
          }
          .talk-ai-orb {
            width: 116px;
            height: 116px;
          }
          .talk-ai-orb img {
            width: 80px;
            height: 80px;
          }
          .talk-ai-identity h1 {
            font-size: 24px;
          }
          .talk-ai-identity b {
            margin-top: 20px;
          }
          .talk-message-stream {
            padding-left: 16px;
            padding-right: 16px;
            padding-bottom: 104px;
          }
          .talk-message-avatar {
            width: 48px;
            height: 48px;
            flex-basis: 48px;
          }
          .talk-message-avatar img {
            width: 33px;
            height: 33px;
          }
          .talk-bubble {
            max-width: calc(100vw - 100px);
            padding: 15px 17px 12px;
            border-radius: 20px;
          }
          .talk-message-row.is-user .talk-bubble {
            max-width: calc(100vw - 86px);
          }
          .talk-bubble span {
            font-size: 16px;
            line-height: 1.42;
          }
          .talk-bubble small {
            font-size: 11px;
          }
          .talk-ref-input {
            left: 14px;
            right: 14px;
            grid-template-columns: 48px minmax(0, 1fr) 48px;
            gap: 9px;
            padding: 9px;
            border-radius: 29px;
          }
          .talk-plus-btn,
          .talk-spark-btn {
            width: 44px;
            height: 44px;
          }
          .talk-input-pill {
            height: 46px;
            padding-left: 16px;
            padding-right: 8px;
          }
          .talk-input-pill input {
            font-size: 15px;
          }
          .talk-mini-mic {
            width: 34px;
            height: 34px;
          }
        }
        body.spicey-talk-open #bottom-nav {
          display: none !important;
        }
        .spicey-talk-chat-ui {
          left: 50% !important;
          right: auto !important;
          width: min(100vw, 430px) !important;
          height: 100dvh !important;
          transform: translateX(-50%) !important;
          border-left: 1px solid rgba(255,255,255,.06) !important;
          border-right: 1px solid rgba(255,255,255,.06) !important;
          box-shadow: 0 0 80px rgba(0,0,0,.65) !important;
        }
        .talk-ref-header {
          min-height: 62px !important;
          padding: max(18px, env(safe-area-inset-top)) 20px 0 !important;
        }
        .talk-round-btn {
          width: 46px !important;
          height: 46px !important;
          font-size: 34px !important;
          background: rgba(255,255,255,.055) !important;
        }
        .talk-menu {
          font-size: 18px !important;
        }
        .talk-ai-identity {
          margin-top: -6px !important;
        }
        .talk-ai-orb {
          width: 124px !important;
          height: 124px !important;
          background:
            radial-gradient(circle at 50% 48%, rgba(255,45,143,.20), transparent 42%),
            linear-gradient(145deg, rgba(6,4,12,.98), rgba(1,2,8,.98)) !important;
        }
        .talk-ai-orb img {
          width: 88px !important;
          height: 88px !important;
        }
        .talk-ai-identity h1 {
          margin-top: 8px !important;
          font-size: 24px !important;
          font-weight: 850 !important;
        }
        .talk-ai-identity p {
          font-size: 14px !important;
        }
        .talk-ai-identity p i {
          width: 10px !important;
          height: 10px !important;
        }
        .talk-ai-identity b {
          margin-top: 22px !important;
          padding: 7px 18px !important;
          font-size: 14px !important;
        }
        .talk-message-stream {
          padding: 16px 19px 102px !important;
        }
        .talk-message-row {
          gap: 10px !important;
          margin-bottom: 18px !important;
        }
        .talk-message-avatar {
          width: 48px !important;
          height: 48px !important;
          flex-basis: 48px !important;
        }
        .talk-message-avatar img {
          width: 34px !important;
          height: 34px !important;
        }
        .talk-bubble {
          max-width: 292px !important;
          padding: 14px 16px 11px !important;
          border-radius: 18px !important;
          background:
            linear-gradient(145deg, rgba(19,22,34,.96), rgba(9,11,21,.97)) !important;
        }
        .talk-message-row.is-ai .talk-bubble {
          border-bottom-left-radius: 4px !important;
          border-left-color: rgba(255,122,24,.74) !important;
        }
        .talk-message-row.is-user .talk-bubble {
          max-width: 258px !important;
          border-bottom-right-radius: 4px !important;
        }
        .talk-bubble span {
          font-size: 16px !important;
          line-height: 1.42 !important;
          font-weight: 500 !important;
        }
        .talk-bubble small {
          margin-top: 8px !important;
          font-size: 11px !important;
        }
        .talk-ref-input {
          left: 14px !important;
          right: 14px !important;
          bottom: max(14px, env(safe-area-inset-bottom)) !important;
          grid-template-columns: 48px minmax(0, 1fr) 48px !important;
          gap: 9px !important;
          padding: 9px !important;
          border-radius: 30px !important;
          background: rgba(4,5,14,.94) !important;
        }
        .talk-plus-btn,
        .talk-spark-btn {
          width: 44px !important;
          height: 44px !important;
        }
        .talk-input-pill {
          height: 46px !important;
          padding: 0 8px 0 16px !important;
          border-radius: 24px !important;
        }
        .talk-input-pill input {
          font-size: 15px !important;
        }
        .talk-mini-mic {
          width: 34px !important;
          height: 34px !important;
        }
        .spicey-talk-chat-ui.is-keyboard .talk-ref-header {
          min-height: 44px !important;
          padding-top: max(8px, env(safe-area-inset-top)) !important;
        }
        .spicey-talk-chat-ui.is-keyboard .talk-ai-identity {
          transform: scale(.78) translateY(-22px) !important;
          margin-bottom: -48px !important;
        }
        .spicey-talk-chat-ui.is-keyboard .talk-message-stream {
          padding-bottom: 88px !important;
        }
        @media (max-width: 430px) {
          .spicey-talk-chat-ui {
            width: 100vw !important;
            border-left: 0 !important;
            border-right: 0 !important;
            box-shadow: none !important;
          }
        }
        @media (max-height: 760px) {
          .talk-ai-orb {
            width: 104px !important;
            height: 104px !important;
          }
          .talk-ai-orb img {
            width: 74px !important;
            height: 74px !important;
          }
          .talk-ai-identity h1 {
            font-size: 22px !important;
          }
          .talk-ai-identity b {
            margin-top: 14px !important;
          }
          .talk-message-stream {
            padding-top: 12px !important;
          }
          .talk-message-row {
            margin-bottom: 14px !important;
          }
          .talk-bubble span {
            font-size: 15px !important;
          }
        }
        .talk-phone-status {
          position: relative !important;
          z-index: 6 !important;
          display: flex !important;
          align-items: center !important;
          justify-content: space-between !important;
          height: 42px !important;
          padding: max(10px, env(safe-area-inset-top)) 38px 0 !important;
          color: #fff !important;
          font-size: 22px !important;
          line-height: 1 !important;
          font-weight: 850 !important;
          letter-spacing: .01em !important;
        }
        .talk-phone-icons {
          font-size: 17px !important;
          letter-spacing: 2px !important;
          transform: translateY(-1px) !important;
        }
        .spicey-talk-chat-ui.is-light .talk-phone-status {
          color: #111018 !important;
        }
        .talk-ref-header {
          min-height: 56px !important;
          padding: 12px 22px 0 !important;
        }
        .talk-round-btn {
          width: 52px !important;
          height: 52px !important;
          border-radius: 50% !important;
          background: rgba(255,255,255,.055) !important;
          border: 1px solid rgba(255,255,255,.075) !important;
          box-shadow: inset 0 1px 0 rgba(255,255,255,.08), 0 16px 34px rgba(0,0,0,.28) !important;
        }
        .talk-back {
          color: #ff2d8f !important;
          font-size: 46px !important;
          font-weight: 250 !important;
          padding-bottom: 5px !important;
        }
        .talk-menu {
          color: #fff !important;
          font-size: 21px !important;
          letter-spacing: 2px !important;
        }
        .talk-bg-wave {
          top: 93px !important;
          height: 145px !important;
          width: 76vw !important;
          opacity: .92 !important;
          filter: blur(1.4px) saturate(1.18) !important;
        }
        .talk-bg-wave-left {
          left: -17vw !important;
          background: linear-gradient(90deg, transparent 0%, rgba(255,80,42,.08) 12%, rgba(255,80,42,.76) 37%, rgba(255,45,143,.58) 60%, transparent 100%) !important;
          transform: rotate(-10deg) translateY(-2px) !important;
        }
        .talk-bg-wave-right {
          right: -17vw !important;
          background: linear-gradient(90deg, transparent 0%, rgba(255,45,143,.22) 14%, rgba(139,53,255,.78) 43%, rgba(255,45,143,.52) 70%, transparent 100%) !important;
          transform: rotate(8deg) scaleX(-1) translateY(2px) !important;
        }
        .talk-ai-identity {
          margin-top: -30px !important;
          isolation: isolate !important;
        }
        .talk-ai-orb {
          position: relative !important;
          width: 148px !important;
          height: 148px !important;
          border: 1px solid rgba(255,255,255,.10) !important;
          background:
            radial-gradient(circle at 50% 48%, rgba(255,45,143,.18), transparent 42%),
            radial-gradient(circle at 38% 27%, rgba(255,255,255,.08), transparent 24%),
            linear-gradient(145deg, rgba(6,4,13,.98), rgba(0,1,7,.99)) !important;
          box-shadow:
            0 0 0 1px rgba(255,45,143,.06),
            0 0 42px rgba(255,45,143,.36),
            0 0 72px rgba(139,53,255,.24),
            inset 0 1px 0 rgba(255,255,255,.11) !important;
        }
        .talk-ai-orb::before {
          content: "" !important;
          position: absolute !important;
          inset: -9px !important;
          border-radius: 50% !important;
          background: conic-gradient(from 220deg, rgba(255,122,24,.96), rgba(255,45,143,.82), rgba(139,53,255,.95), rgba(255,122,24,.96)) !important;
          filter: blur(10px) !important;
          opacity: .52 !important;
          z-index: -1 !important;
        }
        .talk-ai-orb::after {
          content: "" !important;
          position: absolute !important;
          inset: -1px !important;
          border-radius: 50% !important;
          border: 1px solid rgba(255,255,255,.10) !important;
          background: radial-gradient(circle at 34% 18%, rgba(255,255,255,.14), transparent 30%) !important;
          pointer-events: none !important;
        }
        .talk-ai-orb img {
          width: 104px !important;
          height: 104px !important;
          filter: drop-shadow(0 0 18px rgba(255,45,143,.62)) drop-shadow(0 0 12px rgba(255,122,24,.28)) !important;
        }
        .talk-ai-identity h1 {
          margin-top: 12px !important;
          font-size: 26px !important;
          font-weight: 850 !important;
          color: #fff !important;
        }
        .talk-ai-identity h1 span {
          width: 23px !important;
          height: 23px !important;
          background: linear-gradient(135deg, #8b35ff, #a855f7) !important;
          box-shadow: 0 0 12px rgba(139,53,255,.38) !important;
        }
        .talk-ai-identity p {
          margin-top: 4px !important;
          font-size: 16px !important;
          color: rgba(255,255,255,.90) !important;
        }
        .talk-ai-identity b {
          margin-top: 28px !important;
          padding: 8px 18px !important;
          border-radius: 14px !important;
          background: rgba(255,255,255,.075) !important;
          color: rgba(255,255,255,.90) !important;
          font-size: 15px !important;
        }
        .talk-message-stream {
          padding-top: 14px !important;
        }
        .spicey-talk-chat-ui.is-light .talk-ai-identity h1,
        .spicey-talk-chat-ui.is-light .talk-ai-identity p,
        .spicey-talk-chat-ui.is-light .talk-ai-identity b {
          color: #15101d !important;
        }
        .spicey-talk-chat-ui.is-light .talk-bg-wave {
          opacity: .24 !important;
        }
        .spicey-talk-chat-ui.is-keyboard .talk-phone-status {
          display: none !important;
        }
        .spicey-talk-chat-ui.is-keyboard .talk-ref-header {
          min-height: 42px !important;
          padding-top: 8px !important;
        }
        .spicey-talk-chat-ui.is-keyboard .talk-ai-identity {
          transform: scale(.70) translateY(-52px) !important;
          margin-bottom: -88px !important;
        }
        @media (max-width: 430px) {
          .talk-phone-status {
            padding-left: 38px !important;
            padding-right: 32px !important;
            font-size: 22px !important;
          }
          .talk-ref-header {
            padding-left: 20px !important;
            padding-right: 20px !important;
          }
        }
        @media (max-height: 760px) {
          .talk-ai-identity {
            margin-top: -34px !important;
          }
          .talk-ai-orb {
            width: 126px !important;
            height: 126px !important;
          }
          .talk-ai-orb img {
            width: 88px !important;
            height: 88px !important;
          }
          .talk-ai-identity b {
            margin-top: 18px !important;
          }
        }
        body.spicey-talk-open #bottom-nav,
        body.spicey-talk-open .ai-ref-bottom-nav,
        body.spicey-talk-open .ai-bottom-input {
          display: none !important;
          visibility: hidden !important;
          pointer-events: none !important;
        }
        .spicey-talk-chat-ui {
          left: 50% !important;
          right: auto !important;
          width: min(100vw, 430px) !important;
          height: 100dvh !important;
          transform: translateX(-50%) !important;
          background: #02030b url('/spicey-assets/ai-talk-chat-reference.png') center top / cover no-repeat !important;
          border: 0 !important;
          box-shadow: 0 0 90px rgba(0,0,0,.70) !important;
        }
        .spicey-talk-chat-ui.is-light {
          background: #02030b url('/spicey-assets/ai-talk-chat-reference.png') center top / cover no-repeat !important;
        }
        .talk-bg-wave,
        .talk-phone-status,
        .talk-ai-identity,
        .talk-message-stream {
          opacity: 0 !important;
          pointer-events: none !important;
        }
        .talk-ref-header {
          position: absolute !important;
          left: 0 !important;
          right: 0 !important;
          top: 74px !important;
          z-index: 8 !important;
          min-height: 62px !important;
          padding: 0 20px !important;
          pointer-events: none !important;
        }
        .talk-round-btn {
          pointer-events: auto !important;
          opacity: 0 !important;
          width: 56px !important;
          height: 56px !important;
        }
        .talk-ref-input {
          left: 14px !important;
          right: 14px !important;
          bottom: max(34px, calc(env(safe-area-inset-bottom) + 22px)) !important;
          z-index: 10 !important;
          height: 72px !important;
          display: grid !important;
          grid-template-columns: 60px minmax(0, 1fr) 60px !important;
          align-items: center !important;
          gap: 8px !important;
          padding: 0 !important;
          border: 0 !important;
          border-radius: 0 !important;
          background: transparent !important;
          box-shadow: none !important;
          backdrop-filter: none !important;
          -webkit-backdrop-filter: none !important;
        }
        .talk-plus-btn,
        .talk-spark-btn {
          width: 60px !important;
          height: 60px !important;
          opacity: 0 !important;
          background: transparent !important;
          border: 0 !important;
          box-shadow: none !important;
        }
        .talk-input-pill {
          height: 58px !important;
          min-width: 0 !important;
          display: flex !important;
          align-items: center !important;
          padding: 0 44px 0 22px !important;
          border: 0 !important;
          border-radius: 0 !important;
          background: transparent !important;
          box-shadow: none !important;
        }
        .talk-input-pill input {
          width: 100% !important;
          height: 100% !important;
          color: #fff !important;
          caret-color: #ff2d8f !important;
          background: transparent !important;
          border: 0 !important;
          outline: 0 !important;
          font-size: 18px !important;
          font-weight: 500 !important;
        }
        .talk-input-pill input::placeholder {
          color: transparent !important;
        }
        .talk-mini-mic {
          position: absolute !important;
          right: 76px !important;
          top: 17px !important;
          width: 38px !important;
          height: 38px !important;
          opacity: 0 !important;
          background: transparent !important;
          border: 0 !important;
        }
        .spicey-talk-chat-ui.is-keyboard .talk-ref-input {
          bottom: max(18px, env(safe-area-inset-bottom)) !important;
        }
        @media (max-width: 430px) {
          .spicey-talk-chat-ui {
            width: 100vw !important;
            box-shadow: none !important;
          }
          .talk-ref-header {
            top: 73px !important;
            padding: 0 19px !important;
          }
        }
        @media (max-height: 760px) {
          .spicey-talk-chat-ui {
            background-size: cover !important;
          }
          .talk-ref-header {
            top: 58px !important;
          }
          .talk-ref-input {
            bottom: max(22px, calc(env(safe-area-inset-bottom) + 14px)) !important;
          }
        }
        @keyframes ai-wave { from { height: 6px; } to { height: 38px; } }
        @keyframes ai-speak { from { height: 4px; } to { height: 30px; } }
        @keyframes ai-dot { 0%,100% { transform:translateY(0);opacity:0.4; } 50% { transform:translateY(-9px);opacity:1; } }
        @keyframes orb-spin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
        @keyframes orb-pulse { 0%,100% { opacity:0.6;transform:scale(1); } 50% { opacity:0.9;transform:scale(1.05); } }
        @keyframes talk-float { 0%,100% { transform: translate3d(0,0,0) scale(1); } 50% { transform: translate3d(0,-18px,0) scale(1.04); } }
        @keyframes talk-light-sweep { 0% { transform: rotate(-15deg) translateX(-4%); opacity: .55; } 100% { transform: rotate(-15deg) translateX(4%); opacity: .95; } }
        @keyframes talk-ring-breathe { 0%,100% { transform: scale(.96); opacity: .56; } 50% { transform: scale(1.06); opacity: .95; } }
      `}</style>
    </div>
  );
}

function pillStyle(color) {
  return { background: `linear-gradient(135deg, ${color}22, ${color}12)`, border: `1.5px solid ${color}60`, borderRadius: 16, padding: '6px 12px', color, fontSize: 11, fontWeight: 600, cursor: 'pointer' };
}

function PickerModal({ title, onClose, isLight, children, scrollable }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 9998, display: 'flex', justifyContent: 'center', alignItems: 'center' }} onClick={onClose}>
      <div style={{ background: isLight ? '#fff' : 'rgba(20,10,30,0.95)', border: isLight ? '1px solid rgba(0,0,0,0.1)' : '1px solid rgba(255,255,255,0.1)', borderRadius: 24, padding: 24, maxWidth: '90%', width: 360, maxHeight: scrollable ? '70vh' : 'auto', overflowY: scrollable ? 'auto' : 'visible' }} onClick={e => e.stopPropagation()}>
        <div style={{ textAlign: 'center', marginBottom: 20, color: isLight ? '#000' : '#fff', fontSize: 16, fontWeight: 600 }}>{title}</div>
        {children}
      </div>
    </div>
  );
}
