/* =========================================================
   WEBSITE PROGRAM STUDI HUKUM — SHARED APP LOGIC
   Dark mode, SweetAlert2, Alpine.js modules, sample data
   ========================================================= */

(function initTheme() {
  const saved = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (saved === 'dark' || (!saved && prefersDark)) {
    document.documentElement.classList.add('dark');
  }
})();

function themeStore() {
  return {
    dark: document.documentElement.classList.contains('dark'),
    toggle() {
      this.dark = !this.dark;
      document.documentElement.classList.toggle('dark', this.dark);
      localStorage.setItem('theme', this.dark ? 'dark' : 'light');
    }
  };
}

const NeuAlert = {
  base(options) {
    return Swal.fire({
      background: document.documentElement.classList.contains('dark') ? '#141D30' : '#E8ECF1',
      color: document.documentElement.classList.contains('dark') ? '#E7EBF2' : '#1B2430',
      confirmButtonColor: '#2A4E9E',
      cancelButtonColor: '#5B6472',
      customClass: { popup: 'rounded-3xl' },
      ...options
    });
  },
  success(msg = 'Data berhasil disimpan.') {
    return this.base({ icon: 'success', title: 'Berhasil', text: msg, timer: 2200, showConfirmButton: false });
  },
  updated(msg = 'Data berhasil diperbarui.') {
    return this.base({ icon: 'success', title: 'Berhasil', text: msg, timer: 2200, showConfirmButton: false });
  },
  deleted(msg = 'Data berhasil dihapus.') {
    return this.base({ icon: 'success', title: 'Terhapus', text: msg, timer: 2200, showConfirmButton: false });
  },
  error(msg = 'Terjadi kesalahan. Silakan coba lagi.') {
    return this.base({ icon: 'error', title: 'Gagal', text: msg });
  },
  async confirmDelete(itemLabel = 'data ini') {
    const res = await this.base({
      icon: 'warning',
      title: 'Hapus data?',
      text: `Apakah Anda yakin ingin menghapus ${itemLabel}?`,
      showCancelButton: true,
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal',
      reverseButtons: true
    });
    return res.isConfirmed;
  },
  async confirmLogout() {
    const res = await this.base({
      icon: 'question',
      title: 'Keluar dari akun?',
      text: 'Apakah Anda yakin ingin keluar?',
      showCancelButton: true,
      confirmButtonText: 'Ya, Keluar',
      cancelButtonText: 'Batal',
      reverseButtons: true
    });
    return res.isConfirmed;
  },
  sent(msg = 'Pesan berhasil dikirim.') {
    return this.base({ icon: 'success', title: 'Terkirim', text: msg, timer: 2200, showConfirmButton: false });
  }
};

/* ---- Sample data (prototipe frontend) ---- */
const SAMPLE_BERITA = [
  { id: 1, slug: 'akreditasi-unggul-ban-pt', judul: 'Prodi Hukum Raih Akreditasi Unggul dari BAN-PT', kategori: 'Akademik', tanggal: '20 Agu 2026', penulis: 'Humas Prodi', excerpt: 'Program Studi Hukum berhasil mempertahankan status akreditasi setelah melalui proses asesmen lapangan yang ketat oleh tim asesor BAN-PT.', featured: true },
  { id: 2, slug: 'seminar-hukum-digital', judul: 'Seminar Nasional "Hukum di Era Digital" Digelar Serentak', kategori: 'Seminar', tanggal: '18 Agu 2026', penulis: 'Panitia Seminar', excerpt: 'Seminar menghadirkan praktisi dan akademisi membahas regulasi digital dan perlindungan data pribadi.', featured: false },
  { id: 3, slug: 'juara-moot-court', judul: 'Mahasiswa Hukum Raih Juara Moot Court Nasional', kategori: 'Kemahasiswaan', tanggal: '12 Agu 2026', penulis: 'Humas Prodi', excerpt: 'Tim moot court prodi meraih juara umum dalam kompetisi simulasi persidangan tingkat nasional.', featured: false },
  { id: 4, slug: 'riset-hukum-adat', judul: 'Dosen Hukum Publikasikan Riset Hukum Adat Papua', kategori: 'Penelitian', tanggal: '05 Agu 2026', penulis: 'Tim Penelitian', excerpt: 'Penelitian kolaboratif mengkaji harmonisasi hukum adat dan hukum positif di Papua.', featured: false },
  { id: 5, slug: 'penyuluhan-kampung-yobe', judul: 'Prodi Hukum Gelar Penyuluhan Hukum di Kampung Yobe', kategori: 'Pengabdian', tanggal: '29 Jul 2026', penulis: 'Tim PKM', excerpt: 'Kegiatan pengabdian memberikan edukasi hukum dasar kepada masyarakat sekitar kampus.', featured: false },
  { id: 6, slug: 'kunjungan-pengadilan', judul: 'Kunjungan Studi ke Pengadilan Negeri Jayapura', kategori: 'Kegiatan', tanggal: '22 Jul 2026', penulis: 'Humas Prodi', excerpt: 'Mahasiswa semester IV mengikuti observasi sidang dan diskusi dengan hakim pengadilan negeri.', featured: false }
];

