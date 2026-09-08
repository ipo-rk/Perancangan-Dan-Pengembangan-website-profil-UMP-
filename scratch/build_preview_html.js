const fs = require('fs');
const path = require('path');

const drawioDir = path.join(__dirname, '..', 'docs', 'diagrams', 'drawio');
const keys = [
  { key: 'dfd0', file: 'dfd-level-0.drawio.xml' },
  { key: 'dfd1', file: 'dfd-level-1.drawio.xml' },
  { key: 'erd', file: 'er-diagram.drawio.xml' },
  { key: 'sequence', file: 'sequence-diagram.drawio.xml' },
  { key: 'flowchart', file: 'flowchart-sistem.drawio.xml' },
  { key: 'component', file: 'component-diagram.drawio.xml' },
  { key: 'usecase', file: 'usecase-diagram.drawio.xml' },
  { key: 'deployment', file: 'deployment-diagram.drawio.xml' }
];

const xmlMap = {};
keys.forEach(k => {
  const p = path.join(drawioDir, k.file);
  xmlMap[k.key] = fs.readFileSync(p, 'utf8');
});

const htmlContent = `<!DOCTYPE html>
<html lang="id">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Viewer Interaktif Diagram &amp; Draw.io Export | Prodi Hukum UMP</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link
    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Poppins:wght@600;700;800&display=swap"
    rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/mermaid@10.9.1/dist/mermaid.min.js"></script>
  <style>
    :root {
      --bg: #e8ecf1;
      --surface: #ecf0f4;
      --navy: #0b1f3a;
      --royal: #2a4e9e;
      --royal-hover: #1e3a7a;
      --gold: #c9a227;
      --text: #1b2430;
      --text-muted: #5b6472;
      --card-bg: #ffffff;
      --border: rgba(0, 0, 0, 0.08);
      --shadow: 8px 8px 18px #c5c9ce, -8px -8px 18px #ffffff;
    }

    body.dark {
      --bg: #101827;
      --surface: #141d30;
      --navy: #e7ebf2;
      --royal: #3d63be;
      --royal-hover: #5075d6;
      --gold: #e1c158;
      --text: #e7ebf2;
      --text-muted: #97a2b4;
      --card-bg: #131c2e;
      --border: rgba(255, 255, 255, 0.08);
      --shadow: 8px 8px 18px #0b101b, -8px -8px 18px #152033;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Inter', sans-serif;
      background: var(--bg);
      color: var(--text);
      transition: background 0.3s, color 0.3s;
      padding: 16px;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .container {
      max-width: 1560px;
      width: 100%;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      flex: 1;
      gap: 16px;
    }

    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 24px;
      background: var(--card-bg);
      border-radius: 20px;
      box-shadow: var(--shadow);
      border: 1px solid var(--border);
      flex-wrap: wrap;
      gap: 12px;
    }

    .brand-title {
      font-family: 'Poppins', sans-serif;
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--navy);
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .badge-status {
      font-size: 0.72rem;
      background: rgba(42, 78, 158, 0.12);
      color: var(--royal);
      padding: 3px 10px;
      border-radius: 20px;
      font-weight: 600;
      border: 1px solid rgba(42, 78, 158, 0.2);
    }

    .header-actions {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 8px;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 7px 13px;
      border-radius: 12px;
      font-size: 0.82rem;
      font-weight: 600;
      border: 1px solid var(--border);
      background: var(--card-bg);
      color: var(--text);
      cursor: pointer;
      box-shadow: var(--shadow);
      transition: all 0.2s;
      text-decoration: none;
    }

    .btn:hover {
      background: var(--royal);
      color: #fff;
      border-color: var(--royal);
    }

    .btn-drawio {
      background: #ea580c;
      color: #ffffff;
      border-color: #c2410c;
    }

    .btn-drawio:hover {
      background: #c2410c;
      color: #ffffff;
    }

    .btn-primary {
      background: var(--royal);
      color: #fff;
      border-color: var(--royal);
    }

    .btn-primary:hover {
      background: var(--royal-hover);
    }

    /* TABS */
    .tabs-bar {
      display: flex;
      gap: 8px;
      overflow-x: auto;
      padding-bottom: 4px;
      scrollbar-width: thin;
    }

    .tab-btn {
      padding: 9px 16px;
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      color: var(--text-muted);
      font-weight: 600;
      font-size: 0.82rem;
      cursor: pointer;
      box-shadow: var(--shadow);
      white-space: nowrap;
      transition: all 0.2s;
    }

    .tab-btn.active,
    .tab-btn:hover {
      background: var(--royal);
      color: #ffffff;
      border-color: var(--royal);
    }

    /* MAIN VIEWPORT CARD */
    .viewport-card {
      background: var(--card-bg);
      border-radius: 24px;
      box-shadow: var(--shadow);
      border: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      flex: 1;
      min-height: 640px;
      overflow: hidden;
      position: relative;
    }

    .viewport-header {
      padding: 14px 20px;
      background: var(--surface);
      border-bottom: 1px solid var(--border);
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
    }

    .diagram-info h2 {
      font-family: 'Poppins', sans-serif;
      font-size: 1.1rem;
      color: var(--navy);
    }

    .diagram-info p {
      font-size: 0.78rem;
      color: var(--text-muted);
    }

    /* ZOOM & CONTROL TOOLBAR */
    .zoom-toolbar {
      display: flex;
      align-items: center;
      gap: 6px;
      background: var(--card-bg);
      padding: 4px 8px;
      border-radius: 14px;
      border: 1px solid var(--border);
      box-shadow: var(--shadow);
    }

    .tool-btn {
      width: 34px;
      height: 34px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      border: 1px solid transparent;
      border-radius: 8px;
      font-size: 1rem;
      cursor: pointer;
      color: var(--text);
      font-weight: bold;
      transition: all 0.15s;
    }

    .tool-btn:hover {
      background: var(--surface);
      border-color: var(--border);
      color: var(--royal);
    }

    .zoom-level {
      font-size: 0.8rem;
      font-weight: 700;
      color: var(--royal);
      min-width: 52px;
      text-align: center;
      font-variant-numeric: tabular-nums;
    }

    .divider {
      width: 1px;
      height: 20px;
      background: var(--border);
      margin: 0 4px;
    }

    /* INTERACTIVE CANVAS */
    .canvas-wrapper {
      flex: 1;
      width: 100%;
      height: 560px;
      position: relative;
      overflow: hidden;
      cursor: grab;
      user-select: none;
      background: radial-gradient(var(--border) 1px, transparent 1px);
      background-size: 20px 20px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .canvas-wrapper:active {
      cursor: grabbing;
    }

    .panzoom-content {
      transform-origin: 0 0;
      transition: transform 0.05s ease-out;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px;
    }

    .panzoom-content svg {
      max-width: none !important;
      height: auto !important;
      filter: drop-shadow(0px 4px 10px rgba(0, 0, 0, 0.06));
    }

    /* CODE FOOTER */
    .code-accordion {
      border-top: 1px solid var(--border);
      background: var(--surface);
    }

    .code-accordion summary {
      padding: 12px 20px;
      font-size: 0.82rem;
      font-weight: 600;
      color: var(--royal);
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .code-switch-bar {
      display: flex;
      gap: 8px;
      padding: 8px 20px 0;
      background: var(--surface);
    }

    .code-tab-btn {
      padding: 6px 12px;
      font-size: 0.78rem;
      font-weight: 600;
      border: 1px solid var(--border);
      background: var(--card-bg);
      color: var(--text-muted);
      border-radius: 8px;
      cursor: pointer;
    }

    .code-tab-btn.active {
      background: var(--royal);
      color: #fff;
      border-color: var(--royal);
    }

    .code-box {
      padding: 16px 20px;
      background: rgba(0, 0, 0, 0.04);
      font-family: Consolas, Monaco, monospace;
      font-size: 0.78rem;
      color: var(--text-muted);
      white-space: pre-wrap;
      max-height: 200px;
      overflow-y: auto;
      border-top: 1px solid var(--border);
      margin-top: 8px;
    }

    body.dark .code-box {
      background: rgba(0, 0, 0, 0.25);
    }

    /* FLOATING HINT */
    .floating-hint {
      position: absolute;
      bottom: 12px;
      left: 12px;
      background: var(--card-bg);
      border: 1px solid var(--border);
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 0.72rem;
      color: var(--text-muted);
      pointer-events: none;
      box-shadow: var(--shadow);
      z-index: 10;
      display: flex;
      align-items: center;
      gap: 6px;
    }
  </style>
</head>

<body>
  <div class="container">
    <header>
      <div>
        <div class="brand-title">
          <span>🏛️ Sistem Profil Prodi Hukum UMP</span>
          <span class="badge-status">Mermaid &amp; Draw.io Engine</span>
        </div>
        <p style="font-size:0.8rem; color:var(--text-muted); margin-top:2px;">
          Viewer Interaktif Diagram &amp; Ekspor Draw.io XML (Bisa langsung di-paste ke diagrams.net)
        </p>
      </div>
      <div class="header-actions">
        <button class="btn" onclick="copyMermaidCode()">📋 Salin MMD</button>
        <button class="btn btn-drawio" onclick="copyDrawioXml()">📋 Salin Draw.io XML</button>
        <button class="btn" onclick="downloadSVG()">📥 Unduh SVG</button>
        <button class="btn btn-drawio" onclick="downloadDrawioXml()">📥 Unduh .drawio.xml</button>
        <button class="btn btn-primary" onclick="toggleDarkMode()">🌓 Tema</button>
      </div>
    </header>

    <div class="tabs-bar">
      <button class="tab-btn active" onclick="switchDiagram('dfd0')">1. DFD Level 0</button>
      <button class="tab-btn" onclick="switchDiagram('dfd1')">2. DFD Level 1</button>
      <button class="tab-btn" onclick="switchDiagram('erd')">3. ER Diagram</button>
      <button class="tab-btn" onclick="switchDiagram('sequence')">4. Sequence Diagram</button>
      <button class="tab-btn" onclick="switchDiagram('flowchart')">5. Flowchart Sistem</button>
      <button class="tab-btn" onclick="switchDiagram('component')">6. Component Diagram</button>
      <button class="tab-btn" onclick="switchDiagram('usecase')">7. Use Case Diagram</button>
      <button class="tab-btn" onclick="switchDiagram('deployment')">8. Deployment Diagram</button>
    </div>

    <div class="viewport-card">
      <div class="viewport-header">
        <div class="diagram-info">
          <h2 id="diagramTitle">DFD Level 0 (Context Diagram)</h2>
          <p id="diagramDesc">Aliran data antarmuka eksternal sistem</p>
        </div>

        <!-- CONTROLS: ZOOM IN / OUT / RESET / PAN -->
        <div class="zoom-toolbar">
          <button class="tool-btn" onclick="zoomIn()" title="Perbesar (Zoom In)">➕</button>
          <span class="zoom-level" id="zoomDisplay">100%</span>
          <button class="tool-btn" onclick="zoomOut()" title="Perkecil (Zoom Out)">➖</button>
          <div class="divider"></div>
          <button class="tool-btn" onclick="resetZoom()" title="Reset Tampilan (100%)">🔄</button>
          <button class="tool-btn" onclick="fitToScreen()" title="Paskan ke Layar (Fit)">📐</button>
        </div>
      </div>

      <!-- CANVAS WITH PAN & ZOOM -->
      <div class="canvas-wrapper" id="canvasWrapper">
        <div class="panzoom-content" id="panzoomContent">
          <div class="mermaid" id="mermaidOutput"></div>
        </div>
        <div class="floating-hint">
          <span>💡</span> <b>Tips:</b> Klik &amp; geser untuk memindahkan kanvas | Scroll roda mouse untuk Zoom | Klik 'Salin Draw.io XML' untuk paste ke draw.io
        </div>
      </div>

      <!-- CODE ACCORDION -->
      <details class="code-accordion">
        <summary>
          <span>Kode Sumber (Mermaid .mmd &amp; Draw.io XML)</span>
          <span style="font-size:0.75rem;">Klik untuk membuka / menutup</span>
        </summary>
        <div class="code-switch-bar">
          <button class="code-tab-btn active" id="tabBtnMmd" onclick="showCodeTab('mmd')">Mermaid (.mmd)</button>
          <button class="code-tab-btn" id="tabBtnXml" onclick="showCodeTab('xml')">Draw.io (.xml)</button>
        </div>
        <div class="code-box" id="codeBox"></div>
      </details>
    </div>
  </div>

  <script>
    const drawioXmlData = ${JSON.stringify(xmlMap)};

    const diagramData = {
      dfd0: {
        title: "1. DFD Level 0 (Diagram Konteks)",
        desc: "Diagram Konteks: Entitas eksternal dan batasan sistem informasi utama",
        file: "dfd-level-0.drawio.xml",
        code: \`flowchart TB
    P["👤 Pengunjung Publik<br/>(Mahasiswa, Calon Mahasiswa, Alumni, Umum)"]
    A["🔐 Pengguna Admin<br/>(Super Admin, Editor, Operator)"]
    SYS[["🏛️ SISTEM INFORMASI WEBSITE PROFIL & ADMIN PANEL<br/>PRODI HUKUM UNIVERSITAS MUHAMMADIYAH PAPUA"]]
    MAP["🗺️ Google Maps Embed API"]
    CDN["📦 CDN External Services<br/>(Tailwind, Alpine.js, SweetAlert2, Google Fonts)"]

    P -- "1. Request halaman & kata kunci pencarian<br/>2. Submit formulir kontak & pendaftaran kegiatan" --> SYS
    SYS -- "1. Tampilan informasi akademik, berita, dosen, dokumen<br/>2. Feedback konfirmasi & notifikasi SweetAlert2" --> P

    A -- "1. Kredensial login (email & password)<br/>2. Input data CRUD 11 modul & manajemen akun<br/>3. Konfigurasi identitas & backup/restore database" --> SYS
    SYS -- "1. Sesi login & verifikasi hak akses (RBAC)<br/>2. Dashboard statistik, tren konten, & audit log<br/>3. Status notifikasi keberhasilan transaksi" --> A

    SYS -- "Request embed peta lokasi" --> MAP
    MAP -- "Iframe visualisasi peta interaktif" --> SYS

    CDN -- "Style utilitas, library reaktif, & webfonts" --> SYS\`
      },
      dfd1: {
        title: "2. DFD Level 1 (Dekomposisi Proses Utama)",
        desc: "Dekomposisi 10 sub-proses dan 17 media penyimpanan data (localStorage & IDB)",
        file: "dfd-level-1.drawio.xml",
        code: \`flowchart TB
    subgraph ENTITAS["👥 Entitas Eksternal"]
        P["👤 Pengunjung Publik"]
        A["🔐 Admin (Super Admin / Editor / Operator)"]
    end

    subgraph PROSES["⚙️ Proses Sistem (Level 1)"]
        P1["1.0<br/>Manajemen Tampilan Konten Publik"]
        P2["2.0<br/>Pencarian Global Realtime"]
        P3["3.0<br/>Pendaftaran Kegiatan Akademik"]
        P4["4.0<br/>Pengiriman Formulir Kontak"]
        P5["5.0<br/>Autentikasi & Guard RBAC"]
        P6["6.0<br/>Manajemen Konten CRUD (11 Modul)"]
        P7["7.0<br/>Manajemen Akun Pengguna & Peran"]
        P8["8.0<br/>Pencatatan Audit Trail & Notifikasi"]
        P9["9.0<br/>Pengaturan Situs & Backup / Restore"]
        P10["10.0<br/>Agregasi Statistik & Tren Dashboard"]
    end

    subgraph DATASTORES["🗄️ Data Store (localStorage & IndexedDB)"]
        DS1[("D1 · berita")]
        DS2[("D2 · dosen")]
        DS3[("D3 · dokumen")]
        DS4[("D4 · galeri")]
        DS5[("D5 · pengumuman")]
        DS6[("D6 · kegiatan")]
        DS7[("D7 · pendaftar")]
        DS8[("D8 · artikel")]
        DS9[("D9 · prestasi")]
        DS10[("D10 · kurikulum")]
        DS11[("D11 · alumni")]
        DS12[("D12 · pengguna")]
        DS13[("D13 · aktivitas")]
        DS14[("D14 · notifikasi")]
        DS15[("D15 · profil & struktur")]
        DS16[("D16 · pengaturan")]
        DSPV[("PV · prodihukum_pageviews_v1")]
    end

    P -- "Akses Halaman & Filter Kategori" --> P1
    P1 -- "Read Data" --> DS1 & DS2 & DS3 & DS4 & DS5 & DS6 & DS8 & DS9 & DS10 & DS11 & DS15 & DS16
    P1 -- "Write Hit (trackPageView)" --> DSPV
    P1 -- "Render Halaman / Detail" --> P

    P -- "Input Kueri Pencarian" --> P2
    P2 -- "Read Index Gabungan" --> DS1 & DS2 & DS3 & DS5 & DS6 & DS8 & DS9 & DS10 & DS11
    P2 -- "Daftar Hasil Pencarian" --> P

    P -- "Submit Data Pendaftar" --> P3
    P3 -- "Write Data Peserta" --> DS7
    P3 -- "Trigger Log Publik" --> P8
    P3 -- "Konfirmasi Sukses" --> P

    P -- "Submit Pesan" --> P4
    P4 -- "Validasi & Feedback" --> P

    A -- "Input Email & Password" --> P5
    P5 -- "Read Kredensial" --> DS12
    P5 -- "Set Sesi Admin & Guard" --> A

    A -- "Create / Update / Delete" --> P6
    P6 -- "Write Data Koleksi" --> DS1 & DS2 & DS3 & DS4 & DS5 & DS6 & DS8 & DS9 & DS10 & DS11 & DS15
    P6 -- "Catat Aksi Admin" --> P8

    A -- "Kelola Akun (Super Admin)" --> P7
    P7 -- "Write Akun Admin" --> DS12
    P7 -- "Catat Aksi Admin" --> P8

    P8 -- "Write Log" --> DS13
    P8 -- "Write Notif" --> DS14

    A -- "Ubah Identitas / Backup / Reset" --> P9
    P9 -- "Write Pengaturan" --> DS15 & DS16
    P9 -- "Catat Aksi Admin" --> P8

    A -- "Akses Dashboard" --> P10
    P10 -- "Hitung Metrik & Tren" --> DS1 & DS2 & DS11 & DS12 & DSPV & DS13
    P10 -- "Render Widget Statistik" --> A\`
      },
      erd: {
        title: "3. Entity Relationship Diagram (ERD)",
        desc: "Struktur 17 model data entitas, relasi pendaftar, dan atribut tipe data",
        file: "er-diagram.drawio.xml",
        code: \`erDiagram
    KEGIATAN ||--o{ PENDAFTAR : "memiliki peserta (kegiatanId)"
    PENGGUNA ||--o{ AKTIVITAS : "melakukan aksi (user)"
    PENGGUNA ||--o{ NOTIFIKASI : "menerima notifikasi"

    BERITA {
        int id PK
        string slug
        string judul
        string kategori
        string tanggal
        string penulis
        string excerpt
        string konten
        string status "Draft | Review | Published"
        bool featured
        string gambar "Path / Base64"
    }

    DOSEN {
        int id PK
        string nama
        string jabatan
        string keahlian
        string pendidikan
        string email
        string nidn
        string profil
        string status "Aktif | Cuti | Tugas Belajar"
        string foto "Path / Base64"
    }

    DOKUMEN {
        int id PK
        string nama
        string kategori "Kurikulum | Panduan | SK | Formulir"
        string format "PDF | DOCX | XLS"
        string ukuran
    }

    GALERI {
        int id PK
        string judul
        string album "Seminar | Kuliah Umum | Praktikum | Wisuda | dll"
        string src "Path / Base64"
    }

    PENGUMUMAN {
        int id PK
        string judul
        string status "Penting | Baru | Aktif | Berakhir"
        string badge "badge-important | badge-new | badge-active"
        string tanggal
        string isi
        string lampiran
    }

    KEGIATAN {
        int id PK
        string nama
        string tanggal
        string hari
        string bulan
        string waktu
        string lokasi
        string penyelenggara
        string deskripsi
        string gambar "Path / Base64"
    }

    PENDAFTAR {
        int id PK
        int kegiatanId FK
        string kegiatanNama
        string nama
        string email
        string whatsapp
        string instansi
        string waktuDaftar
    }

    ARTIKEL {
        int id PK
        string judul
        string penulis
        string kategori "Hukum Pidana | Tata Negara | Adat | Bisnis"
        string tanggal
        string isi
        string referensi
        string tags
        string status "Draft | Review | Published"
        string thumbnail "Path / Base64"
    }

    PRESTASI {
        int id PK
        string nama
        string kategori "Mahasiswa | Dosen | Alumni | Program Studi"
        string tingkat "Provinsi | Regional | Nasional | Internasional"
        string tahun
        string foto "Path / Base64"
    }

    KURIKULUM {
        int id PK
        string kode
        string nama
        int sks
        string jenis "Wajib | Pilihan"
        int semester
    }

    ALUMNI {
        int id PK
        string nama
        string angkatan
        string pekerjaan
        string instansi
        string kategori "Bekerja | Studi Lanjut | Wirausaha"
        string email
        string linkedin
        string status "Terverifikasi | Menunggu"
        string foto "Path / Base64"
    }

    PENGGUNA {
        int id PK
        string nama
        string email
        string password
        string role "Super Admin | Editor | Operator"
        string status "Aktif | Nonaktif"
    }

    AKTIVITAS {
        int id PK
        string user
        string aksi
        string waktu
        string tanggalIso
        string icon
    }

    NOTIFIKASI {
        int id PK
        string judul
        string pesan
        string waktu
        bool read
        string icon
    }

    PROFIL {
        string nama
        string kode
        string fakultas
        string universitas
        string akreditasi
        string deskripsi
        string sejarah
        string visi
        string misi
        string tujuan
        string lulusan
    }

    STRUKTUR {
        int id PK
        string nama
        string jabatan
        string foto
    }

    PENGATURAN {
        string namaWebsite
        string deskripsi
        string logo
        string favicon
        string theme
        string primaryColor
        bool darkMode
        string metaTitle
        string metaDesc
        string keywords
        string email
        string telepon
        string alamat
        string mapEmbed
        string mapLink
        string koordinat
        int mahasiswaAktif
    }
\`
      },
      sequence: {
        title: "4. Sequence Diagram",
        desc: "Diagram urutan alur pendaftaran kegiatan, autentikasi RBAC, dan CRUD persistence",
        file: "sequence-diagram.drawio.xml",
        code: \`sequenceDiagram
    autonumber
    actor User as Pengunjung Publik / Admin
    participant UI as Web Browser View
    participant Alpine as Alpine.js Controller
    participant AUTH as AUTH Module
    participant DB as DB Engine (app.js)
    participant LS as LocalStorage (prodihukum_db_v1_*)
    participant IDB as IndexedDB (ProdiHukumDB)
    participant Alert as NeuAlert (SweetAlert2)

    rect rgb(240, 248, 255)
        Note over User, Alert: SKENARIO 1: Pendaftaran Kegiatan Akademik (Publik)
        User->>UI: Akses detail-kegiatan.html?id=1
        UI->>Alpine: Inisialisasi detailKegiatanPage()
        Alpine->>DB: DB.load('kegiatan') & DB.load('pendaftar')
        DB->>LS: getItem('prodihukum_db_v1_kegiatan')
        LS-->>DB: Data Koleksi Kegiatan
        DB-->>Alpine: Objek Detail Kegiatan (id: 1)
        Alpine-->>UI: Render Detail & Form Pendaftaran

        User->>UI: Input Formulir & Submit
        UI->>Alpine: Trigger daftarKegiatan()
        Alpine->>Alpine: Validasi Duplikasi Email pada Kegiatan Ini
        alt Email Sudah Terdaftar
            Alpine->>Alert: NeuAlert.error('Email sudah terdaftar')
            Alert-->>User: Tampilkan Modal Peringatan
        else Validasi Berhasil
            Alpine->>DB: DB.save('pendaftar', dataPendaftar)
            DB->>LS: setItem('prodihukum_db_v1_pendaftar', JSON)
            Alpine->>DB: logPublicEvent('Pendaftaran Baru...', '📝')
            DB->>LS: setItem('prodihukum_db_v1_aktivitas', JSON)
            Alpine->>Alert: NeuAlert.success('Pendaftaran Berhasil')
            Alert-->>User: Tampilkan Modal Sukses
        end
    end

    rect rgb(255, 250, 240)
        Note over User, Alert: SKENARIO 2: Autentikasi Login & Guard RBAC Admin
        User->>UI: Akses admin/login.html & Submit Kredensial
        UI->>AUTH: AUTH.login({ email, password })
        AUTH->>DB: DB.load('pengguna')
        DB->>LS: getItem('prodihukum_db_v1_pengguna')
        LS-->>DB: Data Akun Admin
        DB-->>AUTH: List Akun
        AUTH->>AUTH: Verifikasi Email, Status, & Password
        alt Kredensial Tidak Cocok
            AUTH-->>UI: false
            UI->>Alert: NeuAlert.error('Kredensial tidak valid')
        else Kredensial Cocok
            AUTH->>LS: setItem('prodihukum_admin_session', Sesi)
            AUTH-->>UI: true
            UI->>Alert: NeuAlert.success('Login Berhasil')
            UI-->>User: Redirect ke admin/dashboard.html
        end

        User->>UI: Navigasi ke admin/pengguna.html (Khusus Super Admin)
        UI->>AUTH: AUTH.guard('Super Admin')
        AUTH->>LS: getItem('prodihukum_admin_session')
        alt Sesi Tidak Memenuhi Syarat
            AUTH-->>UI: Access Denied
            UI-->>User: Redirect ke dashboard.html / login.html
        else Sesi Super Admin Valid
            AUTH-->>UI: Access Granted
            UI-->>User: Tampilkan Antarmuka Pengguna
        end
    end

    rect rgb(245, 255, 250)
        Note over User, Alert: SKENARIO 3: Simpan Data CRUD & Fallback Auto-Pruning
        User->>UI: Submit Form CRUD (Upload Gambar)
        UI->>Alpine: adminCrudTable.saveForm()
        Alpine->>DB: DB.save(entity, newArray)
        DB->>LS: setItem('prodihukum_db_v1_' + entity, payload)
        alt Normal (Kapasitas Cukup)
            LS-->>DB: Sukses
            DB->>IDB: set(entity, payload) [Cadangan Asinkron]
            DB-->>Alpine: true
            Alpine->>Alert: NeuAlert.success('Data tersimpan')
        else Kuota Penuh (QuotaExceededError)
            LS-->>DB: Error Kuota
            Note over DB: Jalankan pruneStorage():<br/>Hapus log & pageview lama
            DB->>LS: Pangkas key internal
            DB->>LS: Retry setItem(...)
            alt Retry Berhasil
                DB->>IDB: set(entity, payload)
                DB-->>Alpine: true
                Alpine->>Alert: NeuAlert.success('Data tersimpan setelah optimasi ruang')
            else Tetap Gagal
                DB-->>Alpine: false (Rollback State)
                Alpine->>Alert: NeuAlert.storageFull()
            end
        end
    end\`
      },
      flowchart: {
        title: "5. Flowchart Sistem",
        desc: "Alur logika navigasi pengunjung publik dan kontrol hak akses login admin",
        file: "flowchart-sistem.drawio.xml",
        code: \`flowchart TD
    subgraph PUBLIC_FLOW["🌐 ALUR INTERAKSI PENGUNJUNG PUBLIK"]
        P_Start([Mulai: Pengunjung Buka Website]) --> P_Choice{Pilih Menu / Fitur}

        P_Choice -->|Akses Halaman Informasi| P_Load[Muat Data dari LocalStorage & IndexedDB]
        P_Load --> P_PV[Catat Pageview Harian otomatis]
        P_PV --> P_Render[Render Tampilan Responsif & Interaktif]

        P_Choice -->|Pencarian Global| P_Search[/Input Kata Kunci/]
        P_Search --> P_ExecSearch[Cari pada Indeks 9 Entitas Data]
        P_ExecSearch --> P_RenderSearch[Tampilkan Hasil & Tautan Langsung]

        P_Choice -->|Pendaftaran Kegiatan| P_OpenKeg[Buka detail-kegiatan.html?id=...]
        P_OpenKeg --> P_FillKeg[/Isi Formulir Pendaftaran/]
        P_FillKeg --> P_ValEmail{Email Sudah Terdaftar?}
        P_ValEmail -- Ya --> P_ErrEmail[Tampilkan SweetAlert Error]
        P_ValEmail -- Tidak --> P_SaveKeg[Simpan ke 'pendaftar' & Catat Log Aktivitas]
        P_SaveKeg --> P_OkKeg[Tampilkan SweetAlert Sukses]

        P_Choice -->|Ganti Tema| P_ToggleDark[Klik Tombol Mode Gelap/Terang]
        P_ToggleDark --> P_ApplyTheme[Toggle Class .dark & Simpan ke localStorage]

        P_Render --> P_End([Selesai])
        P_RenderSearch --> P_End
        P_ErrEmail --> P_End
        P_OkKeg --> P_End
        P_ApplyTheme --> P_End
    end

    subgraph ADMIN_FLOW["🔐 ALUR AUTENTIKASI & KONTROL AKSES (RBAC) ADMIN"]
        A_Start([Mulai: Buka Panel Admin]) --> A_CheckLogin{Halaman Login?}

        A_CheckLogin -- Ya --> A_HasSession{Ada Sesi Aktif?}
        A_HasSession -- Ya --> A_DirectDash[Redirect ke dashboard.html]
        A_HasSession -- Tidak --> A_ShowForm[Tampilkan Form Login]
        A_ShowForm --> A_SubmitCreds[/Input Email & Password/]
        A_SubmitCreds --> A_VerifyAcc{Verifikasi Kredensial & Status}
        A_VerifyAcc -- Gagal / Nonaktif --> A_AlertFail[SweetAlert: Kredensial Tidak Valid]
        A_AlertFail --> A_ShowForm
        A_VerifyAcc -- Sukses --> A_CreateSession[Simpan Sesi ke prodihukum_admin_session]
        A_CreateSession --> A_DirectDash

        A_CheckLogin -- Tidak --> A_RunGuard[Eksekusi AUTH.guard()]
        A_RunGuard --> A_CheckAuth{Sesi Valid?}
        A_CheckAuth -- Tidak --> A_RedirectLogin[Redirect ke login.html]
        A_CheckAuth -- Ya --> A_CheckRole{Halaman Khusus Super Admin?}

        A_CheckRole -- Ya (pengguna/pengaturan) --> A_IsSuper{Role === 'Super Admin'?}
        A_IsSuper -- Tidak --> A_DenyAlert[SweetAlert: Hak Akses Ditolak]
        A_DenyAlert --> A_DirectDash
        A_IsSuper -- Ya --> A_AllowSuper[Buka Halaman Manajemen Pengguna/Pengaturan]

        A_CheckRole -- Tidak (Modul CRUD Umum) --> A_AllowGeneral[Buka Modul CRUD Sesuai Hak Akses]

        A_AllowSuper --> A_ExecCRUD[Operasi: Tambah / Edit / Hapus / Backup]
        A_AllowGeneral --> A_ExecCRUD
        A_ExecCRUD --> A_SaveData[Simpan ke LocalStorage & Cadangkan ke IDB]
        A_SaveData --> A_WriteLog[Pencatatan Otomatis Log Audit]
        A_WriteLog --> A_RefreshTable[Pembaruan Tabel Reaktif]

        A_DirectDash --> A_End([Selesai])
        A_RedirectLogin --> A_End
        A_RefreshTable --> A_End
    end\`
      },
      component: {
        title: "6. Component Diagram",
        desc: "Arsitektur komponen 4-layer: Presentation, Reactive Controller, Engine, dan Storage",
        file: "component-diagram.drawio.xml",
        code: \`flowchart TB
    subgraph PRESENTATION["🌐 1. Presentation & Styling Layer (Client Browser)"]
        subgraph PUB_VIEWS["📄 Public View Components (18 Halaman HTML)"]
            PUB_PAGES["<b>Public Pages</b><br/>• index.html, profil.html, dosen.html<br/>• kurikulum.html, berita.html, pengumuman.html<br/>• kegiatan.html, artikel.html, prestasi.html<br/>• alumni.html, galeri.html, dokumen.html, kontak.html"]
            PUB_DETAIL["<b>Detail Views</b><br/>• detail-berita.html, detail-artikel.html<br/>• detail-pengumuman.html, detail-kegiatan.html<br/>• detail-galeri.html"]
        end

        subgraph ADM_VIEWS["🔐 Admin View Components (18 Halaman HTML)"]
            ADM_AUTH["<b>Auth Views</b><br/>• login.html, lupa-sandi.html"]
            ADM_DASH["<b>Dashboard & Config</b><br/>• dashboard.html, pengaturan.html<br/>• profil-prodi.html, aktivitas.html"]
            ADM_CRUD["<b>CRUD Management Views</b><br/>• berita.html, pengumuman.html, kegiatan.html<br/>• artikel.html, prestasi.html, dosen.html<br/>• kurikulum.html, alumni.html, galeri.html<br/>• dokumen.html, pengguna.html"]
        end

        subgraph DESIGN_SYSTEM["🎨 Neumorphism Design System"]
            CSS_TOKENS["<b>style.css</b><br/>• Neumorphic Tokens (--neu-light, --neu-dark)<br/>• Theme Tokens (Light & Dark Mode)<br/>• Component Classes (.neu-raised, .neu-pressed, .neu-btn)"]
            TW_ENGINE["<b>Tailwind CSS 3.4 & Bootstrap 5.3</b><br/>• tailwind.min.css (Utility Classes)<br/>• Responsive Grid Subsystem"]
        end
    end

    subgraph CONTROLLER["⚡ 2. Reactive Controller Layer (Alpine.js Components)"]
        HEADER_CTRL["<b>siteHeader & themeStore</b><br/>• Dark/Light Mode Switcher<br/>• Mobile Drawer Navigation<br/>• syncThemeColorMeta()"]
        SEARCH_CTRL["<b>globalSearch Controller</b><br/>• Realtime Query Filter<br/>• getSearchIndex() Connector"]
        DETAIL_CTRL["<b>Public Detail Controllers</b><br/>• detailBeritaPage(), detailKegiatanPage()<br/>• daftarKegiatan() & Form Pendaftaran<br/>• contactForm() & detailContentPage()"]
        
        ADM_SHELL_CTRL["<b>adminShell Controller</b><br/>• Sesi State & Logout Trigger<br/>• Sidebar Responsive Toggle<br/>• Notifikasi Polling & Badge Counter"]
        ADM_CRUD_CTRL["<b>adminCrudTable & Data Controllers</b><br/>• Generic CRUD Manager (rows, filter, paginate)<br/>• Image Compression Trigger<br/>• adminPenggunaTable() & adminDokumenTable()"]
        ALERT_WRAPPER["<b>NeuAlert (SweetAlert2 Wrapper)</b><br/>• Modal Konfirmasi Hapus & Dialog Sukses<br/>• Alert Quota Storage Penuh (storageFull)"]
    end

    subgraph CORE_ENGINE["⚙️ 3. Core Logic & Persistence Engine (assets/js/app.js)"]
        subgraph AUTH_MODULE["🔑 Authentication & Access Control Subsystem"]
            AUTH_CORE["<b>AUTH Engine</b><br/>• AUTH.login(matchedUser)<br/>• AUTH.logout()<br/>• AUTH.current() & AUTH.isLoggedIn()<br/>• AUTH.guard(requiredRole)"]
            RBAC_RULES["<b>Role-Based Access Control (RBAC)</b><br/>• Super Admin: Akses Penuh<br/>• Editor: Kelola Konten & Publikasi<br/>• Operator: Entri Data Terbatas"]
        end

        subgraph DB_ENGINE["🗄️ Database Management Subsystem (DB Engine)"]
            DB_CORE["<b>DB Interface</b><br/>• DB.load(entityKey, seedFallback)<br/>• DB.save(entityKey, payload)<br/>• DB.reset(entityKey) & DB.resetAll()<br/>• DB.optimizeStorage()"]
            PRUNE_SYS["<b>Storage Optimization & Pruning</b><br/>• QuotaExceededError Handler<br/>• pruneStorage() (Pangkas Pageview & Log Lama)<br/>• compressImageFile() (Otomatis Kompres Gambar)"]
            AUDIT_SYS["<b>Audit Trail & Activity Logger</b><br/>• logActivity(aksi, icon)<br/>• logPublicEvent(aksi, icon)"]
        end

        subgraph IDB_MODULE["📦 Unlimited Media Backing Store (IDB Engine)"]
            IDB_CORE["<b>IndexedDB Connector (ProdiHukumDB)</b><br/>• IDB.get(key)<br/>• IDB.set(key, val)<br/>• IDB.clear()"]
        end

        subgraph SEED_REPO["🌱 Seed Fixtures Repository"]
            SEED_DATA["<b>Default Fixtures (16 Entitas)</b><br/>• SEED_BERITA, SEED_DOSEN, SEED_PENGUMUMAN<br/>• SEED_KEGIATAN, SEED_KURIKULUM, SEED_ALUMNI<br/>• SEED_PENGGUNA, SEED_PROFIL, SEED_PENGATURAN, dll."]
        end
    end

    subgraph STORAGE_EXT["💾 4. Client Storage & External Integrations"]
        subgraph BROWSER_STORAGE["💽 Local Client Storage Subsystem"]
            LOCAL_STORAGE[("<b>Web Storage API (localStorage)</b><br/>• prodihukum_db_v1_&lt;entity&gt;<br/>• prodihukum_admin_session<br/>• prodihukum_pageviews_v1<br/>• theme (light/dark)")]
            INDEXED_DB[("<b>IndexedDB Storage</b><br/>• DB Name: ProdiHukumDB<br/>• ObjectStore: entities<br/>• Unlimited Media & Blob Storage")]
        end

        subgraph EXT_SERVICES["☁️ External CDN & Web Services"]
            MAPS_API["<b>Google Maps Embed Service</b><br/>• Iframe Peta Lokasi Kampus / Kegiatan"]
            CDN_FONTS["<b>Google Fonts API</b><br/>• Inter (Sans-serif) & Poppins (Display)"]
            CDN_LIBS["<b>JavaScript CDN Providers</b><br/>• Alpine.js 3.14.8, SweetAlert2 v11, Bootstrap 5.3.3"]
        end
    end

    PUB_VIEWS -.-> DESIGN_SYSTEM
    ADM_VIEWS -.-> DESIGN_SYSTEM
    DESIGN_SYSTEM -.-> CDN_FONTS
    DESIGN_SYSTEM -.-> CDN_LIBS

    PUB_PAGES --> HEADER_CTRL
    PUB_PAGES --> SEARCH_CTRL
    PUB_DETAIL --> DETAIL_CTRL
    PUB_PAGES ..> MAPS_API : Embeds iframe
    
    ADM_AUTH --> AUTH_CORE
    ADM_DASH --> ADM_SHELL_CTRL
    ADM_CRUD --> ADM_CRUD_CTRL
    ADM_CRUD_CTRL --> ALERT_WRAPPER
    ADM_SHELL_CTRL --> ALERT_WRAPPER

    HEADER_CTRL --> LOCAL_STORAGE : Write theme preference
    SEARCH_CTRL --> DB_CORE : Request aggregate index
    DETAIL_CTRL --> DB_CORE : Load/Save Data (Pendaftar, dll.)
    DETAIL_CTRL --> AUDIT_SYS : Trigger logPublicEvent()

    ADM_SHELL_CTRL --> AUTH_CORE : Check session status
    ADM_CRUD_CTRL --> DB_CORE : Read / Write Data
    ADM_CRUD_CTRL --> AUDIT_SYS : Trigger logActivity()
    ADM_CRUD_CTRL --> PRUNE_SYS : Request image compression
    ADM_AUTH --> AUTH_CORE : Submit credentials

    AUTH_CORE --> RBAC_RULES : Verify role permissions
    AUTH_CORE --> DB_CORE : Read user list ('pengguna')
    AUTH_CORE --> LOCAL_STORAGE : Write/Delete prodihukum_admin_session
    
    DB_CORE --> SEED_DATA : Initial load if store empty
    DB_CORE --> PRUNE_SYS : Auto-invoke on QuotaExceeded
    DB_CORE --> LOCAL_STORAGE : Primary synchronous I/O (prodihukum_db_v1_*)
    DB_CORE --> IDB_CORE : Async backup storage
    IDB_CORE --> INDEXED_DB : Store heavy media / base64

    AUDIT_SYS --> DB_CORE : Persist audit trail ('aktivitas' & 'notifikasi')
    PRUNE_SYS --> LOCAL_STORAGE : Prune old logs & pageviews\`
      },
      usecase: {
        title: "7. Use Case Diagram",
        desc: "Pemetaan fungsionalitas sistem terhadap 4 aktor (Publik, Operator, Editor, Super Admin)",
        file: "usecase-diagram.drawio.xml",
        code: \`flowchart LR
    subgraph AKTOR["👥 Aktor Sistem"]
        P["👤 Pengunjung Publik"]
        OP["👨‍💼 Operator"]
        ED["✍️ Editor"]
        SA["👑 Super Admin"]
    end

    subgraph USE_CASES["🏛️ SISTEM INFORMASI PRODI HUKUM UMP"]
        UC1(["UC-01: Eksplorasi Informasi & Profil"])
        UC2(["UC-02: Pencarian Global Realtime"])
        UC3(["UC-03: Pendaftaran Kegiatan"])
        UC4(["UC-04: Kirim Pesan Kontak"])
        UC5(["UC-05: Ganti Tema Dark/Light"])
        UC6(["UC-06: Unduh Dokumen Akademik"])

        UC7(["UC-07: Otentikasi Login & Reset Sandi"])
        UC8(["UC-08: Pantau Statistik & Tren Dashboard"])
        UC9(["UC-09: Kelola Pendaftar Kegiatan"])
        UC10(["UC-10: Kelola Dokumen & Alumni"])
        UC11(["UC-11: Kelola Berita, Artikel & Pengumuman"])
        UC12(["UC-12: Kelola Galeri & Prestasi"])
        UC13(["UC-13: Kelola Kurikulum & Dosen"])
        UC14(["UC-14: Kelola Profil & Struktur"])
        UC15(["UC-15: Manajemen Pengguna & Hak Akses (RBAC)"])
        UC16(["UC-16: Konfigurasi Situs, Backup & Restore JSON"])
    end

    P --> UC1
    P --> UC2
    P --> UC3
    P --> UC4
    P --> UC5
    P --> UC6

    OP --> UC7
    OP --> UC8
    OP --> UC9
    OP --> UC10

    ED --> UC7
    ED --> UC8
    ED --> UC9
    ED --> UC10
    ED --> UC11
    ED --> UC12

    SA --> UC7
    SA --> UC8
    SA --> UC9
    SA --> UC10
    SA --> UC11
    SA --> UC12
    SA --> UC13
    SA --> UC14
    SA --> UC15
    SA --> UC16\`
      },
      deployment: {
        title: "8. Deployment Diagram",
        desc: "Arsitektur komputasi perangkat klien, static server hosting, dan layanan CDN pihak ketiga",
        file: "deployment-diagram.drawio.xml",
        code: \`flowchart TB
    subgraph CLIENT_NODE["💻 Client Node (User / Admin Workstation)"]
        subgraph BROWSER_ENV["🌐 Modern Web Browser (Chrome, Edge, Firefox, Safari)"]
            DOM["<b>HTML5 DOM Engine</b><br/>• 36 Halaman Web Profil & Admin"]
            CSS_ENGINE["<b>Rendering Engine</b><br/>• Tailwind Utility + Neumorphism style.css"]
            JS_RUNTIME["<b>JavaScript V8 / SpiderMonkey Engine</b><br/>• Alpine.js 3.14.8 Runtime<br/>• Core DB Engine & AUTH (app.js)"]
            
            subgraph LOCAL_DATA["🗄️ Client-Side Storage Subsystem"]
                LS_STORE[("<b>Web Storage API (localStorage)</b><br/>• Quota: ~5MB<br/>• Primary Source of Truth")]
                IDB_STORE[("<b>IndexedDB Engine (ProdiHukumDB)</b><br/>• Quota: Unlimited / Storage Quota<br/>• Heavy Media Base64 Store")]
            end
        end
    end

    subgraph WEB_SERVER["☁️ Web Hosting / Static File Server (GitHub Pages / Nginx / Apache)"]
        STATIC_FILES["<b>Static Web Assets</b><br/>• *.html (36 files)<br/>• assets/css/*.css<br/>• assets/js/*.js<br/>• assets/image/* (Media Files)"]
    end

    subgraph CLOUD_SERVICES["🌍 Third-Party Cloud CDN & API Services"]
        MAPS_SRV["<b>Google Maps Embed Service</b><br/>• Iframe Map Rendering"]
        FONTS_SRV["<b>Google Fonts CDN</b><br/>• Inter & Poppins Fonts"]
        CDN_SRV["<b>jsDelivr / cdnjs CDN</b><br/>• Bootstrap 5.3.3<br/>• SweetAlert2 v11<br/>• Alpine.js 3.14.8"]
    end

    STATIC_FILES -- "HTTP/HTTPS GET (Statis)" --> BROWSER_ENV
    JS_RUNTIME <--> LOCAL_DATA
    DOM <--> JS_RUNTIME
    DOM <--> CSS_ENGINE
    
    BROWSER_ENV -- "Async Request" --> MAPS_SRV
    BROWSER_ENV -- "Fetch Stylesheet" --> FONTS_SRV
    BROWSER_ENV -- "Fetch Script/CSS" --> CDN_SRV\`
      }
    };

    // --- PAN & ZOOM STATE ENGINE ---
    let currentScale = 1;
    let translateX = 0;
    let translateY = 0;
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let currentKey = 'dfd0';
    let currentCodeTab = 'mmd';
    let isDark = false;

    const canvasWrapper = document.getElementById('canvasWrapper');
    const panzoomContent = document.getElementById('panzoomContent');
    const zoomDisplay = document.getElementById('zoomDisplay');

    function updateTransform() {
      panzoomContent.style.transform = \`translate(\${translateX}px, \${translateY}px) scale(\${currentScale})\`;
      zoomDisplay.textContent = \`\${Math.round(currentScale * 100)}%\`;
    }

    function zoomIn() {
      currentScale = Math.min(currentScale * 1.25, 4.0);
      updateTransform();
    }

    function zoomOut() {
      currentScale = Math.max(currentScale / 1.25, 0.25);
      updateTransform();
    }

    function resetZoom() {
      currentScale = 1;
      translateX = 0;
      translateY = 0;
      updateTransform();
    }

    function fitToScreen() {
      const wrapperRect = canvasWrapper.getBoundingClientRect();
      const svg = panzoomContent.querySelector('svg');
      if (!svg) return;
      const svgRect = svg.getBoundingClientRect();
      const scaleX = (wrapperRect.width - 60) / (svgRect.width / currentScale);
      const scaleY = (wrapperRect.height - 60) / (svgRect.height / currentScale);
      currentScale = Math.min(scaleX, scaleY, 1.2);
      translateX = 0;
      translateY = 0;
      updateTransform();
    }

    // MOUSE DRAG / PAN EVENTS
    canvasWrapper.addEventListener('mousedown', (e) => {
      isDragging = true;
      startX = e.clientX - translateX;
      startY = e.clientY - translateY;
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      translateX = e.clientX - startX;
      translateY = e.clientY - startY;
      updateTransform();
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
    });

    // MOUSE WHEEL ZOOM
    canvasWrapper.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.15 : 0.85;
      const newScale = Math.min(Math.max(currentScale * zoomFactor, 0.25), 4.0);

      const rect = canvasWrapper.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      translateX -= (mouseX - translateX) * (newScale / currentScale - 1);
      translateY -= (mouseY - translateY) * (newScale / currentScale - 1);
      currentScale = newScale;

      updateTransform();
    }, { passive: false });

    // MERMAID INITIALIZATION
    function initMermaid() {
      mermaid.initialize({
        startOnLoad: false,
        theme: isDark ? 'dark' : 'default',
        securityLevel: 'loose',
        flowchart: { curve: 'basis', htmlLabels: true }
      });
    }

    function showCodeTab(tab) {
      currentCodeTab = tab;
      document.getElementById('tabBtnMmd').classList.toggle('active', tab === 'mmd');
      document.getElementById('tabBtnXml').classList.toggle('active', tab === 'xml');
      
      const codeBox = document.getElementById('codeBox');
      if (tab === 'mmd') {
        codeBox.textContent = diagramData[currentKey].code;
      } else {
        codeBox.textContent = drawioXmlData[currentKey] || 'XML tidak ditemukan';
      }
    }

    async function switchDiagram(key) {
      currentKey = key;
      const data = diagramData[key];
      if (!data) return;

      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      const activeBtn = Array.from(document.querySelectorAll('.tab-btn')).find(b => b.getAttribute('onclick').includes(key));
      if (activeBtn) activeBtn.classList.add('active');

      document.getElementById('diagramTitle').textContent = data.title;
      document.getElementById('diagramDesc').textContent = data.desc;
      
      showCodeTab(currentCodeTab);

      const target = document.getElementById('panzoomContent');
      target.innerHTML = '<div class="mermaid" id="activeSvgContainer">' + data.code + '</div>';

      try {
        await mermaid.run({ nodes: [document.getElementById('activeSvgContainer')] });
        resetZoom();
      } catch (err) {
        console.error(err);
      }
    }

    function toggleDarkMode() {
      isDark = !isDark;
      document.body.classList.toggle('dark', isDark);
      initMermaid();
      switchDiagram(currentKey);
    }

    function copyMermaidCode() {
      const code = diagramData[currentKey].code;
      navigator.clipboard.writeText(code).then(() => {
        alert('Kode Mermaid (.mmd) berhasil disalin ke clipboard!');
      });
    }

    function copyDrawioXml() {
      const xml = drawioXmlData[currentKey];
      if (!xml) return;
      navigator.clipboard.writeText(xml).then(() => {
        alert('Draw.io XML berhasil disalin!\\n\\nCara Pakai di draw.io:\\n1. Buka app.diagrams.net\\n2. Klik menu "Extras" -> "Edit Diagram..."\\n3. Tempel (Paste) teks XML ini lalu klik Apply.');
      });
    }

    function downloadDrawioXml() {
      const xml = drawioXmlData[currentKey];
      if (!xml) return;
      const blob = new Blob([xml], { type: "application/xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = diagramData[currentKey].file || \`\${currentKey}.drawio.xml\`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }

    function downloadSVG() {
      const svg = panzoomContent.querySelector('svg');
      if (!svg) return;
      const svgData = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
      const svgUrl = URL.createObjectURL(svgBlob);
      const downloadLink = document.createElement("a");
      downloadLink.href = svgUrl;
      downloadLink.download = \`\${currentKey}-diagram.svg\`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }

    initMermaid();
    switchDiagram('dfd0');
  </script>
</body>

</html>`;

const outPath = path.join(__dirname, '..', 'docs', 'diagrams', 'preview-diagrams.html');
fs.writeFileSync(outPath, htmlContent, 'utf8');
console.log('Successfully updated preview-diagrams.html with Draw.io integration. File size:', htmlContent.length);

