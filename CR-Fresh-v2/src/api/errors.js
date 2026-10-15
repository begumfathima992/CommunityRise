import axios from 'axios';

const NETWORK_ERROR = "We couldn't reach Community Rise. Please check your connection and try again.";
const SERVER_ERROR = 'Something went wrong on our side. Please try again in a moment.';

export const getStatus = (error) => (axios.isAxiosError(error) ? error.response?.status : undefined);

/**
 * Turns an API error into a message suitable for showing to the user.
 * `overrides` maps status codes to page-specific wording.
 */
export function getErrorMessage(error, overrides = {}) {
  if (!axios.isAxiosError(error)) return SERVER_ERROR;
  if (!error.response) return NETWORK_ERROR;

  const { status, data } = error.response;
  if (overrides[status]) return overrides[status];

  switch (status) {
    case 401:
      return data?.message || 'Please log in to continue.';
    case 409:
      return data?.message || 'An account with this email already exists.';
    case 422:
      return 'Please check the highlighted fields and try again.';
    case 423:
      return data?.message || 'Your account is temporarily locked. Please try again later.';
    case 429:
      return data?.message || 'Too many attempts. Please wait a while and try again.';
    default:
      if (status >= 500) return SERVER_ERROR;
      return data?.message || SERVER_ERROR;
  }
}

/**
 * Copies backend field errors ({ field: [messages] }, sent with 409/422)
 * onto react-hook-form fields. Returns true if any field was set.
 */
export function applyServerFieldErrors(error, setError, fieldNames) {
  const fieldErrors = axios.isAxiosError(error) ? error.response?.data?.errors : undefined;
  if (!fieldErrors) return false;

  let applied = false;
  for (const name of fieldNames) {
    const messages = fieldErrors[name];
    if (messages?.length) {
      setError(name, { type: 'server', message: messages[0] }, { shouldFocus: !applied });
      applied = true;
    }
  }
  return applied;
}