const SAMPLE_DOSEN = [
  { id: 1, nama: 'Dr. Ahmad Fauzi, S.H., M.H.', jabatan: 'Lektor Kepala', keahlian: 'Hukum Pidana', pendidikan: 'S3 Ilmu Hukum', email: 'ahmad.fauzi@ump.ac.id', nidn: '1234567890', profil: 'Dosen dengan pengalaman praktik hukum pidana dan penelitian sistem peradilan.' },
  { id: 2, nama: 'Rina Marlina, S.H., M.H.', jabatan: 'Lektor', keahlian: 'Hukum Perdata', pendidikan: 'S2 Kenotariatan', email: 'rina.marlina@ump.ac.id', nidn: '1234567891', profil: 'Spesialis hukum kontrak dan praktik kenotariatan.' },
  { id: 3, nama: 'Yusuf Kamal, S.H., M.Kn.', jabatan: 'Lektor', keahlian: 'Hukum Tata Negara', pendidikan: 'S2 Hukum', email: 'yusuf.kamal@ump.ac.id', nidn: '1234567892', profil: 'Fokus pada studi konstitusi dan otonomi daerah.' },
  { id: 4, nama: 'Dr. Siti Aminah, S.H., M.H.', jabatan: 'Profesor', keahlian: 'Hukum Internasional', pendidikan: 'S3 Ilmu Hukum', email: 'siti.aminah@ump.ac.id', nidn: '1234567893', profil: 'Peneliti hukum internasional dan hubungan bilateral.' },
  { id: 5, nama: 'Bayu Segara, S.H., M.H.', jabatan: 'Asisten Ahli', keahlian: 'Hukum Adat', pendidikan: 'S2 Hukum', email: 'bayu.segara@ump.ac.id', nidn: '1234567894', profil: 'Mengkaji hukum adat Papua dan resolusi konflik lokal.' },
  { id: 6, nama: 'Maria Kabes, S.H., M.H.', jabatan: 'Dosen', keahlian: 'Hukum Administrasi Negara', pendidikan: 'S2 Hukum', email: 'maria.kabes@ump.ac.id', nidn: '1234567895', profil: 'Praktisi dan pengajar hukum administrasi pemerintahan.' }
];

const SAMPLE_DOKUMEN = [
  { id: 1, nama: 'Panduan Akademik 2026/2027', kategori: 'Pedoman Akademik', format: 'PDF', ukuran: '2.4 MB' },
  { id: 2, nama: 'Buku Kurikulum Prodi Hukum', kategori: 'Kurikulum', format: 'PDF', ukuran: '3.1 MB' },
  { id: 3, nama: 'Formulir Pengajuan Judul Skripsi', kategori: 'Formulir', format: 'DOCX', ukuran: '180 KB' },
  { id: 4, nama: 'SOP Bimbingan Skripsi', kategori: 'SOP', format: 'PDF', ukuran: '540 KB' },
  { id: 5, nama: 'Sertifikat Akreditasi BAN-PT', kategori: 'Akreditasi', format: 'PDF', ukuran: '1.1 MB' },
  { id: 6, nama: 'Kalender Akademik 2026/2027', kategori: 'Dokumen Publik', format: 'PDF', ukuran: '620 KB' }
];

