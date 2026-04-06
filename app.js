/**
 * app.js — router + page registry
 *
 * ── HOW TO ADD A NEW DEMO ────────────────────────────────────────────────────
 *  1. Create pages/your-demo.js  (export render + optional init)
 *  2. Add an import below
 *  3. Push an entry into the `pages` array
 *  That's it. The navbar and home page update automatically.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { renderNavbar } from './components/navbar.js';
import { render as renderHome } from './pages/home.js';
import { render as renderTipCalculator } from './pages/tip-calculator.js';
import { render as renderShoppingList } from './pages/shopping-list.js';
import { render as renderUnitConverter } from './pages/unit-converter.js';
import { render as renderChrono } from './pages/chrono.js';
import { render as renderQuickNotes } from './pages/quick-notes.js';
import { render as renderRandomPicker } from './pages/random-picker.js';
import { render as renderMagicEightBall } from './pages/magic-eight-ball.js';
import { render as renderCalculator } from './pages/calculator.js';
import { render as renderAbout } from './pages/about.js';
import { renderFooter } from './components/footer.js';

// ── Page registry ─────────────────────────────────────────────────────────────
// id       → matches the URL hash  (#tip-calculator)
// label    → shown in navbar dropdown + home cards
// description → shown on home page cards only
// icon     → Bootstrap Icon class (https://icons.getbootstrap.com)
// render   → the page's render function; receives (container, pages)

const pages = [
  {
    id: 'home',
    label: 'Home',
    description: '',
    icon: 'bi-house',
    render: renderHome,
  },
  {
    id: 'about',
    label: 'About',
    description: '',
    icon: 'bi-info-circle',
    render: renderAbout,
  },
  {
    id: 'tip-calculator',
    label: 'Tip Calculator',
    description: 'Split any bill with a customisable tip percentage.',
    icon: 'bi-cash-coin',
    render: renderTipCalculator,
  },
  {
    id: 'shopping-list',
    label: 'Shopping List',
    description: 'Fast grocery list you can check off and persist across visits.',
    icon: 'bi-list-check',
    render: renderShoppingList,
  },
  {
    id: 'unit-converter',
    label: 'Unit Converter',
    description: 'Common conversions for cooking, weight, temperature, and length.',
    icon: 'bi-arrows-collapse',
    render: renderUnitConverter,
  },
  {
    id: 'chrono',
    label: 'Chrono',
    description: 'Real-time clock visualizations and a precise stopwatch.',
    icon: 'bi-stopwatch',
    render: renderChrono,
  },
  {
    id: 'quick-notes',
    label: 'Quick Notes',
    description: 'Multi-note scratchpad with autosave.',
    icon: 'bi-journal-text',
    render: renderQuickNotes,
  },
  {
    id: 'random-picker',
    label: 'Random Picker',
    description: "Can't decide? Let fate choose an option for you.",
    icon: 'bi-dice-6',
    render: renderRandomPicker,
  },
  {
    id: 'magic-eight-ball',
    label: 'Magic Eight Ball',
    description: 'Ask a question and seek the wisdom of the ball.',
    icon: 'bi-8-circle',
    render: renderMagicEightBall,
  },
  {
    id: 'calculator',
    label: 'Calculator',
    description: 'A basic arithmetic calculator for quick calculations.',
    icon: 'bi-calculator',
    render: renderCalculator,
  },
  // ── Add more demos here ──────────────────────────────────────────────────
  // {
  //   id: 'word-counter',
  //   label: 'Word Counter',
  //   description: 'Paste text and see word, sentence, and character counts.',
  //   icon: 'bi-body-text',
  //   render: renderWordCounter,
  // },
];

// ── Router ────────────────────────────────────────────────────────────────────

const app = document.getElementById('app');

function getPageId() {
  const hash = window.location.hash.replace('#', '').trim();
  return hash || 'home';
}

function navigate() {
  const id = getPageId();
  const page = pages.find((p) => p.id === id) ?? pages[0];

  // Rebuild navbar with active state
  renderNavbar(pages, id);

  // Clear and render page — class triggers brand.css page-enter animation
  app.innerHTML = '';
  app.classList.remove('page-enter');
  void app.offsetWidth; // force reflow so re-adding the class re-triggers
  app.classList.add('page-enter');

  // Home receives the full pages list so it can generate cards
  if (page.id === 'home') {
    page.render(app, pages);
  } else {
    page.render(app, pages);
  }

  // Scroll to top on navigation
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // ensure footer stays populated (it lives outside #app so rendering pages won't clear it)
  renderFooter();
}

// Listen for hash changes (back/forward + link clicks)
window.addEventListener('hashchange', navigate);

// Initial load
navigate();

// render footer once
renderFooter();

// Listen for hash changes (back/forward + link clicks)
window.addEventListener('hashchange', navigate);

// Initial load
navigate();
