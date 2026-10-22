# Analisis dan Perancangan Sistem

## Website Profil Program Studi Hukum UMP

Dokumen ini mencatat arsitektur dan alur implementasi yang ditemukan pada repositori. Diagram Mermaid versi terkini tersedia terpisah pada [`docs/diagrams/`](diagrams/).

## 1. Ringkasan arsitektur aktual

Website ini adalah prototipe client-side tanpa backend aplikasi. Berkas HTML statis dan aset disajikan oleh web server statis. JavaScript di [`assets/js/app.js`](../assets/js/app.js) memuat seed, membaca dan menyimpan data, menyediakan controller Alpine.js, serta menangani sesi admin. Pustaka Alpine.js dan SweetAlert2 dimuat dari CDN; Chart.js dipakai pada dashboard admin.

`localStorage` pada origin dan profil browser aktif adalah penyimpanan utama. Key data menggunakan `prodihukum_db_v1_<entitas>`. IndexedDB dengan nama `ProdiHukumDB` hanya menerima salinan asinkron best-effort; aplikasi tidak membacanya kembali saat memuat data. Tidak ada sinkronisasi server atau lintas perangkat.

## 2. Alur data dan antarmuka

1. Halaman memuat script aplikasi, menginisialisasi tema, memuat setiap entitas dari `localStorage`, dan mengisi seed ketika key belum ada.
2. Alpine.js menghubungkan data aplikasi dengan tampilan HTML dan interaksi pengguna.
3. Panel admin menulis konten ke key lokal. Tab publik lain pada origin yang sama memproses event `storage` dan memuat ulang halaman ketika entitas konten berubah.
4. Form kontak menambah `pesan`; formulir pendaftaran menambah `pendaftar`. Keduanya berjalan lokal, bukan mengirim data ke server atau email.
5. Pendaftar dikelompokkan menggunakan `kegiatanId`; aplikasi menolak email yang sama untuk kegiatan yang sama.
6. Pencarian global memeriksa sembilan jenis konten dan mengarahkan pengguna ke hasil cocok pertama.
7. Hitungan page view hanya dicatat pada browser lokal.

## 3. Login dan batas role

Login membandingkan email (tanpa membedakan kapitalisasi), status akun, dan kata sandi dengan data `pengguna` lokal. Sesi hanya dibuat jika akun memiliki nama, email, dan salah satu role `Super Admin`, `Editor`, atau `Operator`; kegagalan penyimpanan sesi ditampilkan sebagai error. Email untuk fitur “Ingat Saya” bersifat opsional dan kegagalan menyimpannya tidak membatalkan sesi. Sesi JSON ditulis ke `prodihukum_admin_session`, lalu guard memeriksa nama, email, dan role yang dikenali.

Di antara halaman admin, pemeriksaan role khusus hanya diterapkan pada `pengguna.html` dan `pengaturan.html`, yang memerlukan `Super Admin`. Guard tidak mengimplementasikan permission berbeda bagi Editor dan Operator untuk halaman admin umum. Semua pemeriksaan berada di browser dan tidak menjadi batas keamanan untuk server produksi.

Lupa sandi memverifikasi kecocokan email dan status aktif terhadap data lokal, lalu mengganti kata sandi lokal. Proses ini tidak mengirim email dan tidak memverifikasi identitas melalui kanal terpisah.

## 4. Entitas data

Aplikasi memakai 18 key entitas: `berita`, `dosen`, `dokumen`, `galeri`, `pengumuman`, `kegiatan`, `pendaftar`, `pesan`, `artikel`, `prestasi`, `kurikulum`, `alumni`, `pengguna`, `aktivitas`, `notifikasi`, `profil`, `struktur`, dan `pengaturan`.

Enam belas key menyimpan daftar record; `profil` dan `pengaturan` menyimpan satu objek. Kode menerapkan tiga asosiasi melalui lookup aplikasi: `pendaftar.kegiatanId` ke `kegiatan.id`, `struktur.dosenId` opsional ke `dosen.id`, dan `kurikulum.kodeDosen` ke `dosen.kode` dengan pencocokan nama `pengampu` sebagai fallback untuk record tanpa kode. `pendaftar.kegiatanNama` adalah salinan teks nama kegiatan. Lookup tidak menegakkan integritas referensial, cascade, atau transaksi; karena itu data yatim dapat tertinggal. Seed struktur lama dapat tidak memiliki `dosenId`. Field `penulis`, `user`, dan teks sejenis bukan relasi ke entitas pengguna/dosen.

