import { handleOptions, readJson, sendJson, setCors } from '../_lib/http.js';
import { getSupabaseUser } from '../_lib/supabaseRest.js';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const IMAGE_MODEL = process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1';
const REQUIRE_AI_AUTH = process.env.SPICEY_REQUIRE_AI_AUTH === 'true';

function extFromType(type) {
  if (type?.includes('png')) return 'png';
  if (type?.includes('webp')) return 'webp';
  return 'jpg';
}

async function imageUrlToBlob(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Could not fetch source image');
  const arrayBuffer = await response.arrayBuffer();
  const type = response.headers.get('content-type') || 'image/jpeg';
  return {
    blob: new Blob([arrayBuffer], { type }),
    filename: `source.${extFromType(type)}`,
  };
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
    const imageUrl = String(body.image_url || body.imageUrl || '').trim();
    if (!prompt) return sendJson(res, 400, { error: 'prompt is required' });
    if (!imageUrl) return sendJson(res, 400, { error: 'image_url is required' });

    const sourceImage = await imageUrlToBlob(imageUrl);
    const form = new FormData();
    form.append('model', body.model || IMAGE_MODEL);
    form.append('prompt', prompt);
    form.append('image', sourceImage.blob, sourceImage.filename);
    form.append('size', body.size || '1024x1024');

    const response = await fetch('https://api.openai.com/v1/images/edits', {
      method: 'POST',
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
      body: form,
    });

    const text = await response.text();
    const data = text ? JSON.parse(text) : {};
    if (!response.ok) return sendJson(res, response.status, { error: data.error?.message || 'OpenAI image request failed' });

    const first = data.data?.[0] || {};
    const image = first.url || (first.b64_json ? `data:image/png;base64,${first.b64_json}` : '');
    return sendJson(res, 200, { url: image, image_url: image, raw: data });
  } catch (error) {
    return sendJson(res, 400, { error: error.message || 'OpenAI image request failed' });
  }
}
