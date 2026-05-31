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
app.use(attachAuth);
app.use(requireCsrf);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'prime-property-api' });
});

app.use('/api', authRoutes);
app.use('/api', contactRoutes);
app.use('/api', propertyRoutes);
app.use('/api', userRoutes);

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
});

const clientDist = path.resolve(__dirname, '../../client/dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

await loadStore();
app.listen(config.port, () => {
  console.log(`Prime Property API berjalan di http://localhost:${config.port}`);
});
