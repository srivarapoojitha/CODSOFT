/* =====================================================
   PORTFOLIO SCRIPT — Sri Vara Poojitha
   ===================================================== */

/* ---- Loader ---- */
window.addEventListener('load', () => {
  setTimeout(() => {
    const loader = document.getElementById('loader');
    if (loader) loader.classList.add('hidden');
    boot();
  }, 2000);
});

/* ---- Scroll Progress Bar ---- */
const progress = document.getElementById('progress');
function updateProgress() {
  const docH = document.documentElement.scrollHeight - window.innerHeight;
  const pct = docH > 0 ? (window.scrollY / docH) * 100 : 0;
  if (progress) progress.style.width = pct + '%';
}

/* ---- Navbar scroll state + active link highlighting ---- */
const navbar = document.getElementById('navbar');
function updateNavbar() {
  if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 40);
}

function updateActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  let current = '';
  sections.forEach(sec => {
    const top = sec.offsetTop - 110;
    if (window.scrollY >= top) current = sec.getAttribute('id');
  });
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.toggle('active', link.getAttribute('data-nav') === current);
  });
}

/* ---- Back to top button ---- */
const backToTop = document.getElementById('backToTop');
function updateBackToTop() {
  if (backToTop) backToTop.classList.toggle('show', window.scrollY > 500);
}
if (backToTop) {
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ---- Single scroll listener for performance ---- */
window.addEventListener('scroll', () => {
  updateProgress();
  updateNavbar();
  updateActiveNav();
  updateBackToTop();
});

/* ---- Mobile Menu ---- */
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', String(isOpen));
    const spans = hamburger.querySelectorAll('span');
    spans[0].style.transform = isOpen ? 'translateY(7px) rotate(45deg)' : '';
    spans[1].style.opacity   = isOpen ? '0' : '';
    spans[2].style.transform = isOpen ? 'translateY(-7px) rotate(-45deg)' : '';
  });
  mobileMenu.querySelectorAll('.mob-link').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      hamburger.querySelectorAll('span').forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    });
  });
}

/* ---- Smooth Anchor Scroll ---- */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const href = a.getAttribute('href');
    if (href === '#' || href.length < 2) return;
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

/* ---- Typing Animation ---- */
const phrases = [
  'Aspiring Software Developer',
  'Web Development Enthusiast',
  'Creative Problem Solver'
];
let phraseIndex = 0, charIndex = 0, deleting = false;
const typingEl = document.getElementById('typingText');

function typeLoop() {
  if (!typingEl) return;
  const current = phrases[phraseIndex];
  typingEl.textContent = deleting ? current.slice(0, charIndex--) : current.slice(0, charIndex++);

  let speed = deleting ? 45 : 75;
  if (!deleting && charIndex > current.length) { deleting = true; speed = 1700; }
  if (deleting && charIndex < 0) { deleting = false; phraseIndex = (phraseIndex + 1) % phrases.length; speed = 350; }

  setTimeout(typeLoop, speed);
}
setTimeout(typeLoop, 2200);

/* ---- Particle Background ---- */
function initParticles() {
  const canvas = document.getElementById('particles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, points = [];

  function resize() {
    W = canvas.width = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const count = Math.min(60, Math.floor(W / 16));
  for (let i = 0; i < count; i++) {
    points.push({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.6 + 0.4,
      vx: (Math.random() - 0.5) * 0.32,
      vy: (Math.random() - 0.5) * 0.32
    });
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    points.forEach((p, i) => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(124,58,237,0.75)';
      ctx.fill();

      for (let j = i + 1; j < points.length; j++) {
        const dx = points[j].x - p.x, dy = points[j].y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 115) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(points[j].x, points[j].y);
          ctx.strokeStyle = `rgba(6,182,212,${0.18 * (1 - dist / 115)})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    });
    requestAnimationFrame(draw);
  }
  draw();
}

/* ---- Scroll Reveal ---- */
function initReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i * 70);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

/* ---- Animated Skill Bars ---- */
function initSkillBars() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.querySelectorAll('.skill-fill').forEach(fill => {
        fill.style.width = fill.dataset.w + '%';
      });
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.3 });
  document.querySelectorAll('.skill-card').forEach(el => observer.observe(el));
}

/* ---- Contact Form Validation + Submit ---- */
function initContactForm() {
  const form = document.getElementById('contactForm');
  const btnText = document.getElementById('formBtnText');
  const success = document.getElementById('formSuccess');
  if (!form) return;

  const fields = {
    'cf-name':    { label: 'name',    test: v => v.trim().length >= 2,             msg: 'Please enter your name (min 2 characters).' },
    'cf-email':   { label: 'email',   test: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()), msg: 'Please enter a valid email address.' },
    'cf-subject': { label: 'subject', test: v => v.trim().length >= 3,             msg: 'Please enter a subject (min 3 characters).' },
    'cf-message': { label: 'message', test: v => v.trim().length >= 10,            msg: 'Please write a message (min 10 characters).' }
  };

  function validateField(id) {
    const input = document.getElementById(id);
    const errorEl = form.querySelector(`.field-error[data-for="${id}"]`);
    const rule = fields[id];
    const isValid = rule.test(input.value);
    input.closest('.form-group').classList.toggle('invalid', !isValid);
    if (errorEl) errorEl.textContent = isValid ? '' : rule.msg;
    return isValid;
  }

  Object.keys(fields).forEach(id => {
    const input = document.getElementById(id);
    if (input) input.addEventListener('blur', () => validateField(id));
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    let allValid = true;
    Object.keys(fields).forEach(id => { if (!validateField(id)) allValid = false; });
    if (!allValid) return;

    btnText.textContent = 'Sending…';
    form.querySelector('button[type="submit"]').disabled = true;

    setTimeout(() => {
      btnText.textContent = 'Send Message';
      form.querySelector('button[type="submit"]').disabled = false;
      success.style.display = 'block';
      form.reset();
      Object.keys(fields).forEach(id => {
        document.getElementById(id).closest('.form-group').classList.remove('invalid');
        const errorEl = form.querySelector(`.field-error[data-for="${id}"]`);
        if (errorEl) errorEl.textContent = '';
      });
      setTimeout(() => { success.style.display = 'none'; }, 5000);
    }, 1200);
  });
}

/* ---- Boot all post-load behaviors ---- */
function boot() {
  initParticles();
  initReveal();
  initSkillBars();
  initContactForm();
  updateProgress();
  updateNavbar();
  updateActiveNav();
  updateBackToTop();
}
