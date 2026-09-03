/* =============================================
   AHMED ESSA COACHING — script.js
   Interactive animations & bilingual toggle
   ============================================= */

'use strict';

/* =========== LOADER =========== */
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('loader').classList.add('hidden');
  }, 1600);
});

/* =========== PARTICLES CANVAS =========== */
(function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  const ctx    = canvas.getContext('2d');
  let W, H, particles = [];

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', () => { resize(); });

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x  = Math.random() * W;
      this.y  = Math.random() * H;
      this.r  = Math.random() * 1.8 + 0.4;
      this.vx = (Math.random() - .5) * .4;
      this.vy = (Math.random() - .5) * .4;
      this.alpha = Math.random() * .5 + .1;
      this.color = Math.random() > .5 ? '0,87,255' : '68,136,255';
    }
    update() {
      this.x += this.vx; this.y += this.vy;
      if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.color},${this.alpha})`;
      ctx.fill();
    }
  }

  const PARTICLE_COUNT = 120;
  for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());

  // Draw lines between close particles
  function drawLines() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(0,87,255,${.12 * (1 - dist / 120)})`;
          ctx.lineWidth = .6;
          ctx.stroke();
        }
      }
    }
  }

  // Mouse interaction
  let mouse = { x: -999, y: -999 };
  document.getElementById('hero').addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });

  function loop() {
    ctx.clearRect(0, 0, W, H);
    drawLines();
    particles.forEach(p => {
      // Attract slightly to mouse
      const dx = mouse.x - p.x, dy = mouse.y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 180) {
        p.vx += dx / dist * .02;
        p.vy += dy / dist * .02;
        p.vx *= .97; p.vy *= .97;
      }
      p.update(); p.draw();
    });
    requestAnimationFrame(loop);
  }
  loop();
})();

/* =========== NAVBAR SCROLL =========== */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
}, { passive: true });

/* =========== MOBILE MENU =========== */
const burger     = document.getElementById('burger');
const mobileMenu = document.getElementById('mobile-menu');

burger.addEventListener('click', () => {
  burger.classList.toggle('active');
  mobileMenu.classList.toggle('open');
  document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
});
mobileMenu.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    burger.classList.remove('active');
    mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
  });
});

/* =========== LANGUAGE TOGGLE =========== */
const langBtn = document.getElementById('lang-toggle');
let currentLang = 'ar';

function applyLang(lang) {
  currentLang = lang;
  const isAr = lang === 'ar';
  document.documentElement.lang = lang;
  document.documentElement.dir  = isAr ? 'rtl' : 'ltr';
  document.body.className = isAr ? 'lang-ar' : 'lang-en';
  langBtn.textContent = isAr ? 'EN' : 'AR';

  document.querySelectorAll('[data-ar]').forEach(el => {
    el.textContent = isAr ? el.dataset.ar : el.dataset.en;
  });

  // Update WhatsApp links' text spans separately (they have nested spans)
  document.querySelectorAll('.plan-btn span[data-ar], .btn-primary span[data-ar], .nav-cta span[data-ar]').forEach(el => {
    el.textContent = isAr ? el.dataset.ar : el.dataset.en;
  });
}

langBtn.addEventListener('click', () => {
  applyLang(currentLang === 'ar' ? 'en' : 'ar');
});

/* =========== COUNTER ANIMATION =========== */
function animateCounters() {
  document.querySelectorAll('.count').forEach(el => {
    const target = +el.dataset.target;
    const duration = 1800;
    const step = target / (duration / 16);
    let current = 0;
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      el.textContent = Math.floor(current);
      if (current >= target) clearInterval(timer);
    }, 16);
  });
}

/* =========== SCROLL REVEAL =========== */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right').forEach(el => {
  revealObserver.observe(el);
});

// Counter observer
const heroStats = document.querySelector('.hero-stats');
if (heroStats) {
  const counterObs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      animateCounters();
      counterObs.disconnect();
    }
  }, { threshold: .5 });
  counterObs.observe(heroStats);
}

