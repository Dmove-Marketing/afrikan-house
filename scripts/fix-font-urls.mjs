import fs from 'fs';
import path from 'path';

const files = ['src/styles/casamentos.css', '_html-originais/casamentos.css'];

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');

  // Substitui URLs de fontes remotas para usar /fonts/[filename]
  const fontRegex = /url\(['"]?(https?:\/\/[^'")]+?\.(?:ttf|woff2?|otf|eot))['"]?\)/gi;
  content = content.replace(fontRegex, (match, fullUrl) => {
    const filename = path.basename(fullUrl.split('?')[0]);
    return `url('/fonts/${filename}')`;
  });

  fs.writeFileSync(file, content, 'utf8');
  console.log(`✅ URLs de fontes atualizadas para local /fonts/ em: ${file}`);
});
