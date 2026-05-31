import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { getDb, sanitizeUser } from '../services/store.js';

export const AUTH_COOKIE_NAME = 'prime_property_session';

function parseCookies(header = '') {
  return header
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce((cookies, part) => {
      const separator = part.indexOf('=');
      if (separator === -1) return cookies;
      const key = part.slice(0, separator);
      const value = part.slice(separator + 1);
      cookies[key] = decodeURIComponent(value);
      return cookies;
    }, {});
}

export function attachAuth(req, _res, next) {
  const cookies = parseCookies(req.get('cookie'));
  const token = cookies[AUTH_COOKIE_NAME];

  if (!token) {
    return next();
  }

  try {
    const payload = jwt.verify(token, config.jwtSecret);
    const user = getDb().users.find((item) => item.id === payload.sub && item.enabled);

    if (user) {
      req.userRecord = user;
      req.user = sanitizeUser(user);
      req.tokenPayload = payload;
    }
  } catch (_error) {
    req.authError = 'Token JWT tidak valid atau sudah kedaluwarsa.';
  }

  next();
}

export function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: req.authError || 'Silakan login terlebih dahulu.' });
  }
  next();
}

export function requireSuperadmin(req, res, next) {
  if (req.user?.role !== 'superadmin') {
    return res.status(403).json({ message: 'Forbidden. Fitur ini hanya untuk superadmin.' });
  }
  next();
}
