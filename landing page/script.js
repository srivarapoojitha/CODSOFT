/* ============================================================
   SOUNDWAVE — SPOTIFY-INSPIRED LANDING PAGE
   script.js | Author: Senior Frontend Developer
   ============================================================ */

'use strict';

/* ============================================================
   1. CONSTANTS & SELECTORS
   ============================================================ */
const loadingScreen   = document.getElementById('loading-screen');
const navbar          = document.getElementById('navbar');
const hamburger       = document.getElementById('hamburger');
const navLinks        = document.getElementById('nav-links');
const backToTopBtn    = document.getElementById('back-to-top');
const scrollProgress  = document.getElementById('scroll-progress');
const typedTarget     = document.getElementById('typed-text');
const allNavLinks     = document.querySelectorAll('.nav-link');
const fadeElements    = document.querySelectorAll('.fade-in');
const statNumbers     = document.querySelectorAll('.stat-number');
const faqItems        = document.querySelectorAll('.faq-item');
const rippleButtons   = document.querySelectorAll('.ripple');

/* ============================================================
   2. LOADING SCREEN
   Hides the loading overlay after page assets are ready.
   ============================================================ */
function initLoadingScreen() {
  // Allow at least 1.9s for the animation to complete
  const minDelay = 1900;
  const startTime = Date.now();

  function hideLoader() {
    const elapsed = Date.now() - startTime;
    const remaining = Math.max(0, minDelay - elapsed);

    setTimeout(() => {
      loadingScreen.classList.add('hidden');
      // Remove from DOM after transition finishes
      loadingScreen.addEventListener('transitionend', () => {
        loadingScreen.remove();
      }, { once: true });
    }, remaining);
  }

  if (document.readyState === 'complete') {
    hideLoader();
  } else {
    window.addEventListener('load', hideLoader);
  }
}

/* ============================================================
   3. SCROLL PROGRESS BAR
   Updates the top progress bar width as user scrolls.
   ============================================================ */
function updateScrollProgress() {
  const scrollTop    = window.scrollY;
  const docHeight    = document.documentElement.scrollHeight - window.innerHeight;
  const progress     = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  scrollProgress.style.width = progress + '%';
}

/* ============================================================
   4. NAVBAR — Scroll behaviour & active section highlight
   ============================================================ */
function updateNavbar() {
  // Add scrolled class for glassmorphism background
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
}

