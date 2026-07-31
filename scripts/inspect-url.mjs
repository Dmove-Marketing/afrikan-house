import https from 'https';

const url = 'https://eventos.afrikanhouse.com.br/casamentos/';

https.get(url, (res) => {
  if (res.statusCode === 301 || res.statusCode === 302) {
    console.log('Redirecionando para:', res.headers.location);
    return;
  }
  let html = '';
  res.on('data', chunk => html += chunk);
  res.on('end', () => {
    console.log('📊 RESULTADOS DA ANÁLISE DA PÁGINA:');
    console.log('------------------------------------');
    console.log('URL Target:', url);
    console.log('Tamanho HTML:', (html.length / 1024).toFixed(1) + ' KB');

    const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
    console.log('Título SEO:', titleMatch ? titleMatch[1].trim() : 'N/A');

    const cssLinks = html.match(/<link[^>]*rel=["']stylesheet["'][^>]*>/gi) || [];
    console.log('Folhas de estilo (CSS):', cssLinks.length);

    const imgMatches = html.match(/<img[^>]*>/gi) || [];
    const bgMatches = html.match(/background(?:-image)?\s*:\s*url\([^)]+\)/gi) || [];
    console.log('Imagens <img>:', imgMatches.length);
    console.log('Backgrounds CSS detectados:', bgMatches.length);

    const formMatches = html.match(/<form[^>]*>/gi) || [];
    console.log('Formulários de Lead:', formMatches.length);

    const videoMatches = html.match(/<video[\s\S]*?<\/video>|youtube\.com|vimeo\.com/gi) || [];
    console.log('Vídeos / Players:', videoMatches.length);

    const googleFonts = Array.from(new Set((html.match(/fonts\.googleapis\.com\/css2\?[^"']+/gi) || [])));
    console.log('Google Fonts:', googleFonts);

    const elementorPostCss = html.match(/elementor\/css\/post-\d+\.css/gi) || [];
    console.log('CSS Elementor Post:', elementorPostCss);
  });
}).on('error', (err) => console.error('Erro ao acessar URL:', err));
