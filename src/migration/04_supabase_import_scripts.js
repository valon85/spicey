/* eslint-disable no-undef */
/**
 * SPICEY — Supabase Data Import Scripts
 * =======================================
 * Node.js script to import exported Base44 JSON files into Supabase.
 *
 * SETUP:
 *   npm install @supabase/supabase-js
 *
 * USAGE:
 *   SUPABASE_URL=https://xxx.supabase.co \
 *   SUPABASE_SERVICE_KEY=your_service_role_key \
 *   node 04_supabase_import_scripts.js
 *
 * IMPORTANT:
 * - Use the SERVICE ROLE key (not anon key) — it bypasses RLS for bulk import
 * - Run AFTER executing src/supabase/schema.sql in Supabase SQL Editor
 * - Auth users must be migrated separately (see notes at bottom)
 * - Run in this order to respect foreign key dependencies:
 *   1. user_profiles (no deps)
 *   2. posts
 *   3. reactions, comments, follows, follow_requests
 *   4. notifications, chats, messages, blocks, reports
 *   5. stories, live_sessions, call_sessions, missed_calls
 *   6. subscriptions, curated_reels, stock_videos
 *   7. ad_campaigns, post_boosts, profile_categories
 *   8. profile_photo_comments, profile_photo_reactions
 *   9. preset_avatars, legal_consents
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Set SUPABASE_URL and SUPABASE_SERVICE_KEY env vars');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false }
});

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: Insert in batches (Supabase max ~1000 rows per insert)
// ─────────────────────────────────────────────────────────────────────────────
async function batchInsert(tableName, rows, batchSize = 200) {
  if (!rows || rows.length === 0) {
    console.log(`  ⚠️  ${tableName}: no rows to insert`);
    return;
  }
  
  let inserted = 0;
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const { error } = await supabase.from(tableName).insert(batch);
    if (error) {
      console.error(`  ❌ ${tableName} batch ${i}-${i+batchSize}: ${error.message}`);
    } else {
      inserted += batch.length;
      console.log(`  ✅ ${tableName}: inserted ${inserted}/${rows.length}`);
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: Load exported JSON file
// ─────────────────────────────────────────────────────────────────────────────
function loadExport(filename) {
  const filepath = path.join(__dirname, 'exports', filename);
  if (!fs.existsSync(filepath)) {
    console.warn(`  ⚠️  File not found: ${filepath} — skipping`);
    return [];
  }
  return JSON.parse(fs.readFileSync(filepath, 'utf8'));
}

// ─────────────────────────────────────────────────────────────────────────────
// FIELD MAPPERS
// Base44 uses string IDs and created_date; Supabase uses UUID and created_at.
// NOTE: If Base44 IDs are UUIDs they can be preserved directly.
// If they are non-UUID strings, they must be transformed or new UUIDs generated.
// ─────────────────────────────────────────────────────────────────────────────

function mapPost(p) {
  return {
    id: p.id,
    author_id: p.author_id,
    author_name: p.author_name,
    author_username: p.author_username,
    author_avatar: p.author_avatar,
    caption: p.caption,
    post_type: p.post_type || 'feed',
    visibility: p.visibility || 'public',
    image_url: p.image_url || null,
    image_urls: p.image_urls || null,
    video_url: p.video_url || null,
    video_link: p.video_link || null,
    location: p.location || null,
    map_visible: p.map_visible || false,
    map_city: p.map_city || null,
    tags: p.tags || null,
    hashtags: p.hashtags || null,
    likes_count: p.likes_count || 0,
    fire_count: p.fire_count || 0,
    wow_count: p.wow_count || 0,
    comments_count: p.comments_count || 0,
    shares_count: p.shares_count || 0,
    music_title: p.music_title || null,
    music_artist: p.music_artist || null,
    music_preview_url: p.music_preview_url || null,
    music_artwork_url: p.music_artwork_url || null,
    created_at: p.created_date || p.created_at || new Date().toISOString(),
    updated_at: p.updated_date || p.updated_at || new Date().toISOString(),
  };
}

function mapUserProfile(p) {
  return {
    // NOTE: id must match auth.users UUID — map user_id to Supabase auth UID
    // You'll need the auth user mapping from Base44 support for this.
    // Placeholder: using user_id as-is; adjust after auth migration.
    id: p.user_id,
    username: p.username,
    full_name: p.full_name || null,
    bio: p.bio || null,
    avatar_url: p.avatar_url || null,
    cover_url: p.cover_url || null,
    is_private: p.is_private || false,
    is_vip: false, // set via Subscription import
    is_verified: p.verified || false,
    followers_count: p.followers_count || 0,
    following_count: p.following_count || 0,
    post_count: p.posts_count || 0,
    role: 'user',
    theme: p.profile_theme || null,
    location: p.location || null,
    website: p.website || null,
    created_at: p.created_date || new Date().toISOString(),
  };
}

function mapReaction(r) {
  return {
    id: r.id,
    post_id: r.post_id,
    user_id: r.user_id,
    type: r.type,
    created_at: r.created_date || new Date().toISOString(),
  };
}

function mapComment(c) {
  return {
    id: c.id,
    post_id: c.post_id,
    author_id: c.author_id,
    author_name: c.author_name,
    author_username: c.author_username || null,
    author_avatar: c.author_avatar || null,
    text: c.text,
    likes_count: c.likes_count || 0,
    created_at: c.created_date || new Date().toISOString(),
  };
}

function mapFollow(f) {
  return {
    id: f.id,
    follower_id: f.follower_id,
    following_id: f.following_id,
    follower_username: f.follower_username || null,
    following_username: f.following_username || null,
    created_at: f.created_date || new Date().toISOString(),
  };
}

function mapNotification(n) {
  return {
    id: n.id,
    user_id: n.user_id,
    type: n.type,
    actor_id: n.actor_id,
    actor_username: n.actor_username || null,
    actor_avatar: n.actor_avatar || null,
    content_id: n.content_id || null,
    message: n.message,
    read: n.read || false,
    created_at: n.created_date || new Date().toISOString(),
  };
}

function mapChat(c) {
  return {
    id: c.id,
    participant_ids: c.participant_ids || [],
    participant_usernames: c.participant_usernames || [],
    last_message: c.last_message || null,
    last_message_time: c.last_message_time || null,
    is_group: c.is_group || false,
    group_name: c.group_name || null,
    group_avatar: c.group_avatar || null,
    created_at: c.created_date || new Date().toISOString(),
  };
}

function mapMessage(m) {
  return {
    id: m.id,
    chat_id: m.chat_id,
    sender_id: m.sender_id,
    sender_username: m.sender_username || null,
    sender_avatar: m.sender_avatar || null,
    text: m.text,
    image_url: m.image_url || null,
    read_by: m.read_by || [],
    reactions: m.reactions || null,
    created_at: m.created_date || new Date().toISOString(),
  };
}

function mapBlock(b) {
  return {
    id: b.id,
    blocker_id: b.blocker_id,
    blocked_id: b.blocked_id,
    blocked_username: b.blocked_username || null,
    created_at: b.created_date || new Date().toISOString(),
  };
}

function mapSubscription(s) {
  return {
    id: s.id,
    user_id: s.user_id,
    status: s.status || 'active',
    plan: s.plan_type || null,
    stripe_customer_id: s.stripe_customer_id || null,
    stripe_subscription_id: s.stripe_subscription_id || null,
    current_period_end: s.current_period_end || null,
    created_at: s.created_date || new Date().toISOString(),
  };
}

function mapCuratedReel(r) {
  return {
    id: r.id,
    title: r.title,
    video_url: r.video_url,
    youtube_video_id: r.youtube_video_id || null,
    thumbnail_url: r.thumbnail_url || null,
    author_name: r.author_name,
    author_username: r.author_username || null,
    author_avatar: r.author_avatar || null,
    caption: r.caption || null,
    source: r.source || null,
    category: r.category || null,
    is_active: r.is_active !== false,
    views_count: r.views_count || 0,
    likes_count: r.likes_count || 0,
    added_by_admin_id: r.added_by_admin_id || null,
    created_at: r.added_at || r.created_date || new Date().toISOString(),
  };
}

function mapStockVideo(v) {
  return {
    id: v.id,
    title: v.title,
    video_url: v.video_url,
    thumbnail_url: v.thumbnail_url || null,
    category: v.category,
    duration: v.duration_seconds || null,
    is_active: v.is_active !== false,
    created_at: v.added_at || v.created_date || new Date().toISOString(),
  };
}

function mapPresetAvatar(a) {
  return {
    id: a.id,
    image_url: a.image_url,
    label: a.label || null,
    gender: a.gender || 'unisex',
    sort_order: a.sort_order || 0,
    is_active: a.is_active !== false,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN IMPORT FUNCTION
// ─────────────────────────────────────────────────────────────────────────────
async function importAll() {
  console.log('🚀 Starting Supabase import...\n');
  console.log('📁 Loading export files from ./exports/ directory...\n');

  // 1. User Profiles (must come before anything referencing user IDs)
  console.log('1/14 Importing user_profiles...');
  const profiles = loadExport('spicey_export_userprofile.json').map(mapUserProfile);
  await batchInsert('user_profiles', profiles);

  // 2. Posts
  console.log('2/14 Importing posts...');
  const posts = loadExport('spicey_export_post.json').map(mapPost);
  await batchInsert('posts', posts);

  // 3. Reactions
  console.log('3/14 Importing reactions...');
  const reactions = loadExport('spicey_export_reaction.json').map(mapReaction);
  await batchInsert('reactions', reactions);

  // 4. Comments
  console.log('4/14 Importing comments...');
  const comments = loadExport('spicey_export_comment.json').map(mapComment);
  await batchInsert('comments', comments);

  // 5. Follows
  console.log('5/14 Importing follows...');
  const follows = loadExport('spicey_export_follow.json').map(mapFollow);
  await batchInsert('follows', follows);

  // 6. Notifications
  console.log('6/14 Importing notifications...');
  const notifications = loadExport('spicey_export_notification.json').map(mapNotification);
  await batchInsert('notifications', notifications);

  // 7. Chats
  console.log('7/14 Importing chats...');
  const chats = loadExport('spicey_export_chat.json').map(mapChat);
  await batchInsert('chats', chats);

  // 8. Messages
  console.log('8/14 Importing messages...');
  const messages = loadExport('spicey_export_message.json').map(mapMessage);
  await batchInsert('messages', messages);

  // 9. Blocks
  console.log('9/14 Importing blocks...');
  const blocks = loadExport('spicey_export_block.json').map(mapBlock);
  await batchInsert('blocks', blocks);

  // 10. Subscriptions
  console.log('10/14 Importing subscriptions...');
  const subs = loadExport('spicey_export_subscription.json').map(mapSubscription);
  await batchInsert('subscriptions', subs);

  // 11. Curated Reels
  console.log('11/14 Importing curated_reels...');
  const reels = loadExport('spicey_export_curatedreel.json').map(mapCuratedReel);
  await batchInsert('curated_reels', reels);

  // 12. Stock Videos
  console.log('12/14 Importing stock_videos...');
  const videos = loadExport('spicey_export_stockvideo.json').map(mapStockVideo);
  await batchInsert('stock_videos', videos);

  // 13. Preset Avatars
  console.log('13/14 Importing preset_avatars...');
  const avatars = loadExport('spicey_export_presetavatar.json').map(mapPresetAvatar);
  await batchInsert('preset_avatars', avatars);

  // 14. Legal Consents
  console.log('14/14 Importing legal_consents...');
  const consents = loadExport('spicey_export_legalconsent.json').map(c => ({
    id: c.id,
    user_id: c.user_id,
    accepted_at: c.accepted_at,
    ip_address: c.ip_address || null,
    user_agent: c.user_agent || null,
    platform: c.platform || null,
    terms_version: c.terms_version || '2.0',
    privacy_version: c.privacy_version || '2.0',
    guidelines_version: c.guidelines_version || '2.0',
    app_version: c.app_version || '1.0.0',
    consent_method: c.consent_method || 'onboarding',
    created_at: c.created_date || new Date().toISOString(),
  }));
  await batchInsert('legal_consents', consents);

  console.log('\n✅ Import complete!');
  console.log('\n⚠️  MANUAL STEPS STILL REQUIRED:');
  console.log('   - Auth users (emails + passwords) must be imported via Base44 support');
  console.log('   - Verify user_profiles.id values match Supabase auth.users UUIDs');
  console.log('   - Media files (images/videos) linked by URL are preserved as-is');
  console.log('   - Push tokens (push_token, voip_push_token) may need re-registration');
}

importAll().catch(console.error);