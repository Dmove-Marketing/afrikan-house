/* Scripts extraídos de bio.html */

if(navigator.userAgent.match(/MSIE|Internet Explorer/i)||navigator.userAgent.match(/Trident\/7\..*?rv:11/i)){var href=document.location.href;if(!href.match(/[?&]noclsop/)){if(href.indexOf("?")==-1){if(href.indexOf("#")==-1){document.location.href=href+"?noclsop=1"}else{document.location.href=href.replace("#","?noclsop=1#")}}else{if(href.indexOf("#")==-1){document.location.href=href+"&noclsop=1"}else{document.location.href=href.replace("#","&noclsop=1#")}}}}

class RocketLazyLoadScripts{constructor(){this.triggerEvents=["keydown","mousedown","mousemove","touchmove","touchstart","touchend","wheel"],this.userEventHandler=this._triggerListener.bind(this),this.touchStartHandler=this._onTouchStart.bind(this),this.touchMoveHandler=this._onTouchMove.bind(this),this.touchEndHandler=this._onTouchEnd.bind(this),this.clickHandler=this._onClick.bind(this),this.interceptedClicks=[],window.addEventListener("pageshow",t=>{this.persisted=t.persisted}),window.addEventListener("DOMContentLoaded",()=>{this._preconnect3rdParties()}),this.delayedScripts={normal:[],async:[],defer:[]},this.trash=[],this.allJQueries=[]}_addUserInteractionListener(t){if(document.hidden){t._triggerListener();return}this.triggerEvents.forEach(e=>window.addEventListener(e,t.userEventHandler,{passive:!0})),window.addEventListener("touchstart",t.touchStartHandler,{passive:!0}),window.addEventListener("mousedown",t.touchStartHandler),document.addEventListener("visibilitychange",t.userEventHandler)}_removeUserInteractionListener(){this.triggerEvents.forEach(t=>window.removeEventListener(t,this.userEventHandler,{passive:!0})),document.removeEventListener("visibilitychange",this.userEventHandler)}_onTouchStart(t){"HTML"!==t.target.tagName&&(window.addEventListener("touchend",this.touchEndHandler),window.addEventListener("mouseup",this.touchEndHandler),window.addEventListener("touchmove",this.touchMoveHandler,{passive:!0}),window.addEventListener("mousemove",this.touchMoveHandler),t.target.addEventListener("click",this.clickHandler),this._renameDOMAttribute(t.target,"onclick","rocket-onclick"),this._pendingClickStarted())}_onTouchMove(t){window.removeEventListener("touchend",this.touchEndHandler),window.removeEventListener("mouseup",this.touchEndHandler),window.removeEventListener("touchmove",this.touchMoveHandler,{passive:!0}),window.removeEventListener("mousemove",this.touchMoveHandler),t.target.removeEventListener("click",this.clickHandler),this._renameDOMAttribute(t.target,"rocket-onclick","onclick"),this._pendingClickFinished()}_onTouchEnd(t){window.removeEventListener("touchend",this.touchEndHandler),window.removeEventListener("mouseup",this.touchEndHandler),window.removeEventListener("touchmove",this.touchMoveHandler,{passive:!0}),window.removeEventListener("mousemove",this.touchMoveHandler)}_onClick(t){t.target.removeEventListener("click",this.clickHandler),this._renameDOMAttribute(t.target,"rocket-onclick","onclick"),this.interceptedClicks.push(t),t.preventDefault(),t.stopPropagation(),t.stopImmediatePropagation(),this._pendingClickFinished()}_replayClicks(){window.removeEventListener("touchstart",this.touchStartHandler,{passive:!0}),window.removeEventListener("mousedown",this.touchStartHandler),this.interceptedClicks.forEach(t=>{t.target.dispatchEvent(new MouseEvent("click",{view:t.view,bubbles:!0,cancelable:!0}))})}_waitForPendingClicks(){return new Promise(t=>{this._isClickPending?this._pendingClickFinished=t:t()})}_pendingClickStarted(){this._isClickPending=!0}_pendingClickFinished(){this._isClickPending=!1}_renameDOMAttribute(t,e,r){t.hasAttribute&&t.hasAttribute(e)&&(event.target.setAttribute(r,event.target.getAttribute(e)),event.target.removeAttribute(e))}_triggerListener(){this._removeUserInteractionListener(this),"loading"===document.readyState?document.addEventListener("DOMContentLoaded",this._loadEverythingNow.bind(this)):this._loadEverythingNow()}_preconnect3rdParties(){let t=[];document.querySelectorAll("script[type=rocketlazyloadscript]").forEach(e=>{if(e.hasAttribute("src")){let r=new URL(e.src).origin;r!==location.origin&&t.push({src:r,crossOrigin:e.crossOrigin||"module"===e.getAttribute("data-rocket-type")})}}),t=[...new Map(t.map(t=>[JSON.stringify(t),t])).values()],this._batchInjectResourceHints(t,"preconnect")}async _loadEverythingNow(){this.lastBreath=Date.now(),this._delayEventListeners(this),this._delayJQueryReady(this),this._handleDocumentWrite(),this._registerAllDelayedScripts(),this._preloadAllScripts(),await this._loadScriptsFromList(this.delayedScripts.normal),await this._loadScriptsFromList(this.delayedScripts.defer),await this._loadScriptsFromList(this.delayedScripts.async);try{await this._triggerDOMContentLoaded(),await this._triggerWindowLoad()}catch(t){console.error(t)}window.dispatchEvent(new Event("rocket-allScriptsLoaded")),this._waitForPendingClicks().then(()=>{this._replayClicks()}),this._emptyTrash()}_registerAllDelayedScripts(){document.querySelectorAll("script[type=rocketlazyloadscript]").forEach(t=>{t.hasAttribute("data-rocket-src")?t.hasAttribute("async")&&!1!==t.async?this.delayedScripts.async.push(t):t.hasAttribute("defer")&&!1!==t.defer||"module"===t.getAttribute("data-rocket-type")?this.delayedScripts.defer.push(t):this.delayedScripts.normal.push(t):this.delayedScripts.normal.push(t)})}async _transformScript(t){return new Promise((await this._littleBreath(),navigator.userAgent.indexOf("Firefox/")>0||""===navigator.vendor)?e=>{let r=document.createElement("script");[...t.attributes].forEach(t=>{let e=t.nodeName;"type"!==e&&("data-rocket-type"===e&&(e="type"),"data-rocket-src"===e&&(e="src"),r.setAttribute(e,t.nodeValue))}),t.text&&(r.text=t.text),r.hasAttribute("src")?(r.addEventListener("load",e),r.addEventListener("error",e)):(r.text=t.text,e());try{t.parentNode.replaceChild(r,t)}catch(i){e()}}:async e=>{function r(){t.setAttribute("data-rocket-status","failed"),e()}try{let i=t.getAttribute("data-rocket-type"),n=t.getAttribute("data-rocket-src");t.text,i?(t.type=i,t.removeAttribute("data-rocket-type")):t.removeAttribute("type"),t.addEventListener("load",function r(){t.setAttribute("data-rocket-status","executed"),e()}),t.addEventListener("error",r),n?(t.removeAttribute("data-rocket-src"),t.src=n):t.src="data:text/javascript;base64,"+btoa(t.text)}catch(s){r()}})}async _loadScriptsFromList(t){let e=t.shift();return e&&e.isConnected?(await this._transformScript(e),this._loadScriptsFromList(t)):Promise.resolve()}_preloadAllScripts(){this._batchInjectResourceHints([...this.delayedScripts.normal,...this.delayedScripts.defer,...this.delayedScripts.async],"preload")}_batchInjectResourceHints(t,e){var r=document.createDocumentFragment();t.forEach(t=>{let i=t.getAttribute&&t.getAttribute("data-rocket-src")||t.src;if(i){let n=document.createElement("link");n.href=i,n.rel=e,"preconnect"!==e&&(n.as="script"),t.getAttribute&&"module"===t.getAttribute("data-rocket-type")&&(n.crossOrigin=!0),t.crossOrigin&&(n.crossOrigin=t.crossOrigin),t.integrity&&(n.integrity=t.integrity),r.appendChild(n),this.trash.push(n)}}),document.head.appendChild(r)}_delayEventListeners(t){let e={};function r(t,r){!function t(r){!e[r]&&(e[r]={originalFunctions:{add:r.addEventListener,remove:r.removeEventListener},eventsToRewrite:[]},r.addEventListener=function(){arguments[0]=i(arguments[0]),e[r].originalFunctions.add.apply(r,arguments)},r.removeEventListener=function(){arguments[0]=i(arguments[0]),e[r].originalFunctions.remove.apply(r,arguments)});function i(t){return e[r].eventsToRewrite.indexOf(t)>=0?"rocket-"+t:t}}(t),e[t].eventsToRewrite.push(r)}function i(t,e){let r=t[e];Object.defineProperty(t,e,{get:()=>r||function(){},set(i){t["rocket"+e]=r=i}})}r(document,"DOMContentLoaded"),r(window,"DOMContentLoaded"),r(window,"load"),r(window,"pageshow"),r(document,"readystatechange"),i(document,"onreadystatechange"),i(window,"onload"),i(window,"onpageshow")}_delayJQueryReady(t){let e;function r(r){if(r&&r.fn&&!t.allJQueries.includes(r)){r.fn.ready=r.fn.init.prototype.ready=function(e){return t.domReadyFired?e.bind(document)(r):document.addEventListener("rocket-DOMContentLoaded",()=>e.bind(document)(r)),r([])};let i=r.fn.on;r.fn.on=r.fn.init.prototype.on=function(){if(this[0]===window){function t(t){return t.split(" ").map(t=>"load"===t||0===t.indexOf("load.")?"rocket-jquery-load":t).join(" ")}"string"==typeof arguments[0]||arguments[0]instanceof String?arguments[0]=t(arguments[0]):"object"==typeof arguments[0]&&Object.keys(arguments[0]).forEach(e=>{delete Object.assign(arguments[0],{[t(e)]:arguments[0][e]})[e]})}return i.apply(this,arguments),this},t.allJQueries.push(r)}e=r}r(window.jQuery),Object.defineProperty(window,"jQuery",{get:()=>e,set(t){r(t)}})}async _triggerDOMContentLoaded(){this.domReadyFired=!0,await this._littleBreath(),document.dispatchEvent(new Event("rocket-DOMContentLoaded")),await this._littleBreath(),window.dispatchEvent(new Event("rocket-DOMContentLoaded")),await this._littleBreath(),document.dispatchEvent(new Event("rocket-readystatechange")),await this._littleBreath(),document.rocketonreadystatechange&&document.rocketonreadystatechange()}async _triggerWindowLoad(){await this._littleBreath(),window.dispatchEvent(new Event("rocket-load")),await this._littleBreath(),window.rocketonload&&window.rocketonload(),await this._littleBreath(),this.allJQueries.forEach(t=>t(window).trigger("rocket-jquery-load")),await this._littleBreath();let t=new Event("rocket-pageshow");t.persisted=this.persisted,window.dispatchEvent(t),await this._littleBreath(),window.rocketonpageshow&&window.rocketonpageshow({persisted:this.persisted})}_handleDocumentWrite(){let t=new Map;document.write=document.writeln=function(e){let r=document.currentScript;r||console.error("WPRocket unable to document.write this: "+e);let i=document.createRange(),n=r.parentElement,s=t.get(r);void 0===s&&(s=r.nextSibling,t.set(r,s));let a=document.createDocumentFragment();i.setStart(a,0),a.appendChild(i.createContextualFragment(e)),n.insertBefore(a,s)}}async _littleBreath(){Date.now()-this.lastBreath>45&&(await this._requestAnimFrame(),this.lastBreath=Date.now())}async _requestAnimFrame(){return document.hidden?new Promise(t=>setTimeout(t)):new Promise(t=>requestAnimationFrame(t))}_emptyTrash(){this.trash.forEach(t=>t.remove())}static run(){let t=new RocketLazyLoadScripts;t._addUserInteractionListener(t)}}RocketLazyLoadScripts.run();

