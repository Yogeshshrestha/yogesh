/**
 * sections/hero.js
 * ─────────────────────────────────────────────────────────
 * Scene 1 — The Hero Section
 * Handles all logic for the opening dramatic intro.
 * 
 * FEATURES:
 * 1. Particle canvas background
 * 2. Letter-by-letter name reveal
 * 3. Typewriter effect for title
 * 4. Sequential fade-ins using setTimeout chain
 * 5. Navigation reveal after hero loads
 *
 * LEARNING CONCEPTS IN THIS FILE:
 * - setTimeout / recursion for sequencing
 * - requestAnimationFrame for particle animation
 * - Canvas 2D API
 * - DOM manipulation (getElementById, textContent, classList)
 * - ES6 modules (export/import)
 */

import { gsap } from 'gsap';


/**
 * initHero
 * The main entry point for this section.
 * Called once from main.js when the page loads.
 * 
 * EXPORT: Makes this function importable in other files.
 * This is how vanilla JS modules work — each file exports
 * what it wants to share.
 */
export function initHero() {
  // Get references to the DOM elements we'll be working with.
  // getElementById is faster than querySelector for IDs.
  const nameEl    = document.getElementById('hero-name');     // The big name display
  const cursorEl  = document.getElementById('hero-cursor');   // The blinking cursor
  const titleEl   = document.getElementById('hero-title');    // The typewriter subtitle
  const taglineEl = document.getElementById('hero-tagline');  // The quote
  const ctaEl     = document.getElementById('hero-cta');      // The CTA buttons
  const navEl     = document.getElementById('main-nav');      // The top nav bar
  const canvas    = document.getElementById('hero-canvas');   // The particle canvas

  // If any element is missing from the DOM, stop here.
  // This prevents cryptic "cannot read property of null" errors.
  if (!nameEl || !titleEl || !taglineEl || !ctaEl || !navEl) return;

  // ── Step 1: Start the particle canvas background ──────────
  if (canvas) {
    initParticles(canvas);
  }

  // ── Step 2: Begin the animation sequence ──────────────────
  // We use setTimeout to chain animations in order:
  //   0ms    → start name reveal
  //   ~1200ms → start typewriter (after name finishes)
  //   ~3200ms → fade in tagline
  //   ~3700ms → fade in CTA buttons
  //   ~4000ms → reveal nav
  //
  // CONCEPT: setTimeout takes (function, delay_in_ms)
  // The function runs ONCE after the delay.

  setTimeout(() => {
    revealNameLetterByLetter(nameEl, cursorEl, () => {
      // This callback runs AFTER the name is fully revealed.
      // A callback is a function passed as an argument to be called later.
      setTimeout(() => {
        typewriterEffect(titleEl, 'Frontend Engineer · Vue & Nuxt · Web3 & AI Integration', () => {
          // Runs after typewriter completes
          setTimeout(() => {
            taglineEl.classList.add('visible');  // CSS transition handles the fade
          }, 300);
          setTimeout(() => {
            ctaEl.classList.add('visible');
          }, 700);
          setTimeout(() => {
            // Remove 'hidden' class from nav to show it
            navEl.classList.remove('hidden');
          }, 1000);
        });
      }, 300);
    });
  }, 500);   // 500ms initial delay so the page has time to paint

  // ── Step 3: Smooth scroll on nav clicks ───────────────────
  initHeroScrollBehavior();

  // ── Step 4: Parallax tilt on mouse move ───────────────────
  initHeroMouseParallax();
}


/**
 * revealNameLetterByLetter
 * Appends one letter at a time to the nameEl element.
 * Uses RECURSION — a function that calls itself.
 * 
 * WHY RECURSION INSTEAD OF setInterval?
 * With setInterval, if the function takes longer than the interval,
 * calls pile up. With recursive setTimeout, the next call
 * only starts AFTER the current one finishes — safer.
 * 
 * @param {Element} el - The DOM element to write letters into
 * @param {Element} cursor - The blinking cursor element
 * @param {function} onComplete - Callback when all letters are revealed
 */
