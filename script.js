'use strict';

document.addEventListener('DOMContentLoaded', () => {
  
  // --- LOADER ---
  setTimeout(() => {
    document.getElementById('loader').classList.add('hidden');
  }, 1000);

  // --- NAVBAR SCROLL ---
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // --- MOBILE MENU ---
  const menuToggle = document.getElementById('menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  
  menuToggle.addEventListener('click', () => {
    menuToggle.classList.toggle('active');
    mobileMenu.classList.toggle('open');
    document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : 'auto';
  });

  const mobileLinks = mobileMenu.querySelectorAll('a');
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      menuToggle.classList.remove('active');
      mobileMenu.classList.remove('open');
      document.body.style.overflow = 'auto';
    });
  });

  // --- LANGUAGE TOGGLE ---
  const langToggle = document.getElementById('lang-toggle');
  let currentLang = 'ar';

  langToggle.addEventListener('click', () => {
    currentLang = currentLang === 'ar' ? 'en' : 'ar';
    document.documentElement.lang = currentLang;
    document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
    document.body.className = `lang-${currentLang}`;
    langToggle.textContent = currentLang === 'ar' ? 'English' : 'عربي';

    // Update text content based on data attributes
    const elementsToTranslate = document.querySelectorAll('[data-ar][data-en]');
    elementsToTranslate.forEach(el => {
      // For elements with nested tags, we might need a more careful approach, 
      // but in this HTML, most elements with data-ar are direct text containers
      // or we update the text node directly.
      el.textContent = el.getAttribute(`data-${currentLang}`);
    });
    
    // Specifically handle the highlight text in hero
    const highlightSpan = document.querySelector('.hero-title .highlight');
    if(highlightSpan) {
       highlightSpan.textContent = highlightSpan.getAttribute(`data-${currentLang}`);
    }
  });

  // --- REVEAL ON SCROLL ---
  const revealElements = document.querySelectorAll('.reveal, .reveal-delay');
  
  const revealOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px"
  };

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target);
      }
    });
  }, revealOptions);

  revealElements.forEach(el => {
    revealObserver.observe(el);
  });

  // --- NUMBER COUNTER ---
  const counters = document.querySelectorAll('.counter');
  let started = false;

  const counterObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !started) {
      started = true;
      counters.forEach(counter => {
        const target = +counter.getAttribute('data-target');
        const duration = 2000; // ms
        const increment = target / (duration / 16); // 60fps
        let current = 0;

        const updateCounter = () => {
          current += increment;
          if (current < target) {
            counter.textContent = Math.ceil(current);
            requestAnimationFrame(updateCounter);
          } else {
            counter.textContent = target + "+";
          }
        };
        updateCounter();
      });
    }
  }, { threshold: 0.5 });
  
  const statsSection = document.querySelector('.stats-row');
  if(statsSection) counterObserver.observe(statsSection);

  // --- 3D TILT EFFECT ---
  const tiltElements = document.querySelectorAll('.tilt-effect');
  
  tiltElements.forEach(el => {
    el.addEventListener('mousemove', e => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const xTarget = ((x - rect.width / 2) / rect.width) * 20; // max 10 deg
      const yTarget = ((y - rect.height / 2) / rect.height) * -20;
      
      el.style.transform = `perspective(1000px) rotateX(${yTarget}deg) rotateY(${xTarget}deg) scale3d(1.02, 1.02, 1.02)`;
      el.style.transition = 'none';
      el.style.zIndex = 10;
    });
    
    el.addEventListener('mouseleave', () => {
      el.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      el.style.transition = 'transform 0.5s ease';
      el.style.zIndex = 1;
    });
  });

  // --- BEFORE/AFTER SLIDERS ---
  const baContainers = document.querySelectorAll('.ba-container');
  
  baContainers.forEach(container => {
    const slider = container.querySelector('.ba-slider');
    const afterImg = container.querySelector('.ba-after');
    let isDragging = false;
    
    const moveSlider = (e) => {
      if (!isDragging) return;
      
      const rect = container.getBoundingClientRect();
      let x = (e.type.includes('mouse')) ? e.pageX - rect.left : e.touches[0].clientX - rect.left;
      
      // Ensure within bounds
      x = Math.max(0, Math.min(x, rect.width));
      
      const percentage = (x / rect.width) * 100;
      
      slider.style.left = `${percentage}%`;
      
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
    
    window.addEventListener('mouseup', () => {
      isDragging = false;
    });
    
    window.addEventListener('mousemove', moveSlider);
    
    // Touch support
    container.addEventListener('touchstart', (e) => {
      isDragging = true;
      moveSlider(e);
    }, {passive: true});
    
    window.addEventListener('touchend', () => {
      isDragging = false;
    });
    
    window.addEventListener('touchmove', moveSlider, {passive: true});
  });

  // --- FAQ ACCORDION ---
  const faqItems = document.querySelectorAll('.faq-item');
  
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    
    question.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      
      // Close all
      faqItems.forEach(faq => {
        faq.classList.remove('active');
        faq.querySelector('.faq-answer').style.maxHeight = null;
      });
      
      if (!isActive) {
        item.classList.add('active');
        answer.style.maxHeight = answer.scrollHeight + "px";
      }
    });
  });
});
