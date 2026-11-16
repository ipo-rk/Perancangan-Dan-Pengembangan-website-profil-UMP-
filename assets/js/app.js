/* =========================================================
   WEBSITE PROGRAM STUDI HUKUM — SHARED APP LOGIC
   Dark mode, SweetAlert2, Alpine.js modules, sample data
   ========================================================= */

function updateCopyrightYear() {
  const currentYear = String(new Date().getFullYear());
  document.querySelectorAll('[data-current-year]').forEach((element) => {
    element.textContent = currentYear;
  });
}

updateCopyrightYear();
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) updateCopyrightYear();
});

// Warna address-bar mobile (meta[name=theme-color]) HARUS mengikuti mode
// yang benar-benar aktif di situs (toggle manual + localStorage), BUKAN
// preferensi OS (prefers-color-scheme) — supaya saat pengunjung menekan
// tombol dark/light di header, warna chrome browser di HP ikut berubah
// secara akurat, bukan tetap mengikuti tema OS yang mungkin berbeda.
const THEME_COLOR_LIGHT = '#f4f6f9';
const THEME_COLOR_DARK = '#0b1322';
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
  // Sinkronkan warna address-bar setelah preferensi tema diterapkan.
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
   INDEXEDDB BEST-EFFORT SECONDARY COPY
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
   DB ENGINE — localStorage utama dengan salinan IDB best-effort
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
        const stored = JSON.parse(raw);
        const matchesSeedShape = Array.isArray(seed)
          ? Array.isArray(stored)
          : Boolean(seed && typeof seed === 'object')
            ? Boolean(stored && typeof stored === 'object' && !Array.isArray(stored))
            : typeof stored === typeof seed;
        if (matchesSeedShape) return sanitizeBlobUrls(stored);
        console.warn('DB: bentuk data "' + key + '" tidak sesuai; memulihkan data awal.');
      }
    } catch (e) {
      console.warn('DB: gagal membaca data "' + key + '" dari localStorage.', e);
    }
    const copy = JSON.parse(JSON.stringify(seed));
    if (!save(key, copy)) {
      console.warn('DB: gagal menyimpan data awal "' + key + '" ke localStorage.');
    }
    return copy;
  }

  function mirrorToIndexedDB(key, data) {
    if (typeof IDB !== 'undefined' && IDB.set) {
      IDB.set(NS + key, data).catch(() => { });
    }
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

    // localStorage adalah sumber utama. IndexedDB hanya dicerminkan setelah
    // penulisan utama berhasil agar kedua salinan tidak berbeda saat gagal.
    try {
      localStorage.setItem(NS + key, serialized);
      mirrorToIndexedDB(key, data);
      window.dispatchEvent(new CustomEvent('db-update', {
        detail: { key, data }
      }));
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
        mirrorToIndexedDB(key, data);
        window.dispatchEvent(new CustomEvent('db-update', {
          detail: { key, data }
        }));
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
const ADMIN_ICON_PATHS = {
  home: '<path d="m3 10 9-7 9 7M5 9v12h5v-7h4v7h5V9"/>',
  logout: '<path d="M10 17l5-5-5-5m5 5H3m9-7V4a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2h-6a2 2 0 0 1-2-2v-2"/>',
  activity: '<path d="M3 12h4l3-8 4 16 3-8h4"/>',
  edit: '<path d="m16 4 4 4M4 20l4-.8L19 8a2.8 2.8 0 0 0-4-4L4 15z"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  moon: '<path d="M20.4 15.4A9 9 0 0 1 8.6 3.6 9 9 0 1 0 20.4 15.4Z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  '\u{1F4DD}': '<path d="M8 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3M8 2h8v4H8zM8 11h8M8 15h5M16 8l4-4 2 2-4 4-3 1z"/>',
  '\u{1F514}': '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>',
  '\u{1F4C4}': '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M8 13h8M8 17h8"/>',
  '\u{1F4C1}': '<path d="M3 6a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  '\u{1F5D1}\u{FE0F}': '<path d="M3 6h18M8 6V4h8v2m3 0-1 14H6L5 6m4 4v6m6-6v6"/>',
  '\u{1F510}': '<rect x="4" y="10" width="16" height="12" rx="2"/><path d="M8 10V7a4 4 0 1 1 8 0v3m-4 5v2"/>',
  '\u{2795}': '<path d="M12 5v14M5 12h14"/>',
  '\u{270F}\u{FE0F}': '<path d="m15 5 4 4M4 20l4-.8L19 8a2.8 2.8 0 0 0-4-4L4 15z"/>',
  '\u{1F680}': '<path d="M12 15l-3 3-1-4-4-1 3-3m5 5c5-2 8-8 8-12-4 0-10 3-12 8m4 4 3 1 1 3 2-2 3-1-1-3"/>',
  '\u{1F399}\u{FE0F}': '<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0M12 17v5m-4 0h8"/>',
  '\u{1F3EB}': '<path d="M3 21h18M5 21V7l7-4 7 4v14M9 10h.01M15 10h.01M9 14h.01M15 14h.01M10 21v-4h4v4"/>',
  '\u2696\u{FE0F}': '<path d="M12 3v18m-7 0h14M5 7h14M7 7l-3 7h6zm10 0-3 7h6z"/>',
  '\u{1F393}': '<path d="m2 9 10-5 10 5-10 5zM6 11v5c4 3 8 3 12 0v-5M22 9v7"/>',
  '\u{1F91D}': '<path d="m8 12 3 3a2 2 0 0 0 3 0l5-5M4 10l4-4 4 2 3-1 5 4-5 6M2 9l3-3 4 3-4 4zm20 0-3-3-4 3 4 4z"/>',
  '\u{1F52C}': '<path d="M9 3h6m-5 0v7l-5 8a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-8V3M7 16h10"/>',
  '\u{1F5BC}\u{FE0F}': '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>',
  '\u{1F3DB}\u{FE0F}': '<path d="M3 21h18M4 10h16M5 10v8m4-8v8m6-8v8m4-8v8M3 7l9-4 9 4v3H3z"/>',
  '\u{1F9F9}': '<path d="m3 21 8-8m-5-5 5 5M4 4l5 5m-5-5 2-2 5 5-2 2zM13 12l3-3 5 5-3 3z"/>',
  '\u{1F504}': '<path d="M20 7v5h-5M4 17v-5h5m-4 1a7 7 0 0 0 12 3l2-2M20 11A7 7 0 0 0 8 8L6 10"/>',
  '\u{1F511}': '<circle cx="8" cy="15" r="5"/><path d="m12 12 9-9m-4 4 3 3m-6-1 3 3"/>',
  '\u{1F3F7}\u{FE0F}': '<path d="M20 13 11 22l-9-9V2h11z"/><circle cx="7" cy="7" r="1"/>',
  '\u{1F4DC}': '<path d="M5 3h14v18H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm2 5h10M7 12h10M7 16h7"/>',
  '\u{1F4CB}': '<rect x="5" y="4" width="14" height="18" rx="2"/><path d="M9 4V2h6v2M8 9h8M8 13h8M8 17h5"/>',
  '\u26A1': '<path d="m13 2-9 12h7l-1 8 10-13h-7z"/>',
  '\u{1F465}': '<circle cx="9" cy="8" r="4"/><path d="M2 21v-2a7 7 0 0 1 14 0v2m2-13a4 4 0 0 1 0 8m1 2a5 5 0 0 1 3 5"/>',
  '\u{1F6E1}\u{FE0F}': '<path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z"/><path d="m9 12 2 2 4-4"/>',
  '\u2715': '<path d="m6 6 12 12M18 6 6 18"/>',
  '\u{1F50D}': '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
  '\u{1F4F7}': '<path d="M4 7h3l2-3h6l2 3h3a2 2 0 0 1 2 2v10H2V9a2 2 0 0 1 2-2Z"/><circle cx="12" cy="13" r="4"/>',
  '\u{1F4BE}': '<path d="M5 3h12l4 4v14H3V3h2Zm2 0v6h10V3M7 21v-8h10v8"/>',
  '\u{1F4F0}': '<path d="M4 4h16v16H4zM8 8h8v4H8zm0 7h3m2 0h3m-8 3h8"/>',
  '\u{1F4CA}': '<path d="M4 20V10m5 10V4m6 16v-7m5 7H2"/>',
  '\u{1F464}': '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  '\u{1F396}\u{FE0F}': '<circle cx="12" cy="8" r="6"/><path d="m8 13-1 9 5-3 5 3-1-9"/>',
  '\u{1F4C5}': '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>',
  '\u{1F4DA}': '<path d="M12 7v14m0-14C9 4 5 4 2 5v13c4-1 7-1 10 3m0-14c3-3 7-3 10-2v13c-4-1-7-1-10 3"/>',
  '\u{1F4E3}': '<path d="M3 11v2a2 2 0 0 0 2 2h2l9 5V5l-9 5H5a2 2 0 0 0-2 1Zm4 4 2 6h4"/>',
  '\u{1F3C6}': '<path d="M8 21h8m-4-4v4M7 4h10v6a5 5 0 0 1-10 0zm10 2h4v2a4 4 0 0 1-4 4M7 6H3v2a4 4 0 0 0 4 4"/>',
  '\u2699': '<circle cx="12" cy="12" r="3"/><path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.6a8 8 0 0 1-1.7 1l-.3 1.8h-2.8l-.3-1.8a8 8 0 0 1-1.7-1l-1.7.6-1.4-2.4 1.4-1.1a8 8 0 0 1 0-2l-1.4-1.1 1.4-2.4 1.7.6a8 8 0 0 1 1.7-1l.3-1.8h2.8l.3 1.8a8 8 0 0 1 1.7 1l1.7-.6 1.4 2.4-1.4 1.1a8 8 0 0 1 0 2Z"/>',
  '\u2705': '<path d="m5 12 4 4L19 6"/>',
  '\u{1F4E5}': '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
  '\u{2B07}': '<path d="M12 3v12m-5-5 5 5 5-5M5 20h14"/>',
  '\u270D': '<path d="m15 5 4 4M4 20l4-.8L19 8a2.8 2.8 0 0 0-4-4L4 15z"/>'
};

const ADMIN_ICON_ALIASES = {
  dashboard: 'home',
  menu: 'menu',
  moon: 'moon',
  sun: 'sun',
  profile: '\u{1F3EB}',
  teacher: '\u{1F465}',
  curriculum: '\u{1F4DA}',
  announcement: '\u{1F4E3}',
  event: '\u{1F4C5}',
  achievement: '\u{1F3C6}',
  article: '\u{1F4C4}',
  gallery: '\u{1F5BC}\u{FE0F}',
  document: '\u{1F4C1}',
  alumni: '\u{1F393}',
  applicants: '\u{1F4CB}',
  users: '\u{1F465}',
  activity: 'activity',
  settings: '\u2699',
  logout: 'logout',
  search: '\u{1F50D}',
  bell: '\u{1F514}',
  note: '\u{1F4DD}',
  lock: '\u{1F510}',
  key: '\u{1F511}',
  scales: '\u2696\u{FE0F}',
  file: '\u{1F4C4}',
  folder: '\u{1F4C1}',
  trash: '\u{1F5D1}\u{FE0F}',
  add: '\u{2795}',
  edit: 'edit',
  rocket: '\u{1F680}',
  book: '\u{1F4DA}',
  camera: '\u{1F4F7}',
  calendar: '\u{1F4C5}',
  chart: '\u{1F4CA}',
  clipboard: '\u{1F4CB}',
  lightning: '\u26A1',
  people: '\u{1F465}',
  person: '\u{1F464}',
  shield: '\u{1F6E1}\u{FE0F}',
  x: '\u2715',
  search: '\u{1F50D}',
  news: '\u{1F4F0}',
  medal: '\u{1F396}\u{FE0F}',
  megaphone: '\u{1F4E3}',
  trophy: '\u{1F3C6}',
  gear: '\u2699',
  check: '\u{2705}',
  upload: '\u{1F4E5}',
  image: '\u{1F5BC}\u{FE0F}',
  graduation: '\u{1F393}',
  teacher: '\u{1F464}',
  institution: '\u{1F3EB}',
  broom: '\u{1F9F9}',
  save: '\u{1F4BE}',
  download: '\u{2B07}',
  editHand: '\u270D'
};

function iconSvg(icon) {
  const key = Object.prototype.hasOwnProperty.call(ADMIN_ICON_ALIASES, icon)
    ? ADMIN_ICON_ALIASES[icon]
    : icon;
  const paths = Object.prototype.hasOwnProperty.call(ADMIN_ICON_PATHS, key)
    ? ADMIN_ICON_PATHS[key]
    : ADMIN_ICON_PATHS['\u{1F4DD}'];
  return `<svg aria-hidden="true" focusable="false" class="admin-ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
}

function logActivity(aksi, icon) {
  const entry = {
    id: Date.now(),
    user: AUTH.current().nama,
    aksi,
    waktu: 'Baru saja',
    tanggalIso: new Date().toISOString(),
    icon: icon || '\u{1F4DD}'
  };
  const nextActivity = [entry, ...SAMPLE_AKTIVITAS].slice(0, 25);
  DB.save('aktivitas', nextActivity);

  const notif = {
    id: Date.now() + 1,
    judul: aksi,
    pesan: 'Aksi dijalankan oleh ' + AUTH.current().nama,
    waktu: 'Baru saja',
    read: false,
    icon: icon || '\u{1F514}'
  };
  const nextNotifications = [notif, ...SAMPLE_NOTIFIKASI].slice(0, 30);
  DB.save('notifikasi', nextNotifications);
}

/* =========================================================
   AUTH — sesi admin sederhana berbasis localStorage
   ========================================================= */
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
    const session = { nama: user.nama, email: user.email, role: user.role, loginAt: new Date().toISOString() };
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
   Memperkecil dimensi foto dan mengompres ke JPEG. Ukuran hasil bergantung
   pada gambar sumber, dimensi, kualitas kompresi, dan kuota browser.
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
    const isDark = document.documentElement.classList.contains('dark');
    return Swal.fire({
      background: isDark ? '#14213D' : '#FFFFFF',
      color: isDark ? '#F8FAFC' : '#1E293B',
      confirmButtonColor: isDark ? '#3B82F6' : '#1D4ED8',
      cancelButtonColor: '#64748B',
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
    const isDark = document.documentElement.classList.contains('dark');
    const res = await this.base({
      icon: 'warning',
      title: 'Hapus data?',
      text: `Apakah Anda yakin ingin menghapus ${itemLabel}?`,
      showCancelButton: true,
      confirmButtonText: 'Ya, Hapus',
      confirmButtonColor: isDark ? '#EF4444' : '#B91C1C',
      cancelButtonText: 'Batal',
      reverseButtons: true
    });
    return res.isConfirmed;
  },
  async confirmLogout() {
    const isDark = document.documentElement.classList.contains('dark');
    const res = await this.base({
      icon: 'question',
      title: 'Keluar dari akun?',
      text: 'Apakah Anda yakin ingin keluar?',
      showCancelButton: true,
      confirmButtonText: 'Ya, Keluar',
      confirmButtonColor: isDark ? '#3B82F6' : '#1D4ED8',
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
  { id: 1, nama: 'Dr. Muhammad Yusuf, S.H., M.H', kode: 'HKM001' },
  { id: 2, nama: 'Dr. Hendrik Dengah, S.H., M.H', kode: 'HKM002' },
  { id: 3, nama: 'Dr. Tri Mulyadi, S.H., M.H', kode: 'HKM003' },
  { id: 4, nama: 'Ismail Maswatu, S.E., S.H., M.H', kode: 'HKM004' },
  { id: 5, nama: 'Irfun, M.Pd', kode: 'HKM005' },
  { id: 6, nama: 'Adimas Reza Prayudi M, S.H., M.H.', kode: 'HKM006' },
  { id: 7, nama: 'Mursani, S.H., M.H.', kode: 'HKM007' },
  { id: 8, nama: 'Rizki Wisudawan Katjong, S.H., M.H.', kode: 'HKM008' },
  { id: 9, nama: 'Rifqi Anan Pratama, S.H., M.H', kode: 'HKM009' },
  { id: 10, nama: 'Ratna Jaya, S.H., M.H', kode: 'HKM010' },
  { id: 11, nama: 'Midah Nurhidayah', kode: '-' }
];
let SAMPLE_DOSEN = DB.load('dosen', SEED_DOSEN);
const LEGACY_SEED_DOSEN = [
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
if (JSON.stringify(SAMPLE_DOSEN) === JSON.stringify(LEGACY_SEED_DOSEN)) {
  SAMPLE_DOSEN = SEED_DOSEN;
  if (!DB.save('dosen', SAMPLE_DOSEN)) {
    console.error('DB: gagal memperbarui daftar dosen bawaan dari lembar Dosen.');
  }
} else if (Array.isArray(SAMPLE_DOSEN)) {
  let lecturerCodeChanged = false;
  const normalizedDosen = SAMPLE_DOSEN.map(dosen => {
    if (dosen.nama === 'Midah Nurhidayah' && !String(dosen.kode || '').trim()) {
      lecturerCodeChanged = true;
      return { ...dosen, kode: '-' };
    }
    return dosen;
  });
  if (lecturerCodeChanged) {
    if (DB.save('dosen', normalizedDosen)) {
      SAMPLE_DOSEN = normalizedDosen;
    } else {
      console.error('DB: gagal menormalkan kode dosen Midah Nurhidayah.');
    }
  }
}

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
    ...SAMPLE_DOSEN.map(d => ({ title: d.nama, url: 'dosen.html', type: 'Dosen', keywords: `${d.nama} ${d.kode || ''}` })),
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

const PUBLIC_NAV_ICON_PATHS = {
  home: ['M3 10.5 12 3l9 7.5', 'M5 9v12h14V9', 'M9 21v-7h6v7'],
  profile: ['M20 21a8 8 0 0 0-16 0', 'M12 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z'],
  faculty: ['M3 21h18', 'M5 21V7l7-4 7 4v14', 'M9 10h.01', 'M15 10h.01', 'M9 14h.01', 'M15 14h.01'],
  book: ['M4 5.5A2.5 2.5 0 0 1 6.5 3H20v17H6.5A2.5 2.5 0 0 0 4 22z', 'M4 5.5v14A2.5 2.5 0 0 1 6.5 17H20'],
  info: ['M12 16v-4', 'M12 8h.01', 'M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z'],
  people: ['M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2', 'M10 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z', 'M20 21v-2a4 4 0 0 0-3-3.87', 'M16 3.13a4 4 0 0 1 0 7.75'],
  news: ['M4 4h16v16H4z', 'M8 8h8', 'M8 12h8', 'M8 16h5'],
  bell: ['M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9', 'M10 21h4'],
  calendar: ['M8 3v4', 'M16 3v4', 'M3 9h18', 'M5 5h14a2 2 0 0 1 2 2v13H3V7a2 2 0 0 1 2-2Z', 'M8 13h.01', 'M12 13h.01', 'M16 13h.01'],
  article: ['M4 5h16v14H4z', 'M8 9h8', 'M8 13h8', 'M8 16h5'],
  trophy: ['M8 21h8', 'M12 17v4', 'M7 4h10v6a5 5 0 0 1-10 0V4Z', 'M7 7H4v2a4 4 0 0 0 4 4', 'M17 7h3v2a4 4 0 0 1-4 4'],
  gallery: ['M4 5h16v14H4z', 'M8 13l3-3 6 7H7z', 'M15.5 9.5h.01'],
  file: ['M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z', 'M14 2v6h6', 'M8 13h8', 'M8 17h8'],
  mail: ['M4 5h16v14H4z', 'M4 7l8 6 8-6'],
  phone: ['M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.4 19.4 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.8 2.1z'],
  location: ['M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z', 'M12 10h.01'],
  login: ['M10 17l5-5-5-5', 'M15 12H3', 'M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6'],
  top: ['M12 19V5', 'M5 12l7-7 7 7'],
  close: ['M18 6 6 18', 'm6 6 12 12']
};

const PUBLIC_NAV_ICON_BY_FILE = {
  'index.html': 'home',
  'profil.html': 'profile',
  'dosen.html': 'faculty',
  'kurikulum.html': 'book',
  'berita.html': 'news',
  'detail-berita.html': 'news',
  'pengumuman.html': 'bell',
  'detail-pengumuman.html': 'bell',
  'kegiatan.html': 'calendar',
  'detail-kegiatan.html': 'calendar',
  'artikel.html': 'article',
  'detail-artikel.html': 'article',
  'prestasi.html': 'trophy',
  'alumni.html': 'people',
  'galeri.html': 'gallery',
  'detail-galeri.html': 'gallery',
  'dokumen.html': 'file',
  'kontak.html': 'mail'
};

function createPublicIcon(name, className) {
  const paths = PUBLIC_NAV_ICON_PATHS[name];
  if (!paths) return null;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', className);
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '1.8');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');

  paths.forEach((pathData) => {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', pathData);
    svg.appendChild(path);
  });
  return svg;
}

function publicNavIconName(item) {
  if (item.hasAttribute('href')) {
    const href = item.getAttribute('href').split(/[?#]/)[0];
    const file = href.split('/').pop().toLowerCase();
    if (PUBLIC_NAV_ICON_BY_FILE[file]) return PUBLIC_NAV_ICON_BY_FILE[file];
  }

  const label = item.textContent.replace(/\s+/g, ' ').trim().toLowerCase();
  return {
    profil: 'profile',
    informasi: 'info',
    mahasiswa: 'people'
  }[label] || null;
}

function enhancePublicNavbar() {
  document.querySelectorAll('nav.main').forEach((nav) => {
    nav.querySelectorAll('a[href], button').forEach((item) => {
      if (item.classList.contains('admin-login')) return;

      const existingIcon = Array.prototype.find.call(item.children, (child) =>
        child.localName === 'svg' && !child.classList.contains('ui-icon-xs')
      );
      if (existingIcon) {
        existingIcon.classList.add('nav-icon');
        return;
      }

      const icon = createPublicIcon(publicNavIconName(item), 'ui-icon ui-icon-sm nav-icon');
      if (icon) item.insertBefore(icon, item.firstChild);
    });
  });
}

function initPublicTopbar(settings) {
  const header = document.querySelector('header.top');
  if (!header || header.parentElement.querySelector(':scope > .public-topbar')) return;

  const tools = header.querySelector('.tools');
  const social = tools && tools.querySelector(':scope > .soc');
  const topbar = document.createElement('div');
  topbar.className = 'public-topbar';

  const inner = document.createElement('div');
  inner.className = 'public-topbar-inner';
  const contacts = document.createElement('div');
  contacts.className = 'public-topbar-contact';
  contacts.setAttribute('aria-label', 'Informasi kontak');

  const appendContact = (iconName, label, value, href) => {
    const text = String(value || '').trim();
    if (!text) return;
    const link = document.createElement('a');
    link.className = 'public-topbar-link';
    link.href = href;
    link.setAttribute('aria-label', `${label}: ${text}`);
    if (iconName === 'location') {
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
    }
    link.appendChild(createPublicIcon(iconName, 'public-topbar-icon'));
    const content = document.createElement('span');
    content.textContent = text;
    link.appendChild(content);
    contacts.appendChild(link);
  };

  const phone = String(settings.telepon || '').trim();
  const phoneHref = phone.replace(/[^\d+]/g, '');
  if (phoneHref.replace(/\D/g, '')) appendContact('phone', 'Telepon', phone, `tel:${phoneHref}`);
  appendContact('mail', 'Email', settings.email, `mailto:${String(settings.email || '').trim()}`);
  appendContact('location', 'Alamat', settings.alamat, `https://maps.google.com/?q=${encodeURIComponent(String(settings.alamat || ''))}`);

  inner.appendChild(contacts);
  if (social) {
    social.classList.add('public-topbar-social');
    social.setAttribute('role', 'group');
    social.setAttribute('aria-label', 'Media sosial');
    inner.appendChild(social);
  }
  topbar.appendChild(inner);
  header.parentElement.insertBefore(topbar, header);
}

function initMobileNavDrawer() {
  document.querySelectorAll('nav.main').forEach((nav) => {
    if (nav.dataset.mobileDrawerReady === 'true') return;

    const wrap = nav.querySelector('.wrap');
    const menu = nav.querySelector('ul');
    const burger = document.querySelector('header.top .burger');
    if (!wrap || !menu || !burger) return;

    if (!menu.id) menu.id = 'public-main-navigation';
    burger.setAttribute('aria-controls', menu.id);
    burger.setAttribute('aria-expanded', 'false');

    const closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.className = 'nav-drawer-close';
    closeButton.setAttribute('aria-label', 'Tutup menu navigasi');
    closeButton.setAttribute('title', 'Tutup menu navigasi');
    closeButton.appendChild(createPublicIcon('close', 'nav-drawer-close-icon'));
    wrap.insertBefore(closeButton, wrap.firstChild);

    const backdrop = document.createElement('button');
    backdrop.type = 'button';
    backdrop.className = 'nav-mobile-backdrop';
    backdrop.setAttribute('aria-label', 'Tutup menu navigasi');
    backdrop.setAttribute('aria-hidden', 'true');
    backdrop.tabIndex = -1;
    backdrop.hidden = true;
    document.body.appendChild(backdrop);

    const setOpen = (isOpen) => {
      nav.classList.toggle('mobile-open', isOpen);
      backdrop.classList.toggle('is-open', isOpen);
      backdrop.hidden = !isOpen;
      burger.setAttribute('aria-expanded', String(isOpen));
      document.body.classList.toggle('nav-drawer-open', isOpen);
      if (isOpen) closeButton.focus();
      else burger.focus();
    };

    const toggle = () => setOpen(!nav.classList.contains('mobile-open'));
    const requestToggle = () => window.dispatchEvent(new CustomEvent('nav-mobile-toggle'));
    window.addEventListener('nav-mobile-toggle', toggle);
    window.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && nav.classList.contains('mobile-open')) {
        setOpen(false);
      }
    });
    window.addEventListener('resize', () => {
      if (window.innerWidth > 980 && nav.classList.contains('mobile-open')) {
        requestToggle();
      }
    }, { passive: true });
    closeButton.addEventListener('click', requestToggle);
    backdrop.addEventListener('click', requestToggle);
    nav.dataset.mobileDrawerReady = 'true';
  });
}

