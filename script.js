// ======================================
// SANJAY PORTFOLIO – FINAL JS (loader + two-page + features)
// ======================================

/* ---------- TYPING LOADER (Option D) ---------- */
const LOADER_TEXTS = [
  "Sanjay is preparing your experience...",
  "Loading projects, portfolios and insights...",
  "Getting your dashboard-ready..."
];

function typeText(el, text, speed = 40) {
  return new Promise(resolve => {
    el.textContent = "";
    let i = 0;
    const t = setInterval(() => {
      el.textContent += text.charAt(i);
      i++;
      if (i >= text.length) {
        clearInterval(t);
        setTimeout(resolve, 600);
      }
    }, speed);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const loader = document.getElementById("loader");
  const typingEl = document.getElementById("typingText");
  const pageContainer = document.querySelector(".page-container");

  // Run short typing cycle (two texts) then hide loader
  (async () => {
    await typeText(typingEl, LOADER_TEXTS[0]);
    await typeText(typingEl, LOADER_TEXTS[1]);
    // fade out loader
    loader.style.opacity = "0";
    loader.style.pointerEvents = "none";
    setTimeout(() => {
      loader.remove();
      // reveal page container to assist screen-readers
      pageContainer && pageContainer.setAttribute("aria-hidden", "false");
    }, 420);
  })();
});

/* ---------- Rest of app behavior runs after DOM loaded (and loader removed) ---------- */
document.addEventListener("DOMContentLoaded", () => {

  // years
  const yr = new Date().getFullYear();
  document.getElementById("yr") && (document.getElementById("yr").textContent = yr);
  document.getElementById("yr-side") && (document.getElementById("yr-side").textContent = yr);

  // role rotate
  const roles = ['Data Analyst', 'AI/ML Enthusiast', 'Dashboard Builder', 'Predictive Analyst'];
  let rIndex = 0;
  const roleEl = document.querySelector('.role-rotate');
  if (roleEl) {
    roleEl.textContent = roles[0];
    setInterval(() => {
      rIndex = (rIndex + 1) % roles.length;
      roleEl.style.opacity = 0;
      setTimeout(() => {
        roleEl.textContent = roles[rIndex];
        roleEl.style.opacity = 1;
      }, 240);
    }, 3000);
  }

  // page switcher
  const pageHome = document.getElementById("page-home");
  const pageMain = document.getElementById("page-main");
  const mainInner = document.getElementById("mainInner");
  const aboutBtn = document.getElementById("aboutBtn");
  const letsTalkBtn = document.getElementById("letsTalkBtn");
  const sideLinks = document.querySelectorAll(".side-link");

  function showMain() {
    if (pageMain.classList.contains("active")) return;
    pageHome.classList.remove("active");
    pageHome.classList.add("slide-out-left");
    setTimeout(() => {
      pageHome.classList.remove("slide-out-left");
      pageMain.classList.add("active");
    }, 650);
  }

  function showHome() {
    if (pageHome.classList.contains("active")) return;
    pageMain.classList.remove("active");
    pageMain.classList.add("slide-out-right");
    setTimeout(() => {
      pageMain.classList.remove("slide-out-right");
      pageHome.classList.add("active");
    }, 650);
  }

  // helpers
  function setActiveLink(target) {
    sideLinks.forEach(l => l.classList.remove("active"));
    const match = Array.from(sideLinks).find(l => l.getAttribute("data-target") === target);
    if (match) match.classList.add("active");
  }

  function scrollToSection(id) {
    const el = document.querySelector(id);
    if (!el || !mainInner) return;
    const rect = el.getBoundingClientRect();
    const containerRect = mainInner.getBoundingClientRect();
    const offset = rect.top - containerRect.top + mainInner.scrollTop - 10;
    mainInner.scrollTo({ top: offset, behavior: "smooth" });
  }

  // ---------- Projects / Case Study modal wiring ----------
document.addEventListener('DOMContentLoaded', () => {
  // map data-index -> modal id (make sure ids match your HTML)
  const modalMap = {
    0: 'modalInterfolio',
    1: 'modalAcademicRisk',
    2: 'modalRoadAccident'
  };

  // open modal on case-btn click
  document.querySelectorAll('.case-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = btn.getAttribute('data-index');
      const id = modalMap[idx];
      if (!id) return;
      const modal = document.getElementById(id);
      if (!modal) return;
      modal.style.display = 'block';
      // prevent body scroll while open
      document.body.style.overflow = 'hidden';
      // add show class (for specificity)
      modal.classList.add('cs-show');
      // focus first close button for accessibility
      const close = modal.querySelector('.cs-close');
      if (close) close.focus && close.focus();
    });
  });

  // close on click of close elements
  document.querySelectorAll('.cs-close').forEach(x => {
    x.addEventListener('click', (e) => {
      const modal = x.closest('.cs-modal');
      if (!modal) return;
      modal.style.display = 'none';
      modal.classList.remove('cs-show');
      document.body.style.overflow = ''; // restore
    });
  });

  // close when clicking outside panel
  document.querySelectorAll('.cs-modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.style.display = 'none';
        modal.classList.remove('cs-show');
        document.body.style.overflow = '';
      }
    });
  });

  // close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.cs-modal').forEach(m => {
        if (m.style.display === 'block') {
          m.style.display = 'none';
          m.classList.remove('cs-show');
        }
      });
      document.body.style.overflow = '';
    }
  });
});


  // home buttons
  aboutBtn && aboutBtn.addEventListener("click", (e) => {
    e.preventDefault();
    showMain();
    setTimeout(() => { scrollToSection("#about"); setActiveLink("#about"); }, 700);
  });
  letsTalkBtn && letsTalkBtn.addEventListener("click", (e) => {
    e.preventDefault();
    showMain();
    setTimeout(() => { scrollToSection("#contact"); setActiveLink("#contact"); }, 700);
  });

  // sidebar links
  sideLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const target = link.getAttribute("data-target");
      if (target === "#home") { showHome(); setActiveLink("#home"); return; }
      showMain();
      setActiveLink(target);
      setTimeout(() => scrollToSection(target), 700);
    });
  });
