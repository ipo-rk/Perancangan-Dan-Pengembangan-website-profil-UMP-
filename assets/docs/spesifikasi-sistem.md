# Spesifikasi Sistem

## Website Profil Program Studi Hukum UMP

Dokumen ini menjelaskan perilaku yang benar-benar tersedia pada repositori saat ini. Ini adalah prototipe web statis sisi klien, bukan sistem informasi berbasis server.

## 1. Cakupan dan batasan

Proyek menyediakan portal publik dan panel admin yang menggunakan berkas HTML, CSS, dan JavaScript. Tidak ada backend, API aplikasi, database server, atau layanan email pemulihan kata sandi. Aplikasi dijalankan pada origin yang sama agar halaman publik dan admin pada profil browser yang sama dapat membaca data lokal yang sama.

Pustaka UI dimuat dari CDN: Alpine.js 3.14.8 dan SweetAlert2 11 pada halaman aplikasi; Chart.js 4 digunakan pada dashboard admin. Tailwind CSS tersedia sebagai stylesheet lokal yang dibangun untuk proyek ini. Google Fonts dan embed Google Maps digunakan pada halaman yang memuat referensi tersebut. Bootstrap tidak dimuat oleh halaman proyek.

## 2. Perilaku yang tersedia

### Portal publik

- Beranda dan halaman informasi untuk profil, dosen, kurikulum, berita, pengumuman, kegiatan, artikel, prestasi, alumni, galeri, dokumen, dan kontak.
- Lima halaman detail membaca `id` dari query string untuk berita, pengumuman, kegiatan, artikel, dan galeri.
- Pencarian global memeriksa data berita terbit, dosen, dokumen, kegiatan, pengumuman, artikel terbit, alumni, prestasi, dan kurikulum. Navigasi membuka hasil pertama yang cocok; tidak ada halaman hasil pencarian terpisah.
- Form kontak menulis pesan ke entitas lokal `pesan`. Pendaftaran kegiatan menulis ke `pendaftar`; email yang sama dicegah mendaftar dua kali pada kegiatan yang sama.
- Tema disimpan sebagai preferensi `localStorage` dengan key `theme`. Statistik kunjungan menghitung pemuatan halaman publik pada browser lokal.
- Data contoh dokumen dan lampiran pengumuman/kegiatan dapat menampilkan konfirmasi simulasi. Berkas dokumen yang diunggah melalui admin dapat diunduh sebagai data berkas yang tersimpan.

### Panel admin

- Akun diperiksa di browser terhadap data pengguna lokal: email, status `Aktif`, dan kata sandi.
- Sesi disimpan pada key `prodihukum_admin_session`. Guard menolak sesi yang tidak berisi nama, email, dan peran yang dikenali.
- Hanya halaman `pengguna.html` dan `pengaturan.html` yang secara khusus memeriksa peran `Super Admin`. Modul admin umum tidak membatasi Editor dan Operator secara terpisah.
- Pengelolaan pengguna, profil dan struktur, berita, dosen, dokumen, galeri, pengumuman, kegiatan dan pendaftarnya, artikel, prestasi, kurikulum, alumni, aktivitas, notifikasi, serta pengaturan memakai penyimpanan lokal.
- Pengaturan menyediakan ekspor/impor JSON atas entitas aplikasi dengan prefix `prodihukum_db_v1_`.
- Alur lupa sandi mengubah kata sandi lokal setelah email akun aktif ditemukan. Tidak ada email verifikasi atau pemeriksaan identitas melalui server.

## 3. Peran dan pembatasan aktual

| Peran | Halaman umum admin | `pengguna.html` | `pengaturan.html` |
|---|---|---|---|
| Super Admin | Dapat dibuka setelah login | Diizinkan oleh guard | Diizinkan oleh guard |
| Editor | Dapat dibuka setelah login | Ditolak oleh guard | Ditolak oleh guard |
| Operator | Dapat dibuka setelah login | Ditolak oleh guard | Ditolak oleh guard |

Pembatasan tersebut adalah pemeriksaan sisi klien. Pengguna dapat mengubah JavaScript atau isi `localStorage`; karena itu guard ini bukan otorisasi yang aman untuk deployment produksi.

## 4. Penyimpanan dan model data

