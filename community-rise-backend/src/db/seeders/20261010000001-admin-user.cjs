'use strict';

// Creates a single admin user from ADMIN_EMAIL / ADMIN_PASSWORD.
// Safe to re-run: skips if a user with that email already exists.
const bcrypt = require('bcrypt');

const BCRYPT_COST = 12;

function readAdminCredentials() {
  const email = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || '';
  const fullName = (process.env.ADMIN_FULL_NAME || 'Community Rise Admin').trim();

  const problems = [];
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) problems.push('ADMIN_EMAIL must be a valid email');
  if (password.length < 10 || password.length > 128) problems.push('ADMIN_PASSWORD must be 10-128 characters');
  if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
    problems.push('ADMIN_PASSWORD needs an uppercase letter, a lowercase letter and a number');
  }
  if (email && password.toLowerCase().includes(email)) problems.push('ADMIN_PASSWORD must not contain ADMIN_EMAIL');
  if (problems.length) {
    throw new Error(`Cannot seed admin user:\n  - ${problems.join('\n  - ')}`);
  }
  return { email, password, fullName };
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const { email, password, fullName } = readAdminCredentials();

    const [existing] = await queryInterface.sequelize.query(
      'SELECT id FROM users WHERE email = :email LIMIT 1',
      { replacements: { email } },
    );
    if (existing.length > 0) {
      console.log(`Admin seeder: user ${email} already exists, skipping.`);
      return;
    }

    const now = new Date();
    await queryInterface.bulkInsert('users', [
      {
        full_name: fullName,
        email,
        password_hash: await bcrypt.hash(password, BCRYPT_COST),
        signup_reason: 'other',
        role: 'admin',
        is_email_verified: true,
        email_verified_at: now,
        is_active: true,
        consent_given_at: now,
        failed_login_attempts: 0,
        created_at: now,
        updated_at: now,
      },
    ]);
  },

  async down(queryInterface) {
    const email = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
    if (!email) return;
    await queryInterface.bulkDelete('users', { email, role: 'admin' });
  },
};
