import { handleOptions, sendJson, setCors } from '../_lib/http.js';
import { getSupabaseUser, supabaseTable } from '../_lib/supabaseRest.js';

function readBlockId(req) {
  const url = new URL(req.url, 'http://spicey.local');
  const parts = url.pathname.split('/').filter(Boolean);
  return decodeURIComponent(parts[parts.length - 1] || '');
}

export default async function handler(req, res) {
  setCors(req, res);
  if (handleOptions(req, res)) return;

  try {
    const { token } = await getSupabaseUser(req);
    const blockId = readBlockId(req);
    if (!blockId) return sendJson(res, 400, { error: 'Missing block id' });

    if (req.method === 'DELETE') {
      await supabaseTable('blocks', {
        method: 'DELETE',
        token,
        query: `?id=eq.${encodeURIComponent(blockId)}`,
      });
      return sendJson(res, 200, { ok: true });
    }

    return sendJson(res, 405, { error: 'Method not allowed' });
  } catch (error) {
    return sendJson(res, 400, { error: error.message || 'Block request failed' });
  }
}
