/** Tailwind CSS production config — Website Prodi Hukum UMP */
module.exports = {
  darkMode: 'class',
  content: [
    './*.html',
    './admin/*.html',
    './assets/js/*.js'
  ],
  safelist: [
    // Classes assembled dynamically in JS (e.g. r.jenis === 'Wajib' ? 'badge-active' : 'badge-new')
    // are plain custom CSS classes from style.css, not Tailwind utilities, so no safelist needed there.
    // Keep a few dynamically-toggled utility classes safe from purge:
    'rotate-180', 'sidebar-open', 'dark'
  ],
  theme: {
    extend: {
      colors: {
        navy:  '#0a3a8f',   /* Navy UMP resmi — konsisten dengan style1.css */
        royal: '#1b5bc0',   /* Biru royal interaktif UMP                    */
        gold:  '#e8890a',   /* Kuning emas UMP (dark variant, kontras putih) */
        red:   '#c8102e',   /* Merah UMP resmi — konsisten dengan style1.css */
        bg:    '#f3f6fb'    /* Background utama neumorphism                  */
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Poppins', 'sans-serif']
      }
    }
  },
  plugins: []
};
