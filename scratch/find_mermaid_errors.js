const fs = require('fs');
const path = require('path');

// Let's inspect the 8 .mmd files and check for mermaid syntax pitfalls:
// Pitfall 1: Parentheses inside brackets without quotes: e.g. [Text (with parens)] -> should be ["Text (with parens)"]
// Pitfall 2: Link syntax ..> or -.-> without quotes
// Pitfall 3: Subgraph names with spaces or parens without quotes

const mmdDir = 'docs/diagrams';
const mmdFiles = fs.readdirSync(mmdDir).filter(f => f.endsWith('.mmd'));

console.log('Testing all .mmd files for Mermaid parsing syntax issues:\n');

mmdFiles.forEach(f => {
    const p = path.join(mmdDir, f);
    const content = fs.readFileSync(p, 'utf8');
    const lines = content.split('\n');

    console.log(`Checking ${f} (${lines.length} lines)...`);

    lines.forEach((line, idx) => {
        const lineNum = idx + 1;
        const trimmed = line.trim();

        // Check for node brackets containing unquoted parens: e.g., id[Some (Text)] but not id["Some (Text)"]
        // Regex looks for [ followed by non-" that has ( or ) before closing ]
        if (/\[(?!\")[^\]]*[\(\)][^\]]*\]/.test(trimmed)) {
            console.warn(`  Line ${lineNum}: Unquoted parentheses inside bracket: ${trimmed}`);
        }

        // Check for invalid link syntax like `..>` or `-.-> : text`
        if (/\.\.>[^:]+:\s*/.test(trimmed)) {
            console.warn(`  Line ${lineNum}: Invalid dotted link syntax: ${trimmed}`);
        }
    });
});

