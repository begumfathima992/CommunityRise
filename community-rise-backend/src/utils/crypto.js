import crypto from 'node:crypto';

export function generateToken(bytes) {
  return crypto.randomBytes(bytes).toString('base64url');
}

export function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

export function hmacSha256(value, key) {
  return crypto.createHmac('sha256', key).update(value).digest('hex');
}
