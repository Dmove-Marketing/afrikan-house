import fs from 'fs';

const file = 'src/pages/eventos-corporativos.astro';
if (fs.existsSync(file)) {
  let content = fs.readFileSync(file, 'utf8');

  // Replace remote URLs in data-settings JSON
  content = content.replace(/https:\\\/\\\/eventos\.afrikanhouse\.com\.br\\\/wp-content\\\/uploads\\\/2024\\\/07\\\/6-1-e1720706720262\.jpg/g, '\\/images\\/eventos-corporativos\\/6-1-e1720706720262.jpg');
  content = content.replace(/https:\\\/\\\/eventos\.afrikanhouse\.com\.br\\\/wp-content\\\/uploads\\\/2024\\\/07\\\/Bangalo-3\.jpg/g, '\\/images\\/eventos-corporativos\\/Bangalo-3.jpg');
  content = content.replace(/https:\\\/\\\/eventos\.afrikanhouse\.com\.br\\\/wp-content\\\/uploads\\\/2024\\\/07\\\/Mesa-de-doces-2\.jpg/g, '\\/images\\/eventos-corporativos\\/Mesa-de-doces-2.jpg');

  fs.writeFileSync(file, content, 'utf8');
  console.log('✅ Slideshow JSON URLs in Astro file updated!');
}
