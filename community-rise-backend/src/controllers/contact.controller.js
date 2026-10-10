import logger from '../config/logger.js';
import { sendContactMessage } from '../services/email.service.js';
import { validateContactForm } from '../validators/contact.validators.js';

// Responses include `error` because the existing frontend reads data.error.
export async function submitContact(req, res) {
  const { value, error } = validateContactForm(req.body);
  if (error) {
    return res.status(400).json({ success: false, message: error, error });
  }

  try {
    await sendContactMessage(value);
    logger.info('Contact email sent successfully');
    return res.status(200).json({
      success: true,
      message: 'Your message has been sent successfully.',
    });
  } catch (err) {
    // Keep SMTP details in server logs only.
    logger.error(
      { err: { message: err.message, code: err.code, command: err.command, responseCode: err.responseCode } },
      'Failed to send contact email',
    );
    const failure = 'Failed to send message. Please try again later.';
    return res.status(500).json({ success: false, message: failure, error: failure });
  }
}
