import { User } from '../models/index.js';
import AppError from '../utils/AppError.js';

export async function updatePreferences(userId, { teaching_updates }) {
  const user = await User.findByPk(userId);
  if (!user) throw new AppError(401, 'Authentication required');

  // Keep the original opt-in time unless the user opts in again after opting out.
  if (teaching_updates !== user.teaching_updates_opt_in) {
    await user.update({
      teaching_updates_opt_in: teaching_updates,
      teaching_updates_opt_in_at: teaching_updates ? new Date() : null,
    });
  }
  return user;
}