/* =========== SPOTLIGHT EFFECT (About image) =========== */
const spotlightWrap = document.getElementById('spotlight-wrap');
if (spotlightWrap) {
  spotlightWrap.addEventListener('mousemove', e => {
    const rect = spotlightWrap.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width  * 100).toFixed(1);
    const y = ((e.clientY - rect.top)  / rect.height * 100).toFixed(1);
    spotlightWrap.style.setProperty('--mx', `${x}%`);
    spotlightWrap.style.setProperty('--my', `${y}%`);
  });
}

/* =========== BEFORE / AFTER SLIDERS =========== */
function initBASlider(containerId, sliderId) {
  const container = document.getElementById(containerId);
  const slider    = document.getElementById(sliderId);
  if (!container || !slider) return;

  const afterEl = container.querySelector('.ba-after');
  let dragging  = false;

  function setPosition(clientX) {
    const rect = container.getBoundingClientRect();
    let pct = (clientX - rect.left) / rect.width;
    pct = Math.max(.03, Math.min(.97, pct));
    slider.style.left = `${pct * 100}%`;
    afterEl.style.clipPath = `inset(0 ${(1 - pct) * 100}% 0 0)`;
  }

  // Mouse
  slider.addEventListener('mousedown', e => { dragging = true; e.preventDefault(); });
  window.addEventListener('mousemove', e => { if (dragging) setPosition(e.clientX); });
  window.addEventListener('mouseup',   () => { dragging = false; });

  // Touch
  slider.addEventListener('touchstart', e => { dragging = true; e.preventDefault(); }, { passive: false });
  window.addEventListener('touchmove',  e => { if (dragging) setPosition(e.touches[0].clientX); }, { passive: true });
  window.addEventListener('touchend',   () => { dragging = false; });

  // Click on container
  container.addEventListener('click', e => setPosition(e.clientX));
}

initBASlider('ba1', 'slider1');
initBASlider('ba2', 'slider2');

/* =========== FAQ ACCORDION =========== */
document.querySelectorAll('.faq-item').forEach(item => {
  const btn = item.querySelector('.faq-q');
  btn.addEventListener('click', () => {
    const isOpen = item.classList.contains('open');
    // Close all
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
  });
});

/* =========== SMOOTH SCROLL (for nav links) =========== */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = 80;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

/* =========== PRICING CARD RIPPLE =========== */
document.querySelectorAll('.plan-btn').forEach(btn => {
  btn.addEventListener('click', function(e) {
    const ripple = document.createElement('span');
    const rect   = this.getBoundingClientRect();
    const size   = Math.max(rect.width, rect.height);
    ripple.style.cssText = `
      position:absolute; border-radius:50%; pointer-events:none;
      width:${size}px; height:${size}px;
      left:${e.clientX - rect.left - size/2}px;
      top:${e.clientY  - rect.top  - size/2}px;
      background:rgba(255,255,255,.25);
      transform:scale(0); animation:ripple .5s ease forwards;
    `;
    this.style.position = 'relative';
    this.style.overflow = 'hidden';
    this.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  });
});

// Inject ripple keyframe
const style = document.createElement('style');
style.textContent = `
  @keyframes ripple {
    to { transform: scale(2.5); opacity: 0; }
  }
`;
document.head.appendChild(style);

/* =========== ACTIVE NAV LINK on scroll =========== */
const sections = document.querySelectorAll('section[id]');
const navLinks  = document.querySelectorAll('.nav-links a');

const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link => {
        link.style.color = '';
        if (link.getAttribute('href') === '#' + entry.target.id) {
          link.style.color = '#fff';
        }
      });
    }
  });
}, { threshold: .4 });

sections.forEach(s => sectionObserver.observe(s));

/* =========== GLITCH EFFECT on Hero title (subtle) =========== */
const heroTitle = document.querySelector('.hero-title');
if (heroTitle) {
  setInterval(() => {
    heroTitle.style.textShadow = `
      ${Math.random()*4-2}px 0 rgba(0,87,255,.8),
      ${Math.random()*4-2}px 0 rgba(68,136,255,.5)
    `;
    setTimeout(() => { heroTitle.style.textShadow = 'none'; }, 80);
  }, 3500);
}

console.log('%c AHMED ESSA COACHING ', 'background:#0057FF;color:#fff;font-size:14px;font-weight:bold;padding:8px 16px;border-radius:4px;');
