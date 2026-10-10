import { UniqueConstraintError } from 'sequelize';
import {
  EMAIL_VERIFICATION_TTL_MS,
  LOCKOUT_DURATION_MS,
  MAX_FAILED_LOGIN_ATTEMPTS,
  PASSWORD_RESET_TTL_MS,
} from '../config/auth.js';
import { AUTH_TOKEN_TYPES } from '../models/authToken.model.js';
import { AuthToken, User, sequelize } from '../models/index.js';
import AppError from '../utils/AppError.js';
import {
  DUMMY_PASSWORD_HASH,
  hashPassword,
  passwordContainsEmail,
  verifyPassword,
} from '../utils/password.js';
import { createAuthToken, findValidAuthToken } from './authToken.service.js';
import { sendPasswordResetEmail, sendVerificationEmail } from './email.service.js';
import { issueSession, revokeAllForUser, revokeRefreshToken, rotateRefreshToken } from './session.service.js';

const INVALID_CREDENTIALS = 'Invalid email or password';
const PASSWORD_CONTAINS_EMAIL = 'Password must not contain your email address';

const emailTaken = () =>
  new AppError(409, 'An account with this email already exists.', {
    email: ['An account with this email already exists'],
  });

function lockedError(lockedUntil) {
  const minutes = Math.max(1, Math.ceil((lockedUntil.getTime() - Date.now()) / 60000));
  return new AppError(
    423,
    `Too many failed login attempts. Your account is locked; please try again in ${minutes} minute${minutes === 1 ? '' : 's'}.`,
  );
}

export async function register({ full_name, email, signup_reason, password }, meta) {
  // paranoid: false so a soft-deleted account still reserves its email.
  const existing = await User.findOne({ where: { email }, paranoid: false });
  if (existing) throw emailTaken();

  const password_hash = await hashPassword(password);

  let result;
  try {
    result = await sequelize.transaction(async (transaction) => {
      const user = await User.create(
        { full_name, email, signup_reason, password_hash, consent_given_at: new Date() },
        { transaction },
      );
      const verificationToken = await createAuthToken(
        user.id,
        AUTH_TOKEN_TYPES.EMAIL_VERIFICATION,
        EMAIL_VERIFICATION_TTL_MS,
        transaction,
      );
      const session = await issueSession(user, meta, transaction);
      return { user, session, verificationToken };
    });
  } catch (err) {
    if (err instanceof UniqueConstraintError) throw emailTaken();
    throw err;
  }

  sendVerificationEmail(result.user, result.verificationToken);
  return { user: result.user, session: result.session };
}

async function recordFailedLogin(user) {
  const [rows] = await sequelize.query(
    `UPDATE users
        SET failed_login_attempts = failed_login_attempts + 1, updated_at = NOW()
      WHERE id = :id
      RETURNING failed_login_attempts`,
    { replacements: { id: user.id } },
  );
  const attempts = rows[0]?.failed_login_attempts ?? 0;

  if (attempts >= MAX_FAILED_LOGIN_ATTEMPTS) {
    const lockedUntil = new Date(Date.now() + LOCKOUT_DURATION_MS);
    await User.update(
      { failed_login_attempts: 0, locked_until: lockedUntil },
      { where: { id: user.id } },
    );
    throw lockedError(lockedUntil);
  }
}

export async function login({ email, password }, meta) {
  const user = await User.scope('withPassword').findOne({ where: { email } });

  if (!user) {
    await verifyPassword(password, DUMMY_PASSWORD_HASH);
    throw new AppError(401, INVALID_CREDENTIALS);
  }

  if (user.locked_until && user.locked_until > new Date()) {
    throw lockedError(user.locked_until);
  }

  const passwordMatches = await verifyPassword(password, user.password_hash);
  if (!passwordMatches) {
    await recordFailedLogin(user);
    throw new AppError(401, INVALID_CREDENTIALS);
  }

  if (!user.is_active) {
    throw new AppError(403, 'This account has been deactivated. Please contact support.');
  }

  await user.update({ failed_login_attempts: 0, locked_until: null, last_login_at: new Date() });
  const session = await issueSession(user, meta);
  return { user, session };
}

