# SPESIFIKASI FINAL

## Website Profil & Sistem Informasi Program Studi Hukum — Universitas Muhammadiyah Papua

> Dokumen ini menggabungkan **daftar fitur sistem** (dokumen 1) dan **master prompt desain UI** (dokumen 2) menjadi satu spesifikasi tunggal yang konsisten, tanpa duplikasi, siap dipakai sebagai acuan pengembangan (skripsi/prototipe/produksi).

**Tagline visual:** _"Modern Legal Education. Professional Digital Experience."_
**Identitas visual:** Academic · Professional · Modern · Clean · Elegant · Trustworthy · Neumorphism

---

## 1. Ringkasan Proyek

Website Program Studi Hukum terdiri dari dua bagian utama yang berbagi satu design system yang sama:

```
WEBSITE PRODI HUKUM
│
├── FRONTEND (publik: mahasiswa, dosen, alumni, calon mahasiswa, masyarakat)
└── ADMIN PANEL (Super Admin, Admin Prodi, Editor, Operator)
```

Prioritas pengembangan: **Usability > Accessibility > Performance > Visual Effects**

---

## 2. Tech Stack

| Layer                  | Teknologi                                                                         | Fungsi                                                                   |
| ---------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Struktur               | HTML5 semantic (`header`, `nav`, `main`, `section`, `article`, `aside`, `footer`) | Struktur dasar halaman                                                   |
| Layout & komponen      | Bootstrap 5                                                                       | Grid, container, modal, navbar, dropdown, offcanvas                      |
| Visual styling         | Tailwind CSS                                                                      | Spacing, typography, warna, shadow neumorphic, custom card               |
| Interaktivitas         | Alpine.js                                                                         | Dropdown, tab, accordion, modal state, search/filter, dark mode, sidebar |
| Notifikasi/UX feedback | SweetAlert2                                                                       | Konfirmasi hapus, sukses/gagal simpan, logout, validasi form             |

**Aturan pemakaian:** Tailwind untuk _visual design_, Bootstrap 5 untuk _struktur/komponen responsif tertentu_. Jangan mencampur utility class Bootstrap & Tailwind pada komponen yang sama hingga bertabrakan.

---

## 3. Design System — Neumorphism UI

### 3.1 Warna

| Peran      | Nilai                                         |
| ---------- | --------------------------------------------- |
| Background | Soft Light / Cool Gray — `#E8ECF1`, `#EEF1F5` |
| Primary    | Deep Navy                                     |
| Secondary  | Royal Blue                                    |
| Accent     | Gold / Amber                                  |
| Success    | Emerald                                       |
| Danger     | Red                                           |
| Teks       | Dark Navy / Charcoal                          |

Karakteristik permukaan neumorphic: soft outer shadow, soft inner shadow (untuk elemen pressed), raised card, rounded corner, gradasi halus. Shadow **tidak boleh berat/tebal**.

Contoh konsep shadow:

```css
box-shadow:
  10px 10px 25px rgba(...),
  -10px -10px 25px rgba(...);
```

Radius yang dipakai: `12px / 16px / 20px / 24px`

### 3.2 Tipografi

- Body: **Inter** atau **Plus Jakarta Sans**
- Heading: **Poppins**

| Elemen | Ukuran  |
| ------ | ------- |
| H1     | 42–56px |
| H2     | 32–40px |
| H3     | 24–30px |
| Body   | 15–17px |
| Small  | 13–14px |

### 3.3 Dark Mode (opsional)

- Light: Soft Gray + Navy + Blue
- Dark: Deep Navy + Dark Gray + Blue/Violet (tidak boleh terlalu hitam pekat)
- Prinsip neumorphism tetap dipertahankan secara subtle di kedua mode.

### 3.4 Larangan visual

