# Prime Property Platform

Full-stack implementation untuk brief Prime Property:

- Backend: Express.js
- Frontend: React Vite
- Styling: Tailwind CSS
- Animasi: JavaScript intersection reveal
- Icon: Font Awesome

## Struktur

```bash
client/  # React Vite + Tailwind + Font Awesome
server/  # Express.js + Prisma + PostgreSQL + JWT cookie auth
```

## Env

- Server: [server/.env](C:/Prime_Property/server/.env)
- Client: [client/.env](C:/Prime_Property/client/.env)

Default lokal:

- Server: `http://localhost:3000`
- Client: `http://localhost:5173`
- PostgreSQL: lihat `DATABASE_URL` di [server/.env](C:/Prime_Property/server/.env)

Pastikan database `prime_property` sudah dibuat di PostgreSQL sebelum menjalankan server.

## Prisma

Schema ada di [server/prisma/schema.prisma](C:/Prime_Property/server/prisma/schema.prisma).

```bash
cd server
npm run prisma:validate
npm run prisma:push
npm run prisma:generate
npm run prisma:seed
```

## Install & Run

Terminal server:

```bash
cd server
npm install
npm run dev
```

Terminal client:

```bash
cd client
npm install
npm run dev
```

## Build

```bash
cd client
npm run build

cd ../server
npm start
```

Server memakai JWT dalam httpOnly cookie `SameSite=Lax` untuk autentikasi internal agent. Mutasi internal mengirim `X-CSRF-Token` dari frontend sebagai perlindungan CSRF.

## Deploy Vercel

Deploy sebagai 2 project terpisah:

- Frontend: set **Root Directory** ke `client`.
- Backend: set **Root Directory** ke `server`.

Frontend memakai [client/vercel.json](C:/Prime_Property/client/vercel.json) dan hanya build React Vite ke `dist`.
Backend memakai [server/vercel.json](C:/Prime_Property/server/vercel.json) dan hanya expose route `/api/*`.

Env frontend di Vercel:

```bash
VITE_API_BASE=https://your-backend-domain.vercel.app/api
```

Env backend di Vercel:

```bash
CLIENT_ORIGIN=https://your-frontend-domain.vercel.app
COOKIE_SAMESITE=none
```
