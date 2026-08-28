# PRD — Camping Rental Web
### React SPA (Vite + TypeScript)

**Versi:** 2.0
**Tanggal:** 26 Agustus 2026
**Pemilik Produk:** Tydon
**Tujuan dokumen:** Referensi pengembangan frontend sebagai consumer dari Camping Rental API (Laravel)

---

## 1. Latar Belakang & Tujuan

Frontend ini adalah Single Page Application yang mengonsumsi Camping Rental API (Laravel + Sanctum). Dibangun terpisah dari backend, dikomunikasikan murni lewat REST API menggunakan token autentikasi. Setelah versi awal fungsional, aplikasi berkembang dengan landing page publik ber-hero image yang dapat dikelola admin, unggah foto alat, verifikasi pembayaran manual, data kontak penyewa (nomor HP), serta penyempurnaan tema gelap.

## 2. Cakupan (Scope)

### 2.1 Termasuk dalam scope
- Landing page publik (`/`): hero section full-bleed dengan gambar dari `GET /api/settings` (fallback gradasi + ikon tenda), headline, CTA "Lihat Katalog", kategori populer (deep-link `?category_id=` ke katalog), katalog unggulan (8 alat), company profile (deskripsi, value props, kontak, jam operasional) beserta peta Google Maps lokasi
- Halaman autentikasi: registrasi (dengan nomor HP opsional, maks 20 karakter) & login pelanggan
- Halaman katalog alat: daftar, filter kategori, pencarian, urutan, detail alat
- Alur booking: pilih alat, pilih rentang tanggal, cek ketersediaan, checkout dengan thumbnail alat di ringkasan pesanan
- Pembayaran manual: pelanggan melaporkan pembayaran (transfer/QRIS/cash) pada halaman detail booking; status polling otomatis tiap 15 detik saat menunggu verifikasi
- Halaman riwayat & detail booking milik pelanggan (termasuk riwayat laporan pembayaran)
- Panel admin:
  - Kelola alat & kategori, termasuk **unggah/ganti/hapus foto alat**
  - Daftar booking lengkap dengan **nama penyewa, tombol detail penyewa (email & nomor HP)**, aksi konfirmasi pengambilan/pengembalian
  - Verifikasi & penolakan pembayaran
  - **Pengaturan situs**: unggah/hapus gambar hero landing page
- Mode terang/gelap (toggle tema); palet gelap memakai hitam pekat

### 2.2 Di luar scope
- Aplikasi mobile native
- Desain UI kustom yang kompleks/animasi lanjutan
- Multi-bahasa
- Integrasi payment gateway otomatis (pembayaran diverifikasi admin secara manual)

## 3. Arsitektur

React (Vite + TypeScript) dibangun sebagai SPA murni yang berkomunikasi dengan Laravel API lewat axios, menggunakan token Sanctum yang disimpan di localStorage. Routing ditangani React Router. Saat development, Vite mem-proxy `/api/*` dan `/storage/*` ke backend sehingga foto yang tersimpan di disk `public` dapat diakses langsung. Pada produksi, hasil build disajikan Nginx pada domain yang sama dengan API (path `/api/*` ke Laravel, sisanya ke React).

## 4. Struktur Halaman

| Halaman | Rute | Akses | Deskripsi singkat |
|---|---|---|---|
| Landing | / | Publik | Hero image dinamis, kategori populer, katalog unggulan, company profile + peta |
| Login / Register | /login, /register | Publik | Form autentikasi; registrasi memuat nomor HP opsional |
| Katalog | /katalog | Publik | Daftar alat, filter kategori (mendukung `?category_id=`), search |
| Detail Alat | /katalog/:id | Publik | Info alat, cek ketersediaan tanggal |
| Checkout Booking | /booking/checkout | Pelanggan | Ringkasan pesanan ber-thumbnail & buat booking |
| Riwayat Booking | /booking/riwayat | Pelanggan | Daftar booking milik user & status terkini |
| Detail Booking | /booking/riwayat/:id | Pelanggan | Timeline status, item ber-thumbnail, lapor pembayaran |
| Admin - Alat | /admin/equipment | Admin | CRUD alat (dengan foto) & kategori; thumbnail di tabel |
| Admin - Booking | /admin/bookings | Admin | Daftar booking, detail kontak penyewa, konfirmasi pinjam/kembali |
| Admin - Pembayaran | /admin/payments | Admin | Verifikasi/penolakan laporan pembayaran |
| Admin - Pengaturan | /admin/settings | Admin | Kelola gambar hero landing page |

## 5. Struktur Proyek

