// Gmail SMTP transport, authenticated with a Google App Password
// (NOT the account's normal login password). See the README.
import nodemailer from 'nodemailer';
import env from '../config/env.js';
import logger from '../config/logger.js';

// Fail fast if SMTP is unreachable (e.g. a host that blocks outbound mail
// ports): nodemailer's default 2-minute wait outlasts reverse-proxy timeouts,
// which turns a clean "failed to send" into a 502.
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: env.GMAIL_USER,
    pass: env.GMAIL_APP_PASSWORD,
  },
  connectionTimeout: 10_000,
  greetingTimeout: 10_000,
  socketTimeout: 20_000,
});

// Exposed as an object so tests can replace sendMail with a spy.
export const mailer = {
  sendMail(options) {
    return transporter.sendMail({
      from: { name: 'Community Rise', address: env.GMAIL_USER },
      ...options,
    });
  },
};

// Send without blocking the response; failures are logged, never surfaced.
// Keeps response timing independent of SMTP and avoids leaking whether
// an account exists on forgot-password / resend-verification.
export function sendInBackground(options, context) {
  Promise.resolve()
    .then(() => mailer.sendMail(options))
    .catch((err) => {
      logger.error(
        { err: { message: err.message, code: err.code, responseCode: err.responseCode }, context },
        'Failed to send email',
      );
    });
}