const SAMPLE_GALERI = [
  { id: 1, judul: 'Seminar Nasional 2026', album: 'Seminar', src: 'https://placehold.co/360x380/EEF1F5/0B1F3A?text=Seminar' },
  { id: 2, judul: 'Kuliah Umum Hukum Adat', album: 'Kuliah Umum', src: 'https://placehold.co/360x280/EEF1F5/0B1F3A?text=Kuliah+Umum' },
  { id: 3, judul: 'Wisuda Sarjana Hukum XXI', album: 'Wisuda', src: 'https://placehold.co/360x280/EEF1F5/0B1F3A?text=Wisuda' },
  { id: 4, judul: 'Bakti Sosial Kampung Yobe', album: 'Pengabdian', src: 'https://placehold.co/360x380/EEF1F5/0B1F3A?text=Pengabdian' },
  { id: 5, judul: 'Moot Court Competition', album: 'Kegiatan Mahasiswa', src: 'https://placehold.co/360x280/EEF1F5/0B1F3A?text=Moot+Court' },
  { id: 6, judul: 'Praktik Peradilan Semu', album: 'Praktikum', src: 'https://placehold.co/360x280/EEF1F5/0B1F3A?text=Praktikum' },
  { id: 7, judul: 'Riset Hukum Adat Papua', album: 'Penelitian', src: 'https://placehold.co/360x380/EEF1F5/0B1F3A?text=Penelitian' },
  { id: 8, judul: 'Workshop Legal Drafting', album: 'Seminar', src: 'https://placehold.co/360x280/EEF1F5/0B1F3A?text=Workshop' }
];

function globalSearch(query) {
  const q = (query || '').trim().toLowerCase();
  if (!q) {
    NeuAlert.error('Masukkan kata kunci pencarian.');
    return;
  }
  const results = SEARCH_INDEX.filter(item =>
    item.title.toLowerCase().includes(q) ||
    item.keywords.toLowerCase().includes(q) ||
    item.type.toLowerCase().includes(q)
  );
  if (results.length === 0) {
    NeuAlert.error('Data yang Anda cari tidak ditemukan.');
    return;
  }
  window.location.href = results[0].url;
}

function siteHeader() {
  return {
    mobileOpen: false,
    searchQ: '',
    ...themeStore(),
    doSearch() {
      globalSearch(this.searchQ);
    }
  };
}

function adminShell() {
  return {
    sidebarOpen: false,
    alwaysOpen: window.innerWidth >= 1024,
    ...themeStore(),
    logout() {
      NeuAlert.confirmLogout().then(ok => {
        if (ok) window.location.href = 'login.html';
      });
    }
  };
}

function contactForm() {
  return {
    loading: false,
    form: { nama: '', email: '', subjek: '', pesan: '' },
    async submit() {
      if (!this.form.nama || !this.form.email || !this.form.pesan) {
        NeuAlert.error('Mohon lengkapi Nama, Email, dan Pesan.');
        return;
      }
      this.loading = true;
      await new Promise(r => setTimeout(r, 700));
      this.loading = false;
      NeuAlert.sent();
      this.form = { nama: '', email: '', subjek: '', pesan: '' };
    }
  };
}

function filterableGrid(items, options = {}) {
  const {
    searchKeys = ['nama'],
    filterKey = 'kategori',
    filters = ['Semua']
  } = options;
  return {
    q: '',
    activeFilter: 'Semua',
    filters,
    all: items,
    get results() {
      return this.all.filter(item => {
        const matchesFilter = this.activeFilter === 'Semua' || item[filterKey] === this.activeFilter;
        const matchesSearch = this.q.trim() === '' || searchKeys.some(k =>
          String(item[k] || '').toLowerCase().includes(this.q.toLowerCase())
        );
        return matchesFilter && matchesSearch;
      });
    },
    setFilter(f) {
      this.activeFilter = f;
    },
    isActive(f) {
      return this.activeFilter === f;
    }
  };
}

