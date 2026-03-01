// pages/countdowns.js
//
// Simple countdown board. Stores an array of {id,label,targetDate} objects in
// localStorage and ticks every second while the page is visible.

import store from '../store.js';

const STORE_KEY = 'countdowns-state';

export function render(container) {
  const saved = store.get(STORE_KEY) || [];

  container.innerHTML = `
    <div class="row justify-content-center">
      <div class="col-12 col-md-10">
        <h2 class="fw-bold mb-3">Countdowns</h2>

        <div id="form-card" class="card mb-4 p-3">
          <div id="form-alert"></div>
          <div class="row g-2 align-items-end">
            <div class="col-12 col-sm-5">
              <input id="event-label" type="text" class="form-control" placeholder="What are you counting down to?" />
            </div>
            <div class="col-12 col-sm-4">
              <input id="event-date" type="date" class="form-control" />
            </div>
            <div class="col-12 col-sm-3">
              <button id="add-countdown" class="btn btn-primary w-100">Add</button>
            </div>
          </div>
        </div>

        <div id="list-container" class="row g-3"></div>
      </div>
    </div>`;

  container._countdowns = saved;
  init(container);
}

export function init(container) {
  // cleanup old interval if any
  if (container._intervalId) {
    clearInterval(container._intervalId);
  }

  const labelInput = container.querySelector('#event-label');
  const dateInput = container.querySelector('#event-date');
  const addBtn = container.querySelector('#add-countdown');
  const alertEl = container.querySelector('#form-alert');
  const listWrapper = container.querySelector('#list-container');

  function persist() {
    store.set(STORE_KEY, container._countdowns);
  }

  function showAlert(message) {
    alertEl.innerHTML = '';
    const a = document.createElement('div');
    a.className = 'alert alert-warning py-2';
    a.textContent = message;
    alertEl.appendChild(a);
    setTimeout(() => {
      if (alertEl.contains(a)) alertEl.removeChild(a);
    }, 3000);
  }

  function makeCard(item) {
    const col = document.createElement('div');
    col.className = 'col-12 col-sm-6 col-lg-4';

    const card = document.createElement('div');
    card.className = 'card position-relative h-100';

    const del = document.createElement('button');
    del.type = 'button';
    del.className = 'btn btn-outline-danger btn-sm position-absolute';
    del.style.top = '0.5rem';
    del.style.right = '0.5rem';
    del.innerHTML = '<i class="bi bi-trash"></i>';
    del.addEventListener('click', () => {
      container._countdowns = container._countdowns.filter((c) => c.id !== item.id);
      persist();
      renderList();
    });
    card.appendChild(del);

    const body = document.createElement('div');
    body.className = 'card-body d-flex flex-column';

    const title = document.createElement('h5');
    title.className = 'card-title';
    title.textContent = item.label;
    body.appendChild(title);

    const timeHolder = document.createElement('div');
    timeHolder.className = 'd-flex justify-content-between text-center flex-wrap';
    timeHolder.style.fontFamily = 'monospace';
    timeHolder.style.fontSize = '1.5rem';

    const now = new Date();
    const target = new Date(item.targetDate);
    const diff = target - now;
    if (diff <= 0) {
      const passed = document.createElement('p');
      passed.className = 'text-body-secondary fst-italic mt-2';
      passed.textContent = 'Event passed';
      body.appendChild(passed);
    } else {
      const secs = Math.floor(diff / 1000);
      const days = Math.floor(secs / 86400);
      const hrs = Math.floor((secs % 86400) / 3600);
      const mins = Math.floor((secs % 3600) / 60);
      const s = secs % 60;

      [days, hrs, mins, s].forEach((val, idx) => {
        const block = document.createElement('div');
        block.className = 'flex-fill py-2';
        block.textContent = String(val).padStart(2, '0');
        if (window.innerWidth < 576) {
          block.style.fontSize = '1.1rem';
        }
        timeHolder.appendChild(block);
      });
      body.appendChild(timeHolder);
    }

    const foot = document.createElement('p');
    foot.className = 'card-text text-body-secondary small mt-auto';
    foot.textContent = new Date(item.targetDate).toLocaleDateString();
    body.appendChild(foot);

    card.appendChild(body);
    col.appendChild(card);
    return col;
  }

  function renderList() {
    listWrapper.replaceChildren();
    if (container._countdowns.length === 0) {
      const msg = document.createElement('p');
      msg.className = 'text-body-secondary';
      msg.textContent = 'No countdowns yet — add one above.';
      listWrapper.appendChild(msg);
    } else {
      container._countdowns.forEach((c) => {
        listWrapper.appendChild(makeCard(c));
      });
    }
  }

  addBtn.addEventListener('click', () => {
    const label = labelInput.value.trim();
    const dateStr = dateInput.value;
    if (!label || !dateStr) {
      showAlert('Please provide both a label and date.');
      return;
    }
    const id = Date.now().toString();
    container._countdowns.push({ id, label, targetDate: dateStr });
    persist();
    renderList();
    labelInput.value = '';
    dateInput.value = '';
  });

  // update every second
  renderList();
  container._intervalId = setInterval(renderList, 1000);
}
