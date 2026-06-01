/**
 * utils/animations.js
 * ─────────────────────────────────────────────────────────
 * Shared animation helpers used by multiple sections.
 * By putting these here we avoid repeating code.
 * 
 * LEARNING CONCEPT: ES6 Modules
 * - `export` makes a function available to other files
 * - `import` in another file pulls it in
 * - Vite (our build tool) handles this automatically
 */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register the ScrollTrigger plugin with GSAP.
// GSAP plugins are separate features that you opt into.
// Without this line, ScrollTrigger won't work.
gsap.registerPlugin(ScrollTrigger);


/**
 * fadeInOnScroll
 * Fades and slides an element into view when it enters the viewport.
 * 
 * @param {string|Element} target - CSS selector or DOM element
 * @param {object} options - Optional overrides
 * 
 * HOW IT WORKS:
 * 1. gsap.from() animates FROM these values TO the element's current CSS values
 * 2. scrollTrigger watches the DOM and fires the animation when the element is visible
 * 3. 'once: true' means it only plays once, not every time you scroll past
 */
export function fadeInOnScroll(target, options = {}) {
  gsap.from(target, {
    opacity: 0,
    y: options.y ?? 40,           // Start 40px below — ?? means "if null or undefined, use 40"
    duration: options.duration ?? 0.8,
    ease: options.ease ?? 'power2.out',
    delay: options.delay ?? 0,
    scrollTrigger: {
      trigger: options.trigger ?? target,
      start: options.start ?? 'top 85%',  // Fire when top of element is at 85% of viewport height
      once: true,                          // Only animate once
    },
  });
}


/**
 * staggerInOnScroll
 * Animates multiple elements in sequence with a delay between each.
 * This is the "cards appearing one after another" effect.
 * 
 * @param {string} targets - CSS selector that matches multiple elements
 * @param {object} options - Optional overrides
 */
export function staggerInOnScroll(targets, options = {}) {
  gsap.from(targets, {
    opacity: 0,
    y: options.y ?? 50,
    duration: options.duration ?? 0.7,
    ease: 'power2.out',
    stagger: options.stagger ?? 0.12,   // 0.12 seconds between each element
    scrollTrigger: {
      trigger: options.trigger ?? targets,
      start: 'top 85%',
      once: true,
    },
  });
}


/**
 * createIntersectionObserver
 * A reusable wrapper around the Intersection Observer API.
 * Use this when you want to run any custom logic when an element
 * enters the viewport — not just GSAP animations.
 * 
 * INTERSECTION OBSERVER explained:
 * - Browser natively watches elements
 * - Calls your callback when they enter or leave the viewport
 * - Much more performant than listening to 'scroll' events
 * - Used in almost every modern website
 * 
 * @param {Element|NodeList} elements - Elements to observe
 * @param {function} callback - Function called when element becomes visible
 * @param {object} observerOptions - IntersectionObserver options
 */
export function createIntersectionObserver(elements, callback, observerOptions = {}) {
  // Create the observer with a threshold of 0.2 = 20% of element must be visible
  const observer = new IntersectionObserver((entries) => {
    // entries is an array — one entry per observed element
    entries.forEach(entry => {
      // entry.isIntersecting is true when the element is in the viewport
      if (entry.isIntersecting) {
        callback(entry.target);       // Call the provided function with the visible element
      }
    });
  }, {
    threshold: observerOptions.threshold ?? 0.2,  // How much of element must be visible
    rootMargin: observerOptions.rootMargin ?? '0px',
    ...observerOptions,
  });

  // If elements is a NodeList or array, observe each one
  // If it's a single element, observe just that
  if (elements instanceof NodeList || Array.isArray(elements)) {
    elements.forEach(el => observer.observe(el));
  } else if (elements) {
    observer.observe(elements);
  }

  // Return the observer so the caller can disconnect it if needed
  return observer;
}


/**
 * animateCounter
 * Counts a number from 0 up to a target value.
 * Used for the stat numbers in the character sheet.
 * 
 * @param {Element} element - The DOM element whose text we're updating
 * @param {number} target - The final number to count to
 * @param {number} duration - How long the count takes in milliseconds
 * 
 * HOW requestAnimationFrame WORKS:
 * - The browser calls your function before every repaint (~60 times/second)
 * - You calculate the current value based on elapsed time
 * - You update the DOM with the new value
 * - This creates smooth animation tied to the display refresh rate
 */
export function animateCounter(element, target, duration = 1200) {
  const startTime = performance.now();   // Record when we started

  function update(currentTime) {
    // Calculate how far through the animation we are (0 to 1)
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);  // Clamp to max 1

    // Apply easing — this makes the count slow down as it approaches the target
    // easeOut formula: 1 - (1 - progress)^3
    const eased = 1 - Math.pow(1 - progress, 3);

    // Calculate the current displayed value and update the DOM
    const currentValue = Math.round(eased * target);
    element.textContent = currentValue;

    // If not done, request another frame
    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  // Kick off the first frame
  requestAnimationFrame(update);
}


/**
 * glitchEffect
 * A quick visual glitch on an element — text scrambles briefly.
 * Optional — call this on hover for extra anime flair.
 * 
 * @param {Element} element - The element to glitch
 * @param {string} originalText - The original text to restore
 */
export function glitchEffect(element, originalText) {
  const glitchChars = 'アイウエオカキクケコ0123456789ABCDEF!@#$';
  let iterations = 0;
  const maxIterations = 6;

  const interval = setInterval(() => {
    // Replace each character with a random glitch character
    element.textContent = originalText
      .split('')
      .map((char, index) => {
        // Keep characters that have already "settled"
        if (index < iterations) return char;
        // Others get randomized
        return glitchChars[Math.floor(Math.random() * glitchChars.length)];
      })
      .join('');

    iterations += 1;

    // Stop when all characters have settled
    if (iterations > originalText.length) {
      clearInterval(interval);
      element.textContent = originalText;   // Restore original
    }
  }, 50);   // Run every 50ms
}