Template usang · gradient berlebihan · shadow terlalu kuat · warna terlalu banyak · animasi berlebihan · font kecil · layout padat · icon tidak konsisten · kartu terlalu banyak dalam satu area · neumorphism yang mengorbankan keterbacaan teks · gambar palu hakim yang klise/berlebihan.

---

## 4. FRONTEND — Fitur & Halaman

### 4.1 Navbar (sticky saat scroll)

- Logo universitas + teks "PROGRAM STUDI HUKUM"
- Menu: Beranda, Profil, Dosen, Kurikulum, Berita, Pengumuman, Kegiatan, Prestasi, Artikel Hukum, Galeri, Dokumen, Alumni, Kontak
- Search global, dark/light mode toggle, mobile menu (hamburger → offcanvas)
- CTA: **Portal Akademik**

### 4.2 Hero Beranda

- Headline: _"Membangun Generasi Hukum yang Berintegritas, Profesional, dan Berkeadilan."_
- Subheadline: _"Program Studi Hukum berkomitmen menyelenggarakan pendidikan hukum yang unggul, berintegritas, dan relevan dengan perkembangan masyarakat serta dunia profesional."_
- Tombol: **Tentang Prodi**, **Lihat Kurikulum**
- Neumorphic button, elemen geometris halus, ilustrasi akademik yang elegan

### 4.3 Quick Information

4–6 kartu neumorphic (icon, angka, label, deskripsi singkat, hover effect): Akreditasi, Kurikulum, Dosen, Mahasiswa, Alumni, Prestasi.

### 4.4 Daftar Halaman Frontend (final, 19 halaman)

| #   | Halaman           | Isi Utama                                                                                                        |
| --- | ----------------- | ---------------------------------------------------------------------------------------------------------------- |
| 01  | Beranda           | Hero, quick info, highlight berita/kegiatan                                                                      |
| 02  | Profil Prodi      | Tentang, Sejarah, Visi, Misi, Tujuan, Profil Lulusan, Kompetensi, Struktur Organisasi (Kaprodi, sekretaris, dll) |
| 03  | Dosen             | Grid profil dosen + filter jabatan + search                                                                      |
| 04  | Detail Dosen      | Modal/halaman detail (Alpine.js)                                                                                 |
| 05  | Kurikulum         | Tabel MK per semester + filter + download                                                                        |
| 06  | Berita            | Featured news + grid berita + filter kategori                                                                    |
| 07  | Detail Berita     | Isi berita lengkap                                                                                               |
| 08  | Pengumuman        | List neumorphic dengan badge status                                                                              |
| 09  | Detail Pengumuman | Isi + lampiran                                                                                                   |
| 10  | Kegiatan / Agenda | Kalender, timeline, event card                                                                                   |
| 11  | Detail Kegiatan   | Info lengkap + CTA daftar                                                                                        |
| 12  | Prestasi          | Filter kategori (mahasiswa/dosen/alumni/prodi) + level                                                           |
| 13  | Artikel Hukum     | Portal akademik, filter kategori hukum                                                                           |
| 14  | Detail Artikel    | Judul, penulis, referensi, artikel terkait, share                                                                |
| 15  | Galeri            | Masonry grid + lightbox + filter album                                                                           |
| 16  | Detail Galeri     | Album foto per kegiatan                                                                                          |
| 17  | Dokumen           | Pusat dokumen publik (PDF/DOC/DOCX) dengan kategori                                                              |
| 18  | Alumni            | Profil alumni + statistik (total, bekerja, wirausaha, studi lanjut)                                              |
| 19  | Kontak            | Alamat, email, telepon, sosial media, jam layanan, form kontak                                                   |

### 4.5 Detail Konten per Modul

**Dosen** — Foto, Nama, Gelar, NIDN/NIP/NIDK, Jabatan (Profesor/Lektor Kepala/Lektor/Asisten Ahli/Dosen), Bidang keahlian, Pendidikan (S1/S2/S3), Email, Profil singkat.

