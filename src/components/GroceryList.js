import React, { useState, useEffect } from 'react';

const CATEGORY_OPTIONS = [
  'Produce',
  'Dairy',
  'Meat',
  'Pantry',
  'Frozen',
  'Other',
];

function loadItems() {
  try {
    const raw = localStorage.getItem('groceryItems');
    if (!raw) return [];
    const arr = JSON.parse(raw);
    if (Array.isArray(arr)) {
      return arr.map(i => ({
        id: i.id,
        name: String(i.name),
        category: String(i.category),
        completed: !!i.completed,
      }));
    }
  } catch (err) {
    console.error('failed to parse groceryItems', err);
  }
  return [];
}

export default function GroceryList() {
  const [items, setItems] = useState(() => loadItems());
  const [name, setName] = useState('');
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0]);
  const [hideCompleted, setHideCompleted] = useState(false);
  const [openCats, setOpenCats] = useState(() =>
    Object.fromEntries(CATEGORY_OPTIONS.map(c => [c, true]))
  );

  // persist
  useEffect(() => {
    try {
      localStorage.setItem('groceryItems', JSON.stringify(items));
    } catch (err) {
      console.error('could not save groceryItems', err);
    }
  }, [items]);

  const addItem = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const item = {
      id: Date.now(),
      name: trimmed,
      category,
      completed: false,
    };
    setItems(prev => [...prev, item]);
    setName('');
  };

  const toggleComplete = id => {
    setItems(prev =>
      prev.map(i =>
        i.id === id ? { ...i, completed: !i.completed } : i
      )
    );
  };

  const deleteItem = id => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const clearCompleted = () => {
    setItems(prev => prev.filter(i => !i.completed));
  };

  const toggleCategory = cat => {
    setOpenCats(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const grouped = CATEGORY_OPTIONS.reduce((acc, cat) => {
    acc[cat] = items
      .filter(i => i.category === cat)
      .sort((a, b) => a.name.localeCompare(b.name));
    return acc;
  }, {});

  return (
    <div className="container py-4">
      <h1>Grocery List Optimizer</h1>
      <div className="row">
        <div className="col-md-4 mb-3">
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="Item name"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addItem()}
            />
            <select
              className="form-select"
              value={category}
              onChange={e => setCategory(e.target.value)}
            >
              {CATEGORY_OPTIONS.map(opt => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <button className="btn btn-primary" onClick={addItem}>
              Add
            </button>
          </div>
          <div className="form-check mt-2">
            <input
              className="form-check-input"
              type="checkbox"
              id="hideCompleted"
              checked={hideCompleted}
              onChange={e => setHideCompleted(e.target.checked)}
            />
            <label className="form-check-label" htmlFor="hideCompleted">
              Hide completed
            </label>
          </div>
          <button
            className="btn btn-sm btn-danger mt-2"
            onClick={clearCompleted}
            disabled={!items.some(i => i.completed)}
          >
            Clear completed
          </button>
        </div>
        <div className="col-md-8">
          {CATEGORY_OPTIONS.map(cat => {
            const list = grouped[cat] || [];
            if (hideCompleted) list = list.filter(i => !i.completed);
            return (
              <div key={cat} className="mb-3">
                <button
                  className="btn btn-link"
                  onClick={() => toggleCategory(cat)}
                >
                  {openCats[cat] ? '▼' : '▶'} {cat} ({list.length})
                </button>
                {openCats[cat] && list.length > 0 && (
                  <ul className="list-group">
                    {list.map(i => (
                      <li
                        key={i.id}
                        className={
                          'list-group-item d-flex justify-content-between align-items-center' +
                          (i.completed ? ' text-muted' : '')
                        }
                      >
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={i.completed}
                            onChange={() => toggleComplete(i.id)}
                            style={{ cursor: 'pointer' }}
                          />
                          <span className="ms-2">{i.name}</span>
                        </div>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => deleteItem(i.id)}
                        >
                          ✕
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
