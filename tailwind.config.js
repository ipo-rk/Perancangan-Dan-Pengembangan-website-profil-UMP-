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
        navy: '#0B1F3A',
        royal: '#2A4E9E',
        gold: '#C9A227',
        bg: '#E8ECF1'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Poppins', 'sans-serif']
      }
    }
  },
  plugins: []
};
