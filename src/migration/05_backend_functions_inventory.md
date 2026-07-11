# Spicey — Backend Functions Inventory
Source: `base44/functions/*/entry.ts` (Deno Deploy)
All functions are at: `base44/functions/{name}/entry.ts`

## Migration Status Key
- ✅ KEEP AS-IS — can be ported to Supabase Edge Functions directly (same Deno runtime)
- 🔄 ADAPT — needs auth/client changes (replace `createClientFromRequest` with Supabase equivalent)
- ⭐ CRITICAL — core feature, must work before launch
- 🗑️ REMOVE — Base44-specific, no Supabase equivalent needed

---

## Auth & User Management

| Function | Status | Notes |
|---|---|---|
| `initializeUserProfile` | 🔄 ⭐ | Creates UserProfile on first login. Replace Base44 auth with Supabase trigger or Edge Function |
| `getUserProfile` | 🔄 ⭐ | Reads UserProfile. Rewrite to query `public.user_profiles` |
| `deleteUserAccount` | 🔄 ⭐ | Deletes user + all data. Use `supabase.auth.admin.deleteUser()` |
| `syncProfileName` | 🔄 | Updates author_name on all posts. Port to Supabase Edge Function |
| `repairPostOwnership` | 🔄 | Admin fix: update posts.author_id. Port directly |
| `testUserSignup` | 🗑️ | Base44-specific test. Not needed |
| `testVerifyOtp` | 🗑️ | Base44-specific OTP test. Supabase has built-in OTP |
| `verifySuperAdmin` | 🔄 | Check admin role. Use `user_profiles.role = 'admin'` |

## Feed & Posts

| Function | Status | Notes |
|---|---|---|
| `toggleReaction` | 🔄 ⭐ | Core: insert/delete from `reactions`, update `posts.*_count`. Port directly |
| `fixPostReactionCounts` | 🔄 | Admin: recalculate reaction counts. Port directly |
| `deleteEmptyPosts` | 🔄 | Admin maintenance. Port directly |
| `diagnoseFeed` | 🔄 | Admin diagnostic. Port directly |
| `notifyNewPost` | 🔄 | Send notification on new post. Port directly |
| `getPostsByLocation` | 🔄 | Filter posts by map_city. Port directly |
| `moderateContent` | 🔄 | Admin content moderation. Port directly |

## Reactions & Social

| Function | Status | Notes |
|---|---|---|
| `toggleFollow` | 🔄 ⭐ | Insert/delete from `follows`, update follower counts. Port directly |
| `applyBadge` | 🔄 | Update `user_profiles.verification_badge`. Port directly |
| `cleanupDuplicateReactions` | 🔄 | Admin maintenance. Port directly |
| `boostPost` | 🔄 | Create PostBoost record + update visibility. Port directly |

## Messaging & Calls

| Function | Status | Notes |
|---|---|---|
| `getOrCreateChat` | 🔄 ⭐ | Find or create Chat record. Port directly |
| `sendMessage` | 🔄 ⭐ | Insert Message, update Chat.last_message. Port directly |
| `getChatMessages` | 🔄 ⭐ | Fetch messages for a chat. Port directly |
| `sendDirectMessage` | 🔄 ⭐ | Send DM + create chat if needed. Port directly |
| `initiateCall` | 🔄 ⭐ | Create CallSession (WebRTC signalling). Port directly |
| `sendVoIPCall` | 🔄 ⭐ | Trigger APNs VoIP push. Uses APN_* secrets — port directly |
| `notifyMissedCall` | 🔄 ⭐ | Create MissedCall record. Port directly |
| `checkVoIPStatus` | 🔄 | Check VoIP APNs config. Port directly |
| `sendCallNotification` | 🔄 | Send call push notification. Port directly |

## Notifications & Push

