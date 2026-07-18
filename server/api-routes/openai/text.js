import { handleOptions, readJson, sendJson, setCors } from '../_lib/http.js';
import { getSupabaseUser } from '../_lib/supabaseRest.js';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const TEXT_MODEL = process.env.OPENAI_TEXT_MODEL || 'gpt-4.1-mini';
const REQUIRE_AI_AUTH = process.env.SPICEY_REQUIRE_AI_AUTH === 'true';

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

export default async function handler(req, res) {
  setCors(req, res);
  if (handleOptions(req, res)) return;
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' });

  try {
    if (REQUIRE_AI_AUTH) await getSupabaseUser(req);
    if (!OPENAI_API_KEY) return sendJson(res, 500, { error: 'OPENAI_API_KEY is not configured' });

    const body = await readJson(req);
    const prompt = String(body.prompt || '').trim();
    if (!prompt) return sendJson(res, 400, { error: 'prompt is required' });

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
            content: 'You are Spicey AI, a concise creative assistant for social media captions, captions, hashtags, and app copy. Return only the requested content.',
          },
          { role: 'user', content: prompt },
        ],
        max_output_tokens: body.max_output_tokens || 180,
      }),
    });

    const text = await response.text();
    const data = text ? JSON.parse(text) : {};
    if (!response.ok) return sendJson(res, response.status, { error: data.error?.message || 'OpenAI text request failed' });

    return sendJson(res, 200, { text: extractText(data), raw: data });
  } catch (error) {
    return sendJson(res, 400, { error: error.message || 'OpenAI text request failed' });
  }
}
