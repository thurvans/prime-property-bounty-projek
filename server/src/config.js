import 'dotenv/config';

const clientOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

export const config = {
  port: Number(process.env.PORT || 3000),
  clientOrigin: clientOrigins.length === 1 ? clientOrigins[0] : clientOrigins,
  databaseUrl: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/prime_property',
  jwtSecret: process.env.JWT_SECRET || 'prime-property-local-dev-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '30d',
  sessionMaxAgeMs: 30 * 24 * 60 * 60 * 1000,
  isProduction: process.env.NODE_ENV === 'production',
  cookieSameSite: process.env.COOKIE_SAMESITE || (process.env.NODE_ENV === 'production' ? 'none' : 'lax'),
  lockWindowMs: 30 * 60 * 1000,
  lockDurationMs: 15 * 60 * 1000
};
