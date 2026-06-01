/**
 * sections/projects.js
 * ─────────────────────────────────────────────────────────
 * Scene 3 — The Quest Log
 * Renders project cards dynamically and handles filtering.
 *
 * LEARNING CONCEPTS IN THIS FILE:
 * - Array of objects (more complex — nested data)
 * - Array.map() — transform data into HTML
 * - Array.filter() — filter by category
 * - Event delegation — one listener handles all filter buttons
 * - innerHTML to inject generated HTML
 * - GSAP stagger animations on scroll
 * - Template literals for multi-line HTML strings
 */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);


/**
 * THE PROJECTS DATA
 * ─────────────────────────────────────────────────────────
 * This is your portfolio data. Edit this to add/remove projects.
 * 
 * STRUCTURE of each project:
 * - id:         Unique identifier string
 * - title:      Project name
 * - type:       Display category label
 * - category:   Matches the filter button data-filter values
 * - rank:       RPG difficulty rank (D/C/B/A/S)
 * - rankColor:  CSS color for the rank badge
 * - description: 1-2 sentence summary
 * - tech:       Array of technology strings
 * - status:     'completed' | 'progress' | 'planned'
 * - liveUrl:    URL to live demo (or '#' if none)
 * - repoUrl:    URL to GitHub repo (or '#' if none)
 */
const PROJECTS = [
  {
    id: 'web3-dapp',
    title: 'DeFi Dashboard',
    type: 'WEB3 FRONTEND',
    category: 'web3',
    rank: 'A',
    rankColor: '#ffd700',
    description: 'Full-featured DeFi interface with wallet connection, live price feeds, and smart contract interactions via ethers.js. Supports multiple chains.',
    tech: ['React', 'ethers.js', 'wagmi', 'TypeScript', 'TailwindCSS'],
    status: 'completed',
    liveUrl: '#',
    repoUrl: '#',
  },
  {
    id: 'web3-nft',
    title: 'NFT Mint Interface',
    type: 'WEB3 / SMART CONTRACT',
    category: 'web3',
    rank: 'B',
    rankColor: '#00d4ff',
    description: 'Clean NFT minting interface connected to a Solidity ERC-721 contract. Includes wallet authentication, mint progress, and rarity reveal.',
    tech: ['React', 'Solidity', 'ethers.js', 'IPFS', 'OpenZeppelin'],
    status: 'completed',
    liveUrl: '#',
    repoUrl: '#',
  },
  {
    id: 'ai-chat',
    title: 'AI Chat Interface',
    type: 'AI INTEGRATION',
    category: 'ai',
    rank: 'B',
    rankColor: '#8b5cf6',
    description: 'Custom frontend for an LLM-powered chat system. Streaming responses, conversation history, and system prompt configuration built in.',
    tech: ['Vanilla JS', 'Fetch API', 'CSS', 'OpenAI API', 'WebSockets'],
    status: 'completed',
    liveUrl: '#',
    repoUrl: '#',
  },
  {
    id: 'react-dashboard',
    title: 'Analytics Dashboard',
    type: 'FRONTEND',
    category: 'frontend',
    rank: 'C',
    rankColor: '#00ff88',
    description: 'Data visualization dashboard built with React. Charts, filterable tables, and real-time data polling. Responsive layout for all screen sizes.',
    tech: ['React', 'Chart.js', 'CSS Modules', 'REST API'],
    status: 'completed',
    liveUrl: '#',
    repoUrl: '#',
  },
  {
    id: 'anime-portfolio',
    title: 'Anime Portfolio',
    type: 'CREATIVE DEV',
    category: 'creative',
    rank: 'B',
    rankColor: '#ff2d55',
    description: 'Anime-themed interactive portfolio site. Particle backgrounds, RPG character sheet, quest log projects, GSAP animations throughout.',
    tech: ['HTML', 'CSS', 'Vanilla JS', 'GSAP', 'Vite'],
    status: 'progress',
    liveUrl: '#',
    repoUrl: '#',
  },
  {
    id: 'landing-page',
    title: 'SaaS Landing Page',
    type: 'FRONTEND',
    category: 'frontend',
    rank: 'C',
    rankColor: '#00ff88',
    description: 'High-converting SaaS landing page with scroll animations, pricing section, testimonials, and mobile-optimized layout.',
    tech: ['HTML', 'CSS', 'JavaScript', 'GSAP'],
    status: 'completed',
    liveUrl: '#',
    repoUrl: '#',
  },
];


// Track currently active filter
let activeFilter = 'all';


/**
 * initProjects
 * Main entry point for the projects section.
 */
export function initProjects() {
  // ── 1. Render all project cards ────────────────────────────
  renderProjects(PROJECTS);

  // ── 2. Set up filter button behavior ──────────────────────
  initFilters();

  // ── 3. Animate cards on scroll ────────────────────────────
  initCardAnimations();
}


/**
 * renderProjects
 * Takes an array of project objects and renders their HTML.
 * 
 * THIS IS THE CORE PATTERN — understand this and you understand React:
 * DATA (JS array) → TRANSFORM (.map()) → HTML STRING → DOM (.innerHTML)
 * 
 * @param {Array} projects - The projects to render
 */
function renderProjects(projects) {
  const grid = document.getElementById('projects-grid');
  if (!grid) return;

  if (projects.length === 0) {
    grid.innerHTML = `
      <div class="no-projects">
        <p>No quests found in this category.</p>
      </div>
    `;
    return;
  }

  // Map each project to its HTML card string
  const cardsHTML = projects.map(project => createCardHTML(project)).join('');

  // Set the innerHTML all at once (more efficient than appending one by one)
  grid.innerHTML = cardsHTML;
}


