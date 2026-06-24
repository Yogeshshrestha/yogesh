/**
 * sections/about.js
 * ─────────────────────────────────────────────────────────
 * Scene 2 — The Character Sheet
 * Renders the RPG-style about section with animated stat bars.
 *
 * LEARNING CONCEPTS IN THIS FILE:
 * - Array of objects — storing structured data
 * - Array.forEach() — iterating over data
 * - Template literals — building HTML strings
 * - Intersection Observer API — detecting scroll visibility
 * - CSS custom properties set via JavaScript
 * - animateCounter utility from utils/animations.js
 */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { createIntersectionObserver, animateCounter } from '../utils/animations.js';

gsap.registerPlugin(ScrollTrigger);


/**
 * THE STATS DATA — Array of Objects
 * ─────────────────────────────────────────────────────────
 * This is a JavaScript array where each item is an OBJECT.
 * An object is a collection of key: value pairs (also called properties).
 * 
 * WHY THIS PATTERN:
 * - Data is separate from presentation logic
 * - Easy to add/remove/modify stats
 * - You iterate over this array to build the HTML — same concept React uses
 * 
 * Each stat object has:
 *   name  — displayed label
 *   value — the actual number (0–100)
 *   color — CSS color for this bar (optional, defaults to accent-primary)
 */
const STATS = [
  { name: 'Vue 3 / Nuxt 3',                    value: 92, color: '#41b883' },
  { name: 'TypeScript / JavaScript',            value: 86, color: '#3178c6' },
  { name: 'AI Chat Integration',           value: 88, color: '#8b5cf6' },
  { name: 'Web3 / Wallet Integration',          value: 87, color: '#627eea' },
  { name: 'Tailwind CSS / Vuetify 3 / SCSS',  value: 85, color: '#38bdf8' },
  { name: 'REST APIs / GraphQL',               value: 83, color: '#00ff88' },
  { name: 'Security (DOMPurify · CSP)',        value: 76, color: '#ff6b6b' },
];


/**
 * initAbout
 * Main entry point for the about section.
 * Called from main.js.
 */
export function initAbout() {
  // ── 1. Render stat bars from data ─────────────────────────
  renderStats();

  // ── 2. Trigger stat animations when section is visible ────
  initStatsAnimation();

  // ── 3. Animate section elements when they scroll into view ─
  initSectionReveal();
}


/**
 * renderStats
 * Builds the stat bar HTML from the STATS array.
 * 
 * CONCEPT: Array → HTML
 * This pattern — taking data and turning it into DOM elements —
 * is the core of how every UI framework works.
 * React's .map() does exactly this. Here we do it manually.
 * 
 * We use innerHTML to insert the generated HTML string.
 * Alternative: createElement() + appendChild() — see the comment at the end.
 */
function renderStats() {
  const statsList = document.getElementById('stats-list');
  if (!statsList) return;

  // Build the HTML for all stat rows at once using Array.map()
  // .map() takes each item in STATS and transforms it into a string
  // The result is an array of strings — we join them with .join('')
  const html = STATS.map((stat, index) => {
    // Template literal — backticks let us embed expressions with ${}
    return `
      <div 
        class="stat-row" 
        role="listitem"
        aria-label="${stat.name}: ${stat.value} out of 100"
        data-index="${index}"
      >
        <span class="stat-name">${stat.name}</span>
        
        <div class="stat-bar-track">
          <!-- The fill bar: starts at 0%, JS animates to stat.value% -->
          <div 
            class="stat-bar-fill" 
            id="stat-bar-${index}"
            style="--stat-color: ${stat.color}; background: linear-gradient(to right, ${stat.color}, ${stat.color}99);"
            data-value="${stat.value}"
            role="progressbar"
            aria-valuenow="0"
            aria-valuemin="0"
            aria-valuemax="100"
          ></div>
        </div>

        <!-- The counter number — starts at 0, counts up -->
        <span class="stat-value" id="stat-count-${index}">0</span>
      </div>
    `;
  }).join('');   // .join('') combines the array of strings into one big string

  // Set the innerHTML of the container to our built HTML
  statsList.innerHTML = html;
}


/**
 * initStatsAnimation
 * Uses Intersection Observer to detect when the stats section enters
 * the viewport, then animates all bars and counters.
 * 
 * WHY NOT ANIMATE ON PAGE LOAD?
 * The user might not scroll to this section immediately.
 * We want the animation to play when they FIRST SEE IT.
 * Intersection Observer is the modern way to detect this.
 * 
 * CONCEPT: Intersection Observer
 * 1. You create an observer with a callback
 * 2. You tell it which elements to watch
 * 3. When a watched element enters/exits the viewport, the callback fires
 * 4. Much better than scroll event listeners (which fire on every pixel)
 */
function initStatsAnimation() {
  const statsSection = document.getElementById('about-stats');
  if (!statsSection) return;

  let animated = false;   // Prevent re-running if the section is scrolled past multiple times

  createIntersectionObserver(
    statsSection,
    () => {
      if (animated) return;   // Guard: only animate once
      animated = true;
      animateAllBars();
    },
    { threshold: 0.3 }   // Fire when 30% of the section is visible
  );
}


/**
 * animateAllBars
 * Runs through each stat and animates its bar + counter.
 * Called once when the section becomes visible.
 */
function animateAllBars() {
  STATS.forEach((stat, index) => {
    // Get references to this stat's bar and counter
    const barEl   = document.getElementById(`stat-bar-${index}`);
    const countEl = document.getElementById(`stat-count-${index}`);

    if (!barEl || !countEl) return;

    // Stagger each bar: wait (index * 100ms) before starting
    // This makes them appear one after another, not all at once
    const delay = index * 0.12;   // seconds

    // GSAP animates the width from 0% to the target value
    gsap.to(barEl, {
      width: `${stat.value}%`,    // CSS width as a percentage string
      duration: 1.4,
      ease: 'power2.out',
      delay,
      onUpdate: () => {
        // Update the aria attribute for screen readers as the bar animates
        barEl.setAttribute('aria-valuenow', Math.round(parseFloat(barEl.style.width)));
      }
    });

    // Animate the number counter at the same time
    setTimeout(() => {
      animateCounter(countEl, stat.value, 1400);
    }, delay * 1000);   // Convert seconds to milliseconds
  });
}


/**
 * initSectionReveal
 * Fades and slides in the about section elements when scrolled to.
 */
function initSectionReveal() {
  // Animate the bio text
  gsap.from('.about-bio', {
    opacity: 0,
    x: 30,
    duration: 0.8,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: '.about-bio',
      start: 'top 85%',
      once: true,
    }
  });

  // Animate the portrait panel
  gsap.from('.about-portrait-panel', {
    opacity: 0,
    x: -40,
    duration: 1,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: '.about-container',
      start: 'top 80%',
      once: true,
    }
  });

  // Animate the traits
  gsap.from('.trait', {
    opacity: 0,
    y: 20,
    duration: 0.5,
    stagger: 0.1,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: '.about-traits',
      start: 'top 90%',
      once: true,
    }
  });

  gsap.from('.about-resume', {
    opacity: 0,
    y: 30,
    duration: 0.8,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: '.about-resume',
      start: 'top 90%',
      once: true,
    }
  });
}
