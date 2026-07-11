# What Cannot Be Exported Automatically
## Must Be Obtained from Base44 Support

The items below are held by Base44's infrastructure and are not accessible through the SDK, browser console, or the app's source code. **Contact Base44 support to request these.**

---

## 1. 🔴 AUTH USERS (CRITICAL)

**What it is:** The list of all registered user accounts — email addresses, hashed passwords, user UUIDs, creation timestamps, email verification status.

**Why it's blocked:** Base44's auth system manages user credentials server-side. The SDK `base44.auth.me()` only returns the currently logged-in user, not a full user list.

**What to request from Base44 support:**
```
Please export all auth users for app ID [your app ID] in CSV or JSON format, including:
- user_id (UUID)
- email
- created_at
- email_verified_at
- role
```

**Why it's critical for migration:**
- `user_profiles.id` in Supabase must equal `auth.users.id`
- Without this mapping, all foreign key relationships break
- You cannot re-create user accounts without their original UUIDs (or you must re-map all IDs)

**Supabase workaround (if Base44 won't provide UUIDs):**
Use Supabase's `supabase.auth.admin.createUser()` for each user, which creates new UUIDs. Then run a remapping script to update all `author_id`, `user_id`, `sender_id`, etc. fields in the imported data. This is complex but doable.

---

## 2. 🔴 STORAGE/MEDIA FILES (if hosted on Base44 CDN)

**What it is:** Any images or videos uploaded via `base44.integrations.Core.UploadFile()` that are hosted on Base44's CDN (URLs containing `base44.com` or Base44's storage domain).

**Why it's blocked:** Files are stored in Base44's S3-equivalent. You can see the URLs in your data but cannot bulk-download them through the SDK.

**What to request:**
```
Please provide a bulk export (ZIP or S3 bucket access) of all media files 
uploaded for app ID [your app ID].
```

**Workaround:** Use the `07_storage_buckets.md` file migration script to download each file by its URL and re-upload to Supabase Storage (works if files are publicly accessible via their CDN URL).

---

## 3. 🟡 SECRET VALUES

**What they are:** The actual values of all environment variables/secrets (not just their names).

These secrets are:
- `OPENAI_API_KEY` — re-get from platform.openai.com
- `RESEND_API_KEY` — re-get from resend.com
- `STRIPE_SECRET_KEY` / `STRIPE_PUBLISHABLE_KEY` — re-get from dashboard.stripe.com
- `YOUTUBE_API_KEY` — re-get from console.cloud.google.com
- `CLOUDFLARE_ACCOUNT_ID` / `CLOUDFLARE_STREAM_API_TOKEN` — re-get from dash.cloudflare.com
- `BANUBA_CLIENT_TOKEN` — re-get from dash.banuba.com
- `APN_AUTH_KEY` (P8 file content) — re-get from developer.apple.com
- `APN_ENV`, `APN_BUNDLE_ID`, `APN_TEAM_ID`, `APN_KEY_ID` — from Apple Developer account
- `FIREBASE_API_KEY`, `FIREBASE_PROJECT_ID` — re-get from console.firebase.google.com
- `PEXELS_API_KEY` — re-get from pexels.com/api
- `PIXABAY_API_KEY` — re-get from pixabay.com/api

**Action:** Re-retrieve each from the originating service's dashboard. None of these require Base44 support.

---

## 4. 🟡 STRIPE WEBHOOK SIGNING SECRET

**What it is:** `STRIPE_WEBHOOK_SECRET` — the signing secret for verifying Stripe webhook payloads.

**Why:** This is generated when you register a webhook endpoint in the Stripe Dashboard. When you move to Supabase Edge Functions, you'll register a new endpoint URL and get a new signing secret.

**Action:** After deploying `stripeWebhook` as a Supabase Edge Function:
1. Go to Stripe Dashboard → Developers → Webhooks
2. Delete the old Base44 webhook endpoint
3. Add new endpoint pointing to your Supabase Edge Function URL
4. Copy the new signing secret → set as `STRIPE_WEBHOOK_SECRET` in Supabase secrets

---

## 5. 🟡 APPLE DEVELOPER CERTIFICATES & PROVISIONING

**What they are:** iOS code signing certificates, provisioning profiles, and the APNs P8 auth key file.

**Why:** These are in your Apple Developer account, not Base44. If you built the iOS app through Base44's Capacitor build system, you may need to locate these.

**Action:**
- Log into developer.apple.com
- Download the APNs Auth Key (`.p8` file) — this is `APN_AUTH_KEY`
- Download provisioning profiles for `live.spicey`

---

## 6. 🟢 NOT NEEDED (Already in Repo)

These do NOT require Base44 support — they're already in your source code:

| Item | Location |
|---|---|
| All source code | `src/` |
| All entity schemas | `base44/entities/*.jsonc` |
| All backend function code | `base44/functions/*/entry.ts` |
| Supabase schema SQL | `src/supabase/schema.sql` |
| Banuba WASM SDK | `public/banuba/` |
| iOS native files | `src/ios/` |
| Capacitor config | `src/capacitor.config.json` |
| Codemagic CI config | `src/codemagic.yaml` |
| All migration docs | `src/migration/` |

---

## Summary Checklist

| Item | Can Self-Export | Requires Support |
|---|---|---|
| Source code | ✅ | — |
| Entity schemas | ✅ | — |
| Backend functions | ✅ | — |
| Entity data records | ✅ (browser console script) | — |
| Auth users list | ❌ | 🔴 Contact Base44 support |
| User UUIDs | ❌ | 🔴 Contact Base44 support |
| CDN-hosted media files | ✅ (if publicly accessible URLs) | 🟡 If private |
| Secret values | ❌ | 🟡 Re-get from each service |
| Stripe webhook secret | ❌ | 🟡 Re-register on Stripe |
| APNs P8 key | ❌ | 🟡 Re-download from Apple |