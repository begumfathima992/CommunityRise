import { checkDatabase } from '../services/health.service.js';

export async function health(req, res) {
  const databaseUp = await checkDatabase();
  res.status(databaseUp ? 200 : 503).json({
    success: databaseUp,
    message: databaseUp ? 'Service healthy' : 'Database unavailable',
    data: {
      status: databaseUp ? 'ok' : 'degraded',
      database: databaseUp ? 'connected' : 'disconnected',
      uptime_seconds: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
    },
  });
}

// Original endpoint kept for existing monitoring.
export function legacyHealth(req, res) {
  res.json({ status: 'ok', service: 'Community Rise backend' });
}
