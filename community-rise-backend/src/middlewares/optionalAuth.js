import { ACCESS_TOKEN_COOKIE } from '../config/auth.js';
import { User } from '../models/index.js';
import { verifyAccessToken } from '../services/session.service.js';
import asyncHandler from '../utils/asyncHandler.js';

// Attaches req.user when a valid access token is present; never rejects.
const optionalAuth = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.[ACCESS_TOKEN_COOKIE];
  if (token) {
    try {
      const payload = verifyAccessToken(token);
      const user = await User.findByPk(payload.sub);
      if (user?.is_active) req.user = user;
    } catch {
      // Invalid or expired token: carry on as a guest.
    }
  }
  next();
});

export default optionalAuth;
