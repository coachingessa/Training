'use strict';

/* ====== EPIC ICE & SNOW CANVAS ====== */
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

  const COUNT = window.innerWidth < 768 ? 120 : 180;
  for (let i = 0; i < COUNT; i++) {
    // Randomize particle types: 0 = small distant snow, 1 = medium snow, 2 = glowing ice shards
    const type = Math.random();
    let size, speed, blur, alpha;
    
    if (type < 0.5) { // Background snow
      size = Math.random() * 1.5 + 0.5;
      speed = Math.random() * 0.5 + 0.2;
      blur = 0;
      alpha = Math.random() * 0.4 + 0.2;
    } else if (type < 0.8) { // Midground snow
      size = Math.random() * 2.5 + 1.5;
      speed = Math.random() * 1 + 0.5;
      blur = Math.random() * 2;
      alpha = Math.random() * 0.6 + 0.4;
    } else { // Foreground glowing ice shards (increased chance)
      size = Math.random() * 4 + 2;
      speed = Math.random() * 2 + 1;
      blur = Math.random() * 5 + 3;
      alpha = Math.random() * 0.8 + 0.5;
    }

    particles.push({
      x: Math.random() * W,
      y: Math.random() * H,
      r: size,
      vx: (Math.random() - 0.5) * speed * 1.5 - (speed * 0.3), // Drifting left slightly
      vy: speed,
      blur: blur,
      alpha: alpha,
      wobble: Math.random() * Math.PI * 2, // For swaying motion
      wobbleSpeed: (Math.random() - 0.5) * 0.05
    });
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    
    particles.forEach(p => {
      // Swaying motion
      p.wobble += p.wobbleSpeed;
      p.x += p.vx + Math.sin(p.wobble) * 0.5;
      p.y += p.vy;
      
      // Wrap around
      if (p.x < -20) p.x = W + 20; 
      if (p.x > W + 20) p.x = -20;
      if (p.y > H + 20) {
        p.y = -20;
        p.x = Math.random() * W;
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      
      if (p.blur > 0) {
        ctx.shadowBlur = p.blur;
        ctx.shadowColor = `rgba(160, 220, 255, ${p.alpha})`;
      } else {
        ctx.shadowBlur = 0;
      }
      
      const hue = 195 + Math.random() * 15; // Icy blue/cyan
      ctx.fillStyle = `hsla(${hue}, 90%, 90%, ${p.alpha})`;
      ctx.fill();
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
