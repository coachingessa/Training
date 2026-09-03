'use strict';

/* ====== PARTICLE CANVAS ====== */
(function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const COUNT = window.innerWidth < 768 ? 30 : 55;
  for (let i = 0; i < COUNT; i++) {
    particles.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 1.4 + 0.3,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      alpha: Math.random() * 0.5 + 0.15
    });
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      // Icy white-blue particles
      const hue = 195 + Math.random() * 30;
      ctx.fillStyle = `hsla(${hue},80%,80%,${p.alpha})`;
      ctx.fill();
    });
    particles.forEach((a, i) => {
      particles.slice(i + 1).forEach(b => {
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < 100) {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
          // Icy blue connecting lines
          ctx.strokeStyle = `rgba(100,190,255,${0.12 * (1 - d / 100)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      });
    });
    requestAnimationFrame(draw);
  }
  draw();
})();

document.addEventListener('DOMContentLoaded', () => {

  // ---- NAVBAR SCROLL ----
  const navbar = document.getElementById('navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 50);
    }, { passive: true });
  }

  // ---- SECTION REVEALS ----
  const revealEls = document.querySelectorAll('.reveal, .reveal-child');
  if ('IntersectionObserver' in window) {
    const ro = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // stagger children
          const children = entry.target.querySelectorAll('.reveal-child');
          children.forEach((c, i) => {
            setTimeout(() => c.classList.add('visible'), i * 100);
          });
          entry.target.classList.add('visible');
          ro.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    revealEls.forEach(el => ro.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('visible'));
  }

  // ---- LANGUAGE TOGGLE ----
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

  // ---- COUNTER ANIMATION ----
  function easeOutQuart(t) { return 1 - Math.pow(1 - t, 4); }

  function animateCounter(el) {
    const target = +el.getAttribute('data-target');
    const duration = 1800;
    const start = performance.now();
    (function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      el.textContent = Math.round(easeOutQuart(progress) * target);
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target;
    })(performance.now());
  }

  const counters = document.querySelectorAll('.counter');
  const statsGrid = document.querySelector('.stats-grid');
  let counted = false;

  if (statsGrid && counters.length) {
    const co = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !counted) {
        counted = true;
        counters.forEach(animateCounter);
      }
    }, { threshold: 0.4 });
    co.observe(statsGrid);
  }

  // ---- 3D TILT (desktop only) ----
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.querySelectorAll('.tilt-element').forEach(el => {
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        const x = ((e.clientX - r.left) / r.width  - 0.5) * 12;
        const y = ((e.clientY - r.top)  / r.height - 0.5) * -12;
        el.style.transform = `perspective(900px) rotateX(${y}deg) rotateY(${x}deg)`;
      });
      el.addEventListener('mouseleave', () => {
        el.style.transition = 'transform 0.5s var(--ease, ease)';
        el.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg)';
        setTimeout(() => { el.style.transition = ''; }, 500);
      });
      el.addEventListener('mouseenter', () => { el.style.transition = 'none'; });
    });
  }

  // ---- BEFORE/AFTER SLIDERS ----
  document.querySelectorAll('.ba-slider-wrap').forEach(wrap => {
    const after   = wrap.querySelector('.ba-after');
    const handle  = wrap.querySelector('.ba-handle');
    let dragging  = false;
    const isRTL   = () => document.documentElement.dir === 'rtl';

    function setPos(x) {
      const rect = wrap.getBoundingClientRect();
      const pct  = Math.max(0, Math.min((x - rect.left) / rect.width, 1)) * 100;
      handle.style.left = `${pct}%`;
      if (isRTL()) {
        after.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
      } else {
        after.style.clipPath = `inset(0 0 0 ${pct}%)`;
      }
    }

    wrap.addEventListener('mousedown',  e => { dragging = true; setPos(e.clientX); });
    wrap.addEventListener('touchstart', e => { dragging = true; setPos(e.touches[0].clientX); }, { passive: true });
    window.addEventListener('mouseup',  () => { dragging = false; });
    window.addEventListener('touchend', () => { dragging = false; });
    window.addEventListener('mousemove', e => { if (dragging) setPos(e.clientX); });
    window.addEventListener('touchmove', e => { if (dragging) setPos(e.touches[0].clientX); }, { passive: true });
  });

});