(function(){
  // ===== CONFIG =====
  var FIELD_ID    = 'form-field-fonte'; // id comum no Elementor
  var INTERVAL_MS = 300;                // tenta com mais frequência
  var MAX_TRIES   = 20;                 // dá mais tempo pro GTM/HTML inicializar

  // ===== HELPERS (ES5) =====
  function getCookie(name){
    var m = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([.$?|{}()[\]\\/+^])/g,'\\$1') + '=([^;]*)'));
    return m ? m[1] : ''; // mantém RAW (sem decode aqui)
  }

  // decode seguro (igual à sua estratégia do n8n)
  function safeDecode(v){
    if (v == null) return '';
    var s = String(v).replace(/\+/g, ' ');
    try {
      return decodeURIComponent(s);
    } catch (e) {
      return s; // se quebrar, devolve como veio
    }
  }

  // lê utms padrão a partir de cookies
  function collectUtms(){
    var utms = ['utm_source','utm_medium','utm_campaign','utm_term','utm_content'];
    var out = {}, v, i;
    for (i=0;i<utms.length;i++){
      v = getCookie(utms[i]);
      if (v) out[utms[i]] = v;
    }
    return out;
  }

  function getEventIdFromWindow(){
    try {
      if (window.__page_event_id && typeof window.__page_event_id === 'string') {
        return window.__page_event_id;
      }
    } catch(e){}
    return '';
  }

  function collectParams(){
    var p = {}, v;

    // UTM cookies
    var utmObj = collectUtms();
    for (var k in utmObj){ if (utmObj.hasOwnProperty(k)) p[k] = utmObj[k]; }

    // Click IDs (normaliza __* -> sem __)
    v = getCookie('gclid')  || getCookie('__gclid');  if (v) p.gclid  = v;
    v = getCookie('gbraid') || getCookie('__gbraid'); if (v) p.gbraid = v;
    v = getCookie('wbraid') || getCookie('__wbraid'); if (v) p.wbraid = v;

    // Meta IDs
    v = getCookie('fbclid'); if (v) p.fbclid = v;
    v = getCookie('_fbc');   if (v) p.fbc    = v;
    v = getCookie('_fbp');   if (v) p.fbp    = v;

    // External ID (aceita ambos)
    v = getCookie('external_id') || getCookie('_external_id');
    if (v) p.external_id = v;

    // event_id vindo do GTM/HTML (window.__page_event_id) — não cria, só lê
    v = getEventIdFromWindow();
    if (v) p.event_id = v;

    return p;
  }

  // monta query **decodificada** (sem encodeURIComponent em chave/valor)
  function toQuery(params){
    var pairs = [];
    for (var key in params){
      if (!params.hasOwnProperty(key)) continue;
      var val = params[key];
      if (val !== undefined && val !== null && val !== '') {
        // aplica safeDecode em CADA valor individual
        pairs.push(key + '=' + safeDecode(String(val)));
      }
    }
    return pairs.join('&');
  }

  // ===== Seleciona TODOS os inputs "Fonte" (página + popups) =====
  function findFonteInputs(){
    var list = [];
    try {
      // 1) pelo id padrão
      var byId = document.querySelectorAll('#' + CSS.escape(FIELD_ID));
      if (byId && byId.length) list = list.concat([].slice.call(byId));

      // 2) pelo name padrão do Elementor (form_fields[fonte])
      var byName = document.querySelectorAll('input[name="form_fields[fonte]"], textarea[name="form_fields[fonte]"]');
      if (byName && byName.length) list = list.concat([].slice.call(byName));

      // 3) pelo sufixo do name (caso o form renomeie com prefixos)
      var byNameSuffix = document.querySelectorAll('input[name$="[fonte]"], textarea[name$="[fonte]"]');
      if (byNameSuffix && byNameSuffix.length) list = list.concat([].slice.call(byNameSuffix));

      // 4) por atributo data-field-shortcode (algumas versões/temas)
      var byShortcode = document.querySelectorAll('[data-field-shortcode="fonte"]');
      if (byShortcode && byShortcode.length) list = list.concat([].slice.call(byShortcode));

      // Remove duplicados
      var seen = new Set();
      list = list.filter(function(el){
        if (!el || !el.nodeType) return false;
        if (seen.has(el)) return false;
        seen.add(el);
        return true;
      });
    } catch(e){}
    return list;
  }

  // Aplica em TODOS os campos "Fonte": preserva prefixo (antes de '?') e substitui a query inteira (já decodificada)
  function applyWith(params){
    var inputs = findFonteInputs();
    var qs = toQuery(params);
    var hasEventId = !!params.event_id;
    var hasAny = !!qs;

    if (!inputs.length) return { hasAny: hasAny, hasEventId: hasEventId, updated: 0 };

    var updated = 0;
    for (var i=0;i<inputs.length;i++){
      var el = inputs[i];
      var base = String(el.value || '');
      var qpos = base.indexOf('?');
      var prefix = qpos === -1 ? base : base.slice(0, qpos);
      var newVal = prefix + (qs ? '?' + qs : '');
      if (el.value !== newVal){
        el.value = newVal;
        updated++;
        try {
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));
        } catch(e){}
      }
    }

    return { hasAny: hasAny, hasEventId: hasEventId, updated: updated };
  }

  function runWithRetries(){
    var tries = 0;

    function tick(){
      var params = collectParams();
      var flags = applyWith(params);
      tries++;

      var shouldStop = flags.hasEventId || tries >= MAX_TRIES;
      if (!shouldStop){
        setTimeout(tick, INTERVAL_MS);
      }
    }

    // Reaplica quando o GTM/HTML empurrar 'page_event_id_ready'
    try {
      window.dataLayer = window.dataLayer || [];
      var origPush = window.dataLayer.push;
      window.dataLayer.push = function(){
        var res = origPush.apply(this, arguments);
        try {
          var arg = arguments[0] || {};
          if (arg && arg.event === 'page_event_id_ready') {
            var params = collectParams();
            applyWith(params);
          }
        } catch(e){}
        return res;
      };
    } catch(e){}

    // Reaplica quando o Elementor abrir popup
    try {
      if (window.jQuery) {
        window.jQuery(window).on('elementor/popup/show', function(){
          var params = collectParams();
          applyWith(params);
        });
      }
      document.addEventListener('elementor/popup/show', function(){
        var params = collectParams();
        applyWith(params);
      }, true);
    } catch(e){}

    // Fallback: observar mutações de DOM (inserção do popup)
    try {
      var mo = new MutationObserver(function(){
        var params = collectParams();
        applyWith(params);
      });
      mo.observe(document.documentElement || document.body, { childList: true, subtree: true });
      setTimeout(function(){ try{ mo.disconnect(); }catch(e){} }, 20000);
    } catch(e){}

    tick();
  }

  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', runWithRetries);
  } else {
    runWithRetries();
  }
})();

