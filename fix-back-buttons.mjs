import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PAGES_DIR = path.join(__dirname, 'apps/web/src/pages');

// Recursive function to get all files
function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      arrayOfFiles.push(path.join(dirPath, "/", file));
    }
  });

  return arrayOfFiles;
}

const files = getAllFiles(PAGES_DIR).filter(f => f.endsWith('.tsx'));

const buttonRegex1 = /<div\s+onClick=\{\(\)\s*=>\s*navigate\([^)]+\)\}\s*style=\{\{[^}]+\}\}\s*onMouseOver=\{[^}]+\}\s*onMouseOut=\{[^}]+\}\s*>\s*<ArrowLeft[^>]*>\s*Back\s*<\/div>/g;
const buttonRegex2 = /<button\s+onClick=\{\(\)\s*=>\s*navigate\([^)]+\)\}\s*style=\{\{[^}]+\}\}\s*onMouseOver=\{[^}]+\}\s*onMouseOut=\{[^}]+\}\s*aria-label="Go back"\s*>\s*<ArrowLeft[^>]*>\s*(?:\{[^}]+\}|[^<]+)\s*<\/button>/g;
const buttonRegex3 = /<button\s*variant="outline"\s*size="sm"\s*onClick=\{\(\)\s*=>\s*navigate\([^)]+\)\}\s*>\s*<ArrowLeft[^>]*>\s*Back\s*<\/button>/g;

// A generic regex to catch most variants of the back button block 
const genericBackBtnRegex = /(<button|<div)[^>]*onClick=\{\(\)\s*=>\s*navigate\([^)]+\)\}[^>]*>[\s\S]*?<ArrowLeft[\s\S]*?(<\/button>|<\/div>)/g;

let count = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // Replace back button block
  if (genericBackBtnRegex.test(content)) {
    // Before replacing, check if the label needs to be preserved (like 'Cancel')
    content = content.replace(genericBackBtnRegex, (match) => {
      let label = '';
      if (match.includes("stage === 'intro' ? 'Cancel' : 'Back'")) {
        label = " label={stage === 'intro' ? 'Cancel' : 'Back'}";
      } else if (match.includes("Cancel")) {
        label = ' label="Cancel"';
      }
      // If we are replacing a button with variant="outline", let's just keep the standard BackButton since we want uniformity.
      return `<BackButton${label} />`;
    });
    
    // Add import if missing
    if (!content.includes('BackButton')) {
      // Calculate relative path to components
      const relativePath = path.relative(path.dirname(file), path.join(PAGES_DIR, '../components/index.js')).replace(/\\/g, '/');
      const importStmt = `import { BackButton } from '${relativePath}';`;
      content = content.replace(/(import .*;\n)+/, (match) => `${match}${importStmt}\n`);
    }

    // Clean up unused ArrowLeft import
    if (!content.includes('<ArrowLeft')) {
      content = content.replace(/ArrowLeft,?\s*/, '');
    }

    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
    changed = true;
    count++;
  }
}

console.log(`Updated ${count} files.`);
