# PRD — Camping Rental Web
### React SPA (Vite + TypeScript)

**Versi:** 1.0
**Tanggal:** 23 Agustus 2026
**Pemilik Produk:** Tydon
**Tujuan dokumen:** Referensi pengembangan frontend sebagai consumer dari Camping Rental API (Laravel)

---

## 1. Latar Belakang & Tujuan

Frontend ini adalah Single Page Application yang mengonsumsi Camping Rental API (Laravel + Sanctum). Dibangun terpisah dari backend, dikomunikasikan murni lewat REST API menggunakan token autentikasi. Frontend dibangun fungsional dan rapi, dengan fokus pada konsumsi API yang baik, tanpa kompleksitas berlebih di sisi UI/UX.

## 2. Cakupan (Scope)

### 2.1 Termasuk dalam scope
- Halaman autentikasi: registrasi & login pelanggan
- Halaman katalog alat: daftar, filter kategori, pencarian, detail alat
- Alur booking: pilih alat, pilih rentang tanggal, cek ketersediaan, checkout
- Integrasi pembayaran online (redirect ke payment gateway)
- Halaman riwayat booking milik pelanggan
- Panel admin: kelola alat & kategori, daftar booking, konfirmasi peminjaman/pengembalian

### 2.2 Di luar scope (versi awal)
- Aplikasi mobile native
- Desain UI kustom yang kompleks/animasi lanjutan
- Multi-bahasa

## 3. Arsitektur

React (Vite + TypeScript) dibangun sebagai SPA murni yang berkomunikasi dengan Laravel API lewat axios, menggunakan token Sanctum yang disimpan di sisi client. Routing ditangani React Router. Hasil build (folder statis) disajikan oleh Nginx pada domain yang sama dengan API, dibedakan lewat path (`/api/*` ke Laravel, sisanya ke React), sehingga tidak diperlukan konfigurasi CORS lintas origin.

## 4. Struktur Halaman

| Halaman | Rute | Akses | Deskripsi singkat |
|---|---|---|---|
| Login / Register | /login, /register | Publik | Form autentikasi pelanggan |
| Katalog | /katalog | Publik | Daftar alat, filter kategori, search |
| Detail Alat | /katalog/:id | Publik | Info alat, cek ketersediaan tanggal |
| Checkout Booking | /booking/checkout | Pelanggan | Ringkasan pesanan & lanjut ke pembayaran |
| Riwayat Booking | /booking/riwayat | Pelanggan | Daftar booking milik user & status terkini |
| Admin - Alat | /admin/equipment | Admin | CRUD alat & kategori |
| Admin - Booking | /admin/bookings | Admin | Daftar booking, konfirmasi pinjam/kembali |

## 5. Struktur Proyek

Struktur folder mengikuti pemisahan tanggung jawab yang jelas agar mudah dipelihara:
- `src/api` — instance axios & fungsi pemanggilan tiap endpoint
- `src/pages` — halaman-halaman sesuai struktur rute di atas
- `src/components` — komponen UI yang dipakai ulang
- `src/hooks` — custom hooks (mis. `useAuth`, `useEquipmentAvailability`)
- `src/types` — interface TypeScript yang merefleksikan resource API (Equipment, Booking, Payment, dll)
- `src/context` — auth context untuk menyimpan token & data user

## 6. Alur Interaksi Utama

### 6.1 Booking
1. Pelanggan memilih alat di katalog dan menentukan rentang tanggal sewa
2. Frontend memanggil endpoint pengecekan ketersediaan; jika stok tidak cukup, tampilkan pesan & saran tanggal lain
3. Jika tersedia, pelanggan checkout — frontend memanggil `POST /api/bookings`
4. Frontend mengarahkan pelanggan ke halaman pembayaran gateway
5. Setelah pembayaran, status booking diperbarui berdasarkan hasil polling atau redirect callback dari gateway

### 6.2 Admin
1. Admin login dan melihat daftar booking berstatus `paid` yang menunggu konfirmasi
2. Admin mengonfirmasi peminjaman — frontend memanggil endpoint konfirmasi (stock berkurang di backend)
3. Saat alat kembali, admin memverifikasi lewat endpoint konfirmasi pengembalian (stock bertambah kembali)

## 7. Kebutuhan Non-Fungsional
- Autentikasi token disimpan dengan aman (mis. httpOnly cookie atau strategi penyimpanan yang meminimalkan risiko XSS)
- Penanganan error API konsisten (pesan kesalahan validasi ditampilkan per-field)
- Loading state & empty state pada seluruh halaman yang memuat data dari API
- Desain responsif dasar (mobile & desktop)

## 8. Milestone Pengembangan
1. Setup project Vite + TypeScript, routing dasar, axios instance
2. Autentikasi (login, register, penyimpanan token)
3. Halaman katalog & detail alat
4. Alur booking & cek ketersediaan
5. Integrasi pembayaran
6. Panel admin (kelola alat, konfirmasi booking)
7. Polishing UI & responsive check

## 9. Metrik Keberhasilan
- Seluruh halaman berhasil mengonsumsi API tanpa error penanganan yang tidak tertangkap
- Alur booking end-to-end dapat diselesaikan dari sisi pelanggan tanpa hambatan UX
- Panel admin dapat menjalankan seluruh siklus konfirmasi booking (pinjam & kembali)
