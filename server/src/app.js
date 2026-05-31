import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from './config.js';
import { attachAuth } from './middleware/auth.js';
import { requireCsrf } from './middleware/csrf.js';
import { globalLimiter } from './middleware/rateLimits.js';
import authRoutes from './routes/authRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import propertyRoutes from './routes/propertyRoutes.js';
import userRoutes from './routes/userRoutes.js';
import { loadStore } from './services/store.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
let storePromise;

export function ensureStore() {
  if (!storePromise) {
    storePromise = loadStore();
  }

  return storePromise;
}

export function createApp({ serveClient = false } = {}) {
  const app = express();

  app.set('trust proxy', 1);
  app.use(
    helmet({
      contentSecurityPolicy: false
    })
  );
  app.use(
    cors({
      origin: config.clientOrigin,
      credentials: true
    })
  );
  app.use(globalLimiter);
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'prime-property-api' });
  });

  app.get('/', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'prime-property-api',
      health: '/api/health'
    });
  });

  app.use('/api', async (_req, _res, next) => {
    try {
      await ensureStore();
      next();
    } catch (error) {
      next(error);
    }
  });
  app.use('/api', attachAuth);
  app.use('/api', requireCsrf);

  app.use('/api', authRoutes);
  app.use('/api', contactRoutes);
  app.use('/api', propertyRoutes);
  app.use('/api', userRoutes);

  if (serveClient) {
    const clientDist = path.resolve(__dirname, '../../client/dist');
    if (fs.existsSync(clientDist)) {
      app.use(express.static(clientDist));
      app.get('*', (_req, res) => {
        res.sendFile(path.join(clientDist, 'index.html'));
      });
    }
  }

  app.use((error, _req, res, _next) => {
    console.error(error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  });

  return app;
}

export default createApp();
