const safeMethods = new Set(['GET', 'HEAD', 'OPTIONS']);

export function requireCsrf(req, res, next) {
  if (safeMethods.has(req.method)) return next();
  if (!req.user) return next();

  const expectedToken = req.tokenPayload?.csrf;
  const providedToken = req.get('x-csrf-token');

  if (!expectedToken || !providedToken || providedToken !== expectedToken) {
    return res.status(403).json({ message: 'CSRF token tidak valid.' });
  }

  next();
}
