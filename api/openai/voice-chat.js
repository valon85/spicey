import { handleOptions, readJson, sendJson, setCors } from '../_lib/http.js';
import { getSupabaseUser } from '../_lib/supabaseRest.js';
import { File } from 'node:buffer';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const TEXT_MODEL = process.env.OPENAI_TEXT_MODEL || 'gpt-4.1-mini';
const REQUIRE_AI_AUTH = process.env.SPICEY_REQUIRE_AI_AUTH === 'true';

const MIME_EXT = {
  'audio/webm': 'webm',
  'audio/ogg': 'ogg',
  'audio/mp4': 'm4a',
  'audio/mpeg': 'mp3',
  'audio/wav': 'wav',
};

const LANGUAGE_NAMES = {
  en: 'English',
  sq: 'Albanian',
  ar: 'Arabic',
  zh: 'Chinese',
  hr: 'Croatian',
  da: 'Danish',
  nl: 'Dutch',
  fi: 'Finnish',
  fr: 'French',
  de: 'German',
  el: 'Greek',
  he: 'Hebrew',
  hi: 'Hindi',
  id: 'Indonesian',
  it: 'Italian',
  ja: 'Japanese',
  ko: 'Korean',
  mk: 'Macedonian',
  ms: 'Malay',
  no: 'Norwegian',
  fa: 'Persian',
  pl: 'Polish',
  pt: 'Portuguese',
  ro: 'Romanian',
  ru: 'Russian',
  sr: 'Serbian',
  es: 'Spanish',
  sv: 'Swedish',
  tl: 'Tagalog',
  ta: 'Tamil',
  th: 'Thai',
  tr: 'Turkish',
  uk: 'Ukrainian',
  ur: 'Urdu',
  vi: 'Vietnamese',
};

const VOICE_MAP = {
  honey: 'nova',
  sunny: 'shimmer',
  river: 'alloy',
  storm: 'onyx',
  spark: 'echo',
  coral: 'coral',
  sage: 'sage',
  ballad: 'ballad',
  verse: 'verse',
  ash: 'ash',
  shimmer: 'shimmer',
  alloy: 'alloy',
  echo: 'echo',
  nova: 'nova',
  onyx: 'onyx',
  fable: 'fable',
};

function extractText(data) {
  if (data.output_text) return data.output_text;
  const chunks = [];
  for (const item of data.output || []) {
    for (const content of item.content || []) {
      if (content.type === 'output_text' && content.text) chunks.push(content.text);
      if (content.type === 'text' && content.text) chunks.push(content.text);
    }
  }
  return chunks.join('\n').trim();
}

async function createSpeechDataUrl(text, voice) {
  const response = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.OPENAI_SPEECH_MODEL || 'gpt-4o-mini-tts',
      voice,
      input: text.slice(0, 600),
      instructions: 'Speak like a calm natural ChatGPT-style voice assistant. Warm, relaxed, human, not robotic, not dramatic, with smooth pacing.',
      response_format: 'mp3',
      speed: 1.0,
    }),
  });

  const buffer = await response.arrayBuffer();
  if (!response.ok) {
    const errorText = new TextDecoder().decode(buffer);
    throw new Error(errorText || 'OpenAI speech request failed');
  }

  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i += 8192) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
  }
  return `data:audio/mpeg;base64,${Buffer.from(binary, 'binary').toString('base64')}`;
}

async function transcribeAudio({ audioBase64, mimeType, language }) {
  if (!audioBase64) return '';

  const cleanMime = String(mimeType || 'audio/webm').split(';')[0] || 'audio/webm';
  const ext = MIME_EXT[cleanMime] || 'webm';
  const buffer = Buffer.from(audioBase64, 'base64');
  if (!buffer.length) return '';

  const form = new FormData();
  form.append('model', process.env.OPENAI_TRANSCRIBE_MODEL || 'gpt-4o-mini-transcribe');
  form.append('file', new File([buffer], `spicey-voice.${ext}`, { type: cleanMime }));
  if (language && /^[a-z]{2}$/i.test(language)) form.append('language', language);

  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
    body: form,
  });

  const raw = await response.text();
  const data = raw ? JSON.parse(raw) : {};
  if (!response.ok) throw new Error(data.error?.message || 'OpenAI transcription failed');
  return String(data.text || '').trim();
}

export default async function handler(req, res) {
  setCors(req, res);
  if (handleOptions(req, res)) return;
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' });

  try {
    if (REQUIRE_AI_AUTH) await getSupabaseUser(req);
    if (!OPENAI_API_KEY) return sendJson(res, 500, { error: 'OPENAI_API_KEY is not configured' });

    const body = await readJson(req);
    const language = body.language || 'en';
    const languageName = LANGUAGE_NAMES[language] || 'the same language as the user';
    const isGreeting = Boolean(body.is_greeting);
    let userText = String(body.text_override || body.prompt || '').trim();
    if (!isGreeting && !userText && body.audio_base64) {
      userText = await transcribeAudio({
        audioBase64: body.audio_base64,
        mimeType: body.mime_type,
        language,
      });
    }

    if (!isGreeting && !userText) {
      return sendJson(res, 200, { transcription: '', ai_text: '', no_speech: true });
    }

    const inputText = isGreeting
      ? `Greet me warmly in ${languageName}. Say you are Spicey AI and ask how you can help.`
      : userText;

    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: body.model || TEXT_MODEL,
        input: [
          {
            role: 'system',
            content: `You are Spicey AI, a warm natural voice assistant. Reply only in ${languageName}. Keep answers short, calm, natural, and spoken. No markdown. Avoid exclamation-heavy delivery.`,
          },
          { role: 'user', content: inputText },
        ],
        max_output_tokens: isGreeting ? 60 : 120,
      }),
    });

    const raw = await response.text();
    const data = raw ? JSON.parse(raw) : {};
    if (!response.ok) return sendJson(res, response.status, { error: data.error?.message || 'OpenAI text request failed' });

    const aiText = extractText(data) || (isGreeting ? "Hi! I'm Spicey AI. How can I help?" : 'I heard you.');
    let speechUrl = '';

    try {
      speechUrl = await createSpeechDataUrl(aiText, VOICE_MAP[body.voice] || 'nova');
    } catch (error) {
      console.warn('[voice-chat] speech fallback:', error.message);
    }

    return sendJson(res, 200, {
      transcription: isGreeting ? '' : userText,
      ai_text: aiText,
      text: aiText,
      speech_url: speechUrl,
      no_speech: false,
    });
  } catch (error) {
    return sendJson(res, 400, { error: error.message || 'AI voice chat failed' });
  }
}
