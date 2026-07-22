import { handleOptions, readJson, sendJson, setCors } from '../_lib/http.js';
import { getSupabaseUser } from '../_lib/supabaseRest.js';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const VIDEO_MODEL = process.env.OPENAI_VIDEO_MODEL || 'sora-2';
const REQUIRE_AI_AUTH = process.env.SPICEY_REQUIRE_AI_AUTH === 'true';

async function openAI(path, options = {}) {
  return fetch(`https://api.openai.com/v1${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      ...(options.headers || {}),
    },
  });
}

export default async function handler(req, res) {
  setCors(req, res);
  if (handleOptions(req, res)) return;

  try {
    if (REQUIRE_AI_AUTH) await getSupabaseUser(req);
    if (!OPENAI_API_KEY) return sendJson(res, 500, { error: 'OPENAI_API_KEY is not configured' });

    const url = new URL(req.url || '/api/openai/video', 'https://spicey.live');
    const id = String(url.searchParams.get('id') || '').trim();

    if (req.method === 'GET' && id) {
      if (url.searchParams.get('content') === '1') {
        const contentResponse = await openAI(`/videos/${encodeURIComponent(id)}/content`);
        if (!contentResponse.ok) {
          const error = await contentResponse.text();
          return sendJson(res, contentResponse.status, { error: error || 'Video content is not ready' });
        }
        const bytes = Buffer.from(await contentResponse.arrayBuffer());
        res.statusCode = 200;
        res.setHeader('Content-Type', contentResponse.headers.get('content-type') || 'video/mp4');
        res.setHeader('Content-Length', String(bytes.length));
        res.setHeader('Cache-Control', 'private, max-age=3600');
        res.end(bytes);
        return;
      }

      const statusResponse = await openAI(`/videos/${encodeURIComponent(id)}`);
      const raw = await statusResponse.text();
      const data = raw ? JSON.parse(raw) : {};
      if (!statusResponse.ok) return sendJson(res, statusResponse.status, { error: data.error?.message || 'Video status failed' });
      return sendJson(res, 200, {
        ...data,
        url: data.status === 'completed' ? `/api/openai/video?id=${encodeURIComponent(id)}&content=1` : '',
      });
    }

    if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' });
    const body = await readJson(req);
    const prompt = String(body.prompt || '').trim();
    if (!prompt) return sendJson(res, 400, { error: 'prompt is required' });

    const createResponse = await openAI('/videos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: body.model || VIDEO_MODEL,
        prompt,
        size: body.size || '720x1280',
        seconds: Number(body.seconds) || 8,
      }),
    });
    const raw = await createResponse.text();
    const data = raw ? JSON.parse(raw) : {};
    if (!createResponse.ok) return sendJson(res, createResponse.status, { error: data.error?.message || 'OpenAI video request failed' });
    return sendJson(res, 202, { ...data, message: 'Video generation started.' });
  } catch (error) {
    return sendJson(res, 400, { error: error.message || 'AI video request failed' });
  }
}
