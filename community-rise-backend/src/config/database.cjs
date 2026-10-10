// Database configuration per environment.
// CommonJS so it can be shared by sequelize-cli (migrations/seeders) and the app.
const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '../../.env'), quiet: true });

const DEFAULT_TEST_DATABASE_URL = 'postgres://ziggy@localhost:5432/communityrise_test';

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function fromUrl(url, extra = {}) {
  const parsed = new URL(url);
  return {
    dialect: 'postgres',
    username: decodeURIComponent(parsed.username),
    password: parsed.password ? decodeURIComponent(parsed.password) : null,
    host: parsed.hostname,
    port: Number(parsed.port || 5432),
    database: parsed.pathname.replace(/^\//, ''),
    logging: false,
    seederStorage: 'sequelize',
    seederStorageTableName: 'SequelizeData',
    define: { underscored: true },
    pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
    ...extra,
  };
}

function productionSsl() {
  const ssl = {
    require: true,
    rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false',
  };
  if (process.env.DB_SSL_CA_PATH) {
    ssl.ca = fs.readFileSync(process.env.DB_SSL_CA_PATH, 'utf8');
  }
  return ssl;
}

// Getters so that only the active environment's variables are required.
module.exports = {
  get development() {
    return fromUrl(requireEnv('DATABASE_URL'));
  },
  get test() {
    return fromUrl(process.env.TEST_DATABASE_URL || DEFAULT_TEST_DATABASE_URL);
  },
  get production() {
    return fromUrl(requireEnv('DATABASE_URL'), {
      dialectOptions: { ssl: productionSsl() },
      pool: { max: 20, min: 0, acquire: 30000, idle: 10000 },
    });
  },
};
