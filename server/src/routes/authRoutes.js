import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import express from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { config } from '../config.js';
import { AUTH_COOKIE_NAME, requireAuth } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimits.js';
import { getDb, sanitizeUser, saveDb } from '../services/store.js';

const router = express.Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

const sessionCookieOptions = {
  httpOnly: true,
  sameSite: config.cookieSameSite,
  secure: config.isProduction,
  path: '/',
  maxAge: config.sessionMaxAgeMs
};

router.get('/auth/me', requireAuth, (req, res) => {
  res.json({ user: req.user, csrfToken: req.tokenPayload?.csrf });
});

router.post('/auth/login', authLimiter, async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(422).json({ message: 'Email dan password wajib diisi dengan benar.' });
  }

  const { email, password } = parsed.data;
  const db = getDb();
  const user = db.users.find((item) => item.email.toLowerCase() === email.toLowerCase());
  const currentTime = Date.now();

  if (!user || !user.enabled) {
    return res.status(401).json({ message: 'Email atau password tidak sesuai.' });
  }

  if (user.lock_until && new Date(user.lock_until).getTime() > currentTime) {
    return res.status(423).json({ message: 'Akun terkunci sementara. Coba lagi setelah 15 menit.' });
  }

  const passwordValid = await bcrypt.compare(password, user.password_hash);
  if (!passwordValid) {
    user.failed_logins = (user.failed_logins || []).filter(
      (timestamp) => currentTime - new Date(timestamp).getTime() <= config.lockWindowMs
    );
    user.failed_logins.push(new Date().toISOString());

    if (user.failed_logins.length >= 5) {
      user.lock_until = new Date(currentTime + config.lockDurationMs).toISOString();
    }

    user.updated_at = new Date().toISOString();
    await saveDb();

    return res.status(user.lock_until ? 423 : 401).json({
      message: user.lock_until ? 'Akun terkunci sementara setelah 5 percobaan gagal.' : 'Email atau password tidak sesuai.'
    });
  }

  user.failed_logins = [];
  user.lock_until = null;
  user.updated_at = new Date().toISOString();

  await saveDb();

  const csrfToken = crypto.randomBytes(32).toString('hex');
  const token = jwt.sign(
    {
      sub: user.id,
      role: user.role,
      email: user.email,
      csrf: csrfToken
    },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );

  res.cookie(AUTH_COOKIE_NAME, token, sessionCookieOptions);
  res.json({ user: sanitizeUser(user), csrfToken });
});

router.post('/auth/logout', requireAuth, async (_req, res) => {
  res.clearCookie(AUTH_COOKIE_NAME, {
    httpOnly: true,
    sameSite: config.cookieSameSite,
    secure: config.isProduction,
    path: '/'
  });
  res.json({ message: 'Logout berhasil.' });
});

export default router;
