/**
 * SPICEY — Base44 Data Export Scripts
 * =====================================
 * Run each block in your browser console while logged into the Spicey app.
 * The app must be open and you must be logged in as admin.
 *
 * HOW TO USE:
 * 1. Open the Spicey app in your browser
 * 2. Open DevTools → Console
 * 3. Paste and run each export block below
 * 4. Save each output JSON to a file (e.g. posts_export.json)
 *
 * IMPORTANT: base44 client is already initialized on window in the app.
 * Access it via: window.__base44 or import { base44 } from the module.
 * Since you're in the browser, use the SDK directly from the running app.
 */

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: Download JSON as a file
// ─────────────────────────────────────────────────────────────────────────────
function downloadJSON(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
  console.log(`✅ Downloaded: ${filename} (${data.length} records)`);
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: Paginate through all records (Base44 max per call is typically 500)
// ─────────────────────────────────────────────────────────────────────────────
async function exportAll(entityName, sortField = '-created_date') {
  // Access base44 from the running app's module system
  // If this doesn't work, try: const { base44 } = await import('/src/api/base44Client.js')
  const { base44 } = await import('/src/api/base44Client.js');
  const entity = base44.entities[entityName];
  
  let all = [];
  let page = 0;
  const limit = 500;
  
  while (true) {
    const batch = await entity.list(sortField, limit);
    if (!batch || batch.length === 0) break;
    all = all.concat(batch);
    console.log(`  ${entityName}: fetched ${all.length} records...`);
    if (batch.length < limit) break; // last page
    // Base44 doesn't support offset pagination natively; for large datasets contact support
    break;
  }
  
  return all;
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORT ALL ENTITIES
// Paste this entire block into the console and run it.
// It will download one JSON file per entity.
// ─────────────────────────────────────────────────────────────────────────────
async function exportAllEntities() {
  const entities = [
    'Post',
    'UserProfile',
    'Reaction',
    'Comment',
    'Follow',
    'FollowRequest',
    'Notification',
    'Chat',
    'Message',
    'Block',
    'Report',
    'Story',
    'LiveSession',
    'CallSession',
    'MissedCall',
    'Subscription',
    'CuratedReel',
    'StockVideo',
    'AdCampaign',
    'PostBoost',
    'ProfileCategory',
    'ProfilePhotoComment',
    'ProfilePhotoReaction',
    'PresetAvatar',
    'LegalConsent',
  ];

  const results = {};

  for (const name of entities) {
    try {
      console.log(`Exporting ${name}...`);
      const data = await exportAll(name);
      results[name] = data;
      downloadJSON(data, `spicey_export_${name.toLowerCase()}.json`);
      // Small delay to avoid rate limiting
      await new Promise(r => setTimeout(r, 500));
    } catch (err) {
      console.error(`❌ Failed to export ${name}:`, err.message);
      results[name] = { error: err.message };
    }
  }

  // Also download a combined export
  downloadJSON(results, 'spicey_export_ALL.json');
  console.log('✅ Export complete!');
  return results;
}

// Run:
exportAllEntities();


// ─────────────────────────────────────────────────────────────────────────────
// INDIVIDUAL ENTITY EXPORTS (run separately if the bulk export fails)
// ─────────────────────────────────────────────────────────────────────────────

// Posts only:
// exportAll('Post').then(d => downloadJSON(d, 'posts.json'));

// Users / Profiles only:
// exportAll('UserProfile').then(d => downloadJSON(d, 'user_profiles.json'));

// Reactions only:
// exportAll('Reaction').then(d => downloadJSON(d, 'reactions.json'));

// Messages only:
// exportAll('Message').then(d => downloadJSON(d, 'messages.json'));

// Follows only:
// exportAll('Follow').then(d => downloadJSON(d, 'follows.json'));

// Subscriptions only (VIP records):
// exportAll('Subscription').then(d => downloadJSON(d, 'subscriptions.json'));

// ─────────────────────────────────────────────────────────────────────────────
// NOTE: User auth records (email, hashed passwords, user IDs from auth.users)
// CANNOT be exported from the browser. Request these from Base44 support.
// ─────────────────────────────────────────────────────────────────────────────