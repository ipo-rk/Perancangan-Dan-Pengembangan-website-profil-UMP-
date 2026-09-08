const fs = require('fs');
const path = require('path');

// Helper to escape XML
function escapeXml(unsafe) {
    if (!unsafe) return '';
    return unsafe.toString()
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

class DrawioBuilder {
    constructor(pageName, width = 1600, height = 1200) {
        this.pageName = pageName;
        this.width = width;
        this.height = height;
        this.cells = [
            '<mxCell id="0" />',
            '<mxCell id="1" parent="0" />'
        ];
        this.idCounter = 2;
    }

    nextId() {
        return (this.idCounter++).toString();
    }

    addBox({ id, parent = "1", value, x, y, width, height, style }) {
        const cellId = id || this.nextId();
        const xml = `<mxCell id="${cellId}" value="${escapeXml(value)}" style="${style}" vertex="1" parent="${parent}">
  <mxGeometry x="${x}" y="${y}" width="${width}" height="${height}" as="geometry" />
</mxCell>`;
        this.cells.push(xml);
        return cellId;
    }

    addEdge({ id, parent = "1", value = "", source, target, style, points = [] }) {
        const cellId = id || this.nextId();
        let pointsXml = '';
        if (points.length > 0) {
            pointsXml = '<Array as="points">' + points.map(p => `<mxPoint x="${p.x}" y="${p.y}" />`).join('') + '</Array>';
        }
        const sourceAttr = source ? `source="${source}"` : '';
        const targetAttr = target ? `target="${target}"` : '';
        const xml = `<mxCell id="${cellId}" value="${escapeXml(value)}" style="${style}" edge="1" parent="${parent}" ${sourceAttr} ${targetAttr}>
  <mxGeometry relative="1" as="geometry">
    ${pointsXml}
  </mxGeometry>
</mxCell>`;
        this.cells.push(xml);
        return cellId;
    }

    getGraphModelXml() {
        return `<mxGraphModel dx="1422" dy="800" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="${this.width}" pageHeight="${this.height}" background="#ffffff" math="0" shadow="0">
  <root>
    ${this.cells.join('\n    ')}
  </root>
</mxGraphModel>`;
    }

    toMxfileXml() {
        return `<?xml version="1.0" encoding="UTF-8"?>
<mxfile host="app.diagrams.net" modified="${new Date().toISOString()}" agent="Antigravity System" version="24.7.5">
  <diagram id="diagram_${this.pageName.replace(/[^a-zA-Z0-9]/g, '_')}" name="${escapeXml(this.pageName)}">
    ${this.getGraphModelXml()}
  </diagram>
</mxfile>`;
    }
}

// -------------------------------------------------------------
// 1. DFD LEVEL 0 (CONTEXT DIAGRAM)
// -------------------------------------------------------------
function createDfdLevel0() {
    const builder = new DrawioBuilder("DFD Level 0 - Diagram Konteks", 1600, 1100);

    // Title & Header Banner
    builder.addBox({
        value: "<b>DIAGRAM ALIR DATA (DFD) LEVEL 0 - DIAGRAM KONTEKS</b><br><font style='font-size: 12px; font-weight: normal; color: #64748b;'>Website Profil & Panel Admin Program Studi Hukum Universitas Muhammadiyah Papua</font>",
        x: 350, y: 40, width: 900, height: 60,
        style: "html=1;whiteSpace=wrap;rounded=1;fillColor=#f8fafc;strokeColor=#cbd5e1;fontSize=18;fontColor=#0f172a;align=center;"
    });

    // Central Process (0.0)
    const p0 = builder.addBox({
        value: "<b>0.0</b><br><br><b style='font-size: 15px;'>SISTEM INFORMASI PROFIL &amp; PANEL ADMIN PRODI HUKUM UMP</b><br><br><font style='font-size: 11px; color: #e2e8f0;'>(Single Source of Truth: LocalStorage + IndexedDB Sync)</font>",
        x: 600, y: 380, width: 400, height: 260,
        style: "ellipse;whiteSpace=wrap;html=1;aspect=fixed;fillColor=#0284c7;fontColor=#ffffff;strokeColor=#0369a1;strokeWidth=3;shadow=1;align=center;"
    });

    // External Entity 1: Pengunjung / Calon Mahasiswa (Top Left)
    const e1 = builder.addBox({
        value: "<b>ENTITAS EKSTERNAL:</b><br><b style='font-size: 14px;'>PENGUNJUNG PUBLIK</b><br><font style='font-size: 11px; color: #475569;'>Publik, Mahasiswa, Calon Pendaftar, Alumni</font>",
        x: 80, y: 160, width: 280, height: 110,
        style: "html=1;whiteSpace=wrap;rounded=1;fillColor=#f1f5f9;strokeColor=#0284c7;strokeWidth=2;fontColor=#0f172a;shadow=1;align=center;"
    });

    // External Entity 2: Sivitas Akademika / Dosen (Bottom Left)
    const e2 = builder.addBox({
        value: "<b>ENTITAS EKSTERNAL:</b><br><b style='font-size: 14px;'>SIVITAS AKADEMIKA &amp; DOSEN</b><br><font style='font-size: 11px; color: #475569;'>Dosen, Alumni, Mitra Akademik</font>",
        x: 80, y: 740, width: 280, height: 110,
        style: "html=1;whiteSpace=wrap;rounded=1;fillColor=#f1f5f9;strokeColor=#0284c7;strokeWidth=2;fontColor=#0f172a;shadow=1;align=center;"
    });

    // External Entity 3: Staff Operator & Editor (Top Right)
    const e3 = builder.addBox({
        value: "<b>ENTITAS EKSTERNAL:</b><br><b style='font-size: 14px;'>STAFF OPERATOR &amp; EDITOR</b><br><font style='font-size: 11px; color: #475569;'>Pengelola Konten, Agenda &amp; Berita</font>",
        x: 1240, y: 160, width: 280, height: 110,
        style: "html=1;whiteSpace=wrap;rounded=1;fillColor=#fef3c7;strokeColor=#d97706;strokeWidth=2;fontColor=#78350f;shadow=1;align=center;"
    });

    // External Entity 4: Super Administrator (Bottom Right)
    const e4 = builder.addBox({
        value: "<b>ENTITAS EKSTERNAL:</b><br><b style='font-size: 14px;'>SUPER ADMINISTRATOR</b><br><font style='font-size: 11px; color: #475569;'>Manajemen User, Konfigurasi &amp; Full Access</font>",
        x: 1240, y: 740, width: 280, height: 110,
        style: "html=1;whiteSpace=wrap;rounded=1;fillColor=#fee2e2;strokeColor=#dc2626;strokeWidth=2;fontColor=#991b1b;shadow=1;align=center;"
    });

    // Flows: E1 <-> P0
    builder.addEdge({
        value: "1. Form Pendaftaran &amp; Query Pencarian",
        source: e1, target: p0,
        style: "edgeStyle=orthogonalEdgeStyle;rounded=1;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#0284c7;strokeWidth=2;fontColor=#0369a1;fontSize=11;",
        points: [{ x: 360, y: 195 }, { x: 650, y: 195 }, { x: 650, y: 385 }]
    });
    builder.addEdge({
        value: "2. Informasi Publik, Dokumen Unduhan &amp; Feedback",
        source: p0, target: e1,
        style: "edgeStyle=orthogonalEdgeStyle;rounded=1;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#059669;strokeWidth=2;fontColor=#065f46;fontSize=11;",
        points: [{ x: 610, y: 440 }, { x: 300, y: 440 }, { x: 300, y: 270 }]
    });

    // Flows: E2 <-> P0
    builder.addEdge({
        value: "1. Data Publikasi Dosen, Portofolio &amp; Alumni",
        source: e2, target: p0,
        style: "edgeStyle=orthogonalEdgeStyle;rounded=1;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#0284c7;strokeWidth=2;fontColor=#0369a1;fontSize=11;",
        points: [{ x: 360, y: 770 }, { x: 650, y: 770 }, { x: 650, y: 635 }]
    });
    builder.addEdge({
        value: "2. Informasi Kurikulum, Silabus &amp; Jadwal Akademik",
        source: p0, target: e2,
        style: "edgeStyle=orthogonalEdgeStyle;rounded=1;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#059669;strokeWidth=2;fontColor=#065f46;fontSize=11;",
        points: [{ x: 610, y: 580 }, { x: 300, y: 580 }, { x: 300, y: 740 }]
    });

    // Flows: E3 <-> P0
    builder.addEdge({
        value: "1. Kredensial Login, Data Berita, Agenda &amp; Galeri",
        source: e3, target: p0,
        style: "edgeStyle=orthogonalEdgeStyle;rounded=1;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#d97706;strokeWidth=2;fontColor=#92400e;fontSize=11;",
        points: [{ x: 1240, y: 195 }, { x: 950, y: 195 }, { x: 950, y: 385 }]
    });
    builder.addEdge({
        value: "2. Status Autentikasi, Dashboard Statistik &amp; Feedback CRUD",
        source: p0, target: e3,
        style: "edgeStyle=orthogonalEdgeStyle;rounded=1;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#059669;strokeWidth=2;fontColor=#065f46;fontSize=11;",
        points: [{ x: 990, y: 440 }, { x: 1300, y: 440 }, { x: 1300, y: 270 }]
    });

    // Flows: E4 <-> P0
    builder.addEdge({
        value: "1. Master Konfigurasi, Manajemen User, Reset/Backup DB",
        source: e4, target: p0,
        style: "edgeStyle=orthogonalEdgeStyle;rounded=1;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#dc2626;strokeWidth=2;fontColor=#991b1b;fontSize=11;",
        points: [{ x: 1240, y: 770 }, { x: 950, y: 770 }, { x: 950, y: 635 }]
    });
    builder.addEdge({
        value: "2. Audit Log Aktivitas, Full System Report &amp; Backup JSON",
        source: p0, target: e4,
        style: "edgeStyle=orthogonalEdgeStyle;rounded=1;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#059669;strokeWidth=2;fontColor=#065f46;fontSize=11;",
        points: [{ x: 990, y: 580 }, { x: 1300, y: 580 }, { x: 1300, y: 740 }]
    });

    return builder;
}

// -------------------------------------------------------------
// 2. DFD LEVEL 1 (DEKOMPOSISI PROSES)
// -------------------------------------------------------------
function createDfdLevel1() {
    const builder = new DrawioBuilder("DFD Level 1 - Dekomposisi Proses", 1800, 1400);

    // Title
    builder.addBox({
        value: "<b>DIAGRAM ALIR DATA (DFD) LEVEL 1 - DEKOMPOSISI PROSES SISTEM</b><br><font style='font-size: 12px; font-weight: normal; color: #64748b;'>Rincian 10 Proses Fungsional, 17 Data Store (LocalStorage/IndexedDB), dan Aliran Data</font>",
        x: 450, y: 30, width: 900, height: 60,
        style: "html=1;whiteSpace=wrap;rounded=1;fillColor=#f8fafc;strokeColor=#cbd5e1;fontSize=17;fontColor=#0f172a;align=center;"
    });

    // External Entities
    const entPengunjung = builder.addBox({
        value: "<b>PENGUNJUNG PUBLIK</b>",
        x: 40, y: 350, width: 180, height: 80,
        style: "html=1;whiteSpace=wrap;rounded=1;fillColor=#f1f5f9;strokeColor=#0284c7;strokeWidth=2;fontColor=#0f172a;align=center;"
    });

    const entAdmin = builder.addBox({
        value: "<b>ADMIN / OPERATOR / EDITOR</b>",
        x: 40, y: 750, width: 180, height: 80,
        style: "html=1;whiteSpace=wrap;rounded=1;fillColor=#fef3c7;strokeColor=#d97706;strokeWidth=2;fontColor=#78350f;align=center;"
    });

    const entSuperAdmin = builder.addBox({
        value: "<b>SUPER ADMIN</b>",
        x: 40, y: 1150, width: 180, height: 80,
        style: "html=1;whiteSpace=wrap;rounded=1;fillColor=#fee2e2;strokeColor=#dc2626;strokeWidth=2;fontColor=#991b1b;align=center;"
    });

    // 10 Processes
    const processes = [
        { id: "p1", num: "1.0", name: "Autentikasi &amp; RBAC Guard", x: 340, y: 140, color: "#0284c7" },
        { id: "p2", num: "2.0", name: "Manajemen Berita &amp; Artikel", x: 340, y: 260, color: "#0284c7" },
        { id: "p3", num: "3.0", name: "Manajemen Profil &amp; Struktur", x: 340, y: 380, color: "#0284c7" },
        { id: "p4", num: "4.0", name: "Manajemen Direktori Dosen", x: 340, y: 500, color: "#0284c7" },
        { id: "p5", num: "5.0", name: "Manajemen Kurikulum &amp; Dokumen", x: 340, y: 620, color: "#0284c7" },
        { id: "p6", num: "6.0", name: "Registrasi &amp; Pendaftar Event", x: 340, y: 740, color: "#0284c7" },
        { id: "p7", num: "7.0", name: "Manajemen Agenda &amp; Pengumuman", x: 340, y: 860, color: "#0284c7" },
        { id: "p8", num: "8.0", name: "Manajemen Prestasi, Galeri, Alumni", x: 340, y: 980, color: "#0284c7" },
        { id: "p9", num: "9.0", name: "Manajemen Log Aktivitas", x: 340, y: 1100, color: "#0284c7" },
        { id: "p10", num: "10.0", name: "Konfigurasi Sistem &amp; User", x: 340, y: 1220, color: "#0284c7" }
    ];

    const pCells = {};
    processes.forEach(p => {
        pCells[p.id] = builder.addBox({
            value: `<b>${p.num}</b><br>${p.name}`,
            x: p.x, y: p.y, width: 240, height: 75,
            style: `ellipse;whiteSpace=wrap;html=1;fillColor=${p.color};fontColor=#ffffff;strokeColor=#0369a1;strokeWidth=2;align=center;fontSize=11;`
        });
    });

    // 17 Data Stores (Cylinders on the right side)
    const stores = [
        { id: "d1", num: "D1", name: "prodihukum_berita", y: 120 },
        { id: "d2", num: "D2", name: "prodihukum_dosen", y: 190 },
        { id: "d3", num: "D3", name: "prodihukum_dokumen", y: 260 },
        { id: "d4", num: "D4", name: "prodihukum_galeri", y: 330 },
        { id: "d5", num: "D5", name: "prodihukum_pengumuman", y: 400 },
        { id: "d6", num: "D6", name: "prodihukum_kegiatan", y: 470 },
        { id: "d7", num: "D7", name: "prodihukum_pendaftar", y: 540 },
        { id: "d8", num: "D8", name: "prodihukum_artikel", y: 610 },
        { id: "d9", num: "D9", name: "prodihukum_prestasi", y: 680 },
        { id: "d10", num: "D10", name: "prodihukum_kurikulum", y: 750 },
        { id: "d11", num: "D11", name: "prodihukum_alumni", y: 820 },
        { id: "d12", num: "D12", name: "prodihukum_pengguna", y: 890 },
        { id: "d13", num: "D13", name: "prodihukum_aktivitas", y: 960 },
        { id: "d14", num: "D14", name: "prodihukum_notifikasi", y: 1030 },
        { id: "d15", num: "D15", name: "prodihukum_profil", y: 1100 },
        { id: "d16", num: "D16", name: "prodihukum_struktur", y: 1170 },
        { id: "d17", num: "D17", name: "prodihukum_pengaturan", y: 1240 }
    ];

    const dCells = {};
    stores.forEach(s => {
        dCells[s.id] = builder.addBox({
            value: `<b>[${s.num}]</b> ${s.name}`,
            x: 820, y: s.y, width: 260, height: 48,
            style: "shape=cylinder3;whiteSpace=wrap;html=1;boundedLbl=1;backgroundOutline=1;size=10;fillColor=#e0f2fe;strokeColor=#0284c7;fontColor=#0369a1;fontSize=11;align=center;"
        });
    });

    // Secondary Backing Store (IndexedDB Sync)
    const idbStore = builder.addBox({
        value: "<b>INDEXEDDB BACKING STORE</b><br><font style='font-size: 11px; color: #475569;'>DB: 'ProdiHukumDB' (Offline Mirror &amp; Binary Payload)</font>",
        x: 1300, y: 550, width: 320, height: 200,
        style: "shape=cylinder3;whiteSpace=wrap;html=1;boundedLbl=1;backgroundOutline=1;size=15;fillColor=#ecfdf5;strokeColor=#059669;strokeWidth=2;fontColor=#065f46;align=center;"
    });

    // Connect Entities to Processes
    builder.addEdge({ source: entPengunjung, target: pCells["p2"], style: "strokeColor=#0284c7;strokeWidth=1.5;" });
    builder.addEdge({ source: entPengunjung, target: pCells["p6"], style: "strokeColor=#0284c7;strokeWidth=1.5;" });
    builder.addEdge({ source: entAdmin, target: pCells["p1"], style: "strokeColor=#d97706;strokeWidth=1.5;" });
    builder.addEdge({ source: entAdmin, target: pCells["p6"], style: "strokeColor=#d97706;strokeWidth=1.5;" });
    builder.addEdge({ source: entSuperAdmin, target: pCells["p10"], style: "strokeColor=#dc2626;strokeWidth=1.5;" });

    // Connections between Processes and Data Stores
    builder.addEdge({ source: pCells["p1"], target: dCells["d12"], style: "strokeColor=#0284c7;strokeWidth=1.5;" });
    builder.addEdge({ source: pCells["p2"], target: dCells["d1"], style: "strokeColor=#0284c7;strokeWidth=1.5;" });
    builder.addEdge({ source: pCells["p2"], target: dCells["d8"], style: "strokeColor=#0284c7;strokeWidth=1.5;" });
    builder.addEdge({ source: pCells["p3"], target: dCells["d15"], style: "strokeColor=#0284c7;strokeWidth=1.5;" });
    builder.addEdge({ source: pCells["p3"], target: dCells["d16"], style: "strokeColor=#0284c7;strokeWidth=1.5;" });
    builder.addEdge({ source: pCells["p4"], target: dCells["d2"], style: "strokeColor=#0284c7;strokeWidth=1.5;" });
    builder.addEdge({ source: pCells["p5"], target: dCells["d10"], style: "strokeColor=#0284c7;strokeWidth=1.5;" });
    builder.addEdge({ source: pCells["p5"], target: dCells["d3"], style: "strokeColor=#0284c7;strokeWidth=1.5;" });
    builder.addEdge({ source: pCells["p6"], target: dCells["d6"], style: "strokeColor=#0284c7;strokeWidth=1.5;" });
    builder.addEdge({ source: pCells["p6"], target: dCells["d7"], style: "strokeColor=#0284c7;strokeWidth=1.5;" });
    builder.addEdge({ source: pCells["p7"], target: dCells["d5"], style: "strokeColor=#0284c7;strokeWidth=1.5;" });
    builder.addEdge({ source: pCells["p8"], target: dCells["d9"], style: "strokeColor=#0284c7;strokeWidth=1.5;" });
    builder.addEdge({ source: pCells["p8"], target: dCells["d4"], style: "strokeColor=#0284c7;strokeWidth=1.5;" });
    builder.addEdge({ source: pCells["p8"], target: dCells["d11"], style: "strokeColor=#0284c7;strokeWidth=1.5;" });
    builder.addEdge({ source: pCells["p9"], target: dCells["d13"], style: "strokeColor=#0284c7;strokeWidth=1.5;" });
    builder.addEdge({ source: pCells["p9"], target: dCells["d14"], style: "strokeColor=#0284c7;strokeWidth=1.5;" });
    builder.addEdge({ source: pCells["p10"], target: dCells["d12"], style: "strokeColor=#0284c7;strokeWidth=1.5;" });
    builder.addEdge({ source: pCells["p10"], target: dCells["d17"], style: "strokeColor=#0284c7;strokeWidth=1.5;" });

    // Sync from LocalStorage to IndexedDB
    builder.addEdge({
        value: "Dual-Sync Write / Backup",
        source: dCells["d7"], target: idbStore,
        style: "edgeStyle=orthogonalEdgeStyle;dashed=1;strokeColor=#059669;strokeWidth=2;fontColor=#065f46;fontSize=11;"
    });

    return builder;
}

// -------------------------------------------------------------
// 3. ER DIAGRAM (17 ENTITIES)
// -------------------------------------------------------------
function createErDiagram() {
    const builder = new DrawioBuilder("ER Diagram - 17 Entitas", 2200, 1600);

    // Title
    builder.addBox({
        value: "<b>ENTITY RELATIONSHIP DIAGRAM (ERD) - 17 ENTITAS LOKAL</b><br><font style='font-size: 12px; font-weight: normal; color: #64748b;'>Database Schema &amp; Storage Architecture: LocalStorage + IndexedDB (ProdiHukumDB)</font>",
        x: 650, y: 30, width: 900, height: 60,
        style: "html=1;whiteSpace=wrap;rounded=1;fillColor=#f8fafc;strokeColor=#cbd5e1;fontSize=17;fontColor=#0f172a;align=center;"
    });

    const entities = [
        {
            name: "BERITA (prodihukum_berita)", x: 50, y: 120, width: 340, height: 230,
            fields: ["<b>PK id</b> : string/number", "judul : string", "slug : string", "kategori : string", "ringkasan : text", "konten : text", "gambar : url/base64", "penulis : string", "views : number", "status : enum('published','draft')", "createdAt : ISOString"]
        },
        {
            name: "ARTIKEL (prodihukum_artikel)", x: 430, y: 120, width: 340, height: 230,
            fields: ["<b>PK id</b> : string/number", "judul : string", "slug : string", "kategori : string", "ringkasan : text", "konten : text", "penulis : string", "views : number", "tags : array", "status : enum('published','draft')", "createdAt : ISOString"]
        },
        {
            name: "DOSEN (prodihukum_dosen)", x: 810, y: 120, width: 340, height: 230,
            fields: ["<b>PK id</b> : string/number", "nama : string", "nip_nidn : string", "jabatan : string", "keahlian : string", "pendidikan : string", "email : string", "foto : url/base64", "status : enum('aktif','tugas_belajar')", "order : number"]
        },
        {
            name: "DOKUMEN (prodihukum_dokumen)", x: 1190, y: 120, width: 340, height: 230,
            fields: ["<b>PK id</b> : string/number", "judul : string", "nomor : string", "kategori : string", "tahun : number", "fileUrl : string", "fileSize : string", "downloads : number", "createdAt : ISOString"]
        },
        {
            name: "KURIKULUM (prodihukum_kurikulum)", x: 1570, y: 120, width: 340, height: 230,
            fields: ["<b>PK id</b> : string/number", "kode : string", "nama : string", "sks : number", "semester : number", "kategori : enum('wajib','pilihan')", "silabusUrl : string", "deskripsi : text"]
        },
        {
            name: "KEGIATAN (prodihukum_kegiatan)", x: 50, y: 400, width: 340, height: 240,
            fields: ["<b>PK id</b> : string/number", "judul : string", "slug : string", "deskripsi : text", "tanggal : date", "waktu : string", "lokasi : string", "kuota : number", "pendaftarCount : number", "status : enum('buka','tutup')", "createdAt : ISOString"]
        },
        {
            name: "PENDAFTAR (prodihukum_pendaftar)", x: 430, y: 400, width: 340, height: 240,
            fields: ["<b>PK id</b> : string/number", "<b>FK kegiatanId</b> : string/number", "nama : string", "email : string", "telepon : string", "institusi : string", "status : enum('pending','terkonfirmasi')", "createdAt : ISOString"]
        },
        {
            name: "PENGUMUMAN (prodihukum_pengumuman)", x: 810, y: 400, width: 340, height: 240,
            fields: ["<b>PK id</b> : string/number", "judul : string", "konten : text", "kategori : string", "prioritas : enum('normal','penting')", "lampiranUrl : string", "expiredAt : date", "createdAt : ISOString"]
        },
        {
            name: "PRESTASI (prodihukum_prestasi)", x: 1190, y: 400, width: 340, height: 240,
            fields: ["<b>PK id</b> : string/number", "judul : string", "peraih : string", "tingkat : enum('nasional','internasional')", "tahun : number", "penyelenggara : string", "foto : url/base64", "deskripsi : text"]
        },
        {
            name: "GALERI (prodihukum_galeri)", x: 1570, y: 400, width: 340, height: 240,
            fields: ["<b>PK id</b> : string/number", "judul : string", "kategori : string", "gambar : url/base64", "keterangan : text", "tanggal : date", "views : number", "createdAt : ISOString"]
        },
        {
            name: "ALUMNI (prodihukum_alumni)", x: 50, y: 690, width: 340, height: 230,
            fields: ["<b>PK id</b> : string/number", "nama : string", "tahunLulus : number", "pekerjaan : string", "instansi : string", "testimoni : text", "foto : url/base64", "linkedin : string"]
        },
        {
            name: "PENGGUNA (prodihukum_pengguna)", x: 430, y: 690, width: 340, height: 230,
            fields: ["<b>PK id</b> : string/number", "username : string (unique)", "passwordHash : string", "namaLengkap : string", "email : string", "role : enum('superadmin','editor','operator')", "status : enum('aktif','nonaktif')", "lastLogin : ISOString"]
        },
        {
            name: "AKTIVITAS (prodihukum_aktivitas)", x: 810, y: 690, width: 340, height: 230,
            fields: ["<b>PK id</b> : string/number", "userId : string/number", "username : string", "aksi : string", "modul : string", "deskripsi : text", "ipAddress : string", "timestamp : ISOString"]
        },
        {
            name: "NOTIFIKASI (prodihukum_notifikasi)", x: 1190, y: 690, width: 340, height: 230,
            fields: ["<b>PK id</b> : string/number", "judul : string", "pesan : text", "tipe : enum('info','warning','success')", "isRead : boolean", "link : string", "createdAt : ISOString"]
        },
        {
            name: "PROFIL (prodihukum_profil)", x: 1570, y: 690, width: 340, height: 230,
            fields: ["<b>PK id</b> : 'singleton_profile'", "namaProdi : string", "akreditasi : string", "skAkreditasi : string", "visi : text", "misi : array/text", "tujuan : array/text", "sejarah : text", "updatedAt : ISOString"]
        },
        {
            name: "STRUKTUR (prodihukum_struktur)", x: 50, y: 970, width: 340, height: 220,
            fields: ["<b>PK id</b> : string/number", "nama : string", "jabatan : string", "urutan : number", "foto : url/base64", "kategori : enum('pimpinan','staf','laboratorium')"]
        },
        {
            name: "PENGATURAN (prodihukum_pengaturan)", x: 430, y: 970, width: 340, height: 220,
            fields: ["<b>PK id</b> : 'singleton_settings'", "namaSitus : string", "emailResmi : string", "telepon : string", "alamat : text", "socialMedia : object", "maintenanceMode : boolean", "maxUploadMb : number"]
        }
    ];

    const entityBoxes = {};
    entities.forEach(e => {
        const value = `<table style="width:100%; height:100%; border-collapse:collapse; font-size:11px; font-family:sans-serif;">
<tr style="background-color:#0284c7; color:#ffffff;"><th style="padding:6px; text-align:center; font-size:12px;"><b>${e.name}</b></th></tr>
${e.fields.map((f, i) => `<tr style="background-color:${i % 2 === 0 ? '#f8fafc' : '#ffffff'};"><td style="padding:3px 6px; border-top:1px solid #e2e8f0;">${f}</td></tr>`).join('')}
</table>`;
        entityBoxes[e.name] = builder.addBox({
            value: value,
            x: e.x, y: e.y, width: e.width, height: e.height,
            style: "shape=rectangle;whiteSpace=wrap;html=1;overflow=hidden;rounded=1;shadow=1;strokeColor=#0284c7;strokeWidth=1.5;"
        });
    });

    // 1. Connect KEGIATAN and PENDAFTAR (FK Relation: kegiatanId)
    builder.addEdge({
        value: "1 to N (kegiatanId)",
        source: entityBoxes["KEGIATAN (prodihukum_kegiatan)"],
        target: entityBoxes["PENDAFTAR (prodihukum_pendaftar)"],
        style: "edgeStyle=orthogonalEdgeStyle;rounded=1;html=1;strokeColor=#dc2626;strokeWidth=2.5;fontColor=#b91c1c;fontSize=11;startArrow=ERone;endArrow=ERmany;"
    });

    // 2. Connect PENGGUNA and AKTIVITAS (Audit Trail Relation: userId/user)
    builder.addEdge({
        value: "1 to N (userId / user)",
        source: entityBoxes["PENGGUNA (prodihukum_pengguna)"],
        target: entityBoxes["AKTIVITAS (prodihukum_aktivitas)"],
        style: "edgeStyle=orthogonalEdgeStyle;rounded=1;html=1;strokeColor=#0284c7;strokeWidth=2.5;fontColor=#0369a1;fontSize=11;startArrow=ERone;endArrow=ERmany;"
    });

    // 3. Connect PENGGUNA and NOTIFIKASI (Notification Relation)
    builder.addEdge({
        value: "1 to N (broadcast/role)",
        source: entityBoxes["PENGGUNA (prodihukum_pengguna)"],
        target: entityBoxes["NOTIFIKASI (prodihukum_notifikasi)"],
        style: "edgeStyle=orthogonalEdgeStyle;rounded=1;html=1;strokeColor=#059669;strokeWidth=2.5;fontColor=#065f46;fontSize=11;startArrow=ERone;endArrow=ERmany;"
    });

    // 4. Connect PROFIL and STRUKTUR (Organization Structure Relation)
    builder.addEdge({
        value: "1 to N (struktur organisasi)",
        source: entityBoxes["PROFIL (prodihukum_profil)"],
        target: entityBoxes["STRUKTUR (prodihukum_struktur)"],
        style: "edgeStyle=orthogonalEdgeStyle;rounded=1;html=1;strokeColor=#d97706;strokeWidth=2.5;fontColor=#b45309;fontSize=11;startArrow=ERone;endArrow=ERmany;",
        points: [{ x: 1740, y: 920 }, { x: 1740, y: 1080 }, { x: 390, y: 1080 }]
    });

    return builder;
}

// -------------------------------------------------------------
// 4. SEQUENCE DIAGRAM
// -------------------------------------------------------------
function createSequenceDiagram() {
    const builder = new DrawioBuilder("Sequence Diagram - Skenario Utama", 1700, 1200);

    // Title
    builder.addBox({
        value: "<b>SEQUENCE DIAGRAM - 3 SKENARIO KRUSIAL SISTEM</b><br><font style='font-size: 12px; font-weight: normal; color: #64748b;'>1. Registrasi Event Publik | 2. Autentikasi &amp; RBAC Guard | 3. Auto-Pruning Log Aktivitas</font>",
        x: 400, y: 30, width: 900, height: 60,
        style: "html=1;whiteSpace=wrap;rounded=1;fillColor=#f8fafc;strokeColor=#cbd5e1;fontSize=17;fontColor=#0f172a;align=center;"
    });

    // Scenario 1: Registrasi Publik (Top Half)
    builder.addBox({
        value: "<b>SKENARIO 1: ALUR REGISTRASI KEGIATAN/EVENT OLEH PENGUNJUNG</b>",
        x: 60, y: 110, width: 1580, height: 35,
        style: "html=1;whiteSpace=wrap;fillColor=#e0f2fe;strokeColor=#0284c7;fontColor=#0369a1;fontSize=12;fontStyle=1;align=left;spacingLeft=15;"
    });

    // Lifelines for Scenario 1
    const pVisitor = builder.addBox({ value: "<b>Pengunjung</b>", x: 120, y: 160, width: 120, height: 45, style: "shape=umlLifeline;perimeter=lifelinePerimeter;whiteSpace=wrap;html=1;container=1;collapsible=0;recursiveResize=0;outlineConnect=0;fillColor=#f1f5f9;strokeColor=#64748b;" });
    const pBrowser = builder.addBox({ value: "<b>Browser UI<br>(Alpine.js)</b>", x: 420, y: 160, width: 140, height: 45, style: "shape=umlLifeline;perimeter=lifelinePerimeter;whiteSpace=wrap;html=1;container=1;collapsible=0;recursiveResize=0;outlineConnect=0;fillColor=#f1f5f9;strokeColor=#64748b;" });
    const pStore = builder.addBox({ value: "<b>LocalStorage<br>Engine</b>", x: 740, y: 160, width: 140, height: 45, style: "shape=umlLifeline;perimeter=lifelinePerimeter;whiteSpace=wrap;html=1;container=1;collapsible=0;recursiveResize=0;outlineConnect=0;fillColor=#f1f5f9;strokeColor=#64748b;" });
    const pIdb = builder.addBox({ value: "<b>IndexedDB<br>(ProdiHukumDB)</b>", x: 1060, y: 160, width: 140, height: 45, style: "shape=umlLifeline;perimeter=lifelinePerimeter;whiteSpace=wrap;html=1;container=1;collapsible=0;recursiveResize=0;outlineConnect=0;fillColor=#f1f5f9;strokeColor=#64748b;" });
    const pSwal = builder.addBox({ value: "<b>SweetAlert2<br>Modal</b>", x: 1380, y: 160, width: 130, height: 45, style: "shape=umlLifeline;perimeter=lifelinePerimeter;whiteSpace=wrap;html=1;container=1;collapsible=0;recursiveResize=0;outlineConnect=0;fillColor=#f1f5f9;strokeColor=#64748b;" });

    // Messages for Scenario 1
    builder.addEdge({ value: "1. Isi Form Pendaftaran Kegiatan", source: pVisitor, target: pBrowser, style: "strokeColor=#0284c7;strokeWidth=1.5;fontSize=10;", points: [{ x: 180, y: 230 }, { x: 490, y: 230 }] });
    builder.addEdge({ value: "2. Validasi Input &amp; Format Email/HP", source: pBrowser, target: pBrowser, style: "strokeColor=#0284c7;strokeWidth=1.5;fontSize=10;", points: [{ x: 490, y: 255 }, { x: 530, y: 255 }, { x: 530, y: 275 }, { x: 490, y: 275 }] });
    builder.addEdge({ value: "3. Simpan Pendaftar &amp; Increment Count", source: pBrowser, target: pStore, style: "strokeColor=#0284c7;strokeWidth=1.5;fontSize=10;", points: [{ x: 490, y: 300 }, { x: 810, y: 300 }] });
    builder.addEdge({ value: "4. Async Background Mirroring", source: pStore, target: pIdb, style: "strokeColor=#059669;strokeWidth=1.5;fontSize=10;dashed=1;", points: [{ x: 810, y: 325 }, { x: 1130, y: 325 }] });
    builder.addEdge({ value: "5. Trigger Success Feedback", source: pBrowser, target: pSwal, style: "strokeColor=#0284c7;strokeWidth=1.5;fontSize=10;", points: [{ x: 490, y: 350 }, { x: 1445, y: 350 }] });
    builder.addEdge({ value: "6. Tampilkan Nomor Tiket / Bukti Pendaftaran", source: pSwal, target: pVisitor, style: "strokeColor=#059669;strokeWidth=1.5;fontSize=10;", points: [{ x: 1445, y: 380 }, { x: 180, y: 380 }] });

    // Scenario 2: Admin Auth & RBAC (Middle Half)
    builder.addBox({
        value: "<b>SKENARIO 2: AUTENTIKASI ADMIN &amp; PENGECEKAN HAK AKSES (RBAC GUARD)</b>",
        x: 60, y: 440, width: 1580, height: 35,
        style: "html=1;whiteSpace=wrap;fillColor=#fef3c7;strokeColor=#d97706;fontColor=#78350f;fontSize=12;fontStyle=1;align=left;spacingLeft=15;"
    });

    const aAdmin = builder.addBox({ value: "<b>Staff Admin</b>", x: 120, y: 490, width: 120, height: 45, style: "shape=umlLifeline;perimeter=lifelinePerimeter;whiteSpace=wrap;html=1;container=1;collapsible=0;recursiveResize=0;outlineConnect=0;fillColor=#f1f5f9;strokeColor=#64748b;" });
    const aLogin = builder.addBox({ value: "<b>Login Page<br>(login.html)</b>", x: 420, y: 490, width: 140, height: 45, style: "shape=umlLifeline;perimeter=lifelinePerimeter;whiteSpace=wrap;html=1;container=1;collapsible=0;recursiveResize=0;outlineConnect=0;fillColor=#f1f5f9;strokeColor=#64748b;" });
    const aGuard = builder.addBox({ value: "<b>AuthGuard<br>(app.js)</b>", x: 740, y: 490, width: 140, height: 45, style: "shape=umlLifeline;perimeter=lifelinePerimeter;whiteSpace=wrap;html=1;container=1;collapsible=0;recursiveResize=0;outlineConnect=0;fillColor=#f1f5f9;strokeColor=#64748b;" });
    const aUserStore = builder.addBox({ value: "<b>User Storage<br>(prodihukum_pengguna)</b>", x: 1060, y: 490, width: 150, height: 45, style: "shape=umlLifeline;perimeter=lifelinePerimeter;whiteSpace=wrap;html=1;container=1;collapsible=0;recursiveResize=0;outlineConnect=0;fillColor=#f1f5f9;strokeColor=#64748b;" });
    const aSession = builder.addBox({ value: "<b>Session Store<br>(prodihukum_admin_session)</b>", x: 1380, y: 490, width: 160, height: 45, style: "shape=umlLifeline;perimeter=lifelinePerimeter;whiteSpace=wrap;html=1;container=1;collapsible=0;recursiveResize=0;outlineConnect=0;fillColor=#f1f5f9;strokeColor=#64748b;" });

    // Messages for Scenario 2
    builder.addEdge({ value: "1. Input Username &amp; Password", source: aAdmin, target: aLogin, style: "strokeColor=#d97706;strokeWidth=1.5;fontSize=10;", points: [{ x: 180, y: 560 }, { x: 490, y: 560 }] });
    builder.addEdge({ value: "2. Authenticate(user, pass)", source: aLogin, target: aGuard, style: "strokeColor=#d97706;strokeWidth=1.5;fontSize=10;", points: [{ x: 490, y: 585 }, { x: 810, y: 585 }] });
    builder.addEdge({ value: "3. Query User &amp; Verify Status", source: aGuard, target: aUserStore, style: "strokeColor=#d97706;strokeWidth=1.5;fontSize=10;", points: [{ x: 810, y: 610 }, { x: 1135, y: 610 }] });
    builder.addEdge({ value: "4. Return User Profile &amp; Role", source: aUserStore, target: aGuard, style: "strokeColor=#059669;strokeWidth=1.5;fontSize=10;dashed=1;", points: [{ x: 1135, y: 635 }, { x: 810, y: 635 }] });
    builder.addEdge({ value: "5. Generate Session Token &amp; Save Role", source: aGuard, target: aSession, style: "strokeColor=#d97706;strokeWidth=1.5;fontSize=10;", points: [{ x: 810, y: 660 }, { x: 1460, y: 660 }] });
    builder.addEdge({ value: "6. Redirect ke dashboard.html Sesuai Role", source: aGuard, target: aAdmin, style: "strokeColor=#059669;strokeWidth=1.5;fontSize=10;", points: [{ x: 810, y: 690 }, { x: 180, y: 690 }] });

    // Scenario 3: Auto-Pruning Log (Bottom Half)
    builder.addBox({
        value: "<b>SKENARIO 3: AUTO-PRUNING LOG AKTIVITAS (pruneStorage FIFO MAX 200 RECORD)</b>",
        x: 60, y: 760, width: 1580, height: 35,
        style: "html=1;whiteSpace=wrap;fillColor=#ecfdf5;strokeColor=#059669;fontColor=#065f46;fontSize=12;fontStyle=1;align=left;spacingLeft=15;"
    });

    const lEngine = builder.addBox({ value: "<b>ActivityLogger<br>(app.js)</b>", x: 200, y: 810, width: 150, height: 45, style: "shape=umlLifeline;perimeter=lifelinePerimeter;whiteSpace=wrap;html=1;container=1;collapsible=0;recursiveResize=0;outlineConnect=0;fillColor=#f1f5f9;strokeColor=#64748b;" });
    const lStore = builder.addBox({ value: "<b>LocalStorage<br>(prodihukum_aktivitas)</b>", x: 650, y: 810, width: 170, height: 45, style: "shape=umlLifeline;perimeter=lifelinePerimeter;whiteSpace=wrap;html=1;container=1;collapsible=0;recursiveResize=0;outlineConnect=0;fillColor=#f1f5f9;strokeColor=#64748b;" });
    const lBackup = builder.addBox({ value: "<b>IndexedDB Log Store<br>(ProdiHukumDB)</b>", x: 1150, y: 810, width: 170, height: 45, style: "shape=umlLifeline;perimeter=lifelinePerimeter;whiteSpace=wrap;html=1;container=1;collapsible=0;recursiveResize=0;outlineConnect=0;fillColor=#f1f5f9;strokeColor=#64748b;" });

    builder.addEdge({ value: "1. logActivity(aksi, modul, user)", source: lEngine, target: lStore, style: "strokeColor=#059669;strokeWidth=1.5;fontSize=10;", points: [{ x: 275, y: 880 }, { x: 735, y: 880 }] });
    builder.addEdge({ value: "2. Periksa Panjang Array Logs (&gt; 200 items?)", source: lStore, target: lStore, style: "strokeColor=#059669;strokeWidth=1.5;fontSize=10;", points: [{ x: 735, y: 910 }, { x: 775, y: 910 }, { x: 775, y: 935 }, { x: 735, y: 935 }] });
    builder.addEdge({ value: "3. Slice Array logs.slice(0, 200) (FIFO Pruning)", source: lStore, target: lStore, style: "strokeColor=#dc2626;strokeWidth=1.5;fontSize=10;", points: [{ x: 735, y: 960 }, { x: 775, y: 960 }, { x: 775, y: 985 }, { x: 735, y: 985 }] });
    builder.addEdge({ value: "4. Mirror Complete Log Archive to IndexedDB", source: lStore, target: lBackup, style: "strokeColor=#059669;strokeWidth=1.5;fontSize=10;dashed=1;", points: [{ x: 735, y: 1015 }, { x: 1235, y: 1015 }] });

    return builder;
}

// -------------------------------------------------------------
// 5. FLOWCHART SISTEM
// -------------------------------------------------------------
function createFlowchartSistem() {
    const builder = new DrawioBuilder("Flowchart Sistem - Publik & Admin", 1800, 1300);

    // Title
    builder.addBox({
        value: "<b>FLOWCHART SISTEM - LOGIKA NAVIGASI PUBLIK &amp; PANEL ADMINISTRASI</b><br><font style='font-size: 12px; font-weight: normal; color: #64748b;'>Alur Interaksi Pengunjung Publik vs Alur Autentikasi &amp; RBAC Panel Admin</font>",
        x: 450, y: 30, width: 900, height: 60,
        style: "html=1;whiteSpace=wrap;rounded=1;fillColor=#f8fafc;strokeColor=#cbd5e1;fontSize=17;fontColor=#0f172a;align=center;"
    });

    // LEFT COLUMN: FLOWCHART PUBLIK
    builder.addBox({
        value: "<b>ALUR PENGUNJUNG PUBLIK</b>",
        x: 80, y: 110, width: 700, height: 40,
        style: "html=1;whiteSpace=wrap;fillColor=#e0f2fe;strokeColor=#0284c7;fontColor=#0369a1;fontSize=13;fontStyle=1;align=center;"
    });

    const fPubStart = builder.addBox({ value: "Mulai", x: 370, y: 180, width: 120, height: 50, style: "strokeWidth=2;html=1;shape=mxgraph.flowchart.terminator;whiteSpace=wrap;fillColor=#0284c7;fontColor=#ffffff;strokeColor=#0369a1;" });
    const fPubOpen = builder.addBox({ value: "Buka Halaman Utama<br>(index.html)", x: 340, y: 270, width: 180, height: 60, style: "strokeWidth=2;html=1;shape=mxgraph.flowchart.process;whiteSpace=wrap;fillColor=#f1f5f9;strokeColor=#64748b;" });
    const fPubNav = builder.addBox({ value: "Pilih Menu Navigasi:<br>Profil / Berita / Dosen / Kurikulum / Event", x: 330, y: 370, width: 200, height: 70, style: "strokeWidth=2;html=1;shape=mxgraph.flowchart.process;whiteSpace=wrap;fillColor=#f1f5f9;strokeColor=#64748b;" });
    const fPubEvent = builder.addBox({ value: "Daftar Event /<br>Unduh Dokumen?", x: 350, y: 480, width: 160, height: 80, style: "strokeWidth=2;html=1;shape=mxgraph.flowchart.decision;whiteSpace=wrap;fillColor=#fef3c7;strokeColor=#d97706;" });
    const fPubForm = builder.addBox({ value: "Isi Form Pendaftaran &amp;<br>Submit Data", x: 140, y: 600, width: 180, height: 60, style: "strokeWidth=2;html=1;shape=mxgraph.flowchart.process;whiteSpace=wrap;fillColor=#f1f5f9;strokeColor=#64748b;" });
    const fPubValid = builder.addBox({ value: "Validasi Form<br>Sukses?", x: 160, y: 700, width: 140, height: 70, style: "strokeWidth=2;html=1;shape=mxgraph.flowchart.decision;whiteSpace=wrap;fillColor=#fef3c7;strokeColor=#d97706;" });
    const fPubSave = builder.addBox({ value: "Simpan ke LocalStorage &amp;<br>Tampilkan Tiket / Bukti", x: 140, y: 820, width: 180, height: 60, style: "strokeWidth=2;html=1;shape=mxgraph.flowchart.process;whiteSpace=wrap;fillColor=#ecfdf5;strokeColor=#059669;" });
    const fPubView = builder.addBox({ value: "Baca Informasi / Unduh PDF", x: 530, y: 600, width: 180, height: 60, style: "strokeWidth=2;html=1;shape=mxgraph.flowchart.process;whiteSpace=wrap;fillColor=#f1f5f9;strokeColor=#64748b;" });
    const fPubEnd = builder.addBox({ value: "Selesai", x: 370, y: 940, width: 120, height: 50, style: "strokeWidth=2;html=1;shape=mxgraph.flowchart.terminator;whiteSpace=wrap;fillColor=#0284c7;fontColor=#ffffff;strokeColor=#0369a1;" });

    builder.addEdge({ source: fPubStart, target: fPubOpen, style: "strokeColor=#64748b;strokeWidth=1.5;" });
    builder.addEdge({ source: fPubOpen, target: fPubNav, style: "strokeColor=#64748b;strokeWidth=1.5;" });
    builder.addEdge({ source: fPubNav, target: fPubEvent, style: "strokeColor=#64748b;strokeWidth=1.5;" });
    builder.addEdge({ value: "Ya (Event)", source: fPubEvent, target: fPubForm, style: "strokeColor=#0284c7;strokeWidth=1.5;fontSize=10;" });
    builder.addEdge({ value: "Tidak (Informasi)", source: fPubEvent, target: fPubView, style: "strokeColor=#64748b;strokeWidth=1.5;fontSize=10;" });
    builder.addEdge({ source: fPubForm, target: fPubValid, style: "strokeColor=#64748b;strokeWidth=1.5;" });
    builder.addEdge({ value: "Ya", source: fPubValid, target: fPubSave, style: "strokeColor=#059669;strokeWidth=1.5;fontSize=10;" });
    builder.addEdge({ value: "Tidak", source: fPubValid, target: fPubForm, style: "strokeColor=#dc2626;strokeWidth=1.5;fontSize=10;edgeStyle=orthogonalEdgeStyle;", points: [{ x: 160, y: 735 }, { x: 90, y: 735 }, { x: 90, y: 630 }, { x: 140, y: 630 }] });
    builder.addEdge({ source: fPubSave, target: fPubEnd, style: "strokeColor=#64748b;strokeWidth=1.5;edgeStyle=orthogonalEdgeStyle;" });
    builder.addEdge({ source: fPubView, target: fPubEnd, style: "strokeColor=#64748b;strokeWidth=1.5;edgeStyle=orthogonalEdgeStyle;" });

    // RIGHT COLUMN: FLOWCHART ADMIN
    builder.addBox({
        value: "<b>ALUR PANEL ADMINISTRASI (RBAC)</b>",
        x: 920, y: 110, width: 800, height: 40,
        style: "html=1;whiteSpace=wrap;fillColor=#fef3c7;strokeColor=#d97706;fontColor=#78350f;fontSize=13;fontStyle=1;align=center;"
    });

    const fAdmStart = builder.addBox({ value: "Mulai", x: 1260, y: 180, width: 120, height: 50, style: "strokeWidth=2;html=1;shape=mxgraph.flowchart.terminator;whiteSpace=wrap;fillColor=#d97706;fontColor=#ffffff;strokeColor=#b45309;" });
    const fAdmLogin = builder.addBox({ value: "Akses /admin/login.html &amp;<br>Input Kredensial", x: 1220, y: 270, width: 200, height: 60, style: "strokeWidth=2;html=1;shape=mxgraph.flowchart.process;whiteSpace=wrap;fillColor=#f1f5f9;strokeColor=#64748b;" });
    const fAdmAuth = builder.addBox({ value: "Kredensial &amp; Role<br>Valid?", x: 1240, y: 370, width: 160, height: 80, style: "strokeWidth=2;html=1;shape=mxgraph.flowchart.decision;whiteSpace=wrap;fillColor=#fee2e2;strokeColor=#dc2626;" });
    const fAdmDash = builder.addBox({ value: "Generate Session &amp;<br>Masuk ke dashboard.html", x: 1220, y: 490, width: 200, height: 60, style: "strokeWidth=2;html=1;shape=mxgraph.flowchart.process;whiteSpace=wrap;fillColor=#ecfdf5;strokeColor=#059669;" });
    const fAdmRole = builder.addBox({ value: "Role == Super Admin?", x: 1240, y: 590, width: 160, height: 80, style: "strokeWidth=2;html=1;shape=mxgraph.flowchart.decision;whiteSpace=wrap;fillColor=#fef3c7;strokeColor=#d97706;" });
    const fAdmFull = builder.addBox({ value: "Akses Penuh:<br>CRUD Konten + Pengguna + Pengaturan + Reset DB", x: 970, y: 710, width: 220, height: 70, style: "strokeWidth=2;html=1;shape=mxgraph.flowchart.process;whiteSpace=wrap;fillColor=#fee2e2;strokeColor=#dc2626;" });
    const fAdmLimit = builder.addBox({ value: "Akses Terbatas:<br>CRUD Berita/Agenda (Editor) atau Pendaftar (Operator)", x: 1440, y: 710, width: 220, height: 70, style: "strokeWidth=2;html=1;shape=mxgraph.flowchart.process;whiteSpace=wrap;fillColor=#fef3c7;strokeColor=#d97706;" });
    const fAdmLog = builder.addBox({ value: "Catat Aktivitas ke Log &amp;<br>Simpan ke Storage", x: 1220, y: 830, width: 200, height: 60, style: "strokeWidth=2;html=1;shape=mxgraph.flowchart.process;whiteSpace=wrap;fillColor=#f1f5f9;strokeColor=#64748b;" });
    const fAdmLogout = builder.addBox({ value: "Logout &amp; Hapus Session", x: 1220, y: 920, width: 200, height: 50, style: "strokeWidth=2;html=1;shape=mxgraph.flowchart.process;whiteSpace=wrap;fillColor=#f1f5f9;strokeColor=#64748b;" });
    const fAdmEnd = builder.addBox({ value: "Selesai", x: 1260, y: 1010, width: 120, height: 50, style: "strokeWidth=2;html=1;shape=mxgraph.flowchart.terminator;whiteSpace=wrap;fillColor=#d97706;fontColor=#ffffff;strokeColor=#b45309;" });

    builder.addEdge({ source: fAdmStart, target: fAdmLogin, style: "strokeColor=#64748b;strokeWidth=1.5;" });
    builder.addEdge({ source: fAdmLogin, target: fAdmAuth, style: "strokeColor=#64748b;strokeWidth=1.5;" });
    builder.addEdge({ value: "Ya", source: fAdmAuth, target: fAdmDash, style: "strokeColor=#059669;strokeWidth=1.5;fontSize=10;" });
    builder.addEdge({ value: "Tidak (Error)", source: fAdmAuth, target: fAdmLogin, style: "strokeColor=#dc2626;strokeWidth=1.5;fontSize=10;edgeStyle=orthogonalEdgeStyle;", points: [{ x: 1240, y: 410 }, { x: 1150, y: 410 }, { x: 1150, y: 300 }, { x: 1220, y: 300 }] });
    builder.addEdge({ source: fAdmDash, target: fAdmRole, style: "strokeColor=#64748b;strokeWidth=1.5;" });
    builder.addEdge({ value: "Ya (Super Admin)", source: fAdmRole, target: fAdmFull, style: "strokeColor=#dc2626;strokeWidth=1.5;fontSize=10;edgeStyle=orthogonalEdgeStyle;" });
    builder.addEdge({ value: "Tidak (Editor/Operator)", source: fAdmRole, target: fAdmLimit, style: "strokeColor=#d97706;strokeWidth=1.5;fontSize=10;edgeStyle=orthogonalEdgeStyle;" });
    builder.addEdge({ source: fAdmFull, target: fAdmLog, style: "strokeColor=#64748b;strokeWidth=1.5;edgeStyle=orthogonalEdgeStyle;" });
    builder.addEdge({ source: fAdmLimit, target: fAdmLog, style: "strokeColor=#64748b;strokeWidth=1.5;edgeStyle=orthogonalEdgeStyle;" });
    builder.addEdge({ source: fAdmLog, target: fAdmLogout, style: "strokeColor=#64748b;strokeWidth=1.5;" });
    builder.addEdge({ source: fAdmLogout, target: fAdmEnd, style: "strokeColor=#64748b;strokeWidth=1.5;" });

    return builder;
}

// -------------------------------------------------------------
// 6. COMPONENT DIAGRAM
// -------------------------------------------------------------
function createComponentDiagram() {
    const builder = new DrawioBuilder("Component Diagram - Arsitektur 4 Layer", 1700, 1200);

    // Title
    builder.addBox({
        value: "<b>COMPONENT DIAGRAM - ARSITEKTUR 4-LAYER CLIENT-SIDE</b><br><font style='font-size: 12px; font-weight: normal; color: #64748b;'>UI Presentation Layer &gt; Reactive State Engine &gt; Business Logic &gt; Persistence Engine</font>",
        x: 400, y: 30, width: 900, height: 60,
        style: "html=1;whiteSpace=wrap;rounded=1;fillColor=#f8fafc;strokeColor=#cbd5e1;fontSize=17;fontColor=#0f172a;align=center;"
    });

    // Layer 1: Presentation Layer
    builder.addBox({
        value: "<b>1. PRESENTATION LAYER (UI COMPONENTS)</b>",
        x: 60, y: 120, width: 1580, height: 200,
        style: "shape=module;align=left;spacingLeft=15;html=1;whiteSpace=wrap;fillColor=#f0f9ff;strokeColor=#0284c7;strokeWidth=2;fontColor=#0369a1;fontSize=13;fontStyle=1;"
    });
    const c1 = builder.addBox({ value: "<b>Public Web Pages</b><br>(18 Berkas HTML: Berita, Profil, Dosen, dsb)", x: 100, y: 180, width: 280, height: 110, style: "html=1;whiteSpace=wrap;rounded=1;fillColor=#ffffff;strokeColor=#0284c7;strokeWidth=1.5;fontSize=11;align=center;" });
    const c2 = builder.addBox({ value: "<b>Admin Panel Pages</b><br>(18 Berkas HTML: Dashboard, Pengguna, Log, dsb)", x: 420, y: 180, width: 280, height: 110, style: "html=1;whiteSpace=wrap;rounded=1;fillColor=#ffffff;strokeColor=#0284c7;strokeWidth=1.5;fontSize=11;align=center;" });
    const c3 = builder.addBox({ value: "<b>Tailwind CSS &amp; Neumorphism UI</b><br>(assets/css/style.css + Tailwind CDN)", x: 740, y: 180, width: 280, height: 110, style: "html=1;whiteSpace=wrap;rounded=1;fillColor=#ffffff;strokeColor=#0284c7;strokeWidth=1.5;fontSize=11;align=center;" });
    const c4 = builder.addBox({ value: "<b>Modal &amp; Toast Feedback</b><br>(SweetAlert2 v11 + Custom Dialogs)", x: 1060, y: 180, width: 280, height: 110, style: "html=1;whiteSpace=wrap;rounded=1;fillColor=#ffffff;strokeColor=#0284c7;strokeWidth=1.5;fontSize=11;align=center;" });

    // Layer 2: Reactive State Engine
    builder.addBox({
        value: "<b>2. REACTIVE STATE ENGINE (ALPINE.JS 3.14.8)</b>",
        x: 60, y: 360, width: 1580, height: 190,
        style: "shape=module;align=left;spacingLeft=15;html=1;whiteSpace=wrap;fillColor=#fefce8;strokeColor=#ca8a04;strokeWidth=2;fontColor=#854d0e;fontSize=13;fontStyle=1;"
    });
    const s1 = builder.addBox({ value: "<b>Alpine.store('global')</b><br>Tema, Navigasi Mobile, Search Query", x: 100, y: 420, width: 340, height: 100, style: "html=1;whiteSpace=wrap;rounded=1;fillColor=#ffffff;strokeColor=#ca8a04;strokeWidth=1.5;fontSize=11;align=center;" });
    const s2 = builder.addBox({ value: "<b>Alpine Component Scopes (x-data)</b><br>Filter, Pagination, Form State, Sorting", x: 480, y: 420, width: 340, height: 100, style: "html=1;whiteSpace=wrap;rounded=1;fillColor=#ffffff;strokeColor=#ca8a04;strokeWidth=1.5;fontSize=11;align=center;" });
    const s3 = builder.addBox({ value: "<b>DOM Directives Binding</b><br>x-model, x-show, x-for, x-on, x-cloak", x: 860, y: 420, width: 340, height: 100, style: "html=1;whiteSpace=wrap;rounded=1;fillColor=#ffffff;strokeColor=#ca8a04;strokeWidth=1.5;fontSize=11;align=center;" });

    // Layer 3: Business Logic Layer
    builder.addBox({
        value: "<b>3. BUSINESS LOGIC &amp; SERVICES (assets/js/app.js)</b>",
        x: 60, y: 590, width: 1580, height: 210,
        style: "shape=module;align=left;spacingLeft=15;html=1;whiteSpace=wrap;fillColor=#f0fdf4;strokeColor=#16a34a;strokeWidth=2;fontColor=#166534;fontSize=13;fontStyle=1;"
    });
    const b1 = builder.addBox({ value: "<b>AuthGuard &amp; RBAC Service</b><br>checkAuth(), verifyRole(), logout()", x: 100, y: 660, width: 320, height: 110, style: "html=1;whiteSpace=wrap;rounded=1;fillColor=#ffffff;strokeColor=#16a34a;strokeWidth=1.5;fontSize=11;align=center;" });
    const b2 = builder.addBox({ value: "<b>CRUD Data Manager Engine</b><br>getCollection(), saveItem(), deleteItem()", x: 460, y: 660, width: 320, height: 110, style: "html=1;whiteSpace=wrap;rounded=1;fillColor=#ffffff;strokeColor=#16a34a;strokeWidth=1.5;fontSize=11;align=center;" });
    const b3 = builder.addBox({ value: "<b>Activity Logger &amp; Pruner</b><br>logActivity(), pruneLogs(200)", x: 820, y: 660, width: 320, height: 110, style: "html=1;whiteSpace=wrap;rounded=1;fillColor=#ffffff;strokeColor=#16a34a;strokeWidth=1.5;fontSize=11;align=center;" });
    const b4 = builder.addBox({ value: "<b>Database Seed &amp; Migration</b><br>initDatabase(), exportJSON(), importJSON()", x: 1180, y: 660, width: 320, height: 110, style: "html=1;whiteSpace=wrap;rounded=1;fillColor=#ffffff;strokeColor=#16a34a;strokeWidth=1.5;fontSize=11;align=center;" });

    // Layer 4: Persistence Layer
    builder.addBox({
        value: "<b>4. PERSISTENCE LAYER (CLIENT STORAGE ENGINE)</b>",
        x: 60, y: 840, width: 1580, height: 190,
        style: "shape=module;align=left;spacingLeft=15;html=1;whiteSpace=wrap;fillColor=#fdf2f8;strokeColor=#db2777;strokeWidth=2;fontColor=#9d174d;fontSize=13;fontStyle=1;"
    });
    const db1 = builder.addBox({ value: "<b>LocalStorage Primary Engine</b><br>17 Key-Value Collections (Single Source of Truth)", x: 150, y: 900, width: 420, height: 100, style: "shape=cylinder3;whiteSpace=wrap;html=1;boundedLbl=1;backgroundOutline=1;size=12;fillColor=#ffffff;strokeColor=#db2777;strokeWidth=1.5;fontSize=11;align=center;" });
    const db2 = builder.addBox({ value: "<b>IndexedDB Backup Store</b><br>Database: 'ProdiHukumDB' (Offline Store)", x: 650, y: 900, width: 420, height: 100, style: "shape=cylinder3;whiteSpace=wrap;html=1;boundedLbl=1;backgroundOutline=1;size=12;fillColor=#ffffff;strokeColor=#db2777;strokeWidth=1.5;fontSize=11;align=center;" });
    const db3 = builder.addBox({ value: "<b>Session &amp; View Counter</b><br>prodihukum_admin_session, prodihukum_pageviews_v1", x: 1150, y: 900, width: 420, height: 100, style: "shape=cylinder3;whiteSpace=wrap;html=1;boundedLbl=1;backgroundOutline=1;size=12;fillColor=#ffffff;strokeColor=#db2777;strokeWidth=1.5;fontSize=11;align=center;" });

    // Dependencies across layers
    builder.addEdge({ source: c1, target: s1, style: "strokeColor=#0284c7;strokeWidth=1.5;dashed=1;" });
    builder.addEdge({ source: c2, target: s2, style: "strokeColor=#0284c7;strokeWidth=1.5;dashed=1;" });
    builder.addEdge({ source: s2, target: b2, style: "strokeColor=#ca8a04;strokeWidth=1.5;dashed=1;" });
    builder.addEdge({ source: b1, target: db1, style: "strokeColor=#16a34a;strokeWidth=1.5;dashed=1;" });
    builder.addEdge({ source: b2, target: db1, style: "strokeColor=#16a34a;strokeWidth=1.5;dashed=1;" });
    builder.addEdge({ source: b3, target: db2, style: "strokeColor=#16a34a;strokeWidth=1.5;dashed=1;" });

    return builder;
}

// -------------------------------------------------------------
// 7. USE CASE DIAGRAM
// -------------------------------------------------------------
function createUsecaseDiagram() {
    const builder = new DrawioBuilder("Use Case Diagram - 4 Aktor & 16 Use Case", 1800, 1300);

    // Title
    builder.addBox({
        value: "<b>USE CASE DIAGRAM - 4 AKTOR &amp; 16 USE CASE SISTEM</b><br><font style='font-size: 12px; font-weight: normal; color: #64748b;'>Website Profil &amp; Panel Admin Program Studi Hukum UMP</font>",
        x: 450, y: 30, width: 900, height: 60,
        style: "html=1;whiteSpace=wrap;rounded=1;fillColor=#f8fafc;strokeColor=#cbd5e1;fontSize=17;fontColor=#0f172a;align=center;"
    });

    // System Boundary
    builder.addBox({
        value: "<b>Sistem Informasi Website Profil &amp; Panel Admin Prodi Hukum UMP</b>",
        x: 380, y: 110, width: 1040, height: 1120,
        style: "shape=rect;html=1;verticalAlign=top;fontStyle=1;whiteSpace=wrap;fillColor=#f8fafc;strokeColor=#64748b;strokeWidth=2;fontSize=13;spacingTop=10;"
    });

    // 4 Actors
    const a1 = builder.addBox({ value: "<b>Pengunjung Publik</b>", x: 60, y: 300, width: 140, height: 120, style: "shape=umlActor;verticalLabelPosition=bottom;verticalAlign=top;html=1;fillColor=#e0f2fe;strokeColor=#0284c7;strokeWidth=2;fontSize=12;" });
    const a2 = builder.addBox({ value: "<b>Staff Operator</b>", x: 60, y: 800, width: 140, height: 120, style: "shape=umlActor;verticalLabelPosition=bottom;verticalAlign=top;html=1;fillColor=#fef3c7;strokeColor=#d97706;strokeWidth=2;fontSize=12;" });
    const a3 = builder.addBox({ value: "<b>Staff Editor</b>", x: 1560, y: 300, width: 140, height: 120, style: "shape=umlActor;verticalLabelPosition=bottom;verticalAlign=top;html=1;fillColor=#ecfdf5;strokeColor=#059669;strokeWidth=2;fontSize=12;" });
    const a4 = builder.addBox({ value: "<b>Super Administrator</b>", x: 1560, y: 800, width: 140, height: 120, style: "shape=umlActor;verticalLabelPosition=bottom;verticalAlign=top;html=1;fillColor=#fee2e2;strokeColor=#dc2626;strokeWidth=2;fontSize=12;" });

    // 16 Use Cases
    const ucs = [
        { id: "uc1", text: "UC-01: Akses Profil, Visi-Misi &amp; Struktur", x: 420, y: 170 },
        { id: "uc2", text: "UC-02: Baca &amp; Filter Berita / Artikel", x: 740, y: 170 },
        { id: "uc3", text: "UC-03: Cari Direktori Dosen &amp; Keahlian", x: 1060, y: 170 },
        { id: "uc4", text: "UC-04: Unduh Silabus &amp; Dokumen Hukum", x: 420, y: 280 },
        { id: "uc5", text: "UC-05: Daftar Kegiatan / Event Seminar", x: 740, y: 280 },
        { id: "uc6", text: "UC-06: Cari Alumni &amp; Prestasi Mahasiswa", x: 1060, y: 280 },
        { id: "uc7", text: "UC-07: Login Panel Admin (RBAC Auth)", x: 740, y: 400 },
        { id: "uc8", text: "UC-08: Kelola Data Berita &amp; Artikel", x: 420, y: 520 },
        { id: "uc9", text: "UC-09: Kelola Agenda Kegiatan &amp; Pengumuman", x: 740, y: 520 },
        { id: "uc10", text: "UC-10: Kelola Galeri Foto &amp; Dokumentasi", x: 1060, y: 520 },
        { id: "uc11", text: "UC-11: Kelola Direktori Dosen &amp; Staf", x: 420, y: 650 },
        { id: "uc12", text: "UC-12: Kelola Kurikulum &amp; Dokumen Prodi", x: 740, y: 650 },
        { id: "uc13", text: "UC-13: Verifikasi &amp; Export Data Pendaftar", x: 1060, y: 650 },
        { id: "uc14", text: "UC-14: Pantau Log Aktivitas &amp; Audit Trail", x: 420, y: 780 },
        { id: "uc15", text: "UC-15: Kelola Akun Pengguna &amp; Hak Akses", x: 740, y: 780 },
        { id: "uc16", text: "UC-16: Konfigurasi Identitas &amp; Backup/Reset DB", x: 1060, y: 780 }
    ];

    const ucCells = {};
    ucs.forEach(u => {
        ucCells[u.id] = builder.addBox({
            value: u.text,
            x: u.x, y: u.y, width: 280, height: 60,
            style: "ellipse;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#0284c7;strokeWidth=1.5;fontSize=11;align=center;"
        });
    });

    // Public Actor (A1) Connections
    ["uc1", "uc2", "uc3", "uc4", "uc5", "uc6"].forEach(id => {
        builder.addEdge({ source: a1, target: ucCells[id], style: "strokeColor=#0284c7;strokeWidth=1.5;" });
    });

    // Operator (A2) Connections
    ["uc7", "uc5", "uc13"].forEach(id => {
        builder.addEdge({ source: a2, target: ucCells[id], style: "strokeColor=#d97706;strokeWidth=1.5;" });
    });

    // Editor (A3) Connections
    ["uc7", "uc8", "uc9", "uc10", "uc11", "uc12"].forEach(id => {
        builder.addEdge({ source: a3, target: ucCells[id], style: "strokeColor=#059669;strokeWidth=1.5;" });
    });

    // Super Admin (A4) Connections (All Admin UCs + UC14, UC15, UC16)
    ["uc7", "uc8", "uc9", "uc10", "uc11", "uc12", "uc13", "uc14", "uc15", "uc16"].forEach(id => {
        builder.addEdge({ source: a4, target: ucCells[id], style: "strokeColor=#dc2626;strokeWidth=1.5;" });
    });

    return builder;
}

// -------------------------------------------------------------
// 8. DEPLOYMENT DIAGRAM
// -------------------------------------------------------------
function createDeploymentDiagram() {
    const builder = new DrawioBuilder("Deployment Diagram - Topologi Fisik", 1700, 1100);

    // Title
    builder.addBox({
        value: "<b>DEPLOYMENT DIAGRAM - TOPOLOGI FISIK &amp; DISTRIBUSI RUNTIME</b><br><font style='font-size: 12px; font-weight: normal; color: #64748b;'>Arsitektur Runtime Jamstack / Static Host + Local Database + Global CDN</font>",
        x: 400, y: 30, width: 900, height: 60,
        style: "html=1;whiteSpace=wrap;rounded=1;fillColor=#f8fafc;strokeColor=#cbd5e1;fontSize=17;fontColor=#0f172a;align=center;"
    });

    // Node 1: Client Workstation / Mobile Device
    const nClient = builder.addBox({
        value: "<b>&lt;&lt;device&gt;&gt; Client Workstation / Smartphone</b>",
        x: 60, y: 140, width: 460, height: 600,
        style: "shape=cube;whiteSpace=wrap;html=1;boundedLbl=1;backgroundOutline=1;darkOpacity=0.05;darkOpacity2=0.1;size=20;fillColor=#f0f9ff;strokeColor=#0284c7;strokeWidth=2;align=left;spacingLeft=15;verticalAlign=top;fontSize=12;"
    });

    builder.addBox({
        value: "<b>&lt;&lt;execution environment&gt;&gt;<br>Modern Web Browser</b><br>(Chrome, Edge, Firefox, Safari)",
        x: 90, y: 220, width: 400, height: 480,
        style: "html=1;whiteSpace=wrap;rounded=1;fillColor=#ffffff;strokeColor=#0284c7;strokeWidth=1.5;align=center;verticalAlign=top;spacingTop=10;fontSize=11;"
    });

    builder.addBox({ value: "<b>DOM UI Engine</b><br>(HTML5 + CSS + Alpine.js Reactive DOM)", x: 120, y: 300, width: 340, height: 80, style: "html=1;whiteSpace=wrap;rounded=1;fillColor=#f1f5f9;strokeColor=#64748b;fontSize=11;align=center;" });
    builder.addBox({ value: "<b>Client Script Runtime (app.js)</b><br>(Auth, CRUD, Seed, Log, Encryption)", x: 120, y: 410, width: 340, height: 80, style: "html=1;whiteSpace=wrap;rounded=1;fillColor=#f1f5f9;strokeColor=#64748b;fontSize=11;align=center;" });
    builder.addBox({ value: "<b>LocalStorage &amp; IndexedDB</b><br>(17 Collections + 'ProdiHukumDB')", x: 120, y: 520, width: 340, height: 140, style: "shape=cylinder3;whiteSpace=wrap;html=1;boundedLbl=1;backgroundOutline=1;size=12;fillColor=#ecfdf5;strokeColor=#059669;strokeWidth=1.5;fontSize=11;align=center;" });

    // Node 2: Static Web Hosting Server
    const nHost = builder.addBox({
        value: "<b>&lt;&lt;device&gt;&gt; Static Web Hosting Server</b>",
        x: 620, y: 140, width: 460, height: 600,
        style: "shape=cube;whiteSpace=wrap;html=1;boundedLbl=1;backgroundOutline=1;darkOpacity=0.05;darkOpacity2=0.1;size=20;fillColor=#fefce8;strokeColor=#ca8a04;strokeWidth=2;align=left;spacingLeft=15;verticalAlign=top;fontSize=12;"
    });

    builder.addBox({
        value: "<b>&lt;&lt;execution environment&gt;&gt;<br>Web Server (Nginx / Apache / GitHub Pages)</b>",
        x: 650, y: 220, width: 400, height: 480,
        style: "html=1;whiteSpace=wrap;rounded=1;fillColor=#ffffff;strokeColor=#ca8a04;strokeWidth=1.5;align=center;verticalAlign=top;spacingTop=10;fontSize=11;"
    });

    builder.addBox({ value: "<b>36 HTML Documents</b><br>(18 Publik + 18 Admin)", x: 680, y: 300, width: 340, height: 90, style: "html=1;whiteSpace=wrap;rounded=1;fillColor=#fef3c7;strokeColor=#d97706;fontSize=11;align=center;" });
    builder.addBox({ value: "<b>Stylesheet Assets</b><br>(assets/css/style.css &amp; tailwind.min.css)", x: 680, y: 420, width: 340, height: 90, style: "html=1;whiteSpace=wrap;rounded=1;fillColor=#fef3c7;strokeColor=#d97706;fontSize=11;align=center;" });
    builder.addBox({ value: "<b>JavaScript &amp; Media Assets</b><br>(assets/js/app.js, assets/image/*)", x: 680, y: 540, width: 340, height: 90, style: "html=1;whiteSpace=wrap;rounded=1;fillColor=#fef3c7;strokeColor=#d97706;fontSize=11;align=center;" });

    // Node 3: Cloud CDN Services
    const nCdn = builder.addBox({
        value: "<b>&lt;&lt;device&gt;&gt; Global Cloud CDN Infrastructure</b>",
        x: 1180, y: 140, width: 460, height: 600,
        style: "shape=cube;whiteSpace=wrap;html=1;boundedLbl=1;backgroundOutline=1;darkOpacity=0.05;darkOpacity2=0.1;size=20;fillColor=#fdf2f8;strokeColor=#db2777;strokeWidth=2;align=left;spacingLeft=15;verticalAlign=top;fontSize=12;"
    });

    builder.addBox({
        value: "<b>&lt;&lt;execution environment&gt;&gt;<br>Cloudflare / unpkg / jsDelivr CDN Nodes</b>",
        x: 1210, y: 220, width: 400, height: 480,
        style: "html=1;whiteSpace=wrap;rounded=1;fillColor=#ffffff;strokeColor=#db2777;strokeWidth=1.5;align=center;verticalAlign=top;spacingTop=10;fontSize=11;"
    });

    builder.addBox({ value: "<b>Tailwind CSS v3 CDN</b><br>cdn.tailwindcss.com", x: 1240, y: 300, width: 340, height: 75, style: "html=1;whiteSpace=wrap;rounded=1;fillColor=#fdf2f8;strokeColor=#db2777;fontSize=11;align=center;" });
    builder.addBox({ value: "<b>Alpine.js v3.14.8 CDN</b><br>unpkg.com/alpinejs", x: 1240, y: 400, width: 340, height: 75, style: "html=1;whiteSpace=wrap;rounded=1;fillColor=#fdf2f8;strokeColor=#db2777;fontSize=11;align=center;" });
    builder.addBox({ value: "<b>SweetAlert2 v11 CDN</b><br>cdn.jsdelivr.net/npm/sweetalert2@11", x: 1240, y: 500, width: 340, height: 75, style: "html=1;whiteSpace=wrap;rounded=1;fillColor=#fdf2f8;strokeColor=#db2777;fontSize=11;align=center;" });
    builder.addBox({ value: "<b>FontAwesome &amp; Google Fonts</b><br>cdnjs.cloudflare.com", x: 1240, y: 600, width: 340, height: 75, style: "html=1;whiteSpace=wrap;rounded=1;fillColor=#fdf2f8;strokeColor=#db2777;fontSize=11;align=center;" });

    // Connections between Nodes
    builder.addEdge({
        value: "HTTPS / TLS 1.3 (Static Files Delivery)",
        source: nClient, target: nHost,
        style: "strokeColor=#0284c7;strokeWidth=2;fontColor=#0369a1;fontSize=11;"
    });

    builder.addEdge({
        value: "HTTPS / CDN Cache Hit (External Libraries)",
        source: nClient, target: nCdn,
        style: "edgeStyle=orthogonalEdgeStyle;strokeColor=#db2777;strokeWidth=2;fontColor=#9d174d;fontSize=11;",
        points: [{ x: 290, y: 740 }, { x: 290, y: 820 }, { x: 1410, y: 820 }, { x: 1410, y: 740 }]
    });

    return builder;
}

// -------------------------------------------------------------
// MASTER EXPORT & GENERATION
// -------------------------------------------------------------
const diagramGenerators = [
    { name: "dfd-level-0", filename: "dfd-level-0.drawio.xml", gen: createDfdLevel0 },
    { name: "dfd-level-1", filename: "dfd-level-1.drawio.xml", gen: createDfdLevel1 },
    { name: "er-diagram", filename: "er-diagram.drawio.xml", gen: createErDiagram },
    { name: "sequence-diagram", filename: "sequence-diagram.drawio.xml", gen: createSequenceDiagram },
    { name: "flowchart-sistem", filename: "flowchart-sistem.drawio.xml", gen: createFlowchartSistem },
    { name: "component-diagram", filename: "component-diagram.drawio.xml", gen: createComponentDiagram },
    { name: "usecase-diagram", filename: "usecase-diagram.drawio.xml", gen: createUsecaseDiagram },
    { name: "deployment-diagram", filename: "deployment-diagram.drawio.xml", gen: createDeploymentDiagram }
];

console.log('Generating individual draw.io XML files...');

const outputDir = path.join(__dirname, '..', 'docs', 'diagrams', 'drawio');
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

const allDiagrams = [];

diagramGenerators.forEach(d => {
    const builder = d.gen();
    const xmlContent = builder.toMxfileXml();

    // Save to docs/diagrams/drawio/<filename>
    const filePath1 = path.join(outputDir, d.filename);
    fs.writeFileSync(filePath1, xmlContent, 'utf8');

    console.log(`[✓] Generated ${d.filename} (${xmlContent.length} bytes)`);

    allDiagrams.push({
        id: "page_" + d.name.replace(/[^a-zA-Z0-9]/g, '_'),
        name: builder.pageName,
        model: builder.getGraphModelXml()
    });
});

// Generate Combined Master multi-page draw.io file
const masterXml = `<?xml version="1.0" encoding="UTF-8"?>
<mxfile host="app.diagrams.net" modified="${new Date().toISOString()}" agent="Antigravity System" version="24.7.5">
${allDiagrams.map(d => `  <diagram id="${d.id}" name="${escapeXml(d.name)}">\n    ${d.model}\n  </diagram>`).join('\n')}
</mxfile>`;

const masterPath1 = path.join(outputDir, 'all-diagrams.drawio.xml');
fs.writeFileSync(masterPath1, masterXml, 'utf8');

console.log(`[✓] Generated Master Multi-Page all-diagrams.drawio.xml (${masterXml.length} bytes)`);
console.log('All draw.io XML files successfully generated!');