Data utama dibaca dan ditulis pada `localStorage` dengan prefix `prodihukum_db_v1_`. Seed dipakai ketika key entitas belum tersedia. IndexedDB (`ProdiHukumDB`, object store `entities`) menerima salinan asinkron secara best-effort dari operasi penyimpanan, tetapi `DB.load()` tidak membaca data dari IndexedDB sebagai fallback. IndexedDB bukan penyimpanan tanpa batas dan tidak membuat data tersedia lintas perangkat.

Entitas yang digunakan aplikasi (18):

| Key | Bentuk | Keterangan |
|---|---|---|
| `berita` | Daftar | Berita; hanya status `Published` ditampilkan/dicari pada publik. |
| `dosen` | Daftar | Data dosen. |
| `dokumen` | Daftar | Metadata dan, untuk unggahan admin, nama serta data berkas. |
| `galeri` | Daftar | Foto dan nama album. |
| `pengumuman` | Daftar | Pengumuman akademik dan status. |
| `kegiatan` | Daftar | Agenda kegiatan. |
| `pendaftar` | Daftar | Pendaftaran; mengandung `kegiatanId` yang dipakai aplikasi untuk mengaitkannya dengan kegiatan. |
| `pesan` | Daftar | Pesan formulir kontak dan status dibaca. |
| `artikel` | Daftar | Artikel; hanya status `Published` ditampilkan/dicari pada publik. |
| `prestasi` | Daftar | Prestasi. |
| `kurikulum` | Daftar | Mata kuliah dan semester. |
| `alumni` | Daftar | Profil alumni. |
| `pengguna` | Daftar | Akun dan kredensial prototipe sisi klien. |
| `aktivitas` | Daftar | Aktivitas admin dan event publik. |
| `notifikasi` | Daftar | Notifikasi panel admin. |
| `profil` | Satu objek | Deskripsi, sejarah, visi, misi, tujuan, dan profil program studi. |
| `struktur` | Daftar | Struktur organisasi. |
| `pengaturan` | Satu objek | Branding, kontak, SEO, peta, serta angka mahasiswa. |

Tiga asosiasi diterapkan sebagai lookup aplikasi saja, tanpa foreign-key enforcement, cascade, atau transaksi database:

- `pendaftar.kegiatanId` merujuk secara logis ke `kegiatan.id`; `kegiatanNama` adalah salinan teks, bukan relasi kedua.
- `struktur.dosenId` opsional dicocokkan ke `dosen.id`.
- `kurikulum.kodeDosen` dicocokkan dengan `dosen.kode` untuk menampilkan nama dosen terkini dan mengaitkan mata kuliah pada direktori dosen. Record tanpa kode memakai pencocokan nama ternormalisasi melalui `pengampu`. Ini lookup aplikasi, bukan foreign key.

Relasi dapat tidak cocok atau menjadi yatim setelah record dihapus; sebagian seed struktur juga belum memiliki `dosenId`. Field penulis, pengguna aktivitas, dan teks serupa tidak menjadi relasi entitas.

### Batas penyimpanan

- `DB.load()` memeriksa apakah bentuk teratas data tersimpan sesuai dengan entitas (daftar atau objek). JSON rusak atau bentuk yang tidak sesuai dicatat dan diganti dengan seed entitas tersebut; data lain tidak dihapus.
- Kuota `localStorage` ditentukan browser. Jika penulisan gagal, aplikasi memangkas log aktivitas dan statistik kunjungan yang dibatasi, kemudian mencoba ulang. Data konten entitas lain tidak dihapus untuk memberi ruang.
- Gambar diubah ke JPEG melalui Canvas; ukuran hasil bergantung pada sumber dan opsi kompresi. Ukuran tertentu tidak dijamin.
- Unggahan dokumen menerima ekstensi PDF, DOC, atau DOCX dengan batas berkas masukan 5 MB. Representasi base64 dapat lebih besar; penyimpanan tetap dibatasi kuota browser.
- Event `storage` memperbarui halaman publik dan komponen admin terkait pada tab lain untuk perubahan konten. Semua data hanya tersedia pada origin/profil browser tempat data disimpan; ini bukan sinkronisasi server atau antarperangkat.
- Backup berisi key entitas aplikasi ber-prefix `prodihukum_db_v1_`, tidak mencakup tema, email yang diingat, sesi admin, maupun statistik kunjungan.

