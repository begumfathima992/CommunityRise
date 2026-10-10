import logger from '../config/logger.js';
import { sequelize } from '../models/index.js';

const TIMEOUT_MS = 3000;

export async function checkDatabase() {
  let timer;
  try {
    await Promise.race([
      sequelize.authenticate({ logging: false }),
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error('Database health check timed out')), TIMEOUT_MS);
      }),
    ]);
    return true;
  } catch (err) {
    logger.error({ err: { message: err.message } }, 'Database health check failed');
    return false;
  } finally {
    clearTimeout(timer);
  }
}
