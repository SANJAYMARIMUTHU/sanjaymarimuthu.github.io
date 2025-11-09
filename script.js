// ----- Nav Active on scroll -----
const links = [...document.querySelectorAll('#navLinks a')];
const pairs = links.map(a => [a, document.querySelector(a.getAttribute('href'))]).filter(([, s]) => !!s);

function setActive(){
  const y = scrollY + 120;
  let activeLink = pairs[0]?.[0] || null;
  pairs.forEach(([link, sec]) => { if (sec.offsetTop <= y) activeLink = link; });
  links.forEach(a => a.classList.remove('active'));
  if (activeLink){
    activeLink.classList.add('active');
    activeLink.style.transition = 'background 0.35s ease, color 0.35s ease';
  }
}
addEventListener('scroll', setActive, {passive:true});
setActive();

// Year in footer
document.getElementById('yr').textContent = new Date().getFullYear();

/* === Projects Slider (3 visible, shift by 1, total = 6) === */
(function(){
  const rail  = document.getElementById('projRail');
  if(!rail) return;

  const cards = [...rail.children];
  const total = cards.length;   // expect 6
  const visible = 3;
  let i = 0;

  function stepSize(){
    if(cards.length === 0) return 0;
    const first = cards[0];
    const style = getComputedStyle(rail);
    const gap = parseFloat(style.columnGap || style.gap || 18);
    return first.getBoundingClientRect().width + gap;
  }
  function clampIndex(n){ return Math.max(0, Math.min(n, total - visible)); }
  function goTo(n){
    i = clampIndex(n);
    const dx = stepSize() * i;
    rail.style.transform = `translateX(${-dx}px)`;
    // update disable state
    prevBtn.disabled = (i === 0);
    nextBtn.disabled = (i === total - visible);
  }

  // bottom petal controls
  const prevBtn = document.getElementById('projPrevBtn');
  const nextBtn = document.getElementById('projNextBtn');
  prevBtn?.addEventListener('click', ()=> goTo(i - 1));
  nextBtn?.addEventListener('click', ()=> goTo(i + 1));

  // Card surface → no action (modal opens ONLY via Case Study)
  cards.forEach(card=>{
    card.addEventListener('click', (e)=>{
      if(e.target.closest('.case-btn, .repo-ico')) return; // allow those
      e.preventDefault(); e.stopPropagation();
    });
  });

  // Case Study buttons → open modals (all 6)
  const modalIds = ['modalP0','modalP1','modalP2','modalP3','modalP4','modalP5'];
  document.querySelectorAll('#projects .case-btn').forEach(btn=>{
    btn.addEventListener('click', (e)=>{
      e.stopPropagation();
      const idx = +btn.dataset.index || 0;
      const id  = modalIds[idx];
      const el  = id && document.getElementById(id);
      if(el) el.style.display = 'grid';
    });
  });

  // Close buttons
  document.querySelectorAll('.cs-close').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const id = btn.getAttribute('data-close');
      const el = id && document.getElementById(id);
      if(el) el.style.display = 'none';
    });
  });

  // Click outside (overlay) to close
  document.querySelectorAll('.cs-modal').forEach(overlay=>{
    overlay.addEventListener('click', (e)=>{
      if(e.target.classList.contains('cs-modal')) overlay.style.display = 'none';
    });
  });

  // re-measure on resize
  let t; addEventListener('resize', ()=>{ clearTimeout(t); t=setTimeout(()=>goTo(i),120); });

  // init
  goTo(0);
})();

