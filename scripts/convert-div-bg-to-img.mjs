import fs from 'fs';
import path from 'path';

const astroPages = [
  'src/pages/debutante.astro',
  'src/pages/casamentos.astro',
  'src/pages/casamentos-visitas.astro',
  'src/pages/eventos-corporativos.astro'
];

astroPages.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');

  // 1. Convert gallery divs with inline style background-image to contain <Img> element
  // Example: <div class="e-gallery-image elementor-gallery-item__image" data-thumbnail="/src/assets/..." ... style="background-image: url('/src/assets/...'); background-size: cover; background-position: center; min-height: 260px; width: 100%; display: block;"></div>
  const galleryRegex = /<div class="e-gallery-image elementor-gallery-item__image" data-thumbnail="([^"]+)"([^>]*?)style="background-image:\s*url\(['"]?[^'"]+?['"]?\);\s*([^"]*?)"\s*><\/div>/g;
  
  content = content.replace(galleryRegex, (match, src, attrs, styleProps) => {
    // Preserve style properties like min-height, width, etc.
    const cleanStyles = styleProps
      .replace(/background-image:[^;]+;?/g, '')
      .replace(/background-size:[^;]+;?/g, '')
      .replace(/background-position:[^;]+;?/g, '')
      .trim();
    
    return `<div class="e-gallery-image elementor-gallery-item__image"${attrs}style="${cleanStyles} overflow: hidden; display: block; position: relative;">\n\t\t\t\t\t<Img src="${src}" alt="Galeria" style="width: 100%; height: 100%; object-fit: cover; display: block;" />\n\t\t\t\t\t</div>`;
  });

  // 2. Convert swiper/carousel divs with data-bg to contain <Img> element
  // Example: <div data-bg="/src/assets/..." class="elementor-carousel-image rocket-lazyload" role="img" aria-label="..." style="">\n\n\t\t\t\n\t\t\t\t\t</div>
  const carouselRegex = /<div data-bg="([^"]+)" class="elementor-carousel-image[^"]*" role="img" aria-label="([^"]*)" style="[^"]*">\s*<\/div>/g;

  content = content.replace(carouselRegex, (match, src, label) => {
    return `<div class="elementor-carousel-image" style="overflow: hidden; width: 100%; height: 100%; position: relative;">\n\t\t\t\t\t\t\t\t\t\t<Img src="${src}" alt="${label || 'Slideshow'}" style="width: 100%; height: 100%; object-fit: cover; display: block;" />\n\t\t\t\t\t\t\t\t\t</div>`;
  });

  fs.writeFileSync(file, content, 'utf8');
  console.log(`Converted background-image divs to <Img> components in: ${file}`);
});
