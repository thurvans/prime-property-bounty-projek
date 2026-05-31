# Panduan Singkat Superadmin Prime Property

## Akun Demo

- Superadmin: `superadmin@primeproperty.local` / `superadmin123`
- Admin: `admin@primeproperty.local` / `admin12345`

## Mengelola Properti

1. Login ke `/agent/login` sebagai superadmin.
2. Buka menu `Listing Properti`.
3. Klik `Tambah Properti` untuk membuat listing baru.
4. Klik baris properti untuk membuka detail di panel kanan.
5. Gunakan ikon pensil untuk edit dan ikon tempat sampah untuk soft delete.
6. Properti yang dihapus masuk ke menu `Arsip` dan dapat direstore.

## Mengelola Admin

1. Buka menu `Akun Admin`.
2. Klik `Tambah Admin` untuk membuat akun internal baru.
3. Gunakan ikon status untuk enable/disable akun.
4. Gunakan ikon kunci untuk reset password.

## Audit Log

Menu `Audit Log` mencatat aksi create, update, delete, restore, enable/disable akun, dan reset password.
Backend memakai JWT dalam httpOnly cookie dengan CSRF token untuk setiap mutasi internal. Role tetap divalidasi di backend, sehingga admin biasa akan menerima `403 Forbidden` jika mencoba CRUD langsung ke API.
