import fs from 'fs';
import path from 'path';

// Helper to copy directory recursively
function copyDirSync(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// 1. Copy src/assets/images to public/images
const srcImages = 'src/assets/images';
const destImages = 'public/images';
if (fs.existsSync(srcImages)) {
  copyDirSync(srcImages, destImages);
  console.log('✅ Coopiou imagens de src/assets/images para public/images');
}

// 2. Scan Astro pages and update data-thumbnail, data-bg, and poster props
const astroPages = [
  'src/pages/debutante.astro',
  'src/pages/casamentos.astro',
  'src/pages/casamentos-visitas.astro',
  'src/pages/eventos-corporativos.astro'
];

astroPages.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');

  // Replace data-thumbnail="/src/assets/images/... -> data-thumbnail="/images/...
  content = content.replace(/data-thumbnail="\/src\/assets\/images\//g, 'data-thumbnail="/images/');
  
  // Replace poster="/src/assets/images/... -> poster="/images/...
  content = content.replace(/poster="\/src\/assets\/images\//g, 'poster="/images/');

  // Replace data-bg="/src/assets/images/... -> data-bg="/images/...
  content = content.replace(/data-bg="\/src\/assets\/images\//g, 'data-bg="/images/');

  // Replace href="/src/assets/images/... -> href="/images/...
  content = content.replace(/href="\/src\/assets\/images\//g, 'href="/images/');

  fs.writeFileSync(file, content, 'utf8');
  console.log(`Updated non-compile attributes to /images/ in: ${file}`);
});