function initPublicQuickActions() {
  if (!document.querySelector('nav.main') || document.querySelector('.public-quick-actions')) return;

  const actions = document.createElement('div');
  actions.className = 'public-quick-actions';
  actions.setAttribute('role', 'group');
  actions.setAttribute('aria-label', 'Aksi cepat');

  const topButton = document.createElement('button');
  topButton.type = 'button';
  topButton.className = 'public-quick-action public-fab-top';
  topButton.setAttribute('aria-label', 'Kembali ke atas');
  topButton.setAttribute('title', 'Kembali ke atas');
  topButton.setAttribute('data-label', 'Kembali ke atas');
  topButton.appendChild(createPublicIcon('top', 'public-fab-icon'));
  topButton.addEventListener('click', () => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
  });

  const loginLink = document.createElement('a');
  loginLink.href = 'admin/login.html';
  loginLink.className = 'public-quick-action public-fab-login';
  loginLink.setAttribute('aria-label', 'Login Admin');
  loginLink.setAttribute('title', 'Login Admin');
  loginLink.setAttribute('data-label', 'Login Admin');
  loginLink.appendChild(createPublicIcon('login', 'public-fab-icon'));

  const contactLink = document.createElement('a');
  contactLink.href = 'kontak.html';
  contactLink.className = 'public-quick-action public-fab-contact';
  contactLink.setAttribute('aria-label', 'Hubungi Kami');
  contactLink.setAttribute('title', 'Hubungi Kami');
  contactLink.setAttribute('data-label', 'Hubungi Kami');
  contactLink.appendChild(createPublicIcon('mail', 'public-fab-icon'));

  actions.appendChild(topButton);
  actions.appendChild(loginLink);
  actions.appendChild(contactLink);
  document.body.appendChild(actions);

  const updateTopButtonVisibility = () => {
    topButton.hidden = window.scrollY < 320;
  };
  window.addEventListener('scroll', updateTopButtonVisibility, { passive: true });
  updateTopButtonVisibility();
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
    },
    init() {
      const currentPath = window.location.pathname.replace(/\/+$/, '') || '/index.html';
      const detailRoutes = {
        'detail-artikel.html': 'artikel.html',
        'detail-berita.html': 'berita.html',
        'detail-galeri.html': 'galeri.html',
        'detail-kegiatan.html': 'kegiatan.html',
        'detail-pengumuman.html': 'pengumuman.html'
      };

      document.querySelectorAll('nav.main').forEach((nav) => {
        nav.querySelectorAll('.on').forEach((item) => item.classList.remove('on'));
        nav.querySelectorAll('[aria-current]').forEach((item) => item.removeAttribute('aria-current'));

        nav.querySelectorAll('a[href]').forEach((link) => {
          const linkPath = new URL(link.getAttribute('href'), window.location.href).pathname.replace(/\/+$/, '');
          const isCurrentPage = linkPath === currentPath;
          const currentSectionPath = detailRoutes[currentPath.split('/').pop()];
          const isCurrentSection = currentSectionPath &&
            linkPath.split('/').pop() === currentSectionPath;

          if (isCurrentPage || isCurrentSection) {
            link.classList.add('on');
            link.setAttribute('aria-current', isCurrentPage ? 'page' : 'location');
          }
        });

        nav.querySelectorAll('.drop').forEach((dropdown) => {
          const hasCurrentLink = dropdown.querySelector('a.on');
          if (!hasCurrentLink) return;
          const menuItem = dropdown.closest('li');
          const trigger = menuItem && menuItem.querySelector(':scope > button');
          if (trigger) trigger.classList.add('on');
        });
      });

      const settings = SAMPLE_PENGATURAN || {};
      initPublicTopbar(settings);
      const logo = publicAssetPath(settings.logo);
      if (logo) {
        document.querySelectorAll('.brand img.logo').forEach((image) => {
          image.src = logo;
        });
      }

      document.querySelectorAll('.soc a').forEach((link) => {
        const socialKey = {
          fb: 'facebook',
          ig: 'instagram',
          yt: 'youtube',
          tt: 'tiktok'
        }[Array.from(link.classList).find((name) => ['fb', 'ig', 'yt', 'tt'].includes(name))];
        if (!socialKey) return;

        const url = safeExternalUrl(settings[socialKey]);
        if (url) {
          link.href = url;
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
          link.removeAttribute('aria-disabled');
          link.removeAttribute('tabindex');
        } else {
          link.removeAttribute('href');
          link.removeAttribute('target');
          link.removeAttribute('rel');
          link.setAttribute('aria-disabled', 'true');
          link.setAttribute('tabindex', '-1');
        }
      });

      const favicon = document.querySelector('link[rel~="icon"]');
      const faviconUrl = publicAssetPath(settings.favicon);
      if (favicon && faviconUrl) favicon.href = faviconUrl;

      const isHome = /\/(?:index\.html)?$/.test(window.location.pathname);
      if (isHome && settings.metaTitle) {
        document.title = settings.metaTitle;
      } else if (settings.namaWebsite) {
        document.title = document.title.replace(/\|.*$/, `| ${settings.namaWebsite}`);
      }
      if (isHome) {
        const description = document.querySelector('meta[name="description"]');
        const keywords = document.querySelector('meta[name="keywords"]');
        if (description && (settings.metaDesc || settings.deskripsi)) {
          description.content = settings.metaDesc || settings.deskripsi;
        }
        if (keywords && settings.keywords) keywords.content = settings.keywords;
      }

      enhancePublicNavbar();
      initMobileNavDrawer();
      initPublicQuickActions();
    }
  };
}