**Kurikulum** — Tahun kurikulum, Kode MK, Nama MK, SKS, Semester, Jenis (Wajib/Pilihan), Prasyarat.

**Berita** — Judul, Thumbnail, Isi, Kategori (Akademik, Kemahasiswaan, Penelitian, Pengabdian, Prestasi, Seminar, Kegiatan, Pengumuman), Penulis, Tanggal, Status publikasi.

**Pengumuman** — Judul, Isi, Lampiran, Tanggal mulai/berakhir, Status (Baru/Penting/Aktif/Berakhir).

**Kegiatan** — Nama, Tanggal, Waktu, Lokasi, Penyelenggara, Deskripsi, Poster, Dokumentasi. Jenis: seminar nasional, kuliah umum, workshop, sosialisasi, pengabdian masyarakat, penelitian, moot court, diskusi hukum.

**Prestasi** — Nama, Kategori, Prestasi, Tingkat (Internasional/Nasional/Provinsi/Regional/Universitas), Tahun, Penyelenggara, Foto/sertifikat.

**Artikel Hukum** — Judul, Penulis, Tanggal, Kategori (Pidana, Perdata, Tata Negara, Administrasi Negara, Internasional, Bisnis, Adat, Teknologi), Featured image, Isi, Referensi, Artikel terkait, Tombol share.

**Galeri** — Album per kegiatan (Seminar, Kuliah Umum, Praktikum, Kegiatan Mahasiswa, Wisuda, Pengabdian, Penelitian).

**Dokumen** — Nama dokumen, Kategori (Pedoman Akademik, Kurikulum, Formulir, Peraturan, SOP, Panduan, Akreditasi, Dokumen Publik), Format, Ukuran, Tanggal, Deskripsi, Tombol Download.

**Alumni** — Foto, Nama, Tahun masuk/lulus, Program, Pekerjaan, Instansi, Jabatan, Email, LinkedIn, Testimoni.

**Kontak** — Form: Nama, Email, Subjek, Pesan → Tombol **Kirim Pesan** → SweetAlert2: _"Pesan berhasil dikirim."_

### 4.6 Search Global

Satu search bar (_"Cari informasi Prodi..."_) mencakup: berita, dosen, artikel, kegiatan, pengumuman, dokumen.

### 4.7 Footer

| Kolom         | Isi                                   |
| ------------- | ------------------------------------- |
| Program Studi | Profil, Visi & Misi, Dosen, Kurikulum |
| Akademik      | Berita, Pengumuman, Kegiatan, Dokumen |
| Informasi     | Prestasi, Artikel, Galeri, Alumni     |
| Kontak        | Alamat, Email, Telepon, Sosial Media  |

Copyright: **© 2026 Program Studi Hukum. All Rights Reserved.**

---

## 5. ADMIN PANEL — Fitur & Halaman

### 5.1 Login

Panel login neumorphic terpusat, logo universitas, judul **"Admin Program Studi Hukum"**, field Username/Email + Password (show/hide via Alpine.js), opsi Remember Me & Lupa Password, tombol **Login**.

### 5.2 Role & Hak Akses

| Role        | Akses                                                                                |
| ----------- | ------------------------------------------------------------------------------------ |
| Super Admin | Akses penuh termasuk pengaturan sistem                                               |
| Admin Prodi | Kelola seluruh konten & data prodi                                                   |
| Editor      | Kelola Berita, Artikel, Kegiatan, Galeri, Pengumuman (tanpa akses pengaturan sistem) |
| Operator    | Input data operasional terbatas                                                      |

Panel admin juga menampilkan: Role, Permission, Session status, Last login, Activity log. Data sensitif tidak ditampilkan di frontend publik.

### 5.3 Dashboard

Topbar: search, notifikasi, profil pengguna, theme switch, breadcrumb.
Sidebar: Dashboard, Profil Prodi, Dosen, Kurikulum, Berita, Pengumuman, Kegiatan, Prestasi, Artikel, Galeri, Dokumen, Alumni, Pengguna, Pengaturan, Logout.

