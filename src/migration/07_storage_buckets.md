# Spicey — Storage Bucket Structure & Migration

## Current Storage (Base44 managed)

Base44 handles all file storage via `base44.integrations.Core.UploadFile()`.
All media URLs in the database are public CDN URLs pointing to Base44's storage.

**These URLs remain valid as long as your Base44 account is active.**
After migration, you have two options:
1. **Leave URLs as-is** — media continues to load from Base44 CDN (simplest; works if staying on Base44 temporarily)
2. **Mirror to Supabase Storage** — download each file and re-upload (full independence)

---

## Target Supabase Storage Buckets

Create these in Supabase Dashboard → Storage → New Bucket:

| Bucket Name | Public | Purpose | Max File Size |
|---|---|---|---|
| `avatars` | ✅ Public | User profile avatars | 5 MB |
| `covers` | ✅ Public | Profile cover photos | 10 MB |
| `posts` | ✅ Public | Post images | 20 MB |
| `stories` | ✅ Public | Story media (24h expiry) | 20 MB |
| `messages` | 🔒 Private | Message attachments | 20 MB |
| `stock-videos` | ✅ Public | Admin stock video library | 500 MB |

Note: Post/reel **videos** should use Cloudflare Stream (already integrated), not Supabase Storage.

---

## Supabase Storage RLS Policies

Run these in SQL Editor after creating the buckets:

```sql
-- ── avatars (public read, owner write) ────────────────────────────────────
create policy "Avatar images are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Users can upload own avatar"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can update own avatar"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can delete own avatar"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ── covers (same pattern as avatars) ──────────────────────────────────────
create policy "Cover images are publicly accessible"
  on storage.objects for select using (bucket_id = 'covers');

create policy "Users can manage own cover"
  on storage.objects for insert
  with check (bucket_id = 'covers' and (storage.foldername(name))[1] = auth.uid()::text);

-- ── posts (public read, authenticated write) ───────────────────────────────
create policy "Post media is publicly accessible"
  on storage.objects for select using (bucket_id = 'posts');

create policy "Authenticated users can upload post media"
  on storage.objects for insert
  with check (bucket_id = 'posts' and auth.role() = 'authenticated');

create policy "Users can delete own post media"
  on storage.objects for delete
  using (bucket_id = 'posts' and (storage.foldername(name))[1] = auth.uid()::text);

-- ── stories (public read, authenticated write) ─────────────────────────────
create policy "Story media is publicly accessible"
  on storage.objects for select using (bucket_id = 'stories');

create policy "Authenticated users can upload stories"
  on storage.objects for insert
  with check (bucket_id = 'stories' and auth.role() = 'authenticated');

-- ── messages (private — signed URL access only) ────────────────────────────
-- No public SELECT policy. Frontend requests signed URLs from an Edge Function
-- that verifies the user is a chat participant before issuing the URL.

-- ── stock-videos (public read, admin write) ────────────────────────────────
create policy "Stock videos are publicly accessible"
  on storage.objects for select using (bucket_id = 'stock-videos');

-- Admin writes handled via service_role key in Edge Functions.
```

---

## File URL Migration Script (Optional)

If you want to mirror all existing Base44-hosted media to Supabase Storage:

```js
// Node.js — run after data import
const { createClient } = require('@supabase/supabase-js');
const https = require('https');
const path = require('path');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function migrateFile(sourceUrl, bucket, destPath) {
  return new Promise((resolve, reject) => {
    https.get(sourceUrl, async (res) => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', async () => {
        const buffer = Buffer.concat(chunks);
        const contentType = res.headers['content-type'] || 'application/octet-stream';
        const { error } = await supabase.storage
          .from(bucket)
          .upload(destPath, buffer, { contentType, upsert: true });
        if (error) reject(error);
        else resolve(`https://${process.env.SUPABASE_URL.split('//')[1]}/storage/v1/object/public/${bucket}/${destPath}`);
      });
    }).on('error', reject);
  });
}

// Example: migrate all post images
async function migratePostMedia(posts) {
  const updates = [];
  for (const post of posts) {
    if (post.image_url && post.image_url.includes('base44')) {
      const ext = path.extname(post.image_url.split('?')[0]) || '.jpg';
      const newUrl = await migrateFile(post.image_url, 'posts', `${post.author_id}/${post.id}${ext}`);
      updates.push({ id: post.id, image_url: newUrl });
    }
  }
  // Batch update posts table with new URLs
  for (const u of updates) {
    await supabase.from('posts').update({ image_url: u.image_url }).eq('id', u.id);
  }
  console.log(`Migrated ${updates.length} post images`);
}
```

---

## Files Already Outside Base44 (No Migration Needed)

These are served from external CDNs and don't need to move:
- ✅ **Cloudflare Stream videos** — `video_url` fields pointing to `*.cloudflarestream.com`
- ✅ **YouTube thumbnails/embeds** — `youtube_video_id` fields
- ✅ **Pexels/Pixabay stock videos** — external URLs
- ✅ **Unsplash demo images** — external URLs
- ✅ **Banuba WASM assets** — in `public/banuba/` (already in repo)
- ✅ **Ready Player Me 3D avatars** — `avatar_3d_url` pointing to `*.readyplayer.me