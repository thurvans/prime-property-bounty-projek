import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import express from 'express';
import { z } from 'zod';
import { requireAuth, requireSuperadmin } from '../middleware/auth.js';
import { addAuditLog, getDb, persistUser, sanitizeUser } from '../services/store.js';

const router = express.Router();

const createUserSchema = z.object({
  name: z.string().trim().min(2),
  email: z.string().trim().email(),
  password: z.string().min(8),
  role: z.enum(['admin', 'superadmin']).default('admin')
});

router.get('/users', requireAuth, requireSuperadmin, (req, res) => {
  const users = getDb().users.map(sanitizeUser);
  res.json({ items: users });
});

router.post('/users', requireAuth, requireSuperadmin, async (req, res) => {
  const parsed = createUserSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(422).json({ message: 'Nama, email, dan password minimal 8 karakter wajib diisi.' });
  }

  const db = getDb();
  if (db.users.some((user) => user.email.toLowerCase() === parsed.data.email.toLowerCase())) {
    return res.status(409).json({ message: 'Email admin sudah digunakan.' });
  }

  const now = new Date().toISOString();
  const user = {
    id: `usr_${crypto.randomUUID()}`,
    name: parsed.data.name.trim(),
    email: parsed.data.email.trim().toLowerCase(),
    password_hash: await bcrypt.hash(parsed.data.password, 10),
    role: parsed.data.role,
    enabled: true,
    failed_logins: [],
    lock_until: null,
    created_at: now,
    updated_at: now
  };

  db.users.push(user);
  const auditLog = addAuditLog({
    actorId: req.user.id,
    action: 'create',
    entity: 'user',
    entityId: user.id,
    after: sanitizeUser(user),
    ip: req.ip
  });
  await persistUser(user, auditLog);

  res.status(201).json({ item: sanitizeUser(user) });
});

router.patch('/users/:id/status', requireAuth, requireSuperadmin, async (req, res) => {
  const user = getDb().users.find((item) => item.id === req.params.id);
  if (!user) return res.status(404).json({ message: 'Akun tidak ditemukan.' });
  if (user.id === req.user.id) return res.status(422).json({ message: 'Akun sendiri tidak dapat dinonaktifkan.' });

  user.enabled = Boolean(req.body.enabled);
  user.updated_at = new Date().toISOString();
  const auditLog = addAuditLog({
    actorId: req.user.id,
    action: user.enabled ? 'enable' : 'disable',
    entity: 'user',
    entityId: user.id,
    after: sanitizeUser(user),
    ip: req.ip
  });
  await persistUser(user, auditLog);

  res.json({ item: sanitizeUser(user) });
});

router.patch('/users/:id/reset-password', requireAuth, requireSuperadmin, async (req, res) => {
  const user = getDb().users.find((item) => item.id === req.params.id);
  if (!user) return res.status(404).json({ message: 'Akun tidak ditemukan.' });
  if (!req.body.password || String(req.body.password).length < 8) {
    return res.status(422).json({ message: 'Password baru minimal 8 karakter.' });
  }

  user.password_hash = await bcrypt.hash(String(req.body.password), 10);
  user.failed_logins = [];
  user.lock_until = null;
  user.updated_at = new Date().toISOString();
  const auditLog = addAuditLog({ actorId: req.user.id, action: 'reset_password', entity: 'user', entityId: user.id, ip: req.ip });
  await persistUser(user, auditLog);

  res.json({ item: sanitizeUser(user) });
});

router.get('/audit-logs', requireAuth, requireSuperadmin, (req, res) => {
  const pageSize = 50;
  const page = Math.max(1, Number(req.query.page || 1));
  const logs = getDb().audit_logs;
  const start = (page - 1) * pageSize;

  res.json({
    items: logs.slice(start, start + pageSize),
    meta: {
      page,
      pageSize,
      total: logs.length,
      totalPages: Math.max(1, Math.ceil(logs.length / pageSize))
    }
  });
});

export default router;
