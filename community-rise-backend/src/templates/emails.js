import escapeHtml from '../utils/escapeHtml.js';

function layout(title, bodyHtml) {
  return `<!doctype html>
<html lang="en">
  <body style="margin:0;padding:24px;background:#f5f5f5;font-family:Arial,Helvetica,sans-serif;color:#222;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:8px;">
      <tr><td style="padding:32px;">
        <h1 style="margin:0 0 16px;font-size:20px;">${escapeHtml(title)}</h1>
        ${bodyHtml}
        <p style="margin:32px 0 0;font-size:12px;color:#777;">Community Rise &middot; help@communityrise.org.uk</p>
      </td></tr>
    </table>
  </body>
</html>`;
}

function button(url, label) {
  return `<p style="margin:24px 0;">
    <a href="${escapeHtml(url)}" style="display:inline-block;padding:12px 20px;background:#1f6f43;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:bold;">${escapeHtml(label)}</a>
  </p>
  <p style="font-size:13px;color:#555;">If the button does not work, copy this link into your browser:<br>
    <a href="${escapeHtml(url)}" style="color:#1f6f43;word-break:break-all;">${escapeHtml(url)}</a>
  </p>`;
}

export function verificationEmail({ fullName, url }) {
  const subject = 'Confirm your Community Rise email address';
  const html = layout(
    'Confirm your email address',
    `<p>Hi ${escapeHtml(fullName)},</p>
     <p>Thanks for joining Community Rise. Please confirm your email address to finish setting up your account.</p>
     ${button(url, 'Verify email address')}
     <p style="font-size:13px;color:#555;">This link expires in 24 hours. If you did not create an account, you can ignore this email.</p>`,
  );
  const text = `Hi ${fullName},\n\nThanks for joining Community Rise. Confirm your email address by opening this link:\n${url}\n\nThis link expires in 24 hours. If you did not create an account, you can ignore this email.`;
  return { subject, html, text };
}

export function passwordResetEmail({ fullName, url }) {
  const subject = 'Reset your Community Rise password';
  const html = layout(
    'Reset your password',
    `<p>Hi ${escapeHtml(fullName)},</p>
     <p>We received a request to reset your Community Rise password.</p>
     ${button(url, 'Choose a new password')}
     <p style="font-size:13px;color:#555;">This link expires in 1 hour and can only be used once. If you did not ask to reset your password, you can ignore this email; your password will not change.</p>`,
  );
  const text = `Hi ${fullName},\n\nWe received a request to reset your Community Rise password. Choose a new password here:\n${url}\n\nThis link expires in 1 hour and can only be used once. If you did not ask for this, ignore this email.`;
  return { subject, html, text };
}

export function contactEmail({ name, email, reason, message }) {
  return {
    subject: `Community Rise — ${reason} (from ${name})`,
    text: [`Name: ${name}`, `Email: ${email}`, `Reason: ${reason}`, '', 'Message:', message].join('\n'),
    html: `
        <h2>New Community Rise Contact Message</h2>
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Reason:</strong> ${escapeHtml(reason)}</p>
        <p><strong>Message:</strong></p>
        <p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>
      `,
  };
}