function updateActiveNavLink() {
  // Determine which section is currently in view
  const sections = document.querySelectorAll('section[id]');
  let currentSection = '';

  sections.forEach(section => {
    const sectionTop    = section.offsetTop - 120;
    const sectionHeight = section.offsetHeight;
    if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
      currentSection = section.getAttribute('id');
    }
  });

  allNavLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${currentSection}`) {
      link.classList.add('active');
    }
  });
}

/* ============================================================
   5. MOBILE HAMBURGER MENU
   ============================================================ */
function initHamburgerMenu() {
  hamburger.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    hamburger.classList.toggle('active', isOpen);
    // Prevent body scroll while menu is open
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close menu when a nav link is clicked
  allNavLinks.forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger.classList.remove('active');
      document.body.style.overflow = '';
    });
  });

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!navbar.contains(e.target) && navLinks.classList.contains('open')) {
      navLinks.classList.remove('open');
      hamburger.classList.remove('active');
      document.body.style.overflow = '';
    }
  });
}

/* ============================================================
   6. SMOOTH SCROLLING
   Handles all anchor links with smooth scroll behaviour.
   ============================================================ */
function initSmoothScrolling() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const targetEl = document.querySelector(targetId);
      if (!targetEl) return;

      e.preventDefault();
      const offsetTop = targetEl.offsetTop - (parseInt(getComputedStyle(document.documentElement)
        .getPropertyValue('--nav-h')) || 72);

      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
    });
  });
}

/* ============================================================
   7. BACK TO TOP BUTTON
   ============================================================ */
function updateBackToTop() {
  if (window.scrollY > 500) {
    backToTopBtn.classList.add('visible');
  } else {
    backToTopBtn.classList.remove('visible');
  }
}

function initBackToTop() {
  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ============================================================
   8. FADE-IN SCROLL ANIMATIONS
   Uses IntersectionObserver for performant scroll reveals.
   ============================================================ */
function initFadeAnimations() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          // Unobserve after animation to save resources
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,      // 12% of element must be visible
      rootMargin: '0px 0px -40px 0px'
    }
  );

  fadeElements.forEach(el => observer.observe(el));
}

/* ============================================================
   9. ANIMATED COUNTERS
   Counts up numbers when the stats section enters viewport.
   ============================================================ */
function animateCounter(el) {
  const target   = parseInt(el.getAttribute('data-target'));
  const suffix   = el.getAttribute('data-suffix') || '';
  const duration = 2000; // ms
  const stepTime = 20;   // ms per step
  const steps    = duration / stepTime;
  const increment = target / steps;

  let current = 0;
  let frame   = 0;

  const timer = setInterval(() => {
    frame++;
    current = Math.min(Math.round(increment * frame), target);
    el.textContent = current + suffix;

    if (current >= target) {
      clearInterval(timer);
      el.textContent = target + suffix; // Ensure exact final value
    }
  }, stepTime);
}

function initCounters() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  statNumbers.forEach(el => observer.observe(el));
}

/* ============================================================
   10. TYPING EFFECT (Hero Heading)
   Cycles through a list of phrases with a typewriter effect.
   ============================================================ */
function initTypingEffect() {
  if (!typedTarget) return;

  const phrases = [
    'Your Rules.',
    'Unlimited.',
    'Everywhere.',
    'Perfected.',
    'Ad-Free.',
  ];

  let phraseIndex  = 0;
  let charIndex    = 0;
  let isDeleting   = false;
  let typingSpeed  = 90;

  function type() {
    const currentPhrase = phrases[phraseIndex];

    if (isDeleting) {
      // Remove a character
      typedTarget.textContent = currentPhrase.substring(0, charIndex - 1);
      charIndex--;
      typingSpeed = 55;
    } else {
      // Add a character
      typedTarget.textContent = currentPhrase.substring(0, charIndex + 1);
      charIndex++;
      typingSpeed = 90;
    }

    // At the end of a phrase — pause, then start deleting
    if (!isDeleting && charIndex === currentPhrase.length) {
      isDeleting  = true;
      typingSpeed = 1800; // Pause at end
    }

    // Finished deleting — move to next phrase
    if (isDeleting && charIndex === 0) {
      isDeleting   = false;
      phraseIndex  = (phraseIndex + 1) % phrases.length;
      typingSpeed  = 400; // Pause before next phrase
    }

    setTimeout(type, typingSpeed);
  }

  // Start after a short delay to let loading screen finish
  setTimeout(type, 2200);
}

/* ============================================================
   11. FAQ ACCORDION
   Toggles FAQ answers with smooth animation.
   ============================================================ */
function initFAQ() {
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');

    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      // Close all open items first (only-one-open policy)
      faqItems.forEach(otherItem => {
        otherItem.classList.remove('open');
      });

      // If it wasn't open, open this one
      if (!isOpen) {
        item.classList.add('open');
      }
    });
  });
}

/* ============================================================
   12. RIPPLE BUTTON EFFECT
   Creates a ripple animation on button click.
   ============================================================ */
function createRipple(e) {
  const button = e.currentTarget;
  const rect   = button.getBoundingClientRect();

  // Calculate ripple size (diagonal of button)
  const size   = Math.max(rect.width, rect.height);
  const x      = e.clientX - rect.left - size / 2;
  const y      = e.clientY - rect.top  - size / 2;

  const circle = document.createElement('span');
  circle.classList.add('ripple-circle');
  circle.style.cssText = `
    width:  ${size}px;
    height: ${size}px;
    left:   ${x}px;
    top:    ${y}px;
  `;

  // Remove any existing ripple
  const existing = button.querySelector('.ripple-circle');
  if (existing) existing.remove();

  button.appendChild(circle);

  // Clean up after animation
  circle.addEventListener('animationend', () => circle.remove());
}

function initRippleEffect() {
  rippleButtons.forEach(btn => {
    btn.addEventListener('click', createRipple);
  });
}

/* ============================================================
   13. PLAYER CARD INTERACTIVITY
   Simple play/pause toggle for the hero player card.
   ============================================================ */
function initPlayerCard() {
  const playBtn       = document.querySelector('.ctrl-play');
  const progressFill  = document.querySelector('.progress-fill');
  let isPlaying       = false;
  let progressInterval;
  let currentWidth    = 49; // Start at 49%

  if (!playBtn) return;

  playBtn.addEventListener('click', () => {
    isPlaying = !isPlaying;
    playBtn.textContent = isPlaying ? '⏸' : '▶';

    if (isPlaying) {
      // Animate progress bar forward
      progressInterval = setInterval(() => {
        currentWidth = Math.min(currentWidth + 0.08, 100);
        progressFill.style.width = currentWidth + '%';

        // Reset when song "ends"
        if (currentWidth >= 100) {
          currentWidth = 0;
        }
      }, 100);
    } else {
      clearInterval(progressInterval);
    }
  });
}

/* ============================================================
   14. MASTER SCROLL HANDLER
   Combines all scroll-dependent updates into one listener.
   ============================================================ */
function onScroll() {
  updateScrollProgress();
  updateNavbar();
  updateActiveNavLink();
  updateBackToTop();
}

/* ============================================================
   15. INIT — Wire everything up
   ============================================================ */
function init() {
  initLoadingScreen();
  initHamburgerMenu();
  initSmoothScrolling();
  initBackToTop();
  initFadeAnimations();
  initCounters();
  initTypingEffect();
  initFAQ();
  initRippleEffect();
  initPlayerCard();

  // Scroll listener (passive for performance)
  window.addEventListener('scroll', onScroll, { passive: true });

  // Run once on page load to set initial states
  onScroll();

  console.log('%c🎵 Soundwave — Music Without Limits', 'color:#1DB954; font-weight:bold; font-size:14px;');
}

// Bootstrap when the DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
