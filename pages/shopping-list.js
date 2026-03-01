// pages/shopping-list.js
//
// Quick-add grocery list. Persists state so the user can build it up over the
// week and clear when shopping time comes. Uses Bootstrap 5 for layout and
// touch-friendly controls. All user-facing text is injected via the DOM API
// (createElement/textContent) where appropriate.

import store from '../store.js';

const STORE_KEY = 'shopping-list-state';

export function render(container) {
  const saved = store.get(STORE_KEY) ?? [];

  container.innerHTML = `
    <div class="row justify-content-center">
      <div class="col-12 col-md-6 col-lg-5">
        <h2 class="fw-bold mb-1">Shopping List</h2>
        <p class="text-body-secondary mb-3">Tap + to add an item</p>

        <!-- input row; sticky inside column -->
        <div id="input-row" class="input-group mb-3 sticky-top" style="top:0; z-index:1; background:white;">
          <input
            id="new-item"
            type="text"
            class="form-control"
            placeholder="Add item…"
          />
          <button id="add-btn" class="btn btn-primary" type="button">
            <i class="bi bi-plus"></i>
          </button>
        </div>

        <div id="list-container" class="list-group mb-3"></div>

        <div id="toolbar" class="d-flex gap-2">
          <button id="clear-checked" class="btn btn-outline-secondary flex-fill">
            Clear checked
          </button>
          <button id="clear-all" class="btn btn-outline-danger flex-fill">
            Clear all
          </button>
        </div>
      </div>
    </div>`;

  // stash items in container for easy access during init/update
  container._shoppingItems = saved;
  init(container);
}

export function init(container) {
  const inputEl = container.querySelector('#new-item');
  const addBtn = container.querySelector('#add-btn');
  const listWrapper = container.querySelector('#list-container');
  const clearCheckedBtn = container.querySelector('#clear-checked');
  const clearAllBtn = container.querySelector('#clear-all');

  function persist() {
    store.set(STORE_KEY, container._shoppingItems);
  }

  function updateToolbar() {
    const items = container._shoppingItems;
    clearAllBtn.disabled = items.length === 0;
    clearCheckedBtn.disabled = !items.some((i) => i.checked);
  }

  function renderList() {
    const items = container._shoppingItems;
    listWrapper.replaceChildren();

    if (items.length === 0) {
      const msg = document.createElement('p');
      msg.className = 'text-body-secondary';
      msg.textContent = 'Your list is empty — add something above';
      listWrapper.appendChild(msg);
    } else {
      items.forEach((item, idx) => {
        listWrapper.appendChild(makeItemRow(item, idx));
      });
    }

    updateToolbar();
  }

  function addItem() {
    const text = inputEl.value.trim();
    if (!text) return;
    container._shoppingItems.push({ text, checked: false });
    persist();
    renderList();
    inputEl.value = '';
    inputEl.focus();
  }

  function makeItemRow(item, index) {
    const row = document.createElement('div');
    row.className = 'list-group-item d-flex align-items-center justify-content-between';

    // checkbox
    const checkWrapper = document.createElement('div');
    checkWrapper.className = 'form-check';
    checkWrapper.style.minWidth = '44px';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'form-check-input';
    checkbox.checked = item.checked;
    checkbox.style.width = '1.5em';
    checkbox.style.height = '1.5em';
    checkbox.addEventListener('change', () => {
      container._shoppingItems[index].checked = checkbox.checked;
      persist();
      renderList();
    });

    checkWrapper.appendChild(checkbox);

    const label = document.createElement('span');
    label.textContent = item.text;
    // ensure readability on mobile
    label.style.fontSize = '1rem';
    if (item.checked) {
      label.className = 'text-decoration-line-through';
      label.style.opacity = '0.45';
    }
    label.style.flex = '1';
    label.style.marginLeft = '0.5rem';

    const delBtn = document.createElement('button');
    delBtn.type = 'button';
    delBtn.className = 'btn btn-outline-danger btn-sm';
    delBtn.innerHTML = '<i class="bi bi-trash"></i>';
    delBtn.addEventListener('click', () => {
      container._shoppingItems.splice(index, 1);
      persist();
      renderList();
    });

    row.appendChild(checkWrapper);
    row.appendChild(label);
    row.appendChild(delBtn);

    return row;
  }

  // wire events
  addBtn.addEventListener('click', addItem);
  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addItem();
    }
  });
  clearCheckedBtn.addEventListener('click', () => {
    container._shoppingItems = container._shoppingItems.filter((i) => !i.checked);
    persist();
    renderList();
  });
  clearAllBtn.addEventListener('click', () => {
    container._shoppingItems = [];
    persist();
    renderList();
  });

  renderList();
}
