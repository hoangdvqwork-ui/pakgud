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
