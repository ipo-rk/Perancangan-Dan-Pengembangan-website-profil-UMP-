# Catatan Perbaikan — Versi Final

Dokumen ini merangkum semua perbaikan yang dilakukan terhadap `prodi-hukum-website-final-v5-fixed.zip`
agar frontend dan Admin Panel (backend) benar-benar terintegrasi, konsisten, akurat, dan bebas error.

## 1. Error yang diperbaiki

- **`Uncaught ReferenceError: SAMPLE_ALUMNI is not defined` (dashboard.html:259)**
  Penyebab: `assets/js/app.js` dimuat paling akhir (sebelum `</body>`), padahal ada `<script>` inline
  (inisialisasi Chart.js) di tengah halaman yang memakai `SAMPLE_ALUMNI` sebelum `app.js` sempat dimuat.
  **Perbaikan:** `app.js` sekarang dimuat di `<head>` pada **seluruh 34 halaman** (publik & admin),
  sehingga seluruh data dan fungsi bersama sudah tersedia sebelum skrip lain berjalan. Ini juga mencegah
  bug serupa muncul di halaman manapun di masa depan.

- **`cdn.tailwindcss.com should not be used in production`**
  Tailwind CDN + `tailwind.config` runtime diganti dengan build produksi:
  `assets/css/tailwind.min.css` (hasil kompilasi `tailwindcss` CLI, sudah di-purge & di-minify)
  dipasang di seluruh halaman sebagai `<link rel="stylesheet">` biasa. Tidak ada lagi console warning.

## 2. Integrasi Frontend ⇄ Admin Panel (perbaikan paling penting)

Sebelumnya, tombol Tambah/Edit/Hapus di Admin Panel hanya mengubah data **di memori tab itu saja**
(disalin dari `SAMPLE_*`), sehingga:
- Refresh halaman admin → perubahan hilang.
- Halaman publik (mis. `dosen.html`) **tidak pernah** menampilkan perubahan dari admin.

**Perbaikan:** dibuat lapisan data (`DB`) berbasis `localStorage` di `assets/js/app.js`:
- Semua entitas (`berita`, `dosen`, `dokumen`, `galeri`, `alumni`, `kegiatan`, `artikel`, `prestasi`,
  `kurikulum`, `pengumuman`, `pengguna`, `profil`, `pengaturan`, `aktivitas`) sekarang disimpan di
  `localStorage`, dengan data bawaan (`SEED_*`) hanya dipakai sekali di kunjungan pertama.
- Setiap operasi Tambah/Edit/Hapus di Admin Panel memanggil `DB.save(...)`, sehingga perubahan
  **persisten** dan langsung terlihat di halaman publik terkait pada kunjungan berikutnya.
- Ditambahkan **log aktivitas otomatis** (`logActivity()`): setiap aksi CRUD di admin otomatis
  tercatat dan langsung tampil di widget "Aktivitas Terbaru" (Dashboard) dan halaman "Log Aktivitas"
  (`admin/aktivitas.html`, yang sebelumnya berisi tabel statis hardcoded — sekarang dinamis).
- Ditambahkan **sesi login sederhana** (`AUTH`): `login.html` kini benar-benar membuat sesi,
  seluruh halaman admin (`adminShell()`) memeriksa sesi ini dan mengarahkan ke halaman login jika
  belum masuk; logout menghapus sesi.
- **Profil Program Studi** (`admin/profil-prodi.html`) dan **Pengaturan Website**
  (`admin/pengaturan.html`) sebelumnya tidak tersambung sama sekali ke halaman publik (`profil.html`,
  footer, `kontak.html`). Sekarang keduanya disimpan lewat `DB` dan halaman publik menampilkannya
  secara dinamis (Visi, Misi, Sejarah, Tujuan di `profil.html`; alamat/email/telepon di footer seluruh
  halaman dan di `kontak.html`).

## 3. Cara membangun ulang CSS Tailwind (jika ada perubahan class baru)

```bash
npm install
npx tailwindcss -i ./tailwind.input.css -o ./assets/css/tailwind.min.css --minify
```

## 4. Batasan yang diketahui (transparansi)

- Ini tetap merupakan prototipe **front-end only** (tanpa server/database sungguhan); "backend" berupa
  `localStorage` per-browser, bukan basis data multi-pengguna. Untuk produksi sungguhan, lapisan `DB`
  di `app.js` perlu diganti dengan pemanggilan REST API ke server.
- Bagian "Profil Lulusan" (4 kartu) di `profil.html` masih statis karena strukturnya berbeda dari field
  form admin (teks tunggal vs. beberapa kartu); bisa dikembangkan lebih lanjut bila diperlukan.
- Grafik tren konten & jumlah pengunjung di Dashboard masih berupa data ilustrasi (bukan angka historis
  sungguhan), karena sistem belum mencatat data time-series.
