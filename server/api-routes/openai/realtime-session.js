const VALID_VOICES = ['marin', 'cedar', 'alloy', 'ash', 'ballad', 'coral', 'echo', 'sage', 'shimmer', 'verse'];
const DEFAULT_REALTIME_MODELS = [
  process.env.OPENAI_REALTIME_MODEL,
  'gpt-realtime',
  'gpt-4o-realtime-preview',
  'gpt-realtime-2',
  'gpt-4o-mini-realtime-preview',
].filter(Boolean);

const VOICE_MAP = {
  coral: 'marin',
  verse: 'marin',
  ballad: 'marin',
  sage: 'cedar',
  ash: 'cedar',
  shimmer: 'marin',
  honey: 'marin',
  sunny: 'marin',
  river: 'cedar',
  storm: 'cedar',
  spark: 'marin',
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

function setCors(req, res) {
  const allowed = (process.env.SPICEY_ALLOWED_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  const origin = req.headers.origin;
  const allowOrigin = allowed.length === 0 || allowed.includes(origin) ? origin || '*' : allowed[0];

  res.setHeader('Access-Control-Allow-Origin', allowOrigin);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;

  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString('utf8');
  return raw ? JSON.parse(raw) : {};
}

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

export default async function handler(req, res) {
  setCors(req, res);

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    json(res, 405, { error: 'Method not allowed' });
    return;
  }

  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      json(res, 500, { error: 'OPENAI_API_KEY is not configured on the server' });
      return;
    }

    const body = await readBody(req);
    const requestedVoice = VOICE_MAP[body.voice] || body.voice;
    const safeVoice = VALID_VOICES.includes(requestedVoice) ? requestedVoice : 'marin';
    const selectedLanguage = body.language || 'en';
    const languageName = LANGUAGE_NAMES[selectedLanguage] || 'the selected language';

    const instructions = `You are Spicey AI, a warm natural voice assistant inside the Spicey social app.
The user selected ${languageName}. Begin and continue in ${languageName} unless the user clearly switches language.
Support Albanian, English, German, Italian, French, Spanish, Turkish, Arabic, and any other language naturally.
Keep replies conversational, brief, and natural for voice. No markdown. Listen continuously and answer every meaningful user turn.
Introduce yourself only when explicitly asked who you are. Do not repeat an introduction after the conversation has started.
If asked who created Spicey: say "Spicey was created by Valon Dervishi."`;

    const buildSession = (model) => ({
      type: 'realtime',
      model,
      instructions,
      audio: {
        input: {
          transcription: { model: 'whisper-1' },
          turn_detection: {
            type: 'server_vad',
            threshold: 0.5,
            prefix_padding_ms: 300,
            silence_duration_ms: 500,
            create_response: true,
            interrupt_response: true,
          },
        },
        output: {
          voice: safeVoice,
        },
      },
    });

    let data = null;
    let model = DEFAULT_REALTIME_MODELS[0];
    let lastError = 'Could not create OpenAI Realtime session';

    for (const candidateModel of DEFAULT_REALTIME_MODELS) {
      model = candidateModel;
      const response = await fetch('https://api.openai.com/v1/realtime/client_secrets', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ session: buildSession(model) }),
      });

      const text = await response.text();
      data = text ? JSON.parse(text) : {};

      if (response.ok) {
        lastError = '';
        break;
      }

      lastError = data.error?.message || `Realtime session failed for ${model}`;
      data = null;
    }

    if (!data) {
      json(res, 500, { error: lastError });
      return;
    }

    json(res, 200, {
      client_secret: data.value || data.client_secret?.value,
      voice: safeVoice,
      model,
      instructions,
      expires_hint_seconds: 60,
    });
  } catch (error) {
    json(res, 500, { error: error.message || 'Realtime session failed' });
  }
}
