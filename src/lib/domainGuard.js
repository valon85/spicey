/**
 * Domain guard — ensures sensitive browser permission requests (geolocation,
 * notifications, camera, microphone) are NEVER triggered on Base44 preview
 * or staging domains.  They only fire on:
 *   • spicey.live / www.spicey.live  (production web)
 *   • capacitor:// protocol           (Capacitor iOS / Android native app)
 *
 * This guarantees users will never see "preview-spicey.base44.app" or any
 * Base44 branding in any OS permission dialog.
 */

const ALLOWED_HOSTNAMES = new Set(['spicey.live', 'www.spicey.live']);

/** True when running inside the iOS / Android Capacitor native shell */
export const isNativeApp =
  typeof window !== 'undefined' && window.location.protocol === 'capacitor:';

/** True when running on the production custom domain (web) */
export const isProductionDomain =
  typeof window !== 'undefined' &&
  ALLOWED_HOSTNAMES.has(window.location.hostname);

/**
 * Returns true when it is safe to call browser permission APIs
 * (geolocation, notifications, camera, mic, etc.) without risking
 * that the OS dialog shows a Base44/preview URL.
 */
export function canRequestPermissions() {
  return isNativeApp || isProductionDomain;
}