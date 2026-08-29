# Catatan Perbaikan — v7

Dokumen ini merangkum perbaikan terhadap `prodi-hukum-website-final-v6-fixed.zip`,
menindaklanjuti error `QuotaExceededError` saat menyimpan data dosen dan permintaan
audit menyeluruh terhadap Admin Panel untuk elemen yang masih statis.

## 1. Akar masalah `QuotaExceededError` (bug yang dilaporkan)

**Penyebab:** foto yang diunggah di form Dosen/Berita/Artikel dibaca dengan
`FileReader.readAsDataURL()` dan disimpan **langsung dalam resolusi asli** sebagai
base64 ke `localStorage`. Foto dari HP modern bisa beberapa MB per file, sementara
kuota `localStorage` per origin di browser umumnya hanya ~5–10MB **untuk seluruh
data situs**. Beberapa foto beresolusi asli sudah cukup untuk menghabiskan kuota,
persis seperti pada pesan error `prodihukum_db_v1_dosen exceeded the quota`. Kode
lama juga hanya melakukan `console.error(...)` saat gagal simpan, sehingga
pengguna tidak melihat pesan kesalahan apapun (gagal senyap).

**Perbaikan:**
- Ditambahkan `compressImageFile()` di `assets/js/app.js`: memperkecil dimensi
  gambar dan mengonversinya ke JPEG terkompresi lewat `<canvas>` sebelum diubah
  jadi data URL. Dipakai konsisten di **semua** modul yang punya upload gambar:
  Dosen, Berita, Artikel, Galeri, dan Struktur Organisasi (baru).
- `DB.save()` sekarang menampilkan `NeuAlert.error(...)` yang jelas ke pengguna
  setiap kali penyimpanan gagal (termasuk pesan khusus saat kuota penuh), bukan
  hanya mencatat ke console. Ini berlaku otomatis untuk **seluruh entitas**
  (dosen, berita, artikel, galeri, alumni, dokumen, kegiatan, kurikulum,
  pengguna, pengumuman, prestasi, profil, pengaturan, struktur), karena
  diperbaiki di satu tempat terpusat.
- Semua `save()`/`remove()` di modul admin sekarang memeriksa hasil `persist()`
  dan membatalkan perubahan di memori (rollback) bila penyimpanan gagal, supaya
  tampilan admin tidak "berbohong" seolah data tersimpan padahal gagal.

## 2. Modul yang sebelumnya statis, sekarang dinamis

- **Galeri (Admin):** sebelumnya form "Upload Foto" **tidak benar-benar memakai
  file yang dipilih** — selalu mengganti dengan gambar placeholder apapun file-nya.
  Sekarang benar-benar mengunggah & mengompres file yang dipilih, dengan pratinjau.
- **Dashboard → Statistik Konten (grafik tren):** sebelumnya array angka hardcode
  ("data ilustrasi"). Sekarang dihitung dari tanggal riil pada data
  Berita/Artikel/Kegiatan.
- **Dashboard → Statistik Pengunjung:** sebelumnya angka hardcode (125 / 3.250 /
  25.420 dan grafik mingguan tetap). Sekarang dicatat riil: setiap kunjungan ke
  halaman publik dicatat ke `localStorage` (`trackPageView()`), dan Dashboard
  menampilkan angka riil tsb — dengan label jujur "kunjungan pada
  perangkat/browser ini", karena prototipe ini tidak punya server analitik.
- **Beranda (index.html) — angka statistik hero & grid:** sebelumnya ditulis
  manual di HTML ("25+ Dosen", "500+ Alumni", "20+ Mata Kuliah", dst) dan
  **tidak cocok** dengan jumlah data sesungguhnya (mis. data dosen hanya 6, bukan
  25; alumni hanya 4, bukan 500). Sekarang seluruhnya dihitung otomatis dari
  SAMPLE_* via fungsi baru `homeStats()`, sehingga selalu konsisten dengan data
  yang dikelola di Admin Panel.
- **Jumlah Mahasiswa Aktif:** sebelumnya konstanta tersembunyi di kode
  (`DASHBOARD_TOTAL_MAHASISWA`), tidak bisa diubah dari Admin Panel. Sekarang
  jadi field yang bisa diedit di Admin → Pengaturan.
- **Profil Lulusan (profil.html):** sebelumnya 4 kartu hardcode, tidak terhubung
  ke data apapun. Sekarang diturunkan otomatis dari field "Profil Lulusan" yang
  diisi Super Admin di Admin → Profil Prodi (dipisah tanda koma).
- **Struktur Organisasi (profil.html):** sebelumnya 3 kartu (nama, jabatan, foto)
  hardcode, tidak bisa diubah dari Admin Panel sama sekali. Sekarang punya modul
  CRUD sendiri di Admin → Profil Prodi (tambah/ubah/hapus, dengan foto yang
  dikompres otomatis) dan tampil dinamis di halaman publik.
- **Backup Database (Admin → Pengaturan):** sebelumnya tombol ini menampilkan
  pesan "berhasil" tanpa melakukan apapun. Sekarang benar-benar mengekspor
  seluruh data sistem sebagai file `.json` yang diunduh.

## 3. Batasan yang diketahui (transparansi, belum berubah dari v6)

- Ini tetap prototipe **front-end only**: "backend" berupa `localStorage`
  per-browser/per-perangkat, bukan basis data multi-pengguna/multi-perangkat.
  Statistik pengunjung yang sekarang riil pun hanya mencatat kunjungan pada
  browser yang sama, bukan seluruh pengunjung situs secara global.
- Tombol unduh dokumen/kurikulum masih simulasi (tidak ada penyimpanan file
  sungguhan di server), sesuai keterbatasan yang sudah didokumentasikan di v6.
- Unggah Logo/Favicon di Admin → Pengaturan belum aktif (kini diberi keterangan
  eksplisit di UI, bukan lagi kotak unggah yang terlihat berfungsi padahal tidak).

## 4. Cara membangun ulang CSS Tailwind (tidak berubah)

```bash
npm install
npx tailwindcss -i ./tailwind.input.css -o ./assets/css/tailwind.min.css --minify
```