// Projects slider + modals (fixed for 3 project cards)
(function () {
  const rail = document.getElementById('projRail');
  if (!rail) return;

  const cards = Array.from(rail.querySelectorAll('.proj.card'));
  const total = cards.length;
  const visible = 3; // we have 3 cards visible in layout
  let index = 0;

  function stepSize() {
    if (!cards[0]) return 0;
    const gap = parseFloat(getComputedStyle(rail).gap || 18);
    return cards[0].getBoundingClientRect().width + gap;
  }

  function clamp(n) {
    return Math.max(0, Math.min(n, Math.max(0, total - visible)));
  }

  function updateButtons() {
    prevBtn.disabled = index === 0;
    nextBtn.disabled = index >= Math.max(0, total - visible);
  }

  function goTo(n) {
    index = clamp(n);
    const dx = stepSize() * index;
    rail.style.transform = `translateX(${-dx}px)`;
    updateButtons();
  }

  const prevBtn = document.getElementById('projPrevBtn');
  const nextBtn = document.getElementById('projNextBtn');

  prevBtn?.addEventListener('click', () => goTo(index - 1));
  nextBtn?.addEventListener('click', () => goTo(index + 1));

  // prevent card click from doing anything except for buttons/links
  cards.forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('.case-btn') || e.target.closest('.repo-ico') || e.target.closest('a')) return;
      e.preventDefault();
      e.stopPropagation();
    });
  });

  // Modal logic (only modalP0..modalP2 exist)
  const modalIds = ['modalP0', 'modalP1', 'modalP2'];

  document.querySelectorAll('#projects .case-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const idx = Number(btn.dataset.index || 0);
      const id = modalIds[idx];
      const el = id && document.getElementById(id);
      if (el) {
        el.style.display = 'grid';
        el.setAttribute('aria-hidden', 'false');
        btn.setAttribute('aria-expanded', 'true');
        // focus management
        const close = el.querySelector('.cs-close');
        close && close.focus();
      }
    });
  });

  // close buttons
  document.querySelectorAll('.cs-close').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = btn.getAttribute('data-close') || btn.closest('.cs-modal')?.id;
      const el = id && document.getElementById(id);
      if (el) {
        el.style.display = 'none';
        el.setAttribute('aria-hidden', 'true');
        // restore aria-expanded on related case-btn
        const idx = modalIds.indexOf(id);
        const trigger = document.querySelector(`#projects .case-btn[data-index="${idx}"]`);
        trigger && trigger.setAttribute('aria-expanded', 'false');
      }
    });
  });

  // click outside to close
  document.querySelectorAll('.cs-modal').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.style.display = 'none';
        overlay.setAttribute('aria-hidden', 'true');
      }
    });
  });

  // keyboard ESC to close any open modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.cs-modal').forEach(m => {
        if (m.style.display !== 'none') {
          m.style.display = 'none';
          m.setAttribute('aria-hidden', 'true');
        }
      });
    }
  });

  // responsive re-calc
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => goTo(index), 120);
  });

  // initial
  goTo(0);

  // OPTIONAL: fill slide links placeholders (you can replace '#' with actual slide URLs)
  // Example: document.getElementById('p0Slides').href = 'https://drive.google.com/...';
  // If you give me the slide links I will fill them automatically for you.
})();


  // contact form & snackbar
  const contactForm = document.getElementById("contactForm");
  const snackbar = document.getElementById("snackbar");
  function showSnack(msg) {
    if (!snackbar) return;
    snackbar.textContent = msg;
    snackbar.style.opacity = 1;
    snackbar.style.transform = "translateY(0)";
    setTimeout(() => { snackbar.style.opacity = 0; snackbar.style.transform = "translateY(10px)"; }, 3000);
  }
  contactForm && contactForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const f = e.currentTarget;
    if (f.hp && f.hp.value) return;
    const name = f.fullname.value.trim();
    const email = f.email.value.trim();
    const msg = f.message.value.trim();
    if (!name || !email || !msg) { showSnack("Please complete all fields."); return; }
    f.reset(); showSnack("Message sent successfully ✅");
  });

  // keyboard escape -> home
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") showHome(); });

});