Rincian kolom dan batas implementasi dicatat pada [`spesifikasi-sistem.md`](spesifikasi-sistem.md).

## 5. Berkas HTML dan sumber diagram

Ada 18 halaman publik dan 18 berkas di `admin/`. `admin/activity.html` adalah redirect lama ke `admin/aktivitas.html`; halaman itu tidak memuat `app.js`. Tiga puluh lima halaman lainnya memuat script aplikasi bersama.

Diagram aliran data, activity, alur sistem, komponen, deployment, sequence, model entitas, dan use case ada di [`diagrams/`](diagrams/). Diagram menunjukkan perilaku client-side yang berjalan; diagram model data sengaja tidak menggambarkan constraint relasional yang tidak diterapkan kode.

Ekspor Draw.io di `diagrams/drawio/` tersedia untuk sembilan sumber Mermaid, termasuk berkas gabungan `all-diagrams.drawio.xml`. Ekspor XML bersifat statis dan tidak tersinkron otomatis; diagram Mermaid tetap menjadi referensi utama yang dipelihara untuk keadaan sistem dan ekspor perlu dibuat ulang jika sumber berubah.

## 6. Batas operasional

- Batas kapasitas `localStorage` berbeda antarbrowser. Ketika penyimpanan penuh, aplikasi membatasi pembersihan otomatis pada log aktivitas dan statistik kunjungan; perubahan konten gagal akan dibatalkan dan dilaporkan.
- Salinan IndexedDB bersifat best-effort dan bukan fallback pembacaan maupun pengganti server.
- Foto dikompresi di browser; hasil ukuran tidak dijamin. Unggahan PDF, DOC, dan DOCX dibatasi 5 MB sebelum konversi base64.
- Backup JSON mengambil entitas dengan prefix DB saja; bukan seluruh preferensi dan key sesi browser.
- Kredensial demo, otentikasi, reset sandi, dan otorisasi tersimpan/dijalankan di client.

## 7. Hasil audit konsistensi data (20 Oktober 2026)

Audit kode dan uji browser memverifikasi bahwa halaman Admin dan publik menggunakan key `localStorage` yang sama untuk entitas konten bersama. Pada profil browser yang diperiksa, halaman Admin dan publik menampilkan roster dosen yang sama (11 record). Kurikulum yang tersimpan berisi 57 mata kuliah dengan total 154 SKS. Nilai tersebut adalah keadaan data yang diamati saat audit, bukan batas atau nilai tetap setelah CRUD.

Temuan dan batasan yang terverifikasi:

- Tiga record seed struktur organisasi menggunakan nama lama dan tidak mempunyai `dosenId`; nama tersebut tidak cocok dengan roster dosen saat audit. UI Admin sudah mendukung tautan berdasarkan ID, tetapi record seed/tersimpan tersebut perlu ditautkan secara manual agar nama, kode, dan foto mengikuti dosen.
- Ringkasan `154 SKS (8 Semester)` di halaman Profil ditulis statis, bukan dihitung dari data kurikulum. Nilainya dapat tertinggal setelah perubahan kurikulum.
- Ekspor pada Admin Kurikulum mengunduh CSV sesuai pencarian dan filter aktif; tombol Import masih menampilkan notifikasi simulasi. Unduhan CSV halaman publik merupakan fungsi tersendiri.
- Angka mahasiswa aktif diatur melalui Pengaturan dan tidak dihitung dari record mahasiswa; aplikasi tidak memiliki entitas atau modul mahasiswa.
- Sejumlah mata kuliah tidak mencantumkan pengampu. Kedua tampilan menggunakan data yang sama dan menampilkan status tidak tercantum; aplikasi tidak mengisi pengampu dari sumber lain.
- Berita dan artikel publik memfilter record dengan status `Published`.

Penyapuan browser pada 36 URL HTML tidak menemukan JavaScript runtime error. Ini hanya membuktikan halaman dapat dimuat pada lingkungan yang diuji; bukan pengujian menyeluruh untuk semua alur CRUD, browser, batas kuota, atau keamanan produksi.

## 8. Pemeriksaan repositori

Audit statis memeriksa inventaris seluruh 36 HTML, keberadaan script `app.js` pada 35 halaman aplikasi, referensi berkas lokal literal, komponen `x-data`, jumlah entitas, serta klaim dokumentasi terhadap runtime. Pemeriksaan tersebut bukan pengganti uji browser menyeluruh atau audit keamanan produksi.
