// pages/unit-converter.js
//
// A small unit converter for cooking measurements, weight, temperature and
// length. Remembers last-used category and unit via a simple store wrapper.
// Conversion results are rendered with DOM API so user-generated numbers
// aren't injected directly via innerHTML.

import store from '../store.js';

const STORE_KEY = 'unit-converter-state';

// conversion factors relative to a base unit for each category
const CATEGORIES = {
  cooking: {
    label: 'Cooking',
    // base == mL
    factors: {
      tsp: 4.92892,
      tbsp: 14.7868,
      'fl oz': 29.5735,
      cup: 236.588,
      pint: 473.176,
      quart: 946.353,
      gallon: 3785.41,
      mL: 1,
      L: 1000,
    },
  },
  weight: {
    label: 'Weight',
    // base == g
    factors: {
      oz: 28.3495,
      lb: 453.592,
      g: 1,
      kg: 1000,
    },
  },
  temperature: {
    label: 'Temperature',
    // handled specially
    units: ['°F', '°C', 'K'],
  },
  length: {
    label: 'Length',
    // base == m
    factors: {
      in: 0.0254,
      ft: 0.3048,
      yd: 0.9144,
      mi: 1609.34,
      mm: 0.001,
      cm: 0.01,
      m: 1,
      km: 1000,
    },
  },
};

// helper used by both render and init
function getUnits(cat) {
  const info = CATEGORIES[cat];
  if (cat === 'temperature') return info.units;
  return Object.keys(info.factors);
}

export function render(container) {
  const saved = store.get(STORE_KEY) || {};
  const activeCat = saved.category || 'cooking';
  const fromUnit = saved.fromUnit || getUnits(activeCat)[0];

  container.innerHTML = `
    <div class="row justify-content-center">
      <div class="col-12">
        <h2 class="fw-bold mb-3">Unit Converter</h2>

        <!-- category pills -->
        <div id="category-group" class="btn-group mb-3 flex-wrap" role="group"></div>

        <!-- input row -->
        <div class="row g-2 mb-3">
          <div class="col-12 col-sm-4">
            <select id="from-unit" class="form-select"></select>
          </div>
          <div class="col-12 col-sm-8">
            <input id="value-input" type="number" class="form-control form-control-lg" placeholder="0" />
          </div>
        </div>

        <div id="results" class="card border-0 shadow-sm p-2">
          <!-- rows inserted here -->
        </div>
      </div>
    </div>`;

  // store current state
  container._state = { category: activeCat, fromUnit };
  init(container);
}

export function init(container) {
  const catGroup = container.querySelector('#category-group');
  const unitSelect = container.querySelector('#from-unit');
  const valueInput = container.querySelector('#value-input');
  const resultsCard = container.querySelector('#results');

  function buildCategoryButtons() {
    catGroup.replaceChildren();
    Object.keys(CATEGORIES).forEach((cat) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className =
        'btn ' +
        (cat === container._state.category ? 'btn-primary' : 'btn-outline-secondary');
      btn.textContent = CATEGORIES[cat].label;
      btn.addEventListener('click', () => {
        if (cat === container._state.category) return;
        container._state.category = cat;
        container._state.fromUnit = getUnits(cat)[0];
        persist();
        refreshUI();
      });
      catGroup.appendChild(btn);
    });
  }

  function persist() {
    store.set(STORE_KEY, container._state);
  }

  function refreshUI() {
    // rebuild unit dropdown
    const units = getUnits(container._state.category);
    unitSelect.replaceChildren();
    units.forEach((u) => {
      const opt = document.createElement('option');
      opt.value = u;
      opt.textContent = u;
      unitSelect.appendChild(opt);
    });
    unitSelect.value = container._state.fromUnit;

    // clear input
    valueInput.value = '';
    updateResults();
    buildCategoryButtons();
  }

  function convert(value, from, to) {
    if (container._state.category === 'temperature') {
      // convert via Celsius
      let c;
      if (from === '°F') c = (value - 32) * (5 / 9);
      else if (from === '°C') c = value;
      else if (from === 'K') c = value - 273.15;
      let out;
      if (to === '°F') out = c * (9 / 5) + 32;
      else if (to === '°C') out = c;
      else if (to === 'K') out = c + 273.15;
      return out;
    }
    const factors = CATEGORIES[container._state.category].factors;
    const baseVal = value * (factors[from] || 1);
    return baseVal / (factors[to] || 1);
  }

  function formatNum(n) {
    return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function updateResults() {
    const raw = valueInput.value;
    const num = parseFloat(raw);
    const showDash = !raw || num === 0;
    const units = getUnits(container._state.category);
    resultsCard.replaceChildren();

    units.forEach((u) => {
      if (u === container._state.fromUnit) return;
      const row = document.createElement('div');
      row.className = 'd-flex justify-content-between align-items-center py-2';

      const left = document.createElement('span');
      left.textContent = u;

      const right = document.createElement('span');
      right.style.fontFamily = 'monospace';
      right.textContent = showDash ? '—' : formatNum(convert(num, container._state.fromUnit, u));

      row.appendChild(left);
      row.appendChild(right);
      resultsCard.appendChild(row);
    });
  }

  // wire events
  unitSelect.addEventListener('change', (e) => {
    container._state.fromUnit = e.target.value;
    persist();
    updateResults();
  });

  valueInput.addEventListener('input', updateResults);

  // initial build
  buildCategoryButtons();
  refreshUI();
}
