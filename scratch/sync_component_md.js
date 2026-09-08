const fs = require('fs');

const mmdComponent = fs.readFileSync('docs/diagrams/component-diagram.mmd', 'utf8').trim();

function updateComponentInMd(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    const regex = /(##\s*[0-9\.]*[\s\S]*?Component Diagram[\s\S]*?```mermaid\n)([\s\S]*?)(\n```)/i;
    if (regex.test(content)) {
        content = content.replace(regex, `$1${mmdComponent}$3`);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`[✓] Replaced Component Diagram in ${filePath}`);
    } else {
        console.warn(`[!] Pattern not matched in ${filePath}`);
    }
}

updateComponentInMd('mermaid.md');
updateComponentInMd('docs/mermaid.md');
updateComponentInMd('docs/analisa-perancangan-sistem.md');