/**
 * createCardHTML
 * Creates the HTML string for a single quest card.
 * 
 * This is essentially a "component" in vanilla JS — 
 * a function that takes data and returns HTML.
 * In React, this would be a function component returning JSX.
 * 
 * @param {Object} project - One project from the PROJECTS array
 * @returns {string} - HTML string for the card
 */
function createCardHTML(project) {
  // Map status to display text and CSS class
  const statusMap = {
    'completed': { text: 'COMPLETED', class: 'status-completed' },
    'progress':  { text: 'IN PROGRESS', class: 'status-progress' },
    'planned':   { text: 'PLANNED', class: 'status-planned' },
  };
  const statusInfo = statusMap[project.status] || statusMap['planned'];

  // Build tech tags HTML
  // Array.map() on the tech array, then join into a single string
  const techTagsHTML = project.tech
    .map(t => `<span class="tech-tag">${t}</span>`)
    .join('');

  // Return the full card HTML
  return `
    <article 
      class="quest-card" 
      data-category="${project.category}"
      data-id="${project.id}"
      aria-label="Quest: ${project.title}"
      style="--card-accent: ${project.rankColor};"
    >
      <!-- Card Header: Rank Badge + Status -->
      <div class="card-header">
        <span class="card-rank" style="color: ${project.rankColor};" aria-label="Rank ${project.rank}">
          ${project.rank}
        </span>
        <span class="card-status ${statusInfo.class}" aria-label="Status: ${statusInfo.text}">
          ${statusInfo.text}
        </span>
      </div>

      <!-- Category type -->
      <p class="card-type">${project.type}</p>

      <!-- Project title -->
      <h3 class="card-title">${project.title}</h3>

      <!-- Description -->
      <p class="card-desc">${project.description}</p>

      <!-- Tech tags — "Required Skills" -->
      <div class="card-tech" aria-label="Technologies used">
        ${techTagsHTML}
      </div>

      <!-- Action buttons -->
      <div class="card-actions">
        <a 
          href="${project.liveUrl}" 
          class="card-btn card-btn--primary"
          id="card-live-${project.id}"
          ${project.liveUrl === '#' ? 'aria-disabled="true"' : 'target="_blank" rel="noopener noreferrer"'}
          aria-label="View ${project.title} live demo"
        >
          ▶ LIVE DEMO
        </a>
        <a 
          href="${project.repoUrl}" 
          class="card-btn"
          id="card-repo-${project.id}"
          ${project.repoUrl === '#' ? 'aria-disabled="true"' : 'target="_blank" rel="noopener noreferrer"'}
          aria-label="View ${project.title} repository"
        >
          ⌥ REPOSITORY
        </a>
      </div>
    </article>
  `;
}


/**
 * initFilters
 * Handles the filter button clicks.
 * 
 * CONCEPT: Event Delegation
 * Instead of adding a click listener to EACH button (6 listeners),
 * we add ONE listener to the parent container.
 * When any button is clicked, the event "bubbles up" to the parent.
 * We check which button was clicked using event.target.
 * 
 * WHY THIS IS BETTER:
 * - Fewer event listeners = better memory usage
 * - Works even if buttons are added dynamically later
 * - React uses this pattern internally too
 */
function initFilters() {
  // The parent container of all filter buttons
  const filterContainer = document.getElementById('projects-filters');
  if (!filterContainer) return;

  // ONE listener on the parent
  filterContainer.addEventListener('click', (event) => {
    // event.target = the specific element that was clicked
    // .closest() walks up the DOM tree to find the nearest matching element
    // This handles clicks on child elements inside the button too
    const btn = event.target.closest('.filter-btn');
    if (!btn) return;   // Click wasn't on a filter button

    // Get the filter value from the button's data attribute
    const filter = btn.dataset.filter;   // data-filter="web3" → 'web3'
    if (filter === activeFilter) return;   // Already on this filter

    // Update active state
    activeFilter = filter;

    // Remove 'active' from all buttons, add to clicked one
    filterContainer.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // Apply the filter
    filterCards(filter);
  });
}


/**
 * filterCards
 * Shows/hides cards based on the selected category.
 * 
 * APPROACH: We don't re-render the HTML — we show/hide existing cards.
 * This is more efficient for small datasets.
 * 
 * Alternative for large datasets: Re-render with renderProjects(filtered)
 * 
 * @param {string} filter - The category to show, or 'all'
 */
function filterCards(filter) {
  const cards = document.querySelectorAll('.quest-card');
  // querySelectorAll returns a NodeList — similar to an array

  cards.forEach(card => {
    const category = card.dataset.category;   // Get the card's category

    if (filter === 'all' || category === filter) {
      // Show this card
      card.classList.remove('filtered-out');
      // Re-animate with GSAP
      gsap.fromTo(card,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
      );
    } else {
      // Hide this card
      card.classList.add('filtered-out');
    }
  });
}


/**
 * initCardAnimations
 * Animates cards in with a stagger when the section scrolls into view.
 */
function initCardAnimations() {
  // We need to wait a tick for the DOM to be ready
  // requestAnimationFrame ensures the browser has painted before we query
  requestAnimationFrame(() => {
    const cards = document.querySelectorAll('.quest-card');
    if (!cards.length) return;

    gsap.from(cards, {
      opacity: 0,
      y: 40,
      duration: 0.6,
      stagger: 0.1,           // 0.1 seconds between each card
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '#projects-grid',
        start: 'top 85%',
        once: true,
      }
    });
  });
}