| Function | Status | Notes |
|---|---|---|
| `sendPushNotification` | 🔄 ⭐ | Send APNs/FCM push. Uses Firebase + APN secrets. Port directly |
| `sendApnsPush` | 🔄 ⭐ | Direct APNs push. Uses APN_* secrets. Port directly |
| `notifyNewMessage` | 🔄 ⭐ | Push on new message. Port directly |
| `sendActivityNotification` | 🔄 | Generic activity notification. Port directly |
| `notifyAdminNewUser` | 🔄 | Email admin on new signup. Port directly |
| `notifyLiveStart` | 🔄 | Notify followers of live stream. Port directly |
| `testApnsConfig` | 🔄 | Test APNs connection. Port directly |

## AI Features

| Function | Status | Notes |
|---|---|---|
| `aiChat` | 🔄 ⭐ | OpenAI chat. Uses OPENAI_API_KEY. Port to Edge Function |
| `aiVoiceChat` | 🔄 ⭐ | OpenAI voice + transcribe. Port directly |
| `aiVoiceRealtime` | 🔄 ⭐ | OpenAI Realtime API. Port directly |
| `getRealtimeSession` | 🔄 ⭐ | Get OpenAI Realtime session token. Port directly |
| `adminAIAssistant` | 🔄 | Admin AI. Port directly |
| `checkAIHealth` | 🔄 | Ping OpenAI. Port directly |
| `generateVoice` | 🔄 | TTS via OpenAI. Port directly |
| `searchMusic` | 🔄 | Search music tracks. Port directly |

## Video & Media

| Function | Status | Notes |
|---|---|---|
| `uploadToCloudflare` | 🔄 ⭐ | Upload video to Cloudflare Stream. Uses CLOUDFLARE_* secrets. Port directly |
| `listCloudflareVideos` | 🔄 | List Cloudflare Stream videos. Port directly |
| `checkCloudflareStatus` | 🔄 | Check Cloudflare connection. Port directly |
| `getYouTubeReels` | 🔄 | Fetch YouTube Shorts via API. Uses YOUTUBE_API_KEY. Port directly |
| `getReelsFeed` | 🔄 ⭐ | Combined reels feed. Port directly |
| `addCuratedReel` | 🔄 | Admin: add reel. Port directly |
| `getCuratedReelsAdmin` | 🔄 | Admin: list reels. Port directly |
| `addStockVideo` | 🔄 | Admin: add stock video. Port directly |
| `updateStockVideo` | 🔄 | Admin: update stock video. Port directly |
| `deleteStockVideo` | 🔄 | Admin: delete stock video. Port directly |
| `getStockVideosAdmin` | 🔄 | Admin: list stock videos. Port directly |
| `importStockVideos` | 🔄 | Bulk import from Pexels/Pixabay. Uses PEXELS_API_KEY, PIXABAY_API_KEY. Port directly |
| `autoImportStockVideos` | 🔄 | Scheduled auto-import. Port directly |

## VIP / Subscriptions

| Function | Status | Notes |
|---|---|---|
| `stripeCheckout` | 🔄 ⭐ | Create Stripe checkout session. Uses STRIPE_SECRET_KEY. Port directly |
| `stripeWebhook` | 🔄 ⭐ | Handle Stripe webhooks. Port directly |
| `grantVIPAccess` | 🔄 | Admin: grant VIP. Port directly |
| `removeVIPAccess` | 🔄 | Admin: revoke VIP. Port directly |
| `giftVIPAccess` | 🔄 | Admin: gift VIP subscription. Port directly |
| `getVIPUsers` | 🔄 | Admin: list VIP users. Port directly |
| `getUserSubscription` | 🔄 ⭐ | Get current user subscription. Port directly |
| `expireVIPSubscriptions` | 🔄 | Scheduled: expire subs. Port directly |
| `getBanubaToken` | ✅ | Returns Banuba AR token. Uses BANUBA_CLIENT_TOKEN. Port directly |

## Email / Comms