function revealNameLetterByLetter(el, cursor, onComplete) {
  const name = 'YOGESH';
  let index = 0;

  // Create a span for each letter — individual spans let us animate them
  name.split('').forEach(letter => {
    const span = document.createElement('span');   // Create a new <span> element
    span.textContent = letter;                      // Set its text content
    span.className = 'name-letter';                 // Give it a class for styling
    span.style.opacity = '0';                       // Start invisible
    el.appendChild(span);                           // Add it to the DOM inside nameEl
  });

  const letters = el.querySelectorAll('.name-letter');   // Get all the spans we just created

  // This is the recursive function
  function revealNext() {
    if (index >= letters.length) {
      // All letters revealed. 
      // Wait briefly then hide the cursor.
      setTimeout(() => {
        if (cursor) cursor.style.display = 'none';
        onComplete && onComplete();   // Call the callback if it exists
      }, 400);
      return;   // IMPORTANT: return here to stop the recursion
    }

    // Reveal current letter with GSAP
    gsap.to(letters[index], {
      opacity: 1,
      duration: 0.1,
      onComplete: () => {
        index++;                       // Move to next letter
        setTimeout(revealNext, 100);   // Wait 100ms then reveal the next one
      }
    });
  }

  // Kick off the sequence
  revealNext();
}


/**
 * typewriterEffect
 * Simulates typing by adding one character at a time.
 * This is the classic typewriter animation.
 * 
 * @param {Element} el - The element to type into
 * @param {string} text - The text to type
 * @param {function} onComplete - Callback when typing finishes
 */
function typewriterEffect(el, text, onComplete) {
  let index = 0;
  el.textContent = '';    // Clear anything that might be there

  // Add a typing cursor via CSS pseudo-element
  el.classList.add('typing');

  function typeNext() {
    if (index >= text.length) {
      // Typing done
      el.classList.remove('typing');
      onComplete && onComplete();
      return;
    }

    // Add the next character to the element
    el.textContent += text[index];
    index++;

    // Vary the speed slightly for a more human feel
    // Math.random() returns 0 to 1, so this gives 40–100ms between characters
    const delay = 40 + Math.random() * 60;
    setTimeout(typeNext, delay);
  }

  typeNext();
}


/**
 * initParticles
 * Draws animated particles on the HTML canvas.
 * 
 * CANVAS CONCEPTS:
 * - canvas is an HTML element that gives you a 2D drawing surface
 * - ctx = canvas.getContext('2d') gives you the drawing API
 * - You draw by calling methods like ctx.beginPath(), ctx.arc(), ctx.fill()
 * - For animation, you clear the canvas each frame and redraw everything
 * 
 * @param {HTMLCanvasElement} canvas - The canvas element
 */