const lazyloadRunObserver = () => {
					const lazyloadBackgrounds = document.querySelectorAll( `.e-con.e-parent:not(.e-lazyloaded)` );
					const lazyloadBackgroundObserver = new IntersectionObserver( ( entries ) => {
						entries.forEach( ( entry ) => {
							if ( entry.isIntersecting ) {
								let lazyloadBackground = entry.target;
								if( lazyloadBackground ) {
									lazyloadBackground.classList.add( 'e-lazyloaded' );
								}
								lazyloadBackgroundObserver.unobserve( entry.target );
							}
						});
					}, { rootMargin: '200px 0px 200px 0px' } );
					lazyloadBackgrounds.forEach( ( lazyloadBackground ) => {
						lazyloadBackgroundObserver.observe( lazyloadBackground );
					} );
				};
				const events = [
					'DOMContentLoaded',
					'elementor/lazyload/observe',
				];
				events.forEach( ( event ) => {
					document.addEventListener( event, lazyloadRunObserver );
				} );

var elementorFrontendConfig = {"environmentMode":{"edit":false,"wpPreview":false,"isScriptDebug":false},"i18n":{"shareOnFacebook":"Compartilhar no Facebook","shareOnTwitter":"Compartilhar no Twitter","pinIt":"Fixar","download":"Baixar","downloadImage":"Baixar imagem","fullscreen":"Tela cheia","zoom":"Zoom","share":"Compartilhar","playVideo":"Reproduzir v\u00eddeo","previous":"Anterior","next":"Pr\u00f3ximo","close":"Fechar","a11yCarouselPrevSlideMessage":"Slide anterior","a11yCarouselNextSlideMessage":"Pr\u00f3ximo slide","a11yCarouselFirstSlideMessage":"Este \u00e9 o primeiro slide","a11yCarouselLastSlideMessage":"Este \u00e9 o \u00faltimo slide","a11yCarouselPaginationBulletMessage":"Ir para o slide"},"is_rtl":false,"breakpoints":{"xs":0,"sm":480,"md":768,"lg":1025,"xl":1440,"xxl":1600},"responsive":{"breakpoints":{"mobile":{"label":"Dispositivos m\u00f3veis no modo retrato","value":767,"default_value":767,"direction":"max","is_enabled":true},"mobile_extra":{"label":"Dispositivos m\u00f3veis no modo paisagem","value":880,"default_value":880,"direction":"max","is_enabled":false},"tablet":{"label":"Tablet no modo retrato","value":1024,"default_value":1024,"direction":"max","is_enabled":true},"tablet_extra":{"label":"Tablet no modo paisagem","value":1200,"default_value":1200,"direction":"max","is_enabled":false},"laptop":{"label":"Notebook","value":1366,"default_value":1366,"direction":"max","is_enabled":false},"widescreen":{"label":"Tela ampla (widescreen)","value":2400,"default_value":2400,"direction":"min","is_enabled":false}},"hasCustomBreakpoints":false},"version":"3.35.7","is_static":false,"experimentalFeatures":{"additional_custom_breakpoints":true,"container":true,"theme_builder_v2":true,"hello-theme-header-footer":true,"nested-elements":true,"home_screen":true,"global_classes_should_enforce_capabilities":true,"e_variables":true,"cloud-library":true,"e_opt_in_v4_page":true,"e_components":true,"e_interactions":true,"e_editor_one":true,"import-export-customization":true,"e_pro_variables":true},"urls":{"assets":"https:\/\/eventos.afrikanhouse.com.br\/wp-content\/plugins\/elementor\/assets\/","ajaxurl":"https:\/\/eventos.afrikanhouse.com.br\/wp-admin\/admin-ajax.php","uploadUrl":"https:\/\/eventos.afrikanhouse.com.br\/wp-content\/uploads"},"nonces":{"floatingButtonsClickTracking":"be6f234304"},"swiperClass":"swiper","settings":{"page":[],"editorPreferences":[]},"kit":{"active_breakpoints":["viewport_mobile","viewport_tablet"],"global_image_lightbox":"yes","lightbox_enable_counter":"yes","lightbox_enable_fullscreen":"yes","lightbox_enable_zoom":"yes","lightbox_enable_share":"yes","lightbox_title_src":"title","lightbox_description_src":"description","hello_header_logo_type":"title","hello_footer_logo_type":"logo"},"post":{"id":265,"title":"BIO%20%E2%80%93%20Afrikan%20House","excerpt":"","featuredImage":false}};
//# sourceURL=elementor-frontend-js-before

