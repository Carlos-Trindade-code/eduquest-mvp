export const ADMIN_EMAIL = 'carlostrindade@me.com';

/**
 * Validates that a redirect path is safe (relative, no protocol, no double-slash).
 * Returns the path if safe, or the fallback otherwise.
 */
export function safeRedirectPath(path: string | null, fallback: string): string {
  if (!path) return fallback;
  // Must start with / and not contain protocol-like patterns or double slashes
  if (
    !path.startsWith('/') ||
    path.startsWith('//') ||
    path.includes('://') ||
    path.includes('\\')
  ) {
    return fallback;
  }
  return path;
}
