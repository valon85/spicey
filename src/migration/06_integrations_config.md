# Spicey — Integrations Configuration
Source: `base44/functions/*/entry.ts` + `src/api/base44Client.js`

## Environment Variables (Names Only — No Values)

All secrets are stored in Base44 dashboard. Re-enter these in Supabase Dashboard → Project Settings → Edge Functions → Secrets (or via `supabase secrets set`).

| Secret Name | Used By | Supabase Equivalent |
|---|---|---|
| `OPENAI_API_KEY` | aiChat, aiVoiceChat, aiVoiceRealtime, generateVoice, getRealtimeSession | Same — set in Supabase Edge Function secrets |
| `RESEND_API_KEY` | sendEmail, all email functions | Same |
| `STRIPE_SECRET_KEY` | stripeCheckout, stripeWebhook | Same |
| `STRIPE_PUBLISHABLE_KEY` | Frontend Stripe.js | `VITE_STRIPE_PUBLISHABLE_KEY` in Vite env |
| `YOUTUBE_API_KEY` | getYouTubeReels | Same |
| `CLOUDFLARE_ACCOUNT_ID` | uploadToCloudflare, listCloudflareVideos | Same |
| `CLOUDFLARE_STREAM_API_TOKEN` | uploadToCloudflare, listCloudflareVideos | Same |
| `BANUBA_CLIENT_TOKEN` | getBanubaToken | Same |
| `APN_AUTH_KEY` | sendApnsPush, sendVoIPCall | Same |
| `APN_ENV` | sendApnsPush | Same (values: `production` or `sandbox`) |
| `APN_BUNDLE_ID` | sendApnsPush | Same (`live.spicey`) |
| `APN_TEAM_ID` | sendApnsPush | Same |
| `APN_KEY_ID` | sendApnsPush | Same |
| `FIREBASE_API_KEY` | sendPushNotification (Android FCM) | Same |
| `FIREBASE_PROJECT_ID` | sendPushNotification (Android FCM) | Same |
| `PEXELS_API_KEY` | importStockVideos | Same |
| `PIXABAY_API_KEY` | importStockVideos | Same |

### Supabase-Specific Secrets (auto-provided in Edge Functions)
These are injected automatically — do NOT set manually:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

---

## Third-Party Services

### 1. OpenAI
- **Used for:** AI chat, voice chat, realtime voice, TTS, transcription
- **Models:** gpt-4o-mini (default), gpt-4o (heavy tasks), whisper-1 (transcription), tts-1 (speech)
- **Realtime API:** `wss://api.openai.ai/v1/realtime` with `model: gpt-4o-realtime-preview`
- **Migration:** No change — same API calls, just re-point secret

### 2. Stripe
- **Products (Test Mode):**
  - Spicey VIP: `prod_UbQhS7lvuotSxf` — $11.99/month
  - Spicey Creator: `prod_UbQhChfcMPbPPY` — $24.99/month
  - Spicey Business: `prod_UbQhhf2wpeInzL` — $49.99/month
- **Webhook:** Register new endpoint URL after deploying Edge Functions
- **Migration:** Update webhook URL in Stripe Dashboard to point to new Edge Function

### 3. Resend (Email)
- **Used for:** Transactional emails, admin broadcasts, engagement campaigns
- **From address:** Used in `sendEmail` function — check current from_name/from_email in function code
- **Migration:** No change — same API, re-set secret

### 4. Cloudflare Stream
- **Used for:** Video upload, video delivery for reels
- **Account ID + API Token:** Already in secrets
- **Migration:** No change — Cloudflare is independent of Base44

### 5. Apple Push Notifications (APNs)
- **Used for:** Push notifications + VoIP calls on iOS
- **Auth Key:** P8 file content stored in `APN_AUTH_KEY`
- **Bundle ID:** `live.spicey`
- **Migration:** No change — APNs is independent, re-set secrets

### 6. Firebase (FCM)
- **Used for:** Android push notifications
- **Project:** `FIREBASE_PROJECT_ID`
- **Migration:** No change — re-set secrets

### 7. Banuba AR
- **Used for:** AR camera effects in the Create flow
- **Token:** `BANUBA_CLIENT_TOKEN`
- **WASM files:** `public/banuba/` — already in repo, no migration needed
- **Migration:** No change

### 8. YouTube Data API
- **Used for:** Fetching YouTube Shorts for reels feed
- **Key:** `YOUTUBE_API_KEY`
- **Migration:** No change

### 9. Pexels + Pixabay
- **Used for:** Stock video import
- **Keys:** `PEXELS_API_KEY`, `PIXABAY_API_KEY`
- **Migration:** No change

### 10. Mapbox (Maps)
- **Used for:** ContactsMap page
- **Key:** Likely hardcoded in `src/pages/ContactsMap.jsx` or env var — check file
- **Migration:** No change to Mapbox itself; ensure key is re-set if in env

---

## Base44-Specific Integrations (Replaced by Supabase)

| Base44 Feature | Replacement |
|---|---|
| `base44.auth.me()` | `supabase.auth.getUser()` |
| `base44.auth.logout()` | `supabase.auth.signOut()` |
| `base44.auth.updateMe()` | `supabase.from('user_profiles').update()` |
| `base44.entities.X.list()` | `supabase.from('x').select()` |
| `base44.entities.X.filter()` | `supabase.from('x').select().eq().filter()` |
| `base44.entities.X.create()` | `supabase.from('x').insert()` |
| `base44.entities.X.update()` | `supabase.from('x').update().eq('id', id)` |
| `base44.entities.X.delete()` | `supabase.from('x').delete().eq('id', id)` |
| `base44.entities.X.subscribe()` | `supabase.channel('x').on('postgres_changes', ...)` |
| `base44.integrations.Core.InvokeLLM()` | Direct OpenAI API call |
| `base44.integrations.Core.UploadFile()` | `supabase.storage.from('bucket').upload()` |
| `base44.integrations.Core.SendEmail()` | Resend API via Edge Function |
| `base44.integrations.Core.GenerateSpeech()` | OpenAI TTS API |
| `base44.integrations.Core.TranscribeAudio()` | OpenAI Whisper API |
| `base44.integrations.Core.GenerateImage()` | OpenAI DALL-E API |
| `base44.functions.invoke(name, payload)` | `supabase.functions.invoke(name, { body: payload })` |
| `base44.agents.*` | OpenAI Assistants API |
| `base44.analytics.track()` | Posthog / custom events table |

---

## Realtime Configuration

Base44 realtime subscriptions used in:
- `src/lib/AuthContext.jsx` — CallSession + MissedCall (incoming call detection)
- `src/components/messages/ChatView.jsx` — Message (real-time chat)
- Various notification components

**Supabase Realtime replacement pattern:**
```js
// Base44
base44.entities.CallSession.subscribe((event) => { ... });

// Supabase
supabase
  .channel('call_sessions')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'call_sessions',
    filter: `receiver_id=eq.${userId}`,
  }, (payload) => { ... })
  .subscribe();
```

**Required Supabase setting:** Enable Realtime on these tables in Dashboard → Database → Replication:
- `call_sessions`
- `missed_calls`
- `messages`
- `notifications