wp.i18n.setLocaleData( { 'text direction\u0004ltr': [ 'ltr' ] } );
//# sourceURL=wp-i18n-js-after

var ElementorProFrontendConfig = {"ajaxurl":"https:\/\/eventos.afrikanhouse.com.br\/wp-admin\/admin-ajax.php","nonce":"9abea44083","urls":{"assets":"https:\/\/eventos.afrikanhouse.com.br\/wp-content\/plugins\/elementor-pro\/assets\/","rest":"https:\/\/eventos.afrikanhouse.com.br\/wp-json\/"},"settings":{"lazy_load_background_images":true},"popup":{"hasPopUps":false},"shareButtonsNetworks":{"facebook":{"title":"Facebook","has_counter":true},"twitter":{"title":"Twitter"},"linkedin":{"title":"LinkedIn","has_counter":true},"pinterest":{"title":"Pinterest","has_counter":true},"reddit":{"title":"Reddit","has_counter":true},"vk":{"title":"VK","has_counter":true},"odnoklassniki":{"title":"OK","has_counter":true},"tumblr":{"title":"Tumblr"},"digg":{"title":"Digg"},"skype":{"title":"Skype"},"stumbleupon":{"title":"StumbleUpon","has_counter":true},"mix":{"title":"Mix"},"telegram":{"title":"Telegram"},"pocket":{"title":"Pocket","has_counter":true},"xing":{"title":"XING","has_counter":true},"whatsapp":{"title":"WhatsApp"},"email":{"title":"Email"},"print":{"title":"Print"},"x-twitter":{"title":"X"},"threads":{"title":"Threads"}},"facebook_sdk":{"lang":"pt_BR","app_id":""},"lottie":{"defaultAnimationUrl":"https:\/\/eventos.afrikanhouse.com.br\/wp-content\/plugins\/elementor-pro\/modules\/lottie\/assets\/animations\/default.json"}};
//# sourceURL=elementor-pro-frontend-js-before

