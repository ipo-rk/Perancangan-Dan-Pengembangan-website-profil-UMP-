# 🏛️ ANALISA PERANCANGAN SISTEM & KUMPULAN DIAGRAM MERMAID (FINAL)

## Website Profil & Panel Admin Program Studi Hukum — Universitas Muhammadiyah Papua (UMP)

> Dokumen ini adalah **kumpulan lengkap diagram rekayasa perangkat lunak dalam format Mermaid** dan analisis perancangan sistem untuk Website Profil dan Panel Administrasi Program Studi Hukum Universitas Muhammadiyah Papua. Seluruh kode Mermaid di bawah ini diverifikasi konsisten dan akurat terhadap basis kode frontend (`assets/js/app.js`, `assets/css/style.css`, 36 berkas HTML) berdasarkan audit Oktober 2026.

---

## 📑 DAFTAR ISI DIAGRAM

1. [1. Data Flow Diagram (DFD) Level 0 — Diagram Konteks](#1-data-flow-diagram-dfd-level-0--diagram-konteks)
2. [2. Data Flow Diagram (DFD) Level 1 — Dekomposisi Proses Utama](#2-data-flow-diagram-dfd-level-1--dekomposisi-proses-utama)
3. [3. Flowchart Sistem — Logika Navigasi Publik & Panel Admin](#3-flowchart-sistem--logika-navigasi-publik--panel-admin)
4. [4. Entity Relationship Diagram (ERD) — 18 Entitas Data](#4-entity-relationship-diagram-erd--18-entitas-data)
5. [5. Component Diagram — Arsitektur 4-Layer Client-Side](#5-component-diagram--arsitektur-4-layer-client-side)
6. [6. Sequence Diagram — 4 Skenario Krusial Transaksi Data](#6-sequence-diagram--4-skenario-krusial-transaksi-data)
7. [7. Use Case Diagram — Aktor & Use Cases](#7-use-case-diagram--aktor--use-cases)
8. [8. Deployment Diagram — Topologi Fisik & Runtime CDN](#8-deployment-diagram--topologi-fisik--runtime-cdn)
9. [9. Activity Diagram — Interaksi Publik, Admin, dan Persistensi](#9-activity-diagram--interaksi-publik-admin-dan-persistensi)
10. [10. Panduan Penggunaan Berkas Draw.io XML](#10-panduan-penggunaan-berkas-drawio-xml)

---

## Catatan Audit (Oktober 2026)

| Aspek | Nilai Terverifikasi |
|-------|-------------------|
| Total SEED entities | **18** (SEED_AKTIVITAS, SEED_ALUMNI, SEED_ARTIKEL, SEED_BERITA, SEED_DOKUMEN, SEED_DOSEN, SEED_GALERI, SEED_KEGIATAN, SEED_KURIKULUM, SEED_NOTIFIKASI, SEED_PENDAFTAR, SEED_PENGATURAN, SEED_PENGGUNA, SEED_PENGUMUMAN, SEED_PESAN, SEED_PRESTASI, SEED_PROFIL, SEED_STRUKTUR) |
| Total MK Kurikulum | **57 MK** dari workbook MK Baru |
| Total SKS | **154 SKS** |
| Distribusi semester | S1=9, S2=8, S3=10, S4=10, S5=8, S6=9, S7=2, S8=1 MK |
| MK tanpa dosen pengampu | **10 MK** (dikosongkan by design) |
| Total Dosen | **11 dosen** (10 berkode HKM001–HKM010, 1 tanpa kode) |
| Alpine.js functions | **28 functions** |
| Total halaman HTML | **36 files** (13 publik + 5 detail + 18 admin) |
| DOSEN fields aktual | `id, nama, kode, jabatan, pendidikan, spesialisasi, foto, email, telepon` |
| KURIKULUM fields aktual | `id, kode, nama, sks, semester, kategori, deskripsi, pengampu, kodeDosen` |
| PENGATURAN social media | `facebook, instagram, youtube, linkedin, tiktok` |
| Bad chars di app.js | 0 |
| DB.save/DB.load parity | ✅ Semua 18 key konsisten |

---

## 1. Data Flow Diagram (DFD) Level 0 — Diagram Konteks

### 1.1 Deskripsi & Batasan Sistem

DFD Level 0 menggambarkan batas terluar sistem — seluruh entitas eksternal (Pengunjung Publik, Administrator) dan pertukaran aliran data global dengan sistem utama. Sistem berjalan **murni di sisi browser** tanpa API server atau backend.

### 1.2 Kode Mermaid (DFD Level 0)

```mermaid
flowchart LR
    %% Entitas Eksternal
    E_VISITOR["Pengunjung\nCalon mahasiswa, mahasiswa, alumni, dan masyarakat"]
    E_ADMIN["Administrator\nSuper Admin, Editor, atau Operator"]
    E_CDN["Layanan eksternal\nCDN pustaka dan Google Fonts"]
    E_MAPS["Layanan eksternal\nGoogle Maps Embed"]

    %% Proses Konteks Utama
    P0(("0\nWebsite Profil\nProgram Studi Hukum UMP"))

    %% Data Store Sistem Klien
    D1[("D1 Data aplikasi dan sesi\n(localStorage pada origin browser)")]
    D2[("D2 Salinan data best-effort\n(IndexedDB: ProdiHukumDB / entities)")]

    %% Aliran Data Pengunjung (Data Flows)
    E_VISITOR -->|"Permintaan halaman dan pencarian"| P0
    E_VISITOR -->|"Data formulir kontak"| P0
    E_VISITOR -->|"Data pendaftaran kegiatan"| P0
    P0 -->|"Konten, hasil pencarian, dan dokumen"| E_VISITOR
    P0 -->|"Konfirmasi formulir dan pendaftaran"| E_VISITOR

    %% Aliran Data Administrator (Data Flows)
    E_ADMIN -->|"Kredensial, permintaan reset, dan data kelola"| P0
    E_ADMIN -->|"Pengaturan serta berkas backup/restore JSON"| P0
    P0 -->|"Dashboard, modul admin, dan notifikasi"| E_ADMIN
    P0 -->|"Status operasi dan riwayat aktivitas"| E_ADMIN

    %% Aliran Data Penyimpanan (Read / Write)
    P0 -->|"Simpan data, sesi, dan pageview"| D1
    D1 -->|"Baca data aplikasi dan sesi"| P0
    P0 -.->|"Salinan tulis asinkron best-effort"| D2

    %% Aliran Data Layanan Eksternal
    E_CDN -->|"Pustaka UI, skrip, dan font"| P0
    E_MAPS -->|"Konten peta tertanam"| P0
```

---

## 2. Data Flow Diagram (DFD) Level 1 — Dekomposisi Proses Utama

### 2.1 Deskripsi Proses & Media Penyimpanan

DFD Level 1 membedah proses utama menjadi **10 Sub-Proses Fungsional** dan menghubungkannya dengan **18 Data Store** berbasis `localStorage` dengan namespace `prodihukum_db_v1_<entity>` serta cadangan asinkron IndexedDB.

### 2.2 Kode Mermaid (DFD Level 1)

```mermaid
flowchart TB
    %% Entitas Eksternal
    EXT_VISITOR["Entitas Eksternal:\nPengunjung (Publik)"]
    EXT_ADMIN["Entitas Eksternal:\nAdministrator (Editor / Operator / Super Admin)"]
    EXT_SUPER["Entitas Eksternal:\nSuper Admin"]

    %% Data Stores
    subgraph STORES["Data Stores Sistem (localStorage & IndexedDB)"]
        DS_MASTER[("D1 Basis Data 18 Entitas\n(localStorage: prodihukum_db_v1_*)")]
        DS_SESSION[("D2 Sesi Administrator\n(localStorage: prodihukum_admin_session)")]
        DS_VIEWS[("D3 Statistik Kunjungan\n(localStorage: prodihukum_pageviews_v1)")]
        DS_IDB[("D4 Salinan data best-effort\n(IndexedDB: ProdiHukumDB / entities)")]
    end

    %% Sub-proses DFD Level 1
    P1(("1.0\nAutentikasi & Manajemen Sesi"))
    P2(("2.0\nPenjelajahan Konten Publik & Pageviews"))
    P3(("3.0\nPenanganan Formulir Publik"))
    P4(("4.0\nPengelolaan Data Akademik & Dosen"))
    P5(("5.0\nPengelolaan Konten Publikasi & Profil"))
    P6(("6.0\nKonfigurasi Sistem, Akun & Backup/Restore"))
    P7(("7.0\nPencatatan Log Aktivitas & Notifikasi"))
    P8(("8.0\nPersistensi Klien (DB.save)"))

    %% ==========================================
    %% ALIRAN DATA (DATA FLOWS)
    %% ==========================================

    %% 1.0 Autentikasi
    EXT_ADMIN -->|"Email & Password login / Permintaan reset"| P1
    DS_MASTER -->|"Data kredensial pengguna (SEED_PENGGUNA)"| P1
    P1 -->|"Simpan token sesi aktif"| DS_SESSION
    P1 -->|"Data password baru"| P8
    P1 -->|"Status login / pesan validasi"| EXT_ADMIN

    %% 2.0 Penjelajahan Publik
    EXT_VISITOR -->|"Request buka halaman / keyword pencarian"| P2
    DS_MASTER -->|"Data terbitan (berita, artikel, kurikulum, dosen)"| P2
    P2 -->|"Render halaman & data hasil pencarian"| EXT_VISITOR
    P2 -->|"Inkrementasi hitungan tayangan lokal"| DS_VIEWS

    %% 3.0 Formulir Publik
    EXT_VISITOR -->|"Form pesan kontak (nama, email, pesan)"| P3
    EXT_VISITOR -->|"Form pendaftaran kegiatan (nama, email, wa, instansi)"| P3
    DS_MASTER -->|"Cek duplikasi email pendaftar pada kegiatan"| P3
    P3 -->|"Data pesan & pendaftar"| P8
    P3 -->|"Feedback notifikasi sukses/gagal (SweetAlert)"| EXT_VISITOR
    P3 -->|"Event kontak / pendaftaran (logPublicEvent)"| P7

    %% 4.0 Data Akademik
    EXT_ADMIN -->|"Input/Edit/Hapus data dosen, kurikulum, struktur, alumni"| P4
    P4 -->|"Data akademik yang berubah"| P8
    DS_MASTER -->|"Baca data akademik untuk form edit"| P4
    P4 -->|"Konfirmasi penyimpanan & update tampilan"| EXT_ADMIN
    P4 -->|"Trigger log perubahan data akademik"| P7

    %% 5.0 Konten Publikasi
    EXT_ADMIN -->|"Input/Edit/Hapus berita, artikel, kegiatan, galeri, prestasi, dokumen, profil"| P5
    P5 -->|"Konten dan profil yang berubah"| P8
    DS_MASTER -->|"Baca data konten untuk form edit"| P5
    P5 -->|"Konfirmasi penyimpanan & reload tabel"| EXT_ADMIN
    P5 -->|"Trigger log perubahan konten"| P7

    %% 6.0 Konfigurasi & Backup
    EXT_SUPER -->|"Kelola pengaturan/akun dan unggah backup JSON"| P6
    P6 -->|"Perubahan pengaturan, akun, atau data pulihan"| P8
    DS_MASTER -->|"Export seluruh 18 entitas ke file JSON unduhan"| P6
    P6 -->|"Unduh backup JSON dan status operasi"| EXT_SUPER
    P6 -->|"Trigger log konfigurasi/backup"| P7

    %% 7.0 Logging & Sync
    P7 -->|"Data aktivitas & notifikasi"| P8
    DS_MASTER -->|"Data notifikasi belum dibaca & riwayat dasbor"| P7
    P7 -->|"Tampilkan ringkasan aktivitas di dasbor"| EXT_ADMIN

    %% DB.save menulis ke sumber utama dan meminta salinan asinkron best-effort.
    P8 -->|"Simpan sinkron (18 key entitas)"| DS_MASTER
    P8 -.->|"Salinan asinkron best-effort"| DS_IDB
```

---

## 3. Flowchart Sistem — Logika Navigasi Publik & Panel Admin

### 3.1 Deskripsi Alur Logika

Flowchart Sistem membagi alur logika menjadi dua modul terpisah:

1. **Alur Pengunjung Publik**: Buka halaman, navigasi konten, pencarian instan, registrasi kegiatan (validasi email unik per kegiatanId), pengiriman pesan kontak (ditulis ke `pesan` store), unduh dokumen, dan pergantian tema.
2. **Alur Panel Administrasi**: Pengecekan sesi, validasi autentikasi, otorisasi RBAC guard (Super Admin untuk pengguna/pengaturan), CRUD, pencatatan `logActivity`, auto-pruning bila kuota penuh, dan logout.

### 3.2 Kode Mermaid (Flowchart Sistem)

```mermaid
flowchart TD
    START([Mulai])
    ROUTE{Area yang dibuka?}
    FINISH([Selesai])
    START --> ROUTE

    subgraph PUBLIC["Alur Pengunjung"]
        direction TD
        LOAD_PUBLIC["Muat halaman dan data dari localStorage; gunakan seed bila key belum tersedia"]
        PUBLISHED["Tampilkan konten sesuai modul; berita dan artikel hanya berstatus Published"]
        PAGEVIEW["Catat pageview pada browser"]
        PUBLIC_ACTION{Aksi pengunjung?}
        BROWSE["Jelajahi konten, cari informasi, atau unduh dokumen"]
        CONTACT_FORM["Isi formulir kontak"]
        CONTACT_VALIDATE{Nama, email, dan pesan valid?}
        CONTACT_SAVE["Simpan pesan ke localStorage melalui DB.save('pesan')"]
        CONTACT_ERROR["Tampilkan validasi atau kegagalan penyimpanan"]
        CONTACT_CONFIRM["Catat event publik dan tampilkan konfirmasi"]
        REG_FORM["Isi formulir pendaftaran kegiatan"]
        REG_VALIDATE{Data pendaftaran valid?}
        DUPLICATE{Email sudah terdaftar pada kegiatan ini?}
        REG_SAVE["Simpan pendaftar melalui DB.save('pendaftar')"]
        REG_ERROR["Tampilkan validasi atau kegagalan penyimpanan"]
        REG_CONFIRM["Catat event publik dan tampilkan konfirmasi"]

        LOAD_PUBLIC --> PUBLISHED --> PAGEVIEW --> PUBLIC_ACTION
        PUBLIC_ACTION -->|Jelajah / cari / unduh| BROWSE --> FINISH
        PUBLIC_ACTION -->|Kirim pesan| CONTACT_FORM --> CONTACT_VALIDATE
        CONTACT_VALIDATE -->|Tidak| CONTACT_ERROR --> FINISH
        CONTACT_VALIDATE -->|Ya| CONTACT_SAVE
        CONTACT_SAVE -->|Gagal| CONTACT_ERROR
        CONTACT_SAVE -->|Berhasil| CONTACT_CONFIRM --> FINISH
        PUBLIC_ACTION -->|Daftar kegiatan| REG_FORM --> REG_VALIDATE
        REG_VALIDATE -->|Tidak| REG_ERROR --> FINISH
        REG_VALIDATE -->|Ya| DUPLICATE
        DUPLICATE -->|Ya| REG_ERROR
        DUPLICATE -->|Tidak| REG_SAVE
        REG_SAVE -->|Gagal| REG_ERROR
        REG_SAVE -->|Berhasil| REG_CONFIRM --> FINISH
    end
    ROUTE -->|Halaman publik| LOAD_PUBLIC

    subgraph AUTH["Autentikasi Administrator"]
        direction TD
        ADMIN_ROUTE{Jenis halaman admin?}
        LOGIN_FORM["Masukkan email dan kata sandi"]
        LOGIN_CHECK{Akun aktif dan kredensial cocok?}
        LOGIN_DENIED["Tampilkan pesan login gagal"]
        LOGIN_SESSION["Simpan sesi lokal prodihukum_admin_session"]
        LOGIN_HOME["Buka dashboard admin"]
        RESET_FORM["Masukkan email terdaftar"]
        RESET_CHECK{Email ditemukan dan akun aktif?}
        RESET_PASSWORD["Masukkan kata sandi baru dan konfirmasi"]
        RESET_PASSWORD_CHECK{Minimal 4 karakter dan konfirmasi cocok?}
        RESET_SAVE["Simpan kata sandi melalui DB.save('pengguna')"]
        RESET_SAVE_CHECK{Penyimpanan berhasil?}
        RESET_DONE["Tampilkan konfirmasi dan kembali ke login"]
        GUARD["Jalankan AUTH.guard()"]
        SESSION_CHECK{Sesi admin valid?}
        REDIRECT_LOGIN["Arahkan ke halaman login"]
        ROLE_CHECK{Halaman hanya untuk Super Admin?}
        SUPER_CHECK{Peran sesi adalah Super Admin?}
        ROLE_DENIED["Tolak akses dan arahkan ke dashboard"]
        ADMIN_HOME["Buka modul admin"]

        ADMIN_ROUTE -->|login.html| LOGIN_FORM --> LOGIN_CHECK
        LOGIN_CHECK -->|Tidak| LOGIN_DENIED --> FINISH
        LOGIN_CHECK -->|Ya| LOGIN_SESSION --> LOGIN_HOME --> FINISH
        ADMIN_ROUTE -->|lupa-sandi.html| RESET_FORM --> RESET_CHECK
        RESET_CHECK -->|Tidak, tampilkan pesan| RESET_FORM
        RESET_CHECK -->|Ya| RESET_PASSWORD --> RESET_PASSWORD_CHECK
        RESET_PASSWORD_CHECK -->|Tidak, tampilkan validasi| RESET_PASSWORD
        RESET_PASSWORD_CHECK -->|Ya| RESET_SAVE --> RESET_SAVE_CHECK
        RESET_SAVE_CHECK -->|Tidak, storage penuh| RESET_PASSWORD
        RESET_SAVE_CHECK -->|Ya| RESET_DONE --> FINISH
        ADMIN_ROUTE -->|Halaman admin lain| GUARD --> SESSION_CHECK
        SESSION_CHECK -->|Tidak| REDIRECT_LOGIN --> FINISH
        SESSION_CHECK -->|Ya| ROLE_CHECK
        ROLE_CHECK -->|Tidak| ADMIN_HOME
        ROLE_CHECK -->|Ya| SUPER_CHECK
        SUPER_CHECK -->|Tidak| ROLE_DENIED --> FINISH
        SUPER_CHECK -->|Ya| ADMIN_HOME
    end
    ROUTE -->|Halaman admin| ADMIN_ROUTE

    subgraph MANAGE["Operasi Admin"]
        direction TD
        ADMIN_ACTION{Aksi admin?}
        CRUD["Tambah, ubah, atau hapus data"]
        SAVE["DB.save(): tulis sinkron ke localStorage"]
        SAVE_RESULT{Penulisan berhasil?}
        RETRY["Pangkas log internal yang dibatasi, lalu coba sekali lagi"]
        RETRY_RESULT{Percobaan ulang berhasil?}
        SAVE_FAIL["Batalkan perubahan dan beri tahu admin"]
        ASYNC_COPY["Minta salinan IndexedDB secara asinkron (best-effort)"]
        ACTIVITY["Catat aktivitas dan notifikasi"]
        UPDATE_VIEW["Pancarkan db-update; tab lain menerima storage event"]
        SAVE_OK["Perbarui tampilan dan tampilkan hasil"]
        BACKUP["Backup atau restore JSON data aplikasi"]
        EXPORT["Ekspor CSV kurikulum sesuai pencarian dan filter aktif"]
        LOGOUT["Hapus sesi lokal dan kembali ke login"]

        ADMIN_HOME --> ADMIN_ACTION
        ADMIN_ACTION -->|CRUD| CRUD --> SAVE --> SAVE_RESULT
        SAVE_RESULT -->|Ya| ASYNC_COPY --> ACTIVITY --> UPDATE_VIEW --> SAVE_OK --> FINISH
        SAVE_RESULT -->|Tidak| RETRY --> RETRY_RESULT
        RETRY_RESULT -->|Ya| ASYNC_COPY
        RETRY_RESULT -->|Tidak| SAVE_FAIL --> FINISH
        ADMIN_ACTION -->|Backup / restore| BACKUP --> FINISH
        ADMIN_ACTION -->|Ekspor kurikulum| EXPORT --> FINISH
        ADMIN_ACTION -->|Logout| LOGOUT --> FINISH
    end

    NOTE["Catatan: autentikasi, reset kata sandi, dan penyimpanan berjalan di browser; tidak ada server autentikasi atau sinkronisasi antarperangkat."]
    AUTH -.-> NOTE
```

---

## 4. Entity Relationship Diagram (ERD) — 18 Entitas Data

### 4.1 Deskripsi Struktur Skema & Relasi

ERD mendefinisikan **18 entitas data** (16 array record + 2 objek tunggal) yang disimpan di localStorage dengan namespace `prodihukum_db_v1_<key>`:

- **Relasi Lookup 1**: `KEGIATAN.id ← PENDAFTAR.kegiatanId` — pendaftar menyimpan snapshot `kegiatanNama` sebagai teks.
- **Relasi Lookup 2**: `DOSEN.id ← STRUKTUR.dosenId` — opsional; baris STRUKTUR boleh tanpa dosenId.
- **Relasi Lookup 3**: `DOSEN.nama ↔ KURIKULUM.pengampu` — pencocokan nama ternormalisasi; `kodeDosen` hanya teks informatif, bukan FK.
- **PESAN**: ditulis oleh `contactForm()`, tidak memiliki relasi FK ke entitas lain.
- **PROFIL & PENGATURAN**: objek tunggal (bukan array); PENGATURAN menyimpan identitas situs, SEO, dan **5 akun sosial media**.

### 4.2 Field Aktual per Entitas (Terverifikasi dari SEED_*)

| Entitas | Fields Kunci |
|---------|-------------|
| DOSEN | `id, nama, kode, jabatan, pendidikan, spesialisasi, foto, email, telepon` |
| KURIKULUM | `id, kode, nama, sks, semester, kategori, deskripsi, pengampu, kodeDosen` |
| PENGATURAN | `namaWebsite, deskripsi, logo, favicon, theme, primaryColor, darkMode, metaTitle, metaDesc, keywords, facebook, instagram, youtube, linkedin, tiktok, email, telepon, alamat, mapEmbed, mapLink, koordinat, mahasiswaAktif` |
| STRUKTUR | `id, dosenId (opsional), nama, jabatan, foto` |

### 4.3 Kode Mermaid (ERD — 18 Entitas)

```mermaid
erDiagram
    %% Asosiasi berikut adalah lookup aplikasi; tidak ada foreign-key enforcement.
    KEGIATAN o|--o{ PENDAFTAR : "lookup opsional melalui kegiatanId"
    DOSEN o|--o{ STRUKTUR : "lookup opsional melalui dosenId"
    DOSEN o|--o{ KURIKULUM : "pencocokan nama pengampu"

    %% ==========================================
    %% DOMAIN 1: AKADEMIK & STRUKTUR ORGANISASI
    %% ==========================================
    DOSEN {
        number id PK "ID unik dosen"
        string nama "Nama lengkap beserta gelar"
        string kode "Kode dosen (contoh: HKM001; dapat kosong)"
        string jabatan "Jabatan akademik"
        string pendidikan "Riwayat pendidikan terakhir"
        string spesialisasi "Bidang keahlian hukum"
        string foto "Path file foto dosen"
        string email "Email resmi dosen"
        string telepon "Nomor kontak telepon"
    }

    STRUKTUR {
        number id PK "ID posisi struktur"
        number dosenId "Lookup opsional ke DOSEN.id"
        string nama "Nama pejabat struktural"
        string jabatan "Nama jabatan struktural"
        string foto "Path file foto pejabat"
    }

    KURIKULUM {
        number id PK "ID mata kuliah"
        string kode "Kode mata kuliah"
        string nama "Nama mata kuliah"
        number sks "Bobot SKS (1-6)"
        number semester "Semester sajian (1-8)"
        string kategori "Wajib / Pilihan / MBKM"
        string deskripsi "Deskripsi singkat capaian MK"
        string pengampu "Nama pengampu; dicocokkan setelah normalisasi"
        string kodeDosen "Kode dosen opsional; teks biasa, bukan relasi"
    }

    ALUMNI {
        number id PK "ID data alumni"
        string nama "Nama alumni"
        string angkatan "Tahun angkatan masuk"
        string pekerjaan "Pekerjaan/profesi saat ini"
        string instansi "Nama tempat bekerja/kantor"
        string kategori "Kategori karir alumni"
        string email "Email kontak alumni"
        string linkedin "Tautan profil LinkedIn"
        string status "Status verifikasi (Aktif/Pending)"
        string foto "Path file foto alumni"
    }

    PROFIL {
        string nama "Nama Program Studi [SINGLETON]"
        string kode "Kode Prodi Dikti"
        string fakultas "Nama Fakultas"
        string universitas "Nama Universitas"
        string akreditasi "Peringkat Akreditasi BAN-PT"
        string deskripsi "Deskripsi profil program studi"
        string sejarah "Sejarah pendirian prodi"
        string visi "Pernyataan visi keilmuan"
        string misi "Pernyataan butir-butir misi"
        string tujuan "Tujuan pendidikan prodi"
        string lulusan "Profil lulusan sarjana"
    }

    %% ==========================================
    %% DOMAIN 2: INFORMASI & PUBLIKASI
    %% ==========================================
    BERITA {
        number id PK "ID unik berita"
        string slug "Slug URL ramah SEO"
        string judul "Judul berita"
        string kategori "Kategori berita"
        string tanggal "Tanggal publikasi (DD MMMM YYYY)"
        string penulis "Nama penulis berita"
        string excerpt "Ringkasan pembuka"
        string konten "Isi lengkap berita (HTML)"
        string status "Status publikasi, misalnya Published atau Draft"
        boolean featured "Status sorotan di beranda"
        string gambar "Path atau URL file gambar"
    }

    ARTIKEL {
        number id PK "ID artikel ilmiah/populer"
        string judul "Judul artikel"
        string penulis "Nama penulis artikel"
        string kategori "Kategori hukum"
        string tanggal "Tanggal terbit"
        string isi "Konten artikel lengkap"
        string referensi "Daftar rujukan pustaka"
        string tags "Daftar tag pemisah koma"
        string status "Published / Draft"
        string thumbnail "Path gambar miniatur"
    }

    PENGUMUMAN {
        number id PK "ID pengumuman"
        string judul "Judul pengumuman akademik"
        string status "Penting / Info / Urgent"
        string badge "Teks label badge visual"
        string tanggal "Tanggal rilis"
        string isi "Informasi detail pengumuman"
        string lampiran "Nama atau tautan file lampiran"
    }

    KEGIATAN {
        number id PK "ID kegiatan/event"
        string nama "Nama kegiatan atau seminar"
        string tanggal "Tanggal kegiatan"
        string hari "Nama hari pelaksanaan"
        string bulan "Bulan pelaksanaan"
        string waktu "Waktu pelaksanaan (WIB/WIT)"
        string lokasi "Tempat atau media online"
        string penyelenggara "Panitia pelaksana"
        string deskripsi "Deskripsi lengkap acara"
        string gambar "Poster atau banner acara"
    }

    GALERI {
        number id PK "ID foto galeri"
        string judul "Judul foto kegiatan"
        string album "Nama album kegiatan"
        string src "Path gambar atau URL data"
    }

    PRESTASI {
        number id PK "ID prestasi mahasiswa/prodi"
        string nama "Nama prestasi atau kejuaraan"
        string kategori "Akademik / Non-Akademik"
        string tingkat "Lokal / Regional / Nasional / Internasional"
        string tahun "Tahun perolehan prestasi"
        string foto "Dokumentasi foto sertifikat/trofi"
    }

    DOKUMEN {
        number id PK "ID dokumen unduhan"
        string nama "Nama resmi dokumen"
        string kategori "Panduan / Formulir / SK / Kurikulum"
        string format "Format ekstensi file (PDF/DOCX)"
        string ukuran "Ukuran file (contoh: 2.4 MB)"
        string fileName "Nama berkas fisik"
        string fileData "Base64 data URI atau path file"
    }

    %% ==========================================
    %% DOMAIN 3: INTERAKSI PUBLIK
    %% ==========================================
    PENDAFTAR {
        number id PK "ID pendaftaran"
        number kegiatanId "Lookup aplikasi ke KEGIATAN.id"
        string kegiatanNama "Snapshot teks nama kegiatan saat mendaftar"
        string nama "Nama lengkap pendaftar"
        string email "Email; duplikasi dicek per kegiatan oleh aplikasi"
        string whatsapp "Nomor WhatsApp aktif"
        string instansi "Asal kampus/sekolah/instansi"
        string waktuDaftar "Timestamp ISO pendaftaran"
    }

    PESAN {
        number id PK "ID pesan masuk"
        string nama "Nama pengirim pesan"
        string email "Email pengirim"
        string subjek "Topik atau perihal pesan"
        string pesan "Isi pesan kontak"
        string waktu "Timestamp waktu kirim pesan"
        boolean read "Status sudah dibaca oleh admin"
    }

    %% ==========================================
    %% DOMAIN 4: SISTEM & ADMINISTRASI
    %% ==========================================
    PENGGUNA {
        number id PK "ID pengguna sistem"
        string nama "Nama staf / administrator"
        string email "Email login"
        string password "Kata sandi yang dicocokkan di sisi klien"
        string role "Super Admin / Editor / Operator"
        string status "Aktif / Nonaktif"
    }

    AKTIVITAS {
        number id PK "ID log aktivitas"
        string user "Nama pelaku aksi / sistem"
        string aksi "Deskripsi tindakan yang dilakukan"
        string waktu "Waktu relatif (contoh: 5 menit lalu)"
        string tanggalIso "Waktu absolut ISO 8601"
        string icon "Nama ikon representasi visual"
    }

    NOTIFIKASI {
        number id PK "ID notifikasi sistem"
        string judul "Judul pemberitahuan"
        string pesan "Rincian pesan notifikasi"
        string waktu "Waktu pemberitahuan"
        boolean read "Status dibaca (true/false)"
        string icon "Ikon kategori notifikasi"
    }

    PENGATURAN {
        string namaWebsite "Judul situs web [SINGLETON]"
        string deskripsi "Deskripsi meta website"
        string logo "Path gambar logo instansi"
        string favicon "Path icon favicon browser"
        string theme "Tema warna aktif"
        string primaryColor "Kode warna hex primer"
        boolean darkMode "Status mode gelap"
        string metaTitle "SEO meta title"
        string metaDesc "SEO meta description"
        string keywords "SEO kata kunci"
        string facebook "URL profil Facebook"
        string instagram "URL profil Instagram"
        string youtube "URL kanal YouTube"
        string linkedin "URL profil LinkedIn"
        string tiktok "URL profil TikTok"
        string email "Email resmi prodi"
        string telepon "Nomor telepon prodi"
        string alamat "Alamat fisik kampus"
        string mapEmbed "HTML iframe embed peta Google"
        string mapLink "Tautan langsung Google Maps"
        string koordinat "Koordinat lintang/bujur"
        number mahasiswaAktif "Jumlah mahasiswa aktif terkini"
    }

    %% =========================================================================
    %% Model mencakup 18 key data aplikasi: 16 daftar dan dua objek tunggal
    %% (PROFIL, PENGATURAN). Key sesi admin dan statistik pageview disimpan
    %% terpisah. ID dan tiga asosiasi di atas dikelola aplikasi; tidak ada
    %% constraint, cascade delete, atau transaksi basis data relasional.
    %% =========================================================================
```

---

## 5. Component Diagram — Arsitektur 4-Layer Client-Side

### 5.1 Deskripsi Lapisan Perangkat Lunak

Sistem dirancang dengan arsitektur **4-Layer murni di sisi peramban**:

1. **Presentation & Styling Layer**: 36 berkas HTML (13 publik + 5 detail + 18 admin), Neumorphism Design System (`style.css`), Tailwind CSS pre-built.
2. **Reactive Controller Layer**: Alpine.js 3.14.8 — **28 functions** (`siteHeader`, `homeStats`, `kurikulumPage`, `dosenPage`, `contactForm`, `adminShell`, `adminDosenPage`, `adminCrudTable`, `adminGaleriPage`, `adminPenggunaTable`, `adminDokumenTable`, `kegiatanAdminPage`, `adminAktivitasPage`, dll.)
3. **Core Engine & Business Logic Layer**: `AUTH` module, `DB` engine, `IDB` module, `SEED_*` 18 fixtures, pruning manager, activity logger.
4. **Storage & External Services Layer**: `localStorage` (~5 MB quota), IndexedDB (write-through only), Google Maps Embed, Google Fonts, CDN providers.

### 5.2 Kode Mermaid (Component Diagram)

```mermaid
flowchart TB
    %% ==========================================
    %% LAYER 1: PRESENTATION LAYER (BROWSER UI)
    %% ==========================================
    subgraph PRESENTATION["Lapisan Presentasi (Browser UI)"]
        PUB_UI["Halaman Publik\n(index.html, dosen.html, kurikulum.html, dll)"]
        ADMIN_UI["Halaman Admin\n(dashboard.html, dosen.html, kurikulum.html, dll)"]
        ALPINE["Alpine.js Controllers & Directives\n(x-data, x-model, x-show, event handlers)"]
    end

    %% ==========================================
    %% LAYER 2: APPLICATION LOGIC LAYER (app.js)
    %% ==========================================
    subgraph LOGIC["Lapisan Logika Aplikasi (assets/js/app.js)"]
        AUTH_MOD["Modul Autentikasi (AUTH)\n- login(), current(), isLoggedIn(), logout(), guard()"]
        DB_MOD["Modul Database (DB)\n- load(), save(), pruneStorage()"]
        LOG_MOD["Modul Pencatatan Log\n- logActivity(), logPublicEvent()"]
        BUS_MOD["Event Bus & Sinkronisasi\n- CustomEvent db-update & storage event"]
    end

    %% ==========================================
    %% LAYER 3: STORAGE LAYER (CLIENT PERSISTENCE)
    %% ==========================================
    subgraph STORAGE["Lapisan Penyimpanan Klien (Client Storage)"]
        LS[("localStorage\n- 18 key entitas (prodihukum_db_v1_*)\n- Key sesi, pageview, dan preferensi tema")]
        IDB[("IndexedDB (ProdiHukumDB / entities)\n- Salinan asinkron best-effort; bukan sumber baca")]
    end

    %% ==========================================
    %% LAYER 4: EXTERNAL SERVICES
    %% ==========================================
    subgraph EXTERNAL["Layanan Eksternal (External CDN & Embed)"]
        CDN["CDN Libraries & Fonts\n- Alpine.js 3.14.8\n- SweetAlert2 v11\n- Google Fonts (Inter)"]
        MAPS["Google Maps Embed\n- Iframe peta lokasi kampus"]
    end

    %% Hubungan Antar Komponen
    PUB_UI --> ALPINE
    ADMIN_UI --> ALPINE
    ALPINE --> AUTH_MOD
    ALPINE --> DB_MOD
    ALPINE --> LOG_MOD

    AUTH_MOD --> LS
    DB_MOD <-->|"Baca & Tulis Utama (Sinkron)"| LS
    DB_MOD -.->|"Salinan asinkron best-effort"| IDB
    LOG_MOD --> DB_MOD

    DB_MOD --> BUS_MOD
    BUS_MOD -.->|"Kirim event pembaruan tampilan"| ALPINE

    CDN --> PRESENTATION
    MAPS --> PUB_UI

    %% Catatan Arsitektur
    NOTE_COMP["Catatan arsitektur\nAplikasi dan persistensi berjalan di browser. Tidak ada backend aplikasi atau API data. Pembaruan lintas tab memakai event browser pada origin yang sama."]
    LOGIC -.- NOTE_COMP
```

---

## 6. Sequence Diagram — 4 Skenario Krusial Transaksi Data

### 6.1 Deskripsi Skenario

1. **Skenario 1**: Registrasi Kegiatan oleh Pengunjung Publik (validasi email unik per kegiatanId + logPublicEvent).
2. **Skenario 2**: Autentikasi Login Admin & RBAC Guard.
3. **Skenario 3**: CRUD dengan Auto-Pruning Storage (QuotaExceededError handler).
4. **Skenario 4**: Pengiriman Pesan Kontak ke pesan store.

### 6.2 Kode Mermaid (Sequence Diagram)

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Administrator
    actor Public as Pengunjung
    participant Page as Browser DOM / Alpine.js
    participant App as app.js (Modul Inti)
    participant Store as localStorage (Klien)
    participant IDB as IndexedDB (Salinan Best-Effort)
    participant OtherTab as Tab Browser Lain

    %% ==========================================
    %% SKENARIO 1: AUTENTIKASI ADMIN & SESI
    %% ==========================================
    rect rgb(239, 246, 255)
        Note over Admin,Store: SKENARIO 1 - Autentikasi Login Admin & Pembuatan Sesi Klien
        App->>Store: Baca prodihukum_db_v1_pengguna saat halaman dimuat
        Store-->>App: Data daftar pengguna (fallback ke SEED_PENGGUNA jika kosong)
        Admin->>Page: Kirim email dan kata sandi pada login.html
        Page->>App: Cocokkan email, status, dan kata sandi dengan data pengguna lokal
        alt Akun Ditemukan, Status 'Aktif', dan Password Cocok
            Page->>App: Panggil AUTH.login(matchedUser)
            App->>Store: Simpan data sesi ke prodihukum_admin_session
            App-->>Page: Login Berhasil (true)
            Page-->>Admin: Arahkan ke admin/dashboard.html
        else Kredensial Tidak Cocok / Akun Nonaktif
            App-->>Page: Login Ditolak (false)
            Page-->>Admin: Tampilkan Notifikasi Error (SweetAlert)
        end
    end

    %% ==========================================
    %% SKENARIO 2: OPERASI CRUD KONTEN & SYNC
    %% ==========================================
    rect rgb(240, 253, 244)
        Note over Admin,OtherTab: SKENARIO 2 - Simpan Konten dan Perbarui Tampilan Lintas Tab
        Admin->>Page: Simpan formulir data (Tambah/Edit/Hapus)
        Page->>App: Panggil DB.save(entityKey, dataArray)
        App-)IDB: Minta IDB.set() secara asinkron (best-effort)
        App->>Store: setItem('prodihukum_db_v1_' + entityKey, JSON.stringify(dataArray))
        alt Penyimpanan localStorage Berhasil
            App->>App: Panggil logActivity() -> catat ke store 'aktivitas' & 'notifikasi'
            App-->>Page: Dispatch CustomEvent 'db-update' pada tab aktif
            Store-->>OtherTab: Browser memancarkan 'storage' event secara otomatis
            OtherTab->>OtherTab: Dispatch event 'db-update' pada komponen Alpine lokal
            OtherTab-->>Public: Halaman publik memuat ulang setelah storage event
            Page-->>Admin: Tampilkan SweetAlert sukses & perbarui tabel
        else QuotaExceededError (Kapasitas Penyimpanan Penuh)
            App->>App: Panggil pruneStorage() -> pangkas riwayat lama
            App->>Store: Coba ulang setItem() setelah pemangkasan
            alt Coba Ulang Berhasil
                App-->>Page: Simpan terkonfirmasi setelah optimasi ruang
                Page-->>Admin: Tampilkan notifikasi berhasil dengan optimasi
            else Tetap Gagal
                App-->>Page: Kembalikan false (Rollback status form)
                Page-->>Admin: Tampilkan NeuAlert.storageFull (Kapasitas Browser Penuh)
            end
        end
    end

    %% ==========================================
    %% SKENARIO 3: PENDAFTARAN KEGIATAN PUBLIK
    %% ==========================================
    rect rgb(255, 251, 235)
        Note over Public,Store: SKENARIO 3 - Pendaftaran Kegiatan dan Cek Email per Kegiatan
        Public->>Page: Isi formulir pendaftaran pada detail-kegiatan.html
        Page->>App: Panggil daftarKegiatan(kegiatanId, kegiatanNama, form)
        App->>Store: Baca data dari prodihukum_db_v1_pendaftar
        Store-->>App: Daftar seluruh pendaftar
        App->>App: Validasi: Cek apakah email sudah terdaftar pada kegiatanId ini
        alt Email Sudah Terdaftar untuk Kegiatan Tersebut
            App-->>Page: Validasi gagal (duplikat email)
            Page-->>Public: Tampilkan peringatan: Email sudah terdaftar untuk kegiatan ini
        else Data Baru & Valid
            App->>Store: Simpan data pendaftar baru via DB.save('pendaftar')
            App->>App: Panggil logPublicEvent() -> catat aktivitas pendaftar baru
            Store-->>App: Konfirmasi simpan data
            App-->>Page: Registrasi berhasil
            Page-->>Public: Tampilkan konfirmasi pendaftaran berhasil & reset form
        end
    end

    %% ==========================================
    %% SKENARIO 4: FORMULIR KONTAK PUBLIK
    %% ==========================================
    rect rgb(254, 242, 242)
        Note over Public,Store: SKENARIO 4 - Pengiriman Pesan Kontak ke Penyimpanan Lokal
        Public->>Page: Isi formulir kontak pada kontak.html & klik Kirim
        Page->>App: Validasi dan simpan pesan melalui contactForm()
        App->>App: Jalankan DB.save('pesan', SAMPLE_PESAN)
        App-)IDB: Minta salinan IndexedDB secara asinkron (best-effort)
        App->>Store: Simpan pesan ke localStorage
        alt Penyimpanan localStorage Berhasil
            Store-->>App: DB.save('pesan') berhasil
            App->>App: Panggil logPublicEvent() untuk aktivitas dan notifikasi
            App-->>Page: Kembalikan status berhasil
            Page-->>Public: Reset formulir dan tampilkan konfirmasi
        else Penyimpanan Gagal
            App-->>Page: Kembalikan false dan pulihkan data sebelumnya
            Page-->>Public: Tampilkan peringatan kapasitas penyimpanan
        end
    end
```

---

## 7. Use Case Diagram — Aktor & Use Cases

### 7.1 Pemetaan Aktor & Hak Akses

- **Pengunjung Publik**: Eksplorasi konten, pencarian global, pendaftaran kegiatan, kirim pesan kontak, ganti tema, unduh dokumen.
- **Admin (Editor / Operator)**: Login, dashboard, kelola modul konten umum (berita, artikel, kegiatan, pengumuman, alumni, prestasi, galeri, dokumen, dosen, kurikulum, profil).
- **Super Admin**: Semua hak admin + manajemen pengguna (RBAC) + konfigurasi pengaturan situs (identitas, SEO, sosmed, kontak, peta).

### 7.2 Kode Mermaid (Use Case Diagram)

```mermaid
flowchart LR
    %% Aktor Sistem
    VISITOR["Pengunjung (Publik)"]
    ADMIN["Administrator\n(Super Admin, Editor, Operator)"]
    SUPER["Super Admin"]

    %% Generalisasi Aktor
    SUPER -- "|pewarisan peran|" --> ADMIN

    %% Batas Sistem (System Boundary)
    subgraph SISTEM["Website Profil Program Studi Hukum UMP"]
        %% Modul Publik
        UC_BROWSE(["Jelajahi Konten & Informasi Publik"])
        UC_SEARCH(["Pencarian Konten & Filter Kategori"])
        UC_CONTACT(["Kirim Pesan Kontak"])
        UC_REGISTER(["Daftar Kegiatan / Seminar"])

        %% Modul Autentikasi Admin
        UC_LOGIN(["Login Administrator"])
        UC_LOGOUT(["Logout Sistem"])
        UC_FORGOT(["Reset Password (Lupa Password)"])

        %% Modul Kelola Master & Konten (Admin & Super Admin)
        UC_BERITA(["Kelola Berita, Artikel & Pengumuman"])
        UC_AKADEMIK(["Kelola Dosen, Kurikulum & Struktur"])
        UC_MEDIA(["Kelola Galeri, Dokumen & Prestasi"])
        UC_INBOX(["Kelola Pesan Masuk & Pendaftar Kegiatan"])
        UC_PROFIL(["Kelola Data Profil & Sejarah Prodi"])

        %% Modul khusus yang dibatasi AUTH.guard() untuk Super Admin
        UC_USERS(["Kelola Akun Pengguna & Hak Akses"])
        UC_SETTINGS(["Kelola Pengaturan Website & Media Sosial"])
        UC_BACKUP(["Backup & Restore Basis Data JSON"])
    end

    %% Relasi Pengunjung ke Use Case Publik
    VISITOR --- UC_BROWSE
    VISITOR --- UC_SEARCH
    VISITOR --- UC_CONTACT
    VISITOR --- UC_REGISTER

    %% Relasi Admin ke Use Case Manajemen Umum
    ADMIN --- UC_LOGIN
    ADMIN --- UC_LOGOUT
    ADMIN --- UC_FORGOT
    ADMIN --- UC_BERITA
    ADMIN --- UC_AKADEMIK
    ADMIN --- UC_MEDIA
    ADMIN --- UC_INBOX
    ADMIN --- UC_PROFIL

    %% Relasi Khusus Super Admin
    SUPER --- UC_USERS
    SUPER --- UC_SETTINGS
    SUPER --- UC_BACKUP

    %% Catatan Arsitektural Sistem (Non-Use Case)
    NOTE_STORAGE["Catatan sistem\nData utama dan sesi disimpan pada browser. Reset kata sandi tidak memakai verifikasi email. Backup/restore JSON tersedia bagi Super Admin; ekspor kurikulum mengunduh CSV sesuai filter, sedangkan import masih simulasi."]
    UC_AKADEMIK -.- NOTE_STORAGE
    UC_SETTINGS -.- NOTE_STORAGE
```

---

## 8. Deployment Diagram — Topologi Fisik & Runtime CDN

### 8.1 Arsitektur Komputasi & Jaringan

Sistem beroperasi di bawah model **Static Hosting / Jamstack**:

1. **Static Web Server**: Menyajikan 36 berkas HTML dan folder aset statis (`assets/`).
2. **Client Node**: Browser modern menjalankan Alpine.js 3.14.8, `app.js` (core engine), dan menyimpan data di localStorage.
3. **Cloud CDN**: Alpine.js 3.14.8, SweetAlert2 v11, Google Fonts (Inter + Poppins), Tailwind CSS.

### 8.2 Kode Mermaid (Deployment Diagram)

```mermaid
flowchart TB
    %% ==========================================
    %% NODE 1: STATIC WEB SERVER
    %% ==========================================
    subgraph WEB_SERVER["Server Web Statis (opsi hosting)"]
        HTML_FILES["Berkas web statis\n- 18 halaman publik dan detail\n- 18 berkas admin, termasuk satu redirect\n- CSS dan aset gambar"]
        JS_BUNDLE["Skrip klien\n- assets/js/app.js (logika dan data seed)"]
    end

    %% ==========================================
    %% NODE 2: CLIENT DEVICE (PERANGKAT PENGGUNA)
    %% ==========================================
    subgraph CLIENT_DEVICE["Node: Perangkat Klien (PC / Laptop / Smartphone)"]
        subgraph BROWSER["Lingkungan Eksekusi: Web Browser Modern (Chrome, Edge, Firefox, Safari)"]
            subgraph RUNTIME["Mesin JavaScript & Render Engine DOM"]
                DOM_UI["Antarmuka DOM & Alpine.js Runtime"]
                APP_LOGIC["Eksekusi app.js (AUTH, DB, Logger)"]
            end
            subgraph LOCAL_STORAGE_NODE["Media Penyimpanan Browser (Origin Storage)"]
                LS_STORE[("localStorage Browser\n- 18 Kunci Entitas (prodihukum_db_v1_*)\n- Sesi: prodihukum_admin_session\n- Metrik: prodihukum_pageviews_v1")]
                IDB_STORE[("IndexedDB browser\n- ProdiHukumDB / entities\n- Salinan asinkron best-effort")]
            end
        end
    end

    %% ==========================================
    %% NODE 3: EXTERNAL SERVICES
    %% ==========================================
    subgraph CDN_SERVER["Node: Content Delivery Network (CDN)"]
        CDN_ASSETS["Pustaka dan font eksternal\n- jsDelivr: Alpine.js, SweetAlert2\n- Google Fonts"]
    end

    subgraph MAPS_SERVER["Node: Server Google Maps"]
        MAPS_SERVICE["Google Maps Embed"]
    end

    %% Jalur Distribusi & Komunikasi Protokol
    HTML_FILES -->|"Protokol: HTTPS / HTTP\n(Pengiriman Dokumen Statis)"| DOM_UI
    JS_BUNDLE -->|"Protokol: HTTPS / HTTP\n(Pengunduhan Kode Sumber JS)"| APP_LOGIC
    CDN_ASSETS -->|"Protokol: HTTPS\n(Pengunduhan Script CDN & Stylesheet)"| DOM_UI
    MAPS_SERVICE -->|"Protokol: HTTPS\n(Penyematan Konten Iframe Peta)"| DOM_UI

    %% Akses Internal Browser
    DOM_UI <--> APP_LOGIC
    APP_LOGIC <-->|"Penyimpanan Lokal Sinkron (Read/Write)"| LS_STORE
    APP_LOGIC -.->|"Replikasi Cadangan Asinkron (Write Only)"| IDB_STORE

    %% Catatan arsitektur client-only
    NOTE_DEPLOY["Arsitektur client-side\nServer statis hanya menyajikan berkas. Data aplikasi dan sesi tersimpan di origin browser; tidak ada backend aplikasi, basis data terpusat, atau sinkronisasi antarperangkat."]
    CLIENT_DEVICE -.- NOTE_DEPLOY
```

---

## 9. Activity Diagram — Interaksi Publik, Admin, dan Persistensi

Activity diagram merangkum validasi formulir publik, pemeriksaan login dan guard admin, operasi CRUD, serta perilaku `DB.save()` saat penulisan lokal berhasil atau gagal. Salinan IndexedDB hanya best-effort. Tab lain menerima `storage` event, tetapi halaman publik hanya memuat ulang untuk perubahan data konten yang relevan.

Sumber Mermaid: [`activity-diagram.mmd`](docs/diagrams/activity-diagram.mmd). Draw.io: [`activity-diagram.drawio.xml`](docs/diagrams/drawio/activity-diagram.drawio.xml).

### 9.1 Kode Mermaid (Activity Diagram)

```mermaid
flowchart TD
    START((Mulai)) --> OPEN["Buka halaman pada browser"]
    OPEN --> AREA{Area yang diakses?}

    subgraph PUBLIC["Alur Pengunjung"]
        direction TB
        LOAD["Muat data dari localStorage; seed dipakai hanya jika key belum ada"]
        VIEW["Tampilkan konten; berita dan artikel publik berstatus Published"]
        ACTION{Aksi pengunjung?}
        BROWSE["Jelajah, cari, atau unduh dokumen"]
        CONTACT["Isi formulir kontak"]
        CONTACT_VALID{Nama, email valid, dan pesan terisi?}
        CONTACT_ERROR["Tampilkan validasi; perbaiki formulir"]
        REGISTER["Isi formulir pendaftaran kegiatan"]
        REGISTER_VALID{Nama, email, dan WhatsApp valid?}
        DUPLICATE{Email sudah terdaftar untuk kegiatan ini?}
        REGISTER_ERROR["Tampilkan validasi atau penolakan duplikat"]

        LOAD --> VIEW --> ACTION
        ACTION -->|Jelajah| BROWSE
        ACTION -->|Kirim pesan| CONTACT --> CONTACT_VALID
        CONTACT_VALID -->|Tidak| CONTACT_ERROR --> CONTACT
        CONTACT_VALID -->|Ya| CONTACT_SAVE["Siapkan record pesan"]
        ACTION -->|Daftar kegiatan| REGISTER --> REGISTER_VALID
        REGISTER_VALID -->|Tidak| REGISTER_ERROR --> REGISTER
        REGISTER_VALID -->|Ya| DUPLICATE
        DUPLICATE -->|Ya| REGISTER_ERROR
        DUPLICATE -->|Tidak| REG_SAVE["Siapkan record pendaftar"]
    end
    AREA -->|Publik| LOAD
    BROWSE --> FINISH([Selesai])

    subgraph ADMIN["Alur Administrator"]
        direction TB
        ENTRY{Login atau buka modul admin?}
        LOGIN["Masukkan email dan kata sandi"]
        CREDENTIALS{Email dan sandi cocok, akun aktif, serta data sesi valid?}
        LOGIN_ERROR["Tampilkan kegagalan login"]
        SESSION["AUTH.login(): simpan sesi pada localStorage"]
        GUARD["AUTH.guard(): periksa sesi"]
        SESSION_VALID{Sesi valid?}
        REDIRECT["Arahkan ke halaman login"]
        ROLE_PAGE{Halaman Pengguna atau Pengaturan?}
        SUPER_ADMIN{Peran Super Admin?}
        DENY["Tolak akses; arahkan ke dashboard"]
        ADMIN_ACTION["Kelola data (CRUD)"]
        ADMIN_SAVE["Siapkan perubahan data"]

        ENTRY -->|Login| LOGIN --> CREDENTIALS
        CREDENTIALS -->|Tidak| LOGIN_ERROR --> LOGIN
        CREDENTIALS -->|Ya| SESSION --> ADMIN_ACTION
        ENTRY -->|Modul admin| GUARD --> SESSION_VALID
        SESSION_VALID -->|Tidak| REDIRECT
        SESSION_VALID -->|Ya| ROLE_PAGE
        ROLE_PAGE -->|Tidak| ADMIN_ACTION
        ROLE_PAGE -->|Ya| SUPER_ADMIN
        SUPER_ADMIN -->|Tidak| DENY
        SUPER_ADMIN -->|Ya| ADMIN_ACTION
        ADMIN_ACTION --> ADMIN_SAVE
    end
    AREA -->|Admin| ENTRY
    REDIRECT --> LOGIN
    DENY --> FINISH

    subgraph PERSISTENCE["Penyimpanan dan pembaruan"]
        direction TB
        BACKUP["Minta salinan IndexedDB secara asinkron (best-effort)"]
        WRITE["DB.save(): tulis sinkron ke localStorage"]
        SAVED{Penulisan berhasil?}
        PRUNE["Pangkas aktivitas/pageview yang dibatasi; coba sekali lagi"]
        RETRY{Percobaan ulang berhasil?}
        ROLLBACK["Pulihkan state di memori dan tampilkan kegagalan"]
        LOG["Jalankan logger aktivitas/notifikasi sesuai alur"]
        RESULT["Tampilkan konfirmasi dan perbarui tampilan"]
        UPDATE["Pancarkan db-update pada tab aktif"]
        STORAGE_EVENT["Tab lain menerima storage event"]
        CONTENT_CHANGED{Tab penerima publik dan key termasuk konten?}
        RELOAD["Halaman publik memuat ulang"]

        BACKUP --> WRITE --> SAVED
        SAVED -->|Tidak| PRUNE --> RETRY
        RETRY -->|Tidak| ROLLBACK
        SAVED -->|Ya| LOG
        RETRY -->|Ya| LOG
        LOG --> RESULT --> UPDATE
        UPDATE --> STORAGE_EVENT --> CONTENT_CHANGED
        CONTENT_CHANGED -->|Ya| RELOAD
        CONTENT_CHANGED -->|Tidak| FINISH
    end
    CONTACT_SAVE --> BACKUP
    REG_SAVE --> BACKUP
    ADMIN_SAVE --> BACKUP
    BROWSE --> FINISH
    ROLLBACK --> FINISH
    RELOAD --> FINISH

    NOTE["Cakupan: CRUD administrator dan formulir publik. Semua proses berjalan di browser; tidak ada backend atau sinkronisasi antarperangkat."]
    PERSISTENCE -.-> NOTE

    classDef terminal fill:#e0f2fe,stroke:#0284c7,color:#0c4a6e,stroke-width:2px;
    classDef action fill:#f8fafc,stroke:#64748b,color:#0f172a,stroke-width:1.5px;
    classDef decision fill:#fff7ed,stroke:#f97316,color:#7c2d12,stroke-width:1.5px;
    classDef warning fill:#fef2f2,stroke:#ef4444,color:#7f1d1d,stroke-width:1.5px;
    classDef storage fill:#eff6ff,stroke:#3b82f6,color:#1e3a8a,stroke-width:1.5px;
    classDef note fill:#fffbeb,stroke:#d97706,color:#78350f,stroke-dasharray:4 3;
    class START,FINISH terminal;
    class OPEN,VIEW,BROWSE,CONTACT,REGISTER,CONTACT_SAVE,REG_SAVE,LOGIN,SESSION,GUARD,ADMIN_ACTION,ADMIN_SAVE,LOG,RESULT,UPDATE,STORAGE_EVENT,RELOAD action;
    class AREA,ACTION,CONTACT_VALID,REGISTER_VALID,DUPLICATE,ENTRY,CREDENTIALS,SESSION_VALID,ROLE_PAGE,SUPER_ADMIN,SAVED,RETRY,CONTENT_CHANGED decision;
    class BACKUP,WRITE storage;
    class CONTACT_ERROR,REGISTER_ERROR,LOGIN_ERROR,REDIRECT,DENY,PRUNE,ROLLBACK warning;
    class NOTE note;
```

## 10. Panduan Penggunaan Berkas Draw.io XML

Untuk mengedit atau membuka diagram di aplikasi **[draw.io (diagrams.net)](https://app.diagrams.net)**, gunakan berkas XML yang tersedia di folder [`docs/diagrams/drawio/`](docs/diagrams/drawio/):

| Nama Diagram | Berkas XML Draw.io | Tipe |
| --- | --- | --- |
| **DFD Level 0** | [`dfd-level-0.drawio.xml`](docs/diagrams/drawio/dfd-level-0.drawio.xml) | `.drawio.xml` |
| **DFD Level 1** | [`dfd-level-1.drawio.xml`](docs/diagrams/drawio/dfd-level-1.drawio.xml) | `.drawio.xml` |
| **Flowchart Sistem** | [`flowchart-sistem.drawio.xml`](docs/diagrams/drawio/flowchart-sistem.drawio.xml) | `.drawio.xml` |
| **ER Diagram (18 Entitas)** | [`er-diagram.drawio.xml`](docs/diagrams/drawio/er-diagram.drawio.xml) | `.drawio.xml` |
| **Component Diagram** | [`component-diagram.drawio.xml`](docs/diagrams/drawio/component-diagram.drawio.xml) | `.drawio.xml` |
| **Sequence Diagram** | [`sequence-diagram.drawio.xml`](docs/diagrams/drawio/sequence-diagram.drawio.xml) | `.drawio.xml` |
| **Use Case Diagram** | [`usecase-diagram.drawio.xml`](docs/diagrams/drawio/usecase-diagram.drawio.xml) | `.drawio.xml` |
| **Deployment Diagram** | [`deployment-diagram.drawio.xml`](docs/diagrams/drawio/deployment-diagram.drawio.xml) | `.drawio.xml` |
| **Activity Diagram** | [`activity-diagram.drawio.xml`](docs/diagrams/drawio/activity-diagram.drawio.xml) | `.drawio.xml` |
| **Master Semua Diagram (9 Tab)** | [`all-diagrams.drawio.xml`](docs/diagrams/drawio/all-diagrams.drawio.xml) | `.drawio.xml` |

### Cara Buka di Draw.io

1. **Via File**: Buka [app.diagrams.net](https://app.diagrams.net) → **Open Existing Diagram** → pilih file `.drawio.xml`.
2. **Via Copy-Paste**: Buka file `.drawio.xml` di VS Code → Ctrl+A, Ctrl+C → di draw.io klik **Extras** → **Edit Diagram...** → Ctrl+V → **Apply**.

> **Catatan:** Berkas Draw.io XML (`.drawio.xml`) adalah representasi visual dari diagram yang sama dengan file `.mmd` di `docs/diagrams/`. Sumber kebenaran terbaru adalah file `.mmd` — update draw.io XML setelah perubahan signifikan pada data.
