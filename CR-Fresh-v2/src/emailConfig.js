/**
 * Contact form backend configuration
 * -------------------------------------
 * The Contact form (and "Request a free place") send messages to the
 * `community-rise-backend` service, which delivers them via Gmail SMTP
 * to help@communityrise.org.uk — sent server-side, with nothing popping
 * up on the visitor's device.
 *
 * The address is worked out from VITE_API_URL, so it follows the API:
 *   development (default) /api/v1                               → /api/contact (via the Vite proxy)
 *   Render                https://api.communityrise.org.uk/api/v1 → https://api.communityrise.org.uk/api/contact
 * Set VITE_CONTACT_API_URL to override it.
 */

const API_BASE = import.meta.env.VITE_API_URL || '/api/v1';

export const CONTACT_API_URL =
  import.meta.env.VITE_CONTACT_API_URL || `${API_BASE.replace(/\/v1\/?$/, '')}/contact`;

export const CONTACT_EMAIL = 'help@communityrise.org.uk';
