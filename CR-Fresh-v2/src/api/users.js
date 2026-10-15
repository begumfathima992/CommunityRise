import api from './client';

/** PATCH /users/me/preferences — e.g. { teaching_updates: true }. */
export const updatePreferences = (preferences) =>
  api.patch('/users/me/preferences', preferences).then((response) => response.data);
