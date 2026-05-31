import 'dotenv/config';

export const config = {
  port: Number(process.env.PORT || 3000),
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  databaseUrl: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/prime_property',
  jwtSecret: process.env.JWT_SECRET || 'prime-property-local-dev-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '30d',
  sessionMaxAgeMs: 30 * 24 * 60 * 60 * 1000,
  isProduction: process.env.NODE_ENV === 'production',
  lockWindowMs: 30 * 60 * 1000,
  lockDurationMs: 15 * 60 * 1000
};
