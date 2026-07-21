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
  const realtimeGenerationRef = useRef(0);
  const realtimeReconnectAttemptsRef = useRef(0);
  const realtimeReconnectTimerRef = useRef(null);
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
      setTimeout(() => {
        if (typeof RTCPeerConnection !== 'undefined') startRealtimeSession({ greet: false });
        else startListeningRef.current?.();
      }, 120);
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
    const data = await spiceyApi.ai.voiceChat(payload);
    if (data?.error) throw new Error(data.error);
    return data;
  };

  useEffect(() => { selectedLangRef.current = selectedLang; }, [selectedLang]);
  useEffect(() => { selectedVoiceRef.current = selectedVoice; }, [selectedVoice]);

  useEffect(() => {
    refreshMicPermission();
  }, []);

  const sendRealtimeEvent = (event) => {
    const channel = realtimeChannelRef.current;
    if (!channel || channel.readyState !== 'open') return false;
    channel.send(JSON.stringify(event));
    return true;
  };

  const stopRealtime = () => {
    realtimeClosingRef.current = true;
    realtimeGenerationRef.current += 1;
    realtimeReadyRef.current = false;
    if (realtimeReconnectTimerRef.current) {
      clearTimeout(realtimeReconnectTimerRef.current);
      realtimeReconnectTimerRef.current = null;
    }
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
  };

  const interruptRealtime = () => {
    sendRealtimeEvent({ type: 'response.cancel' });
    setStatusBoth('listening');
    setPhase('listening');
    setVoiceLevel(0.25);
  };

  const startRealtimeSession = async ({ greet = false } = {}) => {
    try {
      voiceModeRef.current = 'realtime';
      stopMic();
      stopRealtime();
      realtimeClosingRef.current = false;
      const generation = realtimeGenerationRef.current;
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
      remoteAudio.setAttribute('playsinline', '');
      remoteAudio.volume = 1;
      realtimeAudioRef.current = remoteAudio;

      pc.ontrack = (event) => {
        remoteAudio.srcObject = event.streams[0];
        remoteAudio.play().then(() => {
          setErrorMsg('');
        }).catch(() => {
          setErrorMsg('Tap the center button once to enable voice audio.');
        });
      };

      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      const dc = pc.createDataChannel('oai-events');
      realtimeChannelRef.current = dc;

      dc.onopen = () => {
        if (generation !== realtimeGenerationRef.current) return;
        realtimeReadyRef.current = true;
        realtimeReconnectAttemptsRef.current = 0;
        isBusyRef.current = false;
        setStatusBoth('listening');
        setPhase('listening');
        setAiText(activeGreeting);
        sendRealtimeEvent({
          type: 'session.update',
          session: {
            type: 'realtime',
            instructions: `You are Spicey AI, a warm natural voice assistant. The selected language is ${activeLanguageName}. Begin and continue in that language unless the user clearly switches language. Speak naturally like ChatGPT Voice, not like a translator. Keep responses short for voice. Introduce yourself only when the user asks who you are. If the user interrupts, stop and listen.`,
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
        if (greet) {
          sendRealtimeEvent({
            type: 'response.create',
            response: {
              instructions: `Say this greeting naturally in ${activeLanguageName}: "${activeGreeting}"`,
            },
          });
        }
      };

      dc.onmessage = (event) => {
        let msg;
        try { msg = JSON.parse(event.data); } catch (_) { return; }
        if (msg.type === 'response.audio.delta' || msg.type === 'response.output_audio.delta') {
          setStatusBoth('speaking');
          setPhase('speaking');
          setVoiceLevel(0.65);
        } else if (msg.type === 'response.audio.done' || msg.type === 'response.output_audio.done' || msg.type === 'response.done') {
          setStatusBoth('listening');
          setPhase('listening');
          setVoiceLevel(0);
        } else if (msg.type === 'response.audio_transcript.delta' || msg.type === 'response.output_audio_transcript.delta' || msg.type === 'response.text.delta') {
          if (msg.delta) setAiText((prev) => `${prev || ''}${msg.delta}`);
        } else if (msg.type === 'response.audio_transcript.done' || msg.type === 'response.output_audio_transcript.done' || msg.type === 'response.text.done') {
          if (msg.transcript || msg.text) setAiText(msg.transcript || msg.text);
        } else if (msg.type === 'conversation.item.input_audio_transcription.completed') {
          if (msg.transcript) transcriptRef.current = msg.transcript;
        } else if (msg.type === 'input_audio_buffer.speech_started') {
          // Server VAD already interrupts the active response. A second
          // response.cancel can race and surface a false realtime error.
          setStatusBoth('listening');
          setPhase('listening');
          setVoiceLevel(0.25);
        } else if (msg.type === 'error') {
          setErrorMsg(msg.error?.message || 'Realtime voice error.');
        }
      };

      dc.onclose = () => {
        if (generation !== realtimeGenerationRef.current) return;
        realtimeReadyRef.current = false;
        if (!realtimeClosingRef.current && realtimeReconnectAttemptsRef.current < 2) {
          realtimeReconnectAttemptsRef.current += 1;
          setStatusBoth('idle');
          setErrorMsg('Voice disconnected. Reconnecting...');
          realtimeReconnectTimerRef.current = setTimeout(() => startRealtimeSession({ greet: false }), 1200);
        } else if (!realtimeClosingRef.current) {
          setStatusBoth('idle');
          setPhase('stopped');
          voiceModeRef.current = 'openai-tts';
          setErrorMsg('Live voice is unavailable. Tap the microphone to continue.');
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
      stopRealtime();
      isBusyRef.current = false;
      realtimeReadyRef.current = false;
      setStatusBoth('idle');
      setPhase('stopped');
      voiceModeRef.current = 'openai-tts';
      setErrorMsg('Live voice is unavailable. Tap the microphone to continue.');
      restartListeningSoon(300);
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

  const speakText = (text) => new Promise((resolve) => {
    const synth = window.speechSynthesis;
    if (!synth || !text) { resolve(); return; }
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = getSpeechLang(selectedLangRef.current);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.onend = resolve;
    utterance.onerror = resolve;
    synth.speak(utterance);
  });

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
    if (status === 'listening' && realtimeReadyRef.current) {
      realtimeAudioRef.current?.play?.()
        .then(() => setErrorMsg(''))
        .catch(() => setErrorMsg('Voice audio is blocked. Raise the media volume and tap again.'));
      return;
    }
    if (status === 'listening') { triggerSendRef.current?.(); return; }
    if (status === 'idle') {
      setMicBlocked(false);
      setErrorMsg('');
      if (typeof RTCPeerConnection !== 'undefined') {
        startRealtimeSession({ greet: false });
      } else if (micPrimedRef.current || micPermission === 'granted') {
        voiceModeRef.current = 'openai-tts';
        startListeningRef.current?.();
      } else {
        voiceModeRef.current = 'openai-tts';
        requestMicAccess();
      }
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
    <div style={{ position: 'fixed', inset: 0, background: isLight ? '#FAFAFA' : '#060610', zIndex: 9999, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* Top Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', paddingTop: 'max(20px, env(safe-area-inset-top))' }}>
        <div style={{ color: isLight ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.35)', fontSize: 10, fontWeight: 400, letterSpacing: 2 }}>SPICEY AI</div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <button onClick={() => setShowVoicePicker(true)} style={pillStyle('#FF6A00')}>
            {VOICE_OPTIONS.find(v => v.id === selectedVoice)?.name}
          </button>
          <button onClick={() => setShowLangPicker(true)} style={pillStyle('#FF6A00')}>
            {SUPPORTED_LANGUAGES.find(l => l.code === selectedLang)?.name}
          </button>
          <button onClick={handleClose} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', color: isLight ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.7)', fontSize: 16, cursor: 'pointer' }}>✕</button>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>

        {/* Orb */}
        <button onClick={handleCircleClick} disabled={status === 'thinking'}
          style={{
            position: 'relative',
            width: 'min(200px, 54vw)', height: 'min(200px, 54vw)',
            borderRadius: '50%', border: 'none', background: 'transparent',
            cursor: status === 'thinking' ? 'default' : 'pointer',
            WebkitTapHighlightColor: 'transparent', outline: 'none',
            transform: `scale(${circleScale})`,
            transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}>
          {/* Glow */}
          <div style={{
            position: 'absolute', inset: -8, borderRadius: '50%',
            background: `radial-gradient(circle, ${status === 'speaking' ? 'rgba(255,140,0,0.14)' : status === 'listening' ? 'rgba(193,0,255,0.16)' : 'rgba(80,80,120,0.07)'} 0%, transparent 70%)`,
            filter: 'blur(14px)',
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
            position: 'absolute', inset: 14, borderRadius: '50%',
            background: 'rgba(255,255,255,0.06)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.18)',
            pointerEvents: 'none',
          }} />
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
        <div style={{ marginTop: 28, textAlign: 'center' }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: statusColor, transition: 'color 0.3s' }}>
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
      <div style={{ padding: '0 16px', paddingBottom: 'calc(96px + env(safe-area-inset-bottom, 0px))', flexShrink: 0 }}>
          <div style={{ background: isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.06)', border: `1px solid ${isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.12)'}`, borderRadius: 20, padding: '4px 4px 4px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: isLight ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.35)', flexShrink: 0 }}>Type</span>
            <input value={textInput} onChange={e => setTextInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendTextMessage()}
              placeholder="Type your message..."
              style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 14, color: isLight ? '#111' : '#fff' }} />
            <button onClick={sendTextMessage} disabled={!textInput.trim() || status === 'thinking' || status === 'speaking'}
              style={{ background: 'linear-gradient(135deg, #FF6A00, #C100FF)', border: 'none', borderRadius: 16, padding: '8px 16px', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: (!textInput.trim() || status !== 'idle') ? 0.5 : 1 }}>
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
        @keyframes ai-wave { from { height: 6px; } to { height: 38px; } }
        @keyframes ai-speak { from { height: 4px; } to { height: 30px; } }
        @keyframes ai-dot { 0%,100% { transform:translateY(0);opacity:0.4; } 50% { transform:translateY(-9px);opacity:1; } }
        @keyframes orb-spin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
        @keyframes orb-pulse { 0%,100% { opacity:0.6;transform:scale(1); } 50% { opacity:0.9;transform:scale(1.05); } }
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
