# 🏛️ Website Profil Program Studi Hukum — Universitas Muhammadiyah Papua (UMP)

> Website profil Program Studi Hukum UMP ini merupakan prototipe **frontend-only**, tanpa backend/database server.
> `localStorage` menjadi penyimpanan utama per origin dan profil browser; IndexedDB hanya salinan tambahan best-effort.

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
- [Komponen Alpine.js](#-komponen-alpinejs)
- [Implementasi Login dan CRUD Tabel](#implementasi-login-dan-crud-tabel)
- [Diagram & Dokumentasi](#-diagram--dokumentasi)
- [Cara Menjalankan](#-cara-menjalankan)
- [Reset Data](#️-reset-data)
- [Catatan Pengembang](#-catatan-pengembang)

---

## ✨ Fitur Utama

- 🎨 **Desain Neumorphism** — tampilan modern dengan efek raised/inset shadows
- 🌙 **Dark Mode** — toggle otomatis, preferensi tersimpan di localStorage
- 📱 **Responsive** — mobile-first, mendukung semua ukuran layar
- 🔍 **Pencarian Global** — di header, mencari berbagai entitas konten
- 🗂️ **18 Modul Data** — dosen, kurikulum, alumni, berita, galeri, hingga pengaturan situs
- 🔐 **Panel Admin** — pengelolaan data lokal dengan guard sesi sisi klien
- 💾 **Persistensi Lokal** — localStorage (primer) + IndexedDB (salinan tambahan best-effort)
- 🔔 **Notifikasi** — sistem notifikasi internal untuk admin
- 📨 **Form Kontak** — pesan tersimpan ke store `pesan` (localStorage)
- 📝 **Pendaftaran Kegiatan** — registrasi publik tersimpan ke store `pendaftar`

---

## 🛠️ Teknologi

| Teknologi | Versi | Keterangan |
|-----------|-------|------------|
| **Alpine.js** | 3.14.8 | Reaktivitas UI & komponen halaman |
| **Tailwind CSS** | pre-built lokal | Utility-first CSS framework |
| **SweetAlert2** | v11 | Dialog konfirmasi & notifikasi interaktif |
| **Google Fonts** | CDN | Tipografi |
| **localStorage** | Native Browser | Penyimpanan data utama — hingga 18 entitas JSON |
| **IndexedDB** | Native Browser | Salinan asinkron best-effort; bukan sumber pemulihan data |

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
├── 📁 assets/docs/
│   ├── diagrams/
│   │   ├── *.mmd                   # 9 diagram Mermaid (source)
│   │   └── drawio/
│   │       ├── all-diagrams.drawio.xml     # Master — semua 9 diagram (multi-tab)
│   │       ├── component-diagram.drawio.xml
│   │       ├── activity-diagram.drawio.xml
│   │       ├── deployment-diagram.drawio.xml
│   │       ├── dfd-level-0.drawio.xml
│   │       ├── dfd-level-1.drawio.xml
│   │       ├── er-diagram.drawio.xml
│   │       ├── flowchart-sistem.drawio.xml
│   │       ├── sequence-diagram.drawio.xml
│   │       └── usecase-diagram.drawio.xml
│   ├── analisa-perancangan-sistem.md # Dokumen analisa
│   └── spesifikasi-sistem.md       # Spesifikasi teknis
│
├── mermaid.md                      # Ringkasan dan dokumentasi diagram
│
├── sitemap.xml                     # Sitemap HTML
├── package.json                    # Metadata proyek
└── README.md                       # File ini
```

---

## 🗄️ Arsitektur Data (SEED & SAMPLE)

### Konsep

```
SEED_*    →  Data default / awal (hardcoded dalam app.js)
SAMPLE_*  →  Data aktif (dimuat dari localStorage, fallback ke SEED_* jika key hilang atau JSON/bentuk data tidak valid)
```

Setiap entitas mengikuti pola yang konsisten:

```javascript
const SEED_DOSEN = [ /* data default */ ];
let SAMPLE_DOSEN = DB.load('dosen', SEED_DOSEN);
//                  ↑ Cek localStorage; pakai SEED jika key hilang atau data tidak valid
```

### Layer Penyimpanan (`DB` object)

| Method | Fungsi |
|--------|--------|
| `DB.load(key, fallback)` | Ambil dari localStorage; gunakan `fallback` jika key hilang, JSON rusak, atau bentuk data tidak sesuai |
| `DB.save(key, data)` | Simpan ke localStorage (utama); setelah berhasil, minta salinan IndexedDB (best-effort) |

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

Daftar berikut adalah isi awal `SEED_DOSEN` yang dipakai dashboard admin dan halaman publik ketika data dosen belum tersimpan di browser:

| ID | Kode | Nama Dosen |
|----|------|------------|
| 1 | HKM001 | Dr. Muhammad Yusuf, S.H., M.H |
| 2 | HKM002 | Dr. Hendrik Dengah, S.H., M.H |
| 3 | HKM003 | Dr. Tri Mulyadi, S.H., M.H |
| 4 | HKM004 | Ismail Maswatu, S.E., S.H., M.H |
| 5 | HKM005 | Irfun, M.Pd |
| 6 | HKM006 | Adimas Reza Prayudi M, S.H., M.H. |
| 7 | HKM007 | Mursani, S.H., M.H. |
| 8 | HKM008 | Rizki Wisudawan Katjong, S.H., M.H. |
| 9 | HKM009 | Rifqi Anan Pratama, S.H., M.H |
| 10 | HKM010 | Ratna Jaya, S.H., M.H |
| 11 | `-` | Midah Nurhidayah |

### Field `SEED_DOSEN`

```javascript
{
  id:   Number,
  nama: String, // Nama dosen
  kode: String  // 'HKM001'–'HKM010', atau '-' jika kode tidak tersedia
}
```

Dashboard admin dan halaman publik memakai data aktif yang sama, yaitu `SAMPLE_DOSEN`. Data ini dimuat dari key `prodihukum_db_v1_dosen` dan menggunakan `SEED_DOSEN` sebagai data awal.

---

## 📚 Data Kurikulum (57 MK / 154 SKS)

### Distribusi per Semester

| Semester | Jumlah MK | Total SKS |
|----------|-----------|-----------|
| 1 | 9 MK | 20 SKS |
| 2 | 8 MK | 20 SKS |
| 3 | 10 MK | 24 SKS |
| 4 | 10 MK | 24 SKS |
| 5 | 8 MK | 24 SKS |
| 6 | 9 MK | 24 SKS |
| 7 | 2 MK | 12 SKS |
| 8 | 1 MK | 6 SKS |
| **Total** | **57 MK** | **154 SKS** |

> Angka pada tabel dihitung dari `SEED_KURIKULUM` di [`assets/js/app.js`](assets/js/app.js). Sepuluh mata kuliah belum memiliki dosen pengampu (`kodeDosen: '-'`); properti `pengampu` memang tidak dicantumkan pada record tersebut.

### Field `SEED_KURIKULUM`

Struktur field kurikulum yang dipakai dashboard admin dan halaman publik:

```javascript
{
  id:        Number,
  kode:      String,   // Contoh: 'HKM1101'
  nama:      String,   // Nama mata kuliah
  sks:       Number,   // Jumlah SKS
  semester:  Number,   // 1 – 8
  pengampu:  String,   // Opsional; tidak ada jika dosen belum ditetapkan
  kodeDosen: String    // Kode dosen 'HKM001'–'HKM010', atau '-'
}
```

Deklarasi seed juga menyertakan metadata `sumber: 'MK Baru'`. Saat aplikasi memuat kurikulum, migrasi membuang properti `sumber` dan `catatan` dari data aktif. `DB.load()` memeriksa bentuk luar data (array), bukan memvalidasi setiap field pada setiap record; validasi field dilakukan saat form disimpan.

### Pencocokan Dosen

`coursesForLecturer()` mengutamakan pencocokan kode dan menggunakan nama sebagai fallback untuk record lama. Relasi ini adalah lookup aplikasi, bukan foreign key. Implementasi ringkasnya ada pada [bagian logika tabel](#implementasi-login-dan-crud-tabel).

### Import/Export Kurikulum

Admin Kurikulum menyediakan ekspor CSV sesuai pencarian dan filter yang aktif. Belum tersedia fitur impor kurikulum.

---

## 🔐 Sistem Admin

### Login

Akses panel admin: `admin/login.html`

Login memakai `SEED_PENGGUNA` sebagai data awal dan `SAMPLE_PENGGUNA` sebagai data akun aktif. Data aktif dimuat dari key `prodihukum_db_v1_pengguna`; akun yang telah dikelola admin dapat berbeda dari data seed. Tidak ada konstanta terpisah bernama `SEED_LOGIN`.

#### Field `SEED_PENGGUNA`

```javascript
{
  id:       Number,
  nama:     String, // Nama pengguna admin
  email:    String, // Email untuk login
  password: String, // Password demo; disimpan di browser pada prototipe ini
  role:     String, // 'Super Admin', 'Editor', atau 'Operator'
  status:   String  // 'Aktif' atau 'Nonaktif'
}
```

#### Akun bawaan `SEED_PENGGUNA`

| ID | Nama | Email | Password demo | Role | Status |
|----|------|-------|---------------|------|--------|
| 1 | Admin Prodi | `admin@ump.ac.id` | `admin` | Super Admin | Aktif |
| 2 | Rina Marlina | `editor.rina@ump.ac.id` | `editor123` | Editor | Aktif |
| 3 | Yusuf Kamal | `operator.yusuf@ump.ac.id` | `operator123` | Operator | Nonaktif |

> ⚠️ Kredensial demo berada di `SEED_PENGGUNA` dalam `app.js` dan disimpan di browser. Jangan gunakan akun atau data sensitif pada prototipe ini; autentikasi produksi memerlukan backend.

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
| `admin/profil-prodi.html` | *(inline Alpine)* | Semua admin |
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

## 🏔️ Komponen Alpine.js

### Fungsi publik utama

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

### Fungsi admin utama

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

### Implementasi Login dan CRUD Tabel

Cuplikan berikut merangkum implementasi yang dipakai aplikasi, bukan satu file JavaScript mandiri. Bagian ini disusun dari [`sourcecode-logika-tabel-bab4.md`](sourcecode-logika-tabel-bab4.md) dan diselaraskan dengan [`assets/js/app.js`](assets/js/app.js), [`admin/login.html`](admin/login.html), serta [`admin/kurikulum.html`](admin/kurikulum.html).

#### 1. Login, validasi akun, dan sesi

`AUTH.login()` memvalidasi data sesi, sedangkan form login mencocokkan email, status, dan kata sandi terhadap `SAMPLE_PENGGUNA`. Seluruh autentikasi ini berjalan di browser.

```javascript
const AUTH = (() => {
  const KEY = 'prodihukum_admin_session';

  function login(user) {
    const roles = ['Super Admin', 'Editor', 'Operator'];
    if (
      !user ||
      typeof user.nama !== 'string' || !user.nama.trim() ||
      typeof user.email !== 'string' || !user.email.trim() ||
      !roles.includes(user.role)
    ) {
      throw new Error('Data akun admin tidak lengkap atau perannya tidak dikenali.');
    }

    const session = {
      nama: user.nama,
      email: user.email,
      role: user.role,
      loginAt: new Date().toISOString()
    };
    localStorage.setItem(KEY, JSON.stringify(session));
    return session;
  }

  function current() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return { nama: '', email: '', role: '' };
      const session = JSON.parse(raw);
      if (!session || typeof session !== 'object' || Array.isArray(session)) {
        return { nama: '', email: '', role: '' };
      }
      return {
        nama: typeof session.nama === 'string' ? session.nama : '',
        email: typeof session.email === 'string' ? session.email : '',
        role: typeof session.role === 'string' ? session.role : ''
      };
    } catch (e) { /* noop */ }
    return { nama: '', email: '', role: '' };
  }

  function isLoggedIn() {
    const session = current();
    return Boolean(
      session.nama &&
      session.email &&
      ['Super Admin', 'Editor', 'Operator'].includes(session.role)
    );
  }

  function logout() {
    localStorage.removeItem(KEY);
  }

  const SUPER_ADMIN_ONLY_PAGES = ['pengguna.html', 'pengaturan.html'];
  function guard() {
    const path = window.location.pathname;
    const page = path.substring(path.lastIndexOf('/') + 1);
    const isLoginPage = page === 'login.html';
    if (!isLoginPage && !isLoggedIn()) {
      window.location.href = 'login.html';
      return;
    }
    if (isLoginPage) return;
    if (SUPER_ADMIN_ONLY_PAGES.includes(page) && current().role !== 'Super Admin') {
      if (typeof NeuAlert !== 'undefined') {
        NeuAlert.error('Halaman ini khusus untuk Super Admin.');
      }
      window.location.href = 'dashboard.html';
    }
  }

  return { login, current, isLoggedIn, logout, guard };
})();
```

Inti `submit()` pada halaman login:

```javascript
submit() {
  const email = (this.form.email || '').trim();
  const pass = (this.form.password || '').trim();
  if (!email || !pass) {
    NeuAlert.error('Mohon isi email terdaftar dan kata sandi.');
    return;
  }

  this.loading = true;
  setTimeout(() => {
    this.loading = false;
    const users = (typeof SAMPLE_PENGGUNA !== 'undefined') ? SAMPLE_PENGGUNA : [];
    const matched = users.find(p => p.email && p.email.toLowerCase() === email.toLowerCase());

    if (!matched) {
      NeuAlert.error('Email tidak terdaftar. Periksa kembali email Anda.');
      return;
    }
    if (matched.status !== 'Aktif') {
      NeuAlert.error('Akun ini nonaktif. Hubungi Super Admin untuk mengaktifkan kembali.');
      return;
    }
    if (matched.password !== pass) {
      NeuAlert.error('Password salah. Silakan coba lagi.');
      return;
    }

    try {
      AUTH.login(matched);
    } catch {
      NeuAlert.error('Akun tidak dapat masuk. Pastikan nama dan peran akun valid serta browser dapat menyimpan sesi login.');
      return;
    }

    let rememberEmailSaved = true;
    try {
      if (this.form.remember) {
        localStorage.setItem('prodihukum_remembered_email', email);
      } else {
        localStorage.removeItem('prodihukum_remembered_email');
      }
    } catch {
      rememberEmailSaved = false;
    }

    logActivity('Login ke panel admin', '\u{1F510}');
    NeuAlert.base({
      icon: 'success',
      title: 'Login Berhasil',
      text: rememberEmailSaved
        ? 'Selamat datang di Panel Manajemen Program Studi Hukum UMP.'
        : 'Login berhasil, tetapi email tidak dapat disimpan untuk fitur Ingat Saya.',
      timer: 1100,
      showConfirmButton: false
    }).then(() => {
      window.location.href = 'dashboard.html';
    });
  }, 650);
}
```

#### 2. Lookup Dosen dan Kurikulum

`kodeDosen` dicocokkan dengan `dosen.kode` setelah normalisasi. Nama pengampu menjadi fallback untuk record tanpa kode; bukan relasi foreign key.

```javascript
function normalizeLecturerCode(value) {
  const code = String(value || '').trim().toLocaleLowerCase('id-ID');
  return code && !['-', '—', 'tidak tercantum', 'n/a'].includes(code) ? code : '';
}

function coursesForLecturer(dosen) {
  const normalizeName = value =>
    String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const lecturerName = normalizeName(dosen.nama);
  const lecturerCode = normalizeLecturerCode(dosen.kode);
  if (!lecturerName && !lecturerCode) return [];

  return SAMPLE_KURIKULUM.filter(course => {
    const courseCode = normalizeLecturerCode(course.kodeDosen);
    if (lecturerCode && courseCode) return lecturerCode === courseCode;
    return Boolean(
      course.pengampu &&
      lecturerName &&
      normalizeName(course.pengampu) === lecturerName
    );
  });
}

function courseLecturerName(course) {
  const code = normalizeLecturerCode(course.kodeDosen);
  const lecturer = code &&
    SAMPLE_DOSEN.find(dosen => normalizeLecturerCode(dosen.kode) === code);
  return lecturer ? lecturer.nama : (course.pengampu || '');
}
```

#### 3. Mencegah edit menimpa data yang berubah

Form edit menyimpan snapshot record. Sebelum menyimpan, aplikasi memastikan record masih ada dan belum diubah pada tab lain.

```javascript
function hasCurrentRecord(rows, id, label, expectedSnapshot) {
  const current = rows.find(row => String(row.id) === String(id));
  if (!current) {
    NeuAlert.error(`${label} yang akan diperbarui tidak ditemukan. Muat ulang halaman lalu coba lagi.`);
    return false;
  }
  if (expectedSnapshot !== undefined && JSON.stringify(current) !== expectedSnapshot) {
    NeuAlert.error(`${label} telah diubah pada tab lain. Tutup formulir, muat ulang data, lalu coba lagi.`);
    return false;
  }
  return true;
}
```

#### 4. CRUD Dosen

Contoh berikut adalah metode inti di objek yang dikembalikan `adminDosenPage()`. Perubahan baru dianggap berhasil setelah `DB.save()` berhasil; jika gagal, state lokal dikembalikan.

```javascript
emptyForm() {
  return { id: null, nama: '', kode: '' };
},
openAdd() {
  this.editing = null;
  this.editingSnapshot = undefined;
  this.form = this.emptyForm();
  this.showModal = true;
},
openEdit(dosen) {
  this.editing = dosen.id;
  this.editingSnapshot = JSON.stringify(dosen);
  this.form = { ...dosen };
  this.showModal = true;
},
persist() {
  if (!DB.save('dosen', this.dosen)) return false;
  SAMPLE_DOSEN = this.dosen;
  return true;
},
save() {
  if (!String(this.form.nama || '').trim()) {
    NeuAlert.error('Nama dosen wajib diisi.');
    return;
  }
  this.form.nama = this.form.nama.trim();
  this.form.kode = String(this.form.kode || '').trim();

  if (this.editing !== null) {
    if (!hasCurrentRecord(this.dosen, this.editing, 'Data dosen', this.editingSnapshot)) return;
    const index = this.dosen.findIndex(dosen => dosen.id === this.editing);
    if (index < 0) {
      NeuAlert.error('Data dosen yang akan diperbarui tidak ditemukan. Muat ulang halaman lalu coba lagi.');
      return;
    }
    const previous = this.dosen[index];
    this.dosen[index] = { ...this.form };
    if (!this.persist()) {
      this.dosen[index] = previous;
      NeuAlert.storageFull();
      return;
    }
    logActivity(`Memperbarui data dosen: ${this.form.nama}`, '\u{270F}\u{FE0F}');
    NeuAlert.updated('Data dosen berhasil diperbarui.');
  } else {
    this.form.id = Date.now();
    this.dosen.unshift({ ...this.form });
    if (!this.persist()) {
      this.dosen.shift();
      NeuAlert.storageFull();
      return;
    }
    logActivity(`Menambahkan dosen baru: ${this.form.nama}`, '\u{2795}');
    NeuAlert.success('Data dosen berhasil disimpan.');
  }
  this.showModal = false;
  this.editing = null;
  this.editingSnapshot = undefined;
},
async remove(dosen) {
  const confirmed = await NeuAlert.confirmDelete('data dosen ini');
  if (!confirmed) return;
  const previous = this.dosen;
  this.dosen = this.dosen.filter(item => item.id !== dosen.id);
  if (!this.persist()) {
    this.dosen = previous;
    NeuAlert.storageFull();
    return;
  }
  logActivity(`Menghapus data dosen: ${dosen.nama}`, '\u{1F5D1}\u{FE0F}');
  NeuAlert.deleted('Data dosen berhasil dihapus.');
}
```

#### 5. Konfigurasi tabel Kurikulum

Halaman `admin/kurikulum.html` menggunakan `adminCrudTable(config)` dengan pencarian, filter semester, validasi, dan ekspor CSV.

```javascript
adminCrudTable({
  rows: SAMPLE_KURIKULUM,
  dbKey: 'kurikulum',
  emptyForm: {
    kode: '',
    nama: '',
    sks: 2,
    semester: 1,
    pengampu: '',
    kodeDosen: ''
  },
  searchKeys: ['kode', 'nama', 'pengampu', 'kodeDosen'],
  filter(row, semester) {
    return semester === 'all' || Number(row.semester) === Number(semester);
  },
  searchValue(row, key) {
    return key === 'pengampu' ? courseLecturerName(row) : row[key];
  },
  exportColumns: [
    ['Semester', 'semester'],
    ['Kode MK', 'kode'],
    ['Mata Kuliah', 'nama'],
    ['SKS', 'sks'],
    ['Dosen Pengampu', 'pengampu', row => courseLecturerName(row)],
    ['Kode Dosen', 'kodeDosen']
  ],
  exportFilename: 'kurikulum-prodi-hukum.csv',
  itemLabel: 'mata kuliah ini',
  validate(f) {
    const kode = String(f.kode || '').trim();
    const nama = String(f.nama || '').trim();
    const sks = Number(f.sks);
    const semester = Number(f.semester);

    if (!kode || !nama) {
      NeuAlert.error('Kode dan Nama Mata Kuliah wajib diisi.');
      return false;
    }
    if (!Number.isInteger(sks) || sks < 1 || sks > 6) {
      NeuAlert.error('SKS harus berupa bilangan bulat dari 1 sampai 6.');
      return false;
    }
    if (!Number.isInteger(semester) || semester < 1 || semester > 8) {
      NeuAlert.error('Semester harus berupa bilangan bulat dari 1 sampai 8.');
      return false;
    }

    f.kode = kode;
    f.nama = nama;
    f.sks = sks;
    f.semester = semester;
    f.pengampu = String(f.pengampu || '').trim();
    f.kodeDosen = String(f.kodeDosen || '').trim();
    return true;
  }
});
```

#### 6. Inti CRUD generik

`adminCrudTable(config)` memasok perilaku tabel bersama untuk modul yang memakai konfigurasi serupa.

```javascript
persist() {
  if (config.dbKey) {
    const saved = DB.save(config.dbKey, this.rows);
    if (!saved) return false;
    if (config.dbKey === 'alumni') SAMPLE_ALUMNI = this.rows;
    else if (config.dbKey === 'kurikulum') SAMPLE_KURIKULUM = this.rows;
    else if (config.dbKey === 'dokumen') SAMPLE_DOKUMEN = this.rows;
    else if (config.dbKey === 'kegiatan') SAMPLE_KEGIATAN = this.rows;
    else if (config.dbKey === 'pengguna') SAMPLE_PENGGUNA = this.rows;
    else if (config.dbKey === 'pengumuman') SAMPLE_PENGUMUMAN = this.rows;
    else if (config.dbKey === 'prestasi') SAMPLE_PRESTASI = this.rows;
    return true;
  }
  return true;
},
init() {
  window.addEventListener('db-update', event => {
    if (!event.detail) return;
    if (config.dbKey === 'kurikulum' && event.detail.key === 'dosen') {
      this.relatedDataRevision += 1;
      return;
    }
    if (event.detail.key !== config.dbKey || !Array.isArray(event.detail.data)) return;
    this.rows = [...event.detail.data];
  });
},
openAdd() {
  this.editing = null;
  this.editingSnapshot = undefined;
  this.form = { ...config.emptyForm };
  this.showModal = true;
},
openEdit(row) {
  this.editing = row.id;
  this.editingSnapshot = JSON.stringify(row);
  this.form = { ...row };
  this.showModal = true;
},
save() {
  if (config.validate && !config.validate(this.form)) return;
  const label = config.itemLabel ? config.itemLabel.replace(/ ini$/, '') : 'Data';
  if (this.editing !== null && this.editing !== undefined) {
    if (!hasCurrentRecord(this.rows, this.editing, label, this.editingSnapshot)) return;
    const idx = this.rows.findIndex(x => x.id === this.editing);
    const prev = this.rows[idx];
    this.rows[idx] = { ...this.form };
    if (!this.persist()) {
      this.rows[idx] = prev;
      NeuAlert.storageFull();
      return;
    }
    logActivity(`Memperbarui ${label}: ${this.form[config.labelKey || 'nama'] || ''}`.trim(), '\u{270F}\u{FE0F}');
    NeuAlert.updated();
  } else {
    this.form.id = Date.now();
    this.rows.unshift({ ...this.form });
    if (!this.persist()) {
      this.rows.shift();
      NeuAlert.storageFull();
      return;
    }
    logActivity(`Menambahkan ${label} baru: ${this.form[config.labelKey || 'nama'] || ''}`.trim(), '\u{2795}');
    NeuAlert.success();
  }
  this.showModal = false;
  this.editing = null;
  this.editingSnapshot = undefined;
},
async remove(row) {
  const ok = await NeuAlert.confirmDelete(config.itemLabel || 'data ini');
  if (ok) {
    const label = config.itemLabel ? config.itemLabel.replace(/ ini$/, '') : 'data';
    const prevList = this.rows;
    this.rows = this.rows.filter(x => x.id !== row.id);
    if (!this.persist()) {
      this.rows = prevList;
      NeuAlert.storageFull();
      return;
    }
    logActivity(`Menghapus ${label}: ${row[config.labelKey || 'nama'] || ''}`.trim(), '\u{1F5D1}\u{FE0F}');
    NeuAlert.deleted();
  }
}
```

#### 7. Penyimpanan dan sinkronisasi data tabel

`DB.save()` menulis sinkron ke localStorage terlebih dahulu. IndexedDB hanya menerima salinan setelah penulisan utama berhasil.

```javascript
function save(key, data) {
  let serialized;
  try {
    serialized = JSON.stringify(data);
  } catch (e) {
    console.warn('DB: gagal menyiapkan data "' + key + '" untuk disimpan.', e);
    return false;
  }
  if (typeof serialized !== 'string') {
    console.warn('DB: data "' + key + '" tidak dapat diserialisasi untuk disimpan.');
    return false;
  }

  try {
    localStorage.setItem(NS + key, serialized);
    mirrorToIndexedDB(key, data);
    window.dispatchEvent(new CustomEvent('db-update', {
      detail: { key, data }
    }));
    return true;
  } catch (e) {
    pruneStorage();
    try {
      localStorage.setItem(NS + key, serialized);
      mirrorToIndexedDB(key, data);
      window.dispatchEvent(new CustomEvent('db-update', {
        detail: { key, data }
      }));
      return true;
    } catch (e2) {
      console.warn('DB: localStorage penuh, gagal menyimpan "' + key + '".', e2);
      return false;
    }
  }
}
```

Jika penulisan tetap gagal setelah pemangkasan log internal, fungsi mengembalikan `false`; CRUD lalu mengembalikan perubahan di memori. Perubahan key pada tab lain memicu `storage` event dan disalurkan ke komponen melalui `db-update`.

#### 8. Model JavaScript dan normalisasi seed

Contoh record berikut memakai field yang ada pada seed saat ini:

```javascript
const contohDosen = {
  id: 3,
  nama: 'Dr. Tri Mulyadi, S.H., M.H',
  kode: 'HKM003'
};

const contohKurikulum = {
  id: 1,
  kode: 'UMP1002',
  nama: 'AI Islam dan Kemuhammadiyahan 1',
  sks: 2,
  semester: 1,
  pengampu: 'Dr. Tri Mulyadi, S.H., M.H',
  kodeDosen: 'HKM003',
  sumber: 'MK Baru'
};

let SAMPLE_DOSEN = DB.load('dosen', SEED_DOSEN);
let SAMPLE_KURIKULUM = DB.load('kurikulum', SEED_KURIKULUM);
```

Seed kurikulum awal membawa metadata `sumber`; aplikasi membuang metadata impor lama sebelum data aktif dipakai:

```javascript
if (Array.isArray(SAMPLE_KURIKULUM) &&
    SAMPLE_KURIKULUM.some(course => course && ('sumber' in course || 'catatan' in course))) {
  const curriculumWithoutMetadata = SAMPLE_KURIKULUM.map(course => {
    if (!course || typeof course !== 'object') return course;
    const cleanCourse = { ...course };
    delete cleanCourse.sumber;
    delete cleanCourse.catatan;
    return cleanCourse;
  });
  if (DB.save('kurikulum', curriculumWithoutMetadata)) {
    SAMPLE_KURIKULUM = curriculumWithoutMetadata;
  } else {
    console.error('DB: gagal menghapus metadata sumber dan keterangan dari kurikulum tersimpan.');
  }
}
```

`DB.load()` menggunakan seed jika key belum ada, JSON rusak, atau bentuk luar data tidak sesuai. Field `pengampu` dapat tidak ada pada 10 record seed tanpa dosen; validasi field dilakukan saat CRUD disimpan.

---

## 📐 Diagram & Dokumentasi

Semua diagram tersedia dalam 2 format: **Mermaid** (`.mmd`) dan **Draw.io** (`.drawio.xml`).

| Diagram | Mermaid | Draw.io | Keterangan |
|---------|---------|---------|------------|
| ER Diagram | [`er-diagram.mmd`](assets/docs/diagrams/er-diagram.mmd) | [`er-diagram.drawio.xml`](assets/docs/diagrams/drawio/er-diagram.drawio.xml) | 18 key data; asosiasi adalah lookup aplikasi |
| DFD Level 0 | [`dfd-level-0.mmd`](assets/docs/diagrams/dfd-level-0.mmd) | [`dfd-level-0.drawio.xml`](assets/docs/diagrams/drawio/dfd-level-0.drawio.xml) | Aliran data sistem keseluruhan |
| DFD Level 1 | [`dfd-level-1.mmd`](assets/docs/diagrams/dfd-level-1.mmd) | [`dfd-level-1.drawio.xml`](assets/docs/diagrams/drawio/dfd-level-1.drawio.xml) | 8 proses, 4 kelompok penyimpanan |
| Activity Diagram | [`activity-diagram.mmd`](assets/docs/diagrams/activity-diagram.mmd) | [`activity-diagram.drawio.xml`](assets/docs/diagrams/drawio/activity-diagram.drawio.xml) | Aktivitas pengunjung, admin, dan penyimpanan |
| Flowchart Sistem | [`flowchart-sistem.mmd`](assets/docs/diagrams/flowchart-sistem.mmd) | [`flowchart-sistem.drawio.xml`](assets/docs/diagrams/drawio/flowchart-sistem.drawio.xml) | Alur logika aplikasi |
| Sequence Diagram | [`sequence-diagram.mmd`](assets/docs/diagrams/sequence-diagram.mmd) | [`sequence-diagram.drawio.xml`](assets/docs/diagrams/drawio/sequence-diagram.drawio.xml) | 4 skenario interaksi |
| Component Diagram | [`component-diagram.mmd`](assets/docs/diagrams/component-diagram.mmd) | [`component-diagram.drawio.xml`](assets/docs/diagrams/drawio/component-diagram.drawio.xml) | Komponen teknis |
| Usecase Diagram | [`usecase-diagram.mmd`](assets/docs/diagrams/usecase-diagram.mmd) | [`usecase-diagram.drawio.xml`](assets/docs/diagrams/drawio/usecase-diagram.drawio.xml) | Aktor & use case |
| Deployment Diagram | [`deployment-diagram.mmd`](assets/docs/diagrams/deployment-diagram.mmd) | [`deployment-diagram.drawio.xml`](assets/docs/diagrams/drawio/deployment-diagram.drawio.xml) | Arsitektur deployment |

> File master multi-tab: [`all-diagrams.drawio.xml`](assets/docs/diagrams/drawio/all-diagrams.drawio.xml) (semua 9 diagram dalam satu file). Mermaid di `assets/docs/diagrams/*.mmd` adalah sumber yang dipelihara; ekspor Draw.io harus diperbarui setiap kali diagram sumber berubah.

### Skenario Sequence Diagram (4 skenario)

| Skenario | Alur |
|----------|------|
| 1 | Admin login → verifikasi akun lokal → sesi pada localStorage |
| 2 | Admin CRUD → DB.save ke localStorage → update UI dan sinkronisasi tab |
| 3 | Publik mendaftar kegiatan → cek duplikasi email per kegiatan → simpan pendaftar |
| 4 | Publik mengirim formulir kontak → DB.save('pesan') → konfirmasi |

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
// Reset hanya data aplikasi (tema, sesi, dan preferensi browser tidak ikut terhapus)
Object.keys(localStorage)
  .filter(key => key.startsWith('prodihukum_db_v1_'))
  .forEach(key => localStorage.removeItem(key));
location.reload();

// Reset satu entitas saja
localStorage.removeItem('prodihukum_db_v1_kurikulum');
location.reload();
```

### Via DevTools

`F12` → **Application** → **Local Storage** → klik kanan → **Clear All**. Tindakan ini menghapus semua data pada origin tersebut, bukan hanya data aplikasi.

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

### Penyimpanan Lokal dan Salinan IndexedDB

Setiap `DB.save()` melakukan:
1. **Sync**: `localStorage.setItem(key, JSON.stringify(data))` sebagai penyimpanan utama.
2. **Jika berhasil**: minta salinan IndexedDB secara asinkron (best-effort), lalu pancarkan `db-update` pada tab aktif.
3. **Jika gagal**: pangkas log aktivitas/pageview yang dibatasi dan coba sekali lagi; jika tetap gagal, tidak ada salinan IndexedDB yang diminta dan CRUD memulihkan state di memori.
4. **Antartab**: browser mengirim `storage` event saat key localStorage berubah.

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
Sacode 2026 — Latihan Perancangan & Pengembangan Website Profil

Hak cipta website: **© 2026–sekarang**. Tahun pada footer website mengikuti tahun browser; README adalah dokumen statis.

---

*Terakhir diperbarui: 23 November 2026*