function dosenPage() {
  const jabatanFilters = ['Semua', 'Profesor', 'Lektor Kepala', 'Lektor', 'Asisten Ahli', 'Dosen'];
  return {
    ...filterableGrid(SAMPLE_DOSEN, { searchKeys: ['nama', 'keahlian'], filterKey: 'jabatan', filters: jabatanFilters }),
    showDetail: false,
    selected: null,
    openDetail(d) {
      this.selected = d;
      this.showDetail = true;
    },
    closeDetail() {
      this.showDetail = false;
      this.selected = null;
    }
  };
}

function beritaPage() {
  const kategoriFilters = ['Semua', 'Akademik', 'Kemahasiswaan', 'Penelitian', 'Pengabdian', 'Prestasi', 'Seminar', 'Kegiatan'];
  const base = filterableGrid(SAMPLE_BERITA, { searchKeys: ['judul', 'kategori'], filterKey: 'kategori', filters: kategoriFilters });
  return {
    ...base,
    get featured() {
      return SAMPLE_BERITA.find(b => b.featured) || SAMPLE_BERITA[0];
    },
    detailUrl(id) {
      return `detail-berita.html?id=${id}`;
    }
  };
}

function dokumenPage() {
  const kategoriFilters = ['Semua', 'Pedoman Akademik', 'Kurikulum', 'Formulir', 'Peraturan', 'SOP', 'Panduan', 'Akreditasi', 'Dokumen Publik'];
  return {
    ...filterableGrid(SAMPLE_DOKUMEN, { searchKeys: ['nama', 'kategori'], filterKey: 'kategori', filters: kategoriFilters }),
    download(doc) {
      NeuAlert.success(`Unduhan "${doc.nama}" dimulai (simulasi).`);
    }
  };
}

function galeriPage() {
  const albumFilters = ['Semua', 'Seminar', 'Kuliah Umum', 'Praktikum', 'Kegiatan Mahasiswa', 'Wisuda', 'Pengabdian', 'Penelitian'];
  return {
    ...filterableGrid(SAMPLE_GALERI, { searchKeys: ['judul', 'album'], filterKey: 'album', filters: albumFilters }),
    lightbox: null,
    detailUrl(id) {
      return `detail-galeri.html?id=${id}`;
    },
    openLightbox(item) {
      this.lightbox = item;
    },
    closeLightbox() {
      this.lightbox = null;
    }
  };
}

function detailFromQuery(items, param = 'id') {
  const id = Number(new URLSearchParams(window.location.search).get(param));
  return items.find(x => x.id === id) || items[0];
}

function detailBeritaPage() {
  const item = detailFromQuery(SAMPLE_BERITA);
  return {
    item,
    related: SAMPLE_BERITA.filter(b => b.id !== item.id).slice(0, 3)
  };
}

function detailContentPage(items, param = 'id') {
  const defaults = {
    1: items[0],
    2: items[1],
    3: items[2],
    4: items[3]
  };
  const id = Number(new URLSearchParams(window.location.search).get(param));
  return { item: items.find(x => x.id === id) || defaults[id] || items[0] };
}

const SAMPLE_PENGUMUMAN = [
  { id: 1, judul: 'Jadwal Seminar Proposal Skripsi Semester Ganjil 2026/2027', status: 'Penting', badge: 'badge-important', tanggal: '25 Agu 2026', isi: 'Pendaftaran seminar proposal dibuka mulai 1 September 2026 melalui portal akademik. Mahasiswa wajib melengkapi berkas sesuai panduan prodi.', lampiran: 'Jadwal-Seminar-Proposal.pdf' },
  { id: 2, judul: 'Pembaruan Panduan Penulisan Skripsi Prodi Hukum', status: 'Baru', badge: 'badge-new', tanggal: '22 Agu 2026', isi: 'Panduan terbaru dapat diunduh pada menu Dokumen » Panduan Akademik. Perubahan utama meliputi format sitasi dan struktur bab.', lampiran: 'Panduan-Skripsi-2026.pdf' },
  { id: 3, judul: 'Pendaftaran Program Magang Semester Ganjil', status: 'Aktif', badge: 'badge-active', tanggal: '18 Agu 2026', isi: 'Mahasiswa semester 6 ke atas dapat mendaftar magang di mitra kerja sama prodi hingga 30 September 2026.', lampiran: null },
  { id: 4, judul: 'Pendaftaran Beasiswa PPA Tahap I', status: 'Berakhir', badge: 'badge-ended', tanggal: '01 Jul 2026', isi: 'Periode pendaftaran beasiswa PPA tahap pertama telah ditutup. Pengumuman seleksi akan diinformasikan melalui email resmi kampus.', lampiran: null }
];

