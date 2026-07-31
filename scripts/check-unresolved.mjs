import fs from 'fs';

['dist/debutante/index.html', 'dist/casamentos/index.html', 'dist/casamentos-visitas/index.html', 'dist/eventos-corporativos/index.html'].forEach(file => {
  if (!fs.existsSync(file)) return;
  const html = fs.readFileSync(file, 'utf8');
  const matches = html.match(/\/src\/assets\/images[^\s'"]+/g) || [];
  console.log(`File: ${file}`);
  console.log(`Unresolved count: ${matches.length}`);
  if (matches.length > 0) {
    console.log('Matches:', [...new Set(matches)]);
  }
});
