// PakGud redesign — i18n (EN/VI toggle). Default language is Vietnamese.
// SHARED_DICT covers nav/footer/closing-CTA strings, which are identical
// on every page. Each page supplies window.PAGE_DICT for its own copy
// before this script runs. setLang() is exposed on window so page-specific
// scripts (e.g. the calculator's dynamically-rendered rows) can react to
// language changes via the 'pakgud:langchange' event.
(function(){
  var SHARED_DICT = {
    navHome: { vi: "Trang Chủ", en: "Home" },
    navFaq: { vi: "FAQ", en: "FAQ" },
    navContact: { vi: "Liên Hệ", en: "Contact" },
    navCta: { vi: "Nhận tư vấn", en: "Get in Touch" },
    footTagline: {
      vi: 'PakGud được vận hành bởi đội ngũ <a href="https://www.noheadliner.co/" target="_blank" rel="noopener noreferrer">No Headliner</a>, với kinh nghiệm tổ chức các chương trình âm nhạc và sự kiện nghệ sĩ tại Việt Nam.',
      en: 'PakGud is operated by the <a href="https://www.noheadliner.co/" target="_blank" rel="noopener noreferrer">No Headliner</a> team, with experience producing music programs and artist events in Vietnam.'
    },
    footNavHeading: { vi: "Điều Hướng", en: "Navigation" },
    footCalc: { vi: "Ước Tính Chi Phí", en: "Cost Estimate" },
    ctaHeading: { vi: "PakGud không đơn giản là tổ chức sự kiện", en: "PakGud is more than an event organizer" },
    ctaBody: {
      vi: "PakGud muốn trở thành đội ngũ đứng phía sau, giúp nghệ sĩ xây dựng và bảo vệ mối quan hệ với những người đầu tiên đã lựa chọn đồng hành cùng họ.",
      en: "PakGud is built to work behind the scenes, helping artists build and protect relationships with the first people who chose to support them."
    }
  };

  var dict = Object.assign({}, SHARED_DICT, window.PAGE_DICT || {});
  var nodes = document.querySelectorAll('[data-i18n]');
  var toggle = document.querySelector('.lang-toggle');

  function setLang(lang){
    nodes.forEach(function(el){
      var key = el.getAttribute('data-i18n');
      var entry = dict[key];
      if(entry && entry[lang] !== undefined){
        el.innerHTML = entry[lang];
        // Keep the cursor-glow duplicate (attr(data-text) in ::after) in sync.
        if(el.hasAttribute('data-text')){
          el.setAttribute('data-text', entry[lang]);
        }
      }
    });
    window.pakgudLang = lang;
    document.documentElement.setAttribute('lang', lang);
    document.querySelectorAll('.lang-toggle button').forEach(function(btn){
      btn.classList.toggle('active', btn.getAttribute('data-set-lang') === lang);
    });
    document.dispatchEvent(new CustomEvent('pakgud:langchange', { detail: { lang: lang } }));
  }

  document.querySelectorAll('.lang-toggle button').forEach(function(btn){
    btn.addEventListener('click', function(){ setLang(btn.getAttribute('data-set-lang')); });
  });

  window.pakgudSetLang = setLang;
  if(nodes.length || toggle){ setLang('vi'); }
})();

// PakGud redesign — shared nav behavior
(function(){
  var navToggle = document.getElementById('navToggle');
  var navLinks = document.getElementById('navLinks');
  if(!navToggle || !navLinks) return;
  navToggle.addEventListener('click', function(){
    var isOpen = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', isOpen);
  });
  navLinks.querySelectorAll('a').forEach(function(link){
    link.addEventListener('click', function(){
      navLinks.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
})();

// Scroll reveal — light fly-up + fade-in for .reveal elements as they
// enter the viewport. Reveals once per element, then stops observing it.
(function(){
  var items = document.querySelectorAll('.reveal');
  if(!items.length) return;

  if(!('IntersectionObserver' in window)){
    items.forEach(function(el){ el.classList.add('in-view'); });
    return;
  }

  var observer = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(entry.isIntersecting){
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold:0.15, rootMargin:'0px 0px -8% 0px' });

  items.forEach(function(el){ observer.observe(el); });
})();

// Cursor spotlight — desktop only. A solid accent-colored circle is clipped
// onto a duplicate of the headline text (.glow-text, via its ::after), so
// the effect only ever paints on top of the actual text glyphs rather than
// floating over the section as a whole. No-op on touch devices or pages
// with no matching section.
(function(){
  var sections = document.querySelectorAll('.glow-section');
  if(!sections.length) return;
  var isDesktop = window.matchMedia('(hover:hover) and (pointer:fine)').matches && window.innerWidth > 900;
  if(!isDesktop) return;

  sections.forEach(function(section){
    var target = section.querySelector('.glow-text');
    if(!target) return;

    section.addEventListener('mousemove', function(e){
      var rect = target.getBoundingClientRect();
      target.style.setProperty('--mx', (e.clientX - rect.left) + 'px');
      target.style.setProperty('--my', (e.clientY - rect.top) + 'px');
    });
    section.addEventListener('mouseleave', function(){
      target.style.setProperty('--mx', '-9999px');
      target.style.setProperty('--my', '-9999px');
    });
  });
})();
