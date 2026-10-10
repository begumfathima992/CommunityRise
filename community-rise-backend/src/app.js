import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';
import env from './config/env.js';
import logger from './config/logger.js';
import { legacyHealth } from './controllers/health.controller.js';
import { errorHandler, notFound } from './middlewares/errorHandler.js';
import { apiLimiter } from './middlewares/rateLimiters.js';
import contactRoutes from './routes/contact.routes.js';
import v1Routes from './routes/v1/index.js';

const app = express();

// Runs behind Nginx: trust the first proxy for req.ip and secure cookies.
app.set('trust proxy', 1);
app.disable('x-powered-by');

app.use(
  pinoHttp({
    logger,
    autoLogging: { ignore: (req) => req.url.endsWith('/health') },
    serializers: {
      req: (req) => ({ id: req.id, method: req.method, url: req.url, ip: req.remoteAddress }),
      res: (res) => ({ statusCode: res.statusCode }),
    },
    customLogLevel: (req, res, err) => {
      if (err || res.statusCode >= 500) return 'error';
      if (res.statusCode >= 400) return 'warn';
      return 'info';
    },
  }),
);
app.use(helmet());
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
  }),
);
app.use(cookieParser());

// Contact form (existing frontend) — mounted before the global body
// parser because it keeps its own 20kb limit.
app.get('/api/health', legacyHealth);
app.use('/api/contact', contactRoutes);

app.use(express.json({ limit: '10kb' }));

app.use('/api/v1', apiLimiter, v1Routes);

app.use(notFound);
app.use(errorHandler);

export default app;