function publicAssetPath(path) {
  if (!path || /^(https?:)?\/\//i.test(path) || /^(data:|\/)/i.test(path)) return path || '';
  return path.replace(/^(\.\.\/)+/, '');
}

function safeExternalUrl(value) {
  try {
    const url = new URL(String(value || '').trim());
    return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
  } catch (e) {
    return '';
  }
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
    _dataRevision: 0,
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
      window.addEventListener('db-update', () => {
        this._dataRevision += 1;
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
      const updated = this._notifications.map(n => ({ ...n, read: true }));
      if (!DB.save('notifikasi', updated)) {
        NeuAlert.storageFull();
        return;
      }
      this._notifications = updated;
      if (typeof NeuAlert !== 'undefined') NeuAlert.success('Semua notifikasi ditandai dibaca.');
    },
    clearNotifs() {
      if (!DB.save('notifikasi', [])) {
        NeuAlert.storageFull();
        return;
      }
      this._notifications = [];
      if (typeof NeuAlert !== 'undefined') NeuAlert.success('Semua notifikasi dibersihkan.');
    },
    get stats() {
      return {
        _revision: this._dataRevision,
        dosen: SAMPLE_DOSEN.length,
        kurikulum: SAMPLE_KURIKULUM.length,
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
      this._dataRevision;
      return SAMPLE_AKTIVITAS.slice(0, 4);
    },
    get activityLog() {
      this._dataRevision;
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
      const nama = String(this.form.nama || '').trim();
      const email = String(this.form.email || '').trim();
      const subjek = String(this.form.subjek || '').trim();
      const pesan = String(this.form.pesan || '').trim();
      if (!nama || !email || !pesan) {
        NeuAlert.error('Mohon lengkapi Nama, Email, dan Pesan.');
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        NeuAlert.error('Format email tidak valid.');
        return;
      }

      this.loading = true;
      const message = {
        id: Date.now(),
        nama,
        email,
        subjek: subjek || 'Pesan dari halaman kontak',
        pesan,
        waktu: new Date().toLocaleString('id-ID', {
          day: '2-digit', month: 'short', year: 'numeric',
          hour: '2-digit', minute: '2-digit'
        }),
        read: false
      };
      const previous = SAMPLE_PESAN;
      SAMPLE_PESAN = [message, ...previous];
      const saved = DB.save('pesan', SAMPLE_PESAN);
      if (!saved) {
        SAMPLE_PESAN = previous;
        this.loading = false;
        NeuAlert.storageFull();
        return;
      }

      logPublicEvent(`Pesan kontak baru dari ${nama}`, '\u{1F4DD}', 'Dikirim melalui formulir kontak.');
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
  return mergeReactive(
    filterableGrid(SAMPLE_DOSEN, { searchKeys: ['nama', 'kode'] }),
    {
      kodeFilter: 'all',
      sortOrder: 'az',
      showDetail: false,
      selected: null,
      hasCode: lecturerHasCode,
      coursesFor: coursesForLecturer,
      get results() {
        const normalize = value => String(value || '')
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .toLocaleLowerCase('id-ID')
          .trim();
        const query = normalize(this.q).split(/\s+/).filter(Boolean);
        const searchableKeys = [
          'nama', 'kode', 'jabatan', 'spesialisasi', 'keahlian',
          'pendidikan', 'email', 'nidn'
        ];

        return this.all
          .filter(dosen => {
            const hasKode = lecturerHasCode(dosen);
            const matchesKode = this.kodeFilter === 'all' ||
              (this.kodeFilter === 'available' ? hasKode : !hasKode);
            const searchableText = normalize(searchableKeys
              .map(key => dosen[key])
              .filter(value => typeof value === 'string' || typeof value === 'number')
              .join(' '));
            return matchesKode && query.every(term => searchableText.includes(term));
          })
          .sort((a, b) => {
            const comparison = String(a.nama || '').localeCompare(String(b.nama || ''), 'id', {
              sensitivity: 'base'
            });
            return this.sortOrder === 'za' ? -comparison : comparison;
          });
      },
      get hasActiveFilters() {
        return Boolean(this.q.trim()) || this.kodeFilter !== 'all' || this.sortOrder !== 'az';
      },
      resetSearch() {
        this.q = '';
        this.kodeFilter = 'all';
        this.sortOrder = 'az';
      },
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

function lecturerHasCode(dosen) {
  return Boolean(normalizeLecturerCode(dosen?.kode));
}

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

function normalizeLecturerCode(value) {
  const code = String(value || '').trim().toLocaleLowerCase('id-ID');
  return code && !['-', '—', 'tidak tercantum', 'n/a'].includes(code) ? code : '';
}

function coursesForLecturer(dosen) {
  const normalizeName = value => String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const lecturerName = normalizeName(dosen.nama);
  const lecturerCode = normalizeLecturerCode(dosen.kode);
  if (!lecturerName && !lecturerCode) return [];
  return SAMPLE_KURIKULUM.filter(course => {
    const courseCode = normalizeLecturerCode(course.kodeDosen);
    if (lecturerCode && courseCode) return lecturerCode === courseCode;
    return Boolean(course.pengampu && lecturerName && normalizeName(course.pengampu) === lecturerName);
  });
}

function courseLecturerName(course) {
  const code = normalizeLecturerCode(course.kodeDosen);
  const lecturer = code && SAMPLE_DOSEN.find(dosen => normalizeLecturerCode(dosen.kode) === code);
  return lecturer ? lecturer.nama : (course.pengampu || '');
}

function adminDosenPage() {
  return {
    showModal: false,
    editing: null,
    editingSnapshot: undefined,
    dosen: [...SAMPLE_DOSEN],
    form: { id: null, nama: '', kode: '' },
    q: '',
    curriculumRevision: 0,
    init() {
      window.addEventListener('db-update', event => {
        if (event.detail?.key === 'dosen' && Array.isArray(event.detail.data)) {
          this.dosen = [...event.detail.data];
        }
        if (event.detail?.key === 'kurikulum' && Array.isArray(event.detail.data)) {
          this.curriculumRevision += 1;
        }
      });
    },
    get filtered() {
      const query = this.q.trim().toLowerCase();
      return this.dosen.filter(d =>
        String(d.nama || '').toLowerCase().includes(query) ||
        String(d.kode || '').toLowerCase().includes(query)
      );
    },
    coursesFor(dosen) {
      this.curriculumRevision;
      return coursesForLecturer(dosen);
    },
    exportCsv() {
      const quote = value => {
        const text = String(value == null ? '' : value);
        const safe = /^[\t\r ]*[=+\-@]/.test(text) ? "'" + text : text;
        return '"' + safe.replace(/"/g, '""') + '"';
      };
      const rows = [
        ['Nama Dosen', 'Kode Dosen', 'Jumlah Mata Kuliah', 'Mata Kuliah Diampu'],
        ...this.filtered.map(dosen => {
          const courses = this.coursesFor(dosen);
          return [
            dosen.nama,
            dosen.kode || '',
            courses.length,
            courses.map(course => course.nama).join('; ')
          ];
        })
      ];
      const csv = '\uFEFF' + rows.map(row => row.map(quote).join(',')).join('\r\n');
      const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = 'data-dosen-prodi-hukum.csv';
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 0);
      NeuAlert.success(`${this.filtered.length} data dosen diekspor ke CSV.`);
    },
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
  };
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

function detailSidebar(currentType) {
  return {
    pengumuman: SAMPLE_PENGUMUMAN.slice(0, 3),
    kegiatan: SAMPLE_KEGIATAN.slice(0, 3),
    artikel: SAMPLE_ARTIKEL.filter(a => a.status === 'Published').slice(0, 3),
    berita: SAMPLE_BERITA.filter(b => b.status === 'Published').slice(0, 3),
    showPengumuman: currentType !== 'pengumuman',
    showKegiatan: currentType !== 'kegiatan',
    showArtikel: currentType !== 'artikel',
    showBerita: currentType !== 'berita'
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

const SEED_PESAN = [];
let SAMPLE_PESAN = DB.load('pesan', SEED_PESAN);

/* Log aktivitas dari halaman PUBLIK (bukan Admin) — dipisah dari
   logActivity() karena logActivity mengasumsikan ada admin yang sedang
   login (AUTH.current()). Notifikasi tetap masuk ke Admin Panel supaya
   pendaftaran baru langsung terlihat oleh admin. */
function logPublicEvent(aksi, icon, pesan) {
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
    pesan: pesan || 'Dikirim melalui formulir pendaftaran di halaman publik.',
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
  // Semester 1 — MK Baru (dosen dari referensi Excel)
  { id: 1,  kode: 'UMP1002', nama: 'AI Islam dan Kemuhammadiyahan 1', sks: 2, semester: 1, pengampu: 'Dr. Tri Mulyadi, S.H., M.H', kodeDosen: 'HKM003', sumber: 'MK Baru' },
  { id: 2,  kode: 'UMP1001', nama: 'Pendidikan Pancasila', sks: 2, semester: 1, pengampu: 'Ismail Maswatu, S.E., S.H., M.H', kodeDosen: 'HKM004', sumber: 'MK Baru' },
  { id: 3,  kode: 'UMP1004', nama: 'Teknologi dan Informasi', sks: 2, semester: 1, pengampu: 'Irfun, M.Pd', kodeDosen: 'HKM005', sumber: 'MK Baru' },
  { id: 4,  kode: 'UMP1005', nama: 'Bahasa Indonesia', sks: 2, semester: 1, pengampu: 'Irfun, M.Pd', kodeDosen: 'HKM005', sumber: 'MK Baru' },
  { id: 5,  kode: 'UMP1003', nama: 'Bahasa Inggris 1', sks: 2, semester: 1, pengampu: 'Irfun, M.Pd', kodeDosen: 'HKM005', sumber: 'MK Baru' },
  { id: 6,  kode: 'HKM1301', nama: 'Pengantar Hukum Indonesia', sks: 3, semester: 1, pengampu: 'Dr. Hendrik Dengah, S.H., M.H', kodeDosen: 'HKM002', sumber: 'MK Baru' },
  { id: 7,  kode: 'HKM1302', nama: 'Pengantar Ilmu Hukum', sks: 3, semester: 1, pengampu: 'Mursani, S.H., M.H.', kodeDosen: 'HKM007', sumber: 'MK Baru' },
  { id: 8,  kode: 'HKM1203', nama: 'Pendidikan Anti Korupsi', sks: 2, semester: 1, pengampu: 'Dr. Muhammad Yusuf, S.H., M.H', kodeDosen: 'HKM001', sumber: 'MK Baru' },
  { id: 9,  kode: 'HKM1204', nama: 'Ilmu Negara', sks: 2, semester: 1, pengampu: 'Rifqi Anan Pratama, S.H., M.H', kodeDosen: 'HKM009', sumber: 'MK Baru' },
  // Semester 2 — MK Baru (dosen dari referensi Excel)
  { id: 10, kode: 'UMP1203', nama: 'AI Islam dan Kemuhammadiyahan (AIK) 2', sks: 3, semester: 2, pengampu: 'Dr. Tri Mulyadi, S.H., M.H', kodeDosen: 'HKM003', sumber: 'MK Baru' },
  { id: 11, kode: 'UMP2005', nama: 'Bahasa Inggris 2', sks: 2, semester: 2, pengampu: 'Irfun, M.Pd', kodeDosen: 'HKM005', sumber: 'MK Baru' },
  { id: 12, kode: 'HKM2305', nama: 'Hukum Pidana', sks: 3, semester: 2, pengampu: 'Adimas Reza Prayudi M, S.H., M.H.', kodeDosen: 'HKM006', sumber: 'MK Baru' },
  { id: 13, kode: 'HKM2306', nama: 'Hukum Perdata', sks: 3, semester: 2, pengampu: 'Ismail Maswatu, S.E., S.H., M.H', kodeDosen: 'HKM004', sumber: 'MK Baru' },
  { id: 14, kode: 'HKM2307', nama: 'Hukum Tata Negara', sks: 3, semester: 2, pengampu: 'Rifqi Anan Pratama, S.H., M.H', kodeDosen: 'HKM009', sumber: 'MK Baru' },
  { id: 15, kode: 'HKM2208', nama: 'Hukum Islam', sks: 2, semester: 2, pengampu: 'Dr. Tri Mulyadi, S.H., M.H', kodeDosen: 'HKM003', sumber: 'MK Baru' },
  { id: 16, kode: 'UMP2007', nama: 'Pendidikan Kewarganegaraan', sks: 2, semester: 2, pengampu: 'Ismail Maswatu, S.E., S.H., M.H', kodeDosen: 'HKM004', sumber: 'MK Baru' },
  { id: 17, kode: 'HKM2209', nama: 'Pengantar Sosiologi Hukum', sks: 2, semester: 2, pengampu: 'Mursani, S.H., M.H.', kodeDosen: 'HKM007', sumber: 'MK Baru' },
  // Semester 3 — MK Baru, dosen dicocokkan dari MK Lama
  { id: 18, kode: 'UMP1303', nama: 'AI Islam dan Kemuhammadiyahan 3', sks: 3, semester: 3, pengampu: 'Dr. Tri Mulyadi, S.H., M.H', kodeDosen: 'HKM003', sumber: 'MK Baru' },
  { id: 19, kode: 'HKM3210', nama: 'Hukum Perkawinan di Indonesia', sks: 2, semester: 3, pengampu: 'Adimas Reza Prayudi M, S.H., M.H.', kodeDosen: 'HKM006', sumber: 'MK Baru' },
  { id: 20, kode: 'HKM3311', nama: 'Hukum Dagang', sks: 3, semester: 3, pengampu: 'Rifqi Anan Pratama, S.H., M.H', kodeDosen: 'HKM009', sumber: 'MK Baru' },
  { id: 21, kode: 'HKM3312', nama: 'Hukum Agraria', sks: 3, semester: 3, kodeDosen: '-', sumber: 'MK Baru' },
  { id: 22, kode: 'HKM3313', nama: 'Hukum Adat', sks: 3, semester: 3, pengampu: 'Adimas Reza Prayudi M, S.H., M.H.', kodeDosen: 'HKM006', sumber: 'MK Baru' },
  { id: 23, kode: 'HKM3214', nama: 'Hukum dan Hak Asasi Manusia', sks: 2, semester: 3, pengampu: 'Rifqi Anan Pratama, S.H., M.H', kodeDosen: 'HKM009', sumber: 'MK Baru' },
  { id: 24, kode: 'HKM3215', nama: 'Filsafat Hukum', sks: 2, semester: 3, pengampu: 'Dr. Muhammad Yusuf, S.H., M.H', kodeDosen: 'HKM001', sumber: 'MK Baru' },
  { id: 25, kode: 'HKM3216', nama: 'Etnografi Papua', sks: 2, semester: 3, pengampu: 'Irfun, M.Pd', kodeDosen: 'HKM005', sumber: 'MK Baru' },
  { id: 26, kode: 'HKM3217', nama: 'Tindak Pidana Di Dalam KUHP', sks: 2, semester: 3, pengampu: 'Mursani, S.H., M.H.', kodeDosen: 'HKM007', sumber: 'MK Baru' },
  { id: 27, kode: 'HKM3218', nama: 'Sosiologi Hukum', sks: 2, semester: 3, pengampu: 'Mursani, S.H., M.H.', kodeDosen: 'HKM007', sumber: 'MK Baru' },
  // Semester 4 — MK Baru, dosen dicocokkan dari MK Lama
  { id: 28, kode: 'HKM4319', nama: 'Hukum Adminstrasi Negara', sks: 3, semester: 4, pengampu: 'Rizki Wisudawan Katjong, S.H., M.H.', kodeDosen: 'HKM008', sumber: 'MK Baru' },
  { id: 29, kode: 'HKM4220', nama: 'Hukum Kesehatan', sks: 2, semester: 4, kodeDosen: '-', sumber: 'MK Baru' },
  { id: 30, kode: 'HKM4321', nama: 'Hukum Internasional', sks: 3, semester: 4, kodeDosen: '-', sumber: 'MK Baru' },
  { id: 31, kode: 'HKM4222', nama: 'Hukum Atas Kekayaan Intelektual', sks: 2, semester: 4, pengampu: 'Rizki Wisudawan Katjong, S.H., M.H.', kodeDosen: 'HKM008', sumber: 'MK Baru' },
  { id: 32, kode: 'HKM4223', nama: 'Hukum Perpajakan', sks: 2, semester: 4, kodeDosen: '-', sumber: 'MK Baru' },
  { id: 33, kode: 'HKM4224', nama: 'Hukum Ketenagakerjaan', sks: 2, semester: 4, pengampu: 'Ismail Maswatu, S.E., S.H., M.H', kodeDosen: 'HKM004', sumber: 'MK Baru' },
  { id: 34, kode: 'HKM4225', nama: 'Hukum Siber', sks: 2, semester: 4, pengampu: 'Dr. Muhammad Yusuf, S.H., M.H', kodeDosen: 'HKM001', sumber: 'MK Baru' },
  { id: 35, kode: 'HKM4326', nama: 'Hukum Perjanjian dan Perikatan', sks: 3, semester: 4, pengampu: 'Dr. Tri Mulyadi, S.H., M.H', kodeDosen: 'HKM003', sumber: 'MK Baru' },
  { id: 36, kode: 'HKM4277', nama: 'Tindak Pidana Di Luar KUHP', sks: 2, semester: 4, pengampu: 'Mursani, S.H., M.H.', kodeDosen: 'HKM007', sumber: 'MK Baru' },
  { id: 37, kode: 'HKM4328', nama: 'Kriminologi dan Viktimologi', sks: 3, semester: 4, pengampu: 'Dr. Hendrik Dengah, S.H., M.H', kodeDosen: 'HKM002', sumber: 'MK Baru' },
  // Semester 5 — MK Baru, dosen dicocokkan dari MK Lama
  { id: 38, kode: 'HKM5229', nama: 'Hukum Perlindungan Anak dan Perempuan', sks: 2, semester: 5, pengampu: 'Adimas Reza Prayudi M, S.H., M.H.', kodeDosen: 'HKM006', sumber: 'MK Baru' },
  { id: 39, kode: 'HKM5330', nama: 'Hukum Konstitusi', sks: 3, semester: 5, pengampu: 'Dr. Hendrik Dengah, S.H., M.H', kodeDosen: 'HKM002', sumber: 'MK Baru' },
  { id: 40, kode: 'HKM5431', nama: 'Hukum Acara Peradilan Agama dan Praktek Peradilan Agama', sks: 4, semester: 5, kodeDosen: '-', sumber: 'MK Baru' },
  { id: 41, kode: 'HKM5232', nama: 'Hukum Perlindungan Konsumen', sks: 2, semester: 5, pengampu: 'Mursani, S.H., M.H.', kodeDosen: 'HKM007', sumber: 'MK Baru' },
  { id: 42, kode: 'HKM5333', nama: 'Hukum Lingkungan', sks: 3, semester: 5, pengampu: 'Dr. Tri Mulyadi, S.H., M.H', kodeDosen: 'HKM003', sumber: 'MK Baru' },
  { id: 43, kode: 'HKM5434', nama: 'Hukum Acara Pidana dan Praktek Peradilan Pidana', sks: 4, semester: 5, pengampu: 'Dr. Hendrik Dengah, S.H., M.H', kodeDosen: 'HKM002', sumber: 'MK Baru' },
  { id: 44, kode: 'HKM5435', nama: 'Hukum Acara Perdata dan Praktek Peradilan Perdata', sks: 4, semester: 5, pengampu: 'Ismail Maswatu, S.E., S.H., M.H', kodeDosen: 'HKM004', sumber: 'MK Baru' },
  { id: 45, kode: 'HKM5236', nama: 'Hukum Perbankan', sks: 2, semester: 5, pengampu: 'Mursani, S.H., M.H.', kodeDosen: 'HKM007', sumber: 'MK Baru' },
  // Semester 6 — MK Baru, dosen dicocokkan dari MK Lama
  { id: 46, kode: 'HKM6337', nama: 'Hukum Pembuktian', sks: 2, semester: 6, pengampu: 'Dr. Tri Mulyadi, S.H., M.H', kodeDosen: 'HKM003', sumber: 'MK Baru' },
  { id: 47, kode: 'HKM6338', nama: 'Hukum Pertambangan & Sumber Daya Mineral', sks: 3, semester: 6, pengampu: 'Mursani, S.H., M.H.', kodeDosen: 'HKM007', sumber: 'MK Baru' },
  { id: 48, kode: 'HKM6239', nama: 'Etika Profesi Hukum', sks: 2, semester: 6, pengampu: 'Ismail Maswatu, S.E., S.H., M.H', kodeDosen: 'HKM004', sumber: 'MK Baru' },
  { id: 49, kode: 'HKM6240', nama: 'Metode Penelitian Hukum', sks: 3, semester: 6, pengampu: 'Adimas Reza Prayudi M, S.H., M.H.', kodeDosen: 'HKM006', sumber: 'MK Baru' },
  { id: 50, kode: 'HKM6241', nama: 'Alternative Dispute Resolution', sks: 2, semester: 6, kodeDosen: '-', sumber: 'MK Baru' },
  { id: 51, kode: 'HKM6442', nama: 'Hukum Acara Peradilan PTUN dan Praktek Peradilan TUN', sks: 4, semester: 6, pengampu: 'Ratna Jaya, S.H., M.H', kodeDosen: 'HKM010', sumber: 'MK Baru' },
  { id: 52, kode: 'HKM6343', nama: 'Hukum Pidana Adat', sks: 3, semester: 6, pengampu: 'Dr. Hendrik Dengah, S.H., M.H', kodeDosen: 'HKM002', sumber: 'MK Baru' },
  { id: 53, kode: 'HKM6244', nama: 'Penologi dan Permasyarakatan', sks: 2, semester: 6, kodeDosen: '-', sumber: 'MK Baru' },
  { id: 54, kode: 'HKM6345', nama: 'Ilmu Perundang-Undangan', sks: 3, semester: 6, pengampu: 'Rizki Wisudawan Katjong, S.H., M.H.', kodeDosen: 'HKM008', sumber: 'MK Baru' },
  // Semester 7 — MK Baru (pelaksanaan mandiri/institusional)
  { id: 55, kode: 'UMP7009', nama: 'Magang', sks: 6, semester: 7, kodeDosen: '-', sumber: 'MK Baru' },
  { id: 56, kode: 'UMP7010', nama: 'Kuliah Kerja Nyata (KKN)', sks: 6, semester: 7, kodeDosen: '-', sumber: 'MK Baru' },
  // Semester 8 — MK Baru
  { id: 57, kode: 'HKM8648', nama: 'Tugas Akhir', sks: 6, semester: 8, kodeDosen: '-', sumber: 'MK Baru' }
];
const LEGACY_SEED_KURIKULUM = [
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
function curriculumSignature(courses) {
  const snapshot = JSON.stringify(courses.map(course => [
    course.id, course.kode, course.nama, course.sks, course.semester, course.pengampu || ''
  ]));
  let first = 0x811c9dc5;
  let second = 0x12345678;
  for (let i = 0; i < snapshot.length; i += 1) {
    const code = snapshot.charCodeAt(i);
    first = Math.imul(first ^ code, 0x01000193);
    second = Math.imul(second ^ code, 0x01000193);
  }
  return (first >>> 0).toString(16).padStart(8, '0') +
    (second >>> 0).toString(16).padStart(8, '0');
}
const CURRICULUM_MIGRATION_KEY = 'kurikulumMkBaruAllSemestersV3';
// Signature seed kurikulum versi sebelumnya (termasuk yang masih memuat kode
// UMP1002 duplikat pada id 4 "Bahasa Indonesia") — dijadikan "known default"
// agar migrasi otomatis mengganti data tersebut dengan seed terbaru (UMP1005).
const PREVIOUS_MK_BARU_SIGNATURES = ['72b369af881db03a', '8b7326c6e85421d1', '0fc79d6fa11de2e2', 'bb4ff1d968acffbe'];
const PREVIOUS_NORMALIZED_CURRICULUM_SIGNATURES = [];
let SAMPLE_KURIKULUM = DB.load('kurikulum', SEED_KURIKULUM);
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
const curriculumMigrationStatus = DB.load(CURRICULUM_MIGRATION_KEY, '');
if (!curriculumMigrationStatus) {
  const savedSignature = Array.isArray(SAMPLE_KURIKULUM) ? curriculumSignature(SAMPLE_KURIKULUM) : '';
  const isKnownDefault = JSON.stringify(SAMPLE_KURIKULUM) === JSON.stringify(LEGACY_SEED_KURIKULUM) ||
    PREVIOUS_MK_BARU_SIGNATURES.includes(savedSignature) ||
    PREVIOUS_NORMALIZED_CURRICULUM_SIGNATURES.includes(savedSignature);
  const isNormalizedDefault = savedSignature === curriculumSignature(SEED_KURIKULUM);
  if (isKnownDefault) {
    if (DB.save('kurikulum', SEED_KURIKULUM)) {
      SAMPLE_KURIKULUM = SEED_KURIKULUM;
      if (!DB.save(CURRICULUM_MIGRATION_KEY, 'normalized')) {
        console.error('DB: gagal menandai normalisasi kurikulum sebagai selesai.');
      }
    } else {
      console.error('DB: gagal memperbarui kurikulum bawaan dari workbook normalisasi.');
    }
  } else if (isNormalizedDefault) {
    if (!DB.save(CURRICULUM_MIGRATION_KEY, 'normalized')) {
      console.error('DB: gagal menandai normalisasi kurikulum sebagai selesai.');
    }
  } else {
    if (!DB.save(CURRICULUM_MIGRATION_KEY, 'preserved-admin-data')) {
      console.error('DB: gagal menandai kurikulum yang dikelola admin.');
    }
    console.warn('DB: kurikulum tersimpan berbeda dari data bawaan; migrasi otomatis dilewati untuk mempertahankan perubahan admin.');
  }
}

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
  { id: 3, judul: 'Cadangan Penyimpanan', pesan: 'IndexedDB menerima salinan tambahan secara best-effort; localStorage tetap menjadi penyimpanan utama.', waktu: '2 jam lalu', read: true, icon: '\u{1F4BE}' }
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
          'Password sementara dibuat otomatis. Segera ubah lewat menu Pengguna.');
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
  visi: 'Universitas unggul, berbudaya, dan berwawasan lingkungan tahun 2030.',
  misi: 'Menyelenggarakan pembinaan dan pengembangan Al-Islam dan Kemuhammadiyahan\nMenyelenggarakan pendidikan dan pengajaran berdasarkan Tri Dharma Perguruan Tinggi\nMengembangkan ilmu pengetahuan, teknologi, dan seni (IPTEKS) dalam bidang sosial humaniora serta sains dan teknologi yang berwawasan budaya dan lingkungan\nMembudayakan kegiatan penelitian dan pengabdian kepada masyarakat dalam bidang IPTEK yang berwawasan budaya dan lingkungan\nMemperluas akses kerja sama dengan instansi, dunia usaha, dan industri',
  tujuan: 'Menghasilkan lulusan yang menguasai ilmu hukum, memiliki keterampilan praktik hukum, serta berkarakter amanah dan berkeadilan dalam menjalankan profesinya.',
  lulusan: 'Praktisi hukum, aparatur negara, akademisi, dan wirausaha hukum.'
};
const LEGACY_PROFIL_VISI = 'Menjadi program studi hukum yang unggul, islami, dan berdaya saing dalam menghasilkan sarjana hukum yang berintegritas di kawasan timur Indonesia.';
const LEGACY_PROFIL_MISI = 'Menyelenggarakan pendidikan hukum yang berkualitas\nMengembangkan penelitian hukum yang aplikatif\nMelaksanakan pengabdian masyarakat berbasis hukum\nMembangun kerja sama dengan lembaga hukum';
let SAMPLE_PROFIL = DB.load('profil', SEED_PROFIL);
let profilNeedsMigration = false;
if (SAMPLE_PROFIL.visi === LEGACY_PROFIL_VISI) {
  SAMPLE_PROFIL.visi = SEED_PROFIL.visi;
  profilNeedsMigration = true;
}
if (SAMPLE_PROFIL.misi === LEGACY_PROFIL_MISI) {
  SAMPLE_PROFIL.misi = SEED_PROFIL.misi;
  profilNeedsMigration = true;
}
if (profilNeedsMigration) DB.save('profil', SAMPLE_PROFIL);

// Struktur Organisasi — sebelumnya 3 kartu (nama, jabatan, foto) hardcode
// langsung di profil.html tanpa terhubung ke data apapun. Sekarang dikelola
// lewat Admin (admin/profil-prodi.html) dan disimpan di DB seperti entitas
// lain, supaya halaman publik menampilkan data yang sesungguhnya dikelola.
const SEED_STRUKTUR = [
  { id: 1, nama: 'Dr. Muhammad Yusuf, S.H., M.H', jabatan: 'Kepala Program Studi', foto: '', dosenId: 1 },
  { id: 2, nama: 'Dr. Hendrik Dengah, S.H., M.H', jabatan: 'Sekretaris Program Studi', foto: '', dosenId: 2 },
  { id: 3, nama: 'Ismail Maswatu, S.E., S.H., M.H', jabatan: 'Koordinator Kemahasiswaan', foto: '', dosenId: 4 }
];
// Nama-nama lama dari LEGACY_SEED_DOSEN — dipakai untuk mendeteksi seed usang
// yang belum ditautkan ke SEED_DOSEN terkini, supaya migrasi tidak menimpa
// perubahan yang sudah dibuat admin melalui panel.
const LEGACY_STRUKTUR_NAMES = ['Dr. Ahmad Fauzi, S.H., M.H.', 'Rina Marlina, S.H., M.H.', 'Yusuf Kamal, S.H., M.Kn.'];
let SAMPLE_STRUKTUR = DB.load('struktur', SEED_STRUKTUR);
// Migrasi: apabila semua record struktur masih menggunakan nama lama DAN tidak
// ada satu pun yang memiliki dosenId, ganti dengan seed terbaru yang sudah
// terhubung ke SEED_DOSEN. Jika admin sudah mengubah struktur (berbeda nama
// atau sudah ada dosenId), migrasi dilewati untuk menjaga perubahan admin.
(function migrateStruktur() {
  if (!Array.isArray(SAMPLE_STRUKTUR) || SAMPLE_STRUKTUR.length === 0) return;
  const isLegacy =
    SAMPLE_STRUKTUR.every(s => !s.dosenId) &&
    SAMPLE_STRUKTUR.some(s => LEGACY_STRUKTUR_NAMES.includes(s.nama));
  if (!isLegacy) return;
  if (DB.save('struktur', SEED_STRUKTUR)) {
    SAMPLE_STRUKTUR = SEED_STRUKTUR;
  } else {
    console.error('DB: gagal memperbarui seed struktur organisasi ke roster dosen terkini.');
  }
})();

// Pengaturan Website — dipakai admin/pengaturan.html (form) dan ditampilkan
// di header, footer + halaman Kontak pada seluruh halaman publik.
const SEED_PENGATURAN = {
  namaWebsite: 'Program Studi Hukum UMP', deskripsi: 'Website resmi Program Studi Hukum Universitas Muhammadiyah Papua.',
  logo: '../assets/image/logo-ump.png', favicon: '../assets/image/logo-ump.png',
  theme: 'Neumorphism', primaryColor: '#2A4E9E', darkMode: true,
  metaTitle: 'Program Studi Hukum — UMP', metaDesc: 'Informasi akademik Program Studi Hukum UMP.', keywords: 'hukum, UMP, program studi hukum',
  facebook: '', instagram: '', youtube: '', linkedin: '', tiktok: '',
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

const SEED_DATA_BY_KEY = {
  berita: SEED_BERITA,
  dosen: SEED_DOSEN,
  dokumen: SEED_DOKUMEN,
  galeri: SEED_GALERI,
  pengumuman: SEED_PENGUMUMAN,
  kegiatan: SEED_KEGIATAN,
  pendaftar: SEED_PENDAFTAR,
  pesan: SEED_PESAN,
  artikel: SEED_ARTIKEL,
  prestasi: SEED_PRESTASI,
  kurikulum: SEED_KURIKULUM,
  alumni: SEED_ALUMNI,
  pengguna: SEED_PENGGUNA,
  aktivitas: SEED_AKTIVITAS,
  notifikasi: SEED_NOTIFIKASI,
  profil: SEED_PROFIL,
  struktur: SEED_STRUKTUR,
  pengaturan: SEED_PENGATURAN
};

const CONTENT_DB_KEYS = new Set([
  'berita', 'dosen', 'dokumen', 'galeri', 'pengumuman', 'kegiatan',
  'artikel', 'prestasi', 'kurikulum', 'alumni', 'profil', 'struktur', 'pengaturan'
]);
function applyDatabaseUpdate(key, data) {
  if (key === 'berita' && Array.isArray(data)) SAMPLE_BERITA = data;
  if (key === 'dosen' && Array.isArray(data)) SAMPLE_DOSEN = data;
  if (key === 'dokumen' && Array.isArray(data)) SAMPLE_DOKUMEN = data;
  if (key === 'galeri' && Array.isArray(data)) SAMPLE_GALERI = data;
  if (key === 'pengumuman' && Array.isArray(data)) SAMPLE_PENGUMUMAN = data;
  if (key === 'kegiatan' && Array.isArray(data)) SAMPLE_KEGIATAN = data;
  if (key === 'artikel' && Array.isArray(data)) SAMPLE_ARTIKEL = data;
  if (key === 'prestasi' && Array.isArray(data)) SAMPLE_PRESTASI = data;
  if (key === 'kurikulum' && Array.isArray(data)) SAMPLE_KURIKULUM = data;
  if (key === 'alumni' && Array.isArray(data)) SAMPLE_ALUMNI = data;
  if (key === 'profil' && data && typeof data === 'object' && !Array.isArray(data)) SAMPLE_PROFIL = data;
  if (key === 'struktur' && Array.isArray(data)) SAMPLE_STRUKTUR = data;
  if (key === 'pengaturan' && data && typeof data === 'object' && !Array.isArray(data)) SAMPLE_PENGATURAN = data;
  if (key === 'pengguna' && Array.isArray(data)) SAMPLE_PENGGUNA = data;
  if (key === 'pendaftar' && Array.isArray(data)) SAMPLE_PENDAFTAR = data;
  if (key === 'pesan' && Array.isArray(data)) SAMPLE_PESAN = data;
  if (key === 'aktivitas' && Array.isArray(data)) SAMPLE_AKTIVITAS = data;
  if (key === 'notifikasi' && Array.isArray(data)) SAMPLE_NOTIFIKASI = data;
}
window.addEventListener('db-update', (event) => {
  if (!event.detail || typeof event.detail.key !== 'string') return;
  const { key, data } = event.detail;
  applyDatabaseUpdate(key, data);
  if (key === 'notifikasi') window.dispatchEvent(new CustomEvent('notif-update'));
  if (CONTENT_DB_KEYS.has(key) && !/\/admin\//.test(window.location.pathname)) {
    window.location.reload();
  }
});
window.addEventListener('storage', (event) => {
  if (!event.key || !event.key.startsWith(DB.NS)) return;
  const key = event.key.slice(DB.NS.length);
  if (event.newValue === null) {
    if (!Object.prototype.hasOwnProperty.call(SEED_DATA_BY_KEY, key)) return;
    const data = JSON.parse(JSON.stringify(SEED_DATA_BY_KEY[key]));
    if (!DB.save(key, data)) {
      console.error(`DB: gagal memulihkan data "${key}" setelah key dihapus.`);
      window.dispatchEvent(new CustomEvent('db-update', { detail: { key, data } }));
    }
    return;
  }

  let data;
  try {
    data = JSON.parse(event.newValue);
  } catch (error) {
    console.warn(`DB: data lintas-tab "${key}" tidak valid.`, error);
    return;
  }

  window.dispatchEvent(new CustomEvent('db-update', { detail: { key, data } }));
});

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
    dosenStruktur(member) {
      return SAMPLE_DOSEN.find(dosen => String(dosen.id) === String(member.dosenId)) || null;
    },
    struktur: SAMPLE_STRUKTUR
  };
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
      return this.all.filter(m => Number(m.semester) === Number(this.semester));
    },
    get semesterSks() {
      return this.results.reduce((total, course) => total + Number(course.sks || 0), 0);
    },
    get totalSks() {
      return this.all.reduce((total, course) => total + Number(course.sks || 0), 0);
    },
    download() {
      const quote = value => '"' + String(value).replace(/"/g, '""') + '"';
      const rows = [
        ['Semester', 'Kode MK', 'Mata Kuliah', 'SKS', 'Dosen Pengampu', 'Kode Dosen'],
        ...this.all.map(course => [
          course.semester, course.kode, course.nama, course.sks,
          course.pengampu || '', course.kodeDosen || '-'
        ])
      ];
      const csv = '\uFEFF' + rows.map(row => row.map(quote).join(',')).join('\r\n');
      const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = 'kurikulum-prodi-hukum-mk-baru.csv';
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 0);
    }
  };
}

function detailPengumumanPage() {
  const item = detailFromQuery(SAMPLE_PENGUMUMAN);
  return {
    item,
    related: SAMPLE_PENGUMUMAN.filter(p => p.id !== item.id).slice(0, 3),
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
  const item = detailFromQuery(SAMPLE_KEGIATAN);
  return {
    item,
    related: SAMPLE_KEGIATAN.filter(k => k.id !== item.id).slice(0, 3),
    daftarOpen: false,
    submitting: false,
    participantRevision: 0,
    form: { nama: '', email: '', whatsapp: '', instansi: '' },
    init() {
      window.addEventListener('db-update', event => {
        if (event.detail?.key === 'pendaftar') this.participantRevision += 1;
      });
      // Dukungan tautan langsung `detail-kegiatan.html?id=..#daftar` dari
      // halaman kegiatan.html supaya formulir pendaftaran otomatis terbuka.
      if (window.location.hash === '#daftar') {
        this.openDaftar();
      }
    },
    // Jumlah pendaftar dihitung langsung dari data sungguhan (bukan angka
    // statis) supaya selalu konsisten dengan yang tercatat di Admin Panel.
    get jumlahPendaftar() {
      this.participantRevision;
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
    editingSnapshot: undefined,
    init() {
      window.addEventListener('db-update', event => {
        if (event.detail?.key === 'galeri' && Array.isArray(event.detail.data)) {
          this.foto = [...event.detail.data];
        }
      });
    },
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
      if (!DB.save('galeri', this.foto)) return false;
      SAMPLE_GALERI = this.foto;
      return true;
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
      this.editingSnapshot = undefined;
      this.form = { judul: '', album: 'Seminar', src: '' };
      this.showModal = true;
    },
    openEdit(item) {
      this.editing = item.id;
      this.editingSnapshot = JSON.stringify(item);
      this.form = { ...item };
      this.showModal = true;
    },
    save() {
      if (!this.form.judul) { NeuAlert.error('Judul/caption foto wajib diisi.'); return; }
      if (!this.form.src) { NeuAlert.error('Pilih foto terlebih dahulu.'); return; }
      if (this.editing !== null && this.editing !== undefined) {
        if (!hasCurrentRecord(this.foto, this.editing, 'Foto', this.editingSnapshot)) return;
        const idx = this.foto.findIndex(f => f.id === this.editing);
        const prev = this.foto[idx];
        this.foto[idx] = { ...this.form };
        if (!this.persist()) { this.foto[idx] = prev; NeuAlert.storageFull(); return; }
        logActivity('Memperbarui foto: ' + this.form.judul, '\u270F\uFE0F');
        NeuAlert.updated('Foto galeri berhasil diperbarui.');
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
      this.editingSnapshot = undefined;
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
    editingSnapshot: undefined,
    uploading: false,
    q: '',
    form: { ...emptyForm },
    init() {
      window.addEventListener('db-update', event => {
        if (event.detail?.key === 'dokumen' && Array.isArray(event.detail.data)) {
          this.rows = [...event.detail.data];
        }
      });
    },
    get filtered() {
      return this.rows.filter(r => (r.nama || '').toLowerCase().includes(this.q.toLowerCase()));
    },
    persist() {
      if (!DB.save('dokumen', this.rows)) return false;
      SAMPLE_DOKUMEN = this.rows;
      return true;
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
      this.editingSnapshot = undefined;
      this.form = { ...emptyForm };
      this.showModal = true;
    },
    openEdit(row) {
      this.editing = row.id;
      this.editingSnapshot = JSON.stringify(row);
      this.form = { ...emptyForm, ...row };
      this.showModal = true;
    },
    save() {
      if (!this.form.nama.trim()) { NeuAlert.error('Nama dokumen wajib diisi.'); return; }
      if ((this.editing === null || this.editing === undefined) && !this.form.fileData) { NeuAlert.error('Silakan unggah berkas PDF/DOC/DOCX terlebih dahulu.'); return; }

      if (this.editing !== null && this.editing !== undefined) {
        if (!hasCurrentRecord(this.rows, this.editing, 'Dokumen', this.editingSnapshot)) return;
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
      this.editing = null;
      this.editingSnapshot = undefined;
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
    editingSnapshot: undefined,
    q: '',
    rows: [...config.rows],
    form: { ...config.emptyForm },
    init() {
      window.addEventListener('db-update', event => {
        if (event.detail?.key === 'pengguna' && Array.isArray(event.detail.data)) {
          this.rows = [...event.detail.data];
        }
      });
    },
    get filtered() {
      const keys = config.searchKeys || ['nama', 'email'];
      return this.rows.filter(row =>
        keys.some(k => String(row[k] || '').toLowerCase().includes(this.q.toLowerCase()))
      );
    },
    persist() {
      if (!DB.save('pengguna', this.rows)) return false;
      SAMPLE_PENGGUNA = this.rows;
      return true;
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
      // Password lama sengaja TIDAK dimuat ke form (dikosongkan) supaya
      // tidak terpampang begitu saja di layar. Isi field ini hanya jika
      // admin ingin mengganti password akun tersebut.
      this.form = { ...row, password: '' };
      this.showModal = true;
    },
    save() {
      if (config.validate && !config.validate(this.form, this.editing !== null && this.editing !== undefined)) return;

      const email = String(this.form.email || '').trim().toLocaleLowerCase('id-ID');
      const duplicateEmail = this.rows.some(row =>
        String(row.email || '').trim().toLocaleLowerCase('id-ID') === email &&
        String(row.id) !== String(this.editing)
      );
      if (email && duplicateEmail) {
        NeuAlert.error('Email tersebut sudah digunakan oleh akun lain.');
        return;
      }
      this.form.email = String(this.form.email || '').trim();
      this.form.nama = String(this.form.nama || '').trim();

      if ((this.editing === null || this.editing === undefined) && !(this.form.password || '').trim()) {
        NeuAlert.error('Kata sandi wajib diisi untuk akun baru.');
        return;
      }

      if (this.editing !== null && this.editing !== undefined) {
        if (!hasCurrentRecord(this.rows, this.editing, 'Akun', this.editingSnapshot)) return;
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
      this.editing = null;
      this.editingSnapshot = undefined;
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
    editingSnapshot: undefined,
    uploadingFoto: false,
    q: '',
    filterValue: 'all',
    rows: [...config.rows],
    form: { ...config.emptyForm },
    relatedDataRevision: 0,
    get filtered() {
      this.relatedDataRevision;
      const keys = config.searchKeys || ['nama'];
      return this.rows.filter(row =>
        keys.some(k => {
          const value = config.searchValue
            ? config.searchValue(row, k)
            : row[k];
          return String(value || '').toLowerCase().includes(this.q.toLowerCase());
        }) &&
        (!config.filter || config.filter(row, this.filterValue))
      );
    },
    clearFilters() {
      this.q = '';
      this.filterValue = 'all';
    },
    exportCsv() {
      if (!Array.isArray(config.exportColumns) || config.exportColumns.length === 0) {
        NeuAlert.error('Kolom ekspor belum dikonfigurasi.');
        return;
      }

      const quote = value => {
        const text = String(value == null ? '' : value);
        const safe = /^[\t\r ]*[=+\-@]/.test(text) ? "'" + text : text;
        return '"' + safe.replace(/"/g, '""') + '"';
      };
      const rows = [
        config.exportColumns.map(column => column[0]),
        ...this.filtered.map(row => config.exportColumns.map(column =>
          typeof column[2] === 'function' ? column[2](row) : row[column[1]]
        ))
      ];
      const csv = '\uFEFF' + rows.map(row => row.map(quote).join(',')).join('\r\n');
      const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = config.exportFilename || 'data.csv';
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 0);
      NeuAlert.success(`${this.filtered.length} mata kuliah diekspor ke CSV.`);
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
      window.addEventListener('db-update', (event) => {
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
      this.editing = null;
      this.editingSnapshot = undefined;
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
    participantRevision: 0,
    showPeserta: false,
    pesertaOf: null, // kegiatan yang sedang dilihat daftar pesertanya
    init() {
      if (typeof base.init === 'function') base.init.call(this);
      window.addEventListener('db-update', event => {
        if (event.detail?.key === 'pendaftar') this.participantRevision += 1;
      });
    },
    // Dipanggil dari template lewat `jumlahPeserta(r)` — dihitung langsung
    // dari data pendaftar sungguhan (bukan angka statis).
    jumlahPeserta(row) {
      this.participantRevision;
      return pesertaKegiatan(row.id).length;
    },
    get pesertaList() {
      this.participantRevision;
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

// ---- Admin: Activity Log (aktivitas.html) ----
function adminAktivitasPage() {
  return {
    q: '',
    filterUser: 'Semua',
    filterType: 'Semua',
    revision: 0,
    pesan: [...(SAMPLE_PESAN || [])],
    init() {
      window.addEventListener('db-update', (event) => {
        if (event.detail && event.detail.key === 'pesan') {
          this.pesan = [...(SAMPLE_PESAN || [])];
        }
        if (event.detail && event.detail.key === 'aktivitas') {
          this.revision += 1;
        }
      });
    },
    get unreadPesan() {
      return this.pesan.filter((item) => !item.read).length;
    },
    markPesanRead(item) {
      if (item.read) return;
      const previous = this.pesan;
      this.pesan = this.pesan.map((message) =>
        message.id === item.id ? { ...message, read: true } : message
      );
      SAMPLE_PESAN = this.pesan;
      if (!DB.save('pesan', SAMPLE_PESAN)) {
        this.pesan = previous;
        SAMPLE_PESAN = previous;
        NeuAlert.storageFull();
        return;
      }
    },
    async hapusPesan(item) {
      const ok = await NeuAlert.confirmDelete('pesan ini');
      if (!ok) return;
      const previous = this.pesan;
      this.pesan = this.pesan.filter((message) => message.id !== item.id);
      SAMPLE_PESAN = this.pesan;
      if (!DB.save('pesan', SAMPLE_PESAN)) {
        this.pesan = previous;
        SAMPLE_PESAN = previous;
        NeuAlert.storageFull();
        return;
      }
      logActivity(`Menghapus pesan kontak dari ${item.nama}`, '\u{1F5D1}\u{FE0F}');
      NeuAlert.deleted('Pesan berhasil dihapus.');
    },
    get list() {
      this.revision;
      return (typeof SAMPLE_AKTIVITAS !== 'undefined' && Array.isArray(SAMPLE_AKTIVITAS)) ? SAMPLE_AKTIVITAS : [];
    },
    get userOptions() {
      const users = new Set(this.list.map(a => a.user).filter(Boolean));
      return ['Semua', ...Array.from(users)];
    },
    get filteredList() {
      const query = (this.q || '').trim().toLowerCase();
      const uFilter = this.filterUser;
      const tFilter = this.filterType;

      return this.list.filter(a => {
        const user = (a.user || '').toLowerCase();
        const aksi = (a.aksi || '').toLowerCase();
        const waktu = (a.waktu || '').toLowerCase();
        const matchesQuery = !query || user.includes(query) || aksi.includes(query) || waktu.includes(query);

        const matchesUser = (uFilter === 'Semua') || (a.user === uFilter);

        let matchesType = true;
        if (tFilter !== 'Semua') {
          if (tFilter === 'Login') {
            matchesType = aksi.includes('login') || aksi.includes('masuk');
          } else if (tFilter === 'Tambah') {
            matchesType = aksi.includes('menambah') || aksi.includes('tambah') || aksi.includes('buat');
          } else if (tFilter === 'Ubah') {
            matchesType = aksi.includes('edit') || aksi.includes('ubah') || aksi.includes('memperbarui') || aksi.includes('update');
          } else if (tFilter === 'Hapus') {
            matchesType = aksi.includes('hapus') || aksi.includes('delete');
          } else if (tFilter === 'Publikasi') {
            matchesType = aksi.includes('publikasi') || aksi.includes('unggah') || aksi.includes('upload');
          }
        }

        return matchesQuery && matchesUser && matchesType;
      });
    },
    get totalAktivitas() {
      return this.list.length;
    },
    get aktivitasHariIni() {
      return this.list.filter(a => {
        const w = (a.waktu || '').toLowerCase();
        return w.includes('lalu') || w.includes('menit') || w.includes('jam') || w.includes('baru saja');
      }).length;
    },
    getUserInitials(user) {
      if (!user) return 'AD';
      const clean = user.replace(/\(.*?\)/g, '').trim().split(' ').filter(Boolean);
      if (clean.length >= 2) return (clean[0][0] + clean[1][0]).toUpperCase();
      return (clean[0] || 'AD').substring(0, 2).toUpperCase();
    },
    getActionCategory(aksi) {
      const text = (aksi || '').toLowerCase();
      if (text.includes('hapus')) return { label: 'Hapus Data', color: 'badge-important', icon: '\u{1F5D1}\u{FE0F}' };
      if (text.includes('login')) return { label: 'Akses Sistem', color: 'badge-gold', icon: '\u{1F510}' };
      if (text.includes('tambah') || text.includes('buat')) return { label: 'Tambah Data', color: 'badge-active', icon: '\u{2795}' };
      if (text.includes('edit') || text.includes('ubah') || text.includes('memperbarui')) return { label: 'Perubahan Data', color: 'badge-new', icon: '\u{270F}\u{FE0F}' };
      if (text.includes('publikasi') || text.includes('unggah')) return { label: 'Publikasi Dokumen', color: 'badge-red', icon: '\u{1F680}' };
      return { label: 'Aktivitas Umum', color: 'badge-ended', icon: '\u{1F4DD}' };
    },
    resetFilter() {
      this.q = '';
      this.filterUser = 'Semua';
      this.filterType = 'Semua';
    },
    exportCSV() {
      if (!this.filteredList.length) {
        if (typeof NeuAlert !== 'undefined') NeuAlert.warning('Tidak ada data log yang cocok untuk diekspor.');
        return;
      }
      const headers = ['ID', 'Pengguna', 'Aktivitas', 'Waktu'];
      const rows = this.filteredList.map(a => [
        a.id,
        `"${(a.user || '').replace(/"/g, '""')}"`,
        `"${(a.aksi || '').replace(/"/g, '""')}"`,
        `"${(a.waktu || '').replace(/"/g, '""')}"`
      ]);
      const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `log_aktivitas_prodi_hukum_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      if (typeof NeuAlert !== 'undefined') NeuAlert.success('Data log aktivitas berhasil diekspor ke CSV.');
    }
  };
}