var CCFEFCustomData = {"pluginDir":"https://eventos.afrikanhouse.com.br/wp-content/plugins/country-code-field-for-elementor-form/","errorMap":["The phone number you entered is not valid. Please check the format and try again.","The country code you entered is not recognized. Please ensure it is correct and try again.","The phone number you entered is too short. Please enter a complete phone number, including the country code.","The phone number you entered is too long. Please ensure it is in the correct format and try again.","The phone number you entered is not valid. Please check the format and try again."]};
//# sourceURL=ccfef-country-code-script-js-extra

var CCFEFCustomData = {"pluginDir":"https://eventos.afrikanhouse.com.br/wp-content/plugins/country-code-field-for-elementor-form/","errorMap":["The phone number you entered is not valid. Please check the format and try again.","The country code you entered is not recognized. Please ensure it is correct and try again.","The phone number you entered is too short. Please enter a complete phone number, including the country code.","The phone number you entered is too long. Please ensure it is in the correct format and try again.","The phone number you entered is not valid. Please check the format and try again."]};
//# sourceURL=ccfef-country-code-script-hello-js-extra

function inicializarCalendariosPersonalizados() {
const portugueseLocale = {
weekdays: { shorthand: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"], longhand: ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"] },
months: { shorthand: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"], longhand: ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"] },
firstDayOfWeek: 1,
rangeSeparator: " até ",
ordinal: () => "º"
};