| Function | Status | Notes |
|---|---|---|
| `sendEmail` | 🔄 ⭐ | Send email via Resend. Uses RESEND_API_KEY. Port directly |
| `adminSendEmail` | 🔄 | Admin bulk email. Port directly |
| `sendAdminBroadcast` | 🔄 | Broadcast to all users. Port directly |
| `sendEmailCampaign` | 🔄 | Targeted email campaign. Port directly |
| `sendEngagementEmails` | 🔄 | Scheduled engagement emails. Port directly |
| `sendFunEmails` | 🔄 | Scheduled fun emails. Port directly |
| `sendVIPPromotionEmails` | 🔄 | VIP promo emails. Port directly |
| `sendCreatorPromotionEmails` | 🔄 | Creator promo emails. Port directly |
| `sendBusinessPromotionEmails` | 🔄 | Business promo emails. Port directly |
| `testEmailSender` | 🔄 | Test email delivery. Port directly |
| `emailTemplates` | 🔄 | Email template library. Port directly |
| `runEmailAutomation` | 🔄 | Scheduled email flows. Port directly |

## Admin & Analytics

| Function | Status | Notes |
|---|---|---|
| `getAnalytics` | 🔄 | App analytics. Port directly |
| `getAdminAnalytics` | 🔄 | Admin analytics dashboard. Port directly |
| `adminGetAllPosts` | 🔄 | Admin: list all posts. Port directly |
| `adminGetAllUsers` | 🔄 | Admin: list all users. Port directly |
| `adminGetAllComments` | 🔄 | Admin: list all comments. Port directly |
| `adminGetAllStories` | 🔄 | Admin: list all stories. Port directly |
| `adminGetUserActivity` | 🔄 | Admin: user activity log. Port directly |
| `adminGetUserReports` | 🔄 | Admin: content reports. Port directly |
| `adminModerateUser` | 🔄 | Admin: warn/lock/suspend user. Port directly |
| `adminSearchUsers` | 🔄 | Admin user search. Port directly |
| `getAdminUsers` | 🔄 | List admin users. Port directly |
| `searchUsers` | 🔄 ⭐ | User search (public). Port directly |
| `getClientInfo` | 🗑️ | Returns Base44-specific client info |
| `setMaintenanceMode` | 🔄 | Admin: toggle maintenance. Port directly |
| `cleanupCorruptedImages` | 🔄 | Admin maintenance. Port directly |
| `createAdCampaign` | 🔄 | Create ad campaign. Port directly |
| `updateUserLocation` | 🔄 | Update user lat/lng. Port directly |

---

## Supabase Edge Function Template

```typescript
// supabase/functions/toggleReaction/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });

    const { post_id, type } = await req.json();
    
    // Check if reaction exists
    const { data: existing } = await supabase
      .from('reactions')
      .select('id')
      .eq('post_id', post_id)
      .eq('user_id', user.id)
      .eq('type', type)
      .single();

    const countField = type === 'like' ? 'likes_count' : type === 'fire' ? 'fire_count' : 'wow_count';
    
    if (existing) {
      await supabase.from('reactions').delete().eq('id', existing.id);
      await supabase.from('posts').update({ [countField]: supabase.rpc('decrement', { x: 1 }) }).eq('id', post_id);
      return new Response(JSON.stringify({ action: 'removed' }), { headers: corsHeaders });
    } else {
      await supabase.from('reactions').insert({ post_id, user_id: user.id, type });
      await supabase.from('posts').update({ [countField]: supabase.rpc('increment', { x: 1 }) }).eq('id', post_id);
      return new Response(JSON.stringify({ action: 'added' }), { headers: corsHeaders });
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
  }
});
```

## Total: 90 functions
- 🔄 ADAPT: 86 (same Deno runtime, just auth client swap)
- 🗑️ REMOVE: 3 (Base44-specific)
- ✅ KEEP AS-IS: 1 (getBanubaToken — pure secret passthrough)