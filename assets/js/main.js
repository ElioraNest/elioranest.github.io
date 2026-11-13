/* =========================================================
   ElioraNest — skrip utama: bahasa, menu, Start here, tombol ke atas
   ========================================================= */
(function(){
  var root = document.documentElement;
  var nav = document.getElementById('mainNav');
  var toggle = document.getElementById('mobileToggle');
  var langSelect = document.getElementById('langSelect');

  var TEXT = {
    en:{ open:'Open menu', close:'Close menu', nav:'Main navigation', lang:'Language', top:'Back to top', sub:'Open submenu' },
    id:{ open:'Buka menu', close:'Tutup menu', nav:'Navigasi utama', lang:'Bahasa', top:'Kembali ke atas', sub:'Buka submenu' },
    fa:{ open:'باز کردن فهرست', close:'بستن فهرست', nav:'پیمایش اصلی', lang:'زبان', top:'بازگشت به بالا', sub:'باز کردن زیرفهرست' },
    zh:{ open:'打开菜单', close:'关闭菜单', nav:'主导航', lang:'语言', top:'回到顶部', sub:'打开子菜单' }
  };
  var LANGTAG = { en:'en', id:'id', fa:'fa-AF', zh:'zh-Hans' };

  function currentLang(){
    var l = root.getAttribute('data-lang');
    return TEXT[l] ? l : 'en';
  }

  function applyLabels(){
    var t = TEXT[currentLang()];
    if(nav){ nav.setAttribute('aria-label', t.nav); }
    if(langSelect){ langSelect.setAttribute('aria-label', t.lang); }
    if(toggle && nav){ toggle.setAttribute('aria-label', nav.classList.contains('mobile-open') ? t.close : t.open); }
    var tt = document.getElementById('toTop');
    if(tt){ tt.setAttribute('aria-label', t.top); }
    var subs = document.querySelectorAll('.sub-toggle');
    for(var i = 0; i < subs.length; i++){ subs[i].setAttribute('aria-label', t.sub); }
  }

  /* Halaman renungan yang punya tombol bahasa sendiri (radio lang-en, lang-id, ...) ikut disamakan */
  function syncPageToggles(l){
    var r = document.getElementById('lang-' + l);
    if(!r || r.type !== 'radio'){ r = document.getElementById(l === 'id' ? 'lang-id' : 'lang-en'); }
    if(r && r.type === 'radio'){ r.checked = true; }
  }

  function setLang(l, fromPage){
    if(!TEXT[l]){ l = 'en'; }
    root.setAttribute('data-lang', l);
    root.setAttribute('lang', LANGTAG[l]);
    try{ localStorage.setItem('elioraLang', l); }catch(e){}
    if(langSelect){ langSelect.value = l; }
    if(!fromPage){ syncPageToggles(l); }
    applyLabels();
  }

  if(langSelect){
    langSelect.addEventListener('change', function(){ setLang(this.value, false); });
  }
  document.addEventListener('change', function(e){
    var t = e.target;
    if(t && t.type === 'radio' && /^lang-(en|id|fa|zh)$/.test(t.id)){ setLang(t.id.slice(5), true); }
  });

  /* ---------- Menu HP: akordeon untuk submenu ---------- */
  if(nav){
    var here = location.pathname.replace(/\/(index\.html)?$/, '') || '/';
    var items = nav.querySelectorAll('.submenu-item');
    for(var n = 0; n < items.length; n++){
      var it = items[n], menu = null;
      for(var c = 0; c < it.children.length; c++){
        if(it.children[c].classList.contains('dropdown-menu')){ menu = it.children[c]; }
      }
      if(!menu){ continue; }
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'sub-toggle';
      b.setAttribute('aria-expanded', 'false');
      it.insertBefore(b, menu);
    }
    nav.classList.add('acc');
    nav.addEventListener('click', function(e){
      var t = e.target.closest ? e.target.closest('.sub-toggle') : null;
      if(!t){ return; }
      var on = t.parentNode.classList.toggle('expanded');
      t.setAttribute('aria-expanded', on ? 'true' : 'false');
    });

    /* Tandai menu halaman yang sedang dibuka */
    var links = nav.querySelectorAll('a.nav-link');
    for(var i = 0; i < links.length; i++){
      var p = links[i].pathname.replace(/\/(index\.html)?$/, '') || '/';
      if(links[i].hostname === location.hostname && p === here){ links[i].setAttribute('aria-current', 'page'); }
    }
  }

  function setOpen(open){
    if(!nav || !toggle){ return; }
    nav.classList.toggle('mobile-open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    applyLabels();
  }
  if(toggle){
    toggle.addEventListener('click', function(){ setOpen(!nav.classList.contains('mobile-open')); });
  }

  /* Tablet layar lebar (tanpa hover): ketukan pertama membuka anak menu, ketukan kedua membuka halaman */
  function touchDesktop(){
    return window.matchMedia && window.matchMedia('(min-width:1367px)').matches && window.matchMedia('(hover:none)').matches;
  }
  function closeAll(except){
    if(!nav){ return; }
    var opened = nav.querySelectorAll('.open');
    for(var k = 0; k < opened.length; k++){
      if(except && (opened[k] === except || opened[k].contains(except))){ continue; }
      opened[k].classList.remove('open');
    }
  }
  if(nav){
    nav.addEventListener('click', function(e){
      if(!touchDesktop()){ return; }
      var a = e.target.closest ? e.target.closest('a') : null;
      if(!a){ return; }
      var item = a.parentNode;
      var isItem = item.classList.contains('nav-item') || item.classList.contains('submenu-item');
      if(isItem && item.querySelector(':scope > .dropdown-menu') && !item.classList.contains('open')){
        e.preventDefault();
        closeAll(item);
        item.classList.add('open');
      }
    });
  }

  /* ---------- Start here ---------- */
  var ctaBtn = document.getElementById('ctaBtn');
  var ctaPanel = document.getElementById('ctaPanel');
  function setCta(o){
    if(!ctaBtn || !ctaPanel){ return; }
    ctaPanel.hidden = !o;
    ctaBtn.setAttribute('aria-expanded', o ? 'true' : 'false');
  }
  if(ctaBtn && ctaPanel){
    ctaBtn.addEventListener('click', function(e){ e.stopPropagation(); setCta(ctaPanel.hidden); });
  }

  document.addEventListener('click', function(e){
    if(nav && !nav.contains(e.target)){ closeAll(null); }
    if(ctaPanel && !ctaPanel.hidden && !ctaPanel.contains(e.target) && e.target !== ctaBtn){ setCta(false); }
  });
  document.addEventListener('keydown', function(e){
    if(e.key !== 'Escape'){ return; }
    setOpen(false);
    closeAll(null);
    if(ctaPanel && !ctaPanel.hidden){ setCta(false); ctaBtn.focus(); }
  });

  /* ---------- Tombol kembali ke atas ---------- */
  var toTop = document.getElementById('toTop');
  if(toTop){
    window.addEventListener('scroll', function(){
      toTop.classList.toggle('show', (window.pageYOffset || root.scrollTop) > 500);
    }, { passive:true });
    toTop.addEventListener('click', function(){ window.scrollTo({ top:0, behavior:'smooth' }); });
  }

  /* ---------- Logo: bila logo.jpg belum ada, tampilkan huruf E ---------- */
  var logos = document.querySelectorAll('.brand-logo img');
  for(var g = 0; g < logos.length; g++){
    (function(img){
      function fail(){ img.parentNode.textContent = 'E'; }
      if(img.complete && img.naturalWidth === 0){ fail(); }
      else { img.addEventListener('error', fail); }
    })(logos[g]);
  }

  /* ---------- Tahun di footer ---------- */
  var yr = document.getElementById('year');
  if(yr){ yr.textContent = new Date().getFullYear(); }

  setLang(currentLang(), false);
})();
