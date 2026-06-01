/**
 * sections/contact.js
 * ─────────────────────────────────────────────────────────
 * Scene 4 — The Guild Board
 * Handles the contact form with validation and submission.
 *
 * LEARNING CONCEPTS IN THIS FILE:
 * - Form events: submit, input
 * - e.preventDefault() — stop default form behavior
 * - Form validation — checking required fields
 * - Regular expressions (regex) — email validation
 * - Async/await — handling asynchronous operations
 * - Try/catch — handling errors gracefully
 * - DOM manipulation for feedback states
 * - Fetch API — sending HTTP requests
 */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { fadeInOnScroll } from '../utils/animations.js';

gsap.registerPlugin(ScrollTrigger);


/**
 * VALIDATION RULES
 * ─────────────────────────────────────────────────────────
 * An object that maps field names to their validation functions.
 * Each function receives the field value and returns an error message
 * string if invalid, or empty string '' if valid.
 * 
 * This is a "strategy pattern" — behavior is stored in data (objects/functions),
 * not hardcoded in if/else chains.
 */
const VALIDATORS = {
  name: (value) => {
    if (!value.trim()) return 'Requester name is required.';
    if (value.trim().length < 2) return 'Name must be at least 2 characters.';
    return '';   // Empty string = no error = valid
  },

  email: (value) => {
    if (!value.trim()) return 'Contact scroll (email) is required.';
    // Regular expression for email validation
    // This pattern checks for: something@something.something
    // /pattern/flags — i flag = case insensitive
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return 'Please enter a valid email address.';
    return '';
  },

  subject: (value) => {
    if (!value.trim()) return 'Quest title is required.';
    if (value.trim().length < 3) return 'Quest title must be at least 3 characters.';
    return '';
  },

  message: (value) => {
    if (!value.trim()) return 'Quest details are required.';
    if (value.trim().length < 20) return 'Please provide more detail (at least 20 characters).';
    return '';
  },
};


/**
 * initContact
 * Main entry point for the contact section.
 */
export function initContact() {
  // ── 1. Set up form validation and submission ───────────────
  initForm();

  // ── 2. Animate section elements on scroll ─────────────────
  initContactReveal();
}


/**
 * initForm
 * Wires up form behavior:
 * - Real-time validation on input blur (when user leaves a field)
 * - Form validation on submit
 * - Fake async submission with loading state
 */
function initForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  // Get all the form field elements
  const fields = {
    name:    document.getElementById('form-name'),
    email:   document.getElementById('form-email'),
    subject: document.getElementById('form-subject'),
    message: document.getElementById('form-message'),
  };

  const submitBtn = document.getElementById('form-submit');

  // ── Real-time validation on blur ──────────────────────────
  // 'blur' fires when the user LEAVES a field (clicks away)
  // This gives feedback after they've tried to fill something in
  // (Not on every keystroke — that would be annoying)

  Object.entries(fields).forEach(([fieldName, fieldEl]) => {
    // Object.entries() converts an object to an array of [key, value] pairs
    // We're iterating: ['name', inputEl], ['email', inputEl], etc.
    if (!fieldEl) return;

    fieldEl.addEventListener('blur', () => {
      validateField(fieldName, fieldEl);   // Check this field when user leaves it
    });

    // Also clear the error on input (when user starts typing again)
    fieldEl.addEventListener('input', () => {
      clearFieldError(fieldEl, `form-${fieldName}-error`);
    });
  });

  // ── Form submission ────────────────────────────────────────
  // 'submit' fires when the form is submitted (Enter or button click)
  form.addEventListener('submit', async (e) => {
    // e.preventDefault() CRITICAL — stops the default behavior:
    // Without this, the page would REFRESH and lose all data.
    // This is one of the most important patterns in frontend dev.
    e.preventDefault();

    // Validate ALL fields before submitting
    let isValid = true;

    Object.entries(fields).forEach(([fieldName, fieldEl]) => {
      if (!fieldEl) return;
      const fieldError = validateField(fieldName, fieldEl);
      if (fieldError) isValid = false;
    });

    if (!isValid) {
      // Focus the first invalid field
      const firstInvalid = form.querySelector('.form-input.error');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    // Collect form data
    const formData = {
      name:    fields.name?.value.trim(),
      email:   fields.email?.value.trim(),
      subject: fields.subject?.value.trim(),
      message: fields.message?.value.trim(),
    };

    // Start submission
    await submitForm(formData, submitBtn, form);
  });
}


/**
 * validateField
 * Validates a single form field and updates the UI.
 * 
 * @param {string} fieldName - Key in VALIDATORS object
 * @param {Element} fieldEl - The input element
 * @returns {string} Error message, or '' if valid
 */
function validateField(fieldName, fieldEl) {
  const validator = VALIDATORS[fieldName];
  if (!validator) return '';

  const errorMessage = validator(fieldEl.value);
  const errorEl = document.getElementById(`form-${fieldName}-error`);

  if (errorMessage) {
    // Show error state
    fieldEl.classList.add('error');
    fieldEl.classList.remove('valid');
    if (errorEl) errorEl.textContent = errorMessage;
  } else {
    // Clear error state
    fieldEl.classList.remove('error');
    fieldEl.classList.add('valid');
    if (errorEl) errorEl.textContent = '';
  }

  return errorMessage;
}


