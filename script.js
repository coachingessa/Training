'use strict';

/* --- CUSTOM CURSOR & MAGNETIC BUTTONS --- */
const cursor = document.getElementById('cursor');
const cursorDot = document.getElementById('cursor-dot');
let mouseX = 0, mouseY = 0, cursorX = 0, cursorY = 0;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  cursorDot.style.left = `${mouseX}px`;
  cursorDot.style.top = `${mouseY}px`;
});

// Smooth cursor follow
function animateCursor() {
  let dx = mouseX - cursorX;
  let dy = mouseY - cursorY;
  cursorX += dx * 0.15;
  cursorY += dy * 0.15;
  cursor.style.left = `${cursorX}px`;
  cursor.style.top = `${cursorY}px`;
  requestAnimationFrame(animateCursor);
}
animateCursor();

// Magnetic buttons hover effect
document.querySelectorAll('a, button, .plan-tab, .magnetic-btn').forEach(el => {
  el.addEventListener('mouseenter', () => document.body.classList.add('hovering'));
  el.addEventListener('mouseleave', () => {
    document.body.classList.remove('hovering');
    if(el.classList.contains('magnetic-btn')){
      el.style.transform = 'translate(0px, 0px)';
    }
  });
});

document.querySelectorAll('.magnetic-btn').forEach(btn => {
  btn.addEventListener('mousemove', (e) => {
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
  });
});


/* --- LOADER --- */
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('loader').classList.add('hidden');
    document.body.style.overflow = 'auto'; // Re-enable scroll
  }, 1600);
});
document.body.style.overflow = 'hidden'; // Disable scroll during load


/* --- SCROLL PROGRESS --- */
const scrollProgress = document.getElementById('scroll-progress');
window.addEventListener('scroll', () => {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const scrollPercent = (scrollTop / docHeight) * 100;
  scrollProgress.style.width = `${scrollPercent}%`;
});


/* --- MOBILE MENU --- */
const burger = document.getElementById('burger');
const mobMenu = document.getElementById('mob-menu');
burger.addEventListener('click', () => mobMenu.classList.toggle('open'));
mobMenu.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => mobMenu.classList.remove('open'));
});


/* --- LANGUAGE TOGGLE --- */
const langBtn = document.getElementById('lang-toggle');
let currentLang = 'ar';
langBtn.addEventListener('click', () => {
  currentLang = currentLang === 'ar' ? 'en' : 'ar';
  document.documentElement.lang = currentLang;
  document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
  document.body.className = `lang-${currentLang}`;
  langBtn.textContent = currentLang === 'ar' ? 'EN' : 'AR';
  
  document.querySelectorAll('[data-ar]').forEach(el => {
    // If it's a DOM element containing text nodes directly or nested spans
    if(el.tagName === 'SPAN' || el.tagName === 'A' || el.tagName === 'P' || el.tagName === 'H2' || el.tagName === 'H3' || el.tagName === 'STRONG') {
         el.textContent = currentLang === 'ar' ? el.dataset.ar : el.dataset.en;
    }
  });
});


/* --- REVEAL ANIMATIONS --- */
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right').forEach(el => observer.observe(el));


/* --- COUNTERS --- */
const statObserver = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting) {
    document.querySelectorAll('.count').forEach(el => {
      const target = +el.dataset.target;
      let count = 0;
      const updateCount = () => {
        const inc = target / 40;
        if (count < target) {
          count += inc;
          el.innerText = Math.ceil(count);
          setTimeout(updateCount, 40);
        } else {
          el.innerText = target;
        }
      };
      updateCount();
    });
    statObserver.disconnect();
  }
}, { threshold: 0.5 });
const aboutStats = document.querySelector('.about-stats');
if (aboutStats) statObserver.observe(aboutStats);


/* --- PRICING TABS --- */
const planTabs = document.querySelectorAll('.plan-tab');
const planContents = document.querySelectorAll('.plan-content');
planTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    // Remove active class from all tabs and contents
    planTabs.forEach(t => t.classList.remove('active'));
    planContents.forEach(c => c.classList.remove('active'));
    
    // Add active class to clicked tab and corresponding content
    tab.classList.add('active');
    const plan = tab.dataset.plan;
    document.querySelector(`.plan-content[data-plan="${plan}"]`).classList.add('active');
  });
});


/* --- FAQ ACCORDION --- */
const faqs = document.querySelectorAll('.faq-row');
faqs.forEach(faq => {
  const trigger = faq.querySelector('.faq-trigger');
  trigger.addEventListener('click', () => {
    const isOpen = faq.classList.contains('open');
    faqs.forEach(f => f.classList.remove('open'));
    if (!isOpen) faq.classList.add('open');
  });
});