const SAMPLE_KEGIATAN = [
  { id: 1, nama: 'Seminar Nasional Hukum Digital', tanggal: '28 Agu 2026', hari: '28', bulan: 'Agu', waktu: '09.00 – 12.00', lokasi: 'Aula Fakultas Hukum', penyelenggara: 'Program Studi Hukum UMP', deskripsi: 'Membahas transformasi hukum di era digital bersama praktisi dan akademisi nasional.' },
  { id: 2, nama: 'Kuliah Umum Hukum Adat Papua', tanggal: '30 Agu 2026', hari: '30', bulan: 'Agu', waktu: '13.00 – 15.00', lokasi: 'Ruang Sidang Utama', penyelenggara: 'Program Studi Hukum UMP', deskripsi: 'Menghadirkan tokoh adat dan akademisi hukum adat sebagai narasumber.' },
  { id: 3, nama: 'Workshop Legal Drafting', tanggal: '05 Sep 2026', hari: '05', bulan: 'Sep', waktu: '09.00 – 16.00', lokasi: 'Laboratorium Hukum', penyelenggara: 'Laboratorium Hukum', deskripsi: 'Pelatihan penyusunan dokumen hukum untuk mahasiswa semester akhir.' },
  { id: 4, nama: 'Pengabdian Masyarakat: Penyuluhan Hukum', tanggal: '12 Sep 2026', hari: '12', bulan: 'Sep', waktu: '08.00 – selesai', lokasi: 'Kampung Yobe, Jayapura', penyelenggara: 'Tim PKM Prodi Hukum', deskripsi: 'Penyuluhan hukum dasar bagi masyarakat sekitar kampus.' }
];

const SAMPLE_ARTIKEL = [
  { id: 1, judul: 'Restorative Justice dalam Sistem Peradilan Pidana Indonesia', penulis: 'Dr. Ahmad Fauzi, S.H., M.H.', kategori: 'Hukum Pidana', tanggal: '15 Agu 2026', isi: 'Kajian ini menelaah penerapan restorative justice dalam sistem peradilan pidana Indonesia serta implikasinya bagi korban dan pelaku.', referensi: 'KUHP; UU No. 11 Tahun 2012 tentang Sistem Peradilan Pidana Anak.' },
  { id: 2, judul: 'Eksistensi Hukum Adat Papua dalam Sistem Hukum Nasional', penulis: 'Bayu Segara, S.H., M.H.', kategori: 'Hukum Adat', tanggal: '12 Agu 2026', isi: 'Artikel membahas kedudukan hukum adat Papua dalam kerangka hukum nasional dan praktik penyelesaian sengketa adat.', referensi: 'UUD 1945 Pasal 18B ayat (2).' },
  { id: 3, judul: 'Perlindungan Hukum bagi UMKM di Era Ekonomi Digital', penulis: 'Rina Marlina, S.H., M.H.', kategori: 'Hukum Bisnis', tanggal: '10 Agu 2026', isi: 'Studi perlindungan pelaku UMKM pada transaksi digital, termasuk kontrak elektronik dan perlindungan konsumen.', referensi: 'UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi.' },
  { id: 4, judul: 'Dinamika Otonomi Khusus Papua Pasca Revisi UU', penulis: 'Yusuf Kamal, S.H., M.Kn.', kategori: 'Hukum Tata Negara', tanggal: '05 Agu 2026', isi: 'Analisis implikasi revisi undang-undang otonomi khusus terhadap tata kelola pemerintahan daerah di Papua.', referensi: 'UU Otonomi Khusus Papua beserta perubahannya.' }
];

