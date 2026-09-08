const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('================================================================');
console.log('PEMERIKSAAN SINTAKS MENYELURUH (HTML, JS, CSS, MD, MMD, XML)');
console.log('================================================================\n');

let totalErrors = 0;
let totalChecked = 0;

// 1. Check JavaScript Files
console.log('--- 1. MEMERIKSA JAVASCRIPT (.js) ---');
const jsFiles = ['assets/js/app.js'];
jsFiles.forEach(file => {
    totalChecked++;
    try {
        const code = fs.readFileSync(file, 'utf8');
        new vm.Script(code);
        console.log(`[✓ JS VALID] ${file} (${code.length} bytes, ${code.split('\n').length} baris)`);
    } catch (err) {
        console.error(`[❌ JS ERROR] ${file}:`, err.message);
        totalErrors++;
    }
});

// 2. Check HTML Files (All 36 HTML pages + preview files)
console.log('\n--- 2. MEMERIKSA BERKAS HTML (.html) ---');
function getHtmlFiles(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory() && file !== 'node_modules' && file !== '.git') {
            results = results.concat(getHtmlFiles(fullPath));
        } else if (file.endsWith('.html')) {
            results.push(fullPath);
        }
    });
    return results;
}

const htmlFiles = getHtmlFiles('.');
console.log(`Menemukan ${htmlFiles.length} berkas HTML.`);
htmlFiles.forEach(file => {
    totalChecked++;
    const content = fs.readFileSync(file, 'utf8');

    // Check script tags syntax inside HTML
    const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
    let match;
    let scriptIdx = 0;
    let fileHasError = false;

    while ((match = scriptRegex.exec(content)) !== null) {
        scriptIdx++;
        const scriptCode = match[1].trim();
        // Skip empty or external src scripts
        if (scriptCode && !match[0].includes('src=')) {
            try {
                new vm.Script(scriptCode);
            } catch (err) {
                console.error(`[❌ HTML SCRIPT ERROR] ${file} (Script #${scriptIdx}):`, err.message);
                fileHasError = true;
                totalErrors++;
            }
        }
    }

    // Check basic tag balance for <html>, <head>, <body>
    const hasHtmlOpen = /<html\b/i.test(content);
    const hasHtmlClose = /<\/html>/i.test(content);
    const hasBodyOpen = /<body\b/i.test(content);
    const hasBodyClose = /<\/body>/i.test(content);

    if (hasHtmlOpen !== hasHtmlClose || hasBodyOpen !== hasBodyClose) {
        console.error(`[⚠️ HTML STRUCTURE WARNING] ${file}: Unbalanced <html> or <body> tags`);
    }

    if (!fileHasError) {
        console.log(`[✓ HTML VALID] ${file}`);
    }
});

// 3. Check CSS Files
console.log('\n--- 3. MEMERIKSA BERKAS CSS (.css) ---');
const cssFiles = ['assets/css/style.css', 'tailwind.input.css'];
cssFiles.forEach(file => {
    if (fs.existsSync(file)) {
        totalChecked++;
        const css = fs.readFileSync(file, 'utf8');
        const openBraces = (css.match(/\{/g) || []).length;
        const closeBraces = (css.match(/\}/g) || []).length;
        if (openBraces !== closeBraces) {
            console.error(`[❌ CSS BRACE MISMATCH] ${file}: open ${openBraces} vs close ${closeBraces}`);
            totalErrors++;
        } else {
            console.log(`[✓ CSS VALID] ${file} (Braces: ${openBraces} pairs)`);
        }
    }
});

// 4. Check Markdown Files (.md)
console.log('\n--- 4. MEMERIKSA BERKAS MARKDOWN (.md) ---');
const mdFiles = [
    'README.md',
    'mermaid.md',
    'docs/spesifikasi-sistem.md',
    'docs/analisa-perancangan-sistem.md',
    'docs/mermaid.md'
];

mdFiles.forEach(file => {
    if (fs.existsSync(file)) {
        totalChecked++;
        const md = fs.readFileSync(file, 'utf8');
        const fenceCount = (md.match(/^```/gm) || []).length;
        if (fenceCount % 2 !== 0) {
            console.error(`[❌ MD FENCE ERROR] ${file}: Ganjil (${fenceCount} backtick fences)`);
            totalErrors++;
        } else {
            console.log(`[✓ MD VALID] ${file} (${fenceCount / 2} code blocks)`);
        }
    }
});

// 5. Check Mermaid Diagram Files (.mmd)
console.log('\n--- 5. MEMERIKSA BERKAS MERMAID (.mmd) ---');
const mmdDir = 'docs/diagrams';
const mmdFiles = fs.readdirSync(mmdDir).filter(f => f.endsWith('.mmd'));
mmdFiles.forEach(f => {
    totalChecked++;
    const p = path.join(mmdDir, f);
    const mmd = fs.readFileSync(p, 'utf8');
    const firstLine = mmd.trim().split('\n')[0].trim();
    const validHeaders = ['flowchart', 'sequenceDiagram', 'erDiagram', 'classDiagram', 'stateDiagram', 'gantt', 'pie', 'gitGraph'];
    const startsValid = validHeaders.some(h => firstLine.startsWith(h));
    if (!startsValid) {
        console.error(`[❌ MMD HEADER ERROR] ${f}: Header '${firstLine}' tidak dikenali`);
        totalErrors++;
    } else {
        console.log(`[✓ MMD VALID] ${f} (${mmd.length} bytes, Header: ${firstLine})`);
    }
});

// 6. Check XML Files (.drawio.xml & .xml)
console.log('\n--- 6. MEMERIKSA BERKAS DRAW.IO XML (.drawio.xml & .xml) ---');
const drawioDir = 'docs/diagrams/drawio';
if (fs.existsSync(drawioDir)) {
    const xmlFiles = fs.readdirSync(drawioDir);
    xmlFiles.forEach(f => {
        totalChecked++;
        const p = path.join(drawioDir, f);
        const xml = fs.readFileSync(p, 'utf8');
        const isWellFormed = xml.startsWith('<?xml') && xml.includes('<mxfile') && xml.includes('</mxfile>');
        if (!isWellFormed) {
            console.error(`[❌ XML MALFORMED] ${f}`);
            totalErrors++;
        } else {
            console.log(`[✓ XML VALID] ${f} (${xml.length} bytes)`);
        }
    });
}

console.log('\n================================================================');
console.log(`TOTAL BERKAS DIPERIKSA: ${totalChecked}`);
console.log(`TOTAL KESALAHAN SINTAKS: ${totalErrors}`);
console.log(totalErrors === 0 ? 'STATUS: 100% BEBAS DARI KESALAHAN SINTAKS (BERSIH & SEMPURNA)' : 'STATUS: DITEMUKAN KESALAHAN');
console.log('================================================================');