function initParticles(canvas) {
  // Get the 2D drawing context — this is how you draw on a canvas
  const ctx = canvas.getContext('2d');

  // Resize canvas to fill the window
  function resizeCanvas() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();

  // Re-resize if the window changes size (rotate phone, resize browser)
  window.addEventListener('resize', resizeCanvas);

  // ── Create the particle data ───────────────────────────────
  // Each particle is a plain JavaScript object — this is called an object literal
  // Properties: x position, y position, size, speed, opacity
  const particles = [];
  const PARTICLE_COUNT = 80;

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    // Math.random() gives a number from 0 to 1 (exclusive)
    // Multiply and add to get values in different ranges
    particles.push({
      x:      Math.random() * canvas.width,     // Random x across the canvas
      y:      Math.random() * canvas.height,    // Random y across the canvas
      radius: Math.random() * 1.5 + 0.3,        // Size: 0.3 to 1.8 pixels
      speedX: (Math.random() - 0.5) * 0.4,      // Horizontal drift (-0.2 to 0.2)
      speedY: (Math.random() - 0.5) * 0.4,      // Vertical drift
      opacity: Math.random() * 0.6 + 0.1,       // Transparency: 0.1 to 0.7
      // Some particles pulse (opacity oscillates)
      pulse: Math.random() > 0.7,
      pulseSpeed: Math.random() * 0.02 + 0.005,
      pulseDir: 1,
    });
  }

  // ── The animation loop ──────────────────────────────────────
  // requestAnimationFrame calls our function before every screen repaint
  // This is the RIGHT way to animate — tied to the display refresh rate
  // NOT setInterval — that can cause stuttering
  function animate() {
    // Clear the entire canvas each frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw each particle
    particles.forEach(p => {
      // Update position
      p.x += p.speedX;
      p.y += p.speedY;

      // Wrap around edges — if particle goes off right, appear on left
      if (p.x < 0)             p.x = canvas.width;
      if (p.x > canvas.width)  p.x = 0;
      if (p.y < 0)             p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;

      // Pulse opacity for breathing particles
      if (p.pulse) {
        p.opacity += p.pulseSpeed * p.pulseDir;
        if (p.opacity >= 0.7 || p.opacity <= 0.1) p.pulseDir *= -1;
      }

      // Draw a circle
      ctx.beginPath();                       // Start a new drawing path
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);  // Draw circle
      ctx.fillStyle = `rgba(0, 212, 255, ${p.opacity})`;  // Electric blue
      ctx.fill();                            // Fill with the color
    });

    // Draw subtle connection lines between nearby particles
    drawConnections(ctx, particles);

    // Request the next frame — this creates the loop
    requestAnimationFrame(animate);
  }

  // Start the animation loop
  animate();
}


/**
 * drawConnections
 * Draws faint lines between particles that are close to each other.
 * This creates the "network / constellation" effect.
 * 
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {Array} particles - The particles array
 */
function drawConnections(ctx, particles) {
  const MAX_DISTANCE = 120;   // Only connect particles within 120px of each other

  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {   // j = i+1 avoids duplicate pairs
      // Calculate distance using the Pythagorean theorem: sqrt(dx² + dy²)
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < MAX_DISTANCE) {
        // The closer the particles, the more opaque the line
        const opacity = (1 - distance / MAX_DISTANCE) * 0.15;

        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);   // Start of line
        ctx.lineTo(particles[j].x, particles[j].y);   // End of line
        ctx.strokeStyle = `rgba(0, 212, 255, ${opacity})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }
  }
}


/**
 * initHeroScrollBehavior
 * Makes the hero's scroll indicator clickable.
 * Also tracks scrolling to know when to mark nav links as active.
 */
function initHeroScrollBehavior() {
  const scrollBtn = document.getElementById('hero-scroll');

  if (scrollBtn) {
    scrollBtn.addEventListener('click', () => {
      // Smoothly scroll to the #about section
      const aboutSection = document.getElementById('about');
      if (aboutSection) {
        aboutSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }
}


/**
 * initHeroMouseParallax
 * Makes the hero content slightly shift based on mouse position.
 * This creates a subtle depth/parallax feel.
 */
function initHeroMouseParallax() {
  const heroContent = document.querySelector('.hero-content');
  if (!heroContent) return;

  // Listen for mouse movement across the entire document
  document.addEventListener('mousemove', (e) => {
    // Calculate offset from center (-0.5 to 0.5)
    const xOffset = (e.clientX / window.innerWidth - 0.5) * 10;   // Max 10px shift
    const yOffset = (e.clientY / window.innerHeight - 0.5) * 6;   // Max 6px shift

    // Apply the transform — GSAP makes this smooth
    gsap.to(heroContent, {
      x: xOffset,
      y: yOffset,
      duration: 1.5,
      ease: 'power1.out',
    });
  });
}
