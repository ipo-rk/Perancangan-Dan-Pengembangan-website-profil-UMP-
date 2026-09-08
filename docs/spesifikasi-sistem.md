# 📑 SPESIFIKASI & ANALISIS PERANCANGAN SISTEM

## Website Profil & Panel Admin Program Studi Hukum — Universitas Muhammadiyah Papua (UMP)

> Dokumen spesifikasi teknis dan kebutuhan sistem berbasis arsitektur _Client-Side Persistence Engine_ (LocalStorage + IndexedDB), _Tailwind CSS & Neumorphic Design System_, serta kontrol hak akses _Role-Based Access Control_ (RBAC).

---

## 📋 DAFTAR ISI

1. [Deskripsi & Batasan Sistem](#1-deskripsi-batasan-sistem)
2. [Aktor & Hak Akses Sistem (RBAC Matrix)](#2-aktor-hak-akses-sistem-rbac-matrix)
3. [Spesifikasi Model Data (17 Koleksi Data)](#3-spesifikasi-model-data-17-koleksi-data)
4. [Struktur Berkas Proyek (36 Halaman HTML)](#4-struktur-berkas-proyek-36-halaman-html)
5. [Tautan Diagram & Viewer Interaktif](#5-tautan-diagram-viewer-interaktif)

---

## 1. 📋 Deskripsi & Batasan Sistem

Sistem Informasi Website Profil Program Studi Hukum Universitas Muhammadiyah Papua adalah sistem informasi akademik dan profil kelembagaan yang menyediakan layanan portal publik terintegrasi serta panel administrasi berbasis peran (_Role-Based Access Control_).

### Karakteristik Arsitektur Kunci:

- **Single Source of Truth**: Seluruh data dinamis disimpan dan dikelola pada browser klien melalui **Web Storage API (`localStorage`)** dengan _namespace_ terisolasi `prodihukum_db_v1_*`.
- **Unlimited Media Storage**: File gambar/poster berformat base64 dicadangkan secara asinkron ke **IndexedDB** (`ProdiHukumDB` / objectStore `entities`) untuk mencegah limit memori localStorage.
- **Auto-Pruning Storage Engine**: Sistem secara proaktif memangkas data pageview dan log audit lama (`pruneStorage()`) bila kuota penyimpanan mendekati batas maksimal.
- **Reaktivitas Tanpa Reload**: Filter data, pencarian kueri instan di 9 entitas, modal dialog, dan transisi halaman dikelola oleh **Alpine.js 3.14.8**.
- **Modern Neumorphism Design**: Menggabungkan utilitas **Tailwind CSS 3.4**, **Bootstrap 5.3.3 Grid**, serta 785 baris token kustom pada `assets/css/style.css` dengan dukungan penuh **Dark Mode**.

---

## 2. 👥 Aktor & Hak Akses Sistem (RBAC Matrix)

| Aktor / Peran            | Deskripsi                                                     | Hak Akses Utama                                                                                                                                                                                                                           |
| ------------------------ | ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **👤 Pengunjung Publik** | Mahasiswa, calon mahasiswa baru, alumni, dan masyarakat luas. | • Mengakses seluruh 18 halaman portal publik.<br/>• Melakukan pencarian global realtime di 9 entitas data.<br/>• Mengisi formulir pendaftaran kegiatan & pesan kontak.<br/>• Mengunduh dokumen akademik & beralih tema _Dark/Light Mode_. |
| **👨‍💼 Operator**          | Staf administrasi operasional program studi.                  | • Mengelola data pendaftar kegiatan & entri data umum.<br/>• Memantau statistik ringkasan dan aktivitas sistem.                                                                                                                           |
| **✍️ Editor**            | Tim redaksi publikasi berita dan karya ilmiah.                | • Mengelola konten berita, artikel hukum, kegiatan, pengumuman, galeri, dan prestasi.<br/>• Mempublikasikan (_Publish_) atau menyimpan draf (_Draft/Review_).                                                                             |
| **👑 Super Admin**       | Pimpinan Program Studi / Administrator Sistem.                | • Akses penuh ke seluruh 11 modul CRUD.<br/>• **Khusus**: Manajemen akun pengguna & peran (`admin/pengguna.html`).<br/>• **Khusus**: Pengaturan identitas web, SEO, kontak, peta, dan Backup/Restore JSON (`admin/pengaturan.html`).      |

---

## 3. 🗄️ Spesifikasi Model Data (17 Koleksi Data)

Setiap entitas dikelola secara independen melalui antarmuka `DB.load()` dan `DB.save()` pada `assets/js/app.js`:

|   No   | Koleksi / Entitas (`dbKey`) | Tipe Record  | Deskripsi & Atribut Utama                                                                                                                                                                        |
| :----: | --------------------------- | :----------: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **1**  | `berita`                    | Multi-Record | Publikasi warta jurnalistik (`id, slug, judul, kategori, tanggal, penulis, excerpt, konten, status, featured, gambar`).                                                                          |
| **2**  | `dosen`                     | Multi-Record | Direktori dosen tetap (`id, nama, jabatan, keahlian, pendidikan, email, nidn, profil, status, foto`).                                                                                            |
| **3**  | `dokumen`                   | Multi-Record | Berkas akademik unduhan (`id, nama, kategori, format, ukuran`).                                                                                                                                  |
| **4**  | `galeri`                    | Multi-Record | Dokumentasi kegiatan per album (`id, judul, album, src`).                                                                                                                                        |
| **5**  | `pengumuman`                | Multi-Record | Edaran resmi akademik (`id, judul, status, badge, tanggal, isi, lampiran`).                                                                                                                      |
| **6**  | `kegiatan`                  | Multi-Record | Agenda & kalender akademik (`id, nama, tanggal, hari, bulan, waktu, lokasi, penyelenggara, deskripsi, gambar`).                                                                                  |
| **7**  | `pendaftar`                 | Multi-Record | Peserta kegiatan terdaftar (`id, kegiatanId [FK], kegiatanNama, nama, email, whatsapp, instansi, waktuDaftar`).                                                                                  |
| **8**  | `artikel`                   | Multi-Record | Artikel & opini hukum (`id, judul, penulis, kategori, tanggal, isi, referensi, tags, status, thumbnail`).                                                                                        |
| **9**  | `prestasi`                  | Multi-Record | Pencapaian civitas akademika (`id, nama, kategori, tingkat, tahun, foto`).                                                                                                                       |
| **10** | `kurikulum`                 | Multi-Record | Struktur mata kuliah (`id, kode, nama, sks, jenis, semester`).                                                                                                                                   |
| **11** | `alumni`                    | Multi-Record | Data lulusan & tracer study (`id, nama, angkatan, pekerjaan, instansi, kategori, email, linkedin, status, foto`).                                                                                |
| **12** | `pengguna`                  | Multi-Record | Akun panel admin (`id, nama, email, password, role, status`).                                                                                                                                    |
| **13** | `aktivitas`                 | Multi-Record | Log audit trail aksi pengguna (`id, user, aksi, waktu, tanggalIso, icon`).                                                                                                                       |
| **14** | `notifikasi`                | Multi-Record | Peringatan & pesan lonceng admin (`id, judul, pesan, waktu, read, icon`).                                                                                                                        |
| **15** | `profil`                    |  Singleton   | Profil kelembagaan (`nama, kode, fakultas, universitas, akreditasi, deskripsi, sejarah, visi, misi, tujuan, lulusan`).                                                                           |
| **16** | `struktur`                  | Multi-Record | Struktur pengurus prodi (`id, nama, jabatan, foto`).                                                                                                                                             |
| **17** | `pengaturan`                |  Singleton   | Konfigurasi situs (`namaWebsite, deskripsi, logo, favicon, theme, primaryColor, darkMode, metaTitle, metaDesc, keywords, email, telepon, alamat, mapEmbed, mapLink, koordinat, mahasiswaAktif`). |

---

## 4. 📂 Struktur Berkas Proyek (36 Halaman HTML)

```
Perancangan-Dan-Pengembangan-website-profil-UMP/
├── index.html                   # Beranda Utama Website
├── profil.html                  # Profil, Visi-Misi, Sejarah, & Struktur
├── dosen.html                   # Direktori Dosen & Modal Profil
├── kurikulum.html               # Struktur Kurikulum & Sebaran SKS
├── berita.html                  # Indeks Berita Kampus
├── pengumuman.html              # Pengumuman & Edaran Akademik
├── kegiatan.html                # Agenda & Kalender Kegiatan
├── artikel.html                 # Artikel & Opini Hukum
├── prestasi.html                # Galeri Prestasi Civitas Akademika
├── alumni.html                  # Database Alumni & Tracer Study
├── galeri.html                  # Album Dokumentasi Foto
├── dokumen.html                 # Download Dokumen & Panduan
├── kontak.html                  # Informasi Kontak & Form Pesan
├── detail-berita.html           # Halaman Detail Berita
├── detail-pengumuman.html       # Halaman Detail Pengumuman
├── detail-kegiatan.html         # Halaman Detail & Form Daftar Kegiatan
├── detail-artikel.html          # Halaman Detail Artikel Hukum
├── detail-galeri.html           # Slideshow & Detail Album Galeri
│
├── admin/                       # PANEL ADMINISTRASI (RBAC GUARD)
│   ├── login.html               # Portal Otentikasi Admin
│   ├── lupa-sandi.html          # Alur Reset Kata Sandi Admin
│   ├── dashboard.html           # Ringkasan Statistik & Tren Konten
│   ├── profil-prodi.html        # Kelola Profil & Struktur Prodi
│   ├── dosen.html               # CRUD Data Dosen
│   ├── kurikulum.html           # CRUD Mata Kuliah
│   ├── berita.html              # CRUD Berita
│   ├── pengumuman.html          # CRUD Pengumuman
│   ├── kegiatan.html            # CRUD Kegiatan & Kelola Pendaftar
│   ├── prestasi.html            # CRUD Prestasi
│   ├── artikel.html             # CRUD Artikel Hukum
│   ├── galeri.html              # CRUD Galeri Foto
│   ├── dokumen.html             # CRUD Dokumen Akademik
│   ├── alumni.html              # CRUD Alumni
│   ├── pengguna.html            # CRUD Akun (Khusus Super Admin)
│   ├── aktivitas.html           # Log Audit Trail Sistem
│   ├── activity-log.html        # Redirect resmi ke aktivitas.html
│   └── pengaturan.html          # Konfigurasi & Backup (Khusus Super Admin)
│
├── assets/
│   ├── css/
│   │   ├── style.css            # Neumorphism Tokens & Dark Mode (785 baris)
│   │   └── tailwind.min.css     # Build Utilitas Tailwind CSS
│   ├── js/
│   │   └── app.js               # Core DB Engine, AUTH, & Alpine Controllers (2.027 baris)
│   └── image/                   # Repositori Aset Gambar Resmi
│
└── docs/                        # DOKUMENTASI & DIAGRAM SISTEM
    ├── spesifikasi-sistem.md
    ├── analisa-perancangan-sistem.md
    └── diagrams/
        ├── preview-diagrams.html # Viewer interaktif + Zoom Engine
        ├── dfd-level-0.mmd
        ├── dfd-level-1.mmd
        ├── er-diagram.mmd
        ├── sequence-diagram.mmd
        ├── flowchart-sistem.mmd
        ├── component-diagram.mmd
        ├── usecase-diagram.mmd
        └── deployment-diagram.mmd
```

---

## 5. 🔗 Tautan Diagram & Viewer Interaktif

- 🌐 **Viewer Interaktif (Zoom In/Out & Pan Drag)**: [`docs/diagrams/preview-diagrams.html`](diagrams/preview-diagrams.html)
- 📑 **Dokumen Master Analisa & Diagram Lengkap**: [`docs/analisa-perancangan-sistem.md`](analisa-perancangan-sistem.md)
- 📄 **README Utama**: [`../README.md`](../README.md)
