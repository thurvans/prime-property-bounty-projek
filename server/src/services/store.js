import { PrismaClient } from '@prisma/client';
import crypto from 'node:crypto';
import { createSeedDatabase } from '../../prisma/seed.js';

const prisma = new PrismaClient();

let db;
let writeQueue = Promise.resolve();

const nowIso = () => new Date().toISOString();

function enqueueWrite(task) {
  const run = writeQueue.then(task, task);
  writeQueue = run.catch(() => {});
  return run;
}

function iso(value) {
  if (!value) return null;
  return value instanceof Date ? value.toISOString() : value;
}

function mapUser(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    password_hash: row.passwordHash,
    role: row.role,
    enabled: row.enabled,
    failed_logins: row.failedLogins || [],
    lock_until: iso(row.lockUntil),
    created_at: iso(row.createdAt),
    updated_at: iso(row.updatedAt)
  };
}

function mapProperty(row) {
  return {
    id: row.id,
    nama_property: row.namaProperty,
    group: row.group,
    lebar: Number(row.lebar),
    panjang: Number(row.panjang),
    hadap: row.hadap || [],
    tipe: row.tipe,
    tingkat: Number(row.tingkat),
    price: Number(row.price),
    carport: row.carport,
    status: row.status,
    siap: row.siap,
    maps_link: row.mapsLink,
    kawasan: row.kawasan || [],
    unit: row.unit,
    highlighted: row.highlighted,
    created_at: iso(row.createdAt),
    updated_at: iso(row.updatedAt),
    created_by: row.createdById,
    deleted_at: iso(row.deletedAt)
  };
}

function mapContactMessage(row) {
  return {
    id: row.id,
    nama: row.nama,
    email: row.email,
    nomor_hp: row.nomorHp,
    pesan: row.pesan,
    ip: row.ip,
    notification: row.notification || {},
    created_at: iso(row.createdAt)
  };
}

function mapAuditLog(row) {
  return {
    id: row.id,
    actor_id: row.actorId,
    action: row.action,
    entity: row.entity,
    entity_id: row.entityId,
    before: row.beforeData,
    after: row.afterData,
    changes: row.changes,
    ip: row.ip,
    created_at: iso(row.createdAt)
  };
}

function toUserCreate(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    passwordHash: user.password_hash,
    role: user.role,
    enabled: user.enabled,
    failedLogins: user.failed_logins || [],
    lockUntil: user.lock_until ? new Date(user.lock_until) : null,
    createdAt: new Date(user.created_at),
    updatedAt: new Date(user.updated_at)
  };
}

function toPropertyCreate(property) {
  return {
    id: property.id,
    namaProperty: property.nama_property,
    group: property.group,
    lebar: property.lebar,
    panjang: property.panjang,
    hadap: property.hadap,
    tipe: property.tipe,
    tingkat: property.tingkat,
    price: BigInt(property.price),
    carport: property.carport,
    status: property.status,
    siap: property.siap,
    mapsLink: property.maps_link,
    kawasan: property.kawasan,
    unit: property.unit,
    highlighted: property.highlighted,
    createdAt: new Date(property.created_at),
    updatedAt: new Date(property.updated_at),
    createdById: property.created_by,
    deletedAt: property.deleted_at ? new Date(property.deleted_at) : null
  };
}

function toContactMessageCreate(message) {
  return {
    id: message.id,
    nama: message.nama,
    email: message.email,
    nomorHp: message.nomor_hp,
    pesan: message.pesan,
    ip: message.ip,
    notification: message.notification || {},
    createdAt: new Date(message.created_at)
  };
}

function toAuditLogCreate(log) {
  return {
    id: log.id,
    actorId: log.actor_id,
    action: log.action,
    entity: log.entity,
    entityId: log.entity_id,
    beforeData: log.before ?? null,
    afterData: log.after ?? null,
    changes: log.changes ?? null,
    ip: log.ip,
    createdAt: new Date(log.created_at)
  };
}

function omitImmutable(data) {
  const { id: _id, createdAt: _createdAt, ...mutable } = data;
  return mutable;
}

async function readDb() {
  const [users, properties, contactMessages, auditLogs] = await Promise.all([
    prisma.user.findMany({ orderBy: { createdAt: 'asc' } }),
    prisma.property.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.contactMessage.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' } })
  ]);

  return {
    users: users.map(mapUser),
    properties: properties.map(mapProperty),
    contact_messages: contactMessages.map(mapContactMessage),
    audit_logs: auditLogs.map(mapAuditLog)
  };
}

export async function loadStore() {
  await prisma.$connect();
  db = await readDb();

  if (db.users.length === 0 || db.properties.filter((property) => !property.deleted_at).length < 50) {
    db = await createSeedDatabase();
    await saveDb();
  }

  return db;
}

export function getDb() {
  if (!db) {
    throw new Error('Database belum dimuat. Panggil loadStore() sebelum mengakses data.');
  }
  return db;
}

export async function saveDb() {
  return enqueueWrite(async () => {
    await prisma.$transaction([
      prisma.auditLog.deleteMany(),
      prisma.contactMessage.deleteMany(),
      prisma.property.deleteMany(),
      prisma.user.deleteMany()
    ]);

    await prisma.$transaction([
      ...db.users.map((user) => prisma.user.create({ data: toUserCreate(user) })),
      ...db.properties.map((property) => prisma.property.create({ data: toPropertyCreate(property) })),
      ...(db.contact_messages || []).map((message) => prisma.contactMessage.create({ data: toContactMessageCreate(message) })),
      ...(db.audit_logs || []).map((log) => prisma.auditLog.create({ data: toAuditLogCreate(log) }))
    ]);
  });
}

export async function persistUser(user, auditLog = null) {
  const data = toUserCreate(user);
  const actions = [
    prisma.user.upsert({
      where: { id: user.id },
      create: data,
      update: omitImmutable(data)
    })
  ];

  if (auditLog) {
    actions.push(prisma.auditLog.create({ data: toAuditLogCreate(auditLog) }));
  }

  return enqueueWrite(() => prisma.$transaction(actions));
}

export async function persistProperty(property, auditLog = null) {
  const data = toPropertyCreate(property);
  const actions = [
    prisma.property.upsert({
      where: { id: property.id },
      create: data,
      update: omitImmutable(data)
    })
  ];

  if (auditLog) {
    actions.push(prisma.auditLog.create({ data: toAuditLogCreate(auditLog) }));
  }

  return enqueueWrite(() => prisma.$transaction(actions));
}

export async function persistContactMessage(message) {
  return enqueueWrite(() => prisma.contactMessage.create({ data: toContactMessageCreate(message) }));
}

export function sanitizeUser(user) {
  if (!user) return null;
  const { password_hash: _passwordHash, failed_logins: _failedLogins, ...safeUser } = user;
  return safeUser;
}

export function addAuditLog({ actorId, action, entity, entityId, before = null, after = null, changes = null, ip = null }) {
  const entry = {
    id: `audit_${crypto.randomUUID()}`,
    actor_id: actorId,
    action,
    entity,
    entity_id: entityId,
    before,
    after,
    changes,
    ip,
    created_at: nowIso()
  };

  getDb().audit_logs.unshift(entry);
  return entry;
}
