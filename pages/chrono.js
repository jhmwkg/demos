/**
 * pages/chrono.js
 *
 * Dual-tab time widget:
 * - Now: Real-time radial clock, calendar progress, moon phase
 * - Stopwatch: Precise timer with millisecond accuracy
 */

import store from '../store.js';

const STORE_KEY_TAB = 'chrono-active-tab';
const STORE_KEY_STOPWATCH = 'chrono-stopwatch-state';
const LUNAR_CYCLE = 29.530588853;
const KNOWN_NEW_MOON = new Date('2000-01-06T18:14:00Z');

// Module-level state
let activeTab = 'now';
let nowAnimationId = null;
let stopwatchInterval = null;
let stopwatchState = {
  running: false,
  startTime: null,
  elapsed: 0
};

export function render(container) {
  // Load saved tab preference
  activeTab = store.get(STORE_KEY_TAB) || 'now';

  container.innerHTML = `
    <div class="row justify-content-center">
      <div class="col-12 col-lg-10">
        <h2 class="fw-bold mb-1">Chrono</h2>
        <p class="text-body-secondary mb-4">Real-time visualizations and precise timing.</p>

        <!-- Tab Navigation -->
        <ul class="nav nav-tabs mb-4" role="tablist">
          <li class="nav-item">
            <button class="nav-link ${activeTab === 'now' ? 'active' : ''}"
                    data-tab="now"
                    type="button">
              Now
            </button>
          </li>
          <li class="nav-item">
            <button class="nav-link ${activeTab === 'stopwatch' ? 'active' : ''}"
                    data-tab="stopwatch"
                    type="button">
              Stopwatch
            </button>
          </li>
        </ul>

        <!-- Tab Content -->
        <div id="tab-content"></div>
      </div>
    </div>`;

  init(container);
}

export function init(container) {
  const tabButtons = container.querySelectorAll('[data-tab]');
  const tabContent = container.querySelector('#tab-content');

  // Tab switching
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const newTab = btn.getAttribute('data-tab');
      switchTab(newTab, tabButtons, tabContent);
    });
  });

  // Render initial tab
  renderTabContent(activeTab, tabContent);

  // Cleanup on navigation away
  container._cleanup = () => {
    cleanupNowTab();
    cleanupStopwatchTab();
  };
}

// ── Tab Management ──────────────────────────────────────────────────────────

