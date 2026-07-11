import { handleOptions, readJson, sendJson, setCors } from '../_lib/http.js';
import { getSupabaseUser, supabaseTable } from '../_lib/supabaseRest.js';

export default async function handler(req, res) {
  setCors(req, res);
  if (handleOptions(req, res)) return;

  try {
    const { token, user } = await getSupabaseUser(req);

    if (req.method === 'GET') {
      const campaigns = await supabaseTable('ad_campaigns', {
        token,
        query: `?user_id=eq.${encodeURIComponent(user.id)}&order=created_at.desc&limit=100`,
      });
      return sendJson(res, 200, { campaigns });
    }

    if (req.method === 'POST') {
      const body = await readJson(req);
      const budget = Number(body.budget ?? body.boostAmount ?? 0);
      const duration = Number(body.duration_days ?? body.duration ?? 7);
      const campaignType = body.campaign_type || (body.post_id || body.postId ? 'boost' : 'campaign');
      const postId = body.post_id || body.postId || null;
      const targetAudience = body.target_audience || body.targetAudience || {};
      const estimatedReach = Number(body.estimated_reach ?? Math.max(0, budget * (campaignType === 'boost' ? 100 : 150)));

      const payload = {
        user_id: user.id,
        post_id: postId,
        campaign_name: String(body.campaign_name || body.campaignName || (campaignType === 'boost' ? 'Boost Post' : 'Ad Campaign')).trim(),
        budget,
        duration_days: duration,
        target_audience: typeof targetAudience === 'string' ? { type: targetAudience } : targetAudience,
        estimated_reach: estimatedReach,
        status: 'active',
        campaign_type: campaignType,
      };

      if (!payload.campaign_name) return sendJson(res, 400, { error: 'Campaign name is required' });
      if (!Number.isFinite(payload.budget) || payload.budget <= 0) return sendJson(res, 400, { error: 'Budget must be greater than 0' });
      if (!Number.isFinite(payload.duration_days) || payload.duration_days <= 0) return sendJson(res, 400, { error: 'Duration must be greater than 0' });

      const rows = await supabaseTable('ad_campaigns', {
        method: 'POST',
        token,
        body: payload,
      });

      return sendJson(res, 201, {
        success: true,
        message: campaignType === 'boost' ? 'Boost request created.' : 'Campaign created.',
        campaign: rows[0],
      });
    }

    return sendJson(res, 405, { error: 'Method not allowed' });
  } catch (error) {
    return sendJson(res, 400, { error: error.message || 'Ad campaign request failed' });
  }
}
