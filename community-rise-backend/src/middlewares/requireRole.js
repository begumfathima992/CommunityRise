import AppError from '../utils/AppError.js';

// Use after requireAuth: router.get('/x', requireAuth, requireRole('admin'), handler)
export default function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return next(new AppError(401, 'Authentication required'));
    if (!roles.includes(req.user.role)) {
      return next(new AppError(403, 'You do not have permission to perform this action'));
    }
    return next();
  };
}
