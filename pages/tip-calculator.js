/**
 * pages/tip-calculator.js
 *
 * Demo: Tip Calculator
 * Remembers last tip % in localStorage.
 *
 * ── Copilot prompt template for new demos ────────────────────────────────────
 * "Create a pages/<name>.js module that exports render(container) and
 *  optionally init(container). Use the DOM API (createElement / textContent /
 *  appendChild) for any user-input output. Use Bootstrap 5 classes for layout.
 *  Persist state with: import store from '../store.js'; store.set/get('<name>-state', value);"
 * ─────────────────────────────────────────────────────────────────────────────
 */

import store from '../store.js';

const STORE_KEY = 'tip-calculator-state';

export function render(container) {
  // ── Read persisted state ──────────────────────────────────────────────────
  const saved = store.get(STORE_KEY) ?? { tipPercent: 18 };

  // ── Build DOM (no innerHTML for user-facing output) ───────────────────────
  container.innerHTML = `
    <div class="row justify-content-center">
      <div class="col-md-6 col-lg-5">

        <h2 class="fw-bold mb-1">Tip Calculator</h2>
        <p class="text-body-secondary mb-4">Split the bill, keep it easy.</p>

        <div class="card border-0 shadow-sm p-4">

          <div class="mb-3">
            <label class="form-label fw-medium" for="bill">Bill total ($)</label>
            <input
              id="bill"
              type="number"
              min="0"
              step="0.01"
              class="form-control form-control-lg"
              placeholder="0.00"
            />
          </div>

          <div class="mb-3">
            <label class="form-label fw-medium" for="tip">
              Tip — <span id="tip-label">${saved.tipPercent}</span>%
            </label>
            <input
              id="tip"
              type="range"
              min="0"
              max="40"
              step="1"
              value="${saved.tipPercent}"
              class="form-range"
            />
          </div>

          <div class="mb-4">
            <label class="form-label fw-medium" for="people">People</label>
            <input
              id="people"
              type="number"
              min="1"
              step="1"
              value="1"
              class="form-control"
            />
          </div>

          <!-- Results (built via DOM API) -->
          <div id="results" class="d-flex flex-column gap-2"></div>

        </div>
      </div>
    </div>`;

  init(container);
}

export function init(container) {
  const billEl   = container.querySelector('#bill');
  const tipEl    = container.querySelector('#tip');
  const tipLabel = container.querySelector('#tip-label');
  const peopleEl = container.querySelector('#people');
  const results  = container.querySelector('#results');

  function calculate() {
    const bill    = parseFloat(billEl.value)   || 0;
    const tip     = parseInt(tipEl.value, 10)  || 0;
    const people  = Math.max(1, parseInt(peopleEl.value, 10) || 1);

    const tipAmt  = bill * (tip / 100);
    const total   = bill + tipAmt;
    const perHead = total / people;

    // Persist tip preference
    store.set(STORE_KEY, { tipPercent: tip });
    tipLabel.textContent = tip;

    // Build result rows with DOM API (safe for user-derived numbers)
    results.replaceChildren(
      makeResultRow('Tip amount',   formatCurrency(tipAmt)),
      makeResultRow('Total',        formatCurrency(total)),
      makeResultRow(`Per person (${people})`, formatCurrency(perHead), true),
    );
  }

  // Wire events
  [billEl, tipEl, peopleEl].forEach((el) =>
    el.addEventListener('input', calculate)
  );

  // Run once to populate results immediately
  calculate();
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeResultRow(label, value, highlight = false) {
  const row = document.createElement('div');
  row.className = `d-flex justify-content-between align-items-center px-3 py-2 rounded ${
    highlight ? 'bg-primary text-white fw-bold' : 'bg-body-secondary'
  }`;

  const labelEl = document.createElement('span');
  labelEl.textContent = label;

  const valueEl = document.createElement('span');
  valueEl.textContent = value;

  row.appendChild(labelEl);
  row.appendChild(valueEl);
  return row;
}

function formatCurrency(n) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}
