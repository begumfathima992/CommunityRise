import bcrypt from 'bcrypt';
import { BCRYPT_COST } from '../config/auth.js';

export const hashPassword = (password) => bcrypt.hash(password, BCRYPT_COST);

export const verifyPassword = (password, hash) => bcrypt.compare(password, hash);

export function passwordContainsEmail(password, email) {
  return Boolean(email) && password.toLowerCase().includes(email.toLowerCase());
}

// Compared against when the email is unknown so that response timing
// does not reveal whether an account exists.
export const DUMMY_PASSWORD_HASH = bcrypt.hashSync('timing-equaliser-not-a-real-password', BCRYPT_COST);
