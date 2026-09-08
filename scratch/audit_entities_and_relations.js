const fs = require('fs');
const path = require('path');

const appJs = fs.readFileSync('assets/js/app.js', 'utf8');

console.log('================================================================');
console.log('1. AUDIT ENTITAS DI ASSETS/JS/APP.JS');
console.log('================================================================');

// Match all SEED declarations
const seedRegex = /const\s+(SEED_[A-Z_]+)\s*=\s*(\[[^\]]*\]|{[^}]*})/gs;
let match;
const seeds = {};
const seedHeaderRegex = /const\s+(SEED_[A-Z_]+)\s*=/g;
while ((match = seedHeaderRegex.exec(appJs)) !== null) {
    seeds[match[1]] = true;
}
console.log('Daftar Seeds ditemukan di app.js:', Object.keys(seeds));

// Match all DB calls
const dbCallRegex = /DB\.(load|save|reset)\(\s*['"]([a-zA-Z0-9_]+)['"]/g;
const dbKeys = new Set();
while ((match = dbCallRegex.exec(appJs)) !== null) {
    dbKeys.add(match[2]);
}
console.log('\nDaftar dbKey aktif di app.js:', Array.from(dbKeys).sort());

// Match Collections in initDatabase or DB.init
const allEntities = [
    'berita', 'dosen', 'dokumen', 'galeri', 'pengumuman',
    'kegiatan', 'pendaftar', 'artikel', 'prestasi', 'kurikulum',
    'alumni', 'pengguna', 'aktivitas', 'notifikasi', 'profil',
    'struktur', 'pengaturan'
];

console.log('\n================================================================');
console.log('2. AUDIT KONSISTENSI ERD MERMAID (docs/diagrams/er-diagram.mmd)');
console.log('================================================================');
const erdContent = fs.readFileSync('docs/diagrams/er-diagram.mmd', 'utf8');

allEntities.forEach(ent => {
    const entUpper = ent.toUpperCase();
    const hasEnt = erdContent.includes(entUpper + ' {');
    console.log(`[ERD MMD] Entitas ${entUpper.padEnd(12)}: ${hasEnt ? '✓ ADA' : '❌ TIDAK ADA'}`);
});

console.log('\nRelasi di ERD MMD:');
const relRegex = /^\s*([A-Z_]+)\s+([\|o\{\}\-]+)\s+([A-Z_]+)\s*:\s*(.+)$/gm;
let relMatch;
while ((relMatch = relRegex.exec(erdContent)) !== null) {
    console.log(`- ${relMatch[1]} ${relMatch[2]} ${relMatch[3]} : ${relMatch[4]}`);
}

console.log('\n================================================================');
console.log('3. AUDIT KONSISTENSI DFD LEVEL 1 (docs/diagrams/dfd-level-1.mmd)');
console.log('================================================================');
const dfd1Content = fs.readFileSync('docs/diagrams/dfd-level-1.mmd', 'utf8');

allEntities.forEach(ent => {
    const hasStore = dfd1Content.includes('· ' + ent) || dfd1Content.includes(ent);
    console.log(`[DFD1 MMD] Datastore untuk '${ent.padEnd(12)}': ${hasStore ? '✓ TERDAFTAR' : '❌ TIDAK TERDAFTAR'}`);
});

console.log('\n================================================================');
console.log('4. AUDIT DRAW.IO XML ERD (docs/diagrams/drawio/er-diagram.drawio.xml)');
console.log('================================================================');
const drawioErd = fs.readFileSync('docs/diagrams/drawio/er-diagram.drawio.xml', 'utf8');
allEntities.forEach(ent => {
    const hasDrawioEnt = drawioErd.includes(ent.toUpperCase() + ' (prodihukum_' + ent + ')');
    console.log(`[Draw.io ERD] Entitas '${ent.padEnd(12)}': ${hasDrawioEnt ? '✓ TERDEFINISI' : '❌ TIDAK TERDEFINISI'}`);
});

console.log('\n================================================================');
console.log('5. AUDIT SPESIFIKASI SISTEM (docs/spesifikasi-sistem.md)');
console.log('================================================================');
const specContent = fs.readFileSync('docs/spesifikasi-sistem.md', 'utf8');
allEntities.forEach(ent => {
    const hasSpec = specContent.includes('`' + ent + '`');
    console.log(`[Spec MD] Entitas '${ent.padEnd(12)}': ${hasSpec ? '✓ TERDEFINISI' : '❌ TIDAK TERDEFINISI'}`);
});

