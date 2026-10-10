import pino from 'pino';
import env from './env.js';

const defaultLevel = env.isTest ? 'silent' : env.isProduction ? 'info' : 'debug';

const logger = pino({
  level: env.LOG_LEVEL || defaultLevel,
  redact: {
    paths: [
      'req.headers.cookie',
      'req.headers.authorization',
      'res.headers["set-cookie"]',
      '*.password',
      '*.password_hash',
      '*.token',
    ],
    censor: '[REDACTED]',
  },
  ...(env.NODE_ENV === 'development' && {
    transport: { target: 'pino-pretty', options: { colorize: true, translateTime: 'SYS:HH:MM:ss' } },
  }),
});

export default logger;
