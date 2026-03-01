// pages/quick-notes.js
//
// Multi-note scratchpad. Persists notes and the active note in localStorage.
// Uses a two-panel layout on desktop and a slide-in edit view on mobile.
// Autosaves with debounce.

import store from '../store.js';

const STORE_KEY = 'quick-notes-state';

export function render(container) {
  const saved = store.get(STORE_KEY) || { notes: [], activeId: '' };
  container._state = saved;

  container.innerHTML = `
    <div class="row">
      <!-- list panel -->
      <div id="list-view" class="col-12 col-md-4 border-end">
        <div class="d-flex align-items-center p-2">
          <h3 class="mb-0 me-auto">Notes</h3>
          <button id="new-note" class="btn btn-primary btn-sm">New Note</button>
        </div>
        <div id="notes-list" class="list-group list-group-flush overflow-auto" style="max-height:calc(100vh - 56px);"></div>
      </div>

      <!-- edit panel -->
      <div id="edit-view" class="col-12 col-md-8 d-none d-md-block d-flex flex-column">
        <div class="p-2">
          <button id="back-btn" class="btn btn-outline-secondary btn-sm d-md-none mb-2">← Back</button>
          <input id="note-title" type="text" class="form-control border-0 fs-4 fw-medium" placeholder="Title" />
        </div>
        <textarea id="note-body" class="form-control flex-grow-1 border-0" style="min-height:50vh;"></textarea>
        <div id="save-indicator" class="text-muted small text-end p-2" style="visibility:hidden;">Saved</div>
      </div>
    </div>`;

  init(container);
}

export function init(container) {
  // clear any previous autosave timer
  if (container._saveTimer) clearTimeout(container._saveTimer);
  // ensure interval cleanup not needed for this page

  const listView = container.querySelector('#list-view');
  const editView = container.querySelector('#edit-view');
  const newBtn = container.querySelector('#new-note');
  const notesList = container.querySelector('#notes-list');
  const backBtn = container.querySelector('#back-btn');
  const titleInput = container.querySelector('#note-title');
  const bodyTextarea = container.querySelector('#note-body');
  const saveIndicator = container.querySelector('#save-indicator');

  function persist() {
    store.set(STORE_KEY, container._state);
  }

  function sortNotes() {
    container._state.notes.sort((a, b) => b.updatedAt - a.updatedAt);
  }

  function renderList() {
    sortNotes();
    notesList.replaceChildren();

    if (container._state.notes.length === 0) {
      const msgRow = document.createElement('div');
      msgRow.className = 'p-3 text-center text-body-secondary';
      msgRow.innerHTML = 'No notes yet.<br/><button id="first-note" class="btn btn-link p-0">Create your first note</button>';
      notesList.appendChild(msgRow);
      const firstBtn = msgRow.querySelector('#first-note');
      firstBtn.addEventListener('click', createNote);
      return;
    }

    container._state.notes.forEach((note) => {
      const row = document.createElement('div');
      row.className = 'list-group-item list-group-item-action d-flex justify-content-between align-items-start';
      if (note.id === container._state.activeId) {
        row.classList.add('active', 'border-start', 'border-3', 'border-primary');
      }

      const info = document.createElement('div');
      info.className = 'me-auto';
      const title = document.createElement('div');
      title.className = 'fw-medium';
      title.textContent = note.title || 'Untitled';
      const ts = document.createElement('div');
      // use readable color on active background
      ts.className = 'small monospace ' +
        (note.id === container._state.activeId ? 'text-white-50' : 'text-body-secondary');
      ts.textContent = new Date(note.updatedAt).toLocaleString();
      info.appendChild(title);
      info.appendChild(ts);

      const del = document.createElement('button');
      del.type = 'button';
      del.className = 'btn btn-sm btn-outline-danger';
      del.innerHTML = '<i class="bi bi-trash"></i>';
      del.addEventListener('click', (e) => {
        e.stopPropagation();
        if (confirm('Delete this note?')) {
          container._state.notes = container._state.notes.filter((n) => n.id !== note.id);
          if (container._state.activeId === note.id) {
            container._state.activeId = container._state.notes[0]?.id || '';
          }
          persist();
          renderList();
          renderEditor();
          if (!container._state.activeId && window.innerWidth < 768) showList();
        }
      });

      row.appendChild(info);
      row.appendChild(del);

      row.addEventListener('click', () => {
        container._state.activeId = note.id;
        persist();
        renderList();
        renderEditor();
        if (window.innerWidth < 768) showEdit();
      });

      notesList.appendChild(row);
    });
  }

  function renderEditor() {
    const note = container._state.notes.find((n) => n.id === container._state.activeId);
    if (!note) {
      titleInput.value = '';
      bodyTextarea.value = '';
      return;
    }
    titleInput.value = note.title;
    bodyTextarea.value = note.body;
    saveIndicator.style.visibility = 'hidden';
  }

  function createNote() {
    const id = Date.now().toString();
    const now = Date.now();
    const note = { id, title: 'Untitled', body: '', updatedAt: now };
    container._state.notes.unshift(note);
    container._state.activeId = id;
    persist();
    renderList();
    renderEditor();
    titleInput.focus();
    if (window.innerWidth < 768) showEdit();
  }

  function saveNow() {
    const note = container._state.notes.find((n) => n.id === container._state.activeId);
    if (!note) return;
    note.title = titleInput.value;
    note.body = bodyTextarea.value;
    note.updatedAt = Date.now();
    persist();
    renderList();
    saveIndicator.style.visibility = 'visible';
    setTimeout(() => (saveIndicator.style.visibility = 'hidden'), 800);
  }

  function scheduleSave() {
    clearTimeout(container._saveTimer);
    container._saveTimer = setTimeout(saveNow, 500);
  }

  function showEdit() {
    listView.classList.add('d-none');
    editView.classList.remove('d-none');
  }

  function showList() {
    editView.classList.add('d-none');
    listView.classList.remove('d-none');
  }

  // wire events
  newBtn.addEventListener('click', createNote);
  backBtn.addEventListener('click', showList);
  titleInput.addEventListener('input', scheduleSave);
  bodyTextarea.addEventListener('input', scheduleSave);

  // initial draw
  renderList();
  renderEditor();
}
