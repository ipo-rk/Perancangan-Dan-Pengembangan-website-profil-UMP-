# Catatan Pemeriksaan & Perbaikan Link Mati

Dokumen ini merangkum hasil audit menyeluruh terhadap seluruh file dalam proyek
**Website Profil & Sistem Informasi Program Studi Hukum — UMP**, serta perbaikan
yang dilakukan agar seluruh halaman konsisten dan tidak ada tautan yang rusak.

## 1. Temuan

### a. Link mati di Admin Panel (penyebab utama)
Sidebar admin (`admin/dashboard.html`, `admin/berita.html`, `admin/dosen.html`)
sudah berisi menu navigasi ke 11 halaman modul, namun **hanya 4 file admin**
yang benar‑benar ada di paket asli (`login.html`, `dashboard.html`, `dosen.html`,
`berita.html`). Akibatnya 11 tautan berikut mengarah ke halaman yang tidak ada
(404): `profil-prodi.html`, `kurikulum.html`, `pengumuman.html`, `kegiatan.html`,
`prestasi.html`, `artikel.html`, `galeri.html`, `dokumen.html`, `alumni.html`,
`pengguna.html`, `pengaturan.html`.

### b. Link placeholder `href="#"`
Tombol **"Lupa Password?"** pada `admin/login.html` mengarah ke `#` tanpa aksi
apa pun (dead link).

### c. Halaman ke‑18 sesuai spesifikasi README belum ada
README menyebut 18 halaman admin termasuk **Activity Log**, namun halaman ini
belum dibuat dan belum ada di sidebar manapun.

### d. Diperiksa dan dinyatakan AMAN (bukan link mati)
- Anchor `#tentang`, `#sejarah`, `#visi-misi`, `#lulusan`, `#tujuan`, `#struktur`
  pada `profil.html` — seluruh elemen `id` tujuan sudah ada di halaman yang sama.
- Referensi `detailUrl(item.id)`, `foto.src`, dsb. pada halaman publik — ini
  adalah binding dinamis Alpine.js (`:href`, `:src`), bukan tautan statis, dan
  berfungsi normal.
- Semua CDN eksternal (Bootstrap, Tailwind, Alpine.js, SweetAlert2, Chart.js,
  Google Fonts) — aktif dan terverifikasi.
- Gambar placeholder dari `placehold.co` — layanan aktif, hanya perlu diganti
  dengan foto asli saat konten produksi tersedia (di luar cakupan "link mati").

## 2. Perbaikan yang Dilakukan

1. **Membuat 11 halaman admin yang hilang**, mengikuti pola desain, struktur
   sidebar/topbar, dan komponen Neumorphism yang identik dengan halaman yang
   sudah ada (`dashboard.html`, `berita.html`, `dosen.html`):
   - `profil-prodi.html` — formulir profil prodi (single record)
   - `kurikulum.html` — CRUD mata kuliah
   - `pengumuman.html` — CRUD pengumuman
   - `kegiatan.html` — CRUD kegiatan/agenda
   - `prestasi.html` — CRUD prestasi
   - `artikel.html` — CRUD artikel hukum
   - `galeri.html` — CRUD galeri foto (tampilan grid)
   - `dokumen.html` — CRUD dokumen publik
   - `alumni.html` — CRUD data alumni
   - `pengguna.html` — manajemen akun & role
   - `pengaturan.html` — pengaturan website (tab General/Appearance/SEO/
     Social Media/Contact/Sistem, termasuk tombol Backup Database)

2. **Menambahkan halaman ke‑18: `activity-log.html`** (Log Aktivitas), lengkap
   dengan tautan menu di seluruh sidebar admin agar sesuai spesifikasi README
   (18 halaman admin).

3. **Memperbarui sidebar** pada `dashboard.html`, `berita.html`, dan
   `dosen.html` agar menyertakan menu **Log Aktivitas**, sehingga navigasi
   di seluruh panel admin seragam.

4. **Memperbaiki link placeholder "Lupa Password?"** di `admin/login.html`
   — kini menampilkan dialog SweetAlert2 informatif alih-alih tautan mati.

5. **Menambahkan `sitemap.xml`** di root proyek, ditautkan dari tab SEO pada
   `admin/pengaturan.html` (sesuai spesifikasi bagian SEO di README), agar
   tautan tersebut valid.

6. **Menambahkan fungsi Alpine.js pendukung** di `assets/js/app.js`
   (`adminProfilProdi`, `adminKurikulumPage`, `adminPengumumanPage`,
   `adminKegiatanPage`, `adminPrestasiPage`, `adminArtikelPage`,
   `adminGaleriPage`, `adminDokumenPage`, `adminAlumniPage`,
   `adminPenggunaPage`, `adminActivityLogPage`, `adminPengaturanPage`) yang
   dibangun di atas helper generik `adminCrudTable()` yang sudah ada, sehingga
   pola simpan/edit/hapus/notifikasi SweetAlert2 konsisten dengan modul yang
   sudah ada (Dosen, Berita).

## 3. Verifikasi

- Seluruh tautan lokal (`href`/`src`) pada 33 file HTML telah diperiksa
  otomatis — **tidak ditemukan lagi tautan yang mengarah ke file yang tidak
  ada**.
- Struktur tag HTML pada seluruh halaman admin baru diverifikasi seimbang
  (tidak ada tag yang tidak tertutup).
- Sintaks `assets/js/app.js` diverifikasi valid (`node --check`).
- Seluruh halaman baru menggunakan design system, warna, tipografi, dan
  komponen (neu-raised, neu-input, neu-badge, side-link, dll.) yang identik
  dengan halaman yang sudah ada, sesuai prinsip di README: *"Satu design
  system Neumorphism dipakai konsisten dari Frontend hingga Admin Dashboard."*

## 4. Catatan untuk Pengembangan Lanjutan
- Data pada seluruh modul admin baru masih berupa **data contoh (sample data)**
  di sisi klien (JavaScript), sama seperti pola pada `dosen.html` dan
  `berita.html` bawaan. Untuk produksi, seluruh modul perlu dihubungkan ke
  backend/API sungguhan.
- Tombol unggah file/gambar pada beberapa halaman (Galeri, Dokumen, Kegiatan,
  Prestasi) masih berupa placeholder visual (`neu-pressed`), menunggu
  implementasi upload sungguhan.
- Gambar `placehold.co` disarankan diganti dengan aset asli sebelum go-live.
