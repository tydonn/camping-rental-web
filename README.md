# Camping Rental Web

Frontend SPA (React + Vite + TypeScript) untuk layanan penyewaan alat camping, mengonsumsi [Camping Rental API](../camping-rental-api) (Laravel + Sanctum).

## Fitur

- **Autentikasi** — registrasi & login pelanggan, token Sanctum disimpan di `localStorage`, sesi dipulihkan via `GET /api/me`
- **Katalog publik** — daftar alat dengan pencarian, filter kategori, urutan harga/nama, dan paginasi
- **Detail alat** — cek ketersediaan stok per rentang tanggal sebelum booking
- **Booking** — checkout satu langkah, riwayat booking, detail status dengan timeline
- **Pembayaran manual** — laporan transfer/QRIS/tunai oleh pelanggan, verifikasi & penolakan oleh admin, polling status tiap 15 detik
- **Panel admin** — CRUD kategori & alat, daftar semua booking, konfirmasi pengambilan/pengembalian (stok berkurang/tambah otomatis), verifikasi pembayaran

## Struktur

```
src/
  api/        # instance axios + fungsi per endpoint
  pages/      # halaman sesuai rute (katalog, booking, admin)
  components/ # Layout, guard rute, komponen UI bersama
  hooks/      # useApiQuery, useAuth, useEquipmentAvailability
  types/      # interface resource API (Equipment, Booking, Payment, ...)
  context/    # AuthProvider
  utils/      # format rupiah/tanggal, konstanta
```

## Menjalankan

```bash
npm install
npm run dev        # http://localhost:5173
```

Dev server mem-proxy `/api` dan `/storage` ke `http://localhost:8000` (ubah lewat env `VITE_API_ORIGIN`). Jalankan backend Laravel di port tersebut (`php artisan serve`).

Akun admin bawaan dari seeder: **admin@camping.test / password**

## Perintah lain

```bash
npm run build   # typecheck + build produksi
npm run lint    # eslint
```

## Catatan deployment

Hasil `dist/` disajikan same-origin dengan API: Nginx mengarahkan `/api/*` ke Laravel dan sisanya ke SPA, sehingga tidak memerlukan CORS. Rute SPA non-root perlu fallback ke `index.html`.
