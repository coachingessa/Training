'use strict';

/* ── BLUE PARTICLES (matching reference design) ─────────────────── */
(function () {
  const cvs = document.getElementById('particles');
  if (!cvs) return;
  const ctx = cvs.getContext('2d');
  let W, H, pts = [];

  function resize() {
    W = cvs.width  = window.innerWidth;
    H = cvs.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  const N = window.innerWidth < 768 ? 60 : 120;

  // Two types: tiny floating blue dots + slightly larger glowing ones
  for (let i = 0; i < N; i++) {
    const big = Math.random() > 0.75;
    pts.push({
      x:  Math.random() * W,
      y:  Math.random() * H,
      r:  big ? Math.random() * 2.5 + 1.5 : Math.random() * 1.2 + 0.3,
      vx: (Math.random() - 0.5) * (big ? 0.5 : 0.25),
      vy: -(Math.random() * 0.4 + 0.1), // float upward
      alpha: Math.random() * 0.6 + (big ? 0.4 : 0.15),
      blur: big ? Math.random() * 8 + 4 : 0,
      big
    });
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    pts.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.y < -10) { p.y = H + 10; p.x = Math.random() * W; }
      if (p.x < -10) p.x = W + 10;
      if (p.x > W + 10) p.x = -10;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.shadowBlur  = p.blur;
      ctx.shadowColor = `rgba(30,120,255,${p.alpha})`;
      // Color: mix between cyan and blue
      const blue = Math.random() > 0.5;
      ctx.fillStyle = blue
        ? `rgba(30,120,255,${p.alpha})`
        : `rgba(0,180,255,${p.alpha * 0.8})`;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  draw();
})();


/* ── DOM READY ──────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {

  /* NAV SCROLL */
  const nav = document.getElementById('nav');
  if (nav) {
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 60);
    }, { passive: true });
  }

  /* REVEAL */
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
      });
    }, { threshold: 0.08 });
    document.querySelectorAll('.reveal').forEach(el => io.observe(el));
  } else {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
  }

  /* LANGUAGE TOGGLE */
  const langBtn = document.getElementById('langBtn');
  let lang = 'ar';
  if (langBtn) {
    langBtn.addEventListener('click', () => {
      lang = lang === 'ar' ? 'en' : 'ar';
      document.documentElement.lang = lang;
      document.documentElement.dir  = lang === 'ar' ? 'rtl' : 'ltr';
      document.body.className = `lang-${lang}`;
      langBtn.textContent = lang === 'ar' ? 'EN' : 'AR';
      document.querySelectorAll('[data-ar][data-en]').forEach(el => {
        el.textContent = el.getAttribute(`data-${lang}`);
      });
    });
  }

  /* COUNTER ANIMATION */
  function easeOut(t) { return 1 - Math.pow(1 - t, 4); }
  function animateCount(el) {
    const target = +el.dataset.target;
    const dur = 1800;
    const t0  = performance.now();
    (function step(now) {
      const p = Math.min((now - t0) / dur, 1);
      el.textContent = Math.round(easeOut(p) * target);
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target;
    })(performance.now());
  }

  const counters   = document.querySelectorAll('.counter');
  const statsGrid  = document.querySelector('.stats-grid');
  let counted = false;

  if (statsGrid && counters.length) {
    const co = new IntersectionObserver(ents => {
      if (ents[0].isIntersecting && !counted) {
        counted = true;
        counters.forEach(animateCount);
        co.disconnect();
      }
    }, { threshold: 0.3 });
    co.observe(statsGrid);
  }

  /* BEFORE/AFTER SLIDERS */
  document.querySelectorAll('.ba-slide-wrap').forEach(wrap => {
    const after  = wrap.querySelector('.ba-after');
    const handle = wrap.querySelector('.ba-handle');
    let drag = false;

    function setPos(cx) {
      const rect = wrap.getBoundingClientRect();
      const pct  = Math.max(0, Math.min((cx - rect.left) / rect.width, 1)) * 100;
      const rtl  = document.documentElement.dir === 'rtl';
      handle.style.left = `${pct}%`;
      after.style.clipPath = rtl
        ? `inset(0 ${100 - pct}% 0 0)`
        : `inset(0 0 0 ${pct}%)`;
    }

    // Default: 50%
    setTimeout(() => setPos(wrap.getBoundingClientRect().left + wrap.offsetWidth * 0.5), 200);

    wrap.addEventListener('mousedown',  e => { drag = true; setPos(e.clientX); });
    wrap.addEventListener('touchstart', e => { drag = true; setPos(e.touches[0].clientX); }, { passive: true });
    window.addEventListener('mouseup',  () => { drag = false; });
    window.addEventListener('touchend', () => { drag = false; });
    window.addEventListener('mousemove', e => { if (drag) setPos(e.clientX); });
    window.addEventListener('touchmove', e => { if (drag) setPos(e.touches[0].clientX); }, { passive: true });
  });

  /* CAROUSEL ARROWS */
  const carousel = document.querySelector('.ba-carousel');
  const prevBtn  = document.querySelector('.ba-prev');
  const nextBtn  = document.querySelector('.ba-next');
  if (carousel && prevBtn && nextBtn) {
    const scroll = (dir) => {
      const card = carousel.querySelector('.ba-card');
      const amount = (card ? card.offsetWidth + 16 : 280) * dir;
      carousel.scrollBy({ left: amount, behavior: 'smooth' });
    };
    // For RTL, prev/next are reversed
    prevBtn.addEventListener('click', () => scroll(document.documentElement.dir === 'rtl' ? 1 : -1));
    nextBtn.addEventListener('click', () => scroll(document.documentElement.dir === 'rtl' ? -1 : 1));
  }

  /* 3D TILT ON CARDS — desktop only */
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.querySelectorAll('.pkg-card, .stat-card').forEach(el => {
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        const x = ((e.clientX - r.left) / r.width  - 0.5) * 12;
        const y = ((e.clientY - r.top)  / r.height - 0.5) * -12;
        el.style.transform = `perspective(900px) rotateX(${y}deg) rotateY(${x}deg) translateY(-5px)`;
      });
      el.addEventListener('mouseleave', () => {
        el.style.transition = 'transform 0.5s cubic-bezier(0.22,1,0.36,1)';
        el.style.transform = '';
        setTimeout(() => { el.style.transition = ''; }, 500);
      });
      el.addEventListener('mouseenter', () => { el.style.transition = 'none'; });
    });
  }

});
