const fs = require('fs');

const path = 'd:/Aman Chauhan/project/VaultX/apps/web/src/pages/Landing/index.tsx';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('import { AnimatedComparisonTable }')) {
  const lastImportIndex = content.lastIndexOf('import ');
  const nextLineIndex = content.indexOf('\n', lastImportIndex);
  content = content.slice(0, nextLineIndex) + '\nimport { AnimatedComparisonTable } from \'./AnimatedComparisonTable\';' + content.slice(nextLineIndex);
}

const section8Start = content.indexOf('{/* ── Section 8: Comparison ── */}');
const section9Start = content.indexOf('{/* ── Section 9: Design Principles ── */}');

if (section8Start !== -1 && section9Start !== -1) {
  const before = content.substring(0, section8Start);
  const after = content.substring(section9Start);

  const newSection8 = `{/* ── Section 8: Comparison ── */}
      <StickySection>
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <motion.h2 initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} style={{ fontFamily: 'CustomHelvetica, sans-serif', fontSize: 'clamp(4rem, 8vw, 8rem)', fontWeight: 500, color: '#FAFAFA', letterSpacing: '-0.05em', lineHeight: 1.05, marginBottom: '4rem', textAlign: 'center' }}>
          A Different Standard.
        </motion.h2>
        <AnimatedComparisonTable />
      </div>

        </StickySection>

      `;

  fs.writeFileSync(path, before + newSection8 + after);
  console.log('Replaced Section 8 successfully.');
} else {
  console.log('Could not find boundaries.');
}
