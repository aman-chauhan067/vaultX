const fs = require('fs');
const path = 'd:/Aman Chauhan/project/VaultX/apps/web/src/pages/Landing/index.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add import
if (!content.includes("StickySection")) {
  content = content.replace(
    "import { Logo } from '../../components/Logo/index.js';",
    "import { Logo } from '../../components/Logo/index.js';\nimport { StickySection } from './StickySection';"
  );
}

// 2. Replace the outer <div style={{ padding: '16vh 5vw'... }}> for each section
// We'll do this by matching the section comments and the following div, and replacing it.
// Also we need to close </StickySection> right before the next section comment, or before {/* Footer Section */}

const sections = [
  "Section 2: About",
  "Section 3: Total Ownership",
  "Section 4: Omni-Chain",
  "Section 5: dApp Flow",
  "Section 6: Security Architecture",
  "Section 7: Performance",
  "Section 8: Comparison",
  "Section 9: Design Principles",
  "Section 10: FAQ",
  "Section 11: Final CTA"
];

for (let i = 0; i < sections.length; i++) {
  const currentSection = sections[i];
  const nextMarker = (i < sections.length - 1) 
    ? `{/* ── ${sections[i+1]} ── */}` 
    : `{/* Footer Section */}`;
  
  // Find the start of current section
  const sectionCommentRegex = new RegExp(`\\{\\/\\* ── ${currentSection} ── \\*\\/\\}\\s*<div[^>]*padding: '16vh 5vw'[^>]*>`, 'g');
  
  content = content.replace(sectionCommentRegex, (match) => {
    // Replace the opening div with StickySection opening, but KEEP the inner div without the padding/height
    // Wait, StickySection already provides the layout. We just need to wrap the contents.
    // It's safer to just replace `<div style={{ padding...}}>` with `<StickySection><div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>`
    return `{/* ── ${currentSection} ── */}\n      <StickySection>\n        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>`;
  });
  
  // Find the end of the section (just before the next marker)
  content = content.replace(nextMarker, `  </div>\n      </StickySection>\n\n      ${nextMarker}`);
}

// 3. Add id="site-footer" to footer
content = content.replace(/<footer style=\{\{/g, '<footer id="site-footer" style={{');

fs.writeFileSync(path, content, 'utf8');
console.log('Successfully updated sections in index.tsx');