### Catatan audit konsistensi (20 Oktober 2026)

Audit kode dan uji browser menemukan bahwa Admin dan halaman publik membaca data entitas konten yang sama dari penyimpanan lokal. Pada profil browser yang diperiksa, kedua halaman menampilkan 11 dosen yang sama. Kurikulum tersimpan berisi 57 mata kuliah dan 154 SKS; jumlah ini menggambarkan data yang diperiksa, bukan nilai tetap atau validasi untuk semua profil browser.

Temuan data dan perilaku yang perlu diperhitungkan:

1. Tiga record seed struktur organisasi memakai nama lama dan tidak memiliki `dosenId` yang merujuk roster dosen terkini. Pemilihan dan penyimpanan relasi dosen berdasarkan ID didukung oleh Admin, tetapi seed/record lama belum otomatis ditautkan.
2. Ringkasan beban studi halaman Profil dihitung dari entitas `kurikulum`, sehingga mengikuti perubahan mata kuliah dan SKS.
3. Tombol Import di Admin Kurikulum masih simulasi. Ekspor Admin mengunduh CSV sesuai hasil pencarian dan filter yang aktif; ekspor CSV di halaman publik merupakan fungsi terpisah.
4. Nilai jumlah mahasiswa aktif disimpan manual dalam objek `pengaturan`; tidak ada tabel/entitas daftar mahasiswa untuk menghitungnya.
5. Pengampu yang kosong di sumber kurikulum tetap kosong di Admin dan publik, dengan label bahwa pengampu tidak tercantum. Data tidak dilengkapi dari sumber lain.
6. Berita dan artikel yang ditampilkan/dicari di sisi publik difilter berdasarkan status `Published`.

Penyapuan browser pada 36 URL menemukan halaman dapat dimuat tanpa JavaScript runtime error di lingkungan audit. Pemeriksaan tersebut tidak menguji seluruh operasi CRUD, semua browser, kegagalan kuota penyimpanan, ataupun keamanan produksi.

## 5. Berkas HTML

Ada 36 berkas HTML: 18 halaman publik dan 18 berkas di `admin/`. `admin/activity.html` adalah redirect HTML lama ke `aktivitas.html`; 17 file admin lainnya merupakan halaman panel.

**Publik:** `index.html`, `profil.html`, `dosen.html`, `kurikulum.html`, `berita.html`, `pengumuman.html`, `kegiatan.html`, `artikel.html`, `prestasi.html`, `alumni.html`, `galeri.html`, `dokumen.html`, `kontak.html`, `detail-berita.html`, `detail-pengumuman.html`, `detail-kegiatan.html`, `detail-artikel.html`, `detail-galeri.html`.

**Admin:** `login.html`, `lupa-sandi.html`, `dashboard.html`, `profil-prodi.html`, `dosen.html`, `kurikulum.html`, `berita.html`, `pengumuman.html`, `kegiatan.html`, `prestasi.html`, `artikel.html`, `galeri.html`, `dokumen.html`, `alumni.html`, `pengguna.html`, `aktivitas.html`, `pengaturan.html`, `activity.html` (redirect).

## 6. Keamanan dan penggunaan

Kata sandi akun demo disimpan sebagai teks biasa di penyimpanan browser. Login, reset kata sandi, sesi, dan role guard seluruhnya sisi klien dan dapat dimodifikasi pengguna browser. Gunakan hanya sebagai prototipe/presentasi dengan data uji. Deployment produksi memerlukan backend, penyimpanan server, password hashing, validasi dan otorisasi server, serta alur pemulihan akun terverifikasi.

## 7. Pemetaan dokumentasi diagram

Sumber diagram Mermaid yang diperbarui sesuai perilaku di atas berada pada [`diagrams/`](diagrams/). Ekspor Draw.io di [`diagrams/drawio/`](diagrams/drawio/) tersedia untuk sembilan sumber Mermaid, termasuk berkas gabungan `all-diagrams.drawio.xml`. Ekspor XML bersifat statis dan tidak tersinkron otomatis; gunakan Mermaid sebagai acuan utama dan buat ulang ekspor jika sumber berubah.
