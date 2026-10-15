/**
 * Where to send a user after logging in. Only same-site paths are
 * allowed, so a crafted ?from / state value cannot redirect off-site
 * (e.g. "//evil.example" or "/\\evil.example").
 */
export function safeRedirectPath(from, fallback = '/dashboard') {
  const path =
    typeof from === 'string'
      ? from
      : from && typeof from.pathname === 'string'
        ? `${from.pathname}${from.search || ''}${from.hash || ''}`
        : null;

  if (!path || !path.startsWith('/') || path.startsWith('//') || path.includes('\\')) return fallback;
  if (/^\/(login|register)(\/|\?|#|$)/.test(path)) return fallback;
  return path;
}

export const firstName = (fullName = '') => fullName.trim().split(/\s+/)[0] || fullName;
