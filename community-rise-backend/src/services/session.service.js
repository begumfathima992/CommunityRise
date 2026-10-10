// Access/refresh token issuance, rotation and revocation.
import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import logger from '../config/logger.js';
import {
  ACCESS_TOKEN_TTL_SECONDS,
  JWT_AUDIENCE,
  JWT_ISSUER,
  REFRESH_TOKEN_BYTES,
  REFRESH_TOKEN_TTL_MS,
} from '../config/auth.js';
import { RefreshToken, User, sequelize } from '../models/index.js';
import AppError from '../utils/AppError.js';
import { generateToken, hmacSha256 } from '../utils/crypto.js';

// Keyed SHA-256 (HMAC) so a leaked database alone cannot be used to
// check guessed tokens.
export const hashRefreshToken = (token) => hmacSha256(token, env.JWT_REFRESH_SECRET);

export function signAccessToken(user) {
  return jwt.sign({ role: user.role }, env.JWT_ACCESS_SECRET, {
    subject: user.id,
    expiresIn: ACCESS_TOKEN_TTL_SECONDS,
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
    algorithm: 'HS256',
  });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, env.JWT_ACCESS_SECRET, {
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
    algorithms: ['HS256'],
  });
}

async function createRefreshToken(userId, meta, transaction) {
  const token = generateToken(REFRESH_TOKEN_BYTES);
  const record = await RefreshToken.create(
    {
      user_id: userId,
      token_hash: hashRefreshToken(token),
      expires_at: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
      created_by_ip: meta.ip,
      user_agent: meta.userAgent,
    },
    { transaction },
  );
  return { token, record };
}

export async function issueSession(user, meta, transaction) {
  const { token: refreshToken } = await createRefreshToken(user.id, meta, transaction);
  return { accessToken: signAccessToken(user), refreshToken };
}

export async function revokeAllForUser(userId, transaction) {
  await RefreshToken.update(
    { revoked_at: new Date() },
    { where: { user_id: userId, revoked_at: null }, transaction },
  );
}

const invalidSession = () => new AppError(401, 'Your session has expired. Please log in again.');

export async function rotateRefreshToken(rawToken, meta) {
  if (!rawToken) throw invalidSession();
  const tokenHash = hashRefreshToken(rawToken);

  const outcome = await sequelize.transaction(async (transaction) => {
    const current = await RefreshToken.findOne({
      where: { token_hash: tokenHash },
      lock: transaction.LOCK.UPDATE,
      transaction,
    });
    if (!current) return { error: 'invalid' };

    if (current.revoked_at) {
      // A token that was already rotated being presented again means it
      // was copied: kill every session for this user. Tokens revoked by
      // logout / logout-all / password change are simply rejected, so a
      // signed-out device cannot log out the user's other sessions.
      if (!current.replaced_by_token_id) return { error: 'invalid' };
      await revokeAllForUser(current.user_id, transaction);
      return { error: 'reuse', userId: current.user_id };
    }

    if (current.expires_at <= new Date()) return { error: 'invalid' };

    const user = await User.findByPk(current.user_id, { transaction });
    if (!user || !user.is_active) {
      await current.update({ revoked_at: new Date() }, { transaction });
      return { error: 'invalid' };
    }

    const { token, record } = await createRefreshToken(user.id, meta, transaction);
    await current.update({ revoked_at: new Date(), replaced_by_token_id: record.id }, { transaction });

    return { user, accessToken: signAccessToken(user), refreshToken: token };
  });

  if (outcome.error === 'reuse') {
    logger.warn({ userId: outcome.userId, ip: meta.ip }, 'Refresh token reuse detected; all sessions revoked');
  }
  if (outcome.error) throw invalidSession();
  return outcome;
}

export async function revokeRefreshToken(rawToken) {
  if (!rawToken) return;
  await RefreshToken.update(
    { revoked_at: new Date() },
    { where: { token_hash: hashRefreshToken(rawToken), revoked_at: null } },
  );
}
