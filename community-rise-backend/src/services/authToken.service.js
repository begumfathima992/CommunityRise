// Single-use email verification and password reset tokens.
import { Op } from 'sequelize';
import { AUTH_TOKEN_BYTES } from '../config/auth.js';
import { AuthToken } from '../models/index.js';
import AppError from '../utils/AppError.js';
import { generateToken, sha256 } from '../utils/crypto.js';

// Issues a new token, discarding any earlier unused token of the same type
// so only the most recent email link works.
export async function createAuthToken(userId, type, ttlMs, transaction) {
  await AuthToken.destroy({ where: { user_id: userId, type, used_at: null }, transaction });

  const token = generateToken(AUTH_TOKEN_BYTES);
  await AuthToken.create(
    {
      user_id: userId,
      type,
      token_hash: sha256(token),
      expires_at: new Date(Date.now() + ttlMs),
    },
    { transaction },
  );
  return token;
}

// Finds an unused, unexpired token and locks it for the transaction.
export async function findValidAuthToken(rawToken, type, transaction) {
  const record = await AuthToken.findOne({
    where: {
      token_hash: sha256(rawToken),
      type,
      used_at: null,
      expires_at: { [Op.gt]: new Date() },
    },
    lock: transaction.LOCK.UPDATE,
    transaction,
  });
  if (!record) {
    throw new AppError(400, 'This link is invalid or has expired. Please request a new one.');
  }
  return record;
}
