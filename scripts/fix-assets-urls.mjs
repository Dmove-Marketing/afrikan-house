import fs from 'fs';
import path from 'path';

// Define local assets directories
const baseDir = 'src/assets/images';
const pages = [
  {
    astro: 'src/pages/debutante.astro',
    css: 'src/styles/debutante.css',
    imgFolder: 'debutante'
  },
  {
    astro: 'src/pages/casamentos.astro',
    css: 'src/styles/casamentos.css',
    imgFolder: 'casamentos'
  },
  {
    astro: 'src/pages/casamentos-visitas.astro',
    css: 'src/styles/casamentos-visitas.css',
    imgFolder: 'casamentos-visitas'
  },
  {
    astro: 'src/pages/eventos-corporativos.astro',
    css: 'src/styles/eventos-corporativos.css',
    imgFolder: 'eventos-corporativos'
  }
];

// Helper to find local path for a given image filename
function getLocalPath(filename, folder) {
  const localFile = path.join(baseDir, folder, filename);
  if (fs.existsSync(localFile)) {
    return `/src/assets/images/${folder}/${filename}`;
  }
  // Try case insensitivity search if exact match doesn't exist
  const folderPath = path.join(baseDir, folder);
  if (fs.existsSync(folderPath)) {
    const files = fs.readdirSync(folderPath);
    const match = files.find(f => f.toLowerCase() === filename.toLowerCase());
    if (match) {
      return `/src/assets/images/${folder}/${match}`;
    }
  }
  return null;
}

// 1. Process font files for all CSS files
const cssFiles = fs.readdirSync('src/styles').filter(f => f.endsWith('.css'));
cssFiles.forEach(cssName => {
  const cssPath = path.join('src/styles', cssName);
  let content = fs.readFileSync(cssPath, 'utf8');
  
  // Replace remote fonts with /fonts/filename
  const fontRegex = /url\(['"]?(https?:\/\/[^'")\s]+?\.(?:ttf|woff2?|otf|eot))['"]?\)/gi;
  content = content.replace(fontRegex, (match, fullUrl) => {
    const filename = path.basename(fullUrl.split('?')[0]);
    // Check if it exists in public/fonts
    if (fs.existsSync(path.join('public/fonts', filename))) {
      console.log(`Updated font in ${cssPath}: ${filename}`);
      return `url('/fonts/${filename}')`;
    }
    return match;
  });

  fs.writeFileSync(cssPath, content, 'utf8');
});

// 2. Process image files for each page/CSS
pages.forEach(({ astro, css, imgFolder }) => {
  [astro, css].forEach(filePath => {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Find all events wp-content images URLs
    const wpImgRegex = /https:\/\/eventos\.afrikanhouse\.com\.br\/wp-content\/uploads\/[^\s'"]+?\.(?:png|jpe?g|gif|svg|avif|webp)/gi;
    
    content = content.replace(wpImgRegex, (url) => {
      const filename = path.basename(url);
      const localPath = getLocalPath(filename, imgFolder);
      if (localPath) {
        console.log(`Replaced image in ${filePath}: ${filename} -> ${localPath}`);
        return localPath;
      } else {
        // Look in other folders just in case
        for (const p of pages) {
          const otherPath = getLocalPath(filename, p.imgFolder);
          if (otherPath) {
            console.log(`Replaced cross-referenced image in ${filePath}: ${filename} -> ${otherPath}`);
            return otherPath;
          }
        }
      }
      return url; // Keep remote if not found locally
    });

    fs.writeFileSync(filePath, content, 'utf8');
  });
});

console.log('🎉 URLs de fontes e imagens locais atualizadas com sucesso!');