**KPI Cards** (icon, angka, label, growth indicator, mini chart):
Total Dosen · Total Mahasiswa · Total Alumni · Total Berita · Total Kegiatan · Total Artikel · Total Dokumen · Total Galeri

**Grafik Dashboard:**

- Line chart — Statistik konten (Berita, Artikel, Kegiatan, Dokumen)
- Donut chart — Statistik Alumni
- Area chart — Statistik Pengunjung Website (harian/bulanan/total)

### 5.4 Daftar Halaman Admin (final, 18 halaman) & CRUD per Modul

| #     | Halaman              | Field / Fitur CRUD                                                                                                                |
| ----- | -------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| 01    | Login                | Username/Email, Password                                                                                                          |
| 02    | Dashboard            | KPI cards + grafik                                                                                                                |
| 03    | Profil Prodi         | Nama Prodi, Kode Prodi, Fakultas, Universitas, Akreditasi, Deskripsi, Sejarah, Visi, Misi, Tujuan, Profil Lulusan                 |
| 04–05 | Dosen / Tambah-Edit  | Foto, Nama, NIDN, NIP, Gelar, Jabatan, Email, Telepon, Bidang Keahlian, Pendidikan, Deskripsi, Status; + Search, Filter, Export   |
| 06    | Kurikulum            | Kode, Nama MK, SKS, Semester, Jenis, Deskripsi; + Search, Filter Semester/Jenis, Import/Export                                    |
| 07–08 | Berita / Tambah-Edit | Judul, Slug, Kategori, Featured Image, Excerpt, Content, Author, Status (Draft→Review→Published/Scheduled/Archived), Publish Date |
| 09    | Pengumuman           | Judul, Isi, Kategori, Tanggal, Status, Lampiran                                                                                   |
| 10    | Kegiatan             | Nama, Tanggal, Jam, Lokasi, Penyelenggara, Deskripsi, Poster, Status; tampilan kalender                                           |
| 11    | Prestasi             | Nama, Kategori, Prestasi, Tingkat, Tahun, Foto, Deskripsi                                                                         |
| 12    | Artikel              | Judul, Penulis, Kategori, Thumbnail, Isi (rich text editor), Tags, Status, Tanggal                                                |
| 13    | Galeri               | Upload foto (single/multiple/drag&drop), Album, Kategori, Caption, Preview, Delete                                                |
| 14    | Dokumen              | Nama Dokumen, Kategori, File, Format, Ukuran, Tanggal, Deskripsi, Status, Preview                                                 |
| 15    | Alumni               | Nama, Foto, Tahun Lulus, Program, Pekerjaan, Instansi, Email, LinkedIn, Testimoni, Status                                         |
| 16    | Pengguna             | Manajemen akun admin/editor/operator + role                                                                                       |
| 17    | Pengaturan           | Lihat bagian 5.5                                                                                                                  |
| 18    | Activity Log         | Riwayat aktivitas pengguna admin                                                                                                  |

Semua modul CRUD mendukung: Tambah, Edit, Detail, Hapus, Upload gambar, Upload PDF, Publikasi/Sembunyikan konten.

Konfirmasi hapus selalu memakai SweetAlert2:

> _"Apakah Anda yakin ingin menghapus data ini?"_ — Tombol **Ya, Hapus** / **Batal**

### 5.5 Pengaturan Website

| Bagian       | Field                                                                            |
| ------------ | -------------------------------------------------------------------------------- |
| General      | Nama Website, Logo, Logo Universitas, Favicon, Deskripsi, Alamat, Email, Telepon |
| Appearance   | Theme, Primary Color, Dark Mode, Sidebar                                         |
| SEO          | Meta Title, Meta Description, Keywords, Slug artikel, Sitemap                    |
| Social Media | Facebook, Instagram, YouTube, LinkedIn                                           |
| Contact      | Email, Telepon, Alamat                                                           |
| Sistem       | Backup Database                                                                  |

