/* =========================================================
   WEBSITE PROGRAM STUDI HUKUM — SHARED APP LOGIC
   Dark mode, SweetAlert2, Alpine.js modules, sample data
   ========================================================= */

// Warna address-bar mobile (meta[name=theme-color]) HARUS mengikuti mode
// yang benar-benar aktif di situs (toggle manual + localStorage), BUKAN
// preferensi OS (prefers-color-scheme) — supaya saat pengunjung menekan
// tombol dark/light di header, warna chrome browser di HP ikut berubah
// secara akurat, bukan tetap mengikuti tema OS yang mungkin berbeda.
const THEME_COLOR_LIGHT = '#e8ecf1';
const THEME_COLOR_DARK = '#101827';
function syncThemeColorMeta(isDark) {
  const meta = document.getElementById('theme-color-meta');
  if (meta) meta.setAttribute('content', isDark ? THEME_COLOR_DARK : THEME_COLOR_LIGHT);
}

(function initTheme() {
  const saved = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = saved === 'dark' || (!saved && prefersDark);
  if (isDark) {
    document.documentElement.classList.add('dark');
  }
  // Dijalankan sebelum body dirender (script tanpa defer di <head>), jadi
  // tidak ada "flash" warna address-bar yang salah saat halaman dibuka.
  syncThemeColorMeta(isDark);
})();

function themeStore() {
  return {
    dark: document.documentElement.classList.contains('dark'),
    toggle() {
      this.dark = !this.dark;
      document.documentElement.classList.toggle('dark', this.dark);
      localStorage.setItem('theme', this.dark ? 'dark' : 'light');
      syncThemeColorMeta(this.dark);
    }
  };
}

/* =========================================================
   ANIMASI ANGKA (COUNT-UP) — Alpine custom directive
   ---------------------------------------------------------
   Dipakai lewat atribut `x-countup="expression"` menggantikan
   `x-text` pada elemen yang menampilkan angka statistik (jumlah
   dosen, mahasiswa, alumni, dsb) di Frontend maupun Admin Panel.
   Setiap kali nilai berubah (pertama kali render ATAU data di
   localStorage berubah lewat CRUD Admin), angka akan dianimasikan
   naik dari 0 (atau dari nilai sebelumnya) menuju nilai baru,
   memakai easing halus + format ribuan gaya Indonesia (mis. 1.250).
   ========================================================= */
document.addEventListener('alpine:init', () => {
  if (typeof Alpine === 'undefined' || !Alpine.directive) return;
  Alpine.directive('countup', (el, { expression }, { evaluateLater, effect, cleanup }) => {
    const getValue = evaluateLater(expression);
    let frame = null;
    let current = 0;
    let hasRendered = false;

    function format(n) {
      const rounded = Math.round(n);
      return isFinite(rounded) ? rounded.toLocaleString('id-ID') : '0';
    }

    function animateTo(target) {
      if (frame) cancelAnimationFrame(frame);
      const from = hasRendered ? current : 0;
      const diff = target - from;
      // Angka kecil/tanpa perubahan cukup tampil langsung tanpa animasi.
      if (diff === 0) {
        current = target;
        el.textContent = format(current);
        hasRendered = true;
        return;
      }
      const duration = 900;
      const startTime = performance.now();
      const step = (now) => {
        const progress = Math.min(1, (now - startTime) / duration);
        const eased = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
        current = from + diff * eased;
        el.textContent = format(current);
        if (progress < 1) {
          frame = requestAnimationFrame(step);
        } else {
          current = target;
          el.textContent = format(target);
        }
      };
      frame = requestAnimationFrame(step);
      hasRendered = true;
    }

    effect(() => {
      getValue((value) => {
        const num = Number(value);
        animateTo(isFinite(num) ? num : 0);
      });
    });

    cleanup(() => { if (frame) cancelAnimationFrame(frame); });
  });
});

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
/* =========================================================
   INDEXEDDB BACKING STORE (Unlimited Media Capacity)
   ========================================================= */
const IDB = (() => {
  const DB_NAME = 'ProdiHukumDB';
  const DB_VERSION = 1;
  const STORE_NAME = 'entities';

  function openDB() {
    return new Promise((resolve) => {
      if (typeof indexedDB === 'undefined') {
        resolve(null);
        return;
      }
      try {
        const req = indexedDB.open(DB_NAME, DB_VERSION);
        req.onupgradeneeded = (e) => {
          const db = e.target.result;
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME);
          }
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => resolve(null);
      } catch (err) {
        resolve(null);
      }
    });
  }

  async function get(key) {
    const db = await openDB();
    if (!db) return null;
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(key);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => resolve(null);
      } catch (e) {
        resolve(null);
      }
    });
  }

  async function set(key, val) {
    const db = await openDB();
    if (!db) return false;
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.put(val, key);
        req.onsuccess = () => resolve(true);
        req.onerror = () => resolve(false);
      } catch (e) {
        resolve(false);
      }
    });
  }

  async function clear() {
    const db = await openDB();
    if (!db) return;
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).clear();
    } catch (e) { }
  }

  return { get, set, clear };
})();

/* =========================================================
   DB ENGINE — Penyimpanan Multi-Layer (LocalStorage + IDB)
   ========================================================= */
const DB = (() => {
  const NS = 'prodihukum_db_v1_';
  const PLACEHOLDER = 'https://placehold.co/400x240/EEF1F5/0B1F3A?text=Gambar';

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

  function getStorageUsage() {
    let totalBytes = 0;
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const val = localStorage.getItem(key) || '';
        totalBytes += (key.length + val.length) * 2;
      }
    } catch (e) { }
    const kb = Math.round(totalBytes / 1024);
    const mb = (totalBytes / (1024 * 1024)).toFixed(2);
    const quotaEst = 5120;
    const pct = Math.min(100, Math.round((kb / quotaEst) * 100));
    return { bytes: totalBytes, kb, mb, pct };
  }

  function pruneStorage() {
    try {
      const rawAkt = localStorage.getItem(NS + 'aktivitas');
      if (rawAkt) {
        const akt = JSON.parse(rawAkt);
        if (Array.isArray(akt) && akt.length > 15) {
          localStorage.setItem(NS + 'aktivitas', JSON.stringify(akt.slice(0, 15)));
        }
      }
    } catch (e) { }
    try {
      const rawPv = localStorage.getItem('prodihukum_pageviews_v1');
      if (rawPv) {
        const pv = JSON.parse(rawPv);
        const keys = Object.keys(pv).sort().slice(-14);
        const newPv = {};
        keys.forEach(k => newPv[k] = pv[k]);
        localStorage.setItem('prodihukum_pageviews_v1', JSON.stringify(newPv));
      }
    } catch (e) { }
  }

  function load(key, seed) {
    try {
      const raw = localStorage.getItem(NS + key);
      if (raw !== null) {
        return sanitizeBlobUrls(JSON.parse(raw));
      }
    } catch (e) {
      console.warn('DB: gagal membaca data "' + key + '" dari localStorage.', e);
    }
    const copy = JSON.parse(JSON.stringify(seed));
    save(key, copy);
    return copy;
  }

  // PENTING: save() HANYA boleh menulis/menghapus key milik modul yang
  // sedang disimpan (NS + key) itu sendiri. Modul lain (mis. Dosen, Galeri,
  // Prestasi) TIDAK PERNAH boleh disentuh di sini — sebelumnya, saat
  // localStorage penuh, kode ini menghapus localStorage key modul LAIN
  // secara acak untuk memberi ruang. Efeknya: aksi CRUD di satu halaman
  // admin bisa membuat data di halaman admin lain "hilang" (balik ke data
  // bawaan) walau admin tidak menyentuh halaman itu sama sekali. Fungsi ini
  // juga sebelumnya SELALU `return true` walau localStorage sebenarnya gagal
  // ditulis, sehingga admin melihat notifikasi "berhasil" padahal data tidak
  // benar-benar tersimpan. Sekarang fungsi ini jujur: mengembalikan `false`
  // jika localStorage benar-benar gagal ditulis, supaya kode pemanggil bisa
  // membatalkan perubahan di memori dan memberi tahu admin alasannya.
  function save(key, data) {
    // 1. Cadangkan ke IndexedDB di latar belakang (kapasitas ratusan MB).
    //    Ini murni cadangan tambahan (best-effort) — TIDAK PERNAH menghapus
    //    apa pun, jadi tidak berisiko menyebabkan kehilangan data modul lain.
    if (typeof IDB !== 'undefined' && IDB.set) {
      IDB.set(NS + key, data).catch(() => { });
    }

    const serialized = JSON.stringify(data);

    // 2. Simpan ke localStorage.
    try {
      localStorage.setItem(NS + key, serialized);
      return true;
    } catch (e) {
      // 3. localStorage penuh. Satu-satunya pembersihan otomatis yang aman
      //    dilakukan di sini adalah memangkas LOG internal aplikasi sendiri
      //    (riwayat aktivitas & statistik kunjungan) yang memang didesain
      //    untuk dibatasi jumlahnya dan bukan konten yang dikelola admin di
      //    modul lain — bukan menghapus data CRUD modul lain.
      pruneStorage();
      try {
        localStorage.setItem(NS + key, serialized);
        return true;
      } catch (e2) {
        // Tetap gagal setelah pruning. JANGAN menghapus data key modul lain.
        // Data yang sedang disimpan hanya ada di memori (Alpine) & cadangan
        // IndexedDB kali ini — beri tahu pemanggil bahwa localStorage GAGAL
        // ditulis supaya perubahan di memori dibatalkan (rollback) dan admin
        // diberi pesan yang jelas, alih-alih diam-diam "mengaku berhasil".
        console.warn('DB: localStorage penuh, gagal menyimpan "' + key + '".', e2);
        return false;
      }
    }
  }

  function reset(key, seed) {
    return save(key, JSON.parse(JSON.stringify(seed))) ? load(key, seed) : null;
  }

  function resetAll(seeds) {
    if (typeof IDB !== 'undefined' && IDB.clear) IDB.clear();
    Object.keys(seeds).forEach(key => reset(key, seeds[key]));
  }

  // Dipakai oleh tombol "Optimalkan Penyimpanan" di admin/pengaturan.html.
  // HANYA memangkas log internal (aktivitas & statistik kunjungan) lewat
  // pruneStorage() yang sama dipakai saat localStorage penuh — TIDAK PERNAH
  // menyentuh data CRUD modul lain (artikel, berita, galeri, dst.), sesuai
  // aturan yang sama dengan save(). Mengembalikan jumlah byte yang berhasil
  // dibebaskan supaya UI bisa menampilkan hasil nyata ke admin.
  function optimizeStorage() {
    const before = getStorageUsage().bytes;
    pruneStorage();
    const after = getStorageUsage().bytes;
    return Math.max(0, before - after);
  }

  return { load, save, reset, resetAll, getStorageUsage, optimizeStorage, NS };
})();

