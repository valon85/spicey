import { handleOptions, readJson, sendJson, setCors } from '../_lib/http.js';
import { getSupabaseUser } from '../_lib/supabaseRest.js';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const IMAGE_MODEL = process.env.OPENAI_IMAGE_MODEL || 'gpt-image-2';
const REQUIRE_AI_AUTH = process.env.SPICEY_REQUIRE_AI_AUTH === 'true';

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

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: body.model || IMAGE_MODEL,
        prompt,
        size: body.size || '1024x1024',
        quality: body.quality || 'medium',
      }),
    });

    const text = await response.text();
    const data = text ? JSON.parse(text) : {};
    if (!response.ok) return sendJson(res, response.status, { error: data.error?.message || 'OpenAI image generation failed' });

    const first = data.data?.[0] || {};
    const image = first.url || (first.b64_json ? `data:image/png;base64,${first.b64_json}` : '');
    return sendJson(res, 200, { url: image, image_url: image, raw: data });
  } catch (error) {
    return sendJson(res, 400, { error: error.message || 'OpenAI image generation failed' });
  }
}