/**
 * clearFieldError
 * Removes error styling from a field while the user is typing.
 */
function clearFieldError(fieldEl, errorElId) {
  if (fieldEl.classList.contains('error')) {
    fieldEl.classList.remove('error');
    const errorEl = document.getElementById(errorElId);
    if (errorEl) errorEl.textContent = '';
  }
}


/**
 * submitForm
 * Handles the form submission with proper async handling.
 * 
 * ASYNC/AWAIT EXPLAINED:
 * - JavaScript is single-threaded — it can only do one thing at a time
 * - Some operations take time (network requests, timers)
 * - `async` marks a function as asynchronous
 * - `await` pauses execution until a Promise resolves
 * - Without await, the code would continue before the operation finishes
 * 
 * TRY/CATCH:
 * - Network requests can fail (no internet, server down)
 * - try/catch lets you handle errors gracefully instead of crashing
 * - Always wrap fetch() in try/catch
 * 
 * @param {Object} formData - The validated form values
 * @param {Element} submitBtn - The submit button (to show loading state)
 * @param {Element} form - The form element (to hide after success)
 */
async function submitForm(formData, submitBtn, form) {
  // ── Loading state ──────────────────────────────────────────
  const originalBtnText = submitBtn.querySelector('.btn-text').textContent;
  submitBtn.disabled = true;
  submitBtn.querySelector('.btn-text').textContent = 'SENDING...';
  submitBtn.querySelector('.btn-icon').textContent = '↻';

  try {
    // ── In a real project, this would be a fetch() call ───────
    // Example of what it would look like:
    //
    // const response = await fetch('/api/contact', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(formData),   // Convert object to JSON string
    // });
    //
    // if (!response.ok) throw new Error('Server error');
    //
    // const data = await response.json();   // Parse the JSON response
    
    // For now: simulate a network delay with a Promise + setTimeout
    // In real life, this would be replaced with the fetch() call above
    await simulateNetworkRequest(formData);

    // ── Success state ──────────────────────────────────────────
    showSuccess(form);

  } catch (error) {
    // ── Error state ────────────────────────────────────────────
    // The catch block runs if anything in try throws an error
    console.error('Form submission failed:', error);

    // Re-enable button
    submitBtn.disabled = false;
    submitBtn.querySelector('.btn-text').textContent = originalBtnText;
    submitBtn.querySelector('.btn-icon').textContent = '⚔';

    // Show error message to user
    showFormError('Transmission failed. Please try again or contact me directly.');
  }
}


/**
 * simulateNetworkRequest
 * Pretends to send data to a server.
 * Replace this with real fetch() in production.
 * 
 * PROMISES EXPLAINED:
 * A Promise is a placeholder for a value that isn't ready yet.
 * new Promise((resolve, reject) => ...) creates one.
 * resolve() = success, reject() = failure.
 * await waits for the Promise to resolve or reject.
 */
function simulateNetworkRequest(formData) {
  console.log('📨 Form data ready to send:', formData);  // Remove in production

  return new Promise((resolve) => {
    setTimeout(resolve, 1800);   // Resolve after 1.8 seconds
  });
}


/**
 * showSuccess
 * Hides the form and shows the "Quest Accepted" stamp.
 */
function showSuccess(form) {
  const successEl = document.getElementById('form-success');
  if (!successEl) return;

  // Animate the form out
  gsap.to(form, {
    opacity: 0,
    y: -20,
    duration: 0.5,
    ease: 'power2.in',
    onComplete: () => {
      form.hidden = true;           // Hide from layout
      successEl.hidden = false;     // Show success state

      // Animate success stamp in
      gsap.from('.success-stamp', {
        scale: 3,
        opacity: 0,
        rotation: -15,
        duration: 0.6,
        ease: 'back.out(1.7)',   // Bouncy ease for stamp feel
      });

      gsap.from('.success-message', {
        opacity: 0,
        y: 20,
        duration: 0.5,
        delay: 0.4,
      });
    },
  });
}


/**
 * showFormError
 * Shows a global error message below the form.
 */
function showFormError(message) {
  // Remove any existing error message
  const existing = document.getElementById('form-global-error');
  if (existing) existing.remove();

  const errorEl = document.createElement('p');   // Create a new <p> element
  errorEl.id = 'form-global-error';
  errorEl.className = 'form-error';
  errorEl.style.textAlign = 'center';
  errorEl.style.marginTop = '16px';
  errorEl.textContent = message;
  errorEl.setAttribute('role', 'alert');    // Screen readers announce this immediately

  const form = document.getElementById('contact-form');
  if (form) form.after(errorEl);   // Insert after the form

  // Auto-remove after 5 seconds
  setTimeout(() => errorEl.remove(), 5000);
}


/**
 * initContactReveal
 * Scroll animations for the contact section.
 */
function initContactReveal() {
  fadeInOnScroll('.contact-board', { y: 40, duration: 0.8 });
  fadeInOnScroll('.contact-info',  { y: 40, duration: 0.8, delay: 0.2 });

  // Animate guild links with stagger
  gsap.from('.guild-link', {
    opacity: 0,
    x: 30,
    duration: 0.5,
    stagger: 0.1,
    scrollTrigger: {
      trigger: '.guild-emblems',
      start: 'top 85%',
      once: true,
    }
  });
}
