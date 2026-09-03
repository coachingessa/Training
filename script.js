'use strict';

/* ── Snow / Ice Particles ─────────────────────────────────── */
(function(){
  const cvs = document.getElementById('snow');
  if(!cvs) return;
  const ctx = cvs.getContext('2d');
  let W, H, flakes=[];

  function resize(){
    W = cvs.width  = window.innerWidth;
    H = cvs.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize, {passive:true});

  const N = window.innerWidth<768 ? 90 : 180;

  for(let i=0;i<N;i++){
    const t = Math.random();
    let r, vx, vy, blur, alpha;
    if(t<0.55){
      r=Math.random()*1.2+0.3; vy=Math.random()*0.6+0.2;
      vx=(Math.random()-.5)*0.4; blur=0; alpha=Math.random()*.35+.1;
    } else if(t<0.82){
      r=Math.random()*2+1.2; vy=Math.random()*1.1+0.7;
      vx=(Math.random()-.5)*0.8; blur=Math.random()*3; alpha=Math.random()*.5+.25;
    } else {
      r=Math.random()*4+2; vy=Math.random()*1.8+1;
      vx=(Math.random()-.5)*1.2; blur=Math.random()*10+5; alpha=Math.random()*.6+.3;
    }
    flakes.push({
      x:Math.random()*W, y:Math.random()*H,
      r, vx, vy, blur, alpha,
      w: Math.random()*Math.PI*2,
      ws:(Math.random()-.5)*.05,
      shard:t>=0.82
    });
  }

  function draw(){
    ctx.clearRect(0,0,W,H);
    flakes.forEach(f=>{
      f.w+=f.ws;
      f.x+=f.vx+Math.sin(f.w)*.6;
      f.y+=f.vy;
      if(f.x<-15) f.x=W+15;
      if(f.x>W+15) f.x=-15;
      if(f.y>H+15){ f.y=-15; f.x=Math.random()*W; }

      ctx.beginPath();
      ctx.arc(f.x,f.y,f.r,0,Math.PI*2);
      ctx.shadowBlur=f.blur;
      ctx.shadowColor=`rgba(180,230,255,${f.alpha})`;
      ctx.fillStyle=`hsla(${195+Math.random()*15},100%,88%,${f.alpha})`;
      ctx.fill();

      if(f.shard && f.r>2.5){
        ctx.beginPath();
        ctx.arc(f.x,f.y,f.r*.35,0,Math.PI*2);
        ctx.shadowBlur=0;
        ctx.fillStyle=`rgba(255,255,255,${Math.min(f.alpha+.35,1)})`;
        ctx.fill();
      }
    });
    requestAnimationFrame(draw);
  }
  draw();
})();


/* ── DOM READY ─────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', ()=>{

  /* Navbar scroll */
  const nav = document.getElementById('nav');
  if(nav){
    window.addEventListener('scroll',()=>{
      nav.classList.toggle('scrolled', window.scrollY>60);
    },{passive:true});
  }

  /* Reveal on scroll */
  if('IntersectionObserver' in window){
    const io = new IntersectionObserver(entries=>{
      entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('visible'); io.unobserve(e.target); }});
    },{threshold:.1});
    document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
  } else {
    document.querySelectorAll('.reveal').forEach(el=>el.classList.add('visible'));
  }

  /* Language toggle */
  const langBtn = document.getElementById('langBtn');
  let lang = 'ar';
  if(langBtn){
    langBtn.addEventListener('click',()=>{
      lang = lang==='ar' ? 'en' : 'ar';
      document.documentElement.lang = lang;
      document.documentElement.dir  = lang==='ar' ? 'rtl' : 'ltr';
      document.body.className = `lang-${lang}`;
      langBtn.textContent = lang==='ar' ? 'EN' : 'AR';
      document.querySelectorAll('[data-ar][data-en]').forEach(el=>{
        el.textContent = el.getAttribute(`data-${lang}`);
      });
    });
  }

  /* Counters */
  const counters  = document.querySelectorAll('.counter');
  const aboutSect = document.querySelector('.about-stats');
  let counted = false;

  function ease(t){ return 1-Math.pow(1-t,4); }
  function run(el){
    const target = +el.dataset.target;
    const dur = 1800;
    const t0  = performance.now();
    (function step(now){
      const p = Math.min((now-t0)/dur,1);
      el.textContent = Math.round(ease(p)*target);
      if(p<1) requestAnimationFrame(step);
      else el.textContent = target;
    })(performance.now());
  }

  if(aboutSect && counters.length){
    const co = new IntersectionObserver(ent=>{
      if(ent[0].isIntersecting && !counted){ counted=true; counters.forEach(run); }
    },{threshold:.3});
    co.observe(aboutSect);
  }

  /* Before/After sliders */
  document.querySelectorAll('.ba-slider').forEach(wrap=>{
    const after  = wrap.querySelector('.ba-a');
    const line   = wrap.querySelector('.ba-line');
    let drag = false;

    function set(cx){
      const r   = wrap.getBoundingClientRect();
      const pct = Math.max(0,Math.min((cx-r.left)/r.width,1))*100;
      const rtl = document.documentElement.dir==='rtl';
      line.style.left = `${pct}%`;
      after.style.clipPath = rtl
        ? `inset(0 ${100-pct}% 0 0)`
        : `inset(0 0 0 ${pct}%)`;
    }

    // Initial position
    setTimeout(()=>set(wrap.getBoundingClientRect().left + wrap.offsetWidth*.5),100);

    wrap.addEventListener('mousedown', e=>{ drag=true; set(e.clientX); });
    wrap.addEventListener('touchstart',e=>{ drag=true; set(e.touches[0].clientX); },{passive:true});
    window.addEventListener('mouseup', ()=>{ drag=false; });
    window.addEventListener('touchend',()=>{ drag=false; });
    window.addEventListener('mousemove',e=>{ if(drag) set(e.clientX); });
    window.addEventListener('touchmove',e=>{ if(drag) set(e.touches[0].clientX); },{passive:true});
  });

});