export const refresh = (rawToken, meta) => rotateRefreshToken(rawToken, meta);

export const logout = (rawToken) => revokeRefreshToken(rawToken);

export const logoutAll = (userId) => revokeAllForUser(userId);

export async function verifyEmail(rawToken) {
  return sequelize.transaction(async (transaction) => {
    const record = await findValidAuthToken(rawToken, AUTH_TOKEN_TYPES.EMAIL_VERIFICATION, transaction);
    const user = await User.findByPk(record.user_id, { transaction });
    if (!user) {
      throw new AppError(400, 'This link is invalid or has expired. Please request a new one.');
    }

    await record.update({ used_at: new Date() }, { transaction });
    if (!user.is_email_verified) {
      await user.update({ is_email_verified: true, email_verified_at: new Date() }, { transaction });
    }
    return user;
  });
}

export async function resendVerification(email) {
  const user = await User.findOne({ where: { email } });
  if (!user || user.is_email_verified || !user.is_active) return;

  const token = await sequelize.transaction((transaction) =>
    createAuthToken(user.id, AUTH_TOKEN_TYPES.EMAIL_VERIFICATION, EMAIL_VERIFICATION_TTL_MS, transaction),
  );
  sendVerificationEmail(user, token);
}

export async function forgotPassword(email) {
  const user = await User.findOne({ where: { email } });
  if (!user || !user.is_active) return;

  const token = await sequelize.transaction((transaction) =>
    createAuthToken(user.id, AUTH_TOKEN_TYPES.PASSWORD_RESET, PASSWORD_RESET_TTL_MS, transaction),
  );
  sendPasswordResetEmail(user, token);
}

export async function resetPassword({ token, password }) {
  await sequelize.transaction(async (transaction) => {
    const record = await findValidAuthToken(token, AUTH_TOKEN_TYPES.PASSWORD_RESET, transaction);
    const user = await User.findByPk(record.user_id, { transaction });
    if (!user || !user.is_active) {
      throw new AppError(400, 'This link is invalid or has expired. Please request a new one.');
    }
    if (passwordContainsEmail(password, user.email)) {
      throw AppError.validation({ password: [PASSWORD_CONTAINS_EMAIL] });
    }

    const now = new Date();
    await user.update(
      { password_hash: await hashPassword(password), failed_login_attempts: 0, locked_until: null },
      { transaction },
    );
    await record.update({ used_at: now }, { transaction });
    await AuthToken.destroy({
      where: { user_id: user.id, type: AUTH_TOKEN_TYPES.PASSWORD_RESET, used_at: null },
      transaction,
    });
    await revokeAllForUser(user.id, transaction);
  });
}

export async function changePassword(userId, { current_password, new_password }, meta) {
  const user = await User.scope('withPassword').findByPk(userId);
  if (!user) throw new AppError(401, 'Authentication required');

  if (!(await verifyPassword(current_password, user.password_hash))) {
    throw AppError.validation({ current_password: ['Current password is incorrect'] });
  }
  if (passwordContainsEmail(new_password, user.email)) {
    throw AppError.validation({ new_password: [PASSWORD_CONTAINS_EMAIL] });
  }
  if (await verifyPassword(new_password, user.password_hash)) {
    throw AppError.validation({ new_password: ['New password must be different from your current password'] });
  }

  const password_hash = await hashPassword(new_password);

  // Sign out every other device, then start a fresh session for this one.
  return sequelize.transaction(async (transaction) => {
    await user.update({ password_hash }, { transaction });
    await revokeAllForUser(user.id, transaction);
    return issueSession(user, meta, transaction);
  });
}
