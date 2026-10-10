// Operational error with an HTTP status. Anything else reaching the
// error handler is treated as an unexpected 500.
export default class AppError extends Error {
  constructor(statusCode, message, errors) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    if (errors) this.errors = errors;
    Error.captureStackTrace?.(this, AppError);
  }

  static validation(errors, message = 'Validation failed') {
    return new AppError(422, message, errors);
  }
}
