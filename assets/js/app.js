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

/* =========================================================
   DATA LAYER (DB) — localStorage-backed "backend"
   ---------------------------------------------------------
   Semua entitas (berita, dosen, dokumen, dst) disimpan di
   localStorage supaya perubahan yang dilakukan lewat Admin
   Panel (tambah/edit/hapus) BENAR-BENAR persisten dan selalu
   tampil konsisten & akurat di halaman publik — bukan hanya
   berubah sementara di memori saat itu saja.

   Data bawaan (SEED_*) dipakai sebagai isi awal HANYA pada
   kunjungan pertama (localStorage masih kosong). Setelah itu,
   satu-satunya sumber kebenaran adalah localStorage.
   ========================================================= */
const DB = (() => {
  const NS = 'prodihukum_db_v1_';
  const PLACEHOLDER = 'https://placehold.co/400x240/EEF1F5/0B1F3A?text=Gambar';
  // Data lama (sebelum diperbaiki) mungkin masih menyimpan blob: URL dari
  // URL.createObjectURL, yang sudah pasti mati setelah sesi/reload sebelumnya
  // (menyebabkan net::ERR_FILE_NOT_FOUND saat gambar dimuat). Fungsi ini
  // membersihkan nilai semacam itu secara otomatis & konsisten di semua data.
  function sanitizeBlobUrls(value) {
    if (Array.isArray(value)) return value.map(sanitizeBlobUrls);
    if (value && typeof value === 'object') {
      const out = {};
      for (const k in value) out[k] = sanitizeBlobUrls(value[k]);
      return out;
    }
    if (typeof value === 'string' && value.startsWith('blob:')) return PLACEHOLDER;
    return value;
  }
  function load(key, seed) {
    try {
      const raw = localStorage.getItem(NS + key);
      if (raw !== null) {
        const parsed = sanitizeBlobUrls(JSON.parse(raw));
        save(key, parsed);
        return parsed;
      }
    } catch (e) {
      console.error('DB: gagal membaca data "' + key + '", memuat ulang data bawaan.', e);
    }
    const copy = JSON.parse(JSON.stringify(seed));
    save(key, copy);
    return copy;
  }
  function save(key, data) {
    try {
      localStorage.setItem(NS + key, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error('DB: gagal menyimpan data "' + key + '".', e);
      return false;
    }
  }
  function reset(key, seed) {
    return save(key, JSON.parse(JSON.stringify(seed))) ? load(key, seed) : null;
  }
  function resetAll(seeds) {
    Object.keys(seeds).forEach(key => reset(key, seeds[key]));
  }
  return { load, save, reset, resetAll, NS };
})();

/* ---- Log aktivitas: dicatat otomatis setiap ada aksi CRUD di Admin Panel ---- */
function logActivity(aksi, icon) {
  const entry = {
    id: Date.now(),
    user: AUTH.current().nama,
    aksi,
    waktu: 'Baru saja',
    tanggalIso: new Date().toISOString(),
    icon: icon || '\u{1F4DD}'
  };
  SAMPLE_AKTIVITAS = [entry, ...SAMPLE_AKTIVITAS].slice(0, 50);
  DB.save('aktivitas', SAMPLE_AKTIVITAS);
}

/* =========================================================
   AUTH — sesi admin sederhana berbasis localStorage
   ========================================================= */
const AUTH = (() => {
  const KEY = 'prodihukum_admin_session';
  function login(user) {
    const session = { nama: user.nama, email: user.email, role: user.role, loginAt: new Date().toISOString() };
    localStorage.setItem(KEY, JSON.stringify(session));
    return session;
  }
  function current() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) { /* noop */ }
    return { nama: 'Admin Prodi', email: '', role: 'Super Admin' };
  }
  function isLoggedIn() {
    return localStorage.getItem(KEY) !== null;
  }
  function logout() {
    localStorage.removeItem(KEY);
  }
  // Menjaga agar semua halaman admin (selain login.html) hanya bisa diakses
  // setelah login. Dipanggil dari init() adminShell().
  function guard() {
    const isLoginPage = /login\.html$/.test(window.location.pathname);
    if (!isLoginPage && !isLoggedIn()) {
      window.location.href = 'login.html';
    }
  }
  return { login, current, isLoggedIn, logout, guard };
})();

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
const SEED_BERITA = [
  { id: 1, slug: 'akreditasi-unggul-ban-pt', judul: 'Prodi Hukum Raih Akreditasi Unggul dari BAN-PT', kategori: 'Akademik', tanggal: '20 Agu 2026', penulis: 'Humas Prodi', excerpt: 'Program Studi Hukum berhasil mempertahankan status akreditasi setelah melalui proses asesmen lapangan yang ketat oleh tim asesor BAN-PT.', konten: '', status: 'Published', featured: true, gambar: 'https://placehold.co/400x240/EEF1F5/0B1F3A?text=Berita' },
  { id: 2, slug: 'seminar-hukum-digital', judul: 'Seminar Nasional "Hukum di Era Digital" Digelar Serentak', kategori: 'Seminar', tanggal: '18 Agu 2026', penulis: 'Panitia Seminar', excerpt: 'Seminar menghadirkan praktisi dan akademisi membahas regulasi digital dan perlindungan data pribadi.', konten: '', status: 'Published', featured: false, gambar: 'https://placehold.co/400x240/EEF1F5/0B1F3A?text=Berita' },
  { id: 3, slug: 'juara-moot-court', judul: 'Mahasiswa Hukum Raih Juara Moot Court Nasional', kategori: 'Kemahasiswaan', tanggal: '12 Agu 2026', penulis: 'Humas Prodi', excerpt: 'Tim moot court prodi meraih juara umum dalam kompetisi simulasi persidangan tingkat nasional.', konten: '', status: 'Review', featured: false, gambar: 'https://placehold.co/400x240/EEF1F5/0B1F3A?text=Berita' },
  { id: 4, slug: 'riset-hukum-adat', judul: 'Dosen Hukum Publikasikan Riset Hukum Adat Papua', kategori: 'Penelitian', tanggal: '05 Agu 2026', penulis: 'Tim Penelitian', excerpt: 'Penelitian kolaboratif mengkaji harmonisasi hukum adat dan hukum positif di Papua.', konten: '', status: 'Published', featured: false, gambar: 'https://placehold.co/400x240/EEF1F5/0B1F3A?text=Berita' },
  { id: 5, slug: 'penyuluhan-kampung-yobe', judul: 'Prodi Hukum Gelar Penyuluhan Hukum di Kampung Yobe', kategori: 'Pengabdian', tanggal: '29 Jul 2026', penulis: 'Tim PKM', excerpt: 'Kegiatan pengabdian memberikan edukasi hukum dasar kepada masyarakat sekitar kampus.', konten: '', status: 'Published', featured: false, gambar: 'https://placehold.co/400x240/EEF1F5/0B1F3A?text=Berita' },
  { id: 6, slug: 'kunjungan-pengadilan', judul: 'Kunjungan Studi ke Pengadilan Negeri Jayapura', kategori: 'Kegiatan', tanggal: '22 Jul 2026', penulis: 'Humas Prodi', excerpt: 'Mahasiswa semester IV mengikuti observasi sidang dan diskusi dengan hakim pengadilan negeri.', konten: '', status: 'Draft', featured: false, gambar: 'https://placehold.co/400x240/EEF1F5/0B1F3A?text=Berita' }
];
let SAMPLE_BERITA = DB.load('berita', SEED_BERITA);

