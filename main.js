/**
 * main.js
 * ─────────────────────────────────────────────────────────
 * The entry point of the entire application.
 * Vite reads this file first and follows all the imports.
 *
 * LEARNING: This is where everything connects.
 * - We import all our section modules
 * - We wait for the DOM to be ready
 * - We initialize each section in order
 * - We set up global behaviors (nav, scroll tracking)
 *
 * CONCEPT: DOMContentLoaded vs window.load
 * - DOMContentLoaded: HTML is parsed, DOM is ready. (FASTER — fire here)
 * - window.load: Everything including images, fonts, etc. is loaded.
 * We use DOMContentLoaded so our JS runs as fast as possible.
 */

// ── Imports ────────────────────────────────────────────────
// Each import pulls in the exported function from that file.
// Vite (our build tool) resolves these paths and bundles everything.
import './style.css';                           // Import CSS so Vite processes it

import { initHero }     from './sections/hero.js';
import { initAbout }    from './sections/about.js';
import { initProjects } from './sections/projects.js';
import { initContact }  from './sections/contact.js';

import { gsap }          from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { inject }        from '@vercel/analytics';

gsap.registerPlugin(ScrollTrigger);

// Initialize Vercel Web Analytics
inject();


// ── Initialize everything when DOM is ready ────────────────
// 'DOMContentLoaded' fires when HTML is parsed — safe to touch the DOM.
document.addEventListener('DOMContentLoaded', () => {

  // Initialize each section's logic
  // Order matters: hero loads first since it controls nav reveal
  initHero();       // Scene 1 — particles, letter reveal, typewriter
  initAbout();      // Scene 2 — character sheet, stat bars
  initProjects();   // Scene 3 — quest log, filter, card animations
  initContact();    // Scene 4 — guild board, form validation

  // Global behaviors
  initNavigation();         // Smooth scroll, active link tracking
  initMobileMenu();         // Hamburger menu for mobile
  initScrollProgressBar();  // Optional: progress bar at top of page
  initPageReveal();         // Fade in the entire page on load

});


/**
 * initNavigation
 * Makes nav links scroll smoothly to their section.
 * Also tracks which section is in view and highlights the nav link.
 * 
 * CONCEPT: Intersection Observer for active nav state
 * We observe each section. When it enters the viewport,
 * we find its corresponding nav link and add 'active'.
 */
function initNavigation() {
  // ── Smooth scroll on nav link clicks ──────────────────────
  const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
  // querySelectorAll returns a NodeList — we can forEach over it

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();   // Stop default anchor jump behavior

      const targetId = link.getAttribute('href');       // e.g. '#about'
      const targetEl = document.querySelector(targetId); // Find that section

      if (targetEl) {
        targetEl.scrollIntoView({
          behavior: 'smooth',   // Smooth scroll
          block: 'start',       // Align top of section to top of viewport
        });
      }

      // Close mobile menu if open
      closeMobileMenu();
    });
  });

  // ── Active nav link tracking ───────────────────────────────
  // We watch all sections. When one is in the viewport,
  // we mark its corresponding nav link as active.
  const sections = document.querySelectorAll('section[id]');
  // [id] attribute selector — only <section> elements that have an id

  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;   // Skip if not visible

      const sectionId = entry.target.id;   // e.g. 'about'

      // Remove 'active' from all nav links
      document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));

      // Add 'active' to the matching nav link
      const activeLink = document.querySelector(`.nav-link[data-section="${sectionId}"]`);
      if (activeLink) activeLink.classList.add('active');
    });
  }, {
    threshold: 0.3,           // 30% of section must be visible
    rootMargin: '-10% 0px',   // Shrink the detection area slightly
  });

  sections.forEach(section => navObserver.observe(section));
}


/**
 * initMobileMenu
 * Toggles the mobile navigation overlay on hamburger click.
 */
function initMobileMenu() {
  const menuBtn  = document.getElementById('nav-menu-btn');
  const mobileNav = document.getElementById('mobile-nav');
  if (!menuBtn || !mobileNav) return;

  menuBtn.addEventListener('click', () => {
    const isOpen = mobileNav.classList.contains('open');
    if (isOpen) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  });

  // Close menu when clicking outside it
  mobileNav.addEventListener('click', (e) => {
    if (e.target === mobileNav) closeMobileMenu();
  });

  // Close menu with Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMobileMenu();
  });
}

function openMobileMenu() {
  const mobileNav = document.getElementById('mobile-nav');
  const menuBtn   = document.getElementById('nav-menu-btn');
  mobileNav?.classList.add('open');
  mobileNav?.setAttribute('aria-hidden', 'false');
  menuBtn?.setAttribute('aria-expanded', 'true');

  // Animate hamburger lines into an X
  const spans = menuBtn?.querySelectorAll('span');
  if (spans && spans.length === 3) {
    gsap.to(spans[0], { rotation: 45, y: 7,  duration: 0.3 });
    gsap.to(spans[1], { opacity: 0,          duration: 0.3 });
    gsap.to(spans[2], { rotation: -45, y: -7, duration: 0.3 });
  }
}

function closeMobileMenu() {
  const mobileNav = document.getElementById('mobile-nav');
  const menuBtn   = document.getElementById('nav-menu-btn');
  mobileNav?.classList.remove('open');
  mobileNav?.setAttribute('aria-hidden', 'true');
  menuBtn?.setAttribute('aria-expanded', 'false');

  // Reset hamburger lines
  const spans = menuBtn?.querySelectorAll('span');
  if (spans && spans.length === 3) {
    gsap.to(spans[0], { rotation: 0, y: 0, duration: 0.3 });
    gsap.to(spans[1], { opacity: 1,        duration: 0.3 });
    gsap.to(spans[2], { rotation: 0, y: 0, duration: 0.3 });
  }
}


/**
 * initScrollProgressBar
 * Adds a thin progress bar at the top that fills as you scroll.
 * This is a common modern web pattern.
 */
function initScrollProgressBar() {
  // Create the element programmatically
  const bar = document.createElement('div');
  bar.id = 'scroll-progress';
  bar.setAttribute('aria-hidden', 'true');   // Decorative — hide from screen readers

  // Style it with JavaScript directly on the element
  Object.assign(bar.style, {
    position:        'fixed',
    top:             '0',
    left:            '0',
    height:          '2px',
    width:           '0%',
    background:      'linear-gradient(to right, #00d4ff, #ff2d55)',
    zIndex:          '2000',
    transition:      'width 0.1s ease',
    transformOrigin: 'left',
  });

  document.body.appendChild(bar);   // Add it to the page

  // Update the bar width on every scroll event
  // scrollY / (totalHeight - viewportHeight) gives 0 to 1
  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    const total    = document.body.scrollHeight - window.innerHeight;
    const percent  = total > 0 ? (scrolled / total) * 100 : 0;
    bar.style.width = `${percent}%`;
  }, { passive: true });   // passive: true = tell browser we won't call preventDefault
                            // This allows smooth scrolling optimization
}


/**
 * initPageReveal
 * Fades the entire page in smoothly when it first loads.
 * Prevents the "flash of unstyled content" feeling.
 */
function initPageReveal() {
  gsap.from('body', {
    opacity: 0,
    duration: 0.5,
    ease: 'power1.out',
  });
}
