/* =========================================================
   WEBSITE PROGRAM STUDI HUKUM — SHARED APP LOGIC
   Dark mode, SweetAlert2 standar, dan util Alpine.js global
   ========================================================= */

// ---- Dark mode: terapkan sebelum paint agar tidak flicker ----
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

// ---- SweetAlert2: pesan standar sesuai spesifikasi sistem ----
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

// ---- Contoh generik: form kontak / form admin ----
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
      await new Promise(r => setTimeout(r, 700)); // simulasi request
      this.loading = false;
      NeuAlert.sent();
      this.form = { nama: '', email: '', subjek: '', pesan: '' };
    }
  };
}

// ---- Util pencarian/filter generik untuk grid (dosen, dokumen, dll.) ----
function filterableGrid(items, searchKeys = ['nama']) {
  return {
    q: '',
    activeFilter: 'Semua',
    all: items,
    get results() {
      return this.all.filter(item => {
        const matchesFilter = this.activeFilter === 'Semua' || item.kategori === this.activeFilter;
        const matchesSearch = this.q.trim() === '' || searchKeys.some(k =>
          (item[k] || '').toLowerCase().includes(this.q.toLowerCase())
        );
        return matchesFilter && matchesSearch;
      });
    }
  };
}
