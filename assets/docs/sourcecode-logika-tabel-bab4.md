# Source Code Logika Login dan Tabel CRUD

Dokumen ini berisi cuplikan JavaScript aktual yang menjalankan login serta pengelolaan tabel Dosen dan Kurikulum. Ini bukan diagram Mermaid dan bukan satu file JavaScript mandiri: cuplikan bergantung pada helper dan data global yang sudah ada di aplikasi.

## 1. Validasi dan Pembuatan Sesi Login

Sumber asli: [`../js/app.js`](../js/app.js) dan [`../../admin/login.html`](../../admin/login.html).

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

Sebelum memanggil `AUTH.login`, halaman login mencocokkan email (tanpa membedakan kapital), status `Aktif`, dan kata sandi dengan data `SAMPLE_PENGGUNA`. Data akun dan pemeriksaan ini berjalan di browser, bukan pada server.

### Pemeriksaan kredensial pada form

Sumber asli: [`../../admin/login.html`](../../admin/login.html), metode `submit()` di `loginPage()`.

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

## 2. Relasi Data Dosen dan Kurikulum

Sumber asli: [`../js/app.js`](../js/app.js). Fungsi ini digunakan untuk mencari mata kuliah dosen dan menampilkan nama dosen pada Kurikulum.

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

Pencocokan kode/nama adalah lookup di aplikasi; `kodeDosen` bukan foreign key database.

## 3. Pemeriksaan Data Saat Edit

Sumber asli: [`../js/app.js`](../js/app.js). Snapshot mencegah penyimpanan edit jika record sudah berubah sejak form dibuka.

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

## 4. CRUD Dosen

Sumber asli: [`../js/app.js`](../js/app.js), fungsi `adminDosenPage()`. Berikut inti pembukaan form, penyimpanan, dan penghapusan.

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

## 5. Konfigurasi Tabel Kurikulum

Sumber asli: [`../../admin/kurikulum.html`](../../admin/kurikulum.html). Tabel menggunakan fungsi CRUD generik `adminCrudTable(config)`.

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

## 6. Inti CRUD Generik yang Dipakai Kurikulum

Sumber asli: [`../js/app.js`](../js/app.js), fungsi `adminCrudTable(config)`. Potongan berikut adalah metode di dalam objek yang dikembalikan fungsi tersebut.

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

## 7. Penyimpanan dan Sinkronisasi Data Tabel

Sumber asli: [`../js/app.js`](../js/app.js), fungsi `DB.save(key, data)`.

```javascript
function save(key, data) {
  if (typeof IDB !== 'undefined' && IDB.set) {
    IDB.set(NS + key, data).catch(() => {});
  }

  const serialized = JSON.stringify(data);
  try {
    localStorage.setItem(NS + key, serialized);
    window.dispatchEvent(new CustomEvent('db-update', {
      detail: { key, data }
    }));
    return true;
  } catch (e) {
    pruneStorage();
    try {
      localStorage.setItem(NS + key, serialized);
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

`NS` bernilai `prodihukum_db_v1_`. Penulisan `localStorage` adalah sumber utama; IndexedDB hanya salinan tambahan best-effort. Jika penulisan `localStorage` gagal setelah pemangkasan log internal, fungsi mengembalikan `false`, sehingga pemanggil CRUD memulihkan perubahan di memori.

ERD sistem, termasuk field aktual `DOSEN` dan `KURIKULUM`, tersedia pada [`diagrams/er-diagram.mmd`](diagrams/er-diagram.mmd).

## 8. Model Data JavaScript Sesuai ERD Dosen dan Kurikulum

Pada aplikasi ini ERD direpresentasikan sebagai objek JavaScript di `SEED_DOSEN` dan `SEED_KURIKULUM`, lalu dimuat ke `SAMPLE_DOSEN` dan `SAMPLE_KURIKULUM`. Contoh record berikut menunjukkan field aktual kedua entitas; seed lengkapnya ada di [`../js/app.js`](../js/app.js).

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
  kodeDosen: 'HKM003'
};
```

Inisialisasi data memakai `DB.load`: data tersimpan dipakai bila bentuk luarnya sesuai seed (array untuk Dosen dan Kurikulum); bila key belum ada atau JSON/bentuk luarnya tidak sesuai, aplikasi memakai seed. `DB.load` tidak memvalidasi setiap field pada setiap record. Validasi field diterapkan ketika form CRUD disimpan.

```javascript
let SAMPLE_DOSEN = DB.load('dosen', SEED_DOSEN);
let SAMPLE_KURIKULUM = DB.load('kurikulum', SEED_KURIKULUM);
```

Seed Kurikulum lama dapat membawa metadata impor `sumber` atau `catatan`. Aplikasi mencoba membuang field tersebut sebelum menyimpan record. Jika penyimpanan berhasil, array di memori diganti dengan hasil normalisasi; jika gagal, data lama dipertahankan dan kesalahan dicatat:

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

Dengan demikian field model `DOSEN` adalah `id`, `nama`, dan `kode`; field model `KURIKULUM` adalah `id`, `kode`, `nama`, `sks`, `semester`, `pengampu`, dan `kodeDosen`. Form CRUD Kurikulum memangkas spasi kode/nama, memastikan SKS bilangan bulat 1-6 dan semester bilangan bulat 1-8, serta menyimpan pengampu/kode dosen sebagai string opsional. `kodeDosen` tidak diwajibkan cocok ke record Dosen karena ERD memakai lookup aplikasi, bukan foreign key.