const camposDeData = document.querySelectorAll('input[name="form_fields[data]"]');

camposDeData.forEach(function(campo) {
    if (campo._flatpickr) {
        // Se já tem um calendário, não faz nada para não criar loops.
        return;
    }
    flatpickr(campo, {
        "disableMobile": true,
        "dateFormat": "d/m/Y",
        "locale": portugueseLocale
    });
});

}

// Gatilho para o carregamento inicial da página
window.addEventListener('load', inicializarCalendariosPersonalizados);

// --- NOVO GATILHO UNIVERSAL ---
// Cria um "vigia" que executa a nossa função sempre que novos elementos
// são adicionados à página (como um popup ou widget de chat).
const observer = new MutationObserver(function(mutations) {
// Para evitar execuções múltiplas e desnecessárias, esperamos um instante.
let timer;
clearTimeout(timer);
timer = setTimeout(inicializarCalendariosPersonalizados, 200);
});

// Coloca o "vigia" a observar o corpo inteiro do site.
observer.observe(document.body, {
childList: true,
subtree: true
});

window.lazyLoadOptions=[{elements_selector:"img[data-lazy-src],.rocket-lazyload,iframe[data-lazy-src]",data_src:"lazy-src",data_srcset:"lazy-srcset",data_sizes:"lazy-sizes",class_loading:"lazyloading",class_loaded:"lazyloaded",threshold:300,callback_loaded:function(element){if(element.tagName==="IFRAME"&&element.dataset.rocketLazyload=="fitvidscompatible"){if(element.classList.contains("lazyloaded")){if(typeof window.jQuery!="undefined"){if(jQuery.fn.fitVids){jQuery(element).parent().fitVids()}}}}}},{elements_selector:".rocket-lazyload",data_src:"lazy-src",data_srcset:"lazy-srcset",data_sizes:"lazy-sizes",class_loading:"lazyloading",class_loaded:"lazyloaded",threshold:300,}];window.addEventListener('LazyLoad::Initialized',function(e){var lazyLoadInstance=e.detail.instance;if(window.MutationObserver){var observer=new MutationObserver(function(mutations){var image_count=0;var iframe_count=0;var rocketlazy_count=0;mutations.forEach(function(mutation){for(var i=0;i<mutation.addedNodes.length;i++){if(typeof mutation.addedNodes[i].getElementsByTagName!=='function'){continue}
if(typeof mutation.addedNodes[i].getElementsByClassName!=='function'){continue}
images=mutation.addedNodes[i].getElementsByTagName('img');is_image=mutation.addedNodes[i].tagName=="IMG";iframes=mutation.addedNodes[i].getElementsByTagName('iframe');is_iframe=mutation.addedNodes[i].tagName=="IFRAME";rocket_lazy=mutation.addedNodes[i].getElementsByClassName('rocket-lazyload');image_count+=images.length;iframe_count+=iframes.length;rocketlazy_count+=rocket_lazy.length;if(is_image){image_count+=1}
if(is_iframe){iframe_count+=1}}});if(image_count>0||iframe_count>0||rocketlazy_count>0){lazyLoadInstance.update()}});var b=document.getElementsByTagName("body")[0];var config={childList:!0,subtree:!0};observer.observe(b,config)}},!1)