const SEED_DOSEN = [
  { id: 1, nama: 'Dr. Ahmad Fauzi, S.H., M.H.', jabatan: 'Lektor Kepala', keahlian: 'Hukum Pidana', pendidikan: 'S3 Ilmu Hukum', email: 'ahmad.fauzi@ump.ac.id', nidn: '1234567890', profil: 'Dosen dengan pengalaman praktik hukum pidana dan penelitian sistem peradilan.', status: 'Aktif', foto: 'https://placehold.co/300x300/EEF1F5/0B1F3A?text=Foto+Dosen' },
  { id: 2, nama: 'Rina Marlina, S.H., M.H.', jabatan: 'Lektor', keahlian: 'Hukum Perdata', pendidikan: 'S2 Kenotariatan', email: 'rina.marlina@ump.ac.id', nidn: '1234567891', profil: 'Spesialis hukum kontrak dan praktik kenotariatan.', status: 'Aktif', foto: 'https://placehold.co/300x300/EEF1F5/0B1F3A?text=Foto+Dosen' },
  { id: 3, nama: 'Yusuf Kamal, S.H., M.Kn.', jabatan: 'Lektor', keahlian: 'Hukum Tata Negara', pendidikan: 'S2 Hukum', email: 'yusuf.kamal@ump.ac.id', nidn: '1234567892', profil: 'Fokus pada studi konstitusi dan otonomi daerah.', status: 'Aktif', foto: 'https://placehold.co/300x300/EEF1F5/0B1F3A?text=Foto+Dosen' },
  { id: 4, nama: 'Dr. Siti Aminah, S.H., M.H.', jabatan: 'Profesor', keahlian: 'Hukum Internasional', pendidikan: 'S3 Ilmu Hukum', email: 'siti.aminah@ump.ac.id', nidn: '1234567893', profil: 'Peneliti hukum internasional dan hubungan bilateral.', status: 'Aktif', foto: 'https://placehold.co/300x300/EEF1F5/0B1F3A?text=Foto+Dosen' },
  { id: 5, nama: 'Bayu Segara, S.H., M.H.', jabatan: 'Asisten Ahli', keahlian: 'Hukum Adat', pendidikan: 'S2 Hukum', email: 'bayu.segara@ump.ac.id', nidn: '1234567894', profil: 'Mengkaji hukum adat Papua dan resolusi konflik lokal.', status: 'Nonaktif', foto: 'https://placehold.co/300x300/EEF1F5/0B1F3A?text=Foto+Dosen' },
  { id: 6, nama: 'Maria Kabes, S.H., M.H.', jabatan: 'Dosen', keahlian: 'Hukum Administrasi Negara', pendidikan: 'S2 Hukum', email: 'maria.kabes@ump.ac.id', nidn: '1234567895', profil: 'Praktisi dan pengajar hukum administrasi pemerintahan.', status: 'Aktif', foto: 'https://placehold.co/300x300/EEF1F5/0B1F3A?text=Foto+Dosen' }
];
let SAMPLE_DOSEN = DB.load('dosen', SEED_DOSEN);

