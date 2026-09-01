// Interações da LP /debutantes-v2 — nav, reveals, carrosséis, galeria masonry e lightbox.
// Envio dos formulários é tratado por forms.ts (integração Dmove).
(function(){
  var nav=document.getElementById('nav');
  if(!nav) return;
  function onScroll(){ nav.classList.toggle('solid', window.scrollY>60); }
  window.addEventListener('scroll',onScroll,{passive:true}); onScroll();

  var burger=document.getElementById('burger'), mm=document.getElementById('mmenu'), mc=document.getElementById('mclose');
  function openM(){mm.classList.add('open');document.body.style.overflow='hidden';}
  function closeM(){mm.classList.remove('open');document.body.style.overflow='';}
  if(burger) burger.addEventListener('click',openM);
  if(mc) mc.addEventListener('click',closeM);
  if(mm) mm.querySelectorAll('a').forEach(function(a){a.addEventListener('click',closeM);});

  // Títulos: máscara com subida linha a linha
  document.querySelectorAll('.hero h1, #sobre .sobre-copy h2, .sec-head h2, .space-copy h3, .cta h2').forEach(function(h){
    h.removeAttribute('data-reveal');
    var parts=h.innerHTML.split(/<br\s*\/?>/i);
    h.innerHTML=parts.map(function(p,i){ return '<span class="tr-line"><span style="transition-delay:'+(i*0.09).toFixed(2)+'s">'+p+'</span></span>'; }).join('');
    h.classList.add('tr');
  });
  // Cabeçalhos de seção: revelar eyebrow e subtítulo separadamente
  document.querySelectorAll('.sec-head[data-reveal]').forEach(function(sh){
    sh.removeAttribute('data-reveal');
    var eb=sh.querySelector('.eyebrow'); if(eb) eb.setAttribute('data-reveal','');
    var pp=sh.querySelector('p'); if(pp){ pp.setAttribute('data-reveal',''); pp.classList.add('d2'); }
  });
  // Rodapé também entra com fade-rise
  document.querySelectorAll('footer .foot-logo, footer .foot-slogan, footer .foot-social, footer .foot-units').forEach(function(el,i){ el.setAttribute('data-reveal',''); if(i) el.classList.add(i>2?'d2':'d1'); });

  var io=new IntersectionObserver(function(es){
    es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target);} });
  },{threshold:0.1,rootMargin:"0px 0px -8% 0px"});
  document.querySelectorAll('[data-reveal], .tr').forEach(function(el){io.observe(el);});

  // Contagem animada nos marcadores da seção Sobre
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function countUp(el){
    var raw=(el.getAttribute('data-val')||el.textContent).trim();
    var m=raw.match(/^(\d+)([\s\S]*)$/);
    if(!m || reduce){ el.textContent=raw; return; }
    var target=parseInt(m[1],10), suffix=m[2], dur=1300, t0=null;
    (function step(ts){ if(!t0)t0=ts; var p=Math.min((ts-t0)/dur,1); var e=1-Math.pow(1-p,3); el.textContent=Math.round(e*target)+suffix; if(p<1) requestAnimationFrame(step); })(performance.now());
  }
  document.querySelectorAll('#sobre .stat .n').forEach(function(el){ el.setAttribute('data-val', el.textContent.trim()); if(!reduce) el.textContent='0'; });
  var cio=new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ e.target.querySelectorAll('.stat .n').forEach(countUp); cio.unobserve(e.target); } }); },{threshold:0.4});
  var statsEl=document.querySelector('#sobre .stats'); if(statsEl) cio.observe(statsEl);

  // Carrossel de fotos por espaço
  document.querySelectorAll('.sg').forEach(function(sg){
    var slides=Array.prototype.slice.call(sg.querySelectorAll('.sg-slide'));
    var dotsWrap=sg.querySelector('.sg-dots');
    if(slides.length<2){ if(dotsWrap) dotsWrap.remove(); return; }
    var idx=0, timer=null, DUR=4500;
    var dots=slides.map(function(_,i){
      var d=document.createElement('button');
      d.className='sg-dot'+(i===0?' active':'');
      d.setAttribute('aria-label','Foto '+(i+1));
      d.addEventListener('click',function(){ go(i); reset(); });
      dotsWrap.appendChild(d); return d;
    });
    function go(n){ slides[idx].classList.remove('active'); dots[idx].classList.remove('active'); idx=(n+slides.length)%slides.length; slides[idx].classList.add('active'); dots[idx].classList.add('active'); }
    function next(){ go(idx+1); }
    function start(){ if(!timer && !reduce) timer=setInterval(next,DUR); }
    function stop(){ if(timer){ clearInterval(timer); timer=null; } }
    function reset(){ stop(); start(); }
    sg.addEventListener('mouseenter',stop);
    sg.addEventListener('mouseleave',start);
    start();
  });

  // Galeria masonry balanceada (colunas parelhas, sem cortar as fotos)
  var galEl=document.querySelector('.gal');
  var galItems=galEl?Array.prototype.slice.call(galEl.querySelectorAll('a')):[];
  function layoutGallery(){
    if(!galEl||!galItems.length) return;
    var W=galEl.clientWidth;
    var cols = W<960?2:3;
    var gap=parseFloat(getComputedStyle(galEl).columnGap||getComputedStyle(galEl).gap)||16;
    var colW=(W-gap*(cols-1))/cols;
    // limpa estilos inline de execuções anteriores
    galItems.forEach(function(el){ el.style.height=''; var im=el.querySelector('img'); im.style.height=''; im.style.width=''; im.style.objectFit=''; });
    galEl.textContent='';
    var colEls=[], colItems=[], sums=[];
    for(var i=0;i<cols;i++){ var c=document.createElement('div'); c.className='gal-col'; galEl.appendChild(c); colEls.push(c); colItems.push([]); sums.push(0); }
    galItems.forEach(function(el){
      var ar=parseFloat(el.getAttribute('data-ar'))||1.5;
      var h=colW/ar;
      var min=0; for(var j=1;j<cols;j++){ if(sums[j]<sums[min]-0.5) min=j; }
      colEls[min].appendChild(el); sums[min]+=h+gap;
    });
    // Alinhar as bases: todas as colunas terminam na altura da coluna mais alta,
    // esticando a moldura da última foto das colunas mais curtas (medindo a altura real renderizada).
    var target=0;
    colEls.forEach(function(c){ if(c.offsetHeight>target) target=c.offsetHeight; });
    colEls.forEach(function(c){
      var last=c.lastElementChild; if(!last) return;
      var diff=target-c.offsetHeight;
      if(diff<1) return; // já é a coluna base (ou está alinhada)
      var newH=last.offsetHeight+diff;
      if(newH>60){
        last.style.height=Math.round(newH)+'px';
        var im=last.querySelector('img');
        im.style.height='100%'; im.style.width='100%'; im.style.objectFit='cover';
      }
    });
  }
  layoutGallery();
  window.addEventListener('load',layoutGallery);
  var rz; window.addEventListener('resize',function(){ clearTimeout(rz); rz=setTimeout(layoutGallery,150); });
  // Recalcula quando cada imagem termina de carregar (o cálculo de bases depende da altura real).
  galItems.forEach(function(el){
    var im=el.querySelector('img'); if(!im||im.complete) return;
    im.addEventListener('load',function(){ clearTimeout(rz); rz=setTimeout(layoutGallery,120); });
  });

  // Botão de som do vídeo (autoplay é mudo por regra dos navegadores)
  var vSoundBtn=document.getElementById('vSound');
  var sobreVid=document.querySelector('.video-frame video');
  if(vSoundBtn && sobreVid){
    var ICON_OFF='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor" stroke="none"/><line x1="16.5" y1="9" x2="21.5" y2="15"/><line x1="21.5" y1="9" x2="16.5" y2="15"/></svg>';
    var ICON_ON='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor" stroke="none"/><path d="M16 8.8a4.5 4.5 0 0 1 0 6.4"/><path d="M18.7 6.3a8 8 0 0 1 0 11.4"/></svg>';
    vSoundBtn.innerHTML=ICON_OFF;
    vSoundBtn.addEventListener('click',function(){
      sobreVid.muted=!sobreVid.muted;
      if(!sobreVid.muted){ sobreVid.volume=1; var pr=sobreVid.play(); if(pr&&pr.catch)pr.catch(function(){}); vSoundBtn.innerHTML=ICON_ON; vSoundBtn.setAttribute('aria-label','Desativar som'); }
      else { vSoundBtn.innerHTML=ICON_OFF; vSoundBtn.setAttribute('aria-label','Ativar som'); }
    });
  }

  // Lightbox da galeria
  var gitems=galItems.slice();
  if(gitems.length){
    var lb=document.getElementById('lb'), lbImg=document.getElementById('lbImg'), lbCount=document.getElementById('lbCount'), cur=0;
    function lbShow(i){ cur=(i+gitems.length)%gitems.length; var im=gitems[cur].querySelector('img'); lbImg.src=im.currentSrc||im.src; lbImg.alt=im.alt||''; lbCount.textContent=(cur+1)+' / '+gitems.length; }
    function lbOpen(i){ lbShow(i); lb.classList.add('open'); lb.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden'; }
    function lbClose(){ lb.classList.remove('open'); lb.setAttribute('aria-hidden','true'); document.body.style.overflow=''; }
    gitems.forEach(function(a,i){ a.addEventListener('click',function(e){ e.preventDefault(); lbOpen(i); }); });
    document.getElementById('lbClose').addEventListener('click',lbClose);
    document.getElementById('lbPrev').addEventListener('click',function(e){ e.stopPropagation(); lbShow(cur-1); });
    document.getElementById('lbNext').addEventListener('click',function(e){ e.stopPropagation(); lbShow(cur+1); });
    lb.addEventListener('click',function(e){ if(e.target===lb) lbClose(); });
    document.addEventListener('keydown',function(e){ if(!lb.classList.contains('open')) return; if(e.key==='Escape') lbClose(); else if(e.key==='ArrowLeft') lbShow(cur-1); else if(e.key==='ArrowRight') lbShow(cur+1); });
  }
})();