function switchTab(newTab, tabButtons, tabContent) {
  // Cleanup old tab
  if (activeTab === 'now') {
    cleanupNowTab();
  } else {
    cleanupStopwatchTab();
  }

  // Update active state
  activeTab = newTab;
  tabButtons.forEach(btn => {
    if (btn.getAttribute('data-tab') === newTab) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Save preference
  store.set(STORE_KEY_TAB, newTab);

  // Render new tab
  renderTabContent(newTab, tabContent);
}

function renderTabContent(tab, container) {
  if (tab === 'now') {
    renderNowTab(container);
  } else {
    renderStopwatchTab(container);
  }
}

// ── Now Tab ─────────────────────────────────────────────────────────────────

function renderNowTab(container) {
  container.innerHTML = `
    <div class="row g-4">
      <!-- Time Radial -->
      <div class="col-12 col-md-4">
        <div class="card border-0 shadow-sm p-4 text-center h-100">
          <h5 class="card-title mb-3">Time</h5>
          <div id="time-radial" class="d-flex justify-content-center"></div>
        </div>
      </div>

      <!-- Calendar Radial -->
      <div class="col-12 col-md-4">
        <div class="card border-0 shadow-sm p-4 text-center h-100">
          <h5 class="card-title mb-3">Calendar</h5>
          <div id="calendar-radial" class="d-flex justify-content-center"></div>
        </div>
      </div>

      <!-- Moon Phase -->
      <div class="col-12 col-md-4">
        <div class="card border-0 shadow-sm p-4 text-center h-100">
          <h5 class="card-title mb-3">Moon Phase</h5>
          <div id="moon-phase" class="d-flex flex-column align-items-center"></div>
        </div>
      </div>
    </div>`;

  initNowTab(container);
}

function initNowTab(container) {
  const timeContainer = container.querySelector('#time-radial');
  const calendarContainer = container.querySelector('#calendar-radial');
  const moonContainer = container.querySelector('#moon-phase');

  // Build SVG elements
  buildTimeRadial(timeContainer);
  buildCalendarRadial(calendarContainer);
  buildMoonPhase(moonContainer);

  // Start animation
  animateNow(timeContainer, calendarContainer);
}

function buildTimeRadial(container) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 200 200');
  svg.setAttribute('width', '200');
  svg.setAttribute('height', '200');
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', 'Current time shown as a radial clock');

  svg.innerHTML = `
    <!-- Hours (outer) -->
    <circle cx="100" cy="100" r="90" fill="none" stroke="#E2E8F0" stroke-width="2"/>
    <circle id="hour-progress" cx="100" cy="100" r="90" fill="none" stroke="#2563EB" stroke-width="8"
            stroke-dasharray="565.48" stroke-dashoffset="565.48"
            transform="rotate(-90 100 100)" stroke-linecap="round"/>

    <!-- Minutes (middle) -->
    <circle cx="100" cy="100" r="65" fill="none" stroke="#E2E8F0" stroke-width="2"/>
    <circle id="minute-progress" cx="100" cy="100" r="65" fill="none" stroke="#2563EB" stroke-width="6"
            stroke-dasharray="408.41" stroke-dashoffset="408.41"
            transform="rotate(-90 100 100)" stroke-linecap="round"/>

    <!-- Seconds (inner) -->
    <circle cx="100" cy="100" r="40" fill="none" stroke="#E2E8F0" stroke-width="2"/>
    <circle id="second-progress" cx="100" cy="100" r="40" fill="none" stroke="#0D9488" stroke-width="4"
            stroke-dasharray="251.33" stroke-dashoffset="251.33"
            transform="rotate(-90 100 100)" stroke-linecap="round"/>

    <!-- Center dot -->
    <circle cx="100" cy="100" r="5" fill="#0F172A"/>

    <!-- Digital time -->
    <text id="time-text" x="100" y="175" text-anchor="middle" font-size="14" fill="#64748B" font-family="var(--font-mono)">
      00:00:00
    </text>`;

  container.appendChild(svg);
}

function buildCalendarRadial(container) {
  // Create wrapper for both radials
  const wrapper = document.createElement('div');
  wrapper.className = 'd-flex flex-column align-items-center gap-3';

  // Build day radial
  const daySvg = buildDayRadial();
  wrapper.appendChild(daySvg);

  // Build month radial
  const monthSvg = buildMonthRadial();
  wrapper.appendChild(monthSvg);

  container.appendChild(wrapper);
}

function buildDayRadial() {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 200 200');
  svg.setAttribute('width', '200');
  svg.setAttribute('height', '200');
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', 'Current date shown as a progress circle');

  svg.innerHTML = `
    <!-- Background -->
    <circle cx="100" cy="100" r="80" fill="none" stroke="#E2E8F0" stroke-width="20"/>

    <!-- Progress -->
    <circle id="calendar-progress" cx="100" cy="100" r="80" fill="none" stroke="#2563EB" stroke-width="20"
            stroke-dasharray="502.65" stroke-dashoffset="502.65"
            transform="rotate(-90 100 100)" stroke-linecap="round"/>

    <!-- Day number -->
    <text id="day-text" x="100" y="105" text-anchor="middle" font-size="48" font-weight="bold" fill="#0F172A">
      1
    </text>

    <!-- Month/Year -->
    <text id="month-text" x="100" y="130" text-anchor="middle" font-size="14" fill="#64748B" font-family="var(--font-mono)">
      January 2026
    </text>`;

  return svg;
}

function buildMonthRadial() {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 150 150');
  svg.setAttribute('width', '150');
  svg.setAttribute('height', '150');
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', 'Current month shown as year progress');

  svg.innerHTML = `
    <!-- Background -->
    <circle cx="75" cy="75" r="60" fill="none" stroke="#E2E8F0" stroke-width="16"/>

    <!-- Progress -->
    <circle id="month-progress" cx="75" cy="75" r="60" fill="none" stroke="#2563EB" stroke-width="16"
            stroke-dasharray="376.99" stroke-dashoffset="376.99"
            transform="rotate(-90 75 75)" stroke-linecap="round"/>

    <!-- Month number -->
    <text id="month-number" x="75" y="78" text-anchor="middle" font-size="32" font-weight="bold" fill="#0F172A">
      1
    </text>

    <!-- "of 12" label -->
    <text x="75" y="98" text-anchor="middle" font-size="12" fill="#64748B">
      of 12
    </text>`;

  return svg;
}

function buildMoonPhase(container) {
  const { phaseName, phase } = getMoonPhase();

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 100 100');
  svg.setAttribute('width', '100');
  svg.setAttribute('height', '100');
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', `Moon phase: ${phaseName}`);

  // Calculate shadow position based on phase
  const shadowOffset = (phase < 0.5) ? -40 + (phase * 160) : 40 - ((phase - 0.5) * 160);

  svg.innerHTML = `
    <defs>
      <clipPath id="moonClip">
        <circle cx="50" cy="50" r="40"/>
      </clipPath>
    </defs>

    <!-- Moon background -->
    <circle cx="50" cy="50" r="40" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="2"/>

    <!-- Shadow overlay -->
    <ellipse cx="${50 + shadowOffset}" cy="50" rx="40" ry="40"
             fill="#1E293B" opacity="0.7" clip-path="url(#moonClip)"/>`;

  container.appendChild(svg);

  // Phase name
  const phaseNameEl = document.createElement('p');
  phaseNameEl.className = 'small text-body-secondary mt-3 mb-0';
  phaseNameEl.textContent = phaseName;
  container.appendChild(phaseNameEl);
}

function animateNow(timeContainer, calendarContainer) {
  function update() {
    // Update time radial
    const { hourProgress, minuteProgress, secondProgress, timeStr } = getTimeProgress();
    const hourCircle = timeContainer.querySelector('#hour-progress');
    const minuteCircle = timeContainer.querySelector('#minute-progress');
    const secondCircle = timeContainer.querySelector('#second-progress');
    const timeText = timeContainer.querySelector('#time-text');

    if (hourCircle && minuteCircle && secondCircle && timeText) {
      hourCircle.setAttribute('stroke-dashoffset', 565.48 * (1 - hourProgress));
      minuteCircle.setAttribute('stroke-dashoffset', 408.41 * (1 - minuteProgress));
      secondCircle.setAttribute('stroke-dashoffset', 251.33 * (1 - secondProgress));
      timeText.textContent = timeStr;
    }

    // Update day radial
    const { day, month, year, progress } = getCalendarProgress();
    const calendarCircle = calendarContainer.querySelector('#calendar-progress');
    const dayText = calendarContainer.querySelector('#day-text');
    const monthText = calendarContainer.querySelector('#month-text');

    if (calendarCircle && dayText && monthText) {
      calendarCircle.setAttribute('stroke-dashoffset', 502.65 * (1 - progress));
      dayText.textContent = day;
      monthText.textContent = `${month} ${year}`;
    }

    // Update month radial
    const { month: monthNum, progress: monthProgress } = getYearProgress();
    const monthCircle = calendarContainer.querySelector('#month-progress');
    const monthNumber = calendarContainer.querySelector('#month-number');

    if (monthCircle && monthNumber) {
      monthCircle.setAttribute('stroke-dashoffset', 376.99 * (1 - monthProgress));
      monthNumber.textContent = monthNum;
    }

    nowAnimationId = requestAnimationFrame(update);
  }

  update();
}

function getTimeProgress() {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();

  return {
    hourProgress: hours / 24,
    minuteProgress: minutes / 60,
    secondProgress: seconds / 60,
    timeStr: `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  };
}

function getCalendarProgress() {
  const now = new Date();
  const day = now.getDate();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

  return {
    day,
    month: now.toLocaleString('default', { month: 'long' }),
    year: now.getFullYear(),
    progress: day / daysInMonth
  };
}

function getYearProgress() {
  const now = new Date();
  const month = now.getMonth() + 1; // 1-12

  return {
    month,
    progress: month / 12
  };
}

function getMoonPhase() {
  const now = new Date();
  const diffMs = now - KNOWN_NEW_MOON;
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  const lunarAge = diffDays % LUNAR_CYCLE;
  const phase = lunarAge / LUNAR_CYCLE;

  let phaseName;
  if (phase < 0.033) phaseName = 'New Moon';
  else if (phase < 0.216) phaseName = 'Waxing Crescent';
  else if (phase < 0.283) phaseName = 'First Quarter';
  else if (phase < 0.466) phaseName = 'Waxing Gibbous';
  else if (phase < 0.533) phaseName = 'Full Moon';
  else if (phase < 0.716) phaseName = 'Waning Gibbous';
  else if (phase < 0.783) phaseName = 'Last Quarter';
  else phaseName = 'Waning Crescent';

  return { phase, phaseName };
}

function cleanupNowTab() {
  if (nowAnimationId) {
    cancelAnimationFrame(nowAnimationId);
    nowAnimationId = null;
  }
}

// ── Stopwatch Tab ───────────────────────────────────────────────────────────

function renderStopwatchTab(container) {
  container.innerHTML = `
    <div class="row justify-content-center">
      <div class="col-12 col-md-8 col-lg-6">
        <div class="card border-0 shadow-sm p-5 text-center">
          <div id="stopwatch-display"
               style="font-family: var(--font-mono); font-size: 3rem; font-weight: 700; color: var(--color-primary);">
            00:00:00.000
          </div>

          <div class="mt-4 d-flex gap-2 justify-content-center">
            <button id="start-stop-btn" class="btn btn-primary btn-lg">Start</button>
            <button id="reset-btn" class="btn btn-secondary btn-lg">Reset</button>
          </div>
        </div>
      </div>
    </div>`;

  initStopwatchTab(container);
}

function initStopwatchTab(container) {
  const display = container.querySelector('#stopwatch-display');
  const startStopBtn = container.querySelector('#start-stop-btn');
  const resetBtn = container.querySelector('#reset-btn');

  // Load saved state
  loadStopwatch();

  // Update display
  updateStopwatchDisplay(display);

  // Update button state based on loaded state
  if (stopwatchState.running) {
    startStopBtn.textContent = 'Stop';
    startStopBtn.classList.remove('btn-primary');
    startStopBtn.classList.add('btn-danger');
    stopwatchInterval = setInterval(() => updateStopwatchDisplay(display), 10);
  }

  // Event listeners
  startStopBtn.addEventListener('click', () => {
    if (stopwatchState.running) {
      stopStopwatch(display, startStopBtn);
    } else {
      startStopwatch(display, startStopBtn);
    }
  });

  resetBtn.addEventListener('click', () => {
    resetStopwatch(display, startStopBtn);
  });
}

function updateStopwatchDisplay(display) {
  let totalMs = stopwatchState.elapsed;

  if (stopwatchState.running) {
    const now = performance.now();
    totalMs += (now - stopwatchState.startTime);
  }

  const hours = Math.floor(totalMs / 3600000);
  const minutes = Math.floor((totalMs % 3600000) / 60000);
  const seconds = Math.floor((totalMs % 60000) / 1000);
  const milliseconds = Math.floor(totalMs % 1000);

  const timeStr =
    String(hours).padStart(2, '0') + ':' +
    String(minutes).padStart(2, '0') + ':' +
    String(seconds).padStart(2, '0') + '.' +
    String(milliseconds).padStart(3, '0');

  display.textContent = timeStr;
}

function startStopwatch(display, btn) {
  stopwatchState.running = true;
  stopwatchState.startTime = performance.now();

  stopwatchInterval = setInterval(() => updateStopwatchDisplay(display), 10);

  btn.textContent = 'Stop';
  btn.classList.remove('btn-primary');
  btn.classList.add('btn-danger');

  persistStopwatch();
}

function stopStopwatch(display, btn) {
  if (!stopwatchState.running) return;

  const now = performance.now();
  stopwatchState.elapsed += (now - stopwatchState.startTime);
  stopwatchState.running = false;

  clearInterval(stopwatchInterval);
  stopwatchInterval = null;

  btn.textContent = 'Start';
  btn.classList.remove('btn-danger');
  btn.classList.add('btn-primary');

  persistStopwatch();
}

function resetStopwatch(display, btn) {
  stopStopwatch(display, btn);
  stopwatchState.elapsed = 0;
  updateStopwatchDisplay(display);
  persistStopwatch();
}

function persistStopwatch() {
  store.set(STORE_KEY_STOPWATCH, {
    running: stopwatchState.running,
    startTime: stopwatchState.startTime,
    elapsed: stopwatchState.elapsed
  });
}

function loadStopwatch() {
  const saved = store.get(STORE_KEY_STOPWATCH);
  if (saved) {
    stopwatchState = saved;
    // If it was running, recalculate elapsed time since page was left
    if (stopwatchState.running && stopwatchState.startTime) {
      const timeSinceStart = performance.now() - stopwatchState.startTime;
      stopwatchState.elapsed += timeSinceStart;
      stopwatchState.startTime = performance.now();
    }
  }
}

function cleanupStopwatchTab() {
  if (stopwatchInterval) {
    clearInterval(stopwatchInterval);
    stopwatchInterval = null;
  }
}
