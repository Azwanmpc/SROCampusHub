# SRO CampusHub

Sistem Pengurusan Penempahan Fasiliti & Penyelenggaraan Kampus — PPM Wilayah Selatan.

Dibina dengan Next.js (App Router) + TypeScript + Tailwind CSS + Prisma (SQLite).

## Menjalankan Secara Tempatan

```bash
npm install
npm run seed   # isi semula data demo (fasiliti, pengguna, tempahan, aduan)
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

### Akaun Demo (selepas `npm run seed`)

| Peranan | Username | Kata Laluan |
|---|---|---|
| Superadmin | `superadmin` | `super123` |
| Admin (Pelulus) | `admin1` atau `admin2` | `admin123` |
| Pemohon | `ahmad.faiz` atau `dayang.salmah` | `pemohon123` |
| Pengadu | `siti.aminah` atau `razak.mahmud` | `pengadu123` |

## Struktur

- `prisma/schema.prisma` — model data (User, Facility, Booking, Complaint, Notification)
- `prisma/seed.ts` — data demo
- `src/lib/auth.ts` — sesi log masuk (JWT dalam cookie)
- `src/lib/whatsapp.ts` — integrasi WaSenderAPI (one-way notification)
- `src/middleware.ts` — kawalan akses ikut peranan
- `src/app/(app)/*` — halaman selepas log masuk
- `src/app/api/*` — API routes

## Integrasi WhatsApp (WaSenderAPI)

Isi `.env`:

```
WASENDER_API_URL="https://.../send-message"
WASENDER_API_KEY="..."
```

Jika tidak diisi, notifikasi tetap direkod dalam jadual `Notification` (untuk audit/testing) tetapi tidak dihantar sebenar melalui WhatsApp.

Reminder H-1 tidak berjalan automatik (belum ada scheduler/hosting ditetapkan). Panggil `POST /api/cron/reminders` setiap hari (contohnya melalui Windows Task Scheduler atau cron luaran) untuk menghantar peringatan tempahan esok.

## Pangkalan Data

SQLite tempatan (`prisma/dev.db`), sesuai untuk demo/pembangunan. Untuk pengeluaran (production), tukar `DATABASE_URL` dalam `.env` kepada pangkalan data Postgres/MySQL dan kemas kini `provider` dalam `prisma/schema.prisma`.
