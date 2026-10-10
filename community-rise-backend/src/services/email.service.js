import env from '../config/env.js';
import { mailer, sendInBackground } from './mailer.service.js';
import { contactEmail, passwordResetEmail, verificationEmail } from '../templates/emails.js';

const linkTo = (pathname, token) => {
  const url = new URL(pathname, env.appUrl);
  url.searchParams.set('token', token);
  return url.toString();
};

export function sendVerificationEmail(user, token) {
  const content = verificationEmail({ fullName: user.full_name, url: linkTo('/verify-email', token) });
  sendInBackground({ to: user.email, ...content }, { type: 'email_verification', userId: user.id });
}

export function sendPasswordResetEmail(user, token) {
  const content = passwordResetEmail({ fullName: user.full_name, url: linkTo('/reset-password', token) });
  sendInBackground({ to: user.email, ...content }, { type: 'password_reset', userId: user.id });
}

// Awaited: the contact form reports delivery failures back to the visitor.
export function sendContactMessage({ name, email, reason, message }) {
  return mailer.sendMail({
    from: { name: 'Community Rise Website', address: env.GMAIL_USER },
    to: env.CONTACT_RECIPIENT || env.GMAIL_USER,
    replyTo: email,
    ...contactEmail({ name, email, reason, message }),
  });
}
