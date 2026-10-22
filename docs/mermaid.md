# Diagram Mermaid Sistem

Berkas `.mmd` di [`docs/diagrams/`](diagrams/) adalah sumber diagram terkini untuk prototipe Website Profil Program Studi Hukum UMP. Diagram menggambarkan sistem client-side yang berjalan; bukan rancangan backend atau kontrol keamanan server.

| Diagram | Sumber |
|---|---|
| Batas sistem dan aliran konteks | [`dfd-level-0.mmd`](diagrams/dfd-level-0.mmd) |
| 8 proses dan 4 penyimpanan logis (termasuk satu store berisi 18 entitas) | [`dfd-level-1.mmd`](diagrams/dfd-level-1.mmd) |
| Alur halaman publik dan pemeriksaan sesi admin | [`flowchart-sistem.mmd`](diagrams/flowchart-sistem.mmd) |
| Aktivitas pengunjung, autentikasi admin, CRUD, dan persistensi | [`activity-diagram.mmd`](diagrams/activity-diagram.mmd) |
| Model 18 entitas, field aktual, dan 3 asosiasi logis | [`er-diagram.mmd`](diagrams/er-diagram.mmd) |
| 4 skenario transaksi data (login, CRUD, registrasi, kontak) | [`sequence-diagram.mmd`](diagrams/sequence-diagram.mmd) |
| Komponen browser, 28 Alpine functions, dan aset statis | [`component-diagram.mmd`](diagrams/component-diagram.mmd) |
| Use case aktor dan batas role RBAC | [`usecase-diagram.mmd`](diagrams/usecase-diagram.mmd) |
| Deployment statis dan layanan eksternal CDN | [`deployment-diagram.mmd`](diagrams/deployment-diagram.mmd) |

## Ringkasan Sistem (Audit Oktober 2026)

`localStorage` adalah sumber data utama dan berbagi data hanya pada origin serta profil browser yang sama. IndexedDB (`ProdiHukumDB`, object store `entities`) hanya menerima salinan penulisan _best-effort_ dan tidak dipakai untuk membaca data aplikasi. Guard role hanya membatasi halaman **pengguna** dan **pengaturan** bagi role selain Super Admin; role lain tidak memiliki permission terpisah pada modul admin umum. Semua itu berjalan di sisi klien, bukan sinkronisasi backend.

## Data Terverifikasi

| Aspek | Nilai |
|-------|-------|
| Total SEED entities | **18** (16 array record + `profil` + `pengaturan`) |
| Total MK Kurikulum | **57 MK** (workbook MK Baru) |
| Total SKS | **154 SKS** |
| Distribusi semester | S1=9, S2=8, S3=10, S4=10, S5=8, S6=9, S7=2, S8=1 |
| MK tanpa dosen (by design) | **10 MK** |
| Total Dosen | **11** (10 berkode HKM001–HKM010, 1 tanpa kode) |
| Alpine.js functions | **28** |
| Halaman HTML | **36** (13 publik + 5 detail + 18 admin) |
| Bad chars di app.js | **0** |

## Model ER — 18 Entitas & Asosiasi Logis

Model ER mencakup seluruh 18 key data: 16 daftar record dan dua objek tunggal (`profil`, `pengaturan`). Tiga asosiasi yang benar-benar dipakai logika aplikasi:

1. `pendaftar.kegiatanId` → `kegiatan.id` — lookup by ID; `kegiatanNama` merupakan snapshot teks
2. `struktur.dosenId` → `dosen.id` — opsional; baris struktur boleh tanpa dosenId
3. `kurikulum.pengampu` ↔ `dosen.nama` — pencocokan nama ternormalisasi; `kodeDosen` bukan foreign key

Relasi-relasi ini tidak memiliki constraint/cascade database. `PESAN` ditulis oleh `contactForm()` dan tidak memiliki relasi FK ke entitas lain.

## Field Aktual Entitas Kunci

**DOSEN**: `id, nama, kode, jabatan, pendidikan, spesialisasi, foto, email, telepon`  
**KURIKULUM**: `id, kode, nama, sks, semester, kategori, deskripsi, pengampu, kodeDosen`  
**PENGATURAN**: `namaWebsite, deskripsi, logo, favicon, theme, primaryColor, darkMode, metaTitle, metaDesc, keywords, facebook, instagram, youtube, linkedin, tiktok, email, telepon, alamat, mapEmbed, mapLink, koordinat, mahasiswaAktif`  
**STRUKTUR**: `id, dosenId (opsional), nama, jabatan, foto`

Audit konsistensi Oktober 2026 mengonfirmasi: 0 bad chars di `app.js`, semua 18 SEED_* memiliki SAMPLE_* yang cocok via DB.load, semua DB.save key konsisten dengan DB.load, dan semua 28 fungsi Alpine terdefinisi serta terpanggil dari HTML yang tepat. Ekspor Kurikulum Admin mengunduh CSV sesuai pencarian dan filter aktif; Import masih simulasi. Rincian tercantum pada [`analisa-perancangan-sistem.md`](analisa-perancangan-sistem.md) dan [`spesifikasi-sistem.md`](spesifikasi-sistem.md).
