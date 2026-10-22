# 🏛️ Website Profil Program Studi Hukum — Universitas Muhammadiyah Papua (UMP)

> Website resmi Program Studi Hukum UMP berbasis teknologi **frontend-only** (tanpa server/database backend).  
> Semua data dikelola melalui **localStorage** dan **IndexedDB** langsung di browser pengguna.

---

## 📋 Daftar Isi

- [Fitur Utama](#-fitur-utama)
- [Teknologi](#-teknologi)
- [Struktur Proyek](#-struktur-proyek)
- [Arsitektur Data (SEED & SAMPLE)](#-arsitektur-data-seed--sample)
- [18 Modul Data](#-18-modul-data)
- [Data Dosen](#-data-dosen-11-orang)
- [Data Kurikulum](#-data-kurikulum-57-mk--154-sks)
- [Sistem Admin](#-sistem-admin)
- [Alpine.js Functions](#-alpinejs-functions-28-fungsi)
- [Diagram & Dokumentasi](#-diagram--dokumentasi)
- [Cara Menjalankan](#-cara-menjalankan)
- [Reset Data](#️-reset-data)
- [Catatan Pengembang](#-catatan-pengembang)

---

## ✨ Fitur Utama

- 🎨 **Desain Neumorphism** — tampilan modern dengan efek raised/inset shadows
- 🌙 **Dark Mode** — toggle otomatis, preferensi tersimpan di localStorage
- 📱 **Responsive** — mobile-first, mendukung semua ukuran layar
- 🔍 **Pencarian Global** — di header, mencari berita/artikel/kegiatan
- 🗂️ **18 Modul Data** — dosen, kurikulum, alumni, berita, galeri, hingga pengaturan situs
- 🔐 **Panel Admin** — CRUD penuh untuk semua entitas data dengan guard autentikasi
- 💾 **Persistensi Lokal** — localStorage (primer) + IndexedDB (async write-through)
- 🔔 **Notifikasi** — sistem notifikasi internal untuk admin
- 📨 **Form Kontak** — pesan tersimpan ke store `pesan` (localStorage)
- 📝 **Pendaftaran Kegiatan** — registrasi publik tersimpan ke store `pendaftar`

---

## 🛠️ Teknologi

| Teknologi | Versi | Keterangan |
|-----------|-------|------------|
| **Alpine.js** | 3.14.8 | Reaktivitas UI & komponen halaman (28 fungsi) |
| **Tailwind CSS** | pre-built CDN | Utility-first CSS framework |
| **SweetAlert2** | v11 | Dialog konfirmasi & notifikasi interaktif |
| **Google Fonts** | CDN | Tipografi |
| **localStorage** | Native Browser | Penyimpanan data utama — 18 JSON key |
| **IndexedDB** | Native Browser | Async write-through (best-effort duplicate) |

> **Catatan:** Tidak ada npm, build tool, atau framework backend. Semua berjalan langsung di browser tanpa instalasi.

---

## 📁 Struktur Proyek

```
Perancangan-Dan-Pengembangan-website-profil-UMP-/
│
├── 📄 Halaman Publik Utama (13 halaman)
│   ├── index.html                  # Beranda — slider hero, statistik, berita terbaru
│   ├── profil.html                 # Profil Program Studi & visi-misi
│   ├── dosen.html                  # Direktori Dosen (11 dosen)
│   ├── kurikulum.html              # Kurikulum per semester (57 MK / 154 SKS)
│   ├── berita.html                 # Daftar Berita
│   ├── artikel.html                # Daftar Artikel Akademik
│   ├── kegiatan.html               # Daftar Kegiatan & Event
│   ├── pengumuman.html             # Daftar Pengumuman Resmi
│   ├── alumni.html                 # Direktori Alumni
│   ├── prestasi.html               # Prestasi Mahasiswa & Prodi
│   ├── galeri.html                 # Galeri Foto
│   ├── dokumen.html                # Dokumen Unduhan
│   └── kontak.html                 # Halaman Kontak (form → pesan store)
│
├── 📄 Halaman Detail (5 halaman)
│   ├── detail-berita.html          # Detail satu berita
│   ├── detail-artikel.html         # Detail satu artikel
│   ├── detail-kegiatan.html        # Detail satu kegiatan
│   ├── detail-pengumuman.html      # Detail satu pengumuman
│   └── detail-galeri.html          # Detail satu item galeri
│
├── 📁 admin/ (18 halaman)
│   ├── login.html                  # Login admin (kredensial statis)
│   ├── lupa-sandi.html             # Halaman lupa sandi
│   ├── dashboard.html              # Dashboard ringkasan statistik
│   ├── dosen.html                  # CRUD data dosen (form khusus)
│   ├── kurikulum.html              # CRUD kurikulum
│   ├── berita.html                 # CRUD berita
│   ├── artikel.html                # CRUD artikel
│   ├── kegiatan.html               # CRUD kegiatan
│   ├── pengumuman.html             # CRUD pengumuman
│   ├── alumni.html                 # CRUD data alumni
│   ├── prestasi.html               # CRUD prestasi
│   ├── galeri.html                 # Upload & kelola galeri
│   ├── dokumen.html                # Kelola dokumen PDF
│   ├── pengguna.html               # Kelola akun admin (Super Admin only)
│   ├── pengaturan.html             # Pengaturan situs lengkap (Super Admin only)
│   ├── profil-prodi.html           # Edit profil program studi
│   ├── aktivitas.html              # Log aktivitas admin (read-only)
│   └── activity.html               # Alias aktivitas
│
├── 📁 assets/
│   ├── js/
│   │   └── app.js                  # ⭐ Core — SEED data, DB layer, 28 Alpine components
│   ├── css/
│   │   └── style.css               # Custom CSS (neumorphism, dark mode, utilitas)
│   └── image/
│       └── logo-ump.png            # Logo UMP
│
├── 📁 docs/
│   ├── diagrams/
│   │   ├── *.mmd                   # 8 diagram Mermaid (source)
│   │   └── drawio/
│   │       ├── all-diagrams.drawio.xml     # Master — semua 8 diagram (multi-tab)
│   │       ├── component-diagram.drawio.xml
│   │       ├── deployment-diagram.drawio.xml
│   │       ├── dfd-level-0.drawio.xml
│   │       ├── dfd-level-1.drawio.xml
│   │       ├── er-diagram.drawio.xml
│   │       ├── flowchart-sistem.drawio.xml
│   │       ├── sequence-diagram.drawio.xml
│   │       └── usecase-diagram.drawio.xml
│   ├── mermaid.md                  # Semua diagram Mermaid inline
│   ├── analisa-perancangan.md      # Dokumen analisa
│   └── spesifikasi-sistem.md       # Spesifikasi teknis
│
├── mermaid.md                      # Ringkasan diagram (root)
├── sitemap.xml                     # Sitemap HTML
├── package.json                    # Metadata proyek
└── README.md                       # File ini
```

---

## 🗄️ Arsitektur Data (SEED & SAMPLE)

### Konsep

```
SEED_*    →  Data default / awal (hardcoded dalam app.js)
SAMPLE_*  →  Data aktif (dimuat dari localStorage, fallback ke SEED_* jika kosong)
```

Setiap entitas mengikuti pola yang konsisten:

```javascript
const SEED_DOSEN = [ /* data default */ ];
let SAMPLE_DOSEN = DB.load('dosen', SEED_DOSEN);
//                  ↑ Cek localStorage dulu, pakai SEED jika kosong
```

### Layer Penyimpanan (`DB` object)

| Method | Fungsi |
|--------|--------|
| `DB.load(key, fallback)` | Ambil dari localStorage; gunakan `fallback` jika kosong atau bentuk data tidak sesuai |
| `DB.save(key, data)` | Simpan ke localStorage (sync) + IndexedDB (async write-through) |

### Kunci localStorage (prefix: `prodihukum_db_v1_`)

Format key lengkap: `prodihukum_db_v1_<entity>`, contoh: `prodihukum_db_v1_dosen`

Semua halaman Admin dan publik membaca key yang sama selama dibuka pada origin dan profil browser yang sama. Perubahan antartab pada origin tersebut diperbarui melalui event browser. localStorage/IndexedDB tidak membagikan data ke perangkat atau profil browser lain; gunakan backup/restore untuk memindahkan data secara manual, atau pasang backend bersama untuk sinkronisasi lintas perangkat.

### Sesi Admin

Sesi admin disimpan di: `prodihukum_admin_session` (localStorage)

---

## 📊 18 Modul Data

| No | SEED Constant | localStorage Key | Keterangan |
|----|---------------|-----------------|------------|
| 1 | `SEED_AKTIVITAS` | `aktivitas` | Log aktivitas admin |
| 2 | `SEED_ALUMNI` | `alumni` | Data alumni |
| 3 | `SEED_ARTIKEL` | `artikel` | Artikel akademik |
| 4 | `SEED_BERITA` | `berita` | Berita program studi |
| 5 | `SEED_DOKUMEN` | `dokumen` | Dokumen unduhan |
| 6 | `SEED_DOSEN` | `dosen` | Data dosen tetap (11 dosen) |
| 7 | `SEED_GALERI` | `galeri` | Galeri foto |
| 8 | `SEED_KEGIATAN` | `kegiatan` | Kegiatan & event |
| 9 | `SEED_KURIKULUM` | `kurikulum` | Mata kuliah (57 MK / 154 SKS) |
| 10 | `SEED_NOTIFIKASI` | `notifikasi` | Notifikasi sistem |
| 11 | `SEED_PENDAFTAR` | `pendaftar` | Data pendaftar kegiatan (publik) |
| 12 | `SEED_PENGATURAN` | `pengaturan` | Pengaturan situs lengkap |
| 13 | `SEED_PENGGUNA` | `pengguna` | Akun admin |
| 14 | `SEED_PENGUMUMAN` | `pengumuman` | Pengumuman resmi |
| 15 | `SEED_PESAN` | `pesan` | Pesan kontak masuk (publik) |
| 16 | `SEED_PRESTASI` | `prestasi` | Prestasi mahasiswa & prodi |
| 17 | `SEED_PROFIL` | `profil` | Profil program studi |
| 18 | `SEED_STRUKTUR` | `struktur` | Struktur organisasi |

---

## 👨‍🏫 Data Dosen (11 Orang)

| Kode | Nama Dosen |
|------|-----------|
| HKM001 | Sitti Rahmawati Talango, S.H., M.H. |
| HKM002 | Muhamad Yamin, S.H., M.H. |
| HKM003 | Ernestin Manganang, S.H., M.H. |
| HKM004 | Hendra, S.H., M.H. |
| HKM005 | Muh. Rizal Rustam, S.H., M.H. |
| HKM006 | Erisnawati, S.H., M.H. |
| HKM007 | Dg. Fajar Wahyu Sejati, S.H., M.H. |
| HKM008 | Ahmad Mustanir, S.H., M.H. |
| HKM009 | Sugimanto, S.H., M.Kn. |
| HKM010 | Ridwan, S.H., M.H. |
| *(tanpa kode)* | Yohanis Tamatjita, S.H., M.H. |

**Field `SEED_DOSEN`:** `id, kode, nama, jabatan, pendidikan, spesialisasi, foto, email, telepon`

---

## 📚 Data Kurikulum (57 MK / 154 SKS)

### Distribusi per Semester

| Semester | Jumlah MK | Total SKS |
|----------|-----------|-----------|
| 1 | 9 MK | ~20 SKS |
| 2 | 8 MK | ~20 SKS |
| 3 | 10 MK | ~22 SKS |
| 4 | 10 MK | ~22 SKS |
| 5 | 8 MK | ~20 SKS |
| 6 | 9 MK | ~20 SKS |
| 7 | 2 MK | ~6 SKS |
| 8 | 1 MK | ~4 SKS |
| **Total** | **57 MK** | **154 SKS** |

> **Catatan:** 10 mata kuliah memiliki `pengampu: '-'` dan `kodeDosen: '-'` secara sengaja (data belum tersedia).

### Field `SEED_KURIKULUM`

```javascript
{
  id:        Number,
  kode:      String,   // Contoh: 'HKM1101'
  nama:      String,   // Nama mata kuliah
  sks:       Number,   // Jumlah SKS
  semester:  Number,   // 1 – 8
  kategori:  String,   // 'Wajib' | 'Pilihan'
  deskripsi: String,
  pengampu:  String,   // Nama dosen (string), '-' jika belum ada
  kodeDosen: String    // Kode dosen 'HKM001'–'HKM010', atau '-'
}
```

### Pencocokan Dosen

Fungsi `coursesForLecturer()` mencocokkan `dosen.kode` dengan `kurikulum.kodeDosen` terlebih dahulu. Nama dosen menjadi fallback untuk data mata kuliah lama yang belum memiliki kode. Tampilan pengampu kurikulum mengikuti nama dosen terkini jika kodenya terhubung ke roster, sehingga perubahan nama dosen tidak memutus hubungan.

### Import/Export Kurikulum

Tombol Import/Export di `admin/kurikulum.html` adalah **simulasi** — menampilkan pesan informasi, tidak ada transfer file nyata.

---

## 🔐 Sistem Admin

### Login

Akses panel admin: `admin/login.html`

| Field | Nilai Default |
|-------|--------------|
| Username | `admin` |
| Password | `admin123` |

> ⚠️ Kredensial disimpan di `SEED_PENGGUNA` dalam `app.js`. **Ubah sebelum deploy ke publik.**

### Guard Autentikasi

- Semua halaman admin dicek via `AUTH.guard()` saat load
- Session tersimpan di `prodihukum_admin_session` (localStorage)
- Halaman `pengguna.html` dan `pengaturan.html` memerlukan role **Super Admin**

### Halaman Admin & Alpine Component

| Halaman | Alpine Component | Akses |
|---------|-----------------|-------|
| `admin/dashboard.html` | `adminShell()` | Semua admin |
| `admin/dosen.html` | `adminDosenPage()` | Semua admin |
| `admin/kurikulum.html` | `adminCrudTable()` | Semua admin |
| `admin/berita.html` | `adminCrudTable()` | Semua admin |
| `admin/artikel.html` | `adminCrudTable()` | Semua admin |
| `admin/kegiatan.html` | `kegiatanAdminPage()` | Semua admin |
| `admin/pengumuman.html` | `adminCrudTable()` | Semua admin |
| `admin/alumni.html` | `adminCrudTable()` | Semua admin |
| `admin/prestasi.html` | `adminCrudTable()` | Semua admin |
| `admin/galeri.html` | `adminGaleriPage()` | Semua admin |
| `admin/dokumen.html` | `adminDokumenTable()` | Semua admin |
| `admin/aktivitas.html` | `adminAktivitasPage()` | Semua admin |
| `admin/profil-prodi.html` | `adminCrudTable()` | Semua admin |
| `admin/pengguna.html` | `adminPenggunaTable()` | **Super Admin** |
| `admin/pengaturan.html` | *(inline Alpine)* | **Super Admin** |
| `admin/login.html` | *(form login)* | Publik |
| `admin/lupa-sandi.html` | *(form)* | Publik |

### Pengaturan Situs (`SEED_PENGATURAN`)

| Kategori | Field |
|----------|-------|
| Identitas | `namaWebsite`, `deskripsi`, `logo`, `favicon` |
| SEO | `metaTitle`, `metaDesc`, `keywords` |
| Sosial Media | `facebook`, `instagram`, `youtube`, `linkedin`, `tiktok` |
| Kontak | `email`, `telepon`, `alamat` |
| Peta | `mapEmbed`, `mapLink`, `koordinat` |
| Statistik | `mahasiswaAktif` |

---

## 🏔️ Alpine.js Functions (28 Fungsi)

### Halaman Publik (20 fungsi)

| Fungsi | File | Keterangan |
|--------|------|------------|
| `siteHeader()` | Semua halaman | Header: dark mode, search global |
| `homePage()` | `index.html` | Beranda: slider hero, statistik, berita terbaru |
| `homeStats()` | `index.html` | Statistik: mahasiswa aktif, dosen, alumni, MK |
| `dosenPage()` | `dosen.html` | Direktori & filter dosen |
| `kurikulumPage()` | `kurikulum.html` | Tampilan kurikulum per semester |
| `profilPage()` | `profil.html` | Profil prodi & struktur organisasi |
| `beritaPage()` | `berita.html` | List & filter berita |
| `artikelPage()` | `artikel.html` | List artikel akademik |
| `kegiatanPage()` | `kegiatan.html` | List kegiatan & pendaftaran event |
| `pengumumanPage()` | `pengumuman.html` | List pengumuman resmi |
| `alumniPage()` | `alumni.html` | Direktori alumni |
| `prestasiPage()` | `prestasi.html` | List prestasi |
| `galeriPage()` | `galeri.html` | Grid galeri foto |
| `dokumenPage()` | `dokumen.html` | List dokumen unduhan |
| `contactForm()` | `kontak.html` | Form kontak → DB.save('pesan') |
| `detailBeritaPage()` | `detail-berita.html` | Detail satu berita |
| `detailArtikelPage()` | `detail-artikel.html` | Detail satu artikel |
| `detailKegiatanPage()` | `detail-kegiatan.html` | Detail satu kegiatan |
| `detailPengumumanPage()` | `detail-pengumuman.html` | Detail satu pengumuman |
| `detailGaleriPage()` | `detail-galeri.html` | Detail satu item galeri |

### Admin (8 fungsi)

| Fungsi | Keterangan |
|--------|-----------|
| `adminShell()` | Shell admin: sidebar, auth guard, notifikasi |
| `adminDosenPage()` | CRUD dosen dengan form field khusus |
| `adminGaleriPage()` | Upload & kelola galeri foto |
| `adminDokumenTable()` | Kelola dokumen PDF/file |
| `adminPenggunaTable()` | Kelola akun admin (Super Admin only) |
| `adminCrudTable()` | CRUD generik (berita, artikel, alumni, dll) |
| `kegiatanAdminPage()` | CRUD kegiatan + lihat pendaftar |
| `adminAktivitasPage()` | Log aktivitas admin (read-only) |

### Cara Kerja `adminCrudTable()` (Generic CRUD)

Dikonfigurasi via atribut HTML data:

```html
<div x-data="adminCrudTable()"
     data-db-key="berita"
     data-columns='["judul","tanggal","kategori"]'>
```

---

## 📐 Diagram & Dokumentasi

Semua diagram tersedia dalam 2 format: **Mermaid** (`.mmd`) dan **Draw.io** (`.drawio.xml`).

| Diagram | Mermaid | Draw.io | Keterangan |
|---------|---------|---------|------------|
| ER Diagram | `er-diagram.mmd` | `er-diagram.drawio.xml` | 18 entitas, relasi lengkap |
| DFD Level 0 | `dfd-level-0.mmd` | `dfd-level-0.drawio.xml` | Aliran data sistem keseluruhan |
| DFD Level 1 | `dfd-level-1.mmd` | `dfd-level-1.drawio.xml` | Aliran data detail |
| Flowchart Sistem | `flowchart-sistem.mmd` | `flowchart-sistem.drawio.xml` | Alur logika aplikasi |
| Sequence Diagram | `sequence-diagram.mmd` | `sequence-diagram.drawio.xml` | 4 skenario interaksi |
| Component Diagram | `component-diagram.mmd` | `component-diagram.drawio.xml` | Komponen teknis |
| Usecase Diagram | `usecase-diagram.mmd` | `usecase-diagram.drawio.xml` | Aktor & use case |
| Deployment Diagram | `deployment-diagram.mmd` | `deployment-diagram.drawio.xml` | Arsitektur deployment |

> File master multi-tab: `docs/diagrams/drawio/all-diagrams.drawio.xml` (semua 8 diagram dalam satu file)

### Skenario Sequence Diagram (4 skenario)

| Skenario | Alur |
|----------|------|
| 1 | Admin login → AUTH.check → session → dashboard |
| 2 | Admin CRUD + penyimpanan localStorage + IDB |
| 3 | Cross-tab update via storage event |
| 4 | Publik kirim form kontak → DB.save('pesan') → SweetAlert |

---

## 🚀 Cara Menjalankan

### Metode 1: Live Server (VS Code) ⭐ Direkomendasikan

1. Install ekstensi **Live Server** di VS Code
2. Klik kanan `index.html` → **Open with Live Server**
3. Browser otomatis buka di `http://127.0.0.1:5500`

### Metode 2: Python HTTP Server

```bash
cd "Perancangan-Dan-Pengembangan-website-profil-UMP-"
python -m http.server 8080
# Buka: http://localhost:8080
```

### Metode 3: Node.js `serve`

```bash
npx serve .
# Buka: http://localhost:3000
```

> ⚠️ **Jangan buka langsung via `file://`** — path relatif CSS/JS dan beberapa API browser tidak bekerja tanpa HTTP server.

---

## ♻️ Reset Data

Ketika `app.js` diperbarui (data SEED berubah), localStorage di browser **tidak otomatis ter-update**. Lakukan reset manual:

### Via Console Browser (F12)

```javascript
// Reset semua 18 entitas sekaligus
localStorage.clear();
location.reload();

// Reset satu entitas saja
localStorage.removeItem('prodihukum_db_v1_kurikulum');
location.reload();
```

### Via DevTools

`F12` → **Application** → **Local Storage** → klik kanan → **Clear All**

---

## 📝 Catatan Pengembang

### Konsistensi Field Kode Dosen

| Konteks | Nama Field |
|---------|-----------|
| `SEED_DOSEN` | `kode` (contoh: `"HKM001"`) |
| `SEED_KURIKULUM` | `kodeDosen` (contoh: `"HKM001"` atau `"-"`) |
| `SEED_STRUKTUR` | `dosenId` (merujuk ke `SEED_DOSEN.id`) |
| Form `admin/dosen.html` | `kode` ✅ |
| Form `admin/kurikulum.html` | `kodeDosen` ✅ |

### LEGACY_SEED (Bukan Dead Code)

`LEGACY_SEED_DOSEN` dan `LEGACY_SEED_KURIKULUM` digunakan untuk **deteksi migrasi data format lama**.  
Jika localStorage masih berisi data format lama, sistem mereset otomatis ke SEED terbaru.  
**Jangan hapus** — biarkan tetap ada di `app.js`.

### Penyimpanan Write-Through

Setiap `DB.save()` melakukan:
1. **Sync**: `localStorage.setItem(key, JSON.stringify(data))`
2. **Async**: IndexedDB async write-through (best-effort duplicate, tidak memblokir UI)
3. **Event**: Dispatch `db-update` di tab aktif + `storage` event ke tab lain

### Logging Aktivitas Publik

- Pendaftaran kegiatan → `logPublicEvent()` → dicatat di store `aktivitas`
- Aktivitas admin (CRUD) → `logActivity()` → dicatat di store `aktivitas`

### Asosiasi Antar Entitas (Logical Lookup)

Tidak ada foreign key nyata. Semua relasi adalah **logical lookup** di JavaScript:

| Relasi | Cara |
|--------|------|
| `pendaftar` ↔ `kegiatan` | `pendaftar.kegiatanId === kegiatan.id` |
| `struktur` ↔ `dosen` | `struktur.dosenId === dosen.id` (opsional) |
| `kurikulum` ↔ `dosen` | `kurikulum.kodeDosen === dosen.kode`; fallback ke nama pengampu untuk record tanpa kode |

---

## 👥 Tim Pengembang

**Program Studi Hukum — Universitas Muhammadiyah Papua (UMP)**  
Sacode 2025 — Latihan Perancangan & Pengembangan Website Profil

---

*Terakhir diperbarui: Oktober 2026*
