import axios from 'axios';

/**
 * Shared axios instance for the Community Rise API.
 * Auth uses httpOnly cookies, so every request sends credentials.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  withCredentials: true,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Endpoints whose 401 means "wrong credentials / no session", not
// "access token expired" — never try to refresh for these.
const NO_REFRESH_PATHS = [
  '/auth/login',
  '/auth/register',
  '/auth/refresh',
  '/auth/logout',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/verify-email',
  '/auth/resend-verification',
];

let refreshPromise = null;
let sessionExpiredHandler = () => {};

/** AuthContext registers what to do when the session cannot be renewed. */
export function setSessionExpiredHandler(handler) {
  sessionExpiredHandler = handler;
}

function refreshSession() {
  // One refresh at a time: concurrent 401s all wait on the same promise.
  if (!refreshPromise) {
    refreshPromise = api.post('/auth/refresh').finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const shouldRefresh =
      error.response?.status === 401 &&
      original &&
      !original._retried &&
      !NO_REFRESH_PATHS.some((path) => original.url?.startsWith(path));

    if (!shouldRefresh) return Promise.reject(error);

    original._retried = true;
    try {
      await refreshSession();
    } catch {
      sessionExpiredHandler({ silent: Boolean(original.skipSessionRedirect) });
      return Promise.reject(error);
    }
    return api(original);
  },
);

export default api;
