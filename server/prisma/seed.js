import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { pathToFileURL } from 'node:url';

const rupiahSeeds = [850, 980, 1250, 1350, 1600, 1850, 2150, 2450, 2800, 3250];
const names = ['Aston Villas', 'Banyan Tree', 'Prime Avenue', 'Mentari Square', 'Permai Residence', 'Golden Gate', 'Krakatau Point', 'Cemara Loft'];
const groups = ['Mentari', 'Permai 123', 'Project Ville', 'Karya Indah', 'Harmony', 'Royal Prime', null];
const areas = ['Krakatau', 'Pancing', 'Tembung', 'Helvetia', 'Cemara Asri', 'Kuala', 'Setia Budi', 'Ringroad', 'Sunggal', 'Marelan'];
const units = ['Ready siap huni', 'Gate siap', 'Lapangan', 'Rucon', 'Hook premium', 'Unit tengah', null];
const directions = ['Utara', 'Selatan', 'Timur', 'Barat'];
const siapOptions = ['siap_huni', 'siap_kosong', 'siap_huni_renovasi'];

const nowIso = () => new Date().toISOString();

function createProperties(superadminId) {
  return Array.from({ length: 64 }, (_, index) => {
    const i = index + 1;
    const tipe = i % 5 === 0 ? 'Villa' : 'Ruko';
    const kawasan = [areas[index % areas.length]];
    if (i % 7 === 0) kawasan.push(areas[(index + 3) % areas.length]);
    const hadap = [directions[index % directions.length]];
    if (i % 9 === 0) hadap.push(directions[(index + 1) % directions.length]);
    const createdAt = new Date(Date.UTC(2026, 0, 1 + index, 3, 30, 0)).toISOString();

    return {
      id: `prop_${String(i).padStart(3, '0')}`,
      nama_property: `${names[index % names.length]} ${i <= 9 ? `Blok ${String.fromCharCode(64 + i)}` : `Unit ${i}`}`,
      group: groups[index % groups.length],
      lebar: Number((4 + (index % 6) * 0.5 + (i % 4 === 0 ? 0.25 : 0)).toFixed(2)),
      panjang: Number((11 + (index % 9) * 1.75 + (i % 6 === 0 ? 0.5 : 0)).toFixed(2)),
      hadap,
      tipe,
      tingkat: Number((1 + (index % 6) * 0.5).toFixed(1)),
      price: rupiahSeeds[index % rupiahSeeds.length] * 1000000 + (i % 4) * 50000000,
      carport: i % 3 !== 0,
      status: i % 11 === 0 ? 'sold_out' : 'in_stock',
      siap: siapOptions[index % siapOptions.length],
      maps_link: `https://www.google.com/maps/search/?api=1&query=Prime+Property+Medan+${i}`,
      kawasan,
      unit: units[index % units.length],
      highlighted: i <= 6,
      created_at: createdAt,
      updated_at: createdAt,
      created_by: superadminId,
      deleted_at: null
    };
  });
}

export async function createSeedDatabase() {
  const superadminId = 'usr_superadmin';
  const adminId = 'usr_admin';

  return {
    users: [
      {
        id: superadminId,
        name: 'Superadmin Prime',
        email: 'superadmin@primeproperty.local',
        password_hash: await bcrypt.hash('superadmin123', 10),
        role: 'superadmin',
        enabled: true,
        failed_logins: [],
        lock_until: null,
        created_at: nowIso(),
        updated_at: nowIso()
      },
      {
        id: adminId,
        name: 'Admin Listing',
        email: 'admin@primeproperty.local',
        password_hash: await bcrypt.hash('admin12345', 10),
        role: 'admin',
        enabled: true,
        failed_logins: [],
        lock_until: null,
        created_at: nowIso(),
        updated_at: nowIso()
      }
    ],
    properties: createProperties(superadminId),
    contact_messages: [],
    audit_logs: []
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

export async function seedPrismaDatabase(prisma) {
  const seed = await createSeedDatabase();

  await prisma.$transaction([
    prisma.auditLog.deleteMany(),
    prisma.contactMessage.deleteMany(),
    prisma.property.deleteMany(),
    prisma.user.deleteMany()
  ]);

  await prisma.user.createMany({
    data: seed.users.map(toUserCreate)
  });

  await prisma.property.createMany({
    data: seed.properties.map(toPropertyCreate)
  });

  return seed;
}

async function runCli() {
  const prisma = new PrismaClient();
  try {
    const seed = await seedPrismaDatabase(prisma);
    console.log(`Seed selesai: ${seed.users.length} user, ${seed.properties.length} properti.`);
  } finally {
    await prisma.$disconnect();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  runCli().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
