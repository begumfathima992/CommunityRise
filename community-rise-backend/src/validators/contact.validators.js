// Contact form validation. Kept as plain checks (not zod) so the
// response messages stay exactly what the existing frontend expects.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Returns { value } on success or { error } with a user-facing message.
export function validateContactForm(body) {
  const { name, email, reason, message } = body || {};

  if (
    typeof name !== 'string' ||
    typeof email !== 'string' ||
    typeof reason !== 'string' ||
    typeof message !== 'string' ||
    !name.trim() ||
    !email.trim() ||
    !reason.trim() ||
    !message.trim()
  ) {
    return { error: 'All fields are required.' };
  }

  const value = {
    name: name.trim(),
    email: email.trim(),
    reason: reason.trim(),
    message: message.trim(),
  };

  if (value.name.length > 150 || value.email.length > 254 || value.reason.length > 200) {
    return { error: 'One or more fields are too long.' };
  }
  if (value.message.length > 5000) {
    return { error: 'Message must not exceed 5000 characters.' };
  }
  if (!EMAIL_PATTERN.test(value.email)) {
    return { error: 'Please provide a valid email address.' };
  }

  return { value };
}
