import logger from '../config/logger.js';

const reply = (res, status, message) => res.status(status).json({ success: false, message, error: message });

// Errors on /api/contact keep the `error` field the existing Contact page
// reads (data.error), matching the original server.js responses.
// eslint-disable-next-line no-unused-vars
export default function contactErrorHandler(err, req, res, next) {
  if (err.type === 'entity.parse.failed') {
    return reply(res, 400, 'Invalid JSON request body.');
  }
  if (err.type === 'entity.too.large') {
    return reply(res, 413, 'Message is too long.');
  }

  (req.log || logger).error({ err }, 'Unexpected contact form error');
  return reply(res, 500, 'Internal server error.');
}