/* ---- Log aktivitas & notifikasi real-time: dicatat otomatis setiap ada aksi CRUD ---- */
function logActivity(aksi, icon) {
  const entry = {
    id: Date.now(),
    user: AUTH.current().nama,
    aksi,
    waktu: 'Baru saja',
    tanggalIso: new Date().toISOString(),
    icon: icon || '\u{1F4DD}'
  };
  SAMPLE_AKTIVITAS = [entry, ...SAMPLE_AKTIVITAS].slice(0, 25);
  DB.save('aktivitas', SAMPLE_AKTIVITAS);

  const notif = {
    id: Date.now() + 1,
    judul: aksi,
    pesan: 'Aksi dijalankan oleh ' + AUTH.current().nama,
    waktu: 'Baru saja',
    read: false,
    icon: icon || '\u{1F514}'
  };
  SAMPLE_NOTIFIKASI = [notif, ...SAMPLE_NOTIFIKASI].slice(0, 30);
  DB.save('notifikasi', SAMPLE_NOTIFIKASI);

  // Dispatch event so adminShell can reactively sync _notifications
  window.dispatchEvent(new CustomEvent('notif-update'));
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
  // Halaman admin yang hanya boleh diakses role 'Super Admin' (manajemen akun
  // pengguna & pengaturan/backup-restore database). Sebelumnya AUTH.guard()
  // hanya memeriksa isLoggedIn() dan field `role` di sesi tidak pernah dibaca
  // ulang untuk pembatasan akses, sehingga Editor/Operator tetap bisa membuka
  // halaman ini secara langsung lewat URL.
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

/* =========================================================
   KOMPRESI GAMBAR RINGAN & EFISIEN
   ---------------------------------------------------------
   Memperkecil dimensi foto dan mengompres ke JPEG ringan (10-25KB)
   sehingga ratusan foto dapat tersimpan tanpa melebihi batas
   kuota 5MB browser.
   ========================================================= */
function compressImageFile(file, { maxWidth = 480, maxHeight = 480, quality = 0.62 } = {}) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type || !file.type.startsWith('image/')) {
      reject(new Error('File yang dipilih bukan gambar.'));
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Gagal membaca file gambar.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('File gambar tidak valid atau rusak.'));
      img.onload = () => {
        let { width, height } = img;
        const ratio = Math.min(1, maxWidth / width, maxHeight / height);
        width = Math.max(1, Math.round(width * ratio));
        height = Math.max(1, Math.round(height * ratio));
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

/* =========================================================
   BERKAS DOKUMEN (PDF/DOC/DOCX) — Pembacaan & Validasi File
   ---------------------------------------------------------
   Dipakai oleh admin/dokumen.html. Berbeda dari compressImageFile karena
   dokumen tidak bisa dikompres begitu saja, jadi batas ukuran diterapkan
   agar localStorage (kuota ~5MB) tidak cepat penuh oleh berkas biner.
   ========================================================= */
function formatFileSize(bytes) {
  if (!bytes && bytes !== 0) return '';
  if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  if (bytes >= 1024) return Math.round(bytes / 1024) + ' KB';
  return bytes + ' B';
}

const DOKUMEN_MAX_SIZE_MB = 5;
const DOKUMEN_ALLOWED_EXT = { pdf: 'PDF', doc: 'DOC', docx: 'DOCX' };

function readDocumentFile(file) {
  return new Promise((resolve, reject) => {
    if (!file) { reject(new Error('Tidak ada file yang dipilih.')); return; }
    const ext = (file.name.split('.').pop() || '').toLowerCase();
    const format = DOKUMEN_ALLOWED_EXT[ext];
    if (!format) {
      reject(new Error('Format tidak didukung. Hanya file PDF, DOC, atau DOCX yang bisa diunggah.'));
      return;
    }
    const maxBytes = DOKUMEN_MAX_SIZE_MB * 1024 * 1024;
    if (file.size > maxBytes) {
      reject(new Error(`Ukuran file terlalu besar (maks. ${DOKUMEN_MAX_SIZE_MB} MB). Pilih berkas yang lebih kecil.`));
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Gagal membaca file. Coba unggah ulang.'));
    reader.onload = () => {
      resolve({
        fileName: file.name,
        fileData: reader.result,
        format,
        ukuran: formatFileSize(file.size)
      });
    };
    reader.readAsDataURL(file);
  });
}

/* =========================================================
   PENGUNJUNG — pencatatan kunjungan riil (bukan angka statis)
   ---------------------------------------------------------
   Prototipe ini murni front-end (tanpa server), jadi tidak bisa
   menghitung pengunjung dari semua orang di internet. Yang bisa
   dilakukan secara jujur & akurat: mencatat kunjungan riil pada
   BROWSER/PERANGKAT ini ke localStorage setiap halaman publik
   dimuat, lalu Dashboard menampilkan angka riil tsb (bukan data
   ilustrasi/hardcode lagi).
   ========================================================= */
const PAGEVIEW_KEY = 'prodihukum_pageviews_v1';
function trackPageView() {
  try {
    const isAdmin = /\/admin\//.test(window.location.pathname);
    if (isAdmin) return;
    const today = new Date().toISOString().slice(0, 10);
    const log = JSON.parse(localStorage.getItem(PAGEVIEW_KEY) || '{}');
    log[today] = (log[today] || 0) + 1;
    localStorage.setItem(PAGEVIEW_KEY, JSON.stringify(log));
  } catch (e) { /* noop: pencatatan kunjungan tidak boleh menghentikan halaman */ }
}
function getPageViewStats() {
  let log = {};
  try { log = JSON.parse(localStorage.getItem(PAGEVIEW_KEY) || '{}'); } catch (e) { /* noop */ }
  const today = new Date().toISOString().slice(0, 10);
  const monthKey = today.slice(0, 7);
  let total = 0, thisMonth = 0;
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    days.push({ label: d.toLocaleDateString('id-ID', { weekday: 'short' }), count: log[key] || 0 });
  }
  Object.keys(log).forEach(k => {
    total += log[k];
    if (k.startsWith(monthKey)) thisMonth += log[k];
  });
  return { today: log[today] || 0, thisMonth, total, days };
}
trackPageView();

/* ---- Parser tanggal singkat berbahasa Indonesia ("20 Agu 2026") ----
   Dipakai Dashboard admin untuk menghitung tren konten per bulan dari
   data SAMPLE_* yang sesungguhnya, bukan dari angka ilustrasi hardcode. */
const BULAN_ID = { jan: 0, feb: 1, mar: 2, apr: 3, mei: 4, jun: 5, jul: 6, agu: 7, sep: 8, okt: 9, nov: 10, des: 11 };
function parseTanggalId(str) {
  if (!str || typeof str !== 'string') return null;
  const m = str.trim().toLowerCase().match(/^(\d{1,2})\s+([a-z]{3,})\s+(\d{4})$/);
  if (!m) return null;
  const bulan = BULAN_ID[m[2].slice(0, 3)];
  if (bulan === undefined) return null;
  return new Date(parseInt(m[3], 10), bulan, parseInt(m[1], 10));
}
// Menghitung, untuk 6 bulan terakhir (relatif terhadap bulan terbaru yang ada
// di data), berapa item per entitas yang tanggalnya jatuh di bulan tsb.
function monthlyContentTrend() {
  const sources = { Berita: SAMPLE_BERITA, Artikel: SAMPLE_ARTIKEL, Kegiatan: SAMPLE_KEGIATAN };
  const allDates = [];
  Object.values(sources).forEach(list => list.forEach(item => {
    const d = parseTanggalId(item.tanggal);
    if (d) allDates.push(d);
  }));
  const anchor = allDates.length ? new Date(Math.max(...allDates)) : new Date();
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(anchor.getFullYear(), anchor.getMonth() - i, 1);
    months.push({ year: d.getFullYear(), month: d.getMonth(), label: d.toLocaleDateString('id-ID', { month: 'short' }) });
  }
  const datasets = {};
  Object.entries(sources).forEach(([name, list]) => {
    datasets[name] = months.map(({ year, month }) =>
      list.filter(item => {
        const d = parseTanggalId(item.tanggal);
        return d && d.getFullYear() === year && d.getMonth() === month;
      }).length
    );
  });
  return { labels: months.map(m => m.label), datasets };
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
  // Dipakai setiap kali DB.save()/persist() gagal (biasanya localStorage
  // penuh) supaya admin SELALU tahu kenapa perubahannya tidak tersimpan,
  // alih-alih perubahan dibatalkan diam-diam tanpa penjelasan.
  storageFull(msg = 'Penyimpanan browser sudah penuh sehingga data tidak dapat disimpan. Perubahan Anda TIDAK jadi disimpan (dibatalkan). Hapus beberapa foto/data lama (mis. di menu Galeri, Berita, atau Kegiatan) untuk mengosongkan ruang, lalu coba lagi.') {
    return this.base({ icon: 'error', title: 'Penyimpanan Penuh', text: msg });
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
  { id: 1, nama: 'Dr. Ahmad Fauzi, S.H., M.H.', jabatan: 'Lektor Kepala', keahlian: 'Hukum Pidana', pendidikan: 'S3 Ilmu Hukum', email: 'ahmad.fauzi@ump.ac.id', nidn: '1234567890', profil: 'Dosen dengan pengalaman praktik hukum pidana dan penelitian sistem peradilan.', status: 'Aktif', foto: 'assets/image/dosen/Dosen 1.png' },
  { id: 2, nama: 'Rina Marlina, S.H., M.H.', jabatan: 'Lektor', keahlian: 'Hukum Perdata', pendidikan: 'S2 Kenotariatan', email: 'rina.marlina@ump.ac.id', nidn: '1234567891', profil: 'Spesialis hukum kontrak dan praktik kenotariatan.', status: 'Aktif', foto: 'assets/image/dosen/Dosen 2.png' },
  { id: 3, nama: 'Yusuf Kamal, S.H., M.Kn.', jabatan: 'Lektor', keahlian: 'Hukum Tata Negara', pendidikan: 'S2 Hukum', email: 'yusuf.kamal@ump.ac.id', nidn: '1234567892', profil: 'Fokus pada studi konstitusi dan otonomi daerah.', status: 'Aktif', foto: 'assets/image/dosen/Dosen 3.png' },
  { id: 4, nama: 'Dr. Siti Aminah, S.H., M.H.', jabatan: 'Profesor', keahlian: 'Hukum Internasional', pendidikan: 'S3 Ilmu Hukum', email: 'siti.aminah@ump.ac.id', nidn: '1234567893', profil: 'Peneliti hukum internasional dan hubungan bilateral.', status: 'Aktif', foto: 'assets/image/dosen/Dosen 4.png' },
  { id: 5, nama: 'Bayu Segara, S.H., M.H.', jabatan: 'Asisten Ahli', keahlian: 'Hukum Adat', pendidikan: 'S2 Hukum', email: 'bayu.segara@ump.ac.id', nidn: '1234567894', profil: 'Mengkaji hukum adat Papua dan resolusi konflik lokal.', status: 'Nonaktif', foto: 'assets/image/dosen/Dosen 5.png' },
  { id: 6, nama: 'Maria Kabes, S.H., M.H.', jabatan: 'Dosen', keahlian: 'Hukum Administrasi Negara', pendidikan: 'S2 Hukum', email: 'maria.kabes@ump.ac.id', nidn: '1234567895', profil: 'Praktisi dan pengajar hukum administrasi pemerintahan.', status: 'Aktif', foto: 'assets/image/dosen/Dosen 6.png' },
  { id: 7, nama: 'Dr. Petrus Womsiwor, S.H., M.H.', jabatan: 'Lektor', keahlian: 'Hukum Lingkungan', pendidikan: 'S3 Ilmu Hukum', email: 'petrus.womsiwor@ump.ac.id', nidn: '1234567896', profil: 'Meneliti hukum lingkungan dan pengelolaan sumber daya alam di Papua.', status: 'Aktif', foto: 'assets/image/dosen/Dosen 7.png' },
  { id: 8, nama: 'Fransiska Mote, S.H., M.Kn.', jabatan: 'Asisten Ahli', keahlian: 'Hukum Agraria', pendidikan: 'S2 Kenotariatan', email: 'fransiska.mote@ump.ac.id', nidn: '1234567897', profil: 'Fokus pada sengketa tanah adat dan hukum pertanahan.', status: 'Aktif', foto: 'assets/image/dosen/Dosen 8.png' },
  { id: 9, nama: 'Yohanes Sroyer, S.H., M.H.', jabatan: 'Dosen', keahlian: 'Hukum Acara', pendidikan: 'S2 Hukum', email: 'yohanes.sroyer@ump.ac.id', nidn: '1234567898', profil: 'Mengajar hukum acara pidana dan perdata praktik peradilan.', status: 'Aktif', foto: 'assets/image/dosen/Dosen 9.png' },
  { id: 10, nama: 'Dr. Herlina Yaung, S.H., M.H.', jabatan: 'Lektor Kepala', keahlian: 'Hukum Ketenagakerjaan', pendidikan: 'S3 Ilmu Hukum', email: 'herlina.yaung@ump.ac.id', nidn: '1234567899', profil: 'Peneliti hubungan industrial dan perlindungan tenaga kerja.', status: 'Aktif', foto: 'assets/image/dosen/Dosen 10.png' }
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

function getSearchIndex() {
  return [
    ...SAMPLE_BERITA.filter(b => b.status === 'Published').map(b => ({ title: b.judul, url: `detail-berita.html?id=${b.id}`, type: 'Berita', keywords: `${b.judul} ${b.kategori} ${b.penulis || ''}` })),
    ...SAMPLE_DOSEN.map(d => ({ title: d.nama, url: 'dosen.html', type: 'Dosen', keywords: `${d.nama} ${d.keahlian} ${d.jabatan}` })),
    ...SAMPLE_DOKUMEN.map(d => ({ title: d.nama, url: 'dokumen.html', type: 'Dokumen', keywords: `${d.nama} ${d.kategori}` })),
    ...SAMPLE_KEGIATAN.map(k => ({ title: k.nama, url: `detail-kegiatan.html?id=${k.id}`, type: 'Kegiatan', keywords: `${k.nama} ${k.lokasi} ${k.deskripsi || ''}` })),
    ...SAMPLE_PENGUMUMAN.map(p => ({ title: p.judul, url: `detail-pengumuman.html?id=${p.id}`, type: 'Pengumuman', keywords: `${p.judul} ${p.status} ${p.isi || ''}` })),
    ...SAMPLE_ARTIKEL.filter(a => a.status === 'Published').map(a => ({ title: a.judul, url: `detail-artikel.html?id=${a.id}`, type: 'Artikel', keywords: `${a.judul} ${a.kategori} ${a.penulis || ''} ${a.tags || ''}` })),
    ...SAMPLE_ALUMNI.map(a => ({ title: a.nama, url: 'alumni.html', type: 'Alumni', keywords: `${a.nama} ${a.pekerjaan} ${a.instansi}` })),
    ...SAMPLE_PRESTASI.map(p => ({ title: p.nama, url: 'prestasi.html', type: 'Prestasi', keywords: `${p.nama} ${p.kategori} ${p.tingkat}` })),
    ...SAMPLE_KURIKULUM.map(k => ({ title: k.nama, url: 'kurikulum.html', type: 'Kurikulum', keywords: `${k.kode} ${k.nama}` }))
  ];
}

// Mengubah path aset lokal (mis. 'assets/image/dosen/Dosen 1.png') menjadi path
// yang valid baik saat dibuka dari halaman publik (root proyek) maupun dari
// halaman admin (subfolder /admin/). URL eksternal (http/https, mis. placeholder)
// dikembalikan apa adanya.
function assetPath(path) {
  if (!path) return path;
  if (/^(https?:)?\/\//i.test(path) || /^data:/i.test(path)) return path;
  const inAdmin = /\/admin\//.test(window.location.pathname);
  return inAdmin ? '../' + path : path;
}

function parseHari(str) {
  if (!str) return '15';
  const m = String(str).match(/^(\d{1,2})/);
  return m ? m[1] : '15';
}

function parseBulan(str) {
  if (!str) return 'AGU';
  const m = String(str).match(/[a-zA-Z]{3,}/);
  return m ? m[0].slice(0, 3).toUpperCase() : 'AGU';
}

function getPengumumanBadge(status) {
  switch ((status || '').toLowerCase().trim()) {
    case 'penting': return 'badge-important';
    case 'baru': return 'badge-new';
    case 'aktif': return 'badge-active';
    case 'berakhir': return 'badge-ended';
    default: return 'badge-new';
  }
}

function globalSearch(query) {
  const q = (query || '').trim().toLowerCase();
  if (!q) {
    NeuAlert.error('Masukkan kata kunci pencarian.');
    return;
  }
  const index = getSearchIndex();
  const results = index.filter(item =>
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
    get siteSettings() {
      return SAMPLE_PENGATURAN;
    },
    ...themeStore(),
    doSearch() {
      globalSearch(this.searchQ);
    }
  };
}

// ---- Statistik & Konten Beranda (index.html) ----
function homeStats() {
  return {
    get mahasiswa() { return SAMPLE_PENGATURAN.mahasiswaAktif; },
    get dosen() { return SAMPLE_DOSEN.length; },
    get akreditasi() { return SAMPLE_PROFIL.akreditasi; },
    get kurikulum() { return SAMPLE_KURIKULUM.length; },
    get alumni() { return SAMPLE_ALUMNI.length; },
    get prestasi() { return SAMPLE_PRESTASI.length; },
    get latestBerita() {
      // Hanya berita berstatus 'Published' yang boleh tampil di sisi publik —
      // sebelumnya status Draft/Review ikut tampil karena tidak difilter.
      const published = SAMPLE_BERITA.filter(b => b.status === 'Published');
      return published.find(b => b.featured) || published[0] || null;
    },
    get upcomingKegiatan() {
      return SAMPLE_KEGIATAN.slice(0, 3);
    },
    get nextEvent() {
      return SAMPLE_KEGIATAN[0] || null;
    }
  };
}

function adminShell() {
  return {
    sidebarOpen: false,
    notifOpen: false,
    q: '',
    // Reactive owned array — Alpine detects mutations here
    _notifications: [...(SAMPLE_NOTIFIKASI || [])],
    ...themeStore(),
    init() {
      AUTH.guard();
      // Sync from global on init (in case logActivity ran before Alpine started)
      this._notifications = [...(SAMPLE_NOTIFIKASI || [])];
      // Listen for new notifications from logActivity() or any source
      window.addEventListener('notif-update', () => {
        this._notifications = [...(SAMPLE_NOTIFIKASI || [])];
      });
    },
    get currentUser() {
      return AUTH.current();
    },
    get siteSettings() {
      return SAMPLE_PENGATURAN;
    },
    // notifications: directly return reactive array (Alpine tracks _notifications)
    get notifications() {
      return this._notifications;
    },
    get unreadNotifs() {
      return this._notifications.filter(n => !n.read).length;
    },
    // Call this after logActivity() to refresh notif list reactively
    refreshNotifs() {
      this._notifications = [...(SAMPLE_NOTIFIKASI || [])];
    },
    markAllRead() {
      this._notifications = this._notifications.map(n => ({ ...n, read: true }));
      SAMPLE_NOTIFIKASI = [...this._notifications];
      DB.save('notifikasi', SAMPLE_NOTIFIKASI);
      if (typeof NeuAlert !== 'undefined') NeuAlert.success('Semua notifikasi ditandai dibaca.');
    },
    clearNotifs() {
      this._notifications = [];
      SAMPLE_NOTIFIKASI = [];
      DB.save('notifikasi', []);
      if (typeof NeuAlert !== 'undefined') NeuAlert.success('Semua notifikasi dibersihkan.');
    },
    get stats() {
      return {
        dosen: SAMPLE_DOSEN.length,
        mahasiswa: SAMPLE_PENGATURAN.mahasiswaAktif,
        alumni: SAMPLE_ALUMNI.length,
        berita: SAMPLE_BERITA.length,
        kegiatan: SAMPLE_KEGIATAN.length,
        artikel: SAMPLE_ARTIKEL.length,
        dokumen: SAMPLE_DOKUMEN.length,
        galeri: SAMPLE_GALERI.length,
        pendaftar: SAMPLE_PENDAFTAR.length
      };
    },
    get recentActivity() {
      return SAMPLE_AKTIVITAS.slice(0, 4);
    },
    get activityLog() {
      return SAMPLE_AKTIVITAS;
    },
    get contentTrend() {
      return monthlyContentTrend();
    },
    get pageViews() {
      return getPageViewStats();
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
  // Halaman publik hanya menampilkan berita berstatus 'Published' — berita
  // berstatus 'Draft'/'Review' hanya boleh terlihat dari panel admin.
  const publishedBerita = SAMPLE_BERITA.filter(b => b.status === 'Published');
  const base = filterableGrid(publishedBerita, { searchKeys: ['judul', 'kategori'], filterKey: 'kategori', filters: kategoriFilters });
  return mergeReactive(base, {
    get featured() {
      return publishedBerita.find(b => b.featured) || publishedBerita[0];
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
        // Dokumen yang diunggah lewat panel admin (punya fileData asli) diunduh
        // sungguhan. Dokumen contoh/bawaan (tanpa file asli) tetap memakai
        // simulasi seperti sebelumnya supaya tidak menampilkan file kosong/error.
        if (doc.fileData) {
          const a = document.createElement('a');
          a.href = doc.fileData;
          a.download = doc.fileName || (doc.nama + '.' + (doc.format || 'pdf').toLowerCase());
          document.body.appendChild(a);
          a.click();
          a.remove();
          NeuAlert.success(`Mengunduh "${doc.nama}".`);
        } else {
          NeuAlert.success(`Unduhan "${doc.nama}" dimulai (simulasi).`);
        }
      }
    }
  );
}

function galeriPage() {
  // 7 album/kategori galeri (di luar "Semua") — jumlah ini HARUS selalu
  // sinkron dengan opsi "Kategori Album" pada form admin/galeri.html supaya
  // setiap foto yang diunggah admin pasti punya folder tempat "mendarat"
  // di halaman publik.
  const albumFilters = ['Semua', 'Seminar', 'Kuliah Umum', 'Praktikum', 'Kegiatan Mahasiswa', 'Wisuda', 'Pengabdian', 'Penelitian'];
  const base = filterableGrid(SAMPLE_GALERI, { searchKeys: ['judul', 'album'], filterKey: 'album', filters: albumFilters });
  return mergeReactive(
    base,
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
      },
      // ---------------------------------------------------------------
      // TAMPILAN "FOLDER ALBUM" saat filter aktif = "Semua"
      // ---------------------------------------------------------------
      // Dibaca ulang setiap kali diakses (getter), jadi selalu sinkron
      // dengan SAMPLE_GALERI terbaru (mis. setelah admin upload/hapus foto
      // di tab lain lalu localStorage disegarkan). Setiap folder mewakili
      // 1 album/kategori (total 7) dan memakai foto PALING BARU pada album
      // tsb sebagai sampul, plus jumlah total foto di album itu.
      get albumFolders() {
        return albumFilters
          .filter(f => f !== 'Semua')
          .map(album => {
            const items = SAMPLE_GALERI.filter(g => g.album === album);
            return {
              album,
              cover: items[0] ? items[0].src : 'https://placehold.co/360x280/EEF1F5/0B1F3A?text=' + encodeURIComponent(album),
              total: items.length
            };
          });
      },
      // Folder hanya ditampilkan saat filter = "Semua" DAN tidak sedang
      // mencari (pencarian tetap harus menampilkan foto individual, bukan
      // folder, sesuai perilaku pencarian di halaman lain).
      get showFolders() {
        return this.activeFilter === 'Semua' && this.q.trim() === '';
      },
      // Klik folder = pindah filter ke album tsb (TIDAK pindah halaman),
      // sehingga tidak menyentuh/menggunakan detail-galeri.html sama sekali.
      openAlbum(album) {
        this.setFilter(album);
        this.q = '';
      },
      backToAlbums() {
        this.setFilter('Semua');
      }
    }
  );
}

function detailFromQuery(items, param = 'id') {
  const id = Number(new URLSearchParams(window.location.search).get(param));
  if (!items || items.length === 0) {
    return {
      id: 0,
      judul: 'Konten Tidak Ditemukan',
      nama: 'Konten Tidak Ditemukan',
      kategori: 'Umum',
      album: 'Umum',
      status: 'Info',
      badge: 'badge-new',
      tanggal: 'Hari ini',
      hari: '01',
      bulan: 'JAN',
      waktu: '-',
      lokasi: '-',
      penyelenggara: 'Prodi Hukum UMP',
      penulis: 'Admin',
      excerpt: 'Konten belum tersedia atau telah dihapus.',
      konten: '',
      isi: 'Konten yang Anda cari belum tersedia atau telah dihapus.',
      deskripsi: 'Konten yang Anda cari belum tersedia atau telah dihapus.',
      referensi: '-',
      lampiran: null,
      gambar: 'https://placehold.co/600x400/EEF1F5/0B1F3A?text=Tidak+Ada+Gambar',
      thumbnail: 'https://placehold.co/600x400/EEF1F5/0B1F3A?text=Tidak+Ada+Gambar',
      src: 'https://placehold.co/600x400/EEF1F5/0B1F3A?text=Tidak+Ada+Gambar'
    };
  }
  return items.find(x => x.id === id) || items[0];
}

function detailBeritaPage() {
  // Sama seperti beritaPage(): hanya berita 'Published' yang boleh diakses
  // langsung lewat halaman detail publik, meski id-nya ditebak lewat URL.
  const publishedBerita = SAMPLE_BERITA.filter(b => b.status === 'Published');
  const item = detailFromQuery(publishedBerita);
  return {
    item,
    related: publishedBerita.filter(b => b.id !== item.id).slice(0, 3)
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
  { id: 1, nama: 'Seminar Nasional Hukum Digital', tanggal: '28 Agu 2026', hari: '28', bulan: 'Agu', waktu: '09.00 – 12.00', lokasi: 'Aula Fakultas Hukum', penyelenggara: 'Program Studi Hukum UMP', deskripsi: 'Membahas transformasi hukum di era digital bersama praktisi dan akademisi nasional.', gambar: 'assets/image/kegiatan/4 (4).png' },
  { id: 2, nama: 'Kuliah Umum Hukum Adat Papua', tanggal: '30 Agu 2026', hari: '30', bulan: 'Agu', waktu: '13.00 – 15.00', lokasi: 'Ruang Sidang Utama', penyelenggara: 'Program Studi Hukum UMP', deskripsi: 'Menghadirkan tokoh adat dan akademisi hukum adat sebagai narasumber.', gambar: 'assets/image/kegiatan/4 (3).png' },
  { id: 3, nama: 'Workshop Legal Drafting', tanggal: '05 Sep 2026', hari: '05', bulan: 'Sep', waktu: '09.00 – 16.00', lokasi: 'Laboratorium Hukum', penyelenggara: 'Laboratorium Hukum', deskripsi: 'Pelatihan penyusunan dokumen hukum untuk mahasiswa semester akhir.', gambar: 'assets/image/kegiatan/4 (2).png' },
  { id: 4, nama: 'Pengabdian Masyarakat: Penyuluhan Hukum', tanggal: '12 Sep 2026', hari: '12', bulan: 'Sep', waktu: '08.00 – selesai', lokasi: 'Kampung Yobe, Jayapura', penyelenggara: 'Tim PKM Prodi Hukum', deskripsi: 'Penyuluhan hukum dasar bagi masyarakat sekitar kampus.', gambar: 'assets/image/kegiatan/4 (1).png' }
];
let SAMPLE_KEGIATAN = DB.load('kegiatan', SEED_KEGIATAN);

/* ---- Pendaftar Kegiatan (fitur "Daftar" pada detail-kegiatan.html) ----
   Sebelumnya tombol "Daftar Kegiatan Sekarang" hanya memicu alert simulasi
   tanpa benar-benar menyimpan data siapa pun yang mendaftar, sehingga Admin
   Panel tidak pernah bisa melihat daftar pesertanya. Sekarang setiap
   pendaftaran disimpan sungguhan ke DB (localStorage) dan dapat dilihat/
   dihapus dari Admin Panel > Kegiatan. */
const SEED_PENDAFTAR = [
  { id: 1, kegiatanId: 1, kegiatanNama: 'Seminar Nasional Hukum Digital', nama: 'Yohanes Rumbrar', email: 'yohanes.rumbrar@mhs.ump.ac.id', whatsapp: '081234567801', instansi: 'Mahasiswa Semester 5', waktuDaftar: '26 Agu 2026, 09.12' },
  { id: 2, kegiatanId: 1, kegiatanNama: 'Seminar Nasional Hukum Digital', nama: 'Fransiska Ayamiseba', email: 'fransiska.a@mhs.ump.ac.id', whatsapp: '081234567802', instansi: 'Mahasiswa Semester 3', waktuDaftar: '26 Agu 2026, 14.40' },
  { id: 3, kegiatanId: 2, kegiatanNama: 'Kuliah Umum Hukum Adat Papua', nama: 'Petrus Kareth', email: 'petrus.kareth@mhs.ump.ac.id', whatsapp: '081234567803', instansi: 'Mahasiswa Semester 7', waktuDaftar: '27 Agu 2026, 10.05' }
];
let SAMPLE_PENDAFTAR = DB.load('pendaftar', SEED_PENDAFTAR);

/* Log aktivitas dari halaman PUBLIK (bukan Admin) — dipisah dari
   logActivity() karena logActivity mengasumsikan ada admin yang sedang
   login (AUTH.current()). Notifikasi tetap masuk ke Admin Panel supaya
   pendaftaran baru langsung terlihat oleh admin. */
function logPublicEvent(aksi, icon) {
  const entry = {
    id: Date.now(),
    user: 'Pengunjung Website',
    aksi,
    waktu: 'Baru saja',
    tanggalIso: new Date().toISOString(),
    icon: icon || '\u{1F4DD}'
  };
  SAMPLE_AKTIVITAS = [entry, ...SAMPLE_AKTIVITAS].slice(0, 25);
  DB.save('aktivitas', SAMPLE_AKTIVITAS);

  const notif = {
    id: Date.now() + 1,
    judul: aksi,
    pesan: 'Dikirim melalui formulir pendaftaran di halaman publik.',
    waktu: 'Baru saja',
    read: false,
    icon: icon || '\u{1F514}'
  };
  SAMPLE_NOTIFIKASI = [notif, ...SAMPLE_NOTIFIKASI].slice(0, 30);
  DB.save('notifikasi', SAMPLE_NOTIFIKASI);
  window.dispatchEvent(new CustomEvent('notif-update'));
}

// Mengambil daftar pendaftar untuk satu kegiatan tertentu.
function pesertaKegiatan(kegiatanId) {
  return SAMPLE_PENDAFTAR.filter(p => p.kegiatanId === kegiatanId);
}

// Memproses pendaftaran kegiatan dari halaman publik. Melakukan validasi,
// mencegah pendaftaran ganda (email sama pada kegiatan sama), lalu
// menyimpan data ke DB supaya bisa dipantau dari Admin Panel.
function daftarKegiatan(kegiatanId, kegiatanNama, form) {
  const nama = String(form.nama || '').trim();
  const email = String(form.email || '').trim();
  const whatsapp = String(form.whatsapp || '').trim();
  const instansi = String(form.instansi || '').trim();

  if (!nama || !email || !whatsapp) {
    return { ok: false, message: 'Nama, Email, dan No. WhatsApp wajib diisi.' };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, message: 'Format email tidak valid.' };
  }
  if (whatsapp.replace(/\D/g, '').length < 9) {
    return { ok: false, message: 'Nomor WhatsApp tidak valid.' };
  }
  const sudahDaftar = SAMPLE_PENDAFTAR.some(p =>
    p.kegiatanId === kegiatanId && p.email.toLowerCase() === email.toLowerCase()
  );
  if (sudahDaftar) {
    return { ok: false, message: 'Email ini sudah terdaftar pada kegiatan tersebut.' };
  }

  const entry = {
    id: Date.now(),
    kegiatanId,
    kegiatanNama,
    nama,
    email,
    whatsapp,
    instansi: instansi || '-',
    waktuDaftar: new Date().toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  };
  SAMPLE_PENDAFTAR = [entry, ...SAMPLE_PENDAFTAR];
  const savedOk = DB.save('pendaftar', SAMPLE_PENDAFTAR);
  if (!savedOk) {
    SAMPLE_PENDAFTAR = SAMPLE_PENDAFTAR.filter(p => p.id !== entry.id);
    return { ok: false, message: 'Gagal menyimpan pendaftaran. Silakan coba lagi.' };
  }
  logPublicEvent(`Pendaftaran baru kegiatan "${kegiatanNama}" oleh ${nama}`, '\u{1F4DD}');
  return { ok: true };
}

const SEED_ARTIKEL = [
  { id: 1, judul: 'Restorative Justice dalam Sistem Peradilan Pidana Indonesia', penulis: 'Dr. Ahmad Fauzi, S.H., M.H.', kategori: 'Hukum Pidana', tanggal: '15 Agu 2026', isi: 'Kajian ini menelaah penerapan restorative justice dalam sistem peradilan pidana Indonesia serta implikasinya bagi korban dan pelaku.', referensi: 'KUHP; UU No. 11 Tahun 2012 tentang Sistem Peradilan Pidana Anak.', tags: 'restorative justice, pidana, KUHP', status: 'Published', thumbnail: 'https://placehold.co/400x220/EEF1F5/0B1F3A?text=Artikel+Hukum' },
  { id: 2, judul: 'Eksistensi Hukum Adat Papua dalam Sistem Hukum Nasional', penulis: 'Bayu Segara, S.H., M.H.', kategori: 'Hukum Adat', tanggal: '12 Agu 2026', isi: 'Artikel membahas kedudukan hukum adat Papua dalam kerangka hukum nasional dan praktik penyelesaian sengketa adat.', referensi: 'UUD 1945 Pasal 18B ayat (2).', tags: 'hukum adat, Papua, otonomi khusus', status: 'Published', thumbnail: 'https://placehold.co/400x220/EEF1F5/0B1F3A?text=Artikel+Hukum' },
  { id: 3, judul: 'Perlindungan Hukum bagi UMKM di Era Ekonomi Digital', penulis: 'Rina Marlina, S.H., M.H.', kategori: 'Hukum Bisnis', tanggal: '10 Agu 2026', isi: 'Studi perlindungan pelaku UMKM pada transaksi digital, termasuk kontrak elektronik dan perlindungan konsumen.', referensi: 'UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi.', tags: 'UMKM, ekonomi digital, konsumen', status: 'Published', thumbnail: 'https://placehold.co/400x220/EEF1F5/0B1F3A?text=Artikel+Hukum' },
  { id: 4, judul: 'Dinamika Otonomi Khusus Papua Pasca Revisi UU', penulis: 'Yusuf Kamal, S.H., M.Kn.', kategori: 'Hukum Tata Negara', tanggal: '05 Agu 2026', isi: 'Analisis implikasi revisi undang-undang otonomi khusus terhadap tata kelola pemerintahan daerah di Papua.', referensi: 'UU Otonomi Khusus Papua beserta perubahannya.', tags: 'otonomi khusus, tata negara, Papua', status: 'Published', thumbnail: 'https://placehold.co/400x220/EEF1F5/0B1F3A?text=Artikel+Hukum' }
];
let SAMPLE_ARTIKEL = DB.load('artikel', SEED_ARTIKEL);

const SEED_PRESTASI = [
  { id: 1, nama: 'Juara 1 Moot Court Competition Nasional 2026', kategori: 'Mahasiswa', tingkat: 'Nasional', tahun: '2026', foto: 'https://placehold.co/320x200/EEF1F5/0B1F3A?text=Moot+Court' },
  { id: 2, nama: 'Juara 2 Debat Konstitusi Wilayah Papua', kategori: 'Mahasiswa', tingkat: 'Regional', tahun: '2026', foto: 'https://placehold.co/320x200/EEF1F5/0B1F3A?text=Debat+Konstitusi' },
  { id: 3, nama: 'Best Paper Award, Konferensi Hukum Internasional', kategori: 'Dosen', tingkat: 'Internasional', tahun: '2025', foto: 'https://placehold.co/320x200/EEF1F5/0B1F3A?text=Best+Paper' },
  { id: 4, nama: 'Terpilih sebagai Hakim Ad Hoc Pengadilan Tipikor', kategori: 'Alumni', tingkat: 'Nasional', tahun: '2025', foto: 'https://placehold.co/320x200/EEF1F5/0B1F3A?text=Hakim+Ad+Hoc' },
  { id: 5, nama: 'Peringkat Terbaik Prodi Hukum se-Papua', kategori: 'Program Studi', tingkat: 'Provinsi', tahun: '2025', foto: 'https://placehold.co/320x200/EEF1F5/0B1F3A?text=Peringkat+Terbaik' },
  { id: 6, nama: 'Juara 3 Lomba Karya Tulis Ilmiah Hukum', kategori: 'Mahasiswa', tingkat: 'Nasional', tahun: '2024', foto: 'https://placehold.co/320x200/EEF1F5/0B1F3A?text=Karya+Tulis+Ilmiah' }
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

// Notifikasi Real-Time Admin Panel
const SEED_NOTIFIKASI = [
  { id: 1, judul: 'Pembaruan Sistem', pesan: 'Sistem Website Prodi Hukum telah disinkronkan secara dinamis.', waktu: '5 menit lalu', read: false, icon: '\u{1F680}' },
  { id: 2, judul: 'Pemberitahuan Akademik', pesan: 'Data alumni, dosen, dan kurikulum aktif terverifikasi.', waktu: '1 jam lalu', read: false, icon: '\u{1F4C4}' },
  { id: 3, judul: 'Backup Siap', pesan: 'Database lokal dan IndexedDB sinkron dan aman.', waktu: '2 jam lalu', read: true, icon: '\u{1F4BE}' }
];
let SAMPLE_NOTIFIKASI = DB.load('notifikasi', SEED_NOTIFIKASI);

const SEED_ALUMNI = [
  { id: 1, nama: 'Fadli Ramadhan, S.H.', angkatan: '2020', pekerjaan: 'Advokat', instansi: 'Kantor Hukum Fadli & Rekan', kategori: 'Bekerja', email: 'fadli@example.com', linkedin: 'https://linkedin.com', status: 'Aktif', foto: 'assets/image/alumni/alumni 1.png' },
  { id: 2, nama: 'Melinda Kogoya, S.H.', angkatan: '2019', pekerjaan: 'Legal Officer', instansi: 'PT Papua Sejahtera', kategori: 'Bekerja', email: 'melinda@example.com', linkedin: 'https://linkedin.com', status: 'Aktif', foto: 'assets/image/alumni/alumni 2.png' },
  { id: 3, nama: 'Yohanes Sroyer, S.H.', angkatan: '2018', pekerjaan: 'Aparatur Sipil Negara', instansi: 'Kejaksaan Negeri Jayapura', kategori: 'Bekerja', email: 'yohanes@example.com', linkedin: 'https://linkedin.com', status: 'Aktif', foto: 'assets/image/alumni/alumni 3.png' },
  { id: 4, nama: 'Sari Wulandari, S.H.', angkatan: '2021', pekerjaan: 'Magister Hukum', instansi: 'Universitas Gadjah Mada', kategori: 'Studi Lanjut', email: 'sari@example.com', linkedin: 'https://linkedin.com', status: 'Aktif', foto: 'assets/image/alumni/alumni 4.png' },
  { id: 5, nama: 'Hendra Wijaya, S.H.', angkatan: '2022', pekerjaan: 'Founder Legal Startup', instansi: 'Papua Legal Hub', kategori: 'Wirausaha', email: 'hendra@example.com', linkedin: 'https://linkedin.com', status: 'Aktif', foto: 'assets/image/alumni/alumni 5.png' },
  { id: 6, nama: 'Gloria Numberi, S.H.', angkatan: '2020', pekerjaan: 'Staf Legal', instansi: 'Bank Papua', kategori: 'Bekerja', email: 'gloria@example.com', linkedin: 'https://linkedin.com', status: 'Aktif', foto: 'assets/image/alumni/alumni 6.png' }
];
let SAMPLE_ALUMNI = DB.load('alumni', SEED_ALUMNI);

// Pengguna Admin Panel (Super Admin, Admin Prodi, Editor, Operator)
// Catatan: `password` di sini disimpan polos hanya karena seluruh proyek adalah
// prototipe front-end tanpa backend (data hidup di localStorage). Ini BUKAN
// pola yang aman untuk produksi sungguhan — pada implementasi nyata, password
// wajib di-hash di server dan tidak pernah dikirim/disimpan di sisi klien.
const SEED_PENGGUNA = [
  { id: 1, nama: 'Admin Prodi', email: 'admin@ump.ac.id', password: 'admin', role: 'Super Admin', status: 'Aktif' },
  { id: 2, nama: 'Rina Marlina', email: 'editor.rina@ump.ac.id', password: 'editor123', role: 'Editor', status: 'Aktif' },
  { id: 3, nama: 'Yusuf Kamal', email: 'operator.yusuf@ump.ac.id', password: 'operator123', role: 'Operator', status: 'Nonaktif' }
];
let SAMPLE_PENGGUNA = DB.load('pengguna', SEED_PENGGUNA);

// --- PERBAIKAN BUG "LOGIN TERUS GAGAL" -----------------------------------
// Akar masalah: form "Tambah/Edit Pengguna" di admin/pengguna.html versi
// sebelumnya TIDAK memiliki field password sama sekali. Akibatnya, setiap
// akun baru yang dibuat lewat panel admin tersimpan TANPA field `password`
// (undefined) — sehingga saat login, `matched.password !== pass` selalu
// bernilai true (password dianggap salah) berapa pun password yang diketik.
// Data pengguna yang sudah telanjur tersimpan di localStorage pengguna juga
// bisa "basi" (field password/status hilang) dari sesi-sesi sebelumnya.
// Migrasi berikut memperbaiki data yang sudah ada secara otomatis, sekali
// saat aplikasi dimuat, tanpa menghapus akun kustom yang sudah dibuat admin.
(function migratePenggunaPasswords() {
  if (!Array.isArray(SAMPLE_PENGGUNA)) return;
  let changed = false;

  SAMPLE_PENGGUNA = SAMPLE_PENGGUNA.map(u => {
    const fixed = { ...u };
    // Field password hilang/kosong -> tidak bisa dipakai login sama sekali.
    // Kalau akun ini cocok dengan salah satu akun bawaan (SEED_PENGGUNA),
    // pulihkan password bawaannya. Jika bukan akun bawaan (dibuat admin
    // lewat panel sebelum field password ada di form), beri password
    // sementara berbasis id akun supaya akun tidak terkunci permanen, dan
    // catat di console agar admin tahu perlu mengganti password tersebut
    // lewat menu Pengguna.
    if (!fixed.password) {
      const seedMatch = SEED_PENGGUNA.find(s => s.email && fixed.email &&
        s.email.toLowerCase() === fixed.email.toLowerCase());
      if (seedMatch) {
        fixed.password = seedMatch.password;
      } else {
        fixed.password = 'ubah' + (fixed.id || Date.now());
        console.warn('DB: akun pengguna "' + fixed.email + '" tidak memiliki password tersimpan. ' +
          'Password sementara dibuat otomatis: ' + fixed.password + '. Segera ubah lewat menu Pengguna.');
      }
      changed = true;
    }
    if (!fixed.status) { fixed.status = 'Aktif'; changed = true; }
    return fixed;
  });

  // Jika akun Super Admin bawaan (admin@ump.ac.id) sampai hilang/terhapus,
  // kembalikan agar panel admin tidak pernah terkunci total dari semua sisi.
  if (!SAMPLE_PENGGUNA.some(u => u.email && u.email.toLowerCase() === 'admin@ump.ac.id')) {
    SAMPLE_PENGGUNA.unshift({ ...SEED_PENGGUNA[0] });
    changed = true;
  }

  if (changed) DB.save('pengguna', SAMPLE_PENGGUNA);
})();

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

// Struktur Organisasi — sebelumnya 3 kartu (nama, jabatan, foto) hardcode
// langsung di profil.html tanpa terhubung ke data apapun. Sekarang dikelola
// lewat Admin (admin/profil-prodi.html) dan disimpan di DB seperti entitas
// lain, supaya halaman publik menampilkan data yang sesungguhnya dikelola.
const SEED_STRUKTUR = [
  { id: 1, nama: 'Dr. Ahmad Fauzi, S.H., M.H.', jabatan: 'Kepala Program Studi', foto: '' },
  { id: 2, nama: 'Rina Marlina, S.H., M.H.', jabatan: 'Sekretaris Program Studi', foto: '' },
  { id: 3, nama: 'Yusuf Kamal, S.H., M.Kn.', jabatan: 'Koordinator Kemahasiswaan', foto: '' }
];
let SAMPLE_STRUKTUR = DB.load('struktur', SEED_STRUKTUR);

// Pengaturan Website — dipakai admin/pengaturan.html (form) dan ditampilkan
// di header, footer + halaman Kontak pada seluruh halaman publik.
const SEED_PENGATURAN = {
  namaWebsite: 'Program Studi Hukum UMP', deskripsi: 'Website resmi Program Studi Hukum Universitas Muhammadiyah Papua.',
  logo: '../assets/image/logo-ump.png', favicon: '../assets/image/logo-ump.png',
  theme: 'Neumorphism', primaryColor: '#2A4E9E', darkMode: true,
  metaTitle: 'Program Studi Hukum — UMP', metaDesc: 'Informasi akademik Program Studi Hukum UMP.', keywords: 'hukum, UMP, program studi hukum',
  facebook: '', instagram: '', youtube: '', linkedin: '',
  email: 'hukum@ump.ac.id', telepon: '(0967) 123-456', alamat: 'Jl. Yap Thiam Hien, Kel. Yobe, Jayapura Utara',
  mapEmbed: 'https://maps.google.com/maps?q=Universitas%20Muhammadiyah%20Papua,%20Jayapura&t=&z=15&ie=UTF8&iwloc=&output=embed',
  mapLink: 'https://maps.google.com/?q=Universitas+Muhammadiyah+Papua,+Jayapura',
  koordinat: '-2.547165, 140.669046',
  mahasiswaAktif: 350
};
let SAMPLE_PENGATURAN = DB.load('pengaturan', SEED_PENGATURAN);
if (!SAMPLE_PENGATURAN.mapEmbed) {
  SAMPLE_PENGATURAN.mapEmbed = SEED_PENGATURAN.mapEmbed;
  SAMPLE_PENGATURAN.mapLink = SEED_PENGATURAN.mapLink;
  SAMPLE_PENGATURAN.koordinat = SEED_PENGATURAN.koordinat;
}

function profilPage() {
  return {
    profil: SAMPLE_PROFIL,
    activeSection: 'tentang',
    init() {
      const handleHash = () => {
        if (window.location.hash) {
          const hash = window.location.hash.replace('#', '');
          if (['tentang', 'sejarah', 'visi-misi', 'tujuan', 'lulusan', 'struktur', 'semua'].includes(hash)) {
            this.activeSection = hash;
          }
        }
      };
      handleHash();
      window.addEventListener('hashchange', handleHash);
    },
    setSection(id) {
      this.activeSection = id;
      try {
        history.replaceState(null, '', '#' + id);
      } catch (e) { }
      if (window.innerWidth < 1024) {
        const el = document.getElementById('profil-content-area');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    },
    get misiList() {
      return String(this.profil.misi || '').split('\n').map(s => s.trim()).filter(Boolean);
    },
    get tujuanList() {
      const raw = String(this.profil.tujuan || '').trim();
      if (!raw) return [];
      const lines = raw.split('\n').map(s => s.trim()).filter(Boolean);
      if (lines.length > 1) return lines;
      return raw.split(/(?<=\.)\s+/).map(s => s.trim()).filter(Boolean);
    },
    get lulusanList() {
      return String(this.profil.lulusan || '')
        .replace(/\.$/, '')
        .split(',')
        .map(s => s.replace(/^\s*dan\s+/i, '').trim())
        .filter(Boolean)
        .map(s => s.charAt(0).toUpperCase() + s.slice(1));
    },
    struktur: SAMPLE_STRUKTUR
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
    // Tombol "Daftar" pada kartu daftar kegiatan sebelumnya memanggil
    // fungsi generik tanpa tahu kegiatan mana yang dipilih (selalu memicu
    // alert simulasi yang sama). Sekarang tombol tersebut mengarah langsung
    // ke halaman detail kegiatan yang benar dengan tautan `#daftar`, yang
    // otomatis membuka formulir pendaftaran kegiatan tersebut.
    daftarUrl(id) {
      return `detail-kegiatan.html?id=${id}#daftar`;
    }
  };
}

function artikelPage() {
  const filters = ['Semua', 'Hukum Pidana', 'Hukum Perdata', 'Hukum Tata Negara', 'Hukum Administrasi Negara', 'Hukum Internasional', 'Hukum Bisnis', 'Hukum Adat', 'Hukum Teknologi'];
  // Sama seperti berita: hanya artikel berstatus 'Published' yang tampil di
  // publik. Sebelumnya field `status` di form admin tidak pernah dipakai.
  const publishedArtikel = SAMPLE_ARTIKEL.filter(a => a.status === 'Published');
  return mergeReactive(
    filterableGrid(publishedArtikel, { searchKeys: ['judul', 'kategori', 'penulis'], filterKey: 'kategori', filters }),
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
    daftarOpen: false,
    submitting: false,
    form: { nama: '', email: '', whatsapp: '', instansi: '' },
    init() {
      // Dukungan tautan langsung `detail-kegiatan.html?id=..#daftar` dari
      // halaman kegiatan.html supaya formulir pendaftaran otomatis terbuka.
      if (window.location.hash === '#daftar') {
        this.openDaftar();
      }
    },
    // Jumlah pendaftar dihitung langsung dari data sungguhan (bukan angka
    // statis) supaya selalu konsisten dengan yang tercatat di Admin Panel.
    get jumlahPendaftar() {
      return pesertaKegiatan(this.item.id).length;
    },
    openDaftar() {
      this.form = { nama: '', email: '', whatsapp: '', instansi: '' };
      this.daftarOpen = true;
    },
    closeDaftar() {
      this.daftarOpen = false;
    },
    submitDaftar() {
      this.submitting = true;
      const res = daftarKegiatan(this.item.id, this.item.nama, this.form);
      this.submitting = false;
      if (!res.ok) {
        NeuAlert.error(res.message);
        return;
      }
      this.daftarOpen = false;
      NeuAlert.sent('Pendaftaran kegiatan berhasil dikirim. Panitia akan menghubungi Anda melalui email/WhatsApp.');
    }
  };
}

function detailArtikelPage() {
  const publishedArtikel = SAMPLE_ARTIKEL.filter(a => a.status === 'Published');
  const item = detailFromQuery(publishedArtikel);
  return {
    item,
    related: publishedArtikel.filter(a => a.id !== item.id).slice(0, 3),
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

// Ikon per kategori album — dipakai di admin/galeri.html supaya kategori
// tiap foto langsung "kentara" terlihat pada card tanpa harus membaca teks.
const ALBUM_ICONS = {
  'Seminar': '\u{1F399}\uFE0F',
  'Kuliah Umum': '\u{1F3EB}',
  'Praktikum': '\u2696\uFE0F',
  'Kegiatan Mahasiswa': '\u{1F393}',
  'Wisuda': '\u{1F393}',
  'Pengabdian': '\u{1F91D}',
  'Penelitian': '\u{1F52C}'
};

function adminGaleriPage() {
  return {
    foto: [...SAMPLE_GALERI],
    albumIcon(album) {
      return ALBUM_ICONS[album] || '\u{1F5BC}\uFE0F';
    },
    showModal: false,
    editing: null,
    uploading: false,
    q: '',
    filterAlbum: 'Semua',
    form: { judul: '', album: 'Seminar', src: '' },
    get filtered() {
      return this.foto.filter(f => {
        const matchQ = !this.q ||
          (f.judul || '').toLowerCase().includes(this.q.toLowerCase()) ||
          (f.album || '').toLowerCase().includes(this.q.toLowerCase());
        const matchAlbum = this.filterAlbum === 'Semua' || f.album === this.filterAlbum;
        return matchQ && matchAlbum;
      });
    },
    persist() {
      SAMPLE_GALERI = this.foto;
      return DB.save('galeri', this.foto);
    },
    async onFile(e) {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      this.uploading = true;
      try {
        // Foto galeri ditampilkan penuh selebar halaman di detail-galeri.html
        // (max-h-480), jadi resolusi & kualitas kompresi disamakan dengan
        // berita/artikel/kegiatan (1000x640, q0.82) supaya tidak pecah/blur.
        this.form.src = await compressImageFile(file, { maxWidth: 1000, maxHeight: 640, quality: 0.82 });
      } catch (err) {
        NeuAlert.error(err.message || 'Gagal memproses foto.');
      } finally {
        this.uploading = false;
        e.target.value = '';
      }
    },
    openAdd() {
      this.editing = null;
      this.form = { judul: '', album: 'Seminar', src: '' };
      this.showModal = true;
    },
    openEdit(item) {
      this.editing = item.id;
      this.form = { ...item };
      this.showModal = true;
    },
    save() {
      if (!this.form.judul) { NeuAlert.error('Judul/caption foto wajib diisi.'); return; }
      if (!this.form.src) { NeuAlert.error('Pilih foto terlebih dahulu.'); return; }
      if (this.editing) {
        const idx = this.foto.findIndex(f => f.id === this.editing);
        if (idx !== -1) {
          const prev = this.foto[idx];
          this.foto[idx] = { ...this.form };
          if (!this.persist()) { this.foto[idx] = prev; NeuAlert.storageFull(); return; }
          logActivity('Memperbarui foto: ' + this.form.judul, '\u270F\uFE0F');
          NeuAlert.updated('Foto galeri berhasil diperbarui.');
        }
      } else {
        const prevList = this.foto;
        const newItem = { id: Date.now(), judul: this.form.judul, album: this.form.album, src: this.form.src };
        this.foto = [newItem, ...this.foto];
        if (!this.persist()) { this.foto = prevList; NeuAlert.storageFull(); return; }
        logActivity('Mengunggah foto baru: ' + this.form.judul, '\uD83D\uDDBC\uFE0F');
        NeuAlert.success('Foto berhasil diunggah.');
      }
      this.showModal = false;
      this.form = { judul: '', album: 'Seminar', src: '' };
      this.editing = null;
    },
    async remove(item) {
      const ok = await NeuAlert.confirmDelete('foto "' + item.judul + '"');
      if (ok) {
        const prevList = this.foto;
        this.foto = this.foto.filter(f => f.id !== item.id);
        if (!this.persist()) { this.foto = prevList; NeuAlert.storageFull(); return; }
        logActivity('Menghapus foto: ' + item.judul, '\uD83D\uDDD1\uFE0F');
        NeuAlert.deleted('Foto berhasil dihapus.');
      }
    }
  };
}

/* =========================================================
   MANAJEMEN DOKUMEN — CRUD dengan unggah berkas sungguhan
   ---------------------------------------------------------
   Dipakai oleh admin/dokumen.html. Sebelumnya kotak "unggah berkas" di
   modal Tambah/Edit hanyalah <div> statis tanpa <input type="file">,
   tanpa @click, dan tanpa binding apa pun — jadi tidak melakukan apa-apa
   sama sekali saat diklik. Fungsi ini menggantinya dengan alur unggah
   nyata: memilih file PDF/DOC/DOCX, memvalidasi tipe & ukuran, lalu
   otomatis mengisi Nama (jika kosong), Format, dan Ukuran dari file asli.
   ========================================================= */
function adminDokumenTable() {
  const emptyForm = { nama: '', kategori: 'Dokumen Publik', format: 'PDF', ukuran: '', fileName: '', fileData: '' };
  return {
    rows: [...SAMPLE_DOKUMEN],
    showModal: false,
    editing: null,
    uploading: false,
    q: '',
    form: { ...emptyForm },
    get filtered() {
      return this.rows.filter(r => (r.nama || '').toLowerCase().includes(this.q.toLowerCase()));
    },
    persist() {
      SAMPLE_DOKUMEN = this.rows;
      return DB.save('dokumen', this.rows);
    },
    async onFile(e) {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      this.uploading = true;
      try {
        const result = await readDocumentFile(file);
        this.form.fileName = result.fileName;
        this.form.fileData = result.fileData;
        this.form.format = result.format;
        this.form.ukuran = result.ukuran;
        // Isi nama dokumen otomatis dari nama file (tanpa ekstensi) hanya
        // jika admin belum mengetik nama sendiri, supaya tidak menimpa
        // judul yang sudah disusun rapi.
        if (!this.form.nama.trim()) {
          this.form.nama = result.fileName.replace(/\.[^/.]+$/, '');
        }
      } catch (err) {
        NeuAlert.error(err.message || 'Gagal memproses berkas.');
      } finally {
        this.uploading = false;
        e.target.value = '';
      }
    },
    clearFile() {
      this.form.fileName = '';
      this.form.fileData = '';
      this.form.ukuran = '';
    },
    downloadRow(row) {
      if (!row.fileData) return;
      const a = document.createElement('a');
      a.href = row.fileData;
      a.download = row.fileName || (row.nama + '.' + (row.format || 'pdf').toLowerCase());
      document.body.appendChild(a);
      a.click();
      a.remove();
    },
    openAdd() {
      this.editing = null;
      this.form = { ...emptyForm };
      this.showModal = true;
    },
    openEdit(row) {
      this.editing = row.id;
      this.form = { ...emptyForm, ...row };
      this.showModal = true;
    },
    save() {
      if (!this.form.nama.trim()) { NeuAlert.error('Nama dokumen wajib diisi.'); return; }
      if (!this.editing && !this.form.fileData) { NeuAlert.error('Silakan unggah berkas PDF/DOC/DOCX terlebih dahulu.'); return; }

      if (this.editing) {
        const idx = this.rows.findIndex(x => x.id === this.editing);
        const prev = this.rows[idx];
        this.rows[idx] = { ...this.form };
        if (!this.persist()) { this.rows[idx] = prev; NeuAlert.storageFull(); return; }
        logActivity('Memperbarui dokumen: ' + this.form.nama, '\u{270F}\u{FE0F}');
        NeuAlert.updated();
      } else {
        this.form.id = Date.now();
        this.rows.unshift({ ...this.form });
        if (!this.persist()) { this.rows.shift(); NeuAlert.storageFull(); return; }
        logActivity('Mengunggah dokumen baru: ' + this.form.nama, '\u{1F4C1}');
        NeuAlert.success('Dokumen berhasil diunggah.');
      }
      this.showModal = false;
    },
    async remove(row) {
      const ok = await NeuAlert.confirmDelete('dokumen "' + row.nama + '"');
      if (ok) {
        const prevList = this.rows;
        this.rows = this.rows.filter(x => x.id !== row.id);
        if (!this.persist()) { this.rows = prevList; NeuAlert.storageFull(); return; }
        logActivity('Menghapus dokumen: ' + row.nama, '\u{1F5D1}\u{FE0F}');
        NeuAlert.deleted();
      }
    }
  };
}

/* =========================================================
   MANAJEMEN PENGGUNA — CRUD khusus dengan penanganan password
   ---------------------------------------------------------
   Dipakai oleh admin/pengguna.html. Berbeda dari adminCrudTable generik
   karena field `password` butuh perlakuan khusus:
   - WAJIB diisi saat menambah akun baru (mencegah akun tak bisa login).
   - TIDAK ditampilkan apa adanya saat edit (dikosongkan di form) demi
     keamanan, dan hanya menimpa password lama jika admin benar-benar
     mengisi field tersebut. Field kosong saat edit = password tidak
     berubah.
   ========================================================= */
function adminPenggunaTable(config) {
  return {
    showModal: false,
    editing: null,
    q: '',
    rows: [...config.rows],
    form: { ...config.emptyForm },
    get filtered() {
      const keys = config.searchKeys || ['nama', 'email'];
      return this.rows.filter(row =>
        keys.some(k => String(row[k] || '').toLowerCase().includes(this.q.toLowerCase()))
      );
    },
    persist() {
      SAMPLE_PENGGUNA = this.rows;
      return DB.save('pengguna', this.rows);
    },
    openAdd() {
      this.editing = null;
      this.form = { ...config.emptyForm };
      this.showModal = true;
    },
    openEdit(row) {
      this.editing = row.id;
      // Password lama sengaja TIDAK dimuat ke form (dikosongkan) supaya
      // tidak terpampang begitu saja di layar. Isi field ini hanya jika
      // admin ingin mengganti password akun tersebut.
      this.form = { ...row, password: '' };
      this.showModal = true;
    },
    save() {
      if (config.validate && !config.validate(this.form, !!this.editing)) return;

      if (!this.editing && !(this.form.password || '').trim()) {
        NeuAlert.error('Kata sandi wajib diisi untuk akun baru.');
        return;
      }

      if (this.editing) {
        const idx = this.rows.findIndex(x => x.id === this.editing);
        const prev = this.rows[idx];
        // Field password dikosongkan di form -> pertahankan password lama.
        const password = (this.form.password || '').trim() ? this.form.password.trim() : prev.password;
        this.rows[idx] = { ...this.form, password };
        if (!this.persist()) { this.rows[idx] = prev; NeuAlert.storageFull(); return; }
        logActivity(`Memperbarui pengguna: ${this.form.nama || ''}`.trim(), '\u{270F}\u{FE0F}');
        NeuAlert.updated();
      } else {
        this.form.id = Date.now();
        this.form.password = this.form.password.trim();
        this.rows.unshift({ ...this.form });
        if (!this.persist()) { this.rows.shift(); NeuAlert.storageFull(); return; }
        logActivity(`Menambahkan pengguna baru: ${this.form.nama || ''}`.trim(), '\u{2795}');
        NeuAlert.success();
      }
      this.showModal = false;
    },
    async remove(row) {
      const ok = await NeuAlert.confirmDelete(config.itemLabel || 'data ini');
      if (ok) {
        const prevList = this.rows;
        this.rows = this.rows.filter(x => x.id !== row.id);
        if (!this.persist()) { this.rows = prevList; NeuAlert.storageFull(); return; }
        logActivity(`Menghapus pengguna: ${row.nama || ''}`.trim(), '\u{1F5D1}\u{FE0F}');
        NeuAlert.deleted();
      }
    }
  };
}

function adminCrudTable(config) {
  return {
    showModal: false,
    editing: null,
    uploadingFoto: false,
    q: '',
    rows: [...config.rows],
    form: { ...config.emptyForm },
    get filtered() {
      const keys = config.searchKeys || ['nama'];
      return this.rows.filter(row =>
        keys.some(k => String(row[k] || '').toLowerCase().includes(this.q.toLowerCase()))
      );
    },
    async onFoto(e, field = 'foto') {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      this.uploadingFoto = true;
      try {
        // Beberapa modul (mis. poster kegiatan) berupa infografis landscape yang
        // butuh resolusi lebih besar dari foto profil persegi (dosen/alumni/prestasi)
        // supaya tidak buram/pecah saat ditampilkan penuh di halaman detail publik.
        // `config.fotoOptions` opsional memungkinkan tiap halaman admin menyesuaikan
        // ukuran kompresi tanpa mengubah perilaku default modul lain.
        const opts = (config.fotoOptions && config.fotoOptions[field]) || config.fotoOptions || { maxWidth: 300, maxHeight: 300, quality: 0.60 };
        this.form[field] = await compressImageFile(file, opts);
      } catch (err) {
        NeuAlert.error(err.message || 'Gagal memproses foto.');
      } finally {
        this.uploadingFoto = false;
        e.target.value = '';
      }
    },
    // Menyimpan array `rows` saat ini ke localStorage (jika dbKey disediakan)
    // supaya perubahan langsung persisten dan tampil konsisten di halaman publik.
    // Mengembalikan boolean sukses/gagal supaya save()/remove() bisa membatalkan
    // perubahan di memori kalau ternyata gagal disimpan (mis. localStorage penuh).
    persist() {
      if (config.dbKey) {
        if (config.dbKey === 'alumni') SAMPLE_ALUMNI = this.rows;
        else if (config.dbKey === 'kurikulum') SAMPLE_KURIKULUM = this.rows;
        else if (config.dbKey === 'dokumen') SAMPLE_DOKUMEN = this.rows;
        else if (config.dbKey === 'kegiatan') SAMPLE_KEGIATAN = this.rows;
        else if (config.dbKey === 'pengguna') SAMPLE_PENGGUNA = this.rows;
        else if (config.dbKey === 'pengumuman') SAMPLE_PENGUMUMAN = this.rows;
        else if (config.dbKey === 'prestasi') SAMPLE_PRESTASI = this.rows;
        return DB.save(config.dbKey, this.rows);
      }
      return true;
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
        const prev = this.rows[idx];
        this.rows[idx] = { ...this.form };
        if (!this.persist()) { this.rows[idx] = prev; NeuAlert.storageFull(); return; }
        logActivity(`Memperbarui ${label}: ${this.form[config.labelKey || 'nama'] || ''}`.trim(), '\u{270F}\u{FE0F}');
        NeuAlert.updated();
      } else {
        this.form.id = Date.now();
        this.rows.unshift({ ...this.form });
        if (!this.persist()) { this.rows.shift(); NeuAlert.storageFull(); return; }
        logActivity(`Menambahkan ${label} baru: ${this.form[config.labelKey || 'nama'] || ''}`.trim(), '\u{2795}');
        NeuAlert.success();
      }
      this.showModal = false;
    },
    async remove(row) {
      const ok = await NeuAlert.confirmDelete(config.itemLabel || 'data ini');
      if (ok) {
        const label = config.itemLabel ? config.itemLabel.replace(/ ini$/, '') : 'data';
        const prevList = this.rows;
        this.rows = this.rows.filter(x => x.id !== row.id);
        if (!this.persist()) { this.rows = prevList; NeuAlert.storageFull(); return; }
        logActivity(`Menghapus ${label}: ${row[config.labelKey || 'nama'] || ''}`.trim(), '\u{1F5D1}\u{FE0F}');
        NeuAlert.deleted();
      }
    }
  };
}

/* ---- Admin > Kegiatan: CRUD kegiatan + manajemen Pendaftar ----
   Melengkapi adminCrudTable biasa dengan fitur untuk melihat & mengelola
   siapa saja yang mendaftar (fitur "Daftar" di halaman publik) pada
   setiap kegiatan, supaya panitia/admin bisa menindaklanjuti pendaftar. */
function kegiatanAdminPage() {
  const base = adminCrudTable({
    rows: SAMPLE_KEGIATAN,
    dbKey: 'kegiatan',
    // Field `gambar` menyimpan thumbnail/poster kegiatan (base64 hasil kompresi
    // via onFoto) — dipakai bersama oleh admin (kolom Thumbnail & pratinjau modal)
    // dan halaman publik detail-kegiatan.html supaya poster selalu sinkron.
    emptyForm: { nama: '', tanggal: '', waktu: '', lokasi: '', penyelenggara: '', deskripsi: '', gambar: '' },
    // Poster kegiatan berbentuk infografis landscape (lebar), berbeda dari foto
    // profil persegi (dosen/alumni/prestasi) — resolusi & kualitas kompresi dibuat
    // lebih besar (1100x700, q0.82) supaya tidak buram/pecah saat ditampilkan
    // penuh selebar halaman di detail-kegiatan.html.
    fotoOptions: { maxWidth: 1100, maxHeight: 700, quality: 0.82 },
    searchKeys: ['nama', 'lokasi'],
    itemLabel: 'kegiatan ini',
    validate(f) {
      if (!f.nama || !f.tanggal) { NeuAlert.error('Nama dan Tanggal kegiatan wajib diisi.'); return false; }
      if (!f.gambar) { f.gambar = 'https://placehold.co/900x380/EEF1F5/0B1F3A?text=Poster+Kegiatan'; }
      return true;
    }
  });
  return mergeReactive(base, {
    showPeserta: false,
    pesertaOf: null, // kegiatan yang sedang dilihat daftar pesertanya
    // Dipanggil dari template lewat `jumlahPeserta(r)` — dihitung langsung
    // dari data pendaftar sungguhan (bukan angka statis).
    jumlahPeserta(row) {
      return pesertaKegiatan(row.id).length;
    },
    get pesertaList() {
      return this.pesertaOf ? pesertaKegiatan(this.pesertaOf.id) : [];
    },
    lihatPeserta(row) {
      this.pesertaOf = row;
      this.showPeserta = true;
    },
    closePeserta() {
      this.showPeserta = false;
      this.pesertaOf = null;
    },
    async hapusPeserta(p) {
      const ok = await NeuAlert.confirmDelete('pendaftar ini');
      if (!ok) return;
      const prev = SAMPLE_PENDAFTAR;
      SAMPLE_PENDAFTAR = SAMPLE_PENDAFTAR.filter(x => x.id !== p.id);
      if (!DB.save('pendaftar', SAMPLE_PENDAFTAR)) {
        SAMPLE_PENDAFTAR = prev;
        NeuAlert.storageFull();
        return;
      }
      logActivity(`Menghapus pendaftar kegiatan "${p.kegiatanNama}": ${p.nama}`, '\u{1F5D1}\u{FE0F}');
      NeuAlert.deleted('Data pendaftar berhasil dihapus.');
    }
  });
}
