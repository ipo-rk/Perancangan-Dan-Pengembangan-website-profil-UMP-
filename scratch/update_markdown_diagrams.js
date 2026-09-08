const fs = require('fs');

const mmdFlowchart = fs.readFileSync('docs/diagrams/flowchart-sistem.mmd', 'utf8').trim();
const mmdComponent = fs.readFileSync('docs/diagrams/component-diagram.mmd', 'utf8').trim();

// 1. Update mermaid.md and docs/mermaid.md
let mermaidMd = fs.readFileSync('mermaid.md', 'utf8');
mermaidMd = mermaidMd.replace(/A_RunGuard\[Eksekusi AUTH\.guard\(\)\]/g, 'A_RunGuard["Eksekusi AUTH.guard()"]');
mermaidMd = mermaidMd.replace(/PUB_PAGES\s*\.\.>\s*MAPS_API\s*:\s*Embeds iframe/g, 'PUB_PAGES -. "Embeds iframe" .-> MAPS_API');
fs.writeFileSync('mermaid.md', mermaidMd, 'utf8');
fs.writeFileSync('docs/mermaid.md', mermaidMd, 'utf8');

// 2. Update docs/analisa-perancangan-sistem.md
let analisaMd = fs.readFileSync('docs/analisa-perancangan-sistem.md', 'utf8');
analisaMd = analisaMd.replace(/A_RunGuard\[Eksekusi AUTH\.guard\(\)\]/g, 'A_RunGuard["Eksekusi AUTH.guard()"]');
analisaMd = analisaMd.replace(/PUB_PAGES\s*\.\.>\s*MAPS_API\s*:\s*Embeds iframe/g, 'PUB_PAGES -. "Embeds iframe" .-> MAPS_API');
fs.writeFileSync('docs/analisa-perancangan-sistem.md', analisaMd, 'utf8');

// 3. Update README.md
let readmeMd = fs.readFileSync('README.md', 'utf8');
readmeMd = readmeMd.replace(/A_RunGuard\[Eksekusi AUTH\.guard\(\)\]/g, 'A_RunGuard["Eksekusi AUTH.guard()"]');
readmeMd = readmeMd.replace(/PUB_PAGES\s*\.\.>\s*MAPS_API\s*:\s*Embeds iframe/g, 'PUB_PAGES -. "Embeds iframe" .-> MAPS_API');
fs.writeFileSync('README.md', readmeMd, 'utf8');

console.log('[✓] Updated all Markdown files with fixed Mermaid code blocks.');