const sections = document.querySelectorAll(".page-section");

function showSection(id) {
  sections.forEach(sec => sec.classList.remove("active", "left"));

  const current = document.querySelector(id);
  current.classList.add("active");
}

sideLinks.forEach(link => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const target = link.getAttribute("data-target");
    showSection(target);
    setActiveLink(target);
    showMain(); // ensure main page visible
  });
});

// ======================
// CONTACT FORM + SNACKBAR
// ======================
(function () {
  const form = document.getElementById('contactForm');
  if (!form) return;
  const hp = form.querySelector('[name="hp"]');
  let start = Date.now();

  form.querySelectorAll('input[required], textarea[required]').forEach(el => {
    el.addEventListener('input', () => {
      el.classList.toggle('ok', el.checkValidity());
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const elapsed = Date.now() - start;
    if (hp && hp.value) return;
    if (elapsed < 1500) return;
    if (!form.checkValidity()) return form.reportValidity();

    const bar = document.getElementById('snackbar');
    if (bar) {
      bar.textContent = 'Message sent successfully ✅';
      bar.classList.add('show');
      setTimeout(() => bar.classList.remove('show'), 4000);
    }
    form.reset();
    start = Date.now();
  });
})();


// MOBILE HAMBURGER + SLIDE MENU (top-right) — append to script.js
(function () {
  const hamb = document.getElementById('mobileHamb');
  const nav = document.getElementById('mobileNav');
  const overlay = document.getElementById('mobileOverlay');
  if (!hamb || !nav || !overlay) return;

  function openNav() {
    hamb.classList.add('open');
    hamb.setAttribute('aria-expanded', 'true');
    nav.classList.add('open');
    overlay.classList.add('show');
    nav.setAttribute('aria-hidden', 'false');
    overlay.setAttribute('aria-hidden', 'false');
    // lock body scroll
    document.body.classList.add('no-scroll');
    // focus first link
    const f = nav.querySelector('a');
    if (f) f.focus();
  }

  function closeNav() {
    hamb.classList.remove('open');
    hamb.setAttribute('aria-expanded', 'false');
    nav.classList.remove('open');
    overlay.classList.remove('show');
    nav.setAttribute('aria-hidden', 'true');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('no-scroll');
    // return focus to hamburger
    hamb.focus();
  }

  hamb.addEventListener('click', (e) => {
    e.stopPropagation();
    if (nav.classList.contains('open')) closeNav();
    else openNav();
  });

  overlay.addEventListener('click', closeNav);

  // close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('open')) closeNav();
  });

  // close nav when a mobile nav link is clicked, and navigate using your existing scrollToSection logic if present
  nav.addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (!a) return;
    const target = a.getAttribute('data-target') || a.getAttribute('href');
    // close menu first
    closeNav();
    // if it is an in-page target (starts with '#'), trigger page switch & scroll
    if (target && target.startsWith('#')) {
      // small delay to allow close animation
      setTimeout(() => {
        // if your scrollToSection exists globally use it; otherwise fallback to default anchor behavior
        if (typeof scrollToSection === 'function') {
          // ensure main page visible (if your showMain exists)
          if (typeof showMain === 'function') showMain();
          scrollToSection(target);
          // also set active link in sidebar if available
          try { setActiveLink(target); } catch (e) {}
        } else {
          const el = document.querySelector(target);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 380);
      e.preventDefault();
    }
  });

  // remove mobile nav if window gets bigger
  window.addEventListener('resize', () => {
    if (window.innerWidth > 1060) {
      if (nav.classList.contains('open')) closeNav();
    }
  });
})();