const SAMPLE_PRESTASI = [
  { id: 1, nama: 'Juara 1 Moot Court Competition Nasional 2026', kategori: 'Mahasiswa', tingkat: 'Nasional', tahun: '2026' },
  { id: 2, nama: 'Juara 2 Debat Konstitusi Wilayah Papua', kategori: 'Mahasiswa', tingkat: 'Regional', tahun: '2026' },
  { id: 3, nama: 'Best Paper Award, Konferensi Hukum Internasional', kategori: 'Dosen', tingkat: 'Internasional', tahun: '2025' },
  { id: 4, nama: 'Terpilih sebagai Hakim Ad Hoc Pengadilan Tipikor', kategori: 'Alumni', tingkat: 'Nasional', tahun: '2025' },
  { id: 5, nama: 'Peringkat Terbaik Prodi Hukum se-Papua', kategori: 'Program Studi', tingkat: 'Provinsi', tahun: '2025' },
  { id: 6, nama: 'Juara 3 Lomba Karya Tulis Ilmiah Hukum', kategori: 'Mahasiswa', tingkat: 'Nasional', tahun: '2024' }
];

const SAMPLE_KURIKULUM = [
  { id: 1, kode: 'HK101', nama: 'Pengantar Ilmu Hukum', sks: 3, jenis: 'Wajib', semester: 1 },
  { id: 2, kode: 'HK102', nama: 'Pengantar Hukum Indonesia', sks: 3, jenis: 'Wajib', semester: 1 },
  { id: 3, kode: 'HK103', nama: 'Ilmu Negara', sks: 2, jenis: 'Wajib', semester: 1 },
  { id: 4, kode: 'HK104', nama: 'Bahasa Indonesia Hukum', sks: 2, jenis: 'Wajib', semester: 1 },
  { id: 5, kode: 'HK201', nama: 'Hukum Pidana I', sks: 3, jenis: 'Wajib', semester: 2 },
  { id: 6, kode: 'HK202', nama: 'Hukum Perdata I', sks: 3, jenis: 'Wajib', semester: 2 },
  { id: 7, kode: 'HK203', nama: 'Hukum Tata Negara', sks: 3, jenis: 'Wajib', semester: 2 },
  { id: 8, kode: 'HK301', nama: 'Hukum Acara Pidana', sks: 3, jenis: 'Wajib', semester: 3 },
  { id: 9, kode: 'HK401', nama: 'Hukum Adat', sks: 2, jenis: 'Wajib', semester: 4 },
  { id: 10, kode: 'HK501', nama: 'Klinik Hukum', sks: 2, jenis: 'Pilihan', semester: 5 }
];

const SAMPLE_ALUMNI = [
  { id: 1, nama: 'Fadli Ramadhan, S.H.', angkatan: '2020', pekerjaan: 'Advokat', instansi: 'Kantor Hukum Fadli & Rekan' },
  { id: 2, nama: 'Melinda Kogoya, S.H.', angkatan: '2019', pekerjaan: 'Legal Officer', instansi: 'PT Papua Sejahtera' },
  { id: 3, nama: 'Yohanes Sroyer, S.H.', angkatan: '2018', pekerjaan: 'Aparatur Sipil Negara', instansi: 'Kejaksaan Negeri Jayapura' },
  { id: 4, nama: 'Sari Wulandari, S.H.', angkatan: '2021', pekerjaan: 'Magister Hukum', instansi: 'Universitas Gadjah Mada' }
];

const SEARCH_INDEX = [
  ...SAMPLE_BERITA.map(b => ({ title: b.judul, url: `detail-berita.html?id=${b.id}`, type: 'Berita', keywords: `${b.judul} ${b.kategori}` })),
  ...SAMPLE_DOSEN.map(d => ({ title: d.nama, url: 'dosen.html', type: 'Dosen', keywords: `${d.nama} ${d.keahlian} ${d.jabatan}` })),
  ...SAMPLE_DOKUMEN.map(d => ({ title: d.nama, url: 'dokumen.html', type: 'Dokumen', keywords: `${d.nama} ${d.kategori}` })),
  ...SAMPLE_KEGIATAN.map(k => ({ title: k.nama, url: `detail-kegiatan.html?id=${k.id}`, type: 'Kegiatan', keywords: `${k.nama} ${k.lokasi}` })),
  ...SAMPLE_PENGUMUMAN.map(p => ({ title: p.judul, url: `detail-pengumuman.html?id=${p.id}`, type: 'Pengumuman', keywords: `${p.judul} ${p.status}` })),
  ...SAMPLE_ARTIKEL.map(a => ({ title: a.judul, url: `detail-artikel.html?id=${a.id}`, type: 'Artikel', keywords: `${a.judul} ${a.kategori} ${a.penulis}` }))
];

