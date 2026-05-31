import crypto from 'node:crypto';
import express from 'express';
import { requireAuth, requireSuperadmin } from '../middleware/auth.js';
import { addAuditLog, getDb, persistProperty } from '../services/store.js';
import { compactObject, diffObjects } from '../utils/formatters.js';
import { directionOptions, parsePropertyPayload, readyOptions, statusOptions, typeOptions } from '../validators/propertyValidator.js';

const router = express.Router();

const readyLabels = {
  siap_huni: 'Siap Huni',
  siap_kosong: 'Siap Kosong',
  siap_huni_renovasi: 'Siap Huni Renovasi'
};

function listFromQuery(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.flatMap(listFromQuery);
  return String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function getOptions(properties) {
  const areas = new Set();
  const groups = new Set();

  properties.forEach((property) => {
    property.kawasan?.forEach((area) => areas.add(area));
    if (property.group) groups.add(property.group);
  });

  return {
    kawasan: [...areas].sort((a, b) => a.localeCompare(b, 'id')),
    group: [...groups].sort((a, b) => a.localeCompare(b, 'id')),
    hadap: directionOptions,
    tipe: typeOptions,
    status: statusOptions,
    siap: readyOptions.map((value) => ({ value, label: readyLabels[value] }))
  };
}

function applyFilters(properties, query) {
  const kawasan = listFromQuery(query.kawasan);
  const hadap = listFromQuery(query.hadap);
  const siap = listFromQuery(query.siap);
  const search = String(query.search || '').trim().toLowerCase();
  const lebarMin = query.lebarMin ? Number(query.lebarMin) : null;
  const hargaMax = query.hargaMax ? Number(query.hargaMax) : null;
  const tipe = query.tipe && query.tipe !== 'Semua' ? query.tipe : null;
  const status = query.status && query.status !== 'Semua' ? query.status : null;
  const carport = query.carport && query.carport !== 'Semua' ? query.carport : null;

  return properties.filter((property) => {
    if (property.deleted_at) return false;
    if (search) {
      const haystack = [property.nama_property, property.group, ...(property.kawasan || [])].filter(Boolean).join(' ').toLowerCase();
      if (!haystack.includes(search)) return false;
    }
    if (kawasan.length && !property.kawasan?.some((area) => kawasan.includes(area))) return false;
    if (hadap.length && !property.hadap?.some((direction) => hadap.includes(direction))) return false;
    if (siap.length && !siap.includes(property.siap)) return false;
    if (lebarMin !== null && property.lebar < lebarMin) return false;
    if (hargaMax !== null && property.price > hargaMax) return false;
    if (tipe && property.tipe !== tipe) return false;
    if (status && property.status !== status) return false;
    if (carport === 'Ya' && !property.carport) return false;
    if (carport === 'Tidak' && property.carport) return false;
    return true;
  });
}

function sortProperties(properties, sort) {
  const [field = 'nama_property', direction = 'asc'] = String(sort || 'nama_property:asc').split(':');
  const multiplier = direction === 'desc' ? -1 : 1;

  return [...properties].sort((a, b) => {
    const left = field === 'created_at' ? new Date(a.created_at).getTime() : a[field];
    const right = field === 'created_at' ? new Date(b.created_at).getTime() : b[field];
    if (typeof left === 'number' && typeof right === 'number') return (left - right) * multiplier;
    return String(left || '').localeCompare(String(right || ''), 'id') * multiplier;
  });
}

router.get('/properties/public', (req, res) => {
  const properties = getDb().properties
    .filter((property) => !property.deleted_at && property.status === 'in_stock' && property.highlighted)
    .slice(0, 6);

  res.json({ items: properties });
});

router.get('/properties/archive', requireAuth, requireSuperadmin, (req, res) => {
  const items = getDb().properties.filter((property) => property.deleted_at);
  res.json({ items });
});

router.get('/properties', requireAuth, (req, res) => {
  const allActive = getDb().properties.filter((property) => !property.deleted_at);
  const filtered = applyFilters(allActive, req.query);
  const sorted = sortProperties(filtered, req.query.sort);
  const pageSize = [25, 50, 100].includes(Number(req.query.pageSize)) ? Number(req.query.pageSize) : 50;
  const page = Math.max(1, Number(req.query.page || 1));
  const start = (page - 1) * pageSize;

  res.json({
    items: sorted.slice(start, start + pageSize),
    meta: {
      page,
      pageSize,
      total: filtered.length,
      totalPages: Math.max(1, Math.ceil(filtered.length / pageSize))
    },
    options: getOptions(allActive)
  });
});

router.get('/properties/:id', requireAuth, (req, res) => {
  const property = getDb().properties.find((item) => item.id === req.params.id && !item.deleted_at);
  if (!property) return res.status(404).json({ message: 'Properti tidak ditemukan.' });
  res.json({ item: property });
});

router.post('/properties', requireAuth, requireSuperadmin, async (req, res) => {
  const parsed = parsePropertyPayload(req.body);
  if (!parsed.ok) return res.status(422).json({ message: 'Validasi properti gagal.', errors: parsed.errors });

  const now = new Date().toISOString();
  const property = {
    id: `prop_${crypto.randomUUID()}`,
    ...parsed.data,
    created_at: now,
    updated_at: now,
    created_by: req.user.id,
    deleted_at: null
  };

  const db = getDb();
  db.properties.unshift(property);
  const auditLog = addAuditLog({
    actorId: req.user.id,
    action: 'create',
    entity: 'property',
    entityId: property.id,
    after: compactObject(property),
    ip: req.ip
  });
  await persistProperty(property, auditLog);

  res.status(201).json({ item: property });
});

router.put('/properties/:id', requireAuth, requireSuperadmin, async (req, res) => {
  const db = getDb();
  const index = db.properties.findIndex((item) => item.id === req.params.id && !item.deleted_at);
  if (index === -1) return res.status(404).json({ message: 'Properti tidak ditemukan.' });

  const parsed = parsePropertyPayload(req.body);
  if (!parsed.ok) return res.status(422).json({ message: 'Validasi properti gagal.', errors: parsed.errors });

  const before = compactObject(db.properties[index]);
  const updated = {
    ...db.properties[index],
    ...parsed.data,
    updated_at: new Date().toISOString()
  };

  db.properties[index] = updated;
  const auditLog = addAuditLog({
    actorId: req.user.id,
    action: 'update',
    entity: 'property',
    entityId: updated.id,
    before,
    after: compactObject(updated),
    changes: diffObjects(before, updated),
    ip: req.ip
  });
  await persistProperty(updated, auditLog);

  res.json({ item: updated });
});

router.delete('/properties/:id', requireAuth, requireSuperadmin, async (req, res) => {
  const db = getDb();
  const property = db.properties.find((item) => item.id === req.params.id && !item.deleted_at);
  if (!property) return res.status(404).json({ message: 'Properti tidak ditemukan.' });

  const before = compactObject(property);
  property.deleted_at = new Date().toISOString();
  property.updated_at = property.deleted_at;

  const auditLog = addAuditLog({
    actorId: req.user.id,
    action: 'delete',
    entity: 'property',
    entityId: property.id,
    before,
    after: compactObject(property),
    ip: req.ip
  });
  await persistProperty(property, auditLog);

  res.json({ message: 'Properti berhasil dihapus.' });
});

router.patch('/properties/:id/restore', requireAuth, requireSuperadmin, async (req, res) => {
  const property = getDb().properties.find((item) => item.id === req.params.id && item.deleted_at);
  if (!property) return res.status(404).json({ message: 'Properti arsip tidak ditemukan.' });

  property.deleted_at = null;
  property.updated_at = new Date().toISOString();
  const auditLog = addAuditLog({
    actorId: req.user.id,
    action: 'restore',
    entity: 'property',
    entityId: property.id,
    after: compactObject(property),
    ip: req.ip
  });
  await persistProperty(property, auditLog);

  res.json({ item: property });
});

export default router;
