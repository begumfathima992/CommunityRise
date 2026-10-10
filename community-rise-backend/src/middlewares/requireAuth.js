import jwt from 'jsonwebtoken';
import { ACCESS_TOKEN_COOKIE } from '../config/auth.js';
import { User } from '../models/index.js';
import { verifyAccessToken } from '../services/session.service.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';

// Reads the access_token cookie and attaches the current user as req.user.
const requireAuth = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.[ACCESS_TOKEN_COOKIE];
  if (!token) throw new AppError(401, 'Authentication required');

  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) throw new AppError(401, 'Access token expired');
    throw new AppError(401, 'Invalid access token');
  }

  const user = await User.findByPk(payload.sub);
  if (!user || !user.is_active) throw new AppError(401, 'Authentication required');

  req.user = user;
  next();
});

export default requireAuth;
