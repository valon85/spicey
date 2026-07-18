import { handleOptions, readJson, sendJson, setCors } from '../../_lib/http.js';
import { getSupabaseUser, supabaseTable } from '../../_lib/supabaseRest.js';

export default async function handler(req, res) {
  setCors(req, res);
  if (handleOptions(req, res)) return;
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' });

  try {
    const { token, user } = await getSupabaseUser(req);
    const body = await readJson(req);
    const updates = {
      latitude: body.latitude === null ? null : Number(body.latitude),
      longitude: body.longitude === null ? null : Number(body.longitude),
      location_name: body.location_name || body.locationName || null,
      share_location: body.share_location !== false,
      updated_at: new Date().toISOString(),
    };

    if (updates.share_location && (!Number.isFinite(updates.latitude) || !Number.isFinite(updates.longitude))) {
      return sendJson(res, 400, { error: 'Valid latitude and longitude are required' });
    }

    const rows = await supabaseTable('profiles', {
      method: 'PATCH',
      token,
      query: `?user_id=eq.${encodeURIComponent(user.id)}`,
      body: updates,
    });

    return sendJson(res, 200, { profile: rows[0] });
  } catch (error) {
    return sendJson(res, 400, { error: error.message || 'Location update failed' });
  }
}
