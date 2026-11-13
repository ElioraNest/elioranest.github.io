/* Pemutar musik ElioraNest: lanjut dari posisi terakhir di setiap halaman. Daftar lagu ada di TRACKS. */
    (function(){
      /* ISI LAGU DI SINI. Contoh:
         { title:'Judul Lagu', id:'ID_FILE_GOOGLE_DRIVE' }   atau   { title:'Judul Lagu', src:'https://.../lagu.mp3' } */
      var TRACKS = [
        { title:'Abide in Me', src:'https://cdn.jsdelivr.net/gh/ElioraNest/music@main/Abide%20in%20Me.mp3' },
        { title:'Bringing Heaven to Earth', src:'https://cdn.jsdelivr.net/gh/ElioraNest/music@main/Bringing%20Heaven%20to%20Earth.mp3' },
        { title:'Glory to Yahweh', src:'https://cdn.jsdelivr.net/gh/ElioraNest/music@main/Glory%20to%20Yahweh.mp3' },
        { title:'Here I Am, Yahweh, Send Me!', src:'https://cdn.jsdelivr.net/gh/ElioraNest/music@main/Here%20I%20Am%2C%20Yahweh%2C%20Send%20Me%21.mp3' },
        { title:'Let Your Kingdom Come', src:'https://cdn.jsdelivr.net/gh/ElioraNest/music@main/Let%20Your%20Kingdom%20Come.mp3' },
        { title:'The Everlasting Gift', src:'https://cdn.jsdelivr.net/gh/ElioraNest/music@main/The%20Everlasting%20Gift.mp3' },
        { title:'Till Your Kingdom Fills the Earth (With Chinese Translation)', src:'https://cdn.jsdelivr.net/gh/ElioraNest/music@main/Till%20Your%20Kingdom%20Fills%20the%20Earth%20%28With%20Chinese%20Translation%29.mp3' },
        { title:'Your Word Within My Heart', src:'https://cdn.jsdelivr.net/gh/ElioraNest/music@main/Your%20Word%20Within%20My%20Heart.mp3' },
        { title:'Your Word will not return empty', src:'https://cdn.jsdelivr.net/gh/ElioraNest/music@main/Your%20Word%20will%20not%20return%20empty.mp3' }
      ];
      if(!TRACKS.length){ return; }

      var KEY = 'elioraMusic';
      var LABELS = {
        en:{ play:'Play music', pause:'Pause music', next:'Next song', fail:'Music unavailable', wTitle:'Welcome to ElioraNest', wText:'A quiet place to reflect on God\u2019s Word. Would you like quiet background music while you read?', wMusic:'Enter with music', wNo:'Enter without music' },
        id:{ play:'Putar musik', pause:'Jeda musik', next:'Lagu berikutnya', fail:'Musik tidak bisa dimuat', wTitle:'Selamat datang di ElioraNest', wText:'Tempat yang tenang untuk merenungkan Firman Allah. Mau ditemani musik pelan saat membaca?', wMusic:'Masuk dengan musik', wNo:'Masuk tanpa musik' },
        fa:{ play:'پخش موسیقی', pause:'توقف موسیقی', next:'آهنگ بعدی', fail:'موسیقی بارگذاری نشد', wTitle:'به ElioraNest خوش آمدید', wText:'جایی آرام برای تأمل در کلام خدا. آیا می\u200cخواهید هنگام خواندن موسیقی آرام پخش شود؟', wMusic:'ورود با موسیقی', wNo:'ورود بدون موسیقی' },
        zh:{ play:'播放音乐', pause:'暂停音乐', next:'下一首', fail:'音乐无法加载', wTitle:'欢迎来到 ElioraNest', wText:'这里是静心默想神话语的地方。阅读时，您愿意听轻柔的背景音乐吗？', wMusic:'伴着音乐进入', wNo:'不听音乐进入' }
      };

      function load(){ try{ return JSON.parse(localStorage.getItem(KEY)) || {}; }catch(e){ return {}; } }
      function save(o){ try{ localStorage.setItem(KEY, JSON.stringify(o)); }catch(e){} }
      function lang(){ return document.documentElement.getAttribute('data-lang') || 'en'; }
      function L(k){ return (LABELS[lang()] || LABELS.en)[k]; }

      var st = load();
      var idx = Math.min(Math.max(parseInt(st.i, 10) || 0, 0), TRACKS.length - 1);
      var wantPlay = st.p !== false;
      var welcome = st.w;            /* 'music' | 'mute' | undefined (belum memilih) */
      var WELCOME_SHOW = 'always';   /* 'always' = muncul di setiap halaman yang dibuka, 'once' = hanya sekali per pengunjung */
      var WELCOME_MODE = 'card';     /* 'card' = layar sambutan di tengah, 'bar' = pita kecil di bawah */
      var audio = new Audio();
      audio.preload = 'none';
      audio.volume = (typeof st.v === 'number') ? st.v : 0.6;

      function srcOf(t){ return t.src ? t.src : 'https://drive.usercontent.google.com/download?id=' + t.id + '&export=download&confirm=t'; }

      function setTrack(i, time){
        idx = i;
        audio.src = srcOf(TRACKS[i]);
        if(time){
          var seek = function(){ try{ audio.currentTime = time; }catch(e){} audio.removeEventListener('loadedmetadata', seek); };
          audio.addEventListener('loadedmetadata', seek);
        }
        draw();
      }

      /* Tampilan */
      var css = '#elioraMusic{position:fixed;left:16px;bottom:16px;z-index:900;display:flex;align-items:center;gap:4px;background:#faf8f2;border:1px solid #ddd5c8;box-shadow:0 10px 26px rgba(48,45,40,.12);font-family:Inter,Arial,sans-serif;max-width:calc(100vw - 32px)}'
        + '#elioraMusic button{width:44px;height:44px;border:0;background:transparent;color:#79643a;cursor:pointer;font-size:17px;line-height:1}'
        + '#elioraMusic button:hover{background:#f3eee4}'
        + '#elioraMusic .em-title{font-size:12px;letter-spacing:.04em;color:#514c44;max-width:170px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;padding:0 12px 0 2px}'
        + '#elioraMusic.on .em-icon{animation:emPulse 1.6s ease-in-out infinite}'
        + '@keyframes emPulse{0%,100%{opacity:1}50%{opacity:.45}}'
        + '@media(max-width:480px){#elioraMusic .em-title{display:none}}';
      var style = document.createElement('style');
      style.textContent = css;
      document.head.appendChild(style);

      var box = document.createElement('div');
      box.id = 'elioraMusic';
      box.innerHTML = '<button type="button" class="em-play"><span class="em-icon">♪</span></button>'
        + '<span class="em-title"></span>'
        + (TRACKS.length > 1 ? '<button type="button" class="em-next">⏭</button>' : '');
      document.body.appendChild(box);

      var btnPlay = box.querySelector('.em-play');
      var btnNext = box.querySelector('.em-next');
      var titleEl = box.querySelector('.em-title');

      function draw(){
        var playing = !audio.paused;
        box.className = playing ? 'on' : '';
        btnPlay.setAttribute('aria-label', playing ? L('pause') : L('play'));
        btnPlay.title = playing ? L('pause') : L('play');
        btnPlay.firstChild.textContent = playing ? '❚❚' : '♪';
        if(btnNext){ btnNext.setAttribute('aria-label', L('next')); btnNext.title = L('next'); }
        titleEl.textContent = TRACKS[idx].title || '';
      }

      /* Autoplay: browser mewajibkan satu sentuhan pengunjung, jadi tunggu sentuhan pertama bila diblokir */
      var waiting = false;
      function tryPlay(){
        if(!wantPlay){ draw(); return; }
        var pr = audio.play();
        if(pr && pr.then){
          pr.then(draw).catch(function(){
            if(waiting){ return; }
            waiting = true;
            var go = function(){
              ['click', 'touchstart', 'keydown'].forEach(function(ev){ document.removeEventListener(ev, go, true); });
              waiting = false;
              if(wantPlay){ audio.play().then(draw).catch(draw); }
            };
            ['click', 'touchstart', 'keydown'].forEach(function(ev){ document.addEventListener(ev, go, true); });
            draw();
          });
        }
      }

      function persist(){
        save({ i: idx, t: audio.currentTime || 0, p: wantPlay, v: audio.volume, w: welcome });
      }

      btnPlay.addEventListener('click', function(e){
        e.stopPropagation();
        if(audio.paused){ wantPlay = true; audio.play().then(draw).catch(draw); }
        else { wantPlay = false; audio.pause(); }
        draw(); persist();
      });
      if(btnNext){
        btnNext.addEventListener('click', function(e){
          e.stopPropagation();
          wantPlay = true;
          setTrack((idx + 1) % TRACKS.length, 0);
          audio.play().then(draw).catch(draw);
          persist();
        });
      }
      audio.addEventListener('ended', function(){
        setTrack((idx + 1) % TRACKS.length, 0);
        audio.play().then(draw).catch(draw);
      });
      audio.addEventListener('play', draw);
      audio.addEventListener('pause', draw);
      var errCount = 0;
      audio.addEventListener('error', function(){
        errCount++;
        if(errCount >= TRACKS.length){ titleEl.textContent = '\u26A0 ' + L('fail'); return; }
        if(TRACKS.length > 1){ setTrack((idx + 1) % TRACKS.length, 0); tryPlay(); }
      });
      audio.addEventListener('playing', function(){ errCount = 0; });

      setInterval(persist, 1000);
      window.addEventListener('pagehide', persist);
      window.addEventListener('beforeunload', persist);
      var sel = document.getElementById('langSelect');
      if(sel){ sel.addEventListener('change', function(){ setTimeout(draw, 50); }); }


      /* ===== LAYAR SAMBUTAN: satu klik pengunjung = izin resmi browser untuk memutar musik ===== */
      var wbox = null;
      function drawWelcome(){
        if(!wbox){ return; }
        wbox.setAttribute('dir', lang() === 'fa' ? 'rtl' : 'ltr');
        wbox.querySelector('.ew-title').textContent = L('wTitle');
        wbox.querySelector('.ew-text').textContent = L('wText');
        wbox.querySelector('.ew-yes').textContent = L('wMusic');
        wbox.querySelector('.ew-no').textContent = L('wNo');
      }
      function closeWelcome(choice){
        welcome = choice;
        if(choice === 'music'){
          wantPlay = true;
          if(!audio.getAttribute('src')){ setTrack(idx, st.i === idx ? (parseFloat(st.t) || 0) : 0); }
          audio.play().then(draw).catch(draw);
        } else {
          wantPlay = false;
          audio.pause();
        }
        persist();
        draw();
        if(wbox && wbox.parentNode){ wbox.parentNode.removeChild(wbox); }
        document.removeEventListener('keydown', onWelcomeKey, true);
        wbox = null;
      }
      function onWelcomeKey(e){ if(e.key === 'Escape'){ closeWelcome('mute'); } }
      function showWelcome(){
        var wcss = '#elioraWelcome{position:fixed;inset:0;z-index:1100;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(48,45,40,.5);font-family:Cormorant Garamond,Georgia,serif}'
          + '#elioraWelcome .ew-card{width:100%;max-width:440px;background:#faf8f2;border:1px solid #ddd5c8;border-top:3px solid #a68a52;padding:36px 30px 30px;text-align:center;box-shadow:0 24px 60px rgba(48,45,40,.25)}'
          + '#elioraWelcome .ew-title{font-size:32px;line-height:1.15;font-weight:500;color:#302d28;margin:0 0 14px}'
          + '#elioraWelcome .ew-text{font-size:19px;line-height:1.6;color:#6f685d;margin:0 0 26px}'
          + '#elioraWelcome button{display:block;width:100%;min-height:46px;margin:0 0 10px;font-family:Inter,Arial,sans-serif;font-size:12px;letter-spacing:.1em;text-transform:uppercase;cursor:pointer}'
          + '#elioraWelcome .ew-yes{background:#79643a;border:1px solid #79643a;color:#fff}'
          + '#elioraWelcome .ew-yes:hover{background:#302d28;border-color:#302d28}'
          + '#elioraWelcome .ew-no{background:transparent;border:1px solid #c9b896;color:#79643a}'
          + '#elioraWelcome .ew-no:hover{background:#f3eee4}'
          + '#elioraWelcome.bar{inset:auto 0 0 0;padding:0;background:transparent}'
          + '#elioraWelcome.bar .ew-card{max-width:none;display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:10px 18px;padding:14px 18px;border-top:3px solid #a68a52;text-align:left}'
          + '#elioraWelcome.bar .ew-title{display:none}'
          + '#elioraWelcome.bar .ew-text{font-size:17px;margin:0;flex:1 1 260px}'
          + '#elioraWelcome.bar button{width:auto;margin:0;padding:0 18px}';
        var ws = document.createElement('style');
        ws.textContent = wcss;
        document.head.appendChild(ws);
        wbox = document.createElement('div');
        wbox.id = 'elioraWelcome';
        wbox.className = WELCOME_MODE === 'bar' ? 'bar' : '';
        wbox.setAttribute('role', 'dialog');
        wbox.setAttribute('aria-modal', WELCOME_MODE === 'bar' ? 'false' : 'true');
        wbox.innerHTML = '<div class="ew-card"><h2 class="ew-title"></h2><p class="ew-text"></p>'
          + '<div class="ew-actions"><button type="button" class="ew-yes"></button><button type="button" class="ew-no"></button></div></div>';
        document.body.appendChild(wbox);
        drawWelcome();
        wbox.querySelector('.ew-yes').addEventListener('click', function(){ closeWelcome('music'); });
        wbox.querySelector('.ew-no').addEventListener('click', function(){ closeWelcome('mute'); });
        if(WELCOME_MODE !== 'bar'){
          wbox.addEventListener('click', function(e){ if(e.target === wbox){ closeWelcome('mute'); } });
        }
        document.addEventListener('keydown', onWelcomeKey, true);
        try{ wbox.querySelector('.ew-yes').focus(); }catch(e){}
      }
      if(!welcome || WELCOME_SHOW === 'always'){ showWelcome(); }
      var langSel = document.getElementById('langSelect');
      if(langSel){ langSel.addEventListener('change', function(){ setTimeout(drawWelcome, 50); }); }

      /* mulai setelah halaman selesai dimuat, supaya loading halaman tidak tertahan oleh lagu */
      function start(){
        setTrack(idx, st.i === idx ? (parseFloat(st.t) || 0) : 0);
        if(welcome && WELCOME_SHOW === 'once'){ tryPlay(); } else { draw(); }
      }
      if(document.readyState === 'complete'){ setTimeout(start, 300); }
      else { window.addEventListener('load', function(){ setTimeout(start, 300); }); }
      draw();
    })();

