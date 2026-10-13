# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Pengunjung utama adalah **penyewa pemula**: orang Bandung Raya dan sekitarnya yang belum pernah menyewa perlengkapan camping, sedang merencanakan perjalanan akhir pekan. Mereka tiba di `/` dari pencarian atau tautan yang dibagikan, hampir selalu lewat ponsel, sering pada malam hari menjelang berangkat.

Situasi mereka: mereka belum punya tenda, dan keputusan yang menentukan adalah "apakah alat di sini benar-benar bersih dan siap pakai", bukan "harga berapa per hari". Task mereka: memastikan hal itu, lalu masuk ke katalog untuk memilih alat dan tanggal.

Audiens sekunder: penyewa berulang yang sudah tahu jawabannya dan hanya perlu cepat mencapai katalog.

## Product Purpose

Public storefront dan pintu masuk katalog untuk toko sewa perlengkapan camping fisik di Lembang. Frontend adalah SPA yang murni mengonsumsi Camping Rental API (Laravel + Sanctum) lewat REST.

Success (PRD §10): pengunjung dapat menyelesaikan alur booking end-to-end tanpa hambatan UX, dan admin dapat menjalankan siklus verifikasi pembayaran sampai pengembalian tanpa akses server.

## Positioning

Sewa, bukan beli. Mekanisme yang membedakannya dari membeli outright: ketersediaan dihitung dari stok nyata untuk rentang tanggal yang dipilih, dan total biaya dihitung otomatis tanpa biaya tersembunyi. Alat disanitasi dan dicek sebelum tiap peminjaman. Tidak ada pesaing yang bisa menyalin ini tanpa Gudang fisik di Lembang.

## Operating Context

- Backend Laravel + Sanctum; token disimpan di localStorage; Vite mem-proxy `/api/*` dan `/storage/*` saat dev, Nginx menyajikan React di produksi.
- Pembayaran **diverifikasi manual oleh admin** (transfer / QRIS / tunai). Pelanggan melapor pembayarannya sendiri, status di-poll tiap 15 detik.
- Pengambilan dan pengembalian alat di toko fisik, jam 08.00-20.00 WIB.
- Admin mengunggah foto alat dan gambar hero sendiri lewat `/admin/settings`. Konvensi disk: `public/equipment/` dan `public/hero/`.
- Lokasi ditentukan lewat `maps_query` yang di-embed sebagai Google Maps.

## Capabilities and Constraints

Rute: `/` (landing publik), `/login`, `/register`, `/katalog`, `/katalog/:id`, `/booking/checkout`, `/booking/riwayat`, `/booking/riwayat/:id`, dan panel admin di `/admin/*` (equipment, bookings, payments, settings).

Batasan yang mengikat:
- **Light only.** Dark mode dihapus atas keputusan pemilik produk. Tidak ada `.dark` token block, tidak ada utilitas `dark:`, dan tidak ada theme toggle. PRD §2.1 dan §8 masih menyebut dark mode sebagai syarat dan perlu diperbarui.
- Desain responsif dasar, mobile dan desktop (PRD §8).
- Aksesibilitas dasar: label form, `aria-label` pada tombol ikon, navigasi keyboard (PRD §8).
- Loading state dan empty state wajib di setiap halaman yang memuat data API (PRD §8).
- Validasi foto: jpg/jpeg/png/webp, maksimal 2MB (PRD §6).
- Di luar scope (PRD §2.2): aplikasi mobile native, desain UI kustom kompleks atau animasi lanjutan, multi-bahasa, payment gateway otomatis.
- Belum selesai (PRD §9 milestone 9): optimasi bundle splitting dan animasi transisi halus.

Fakta produk yang masih terbuka: repositori tidak memuat satu pun aset berupa foto Understand, testimonial, atau statistik yang terverifikasi.

## Brand Commitments

- Nama produk adalah **"Berkah Alam Outdoor Organizer"**, dikonfirmasi pemilik produk dan diselaraskan dengan `maps_query` dari API. Ada satu pengecualian yang disengaja: instruksi transfer bank di `BookingDetailPage` masih menyebut "a.n. Camping Rental" karena nama pemilik rekening adalah fakta milik backend, bukan keputusan tampilan.
- Seluruh copy berbahasa Indonesia dengan nada ramah-informal.
- Wordmark dan mark di header (`Layout.tsx`) bersifat shared dan tidak termasuk lingkup redesign landing page.
- Pengguna membuka kunci visual world untuk landing page sepenuhnya: palet, tipografi, dan sistem komponen yang ada boleh diganti bila perlu. Satu-satunya batasan: **tidak boleh menambahkan konten yang belum ada di halaman tersebut**.

## Evidence on Hand

Aset dan data nyata yang tersedia:
- `GET /equipment` untuk nama, deskripsi, `price_per_day`, stok, foto, dan kategori. Dipakai untuk 8 katalog unggulan.
- `GET /admin/categories`, atau diturunkan dari equipment, untuk daftar kategori yang deep-link ke `?category_id=`.
- `GET /settings` untuk `hero_image` (path storage) dan `maps_query`.
- `src/utils/constants.ts` untuk nama, alamat, telepon, email, jam operasional, dan deskripsi perusahaan.
- Google Maps embed dari `maps_query`, default ke alamat.

Yang **tidak boleh dikarang** oleh pekerjaan berikutnya: testimonial pelanggan, jumlah penyewa, rating, logo klien, penghargaan, dan statistik booking terverifikasi. Halaman lama pernah menampilkan "500+ Penyewa Puas"; angka itu tidak memiliki sumber dan tidak boleh dikembalikan.

## Product Principles

1. **Menyakinkan sebelum menjual.** Pengunjung baru membutuhkan keyakinan soal kebersihan dan kesiapan alat sebelum ia peduli pada harga. Bukti lebih berharga daripada klaim.
2. **Katalog adalah tujuan, bukan panggung.** Halaman ini tidak memperlambat pengunjung; ia membuat mereka yakin lalu segera pindah ke katalog.
3. **Isi halaman adalah batas kreatif.** Jangan menambahkan testimonial, statistik, atau modul baru yang datanya tidak ada. Kekuatan halaman datang dari cara ia menyajikan data nyata, bukan dari kelengkapan.
4. **Light only, dan itu keputusan.** Dark mode dihapus dengan sengaja. Jangan menambahkannya kembali tanpa permintaan eksplisit; Tailwind v4 memiliki variant `dark` bawaan berbasis `prefers-color-scheme`, sehingga satu pun kelas `dark:` yang tersisa akan aktif diam-diam di perangkat pengguna ber-OS gelap.
5. **Kegagalan API adalah state yang dirancang.** Loading, kosong, dan error harus terlihat jelas dan tetap branded, bukan spinner generik.

## Accessibility & Inclusion

Standar minimum PRD §8: navigasi keyboard, label form, `aria-label` pada tombol ikon, serta loading dan empty state di setiap permukaan yang memuat data. Karena audiens utama memakai ponsel, target sentuh dan keterbacaan kontras di layar kecil adalah syarat, bukan bonus.

Setiap warna teks dan label harus diukur, bukan diperkirakan. Aksen merah oksida di `#b63c2e` menghasilkan 5.52:1 di atas paper dan 5.47:1 terhadap label `#fbfaf6`; terracotta lama `#f54900` hanya 3.46:1 dan gagal WCAG AA. `prefers-reduced-motion: reduce` harus tetap menghasilkan halaman utuh dengan semua garis terlihat dan tanpa transisi.