function lazyLoadThumb(e){var t='<img data-lazy-src="https://i.ytimg.com/vi/ID/hqdefault.jpg" alt="" width="480" height="360"><noscript><img src="https://i.ytimg.com/vi/ID/hqdefault.jpg" alt="" width="480" height="360"></noscript>',a='<button class="play" aria-label="play Youtube video"></button>';return t.replace("ID",e)+a}function lazyLoadYoutubeIframe(){var e=document.createElement("iframe"),t="ID?autoplay=1";t+=0===this.parentNode.dataset.query.length?'':'&'+this.parentNode.dataset.query;e.setAttribute("src",t.replace("ID",this.parentNode.dataset.src)),e.setAttribute("frameborder","0"),e.setAttribute("allowfullscreen","1"),e.setAttribute("allow", "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"),this.parentNode.parentNode.replaceChild(e,this.parentNode)}document.addEventListener("DOMContentLoaded",function(){var e,t,p,a=document.getElementsByClassName("rll-youtube-player");for(t=0;t<a.length;t++)e=document.createElement("div"),e.setAttribute("data-id",a[t].dataset.id),e.setAttribute("data-query", a[t].dataset.query),e.setAttribute("data-src", a[t].dataset.src),e.innerHTML=lazyLoadThumb(a[t].dataset.id),a[t].appendChild(e),p=e.querySelector('.play'),p.onclick=lazyLoadYoutubeIframe});

