const fs = require('fs');
const path = 'd:/Aman Chauhan/project/VaultX/apps/web/src/pages/Landing/index.tsx';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('import { PhysicsQuestionMark }')) {
  const lastImportIndex = content.lastIndexOf('import ');
  const nextLineIndex = content.indexOf('\n', lastImportIndex);
  content = content.slice(0, nextLineIndex) + '\nimport { PhysicsQuestionMark } from \'./PhysicsQuestionMark\';' + content.slice(nextLineIndex);
}

const target = `        <motion.h2 initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} style={{ fontFamily: 'CustomHelvetica, sans-serif', fontSize: 'clamp(4rem, 8vw, 8rem)', fontWeight: 500, color: '#FAFAFA', letterSpacing: '-0.05em', lineHeight: 1.05, marginBottom: '3rem', textAlign: 'center' }}>
          Questions.
        </motion.h2>`;

const replacement = `        <motion.h2 initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} style={{ fontFamily: 'CustomHelvetica, sans-serif', fontSize: 'clamp(4rem, 8vw, 8rem)', fontWeight: 500, color: '#FAFAFA', letterSpacing: '-0.05em', lineHeight: 1.05, marginBottom: '3rem', textAlign: 'center' }}>
          <PhysicsQuestionMark />
        </motion.h2>`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync(path, content);
  console.log('FAQ section updated successfully.');
} else {
  console.log('Target not found in index.tsx.');
}