Struktur folder mengikuti pemisahan tanggung jawab yang jelas agar mudah dipelihara:
- `src/api` — instance axios & fungsi pemanggilan tiap endpoint (`catalog`, `bookings`, `auth`, `admin`, `settings`)
- `src/pages` — halaman-halaman sesuai struktur rute di atas (subfolder `admin/` untuk panel admin)
- `src/components` — komponen UI yang dipakai ulang (`Layout`, `EquipmentCard`, `Guard`) termasuk `shared/` (`ImageUploadField`, `Field`, pagination, empty state, badge status)
- `src/hooks` — custom hooks (`useAuth`, `useApiQuery`, `useEquipmentAvailability`)
- `src/types` — interface TypeScript yang merefleksikan resource API (Equipment, Booking, Payment, User, SiteSettings, dll)
- `src/context` — auth context untuk menyimpan token & data user
- `src/utils` — helper format (IDR, tanggal, resolusi URL foto) & konstanta (metode pembayaran, profil perusahaan)

## 6. Fitur Media & Pengaturan Situs

Konvensi bersama dengan backend:
- Disk `public`, folder `equipment/` untuk foto alat dan `hero/` untuk gambar hero
- Validasi identik client & server: `jpg/jpeg/png/webp`, maksimal 2MB
- Komponen reusable `ImageUploadField`: input `accept="image/*"`, preview via `URL.createObjectURL`, validasi format/ukuran sebelum kirim, tombol ganti/hapus/batal, dukungan preview foto tersimpan saat mode edit
- Kirim file via `FormData`; pembaruan alat dikirim sebagai `POST /admin/equipment/{id}` + `_method=PUT` (PHP tidak mem-parsing multipart pada PUT); hapus foto memakai flag `remove_photo`
- Endpoint settings: `GET /api/settings` (publik, mengembalikan `hero_image`) dan `POST`/`DELETE /api/admin/settings/hero-image` (admin; mengganti gambar otomatis menghapus file lama)
- Thumbnail ditampilkan di tabel admin, checkout, dan detail booking dengan fallback ikon tenda

## 7. Alur Interaksi Utama

### 7.1 Booking
1. Pelanggan memilih alat di katalog dan menentukan rentang tanggal sewa
2. Frontend memanggil endpoint pengecekan ketersediaan; jika stok tidak cukup, tampilkan pesan & saran tanggal lain
3. Jika tersedia, pelanggan checkout — frontend memanggil `POST /api/bookings`
4. Pelanggan melaporkan pembayaran (transfer/QRIS/cash) melalui form di halaman detail booking
5. Status diperbarui otomatis (polling 15 detik) setelah admin memverifikasi pembayaran

### 7.2 Admin
1. Admin memverifikasi laporan pembayaran di halaman Pembayaran — booking berubah menjadi `paid`
2. Admin mengonfirmasi peminjaman di halaman Booking — stock berkurang di backend; kontak penyewa dapat dilihat lewat tombol detail
3. Saat alat kembali, admin memproses pengembalian (stock bertambah kembali)

## 8. Kebutuhan Non-Fungsional
- Penanganan error API konsisten (pesan kesalahan validasi ditampilkan per-field)
- Loading state & empty state pada seluruh halaman yang memuat data dari API
- Desain responsif dasar (mobile & desktop); navbar fixed transparan di atas hero dan menjadi solid saat scroll
- Mode gelap dengan palet hitam pekat; preferensi tema tersimpan (next-themes)
- Aksesibilitas dasar: label form, aria-label pada tombol ikon, navigasi keyboard

## 9. Milestone Pengembangan
1. ✅ Setup project Vite + TypeScript, routing dasar, axios instance
2. ✅ Autentikasi (login, register + nomor HP opsional, penyimpanan token)
3. ✅ Halaman katalog & detail alat
4. ✅ Alur booking, cek ketersediaan, checkout
5. ✅ Laporan pembayaran manual & verifikasi admin
6. ✅ Panel admin (alat + foto, kategori, booking, pembayaran)
7. ✅ Landing page (hero dinamis, kategori, katalog unggulan, company profile + peta)
8. ✅ Pengaturan situs (gambar hero) & mode gelap hitam pekat
9. Polishing lanjutan: optimasi bundle splitting, animasi transisi halus

## 10. Metrik Keberhasilan
- Seluruh halaman berhasil mengonsumsi API tanpa error penanganan yang tidak tertangkap
- Alur booking end-to-end dapat diselesaikan dari sisi pelanggan tanpa hambatan UX
- Panel admin dapat menjalankan seluruh siklus: verifikasi pembayaran → konfirmasi pinjam → pengembalian
- Admin mampu mengelola konten visual (foto alat & gambar hero) tanpa perlu akses server