class RocketElementorAnimation{constructor(){this.deviceMode=document.createElement("span"),this.deviceMode.id="elementor-device-mode",this.deviceMode.setAttribute("class","elementor-screen-only"),document.body.appendChild(this.deviceMode)}_detectAnimations(){let t=getComputedStyle(this.deviceMode,":after").content.replace(/"/g,"");this.animationSettingKeys=this._listAnimationSettingsKeys(t),document.querySelectorAll(".elementor-invisible[data-settings]").forEach(t=>{const e=t.getBoundingClientRect();if(e.bottom>=0&&e.top<=window.innerHeight)try{this._animateElement(t)}catch(t){}})}_animateElement(t){const e=JSON.parse(t.dataset.settings),i=e._animation_delay||e.animation_delay||0,n=e[this.animationSettingKeys.find(t=>e[t])];if("none"===n)return void t.classList.remove("elementor-invisible");t.classList.remove(n),this.currentAnimation&&t.classList.remove(this.currentAnimation),this.currentAnimation=n;let s=setTimeout(()=>{t.classList.remove("elementor-invisible"),t.classList.add("animated",n),this._removeAnimationSettings(t,e)},i);window.addEventListener("rocket-startLoading",function(){clearTimeout(s)})}_listAnimationSettingsKeys(t="mobile"){const e=[""];switch(t){case"mobile":e.unshift("_mobile");case"tablet":e.unshift("_tablet");case"desktop":e.unshift("_desktop")}const i=[];return["animation","_animation"].forEach(t=>{e.forEach(e=>{i.push(t+e)})}),i}_removeAnimationSettings(t,e){this._listAnimationSettingsKeys().forEach(t=>delete e[t]),t.dataset.settings=JSON.stringify(e)}static run(){const t=new RocketElementorAnimation;requestAnimationFrame(t._detectAnimations.bind(t))}}document.addEventListener("DOMContentLoaded",RocketElementorAnimation.run);