'use strict';

/* ============================================================
   PARTICLES — Cinematic Ice & Snow
   ============================================================ */
(function () {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  const isMobile = window.innerWidth < 768;
  const COUNT = isMobile ? 100 : 200;

  for (let i = 0; i < COUNT; i++) {
    const layer = Math.random();
    let r, speed, blur, alpha;

    if (layer < 0.55) {       // far background — tiny, slow
      r = Math.random() * 1.2 + 0.4;
      speed = Math.random() * 0.5 + 0.2;
      blur  = 0;
      alpha = Math.random() * 0.4 + 0.15;
    } else if (layer < 0.82) { // mid — medium, normal speed
      r = Math.random() * 2.5 + 1.5;
      speed = Math.random() * 1.0 + 0.6;
      blur  = Math.random() * 3;
      alpha = Math.random() * 0.55 + 0.3;
    } else {                   // foreground — big, glowing ice shards
      r = Math.random() * 4.5 + 2;
      speed = Math.random() * 1.8 + 1.2;
      blur  = Math.random() * 10 + 5;
      alpha = Math.random() * 0.65 + 0.35;
    }

    particles.push({
      x: Math.random() * W,
      y: Math.random() * H,
      r, speed, blur, alpha,
      vx: (Math.random() - 0.5) * speed,
      vy: speed * (0.7 + Math.random() * 0.5),
      wobble: Math.random() * Math.PI * 2,
      wobbleSpd: (Math.random() - 0.5) * 0.06,
      isShard: layer >= 0.82
    });
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    particles.forEach(p => {
      p.wobble += p.wobbleSpd;
      p.x += p.vx + Math.sin(p.wobble) * 0.8;
      p.y += p.vy;

      if (p.x < -20) p.x = W + 20;
      if (p.x > W + 20) p.x = -20;
      if (p.y > H + 20) { p.y = -20; p.x = Math.random() * W; }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);

      ctx.shadowBlur  = p.blur;
      ctx.shadowColor = `rgba(160,240,255,${p.alpha})`;

      const hue = 185 + Math.random() * 20;
      ctx.fillStyle = `hsla(${hue},100%,88%,${p.alpha})`;
      ctx.fill();

      // Bright white core for ice shards
      if (p.isShard && p.r > 3) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 0.35, 0, Math.PI * 2);
        ctx.shadowBlur = 0;
        ctx.fillStyle  = `rgba(255,255,255,${Math.min(p.alpha + 0.3, 1)})`;
        ctx.fill();
      }
    });

    requestAnimationFrame(draw);
  }
  draw();
})();


/* ============================================================
   DOM READY
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {

  /* ---- NAVBAR SCROLL ---- */
  const navbar = document.getElementById('navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 60);
    }, { passive: true });
  }

  /* ---- SECTION REVEALS ---- */
  if ('IntersectionObserver' in window) {
    const ro = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          ro.unobserve(e.target);
        }
      });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(el => ro.observe(el));
  } else {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
  }

  /* ---- LANGUAGE TOGGLE ---- */
  const langBtn = document.getElementById('lang-toggle');
  let lang = 'ar';

  if (langBtn) {
    langBtn.addEventListener('click', () => {
      lang = lang === 'ar' ? 'en' : 'ar';
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
      document.body.className = `lang-${lang}`;
      langBtn.textContent = lang === 'ar' ? 'EN' : 'AR';
      document.querySelectorAll('[data-ar][data-en]').forEach(el => {
        el.textContent = el.getAttribute(`data-${lang}`);
      });
    });
  }

  /* ---- COUNTER ANIMATION ---- */
  function easeOutQuart(t) { return 1 - Math.pow(1 - t, 4); }

  function runCounter(el) {
    const target = +el.dataset.target;
    const dur    = 1800;
    const start  = performance.now();
    (function step(now) {
      const p = Math.min((now - start) / dur, 1);
      el.textContent = Math.round(easeOutQuart(p) * target);
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target;
    })(performance.now());
  }

  const counters   = document.querySelectorAll('.counter');
  const statsGrid  = document.querySelector('.stats-grid');
  let   counted    = false;

  if (statsGrid && counters.length) {
    const co = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !counted) {
        counted = true;
        counters.forEach(runCounter);
      }
    }, { threshold: 0.3 });
    co.observe(statsGrid);
  }

  /* ---- BEFORE/AFTER SLIDERS ---- */
  document.querySelectorAll('.ba-slider-wrap').forEach(wrap => {
    const after  = wrap.querySelector('.ba-after');
    const handle = wrap.querySelector('.ba-handle');
    let dragging = false;

    function setPos(clientX) {
      const rect = wrap.getBoundingClientRect();
      const pct  = Math.max(0, Math.min((clientX - rect.left) / rect.width, 1)) * 100;
      const isRTL = document.documentElement.dir === 'rtl';
      handle.style.left = `${pct}%`;
      after.style.clipPath = isRTL
        ? `inset(0 ${100 - pct}% 0 0)`
        : `inset(0 0 0 ${pct}%)`;
    }

    // Set default slider position
    setPos(wrap.getBoundingClientRect().left + wrap.offsetWidth * 0.5);

    wrap.addEventListener('mousedown',  e => { dragging = true; setPos(e.clientX); });
    wrap.addEventListener('touchstart', e => { dragging = true; setPos(e.touches[0].clientX); }, { passive: true });
    window.addEventListener('mouseup',  () => { dragging = false; });
    window.addEventListener('touchend', () => { dragging = false; });
    window.addEventListener('mousemove', e => { if (dragging) setPos(e.clientX); });
    window.addEventListener('touchmove', e => { if (dragging) setPos(e.touches[0].clientX); }, { passive: true });
  });

  /* ---- 3D TILT ON CARDS (desktop only) ---- */
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.querySelectorAll('.pkg-card, .method-card').forEach(el => {
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        const x = ((e.clientX - r.left) / r.width  - 0.5) * 10;
        const y = ((e.clientY - r.top)  / r.height - 0.5) * -10;
        el.style.transform = `perspective(900px) rotateX(${y}deg) rotateY(${x}deg) translateY(-4px)`;
      });
      el.addEventListener('mouseleave', () => {
        el.style.transition = 'transform 0.5s cubic-bezier(0.22,1,0.36,1)';
        el.style.transform  = '';
        setTimeout(() => { el.style.transition = ''; }, 500);
      });
      el.addEventListener('mouseenter', () => { el.style.transition = 'none'; });
    });
  }

});
