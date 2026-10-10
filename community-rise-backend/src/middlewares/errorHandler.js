import env from '../config/env.js';
import logger from '../config/logger.js';
import AppError from '../utils/AppError.js';

export function notFound(req, res) {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  let status = 500;
  let message = 'Internal server error';
  let errors;

  if (err instanceof AppError) {
    status = err.statusCode;
    message = err.message;
    errors = err.errors;
  } else if (err.type === 'entity.parse.failed') {
    status = 400;
    message = 'Invalid JSON request body';
  } else if (err.type === 'entity.too.large') {
    status = 413;
    message = 'Request body is too large';
  } else if (Number.isInteger(err.status) && err.status >= 400 && err.status < 500) {
    status = err.status;
    message = err.expose ? err.message : 'Bad request';
  }

  if (status >= 500) {
    (req.log || logger).error({ err }, 'Unhandled error');
  }

  const body = { success: false, message };
  if (errors) body.errors = errors;
  if (!env.isProduction && status >= 500) body.stack = err.stack;

  res.status(status).json(body);
}
