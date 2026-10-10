/**
 * Contact form backend configuration
 * -------------------------------------
 * The Contact form sends messages to a small backend service (see the
 * separate `community-rise-backend` project) which delivers them via
 * Gmail SMTP to help@communityrise.org.uk — sent server-side, with
 * nothing popping up on the visitor's device.
 *
 * IMPORTANT: update CONTACT_API_URL below once the backend is deployed
 * (see community-rise-backend/README.md for full deployment steps).
 * Until then, this points at a local dev server so you can test the
 * whole flow locally first with `npm start` in the backend folder.
 */

export const CONTACT_API_URL = 'http://localhost:5001/api/contact';

export const CONTACT_EMAIL = 'help@communityrise.org.uk';