const SEED_DOKUMEN = [
  { id: 1, nama: 'Panduan Akademik 2026/2027', kategori: 'Pedoman Akademik', format: 'PDF', ukuran: '2.4 MB' },
  { id: 2, nama: 'Buku Kurikulum Prodi Hukum', kategori: 'Kurikulum', format: 'PDF', ukuran: '3.1 MB' },
  { id: 3, nama: 'Formulir Pengajuan Judul Skripsi', kategori: 'Formulir', format: 'DOCX', ukuran: '180 KB' },
  { id: 4, nama: 'SOP Bimbingan Skripsi', kategori: 'SOP', format: 'PDF', ukuran: '540 KB' },
  { id: 5, nama: 'Sertifikat Akreditasi BAN-PT', kategori: 'Akreditasi', format: 'PDF', ukuran: '1.1 MB' },
  { id: 6, nama: 'Kalender Akademik 2026/2027', kategori: 'Dokumen Publik', format: 'PDF', ukuran: '620 KB' }
];
let SAMPLE_DOKUMEN = DB.load('dokumen', SEED_DOKUMEN);

const SEED_GALERI = [
  { id: 1, judul: 'Seminar Nasional 2026', album: 'Seminar', src: 'https://placehold.co/360x380/EEF1F5/0B1F3A?text=Seminar' },
  { id: 2, judul: 'Kuliah Umum Hukum Adat', album: 'Kuliah Umum', src: 'https://placehold.co/360x280/EEF1F5/0B1F3A?text=Kuliah+Umum' },
  { id: 3, judul: 'Wisuda Sarjana Hukum XXI', album: 'Wisuda', src: 'https://placehold.co/360x280/EEF1F5/0B1F3A?text=Wisuda' },
  { id: 4, judul: 'Bakti Sosial Kampung Yobe', album: 'Pengabdian', src: 'https://placehold.co/360x380/EEF1F5/0B1F3A?text=Pengabdian' },
  { id: 5, judul: 'Moot Court Competition', album: 'Kegiatan Mahasiswa', src: 'https://placehold.co/360x280/EEF1F5/0B1F3A?text=Moot+Court' },
  { id: 6, judul: 'Praktik Peradilan Semu', album: 'Praktikum', src: 'https://placehold.co/360x280/EEF1F5/0B1F3A?text=Praktikum' },
  { id: 7, judul: 'Riset Hukum Adat Papua', album: 'Penelitian', src: 'https://placehold.co/360x380/EEF1F5/0B1F3A?text=Penelitian' },
  { id: 8, judul: 'Workshop Legal Drafting', album: 'Seminar', src: 'https://placehold.co/360x280/EEF1F5/0B1F3A?text=Workshop' }
];
let SAMPLE_GALERI = DB.load('galeri', SEED_GALERI);

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
    ...themeStore(),
    // Menjaga akses: jika belum login, kembalikan ke halaman login.
    init() {
      AUTH.guard();
    },
    get currentUser() {
      return AUTH.current();
    },
    // KPI dashboard dihitung langsung dari data SAMPLE_* (single source of truth
    // yang sama dipakai frontend publik) supaya selalu konsisten & akurat, bukan angka statis.
    get stats() {
      return {
        dosen: SAMPLE_DOSEN.length,
        mahasiswa: DASHBOARD_TOTAL_MAHASISWA,
        alumni: SAMPLE_ALUMNI.length,
        berita: SAMPLE_BERITA.length,
        kegiatan: SAMPLE_KEGIATAN.length,
        artikel: SAMPLE_ARTIKEL.length,
        dokumen: SAMPLE_DOKUMEN.length,
        galeri: SAMPLE_GALERI.length
      };
    },
    // Log aktivitas terbaru (dipakai widget "Aktivitas Terbaru" di Dashboard)
    get recentActivity() {
      return SAMPLE_AKTIVITAS.slice(0, 4);
    },
    // Seluruh log aktivitas (dipakai halaman Activity Log)
    get activityLog() {
      return SAMPLE_AKTIVITAS;
    },
    logout() {
      NeuAlert.confirmLogout().then(ok => {
        if (ok) {
          AUTH.logout();
          window.location.href = 'login.html';
        }
      });
    }
  };
}

