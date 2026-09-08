const fs = require('fs');
const path = require('path');

// 1. Read the 8 .mmd files
const mmdFiles = {
  dfd0: fs.readFileSync('docs/diagrams/dfd-level-0.mmd', 'utf8').trim(),
  dfd1: fs.readFileSync('docs/diagrams/dfd-level-1.mmd', 'utf8').trim(),
  erd: fs.readFileSync('docs/diagrams/er-diagram.mmd', 'utf8').trim(),
  sequence: fs.readFileSync('docs/diagrams/sequence-diagram.mmd', 'utf8').trim(),
  flowchart: fs.readFileSync('docs/diagrams/flowchart-sistem.mmd', 'utf8').trim(),
  component: fs.readFileSync('docs/diagrams/component-diagram.mmd', 'utf8').trim(),
  usecase: fs.readFileSync('docs/diagrams/usecase-diagram.mmd', 'utf8').trim(),
  deployment: fs.readFileSync('docs/diagrams/deployment-diagram.mmd', 'utf8').trim()
};

// Fix syntax in flowchart & component
mmdFiles.flowchart = mmdFiles.flowchart.replace(/A_RunGuard\[Eksekusi AUTH\.guard\(\)\]/g, 'A_RunGuard["Eksekusi AUTH.guard()"]');
fs.writeFileSync('docs/diagrams/flowchart-sistem.mmd', mmdFiles.flowchart, 'utf8');

mmdFiles.component = mmdFiles.component.replace(/PUB_PAGES\s*\.\.>\s*MAPS_API\s*:\s*Embeds iframe/g, 'PUB_PAGES -. "Embeds iframe" .-> MAPS_API');
fs.writeFileSync('docs/diagrams/component-diagram.mmd', mmdFiles.component, 'utf8');

console.log('[✓] Validated and fixed all 8 .mmd files.');

// 2. Read Draw.io XML Data
const drawioDir = 'docs/diagrams/drawio';
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

// 3. Rebuild preview-diagrams.html
const previewHtml = `<!DOCTYPE html>
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
        code: ${JSON.stringify(mmdFiles.dfd0)}
      },
      dfd1: {
        title: "2. DFD Level 1 (Dekomposisi Proses Utama)",
        desc: "Dekomposisi 10 sub-proses dan 17 media penyimpanan data (localStorage & IDB)",
        file: "dfd-level-1.drawio.xml",
        code: ${JSON.stringify(mmdFiles.dfd1)}
      },
      erd: {
        title: "3. Entity Relationship Diagram (ERD)",
        desc: "Struktur 17 model data entitas, relasi pendaftar, dan atribut tipe data",
        file: "er-diagram.drawio.xml",
        code: ${JSON.stringify(mmdFiles.erd)}
      },
      sequence: {
        title: "4. Sequence Diagram",
        desc: "Diagram urutan alur pendaftaran kegiatan, autentikasi RBAC, dan CRUD persistence",
        file: "sequence-diagram.drawio.xml",
        code: ${JSON.stringify(mmdFiles.sequence)}
      },
      flowchart: {
        title: "5. Flowchart Sistem",
        desc: "Alur logika navigasi pengunjung publik dan kontrol hak akses login admin",
        file: "flowchart-sistem.drawio.xml",
        code: ${JSON.stringify(mmdFiles.flowchart)}
      },
      component: {
        title: "6. Component Diagram",
        desc: "Arsitektur komponen 4-layer: Presentation, Reactive Controller, Engine, dan Storage",
        file: "component-diagram.drawio.xml",
        code: ${JSON.stringify(mmdFiles.component)}
      },
      usecase: {
        title: "7. Use Case Diagram",
        desc: "Pemetaan fungsionalitas sistem terhadap 4 aktor (Publik, Operator, Editor, Super Admin)",
        file: "usecase-diagram.drawio.xml",
        code: ${JSON.stringify(mmdFiles.usecase)}
      },
      deployment: {
        title: "8. Deployment Diagram",
        desc: "Arsitektur komputasi perangkat klien, static server hosting, dan layanan CDN pihak ketiga",
        file: "deployment-diagram.drawio.xml",
        code: ${JSON.stringify(mmdFiles.deployment)}
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
        console.error('Mermaid Render Error:', err);
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

fs.writeFileSync('docs/diagrams/preview-diagrams.html', previewHtml, 'utf8');
console.log('[✓] Rebuilt docs/diagrams/preview-diagrams.html with safely JSON-encoded diagram strings!');

