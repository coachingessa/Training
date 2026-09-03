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

  const COUNT = 60;
  for (let i = 0; i < COUNT; i++) {
    particles.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 1.5 + 0.4,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      alpha: Math.random() * 0.6 + 0.2
    });
  }

  function drawParticles() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(77,155,255,${p.alpha})`;
      ctx.fill();
    });
    // Draw connecting lines
    particles.forEach((a, i) => {
      particles.slice(i + 1).forEach(b => {
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(0,102,255,${0.12 * (1 - dist / 120)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      });
    });
    requestAnimationFrame(drawParticles);
  }
  drawParticles();
})();


document.addEventListener('DOMContentLoaded', () => {

  // --- SECTION REVEALS ---
  const sections = document.querySelectorAll('section, header');
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, { threshold: 0.08 });
  sections.forEach(s => { s.classList.add('reveal-section'); sectionObserver.observe(s); });

  // --- PAGINATION DOTS ---
  const dots = document.querySelectorAll('.dot');
  const sectionsArr = Array.from(sections);
  const dotObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const idx = sectionsArr.indexOf(entry.target);
        if (idx >= 0 && idx < dots.length) {
          dots.forEach(d => d.classList.remove('active'));
          dots[Math.min(idx, dots.length - 1)].classList.add('active');
        }
      }
    });
  }, { threshold: 0.5 });
  sectionsArr.forEach(s => dotObserver.observe(s));

  // --- NAVBAR SCROLL ---
  const navbar = document.querySelector('.navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // --- LANGUAGE TOGGLE ---
  const langToggle = document.getElementById('lang-toggle');
  let currentLang = 'ar';

  langToggle.addEventListener('click', () => {
    currentLang = currentLang === 'ar' ? 'en' : 'ar';
    document.documentElement.lang = currentLang;
    document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
    document.body.className = `lang-${currentLang}`;
    langToggle.textContent = currentLang === 'ar' ? 'EN' : 'AR';

    // Update text content based on data attributes
    const elementsToTranslate = document.querySelectorAll('[data-ar][data-en]');
    elementsToTranslate.forEach(el => {
      // Check if it has an icon or child we need to keep
      const hasIcon = el.querySelector('.icon');
      if (hasIcon) {
        const iconHTML = hasIcon.outerHTML;
        el.innerHTML = iconHTML + ' ' + el.getAttribute(`data-${currentLang}`);
      } else {
        el.textContent = el.getAttribute(`data-${currentLang}`);
      }
    });
  });

  // --- NUMBER COUNTER ---
  const counters = document.querySelectorAll('.counter');
  let started = false;

  const counterObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !started) {
      started = true;
      counters.forEach(counter => {
        const target = +counter.getAttribute('data-target');
        const duration = 2000;
        const increment = target / (duration / 16);
        let current = 0;

        const updateCounter = () => {
          current += increment;
          if (current < target) {
            counter.textContent = Math.ceil(current);
            requestAnimationFrame(updateCounter);
          } else {
            counter.textContent = target;
          }
        };
        updateCounter();
      });
    }
  }, { threshold: 0.5 });
  
  const statsSection = document.querySelector('.stats-grid');
  if(statsSection) counterObserver.observe(statsSection);

  // --- 3D TILT EFFECT ---
  const tiltElements = document.querySelectorAll('.tilt-element');
  
  tiltElements.forEach(el => {
    el.addEventListener('mousemove', e => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const xTarget = ((x - rect.width / 2) / rect.width) * 15; // max 7.5 deg
      const yTarget = ((y - rect.height / 2) / rect.height) * -15;
      
      el.style.transform = `perspective(1000px) rotateX(${yTarget}deg) rotateY(${xTarget}deg)`;
    });
    
    el.addEventListener('mouseleave', () => {
      el.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
      setTimeout(() => { el.style.transition = 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)'; }, 50);
    });
    
    el.addEventListener('mouseenter', () => {
      el.style.transition = 'none';
    });
  });

  // --- BEFORE/AFTER SLIDERS ---
  const baContainers = document.querySelectorAll('.ba-container');
  
  baContainers.forEach(container => {
    const sliderLine = container.querySelector('.ba-slider-line');
    const afterImg = container.querySelector('.ba-after');
    let isDragging = false;
    
    const moveSlider = (e) => {
      if (!isDragging) return;
      
      const rect = container.getBoundingClientRect();
      let x = (e.type.includes('mouse')) ? e.pageX - rect.left : e.touches[0].clientX - rect.left;
      
      x = Math.max(0, Math.min(x, rect.width));
      const percentage = (x / rect.width) * 100;
      
      sliderLine.style.left = `${percentage}%`;
      
      if (document.documentElement.dir === 'rtl') {
         afterImg.style.clipPath = `inset(0 ${100 - percentage}% 0 0)`;
      } else {
         afterImg.style.clipPath = `inset(0 0 0 ${percentage}%)`;
      }
    };
    
    container.addEventListener('mousedown', (e) => {
      isDragging = true;
      moveSlider(e);
    });
    window.addEventListener('mouseup', () => { isDragging = false; });
    window.addEventListener('mousemove', moveSlider);
    
    container.addEventListener('touchstart', (e) => {
      isDragging = true;
      moveSlider(e);
    }, {passive: true});
    window.addEventListener('touchend', () => { isDragging = false; });
    window.addEventListener('touchmove', moveSlider, {passive: true});
  });
});
