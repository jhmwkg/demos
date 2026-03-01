// pages/random-picker.js
//
// Simple decision helper: maintain a list of options, then pick one at random.
// Supports optional shuffle animation. Stores options in localStorage.

import store from '../store.js';

const STORE_KEY = 'random-picker-state';

export function render(container) {
  const saved = store.get(STORE_KEY) || [];
  container._options = saved;

  container.innerHTML = `
    <style>
      @keyframes pulseBorder {
        0% { border-color: transparent; }
        50% { border-color: var(--bs-primary); }
        100% { border-color: transparent; }
      }
      .pulse {
        animation: pulseBorder 0.6s ease-in-out 2;
      }
    </style>

    <div class="row justify-content-center">
      <div class="col-12" style="max-width:480px;">
        <h2 class="fw-bold mb-1">Random Picker</h2>
        <p class="text-body-secondary mb-3">Can't decide? Let fate choose.</p>

        <div class="input-group mb-3">
          <input id="new-option" type="text" class="form-control" placeholder="Add an option…" />
          <button id="add-btn" class="btn btn-primary" type="button">Add</button>
        </div>

        <div id="options-list" class="mb-2" style="max-height:50vh; overflow:auto;"></div>
        <div id="clear-link" class="text-center small text-muted mb-3" style="cursor:pointer;">Clear list</div>

        <div class="form-check form-switch mb-3">
          <input class="form-check-input" type="checkbox" id="shuffle-toggle">
          <label class="form-check-label" for="shuffle-toggle">Shuffle mode</label>
        </div>

        <button id="pick-btn" class="btn btn-primary btn-lg w-100" disabled>Pick One</button>

        <div id="result-area" class="mt-4" style="display:none;">
          <div class="card p-4 text-center">
            <div class="text-body-secondary small mb-2">Winner:</div>
            <div id="result-text" class="fw-bold" style="font-size:2rem;"></div>
          </div>
        </div>
      </div>
    </div>`;

  init(container);
}

export function init(container) {
  const inputEl = container.querySelector('#new-option');
  const addBtn = container.querySelector('#add-btn');
  const listEl = container.querySelector('#options-list');
  const clearLink = container.querySelector('#clear-link');
  const pickBtn = container.querySelector('#pick-btn');
  const resultArea = container.querySelector('#result-area');
  const resultText = container.querySelector('#result-text');
  const shuffleToggle = container.querySelector('#shuffle-toggle');

  let shuffleInterval = null;

  function persist() {
    store.set(STORE_KEY, container._options);
  }

  function renderList() {
    listEl.replaceChildren();
    container._options.forEach((opt, idx) => {
      const row = document.createElement('div');
      row.className = 'd-flex justify-content-between align-items-center mb-1 p-2 rounded border shadow-sm';
      row.style.borderRadius = '50px';
      const text = document.createElement('span');
      text.textContent = opt;
      const del = document.createElement('button');
      del.type = 'button';
      del.className = 'btn btn-outline-danger btn-sm';
      del.innerHTML = '<i class="bi bi-trash"></i>';
      del.addEventListener('click', () => {
        container._options.splice(idx, 1);
        persist();
        renderList();
        updatePickState();
        if (container._options.length < 2) hideResult();
      });
      row.appendChild(text);
      row.appendChild(del);
      listEl.appendChild(row);
    });
    updatePickState();
  }

  function updatePickState() {
    pickBtn.disabled = container._options.length < 2 || !!shuffleInterval;
  }

  function addOption() {
    const val = inputEl.value.trim();
    if (!val) return;
    container._options.push(val);
    persist();
    renderList();
    inputEl.value = '';
    inputEl.focus();
  }

  function hideResult() {
    resultArea.style.display = 'none';
  }

  function showResult(str) {
    resultText.textContent = str;
    resultArea.style.display = 'block';
    const card = resultArea.querySelector('.card');
    card.classList.remove('pulse');
    // trigger reflow
    void card.offsetWidth;
    card.classList.add('pulse');
  }

  function pickOne() {
    if (container._options.length < 1) return;
    if (shuffleToggle.checked) {
      // animate
      let count = 0;
      shuffleInterval = setInterval(() => {
        const r = container._options[Math.floor(Math.random() * container._options.length)];
        resultText.textContent = r;
        count += 100;
        if (count >= 1500) {
          clearInterval(shuffleInterval);
          shuffleInterval = null;
          showResult(resultText.textContent);
          updatePickState();
        }
      }, 100);
      updatePickState();
    } else {
      const r = container._options[Math.floor(Math.random() * container._options.length)];
      showResult(r);
    }
  }

  // wire events
  addBtn.addEventListener('click', addOption);
  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addOption();
    }
  });
  pickBtn.addEventListener('click', pickOne);
  clearLink.addEventListener('click', () => {
    container._options = [];
    persist();
    renderList();
    hideResult();
    inputEl.focus();
  });

  // initial
  renderList();
  hideResult();
}
