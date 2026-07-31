import fs from 'fs';
import path from 'path';

// Parse arguments
const args = process.argv.slice(2);
const slugArg = args.find(arg => arg.startsWith('--slug='));
if (!slugArg) {
  console.error('❌ Erro: Forneça o slug da página. Ex: node scripts/analyze-assets.mjs --slug=casamentos');
  process.exit(1);
}
const slug = slugArg.split('=')[1];

const htmlPath = path.join('_html-originais', `${slug}.html`);
const cssPath = path.join('_html-originais', `${slug}.css`);

if (!fs.existsSync(htmlPath)) {
  console.error(`❌ Erro: Arquivo HTML não encontrado em ${htmlPath}`);
  process.exit(1);
}

const html = fs.readFileSync(htmlPath, 'utf8');
const css = fs.existsSync(cssPath) ? fs.readFileSync(cssPath, 'utf8') : '';

// 1. Encontrar todas as seções e suas posições no HTML
// Procuramos por divs/sections com classe 'e-parent', 'e-con' (com data-element_type="container" ou "section")
const sectionRegex = /<(section|div)\s+[^>]*class=["'][^"']*\b(e-parent|elementor-section)\b[^"']*["'][^>]*>/gi;
const sections = [];
let match;
while ((match = sectionRegex.exec(html)) !== null) {
  const tagContent = match[0];
  const startIdx = match.index;
  // Extrair data-id ou id
  const idMatch = tagContent.match(/data-id=["']([a-z0-9]+)["']/i) || tagContent.match(/\belementor-element-([a-z0-9]{7})\b/i);
  const sectionId = idMatch ? idMatch[1] : `pos-${startIdx}`;
  
  sections.push({
    tag: match[1],
    id: sectionId,
    startIdx: startIdx,
    tagContent: tagContent
  });
}

if (sections.length === 0) {
  // Se não achou com e-parent/elementor-section, busca qualquer elementor-element com data-element_type="container" ou "section"
  const fallbackRegex = /<(section|div)\s+[^>]*data-element_type=["'](?:container|section)["'][^>]*>/gi;
  while ((match = fallbackRegex.exec(html)) !== null) {
    const tagContent = match[0];
    const startIdx = match.index;
    const idMatch = tagContent.match(/data-id=["']([a-z0-9]+)["']/i);
    const sectionId = idMatch ? idMatch[1] : `pos-${startIdx}`;
    sections.push({
      tag: match[1],
      id: sectionId,
      startIdx: startIdx,
      tagContent: tagContent
    });
  }
}

// Ordenar seções por posição de início
sections.sort((a, b) => a.startIdx - b.startIdx);

// 2. Extrair conteúdo de cada seção
const reportSections = [];
for (let i = 0; i < sections.length; i++) {
  const current = sections[i];
  const next = sections[i + 1];
  const endIdx = next ? next.startIdx : html.length;
  const sectionHtml = html.slice(current.startIdx, endIdx);

  // a. Tentar obter um título amigável para a seção
  // Busca o primeiro heading ou texto de heading
  let title = '';
  const headingMatch = sectionHtml.match(/<(h1|h2|h3|h4|h5|h6)[^>]*>([\s\S]*?)<\/\1>/i);
  if (headingMatch) {
    title = headingMatch[2].replace(/<[^>]*>/g, '').trim().replace(/\s+/g, ' ');
  }
  if (!title) {
    // Buscar primeiro texto dentro de elementor-widget-heading
    const widgetHeadingMatch = sectionHtml.match(/class=["'][^"']*elementor-widget-heading[^"']*["'][\s\S]*?<h[^>]*>([\s\S]*?)<\/h/i);
    if (widgetHeadingMatch) {
      title = widgetHeadingMatch[1].replace(/<[^>]*>/g, '').trim().replace(/\s+/g, ' ');
    }
  }
  // Limitar tamanho do título e caracteres especiais
  if (title) {
    title = title.length > 50 ? title.slice(0, 47) + '...' : title;
  } else {
    title = `Seção ${i + 1} (${current.id})`;
  }

  // b. Extrair todas as imagens na tag <img>
  const imgs = [];
  const imgTagRegex = /<img\s+[^>]*\bsrc=["']([^"']*)["']/gi;
  let imgMatch;
  while ((imgMatch = imgTagRegex.exec(sectionHtml)) !== null) {
    const src = imgMatch[1];
    if (src && !src.startsWith('data:') && !imgs.includes(src)) {
      imgs.push(src);
    }
  }
  
  // Também checar data-lazy-src ou data-src ou data-srcset
  const dataSrcRegex = /<img\s+[^>]*\bdata-(?:lazy-)?src=["']([^"']*)["']/gi;
  while ((imgMatch = dataSrcRegex.exec(sectionHtml)) !== null) {
    const src = imgMatch[1];
    if (src && !src.startsWith('data:') && !imgs.includes(src)) {
      imgs.push(src);
    }
  }

  // c. Extrair vídeos e sources
  const videos = [];
  const videoRegex = /<(video|source)\s+[^>]*\bsrc=["']([^"']*)["']/gi;
  let videoMatch;
  while ((videoMatch = videoRegex.exec(sectionHtml)) !== null) {
    const src = videoMatch[2];
    if (src && !videos.includes(src)) {
      videos.push(src);
    }
  }
  
  const dataVideoRegex = /<(video|source)\s+[^>]*\bdata-src=["']([^"']*)["']/gi;
  while ((videoMatch = dataVideoRegex.exec(sectionHtml)) !== null) {
    const src = videoMatch[2];
    if (src && !videos.includes(src)) {
      videos.push(src);
    }
  }

  // d. Extrair background-images do CSS
  // Encontrar todas as classes elementor-element-XXXXXXX dentro deste HTML
  const elementorIds = new Set();
  const idRegex = /\belementor-element-([a-z0-9]{7})\b/gi;
  let idMatch;
  while ((idMatch = idRegex.exec(sectionHtml)) !== null) {
    elementorIds.add(idMatch[1]);
  }
  if (current.id) {
    elementorIds.add(current.id);
  }

  const bgImages = [];
  if (css) {
    for (const elId of elementorIds) {
      // Procurar no CSS por regras envolvendo .elementor-element-elId e que tenham background-image: url(...)
      const escapedId = elId.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const cssBgRegex = new RegExp(`\\.elementor-element-${escapedId}\\b[^{}]*\\{[^{}]*background(?:-image)?\\s*:\\s*[^;}]*url\\(['"]?([^'")]+)['"]?\\)`, 'gi');
      let cssMatch;
      while ((cssMatch = cssBgRegex.exec(css)) !== null) {
        const url = cssMatch[1].split('?')[0];
        if (url && !bgImages.includes(url)) {
          bgImages.push(url);
        }
      }
    }
  }

  if (imgs.length > 0 || videos.length > 0 || bgImages.length > 0) {
    reportSections.push({
      index: i + 1,
      id: current.id,
      title: title,
      imgs: imgs,
      videos: videos,
      bgImages: bgImages
    });
  }
}

// 3. Gerar o arquivo markdown de relatório
let reportMd = `# Relatório de Assets por Seção — /${slug}\n\n`;
reportMd += `Este relatório lista todas as imagens, backgrounds e vídeos encontrados na página original, divididos por seção, para facilitar o upload e apontamento na sua CDN própria.\n\n`;

reportSections.forEach(sec => {
  reportMd += `## Seção ${sec.index}: ${sec.title} (ID: \`${sec.id}\`)\n\n`;
  
  if (sec.bgImages.length > 0) {
    reportMd += `### Imagens de Fundo (Backgrounds via CSS)\n`;
    sec.bgImages.forEach(img => {
      reportMd += `- [${path.basename(img)}](${img})\n`;
    });
    reportMd += `\n`;
  }

  if (sec.imgs.length > 0) {
    reportMd += `### Imagens de Conteúdo (tags \`<img>\`)\n`;
    sec.imgs.forEach(img => {
      reportMd += `- [${path.basename(img)}](${img})\n`;
    });
    reportMd += `\n`;
  }

  if (sec.videos.length > 0) {
    reportMd += `### Vídeos / Clipes (tags \`<video>\`)\n`;
    sec.videos.forEach(vid => {
      reportMd += `- [${path.basename(vid)}](${vid})\n`;
    });
    reportMd += `\n`;
  }
  
  reportMd += `---\n\n`;
});

const reportPath = path.join('C:\\Users\\team\\.gemini\\antigravity\\brain\\fdea6d68-e554-4111-add4-7c3d5d64663a', `asset_links_${slug}.md`);
fs.writeFileSync(reportPath, reportMd, 'utf8');
console.log(`\n🎉 Relatório de assets gerado com sucesso em:\n   ${reportPath}\n`);
