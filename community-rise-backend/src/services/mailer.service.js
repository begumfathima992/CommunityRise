// Email delivery through Resend's HTTPS API (https://resend.com/docs/api-reference/emails/send-email).
// HTTPS rather than SMTP because some hosts (e.g. Render's free instances)
// block outbound SMTP ports. Configured by RESEND_API_KEY and MAIL_FROM.
import env from '../config/env.js';
import logger from '../config/logger.js';

// Keeps a slow or unreachable provider from holding a request open.
export const SEND_TIMEOUT_MS = 5000;

export class EmailSendError extends Error {
  constructor(message, { code, status } = {}) {
    super(message);
    this.name = 'EmailSendError';
    this.code = code;
    if (status) this.status = status;
  }
}

const displayName = (name) => (name ? `"${name.replace(/["\\<>\r\n]/g, '')}" ` : '');

/**
 * Builds a mailer with the same call shape the services use:
 *   sendMail({ from?: { name }, to, replyTo?, subject, html, text })
 * The sender address always comes from MAIL_FROM (it must be on a domain
 * verified with Resend); callers may only change the display name.
 */
export function createResendMailer({
  apiKey,
  from,
  baseUrl,
  timeoutMs = SEND_TIMEOUT_MS,
  // Looked up per call so the global fetch can be swapped (e.g. in tests).
  fetchImpl = (...args) => globalThis.fetch(...args),
}) {
  return {
    async sendMail({ from: fromOverride, to, replyTo, subject, html, text }) {
      if (!apiKey || !from) {
        throw new EmailSendError('Email sending is not configured: set RESEND_API_KEY and MAIL_FROM', {
          code: 'EMAIL_NOT_CONFIGURED',
        });
      }

      const payload = {
        from: `${displayName(fromOverride?.name ?? from.name)}<${from.address}>`,
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
        text,
      };
      if (replyTo) payload.reply_to = replyTo;

      let response;
      try {
        response = await fetchImpl(`${baseUrl.replace(/\/$/, '')}/emails`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(timeoutMs),
        });
      } catch (err) {
        if (err.name === 'TimeoutError' || err.name === 'AbortError') {
          throw new EmailSendError(`Email provider did not respond within ${timeoutMs}ms`, { code: 'ETIMEDOUT' });
        }
        throw new EmailSendError(`Could not reach the email provider: ${err.message}`, { code: 'ENETWORK' });
      }

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new EmailSendError(`Email provider rejected the message: ${data.message || response.statusText}`, {
          code: data.name || 'EPROVIDER',
          status: response.status,
        });
      }
      return { id: data.id };
    },
  };
}

// Exposed as an object so tests can replace sendMail with a spy.
export const mailer = createResendMailer({
  apiKey: env.RESEND_API_KEY,
  from: env.MAIL_FROM,
  baseUrl: env.RESEND_API_URL,
});

export const isEmailConfigured = () => Boolean(env.RESEND_API_KEY && env.MAIL_FROM);

// Safe-to-log details of a send failure (never includes the API key).
export const describeEmailError = (err) => ({ message: err.message, code: err.code, status: err.status });

// Send without blocking the response; failures are logged, never surfaced.
// Keeps response timing independent of the provider and avoids leaking
// whether an account exists on forgot-password / resend-verification.
export function sendInBackground(options, context) {
  Promise.resolve()
    .then(() => mailer.sendMail(options))
    .catch((err) => {
      logger.error({ err: describeEmailError(err), context }, 'Failed to send email');
    });
}
