const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'apps/web/src');

const replacements = [
  // Backgrounds
  { regex: /['"]rgba\(24,\s*24,\s*27,\s*0\.75\)['"]/g, replacement: "'var(--glass-bg)'" },
  { regex: /rgba\(24,\s*24,\s*27,\s*0\.75\)/g, replacement: "var(--glass-bg)" },
  
  { regex: /['"]rgba\(24,\s*24,\s*27,\s*0\.6\)['"]/g, replacement: "'var(--glass-bg)'" },
  { regex: /rgba\(24,\s*24,\s*27,\s*0\.6\)/g, replacement: "var(--glass-bg)" },
  
  { regex: /['"]rgba\(10,\s*10,\s*15,\s*0\.85\)['"]/g, replacement: "'var(--glass-bg-heavy)'" },
  { regex: /rgba\(10,\s*10,\s*15,\s*0\.85\)/g, replacement: "var(--glass-bg-heavy)" },
  
  { regex: /['"]#18181b['"]/gi, replacement: "'var(--glass-bg)'" },
  
  { regex: /['"]#27272a['"]/gi, replacement: "'var(--glass-border)'" },
  
  { regex: /['"]rgba\(17,\s*11,\s*56,\s*0\.3\)['"]/g, replacement: "'var(--glass-bg)'" },
  { regex: /rgba\(17,\s*11,\s*56,\s*0\.3\)/g, replacement: "var(--glass-bg)" },

  // Borders
  { regex: /['"]rgba\(255,\s*255,\s*255,\s*0\.08\)['"]/g, replacement: "'var(--glass-border)'" },
  { regex: /rgba\(255,\s*255,\s*255,\s*0\.08\)/g, replacement: "var(--glass-border)" },
  
  { regex: /['"]rgba\(255,\s*255,\s*255,\s*0\.1\)['"]/g, replacement: "'var(--glass-border)'" },
  { regex: /rgba\(255,\s*255,\s*255,\s*0\.1\)/g, replacement: "var(--glass-border)" },

  { regex: /['"]rgba\(255,\s*255,\s*255,\s*0\.05\)['"]/g, replacement: "'var(--glass-border-light)'" },
  { regex: /rgba\(255,\s*255,\s*255,\s*0\.05\)/g, replacement: "var(--glass-border-light)" },
  
  { regex: /['"]rgba\(255,\s*255,\s*255,\s*0\.04\)['"]/g, replacement: "'var(--glass-border-light)'" },
  { regex: /rgba\(255,\s*255,\s*255,\s*0\.04\)/g, replacement: "var(--glass-border-light)" },
  
  { regex: /['"]rgba\(255,\s*255,\s*255,\s*0\.02\)['"]/g, replacement: "'var(--color-surface)'" },
  { regex: /rgba\(255,\s*255,\s*255,\s*0\.02\)/g, replacement: "var(--color-surface)" },
  
  // Text
  { regex: /['"]#ece9e3['"]/gi, replacement: "'var(--color-text-primary)'" },
  { regex: /['"]#e4e4e7['"]/gi, replacement: "'var(--color-text-primary)'" },
  { regex: /['"]#a1a1aa['"]/gi, replacement: "'var(--color-text-muted)'" },
  { regex: /['"]#71717a['"]/gi, replacement: "'var(--color-text-muted)'" },
  { regex: /['"]#52525b['"]/gi, replacement: "'var(--color-text-secondary)'" },
  { regex: /['"]#3f3f46['"]/gi, replacement: "'var(--color-text-secondary)'" },
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      if (fullPath.includes('Landing') || fullPath.includes('Hero')) {
        continue;
      }
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts') || fullPath.endsWith('.css')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let original = content;

      for (const { regex, replacement } of replacements) {
        content = content.replace(regex, replacement);
      }

      if (content !== original) {
        fs.writeFileSync(fullPath, content);
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

processDirectory(srcDir);
console.log("Done.");
