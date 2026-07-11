/**
 * Parse user text to detect app-level voice commands.
 * Returns null if it's just a regular chat message.
 * Returns { intent, params } for recognized commands.
 *
 * Intents:
 *   post_feed, post_story, create_reel
 *   call_user, message_user, send_caption
 *   open_profile, open_notifications, open_messages, open_explore
 */

export function parseVoiceCommand(text) {
  const t = text.toLowerCase().trim();

  // ── Navigation commands ──────────────────────────────────
  if (/open (my )?profile|go to (my )?profile|show (my )?profile/.test(t)) {
    return { intent: 'open_profile', params: {} };
  }
  if (/open (my )?notification|show (my )?notification/.test(t)) {
    return { intent: 'open_notifications', params: {} };
  }
  if (/open (my )?messages?|go to (my )?messages?|show (my )?messages?/.test(t)) {
    return { intent: 'open_messages', params: {} };
  }
  if (/open explore|go to explore|show explore/.test(t)) {
    return { intent: 'open_explore', params: {} };
  }

  // ── Post commands ──────────────────────────────────────────
  if (/post (this )?to (my )?story|share (this )?to (my )?story|add (this )?to (my )?story/.test(t)) {
    return { intent: 'post_story', params: {} };
  }
  if (/post (this )?to (my )?feed|share (this )?to (my )?feed|publish (this )?to (my )?feed|post (this )?photo/.test(t)) {
    return { intent: 'post_feed', params: {} };
  }
  if (/create (a )?reel|post (this )?as (a )?reel|make (a )?reel|upload (this )?reel/.test(t)) {
    return { intent: 'create_reel', params: {} };
  }

  // ── Call commands ──────────────────────────────────────────
  const callMatch = t.match(/call\s+(.+?)(?:\s+on spicey)?(?:\s*$)/);
  if (callMatch) {
    const name = callMatch[1].replace(/\bon spicey\b/g, '').trim();
    if (name.length > 0 && name.length < 50) {
      return { intent: 'call_user', params: { name } };
    }
  }

  // ── Message commands ──────────────────────────────────────
  const msgMatch = t.match(/(?:message|text|dm|send (a )?message to)\s+(.+?)(?:\s+on spicey)?(?:\s*$)/);
  if (msgMatch) {
    const name = (msgMatch[2] || '').replace(/\bon spicey\b/g, '').trim();
    if (name.length > 0 && name.length < 50) {
      return { intent: 'message_user', params: { name } };
    }
  }

  // ── Send caption to friend ────────────────────────────────
  const captionMatch = t.match(/send (this )?caption to\s+(.+)/);
  if (captionMatch) {
    const name = captionMatch[2].trim();
    if (name.length > 0) {
      return { intent: 'send_caption', params: { name } };
    }
  }

  return null;
}