---

## 6. Sistem Notifikasi (SweetAlert2) — Standar Pesan

| Aksi             | Pesan                                         |
| ---------------- | --------------------------------------------- |
| Simpan           | "Data berhasil disimpan."                     |
| Update           | "Data berhasil diperbarui."                   |
| Hapus            | "Data berhasil dihapus."                      |
| Konfirmasi hapus | "Apakah Anda yakin ingin menghapus data ini?" |
| Error            | "Terjadi kesalahan. Silakan coba lagi."       |
| Logout           | "Apakah Anda yakin ingin keluar?"             |

Semua modal SweetAlert2 mengikuti tema Neumorphism (warna & radius konsisten dengan design system).

---

## 7. Interaksi Alpine.js

Mobile navigation · Sidebar · Dropdown · Modal · Tabs · Accordion · Search · Filter · Sorting · Pagination UI · Dark Mode · Notifikasi/Toast · Password visibility · Gallery lightbox · Calendar · Delete confirmation trigger · Form state · Loading state.

---

## 8. Component Library (reusable)

Navbar · Sidebar · Footer · Button · Neumorphic Card · Stat Card · Profile Card · News Card · Event Card · Gallery Card · Document Card · Table · Modal · Dropdown · Tabs · Accordion · Badge · Alert · Toast · Pagination · Search · Filter · Form · File Upload · Calendar · Breadcrumb.

---

## 9. UI States (wajib di semua halaman)

| State         | Contoh                                 |
| ------------- | -------------------------------------- |
| Loading       | Skeleton loading                       |
| Empty         | "Belum ada data."                      |
| Error         | "Data gagal dimuat."                   |
| Success       | "Data berhasil dimuat."                |
| Search kosong | "Data yang Anda cari tidak ditemukan." |

---

## 10. Responsive & Aksesibilitas

**Breakpoint wajib diuji:** 320px, 375px, 390px (mobile) · 768px (tablet) · 1024px, 1280px, 1440px, 1920px (desktop/laptop).
Mobile navigation: hamburger + offcanvas sidebar; bottom action bila diperlukan. Tabel: horizontal scroll atau mode kartu responsif.

**Aksesibilitas (mengacu WCAG):** kontras teks jelas, label pada button & input, keyboard accessible, focus state terlihat, alt text gambar, semantic HTML, typography responsif, target sentuh minimal 44px. Neumorphism tidak boleh mengurangi keterbacaan/kontras elemen.

---

## 11. Fitur Tambahan (Nice-to-have)

1. **Notifikasi** real-time saat ada berita/pengumuman baru
2. **Responsive Design** penuh (laptop, tablet, smartphone)
3. **Dark Mode** (☀️ Light / 🌙 Dark)
4. **Statistik Pengunjung** (hari ini, bulan ini, total) — ditampilkan di dashboard admin
5. **SEO** — meta title, meta description, slug artikel, sitemap
6. **Backup Database** dari panel admin

---

## 12. Prinsip Akhir

- Satu design system Neumorphism dipakai konsisten dari **Frontend hingga Admin Dashboard**, bukan sekadar mockup — seluruh komponen harus siap dikembangkan menjadi sistem nyata.
- Tailwind untuk visual, Bootstrap 5 untuk struktur, Alpine.js untuk interaktivitas, SweetAlert2 untuk feedback — tidak tumpang tindih.
- Prioritas: **Usability > Accessibility > Performance > Visual Effects.**

**Keyword desain acuan:** Premium Neumorphism UI · Modern University Website · Law School Website · Academic Portal · Professional Education Platform · Soft UI · Clean Dashboard · Responsive Web Design · Glass-free Neumorphism · Accessible UI · Minimalist Academic Design.

---

