import * as userService from '../services/user.service.js';
import { sendSuccess } from '../utils/response.js';
import serializeUser from '../utils/serializeUser.js';

export async function updatePreferences(req, res) {
  const user = await userService.updatePreferences(req.user.id, req.body);
  sendSuccess(res, {
    message: user.teaching_updates_opt_in
      ? "You're signed up to hear about new teaching resources."
      : "You won't receive teaching resource emails any more.",
    data: { user: serializeUser(user) },
  });
}
