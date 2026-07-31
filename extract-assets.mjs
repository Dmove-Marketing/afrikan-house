import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { URL } from 'url';

const sourceDir = '_html-originais';
const destImagesDir = path.join('src', 'assets', 'images');

// Garantir que os diretórios existam
[sourceDir, destImagesDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Helper para slugificar o nome do arquivo da página
function slugify(text) {
  return text.toString().toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

// Helper para baixar um arquivo via HTTPS
function downloadFile(fileUrl, destPath) {
  return new Promise((resolve, reject) => {
    https.get(fileUrl, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Erro HTTP ${response.statusCode} ao baixar ${fileUrl}`));
        return;
      }

      const fileStream = fs.createWriteStream(destPath);
      response.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close();
        resolve();
      });

      fileStream.on('error', (err) => {
        fs.unlink(destPath, () => {});
        reject(err);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

// Helper para baixar HTML da página
function fetchHtml(pageUrl) {
  return new Promise((resolve, reject) => {
    https.get(pageUrl, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        // Seguir redirecionamento simples
        fetchHtml(response.headers.location).then(resolve).catch(reject);
        return;
      }

      if (response.statusCode !== 200) {
        reject(new Error(`Erro HTTP ${response.statusCode} ao obter HTML de ${pageUrl}`));
        return;
      }

      let data = '';
      response.on('data', (chunk) => { data += chunk; });
      response.on('end', () => resolve(data));
    }).on('error', (err) => reject(err));
  });
}

// ─── Extrai CSS locais do HTML ────────────────────────────────────────────────
// Busca todos os links rel="stylesheet" locais (de plugins, temas ou caminhos relativos).
// Retorna um array com as URLs dos CSSs encontrados.
function extractLocalCssUrls(html, pageUrl) {
  const regex = /<link\s+[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+)["']/gi;
  const urls = [];
  let match;
  const pageBase = new URL(pageUrl);
  while ((match = regex.exec(html)) !== null) {
    let url = match[1].split('?')[0];
    if (url.includes('/wp-content/') || url.includes('/wp-includes/') || !url.startsWith('http')) {
      if (!url.startsWith('http')) {
        url = `${pageBase.protocol}//${pageBase.host}${url.startsWith('/') ? '' : '/'}${url}`;
      }
      if (!url.includes('cdnjs.cloudflare.com') && !url.includes('fonts.googleapis.com')) {
        urls.push(url);
      }
    }
  }
  return Array.from(new Set(urls));
}

// ─── Resolve URLs relativas dentro do CSS para caminhos absolutos ──────────────
function resolveCssUrls(cssContent, cssUrl) {
  return cssContent.replace(/url\(['"]?([^'")]+)['"]?\)/gi, (match, relPath) => {
    if (relPath.startsWith('http') || relPath.startsWith('data:')) {
      return match;
    }
    try {
      const resolved = new URL(relPath, cssUrl).toString();
      return `url('${resolved}')`;
    } catch (e) {
      return match;
    }
  });
}

// ─── Download genérico com suporte a http e https ────────────────────────────
function downloadFileAuto(fileUrl, destPath) {
  return new Promise((resolve, reject) => {
    const lib = fileUrl.startsWith('https') ? https : http;
    lib.get(fileUrl, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        downloadFileAuto(response.headers.location, destPath).then(resolve).catch(reject);
        return;
      }
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}`));
        return;
      }
      const fileStream = fs.createWriteStream(destPath);
      response.pipe(fileStream);
      fileStream.on('finish', () => { fileStream.close(); resolve(); });
      fileStream.on('error', (err) => { fs.unlink(destPath, () => {}); reject(err); });
    }).on('error', reject);
  });
}

// Execução principal
async function main() {
  const args = process.argv.slice(2);
  const urlArg = args.find(arg => arg.startsWith('--url='));
  const skipImages = args.includes('--skip-images');

  if (!urlArg) {
    console.error('\n❌ Erro: Por favor, forneça a URL da página WordPress.');
    console.log('Exemplo: node extract-assets.mjs --url=https://eventos.multiplaeventos.com.br/debutantes-v1/\n');
    process.exit(1);
  }

  const pageUrl = urlArg.split('=')[1];
  console.log(`\n🔍 Acessando: ${pageUrl}...`);

  try {
    const html = await fetchHtml(pageUrl);
    
    // Extrair o slug da URL para salvar o arquivo HTML
    const parsedUrl = new URL(pageUrl);
    const pathParts = parsedUrl.pathname.split('/').filter(Boolean);
    const rawSlug = pathParts[pathParts.length - 1] || 'index';
    const slug = slugify(rawSlug);
    
    const htmlPath = path.join(sourceDir, `${slug}.html`);
    fs.writeFileSync(htmlPath, html, 'utf8');
    console.log(`✅ HTML salvo em: ${htmlPath}`);

    // ── 1. CSS do Elementor e Temas (Unificado) ─────────────────────────────
    let cssDownloaded = false;
    const localCssUrls = extractLocalCssUrls(html, pageUrl);

    if (localCssUrls.length > 0) {
      console.log(`\n🎨 ${localCssUrls.length} folha(s) de estilo local(is) detectada(s):`);
      const tempCssFiles = [];
      for (let i = 0; i < localCssUrls.length; i++) {
        const cssUrl = localCssUrls[i];
        const cssFilename = path.basename(cssUrl);
        const tempPath = path.join(sourceDir, `${slug}-temp-${i}.css`);
        console.log(`   - Baixando [${i+1}/${localCssUrls.length}]: ${cssFilename}`);
        try {
          await downloadFileAuto(cssUrl, tempPath);
          tempCssFiles.push({ path: tempPath, url: cssUrl });
        } catch (err) {
          console.warn(`   ⚠️  Erro ao baixar ${cssFilename}: ${err.message}`);
        }
      }

      if (tempCssFiles.length > 0) {
        // Concatenar todos os CSS em um único arquivo resolvendo as URLs relativas
        const combinedCss = tempCssFiles
          .map(f => {
            const rawContent = fs.readFileSync(f.path, 'utf8');
            const resolvedContent = resolveCssUrls(rawContent, f.url);
            return `/* Stylesheet: ${path.basename(f.path)} (Resolved URL: ${f.url}) */\n${resolvedContent}`;
          })
          .join('\n\n');
        const cssDest = path.join(sourceDir, `${slug}.css`);
        fs.writeFileSync(cssDest, combinedCss, 'utf8');
        console.log(`✅ CSS unificado e resolvido salvo em: ${cssDest}`);
        cssDownloaded = true;

        // Limpar arquivos temporários
        tempCssFiles.forEach(f => {
          try { fs.unlinkSync(f.path); } catch (e) {}
        });
      }
    } else {
      console.warn(`\n⚠️  Nenhum CSS local encontrado no HTML.`);
    }

    // ── 2. Fontes e Tipografia ──────────────────────────────────────────────
    const fontReport = {
      page: slug,
      url: pageUrl,
      googleFonts: [],
      customFonts: [],
    };

    const googleFontRegex = /https?:\/\/fonts\.googleapis\.com\/css2\?[^"'\s)]+/gi;
    const gFontMatches = Array.from(new Set(html.match(googleFontRegex) || []));
    fontReport.googleFonts = gFontMatches;

    if (cssDownloaded) {
      const cssContent = fs.readFileSync(path.join(sourceDir, `${slug}.css`), 'utf8');
      const fontRegex = /url\(['"]?(https?:\/\/[^'")]+\.(?:woff2?|ttf|otf|eot))['"]?\)/gi;
      const fontUrls = new Set();
      let fontMatch;
      while ((fontMatch = fontRegex.exec(cssContent)) !== null) {
        fontUrls.add(fontMatch[1].split('?')[0]);
      }

      if (fontUrls.size > 0) {
        const fontsDir = path.join('public', 'fonts');
        if (!fs.existsSync(fontsDir)) fs.mkdirSync(fontsDir, { recursive: true });
        console.log(`\n🔤 ${fontUrls.size} fonte(s) customizada(s) detectada(s) no CSS unificado...`);
        for (const fontUrl of fontUrls) {
          const fontFilename = path.basename(fontUrl);
          const fontDest = path.join(fontsDir, fontFilename);
          fontReport.customFonts.push({ name: fontFilename, originalUrl: fontUrl });
          if (!fs.existsSync(fontDest)) {
            try {
              await downloadFileAuto(fontUrl, fontDest);
              console.log(`   📥 ${fontFilename}`);
            } catch {
              console.warn(`   ⚠️ ${fontFilename} — erro ao baixar fonte.`);
            }
          }
        }
      }
    }

    // ── 3. Imagens e Mídias para a pasta dedicada da página ─────────────────
    const pageAssetDir = path.join('src', 'assets', 'images', slug);
    if (!fs.existsSync(pageAssetDir)) {
      fs.mkdirSync(pageAssetDir, { recursive: true });
    }

    // Escrever o relatório de fontes dentro da pasta da página
    const fontReportPath = path.join(pageAssetDir, 'relatorio-fontes.json');
    fs.writeFileSync(fontReportPath, JSON.stringify(fontReport, null, 2), 'utf8');
    console.log(`\n📄 Relatório de fontes gerado em: ${fontReportPath}`);

    const cssText = cssDownloaded ? fs.readFileSync(path.join(sourceDir, `${slug}.css`), 'utf8') : '';
    const combinedContent = html + '\n' + cssText;
    const imgRegex = /(https?:\/\/[^\s"'()<>]+?\.(?:jpg|jpeg|png|webp|avif|gif|svg)(?:\?[^\s"']*)?)/gi;
    const matches = combinedContent.match(imgRegex) || [];

    const imageUrls = Array.from(new Set(matches)).filter(url =>
      !url.includes('sentry') && !url.includes('facebook.com') && !url.includes('google-analytics.com')
    );

    let downloadCount = 0;
    let failCount = 0;

    if (skipImages) {
      console.log(`\n📸 ${imageUrls.length} imagem(ns) detectada(s). Flag --skip-images ativa: pulando download.`);
    } else {
      console.log(`\n📸 ${imageUrls.length} imagens encontradas. Baixando para src/assets/images/${slug}/...`);
      const downloadPromises = imageUrls.map(async (imgUrl) => {
        try {
          const cleanUrl = imgUrl.split('?')[0];
          const filename = path.basename(cleanUrl);
          const destPath = path.join(pageAssetDir, filename);

          if (fs.existsSync(destPath)) { downloadCount++; return; }

          await downloadFileAuto(imgUrl, destPath);
          downloadCount++;
          console.log(`   📥 [${downloadCount}/${imageUrls.length}] ${filename}`);
        } catch (err) {
          failCount++;
          console.warn(`   ⚠️ Erro: ${path.basename(imgUrl.split('?')[0])} — ${err.message}`);
        }
      });

      await Promise.all(downloadPromises);
    }

    // ── Resumo Final ────────────────────────────────────────────────────────
    console.log(`\n${'═'.repeat(54)}`);
    console.log(`🎉 Extração concluída — /${slug}`);
    console.log(`${'─'.repeat(54)}`);
    console.log(`   HTML             : _html-originais/${slug}.html`);
    console.log(`   CSS WP           : ${cssDownloaded ? `_html-originais/${slug}.css ✅` : '⚠️ não baixado'}`);
    console.log(`   Pasta de Assets  : src/assets/images/${slug}/ (${downloadCount} imagens)`);
    console.log(`   Relatório Fontes : src/assets/images/${slug}/relatorio-fontes.json`);
    console.log(`${'─'.repeat(54)}`);
    console.log(`\n👉 Próximos passos:`);
    console.log(`   1. npm run scaffold`);
    console.log(`   2. Acesse http://localhost:4323/${slug}\n`);

  } catch (err) {
    console.error(`\n❌ Erro geral no processo: ${err.message}\n`);
    process.exit(1);
  }
}

main();
