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

function detailRows(rows) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;font-size:14px;border-collapse:collapse;">
    ${rows
      .map(
        ([label, value]) => `<tr>
          <td style="padding:6px 12px 6px 0;color:#555;vertical-align:top;white-space:nowrap;"><strong>${escapeHtml(label)}</strong></td>
          <td style="padding:6px 0;vertical-align:top;">${escapeHtml(value).replace(/\n/g, '<br>')}</td>
        </tr>`,
      )
      .join('')}
  </table>`;
}

export function tutorApplicationReceivedEmail({ fullName }) {
  const subject = 'Thank you for offering to tutor with Community Rise';
  const html = layout(
    'Thank you for applying',
    `<p>Hi ${escapeHtml(fullName)},</p>
     <p>Thank you for offering to volunteer as a tutor with Community Rise. We've received your application.</p>
     <p><strong>What happens next</strong></p>
     <ol style="padding-left:20px;">
       <li>We'll contact you to arrange an informal chat.</li>
       <li>We'll ask for two references and arrange an enhanced DBS check if you don't already have one.</li>
       <li>You'll complete safeguarding training and shadow a session before you start teaching.</li>
     </ol>
     <p style="font-size:13px;color:#555;">If you have any questions in the meantime, reply to this email or write to help@communityrise.org.uk.</p>`,
  );
  const text = `Hi ${fullName},\n\nThank you for offering to volunteer as a tutor with Community Rise. We've received your application.\n\nWhat happens next:\n1. We'll contact you to arrange an informal chat.\n2. We'll ask for two references and arrange an enhanced DBS check if you don't already have one.\n3. You'll complete safeguarding training and shadow a session before you start teaching.\n\nQuestions? Reply to this email or write to help@communityrise.org.uk.`;
  return { subject, html, text };
}

export function tutorApplicationNotificationEmail({ application, details, reviewUrl }) {
  const subject = `New tutor application — ${application.full_name}`;
  const html = layout(
    'New volunteer tutor application',
    `${detailRows(details)}
     ${button(reviewUrl, 'Review applications')}`,
  );
  const text = `${details.map(([label, value]) => `${label}: ${value}`).join('\n')}\n\nReview applications: ${reviewUrl}`;
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