function registerKegiatan() {
  NeuAlert.sent('Pendaftaran kegiatan berhasil dikirim (simulasi).');
}

function pengumumanPage() {
  return {
    items: SAMPLE_PENGUMUMAN,
    detailUrl(id) {
      return `detail-pengumuman.html?id=${id}`;
    }
  };
}

function kegiatanPage() {
  return {
    items: SAMPLE_KEGIATAN,
    detailUrl(id) {
      return `detail-kegiatan.html?id=${id}`;
    },
    daftar() {
      registerKegiatan();
    }
  };
}

function artikelPage() {
  const filters = ['Semua', 'Hukum Pidana', 'Hukum Perdata', 'Hukum Tata Negara', 'Hukum Administrasi Negara', 'Hukum Internasional', 'Hukum Bisnis', 'Hukum Adat', 'Hukum Teknologi'];
  return {
    ...filterableGrid(SAMPLE_ARTIKEL, { searchKeys: ['judul', 'kategori', 'penulis'], filterKey: 'kategori', filters }),
    detailUrl(id) {
      return `detail-artikel.html?id=${id}`;
    }
  };
}

function prestasiPage() {
  const filters = ['Semua', 'Mahasiswa', 'Dosen', 'Alumni', 'Program Studi'];
  return filterableGrid(SAMPLE_PRESTASI, { searchKeys: ['nama', 'kategori'], filterKey: 'kategori', filters });
}

function kurikulumPage() {
  return {
    semester: 1,
    all: SAMPLE_KURIKULUM,
    get results() {
      return this.all.filter(m => m.semester === this.semester);
    },
    download() {
      NeuAlert.success('Unduhan kurikulum dimulai (simulasi).');
    }
  };
}

function detailPengumumanPage() {
  return {
    item: detailFromQuery(SAMPLE_PENGUMUMAN),
    download() {
      if (!this.item.lampiran) {
        NeuAlert.error('Lampiran tidak tersedia.');
        return;
      }
      NeuAlert.success(`Unduhan "${this.item.lampiran}" dimulai (simulasi).`);
    }
  };
}

function detailKegiatanPage() {
  return {
    item: detailFromQuery(SAMPLE_KEGIATAN),
    daftar() {
      registerKegiatan();
    }
  };
}

function detailArtikelPage() {
  const item = detailFromQuery(SAMPLE_ARTIKEL);
  return {
    item,
    related: SAMPLE_ARTIKEL.filter(a => a.id !== item.id).slice(0, 3),
    share() {
      NeuAlert.success('Tautan artikel disalin (simulasi).');
    }
  };
}

function detailGaleriPage() {
  const item = detailFromQuery(SAMPLE_GALERI);
  return {
    item,
    album: SAMPLE_GALERI.filter(g => g.album === item.album)
  };
}

function adminCrudTable(config) {
  return {
    showModal: false,
    editing: null,
    q: '',
    rows: [...config.rows],
    form: { ...config.emptyForm },
    get filtered() {
      const keys = config.searchKeys || ['nama'];
      return this.rows.filter(row =>
        keys.some(k => String(row[k] || '').toLowerCase().includes(this.q.toLowerCase()))
      );
    },
    openAdd() {
      this.editing = null;
      this.form = { ...config.emptyForm };
      this.showModal = true;
    },
    openEdit(row) {
      this.editing = row.id;
      this.form = { ...row };
      this.showModal = true;
    },
    save() {
      if (config.validate && !config.validate(this.form)) return;
      if (this.editing) {
        const idx = this.rows.findIndex(x => x.id === this.editing);
        this.rows[idx] = { ...this.form };
        NeuAlert.updated();
      } else {
        this.form.id = Date.now();
        this.rows.unshift({ ...this.form });
        NeuAlert.success();
      }
      this.showModal = false;
    },
    async remove(row) {
      const ok = await NeuAlert.confirmDelete(config.itemLabel || 'data ini');
      if (ok) {
        this.rows = this.rows.filter(x => x.id !== row.id);
        NeuAlert.deleted();
      }
    }
  };
}
