import env from './config/env.js';
import logger from './config/logger.js';
import { sequelize } from './models/index.js';
import app from './app.js';

const SHUTDOWN_TIMEOUT_MS = 10000;

async function start() {
  try {
    await sequelize.authenticate();
    logger.info('Database connection established');
  } catch (err) {
    logger.fatal({ err: { message: err.message } }, 'Unable to connect to the database');
    process.exit(1);
  }

  const server = app.listen(env.PORT, () => {
    logger.info(`Community Rise backend listening on port ${env.PORT} (${env.NODE_ENV})`);
  });

  let shuttingDown = false;
  const shutdown = (signal) => {
    if (shuttingDown) return;
    shuttingDown = true;
    logger.info(`${signal} received, shutting down gracefully`);

    const forceExit = setTimeout(() => {
      logger.error('Graceful shutdown timed out, forcing exit');
      process.exit(1);
    }, SHUTDOWN_TIMEOUT_MS);
    forceExit.unref();

    server.close(async (err) => {
      if (err) logger.error({ err }, 'Error while closing HTTP server');
      try {
        await sequelize.close();
        logger.info('Shutdown complete');
        process.exit(err ? 1 : 0);
      } catch (closeErr) {
        logger.error({ err: closeErr }, 'Error while closing database connection');
        process.exit(1);
      }
    });
    server.closeIdleConnections?.();
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('unhandledRejection', (reason) => {
    logger.error({ err: reason }, 'Unhandled promise rejection');
  });
  process.on('uncaughtException', (err) => {
    logger.fatal({ err }, 'Uncaught exception');
    shutdown('uncaughtException');
  });
}

start();
