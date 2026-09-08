const fs = require('fs');
const path = require('path');

const mmdDir = 'docs/diagrams';
const mmdFiles = fs.readdirSync(mmdDir).filter(f => f.endsWith('.mmd'));

console.log('Checking all .mmd files for flowchart links with colon labels:\n');

mmdFiles.forEach(f => {
    const p = path.join(mmdDir, f);
    const content = fs.readFileSync(p, 'utf8');
    const lines = content.split('\n');
    const isSequence = content.trim().startsWith('sequenceDiagram');
    const isERD = content.trim().startsWith('erDiagram');

    if (!isSequence && !isERD) {
        lines.forEach((line, idx) => {
            if (/-->\s*[A-Za-z0-9_]+\s*:\s*.+/.test(line) || /-\.->\s*[A-Za-z0-9_]+\s*:\s*.+/.test(line)) {
                console.log(`[!] Found in ${f} line ${idx + 1}: ${line.trim()}`);
            }
        });
    }
});

