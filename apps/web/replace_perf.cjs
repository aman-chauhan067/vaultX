const fs = require('fs');

const path = 'd:/Aman Chauhan/project/VaultX/apps/web/src/pages/Landing/index.tsx';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('import { AnimatedStatGrid }')) {
  content = content.replace(
    "import { PhysicsUnbreakableText } from './PhysicsUnbreakableText';",
    "import { PhysicsUnbreakableText } from './PhysicsUnbreakableText';\nimport { AnimatedStatGrid } from './AnimatedStatGrid';"
  );
}

const section7Start = content.indexOf('{/* ── Section 7: Performance ── */}');
const section8Start = content.indexOf('{/* ── Section 8: Comparison ── */}');

if (section7Start !== -1 && section8Start !== -1) {
  const before = content.substring(0, section7Start);
  const after = content.substring(section8Start);

  const newSection7 = `{/* ── Section 7: Performance ── */}
      <StickySection>
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ textAlign: 'center', maxWidth: '700px', marginBottom: '4rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#3F3F46', marginBottom: '1.5rem' }}>PERFORMANCE</div>
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} style={{ fontFamily: 'CustomHelvetica, sans-serif', fontSize: 'clamp(3rem, 6vw, 5rem)', fontWeight: 500, color: '#FAFAFA', letterSpacing: '-0.04em', lineHeight: 1.1 }}>
              Speed without compromise.
            </motion.h2>
          </div>
          <AnimatedStatGrid />
        </div>
      </StickySection>

      `;

  fs.writeFileSync(path, before + newSection7 + after);
  console.log('Replaced Section 7 successfully.');
} else {
  console.log('Could not find boundaries.');
}
