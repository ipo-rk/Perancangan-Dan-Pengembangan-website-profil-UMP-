const fs = require('fs');
const path = require('path');

// Let's create a script that reads each .mmd file, fixes all known syntax issues:
// 1. Convert `..> TARGET : LABEL` to `-. "LABEL" .-> TARGET` or `-.->|LABEL| TARGET`
// 2. Wrap all node texts with quotes if they contain `()`, `.`, or `<>`: e.g. `[Eksekusi AUTH.guard()]` -> `["Eksekusi AUTH.guard()"]`
// 3. Ensure cylinder brackets `[("...")]` are clean
// 4. Update all files: docs/diagrams/*.mmd, docs/diagrams/preview-diagrams.html, docs/analisa-perancangan-sistem.md, mermaid.md, docs/mermaid.md, README.md

console.log('Fixing Mermaid syntax errors...');

// 1. Fix docs/diagrams/component-diagram.mmd
let comp = fs.readFileSync('docs/diagrams/component-diagram.mmd', 'utf8');
comp = comp.replace(/PUB_PAGES\s*\.\.>\s*MAPS_API\s*:\s*Embeds iframe/g, 'PUB_PAGES -. "Embeds iframe" .-> MAPS_API');
fs.writeFileSync('docs/diagrams/component-diagram.mmd', comp, 'utf8');

// 2. Fix docs/diagrams/flowchart-sistem.mmd
let flow = fs.readFileSync('docs/diagrams/flowchart-sistem.mmd', 'utf8');
flow = flow.replace(/A_RunGuard\[Eksekusi AUTH\.guard\(\)\]/g, 'A_RunGuard["Eksekusi AUTH.guard()"]');
fs.writeFileSync('docs/diagrams/flowchart-sistem.mmd', flow, 'utf8');

console.log('[✓] Fixed .mmd files');