// Donut builder using SVG strokes with a fixed open gap (style like your image)
(function buildDonuts(){
  const donuts = document.querySelectorAll('.sd-donut');
  const TAU = Math.PI * 2;
  const r = 44;                               // radius used in SVG
  const C = 2 * Math.PI * r;                  // full circumference

  donuts.forEach(el=>{
    // create SVG once
    const svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.setAttribute('viewBox','0 0 120 120');

    const center = 60, radius = r; // centered circle
    const thick = getComputedStyle(el).getPropertyValue('--thick').trim() || '14px';

    // Fixed gap length (in pixels of stroke along the circumference)
    const GAP = parseFloat(getComputedStyle(el).getPropertyValue('--gap')) || 52;
    const ACTIVE_ARC = C - GAP;

    // Track (background ring) with an open gap
    const track = document.createElementNS(svg.namespaceURI,'circle');
    track.setAttribute('cx',center); track.setAttribute('cy',center); track.setAttribute('r',radius);
    track.setAttribute('fill','none');
    track.setAttribute('stroke','var(--sd-track)');
    track.setAttribute('stroke-width', parseFloat(thick));
    track.setAttribute('stroke-linecap','round');
    track.setAttribute('transform',`rotate(-90 ${center} ${center})`);
    track.setAttribute('stroke-dasharray', `${ACTIVE_ARC} ${GAP}`);
    track.setAttribute('stroke-dashoffset','0');

    // Progress arc (same dash pattern; JS will change dasharray second value)
    const prog = document.createElementNS(svg.namespaceURI,'circle');
    prog.setAttribute('cx',center); prog.setAttribute('cy',center); prog.setAttribute('r',radius);
    prog.setAttribute('fill','none');
    prog.setAttribute('stroke','var(--sd-accent)');
    prog.setAttribute('stroke-width', parseFloat(thick));
    prog.setAttribute('stroke-linecap','round');
    prog.setAttribute('transform',`rotate(-90 ${center} ${center})`);
    prog.setAttribute('stroke-dasharray', `0 ${C}`); // will animate to portion of ACTIVE_ARC

    svg.append(track, prog);
    el.appendChild(svg);

    // store for animation
    el._sd = {prog, ACTIVE_ARC};
  });

  // Animate on enter; reset on leave (so it replays every scroll)
  const IO = new IntersectionObserver((entries)=>{
    entries.forEach(({isIntersecting, target})=>{
      const pct = Math.min(100, Math.max(0, Number(target.dataset.percent)||0));
      const {prog, ACTIVE_ARC} = target._sd;

      if(isIntersecting){
        // animate from 0 to pct% of the active arc
        const targetLen = ACTIVE_ARC * (pct/100);
        const start = performance.now(), dur = 900; // ms
        function tick(t){
          const k = Math.min(1, (t - start)/dur);
          const len = targetLen * (0.5 - 0.5 * Math.cos(Math.PI*k)); // easeInOut
          prog.setAttribute('stroke-dasharray', `${len} ${C}`);
          if(k < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      }else{
        // reset to 0 so it animates again later
        prog.setAttribute('stroke-dasharray', `0 ${C}`);
      }
    });
  }, {threshold: 0.35});

  donuts.forEach(d=>IO.observe(d));
})();


// ----- Contact form handler (honeypot + basic UX) -----
(function(){
  const form = document.getElementById('contactForm');
  if(!form) return;
  const hp = form.querySelector('[name="hp"]');
  let start = Date.now();

  // live validity styling
  form.querySelectorAll('input[required], textarea[required]').forEach(el=>{
    el.addEventListener('input', ()=>{
      if(el.checkValidity()) el.classList.add('ok'); else el.classList.remove('ok');
    });
  });

  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    const elapsed = Date.now() - start;
    if(hp && hp.value) return; // bot check
    if(elapsed < 1500) return; // too fast
    if(!form.checkValidity()) { form.reportValidity(); return; }

    // success snackbar
    const bar = document.getElementById('snackbar');
    if(bar){
      bar.textContent = 'Message sent successfully ✅';
      bar.classList.add('show');
      setTimeout(()=> bar.classList.remove('show'), 5000);
    }
    form.reset();
    start = Date.now();
  });
})();

// Focus search when clicking the icon or Go
const q = document.getElementById('searchInput');
document.querySelector('.search-ico')?.addEventListener('click', ()=> q?.focus());
document.querySelector('.search-go')?.addEventListener('click', ()=> q?.focus());

// Tiny hover ripple for CTA
document.querySelectorAll('.btn').forEach(btn=>{
  btn.addEventListener('pointerdown', ()=> btn.style.transform = 'translateY(1px) scale(.99)');
  btn.addEventListener('pointerup',   ()=> btn.style.transform = '');
  btn.addEventListener('pointerleave',()=> btn.style.transform = '');
});