// ---- Alumni: dipakai alumni.html supaya konsisten dengan pola *Page() lain ----
function alumniPage() {
  const base = filterableGrid(SAMPLE_ALUMNI, { searchKeys: ['nama', 'pekerjaan', 'instansi'] });
  return mergeReactive(base, {
    // Statistik dihitung langsung dari data alumni yang tercatat di sistem
    // (bukan angka statis) sehingga selalu konsisten dengan jumlah profil yang tampil.
    get totalAlumni() {
      return this.all.length;
    },
    pctByKategori(kategori) {
      if (this.all.length === 0) return 0;
      const count = this.all.filter(a => a.kategori === kategori).length;
      return Math.round((count / this.all.length) * 100);
    }
  });
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

// Menggabungkan beberapa object Alpine data TANPA merusak getter reaktif
// (get results(), get featured(), dst). Spread biasa ({...obj}) akan langsung
// MENGEKSEKUSI getter dan menyimpan hasilnya sebagai nilai statis, sehingga
// daftar hasil filter/pencarian tidak pernah update lagi setelah render awal.
// defineProperties menyalin *descriptor* getter apa adanya, jadi getter tetap
// hidup dan selalu dihitung ulang oleh Alpine setiap activeFilter/q berubah.
function mergeReactive(...sources) {
  const target = {};
  for (const src of sources) {
    Object.defineProperties(target, Object.getOwnPropertyDescriptors(src));
  }
  return target;
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
  return mergeReactive(
    filterableGrid(SAMPLE_DOSEN, { searchKeys: ['nama', 'keahlian'], filterKey: 'jabatan', filters: jabatanFilters }),
    {
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
    }
  );
}

function beritaPage() {
  const kategoriFilters = ['Semua', 'Akademik', 'Kemahasiswaan', 'Penelitian', 'Pengabdian', 'Prestasi', 'Seminar', 'Kegiatan'];
  const base = filterableGrid(SAMPLE_BERITA, { searchKeys: ['judul', 'kategori'], filterKey: 'kategori', filters: kategoriFilters });
  return mergeReactive(base, {
    get featured() {
      return SAMPLE_BERITA.find(b => b.featured) || SAMPLE_BERITA[0];
    },
    detailUrl(id) {
      return `detail-berita.html?id=${id}`;
    }
  });
}

function dokumenPage() {
  const kategoriFilters = ['Semua', 'Pedoman Akademik', 'Kurikulum', 'Formulir', 'Peraturan', 'SOP', 'Panduan', 'Akreditasi', 'Dokumen Publik'];
  return mergeReactive(
    filterableGrid(SAMPLE_DOKUMEN, { searchKeys: ['nama', 'kategori'], filterKey: 'kategori', filters: kategoriFilters }),
    {
      download(doc) {
        NeuAlert.success(`Unduhan "${doc.nama}" dimulai (simulasi).`);
      }
    }
  );
}

function galeriPage() {
  const albumFilters = ['Semua', 'Seminar', 'Kuliah Umum', 'Praktikum', 'Kegiatan Mahasiswa', 'Wisuda', 'Pengabdian', 'Penelitian'];
  return mergeReactive(
    filterableGrid(SAMPLE_GALERI, { searchKeys: ['judul', 'album'], filterKey: 'album', filters: albumFilters }),
    {
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
    }
  );
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

const SEED_PENGUMUMAN = [
  { id: 1, judul: 'Jadwal Seminar Proposal Skripsi Semester Ganjil 2026/2027', status: 'Penting', badge: 'badge-important', tanggal: '25 Agu 2026', isi: 'Pendaftaran seminar proposal dibuka mulai 1 September 2026 melalui portal akademik. Mahasiswa wajib melengkapi berkas sesuai panduan prodi.', lampiran: 'Jadwal-Seminar-Proposal.pdf' },
  { id: 2, judul: 'Pembaruan Panduan Penulisan Skripsi Prodi Hukum', status: 'Baru', badge: 'badge-new', tanggal: '22 Agu 2026', isi: 'Panduan terbaru dapat diunduh pada menu Dokumen » Panduan Akademik. Perubahan utama meliputi format sitasi dan struktur bab.', lampiran: 'Panduan-Skripsi-2026.pdf' },
  { id: 3, judul: 'Pendaftaran Program Magang Semester Ganjil', status: 'Aktif', badge: 'badge-active', tanggal: '18 Agu 2026', isi: 'Mahasiswa semester 6 ke atas dapat mendaftar magang di mitra kerja sama prodi hingga 30 September 2026.', lampiran: null },
  { id: 4, judul: 'Pendaftaran Beasiswa PPA Tahap I', status: 'Berakhir', badge: 'badge-ended', tanggal: '01 Jul 2026', isi: 'Periode pendaftaran beasiswa PPA tahap pertama telah ditutup. Pengumuman seleksi akan diinformasikan melalui email resmi kampus.', lampiran: null }
];
let SAMPLE_PENGUMUMAN = DB.load('pengumuman', SEED_PENGUMUMAN);

const SEED_KEGIATAN = [
  { id: 1, nama: 'Seminar Nasional Hukum Digital', tanggal: '28 Agu 2026', hari: '28', bulan: 'Agu', waktu: '09.00 – 12.00', lokasi: 'Aula Fakultas Hukum', penyelenggara: 'Program Studi Hukum UMP', deskripsi: 'Membahas transformasi hukum di era digital bersama praktisi dan akademisi nasional.' },
  { id: 2, nama: 'Kuliah Umum Hukum Adat Papua', tanggal: '30 Agu 2026', hari: '30', bulan: 'Agu', waktu: '13.00 – 15.00', lokasi: 'Ruang Sidang Utama', penyelenggara: 'Program Studi Hukum UMP', deskripsi: 'Menghadirkan tokoh adat dan akademisi hukum adat sebagai narasumber.' },
  { id: 3, nama: 'Workshop Legal Drafting', tanggal: '05 Sep 2026', hari: '05', bulan: 'Sep', waktu: '09.00 – 16.00', lokasi: 'Laboratorium Hukum', penyelenggara: 'Laboratorium Hukum', deskripsi: 'Pelatihan penyusunan dokumen hukum untuk mahasiswa semester akhir.' },
  { id: 4, nama: 'Pengabdian Masyarakat: Penyuluhan Hukum', tanggal: '12 Sep 2026', hari: '12', bulan: 'Sep', waktu: '08.00 – selesai', lokasi: 'Kampung Yobe, Jayapura', penyelenggara: 'Tim PKM Prodi Hukum', deskripsi: 'Penyuluhan hukum dasar bagi masyarakat sekitar kampus.' }
];
let SAMPLE_KEGIATAN = DB.load('kegiatan', SEED_KEGIATAN);

const SEED_ARTIKEL = [
  { id: 1, judul: 'Restorative Justice dalam Sistem Peradilan Pidana Indonesia', penulis: 'Dr. Ahmad Fauzi, S.H., M.H.', kategori: 'Hukum Pidana', tanggal: '15 Agu 2026', isi: 'Kajian ini menelaah penerapan restorative justice dalam sistem peradilan pidana Indonesia serta implikasinya bagi korban dan pelaku.', referensi: 'KUHP; UU No. 11 Tahun 2012 tentang Sistem Peradilan Pidana Anak.', thumbnail: 'https://placehold.co/400x220/EEF1F5/0B1F3A?text=Artikel+Hukum' },
  { id: 2, judul: 'Eksistensi Hukum Adat Papua dalam Sistem Hukum Nasional', penulis: 'Bayu Segara, S.H., M.H.', kategori: 'Hukum Adat', tanggal: '12 Agu 2026', isi: 'Artikel membahas kedudukan hukum adat Papua dalam kerangka hukum nasional dan praktik penyelesaian sengketa adat.', referensi: 'UUD 1945 Pasal 18B ayat (2).', thumbnail: 'https://placehold.co/400x220/EEF1F5/0B1F3A?text=Artikel+Hukum' },
  { id: 3, judul: 'Perlindungan Hukum bagi UMKM di Era Ekonomi Digital', penulis: 'Rina Marlina, S.H., M.H.', kategori: 'Hukum Bisnis', tanggal: '10 Agu 2026', isi: 'Studi perlindungan pelaku UMKM pada transaksi digital, termasuk kontrak elektronik dan perlindungan konsumen.', referensi: 'UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi.', thumbnail: 'https://placehold.co/400x220/EEF1F5/0B1F3A?text=Artikel+Hukum' },
  { id: 4, judul: 'Dinamika Otonomi Khusus Papua Pasca Revisi UU', penulis: 'Yusuf Kamal, S.H., M.Kn.', kategori: 'Hukum Tata Negara', tanggal: '05 Agu 2026', isi: 'Analisis implikasi revisi undang-undang otonomi khusus terhadap tata kelola pemerintahan daerah di Papua.', referensi: 'UU Otonomi Khusus Papua beserta perubahannya.', thumbnail: 'https://placehold.co/400x220/EEF1F5/0B1F3A?text=Artikel+Hukum' }
];
let SAMPLE_ARTIKEL = DB.load('artikel', SEED_ARTIKEL);

const SEED_PRESTASI = [
  { id: 1, nama: 'Juara 1 Moot Court Competition Nasional 2026', kategori: 'Mahasiswa', tingkat: 'Nasional', tahun: '2026' },
  { id: 2, nama: 'Juara 2 Debat Konstitusi Wilayah Papua', kategori: 'Mahasiswa', tingkat: 'Regional', tahun: '2026' },
  { id: 3, nama: 'Best Paper Award, Konferensi Hukum Internasional', kategori: 'Dosen', tingkat: 'Internasional', tahun: '2025' },
  { id: 4, nama: 'Terpilih sebagai Hakim Ad Hoc Pengadilan Tipikor', kategori: 'Alumni', tingkat: 'Nasional', tahun: '2025' },
  { id: 5, nama: 'Peringkat Terbaik Prodi Hukum se-Papua', kategori: 'Program Studi', tingkat: 'Provinsi', tahun: '2025' },
  { id: 6, nama: 'Juara 3 Lomba Karya Tulis Ilmiah Hukum', kategori: 'Mahasiswa', tingkat: 'Nasional', tahun: '2024' }
];
let SAMPLE_PRESTASI = DB.load('prestasi', SEED_PRESTASI);

const SEED_KURIKULUM = [
  { id: 1, kode: 'HK101', nama: 'Pengantar Ilmu Hukum', sks: 3, jenis: 'Wajib', semester: 1 },
  { id: 2, kode: 'HK102', nama: 'Pengantar Hukum Indonesia', sks: 3, jenis: 'Wajib', semester: 1 },
  { id: 3, kode: 'HK103', nama: 'Ilmu Negara', sks: 2, jenis: 'Wajib', semester: 1 },
  { id: 4, kode: 'HK104', nama: 'Bahasa Indonesia Hukum', sks: 2, jenis: 'Wajib', semester: 1 },
  { id: 5, kode: 'HK201', nama: 'Hukum Pidana I', sks: 3, jenis: 'Wajib', semester: 2 },
  { id: 6, kode: 'HK202', nama: 'Hukum Perdata I', sks: 3, jenis: 'Wajib', semester: 2 },
  { id: 7, kode: 'HK203', nama: 'Hukum Tata Negara', sks: 3, jenis: 'Wajib', semester: 2 },
  { id: 8, kode: 'HK301', nama: 'Hukum Acara Pidana', sks: 3, jenis: 'Wajib', semester: 3 },
  { id: 9, kode: 'HK401', nama: 'Hukum Adat', sks: 2, jenis: 'Wajib', semester: 4 },
  { id: 10, kode: 'HK501', nama: 'Klinik Hukum', sks: 2, jenis: 'Pilihan', semester: 5 },
  { id: 11, kode: 'HK601', nama: 'Hukum Acara Perdata', sks: 3, jenis: 'Wajib', semester: 6 },
  { id: 12, kode: 'HK602', nama: 'Hukum Internasional', sks: 3, jenis: 'Wajib', semester: 6 },
  { id: 13, kode: 'HK701', nama: 'Hukum Bisnis', sks: 3, jenis: 'Pilihan', semester: 7 },
  { id: 14, kode: 'HK702', nama: 'Praktik Peradilan Semu', sks: 2, jenis: 'Wajib', semester: 7 },
  { id: 15, kode: 'HK801', nama: 'Skripsi', sks: 6, jenis: 'Wajib', semester: 8 }
];
let SAMPLE_KURIKULUM = DB.load('kurikulum', SEED_KURIKULUM);

// Total mahasiswa aktif: statistik institusional, belum ada modul CRUD tersendiri
// sehingga disimpan sebagai satu konstanta terpusat (bukan angka statis di HTML).
const DASHBOARD_TOTAL_MAHASISWA = 350;

// Log aktivitas admin — satu sumber data yang dipakai bersama oleh Dashboard
// (menampilkan 4 teraktual) dan halaman Activity Log (menampilkan semua).
const SEED_AKTIVITAS = [
  { id: 1, user: 'Admin Prodi', aksi: 'Memperbarui data dosen: Dr. Ahmad Fauzi', waktu: '10 menit lalu', icon: '\u{1F4DD}' },
  { id: 2, user: 'Rina Marlina (Editor)', aksi: 'Menambahkan berita baru: Seminar Nasional Hukum Digital', waktu: '1 jam lalu', icon: '\u{1F4C4}' },
  { id: 3, user: 'Admin Prodi', aksi: 'Mengunggah dokumen: SOP Bimbingan Skripsi', waktu: '3 jam lalu', icon: '\u{1F4C1}' },
  { id: 4, user: 'Yusuf Kamal (Operator)', aksi: 'Mempublikasikan pengumuman: Jadwal Seminar Proposal', waktu: '5 jam lalu', icon: '\u{1F514}' },
  { id: 5, user: 'Admin Prodi', aksi: 'Menghapus 1 data alumni (duplikat)', waktu: 'Kemarin, 16.20', icon: '\u{1F5D1}\u{FE0F}' },
  { id: 6, user: 'Rina Marlina (Editor)', aksi: 'Mengedit artikel: Restorative Justice dalam Sistem Peradilan Pidana', waktu: 'Kemarin, 10.05', icon: '\u{270F}\u{FE0F}' },
  { id: 7, user: 'Admin Prodi', aksi: 'Login ke panel admin', waktu: 'Kemarin, 08.00', icon: '\u{1F510}' }
];
let SAMPLE_AKTIVITAS = DB.load('aktivitas', SEED_AKTIVITAS);

const SEED_ALUMNI = [
  { id: 1, nama: 'Fadli Ramadhan, S.H.', angkatan: '2020', pekerjaan: 'Advokat', instansi: 'Kantor Hukum Fadli & Rekan', kategori: 'Bekerja' },
  { id: 2, nama: 'Melinda Kogoya, S.H.', angkatan: '2019', pekerjaan: 'Legal Officer', instansi: 'PT Papua Sejahtera', kategori: 'Bekerja' },
  { id: 3, nama: 'Yohanes Sroyer, S.H.', angkatan: '2018', pekerjaan: 'Aparatur Sipil Negara', instansi: 'Kejaksaan Negeri Jayapura', kategori: 'Bekerja' },
  { id: 4, nama: 'Sari Wulandari, S.H.', angkatan: '2021', pekerjaan: 'Magister Hukum', instansi: 'Universitas Gadjah Mada', kategori: 'Studi Lanjut' }
];
let SAMPLE_ALUMNI = DB.load('alumni', SEED_ALUMNI);

// Pengguna Admin Panel (Super Admin, Admin Prodi, Editor, Operator)
const SEED_PENGGUNA = [
  { id: 1, nama: 'Admin Prodi', email: 'admin@ump.ac.id', role: 'Super Admin', status: 'Aktif' },
  { id: 2, nama: 'Rina Marlina', email: 'editor.rina@ump.ac.id', role: 'Editor', status: 'Aktif' },
  { id: 3, nama: 'Yusuf Kamal', email: 'operator.yusuf@ump.ac.id', role: 'Operator', status: 'Nonaktif' }
];
let SAMPLE_PENGGUNA = DB.load('pengguna', SEED_PENGGUNA);

// Profil Program Studi — konten satu-record (bukan daftar), dipakai bersama oleh
// admin/profil-prodi.html (form edit) dan profil.html publik (tampilan), supaya
// perubahan yang disimpan admin selalu tercermin akurat di halaman publik.
const SEED_PROFIL = {
  nama: 'Program Studi Hukum', kode: 'HK-UMP', fakultas: 'Fakultas Hukum', universitas: 'Universitas Muhammadiyah Papua',
  akreditasi: 'B',
  deskripsi: 'Program Studi Hukum Universitas Muhammadiyah Papua hadir untuk menjawab kebutuhan sumber daya hukum yang kompeten di wilayah timur Indonesia. Kami memadukan kajian hukum nasional dengan konteks hukum adat dan sosial masyarakat Papua.',
  sejarah: 'Didirikan sebagai bagian dari komitmen universitas dalam pengembangan ilmu hukum di Papua, Program Studi Hukum terus bertumbuh melalui penguatan kurikulum, kualitas dosen, dan kerja sama kelembagaan.',
  visi: 'Menjadi program studi hukum yang unggul, islami, dan berdaya saing dalam menghasilkan sarjana hukum yang berintegritas di kawasan timur Indonesia.',
  misi: 'Menyelenggarakan pendidikan hukum yang berkualitas\nMengembangkan penelitian hukum yang aplikatif\nMelaksanakan pengabdian masyarakat berbasis hukum\nMembangun kerja sama dengan lembaga hukum',
  tujuan: 'Menghasilkan lulusan yang menguasai ilmu hukum, memiliki keterampilan praktik hukum, serta berkarakter amanah dan berkeadilan dalam menjalankan profesinya.',
  lulusan: 'Praktisi hukum, aparatur negara, akademisi, dan wirausaha hukum.'
};
let SAMPLE_PROFIL = DB.load('profil', SEED_PROFIL);

// Pengaturan Website — dipakai admin/pengaturan.html (form) dan ditampilkan
// di footer + halaman Kontak pada seluruh halaman publik.
const SEED_PENGATURAN = {
  namaWebsite: 'Program Studi Hukum UMP', deskripsi: 'Website resmi Program Studi Hukum Universitas Muhammadiyah Papua.',
  theme: 'Neumorphism', primaryColor: '#2A4E9E', darkMode: true,
  metaTitle: 'Program Studi Hukum — UMP', metaDesc: 'Informasi akademik Program Studi Hukum UMP.', keywords: 'hukum, UMP, program studi hukum',
  facebook: '', instagram: '', youtube: '', linkedin: '',
  email: 'hukum@ump.ac.id', telepon: '(0967) 123-456', alamat: 'Jl. Yap Thiam Hien, Kel. Yobe, Jayapura Utara'
};
let SAMPLE_PENGATURAN = DB.load('pengaturan', SEED_PENGATURAN);

function profilPage() {
  return {
    profil: SAMPLE_PROFIL,
    get misiList() {
      return String(this.profil.misi || '').split('\n').map(s => s.trim()).filter(Boolean);
    }
  };
}

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
  return mergeReactive(
    filterableGrid(SAMPLE_ARTIKEL, { searchKeys: ['judul', 'kategori', 'penulis'], filterKey: 'kategori', filters }),
    {
      detailUrl(id) {
        return `detail-artikel.html?id=${id}`;
      }
    }
  );
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
    // Menyimpan array `rows` saat ini ke localStorage (jika dbKey disediakan)
    // supaya perubahan langsung persisten dan tampil konsisten di halaman publik.
    persist() {
      if (config.dbKey) DB.save(config.dbKey, this.rows);
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
      const label = config.itemLabel ? config.itemLabel.replace(/ ini$/, '') : 'Data';
      if (this.editing) {
        const idx = this.rows.findIndex(x => x.id === this.editing);
        this.rows[idx] = { ...this.form };
        this.persist();
        logActivity(`Memperbarui ${label}: ${this.form[config.labelKey || 'nama'] || ''}`.trim(), '\u{270F}\u{FE0F}');
        NeuAlert.updated();
      } else {
        this.form.id = Date.now();
        this.rows.unshift({ ...this.form });
        this.persist();
        logActivity(`Menambahkan ${label} baru: ${this.form[config.labelKey || 'nama'] || ''}`.trim(), '\u{2795}');
        NeuAlert.success();
      }
      this.showModal = false;
    },
    async remove(row) {
      const ok = await NeuAlert.confirmDelete(config.itemLabel || 'data ini');
      if (ok) {
        const label = config.itemLabel ? config.itemLabel.replace(/ ini$/, '') : 'data';
        this.rows = this.rows.filter(x => x.id !== row.id);
        this.persist();
        logActivity(`Menghapus ${label}: ${row[config.labelKey || 'nama'] || ''}`.trim(), '\u{1F5D1}\u{FE0F}');
        NeuAlert.deleted();
      }
    }
  };
}
