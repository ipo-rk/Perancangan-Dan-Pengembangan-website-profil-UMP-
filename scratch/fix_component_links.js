const fs = require('fs');

// Read component-diagram.mmd
let comp = fs.readFileSync('docs/diagrams/component-diagram.mmd', 'utf8');

// Replace `A --> B : Label` with `A -- "Label" --> B`
comp = comp.replace(/([A-Z_]+)\s*-->\s*([A-Z_]+)\s*:\s*(.+)$/gm, (match, src, target, label) => {
    return `${src} -- "${label.trim()}" --> ${target}`;
});

// Replace `A -.-> B : Label` with `A -. "${label.trim()}" .-> B`
comp = comp.replace(/([A-Z_]+)\s*-\.->\s*([A-Z_]+)\s*:\s*(.+)$/gm, (match, src, target, label) => {
    return `${src} -. "${label.trim()}" .-> ${target}`;
});

fs.writeFileSync('docs/diagrams/component-diagram.mmd', comp, 'utf8');
console.log('[✓] Successfully fixed component-diagram.mmd flowchart link syntax!');

