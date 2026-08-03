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
  console.log('✅ Copiou imagens de src/assets/images para public/images');
}

// 2. Scan all Astro pages dynamically and update any /src/assets/images/ to /images/
const pagesDir = 'src/pages';
const astroPages = fs.readdirSync(pagesDir)
  .filter(f => f.endsWith('.astro'))
  .map(f => path.join(pagesDir, f));

astroPages.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // Replace any instance of /src/assets/images/ with /images/
  // This handles inline style backgrounds, data-bg, data-thumbnail, hrefs, posters etc.
  const regex = /\/src\/assets\/images\//g;
  if (regex.test(content)) {
    content = content.replace(regex, '/images/');
    fs.writeFileSync(file, content, 'utf8');
    console.log(`✅ Updated asset paths to /images/ in: ${path.basename(file)}`);
  }
});