## 13. Status Implementasi & Changelog Perbaikan

Proyek ini sudah diimplementasikan penuh sebagai kode statis (HTML/CSS/JS berjalan tanpa backend, data memakai `SAMPLE_*` di `assets/js/app.js`). Struktur final:

**Frontend (13 halaman + 5 halaman detail):** Beranda, Profil, Dosen, Kurikulum, Berita (+ detail), Pengumuman (+ detail), Kegiatan (+ detail), Prestasi, Artikel Hukum (+ detail), Galeri (+ detail), Dokumen, Alumni, Kontak.

**Admin Panel (16 halaman):** Login, Dashboard, Profil Prodi, Dosen, Kurikulum, Berita, Pengumuman, Kegiatan, Prestasi, Artikel, Galeri, Dokumen, Alumni, Pengguna, Pengaturan, Activity Log.

### Perbaikan pada audit terakhir
- **Navbar/search tidak berfungsi** di 8 halaman (Beranda, Profil, Dosen, Kurikulum, Kontak, Prestasi, Dokumen, Alumni) — disamakan ke pola `siteHeader()` + `doSearch()` yang sudah benar di halaman lain.
- **Bug nav-link aktif**: link "Beranda" pada navbar desktop (mega-menu dropdown) sebelumnya *selalu* tersorot aktif di semua halaman, sementara item di dalam dropdown (Dosen, Kurikulum, Berita, dst.) dan tombol trigger grup (Profil/Informasi/Mahasiswa) tidak pernah tersorot. Sudah diperbaiki: status aktif sekarang mengikuti halaman yang sedang dibuka, termasuk menyalakan trigger grup saat salah satu halaman di dalamnya aktif.
- **Halaman Dosen**: kartu dan tombol "Lihat Profil" sebelumnya statis tanpa `@click`. Sekarang memakai `dosenPage()` — search & filter jabatan reaktif, dan modal detail dosen berfungsi penuh.
- **Halaman Dokumen, Prestasi, Kurikulum, Alumni**: filter/tab semester sebelumnya dekoratif (tidak mengubah data). Sekarang tersambung ke `dokumenPage()`, `prestasiPage()`, `kurikulumPage()`, dan `alumniPage()` (baru ditambahkan) di `app.js`.
- **`adminShell()`**: memperbaiki bug sidebar admin yang memakai `window.innerWidth` (dibaca sekali saat load, tidak reaktif saat resize) → diganti pendekatan CSS murni (`.admin-sidebar` + breakpoint 1024px).
- **11 halaman admin yang hilang** (link mati di sidebar): Profil Prodi, Kurikulum, Pengumuman, Kegiatan, Prestasi, Artikel, Galeri, Dokumen, Alumni, Pengguna, Pengaturan — semua sudah dibangun dengan shell identik (sidebar/topbar) dan CRUD berfungsi (`adminCrudTable()`), plus halaman Activity Log yang sebelumnya belum ada.
- **CSS pendukung** (`.modal-backdrop-neu`, `.admin-sidebar`) yang dipakai di markup tapi belum terdefinisikan sudah ditambahkan ke `style.css`.
- Data kurikulum dilengkapi untuk Semester 6–8 (sebelumnya kosong sehingga tab tersebut tidak menampilkan apa pun).

### Keterbatasan yang diketahui (bukan bug, keputusan desain)
- Semua data bersumber dari array `SAMPLE_*` di `app.js` (tidak ada backend/database sungguhan) — perubahan lewat form admin tidak persisten setelah refresh halaman, sesuai sifat prototipe front-end.
- Tombol Import/Export, Backup Database, dan upload berkas berjalan sebagai simulasi (menampilkan notifikasi SweetAlert2) karena tidak ada server penyimpanan.
- Pencarian global (`doSearch()`) mencari lewat indeks statis dan berpindah halaman ke hasil pertama yang cocok saat menekan Enter — bukan dropdown saran langsung.

