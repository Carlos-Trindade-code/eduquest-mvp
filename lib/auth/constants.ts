const adminEmails = process.env.ADMIN_EMAILS || process.env.NEXT_PUBLIC_ADMIN_EMAILS || 'carlostrindade@me.com';
export const ADMIN_EMAILS = adminEmails.split(',').map(e => e.trim().toLowerCase());
export const ADMIN_EMAIL = ADMIN_EMAILS[0];

export function isAdminEmail(email: string | undefined | null): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

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
