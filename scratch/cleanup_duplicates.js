const fs = require('fs');
const path = require('path');

console.log('=== MEMBERSIHKAN FILE DUPLIKAT ===');

// 1. Remove duplicate *.drawio.xml from docs/diagrams/ (keep only in docs/diagrams/drawio/)
const rootDiagramsDir = path.join('docs', 'diagrams');
const rootFiles = fs.readdirSync(rootDiagramsDir);
rootFiles.forEach(f => {
    if (f.endsWith('.drawio.xml')) {
        const fullPath = path.join(rootDiagramsDir, f);
        fs.unlinkSync(fullPath);
        console.log(`[DELETED DUPLICATE] ${fullPath}`);
    }
});

// 2. Remove duplicate *.xml (redundant with *.drawio.xml) in docs/diagrams/drawio/
const drawioDir = path.join('docs', 'diagrams', 'drawio');
if (fs.existsSync(drawioDir)) {
    const drawioFiles = fs.readdirSync(drawioDir);
    drawioFiles.forEach(f => {
        if (f.endsWith('.xml') && !f.endsWith('.drawio.xml')) {
            const fullPath = path.join(drawioDir, f);
            fs.unlinkSync(fullPath);
            console.log(`[DELETED DUPLICATE] ${fullPath}`);
        }
    });
}

console.log('\n=== STRUKTUR FOLDER SETELAH DIBERSIHKAN ===');
console.log('--- docs/diagrams/ ---');
fs.readdirSync(rootDiagramsDir).forEach(f => {
    const stat = fs.statSync(path.join(rootDiagramsDir, f));
    console.log(stat.isDirectory() ? '[DIR]  ' + f : '[FILE] ' + f + ' (' + stat.size + ' bytes)');
});

console.log('\n--- docs/diagrams/drawio/ ---');
fs.readdirSync(drawioDir).forEach(f => {
    const stat = fs.statSync(path.join(drawioDir, f));
    console.log(stat.isDirectory() ? '[DIR]  ' + f : '[FILE] ' + f + ' (' + stat.size + ' bytes)');
});

console.log('\n[✓] Seluruh duplikasi berhasil dibersihkan!');

