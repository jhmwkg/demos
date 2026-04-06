import store from '../store.js';

/**
 * pages/home.js
 *
 * The landing page. Lists all available demos as clickable cards.
 * Receives the pages config so it can auto-generate the grid.
 */

/**
 * @param {HTMLElement} container
 * @param {Array<{id: string, label: string, description: string, icon: string}>} pages
 */
export function render(container, pages) {
  // Load preferences from store
  let viewMode = store.get('home-view-mode') || 'large-icons'; // small-icons, medium-icons, large-icons, list
  let favorites = store.get('home-favorites') || [];
  let showFavoritesOnly = store.get('home-show-favorites-only') || false;

  const renderContent = () => {
    // Filter out 'home' and 'about' and sort alphabetically by label
    let demos = pages
      .filter((p) => p.id !== 'home' && p.id !== 'about')
      .sort((a, b) => a.label.localeCompare(b.label));

    if (showFavoritesOnly) {
      demos = demos.filter((d) => favorites.includes(d.id));
    }

    const demoItems = demos
      .map(({ id, label, description, icon }) => {
        const isFavorite = favorites.includes(id);
        const starIcon = isFavorite ? 'bi-star-fill text-warning' : 'bi-star';

        if (viewMode === 'list') {
          return `
            <div class="col-12 fade-in">
              <div class="card mb-2 border-0 shadow-sm card-hover position-relative">
                <a href="#${id}" class="text-decoration-none text-dark h-100 d-block">
                  <div class="card-body d-flex align-items-center p-3">
                    <div class="me-3 fs-4 text-primary">
                      <i class="bi ${icon ?? 'bi-box'}"></i>
                    </div>
                    <div class="flex-grow-1">
                      <h6 class="mb-0 fw-semibold">
                        ${escapeText(label)}
                      </h6>
                      <small class="text-body-secondary">${escapeText(description ?? '')}</small>
                    </div>
                    <div class="ms-3 text-primary text-decoration-none small fw-medium" style="padding-right: 40px;">
                      Open <i class="bi bi-arrow-right"></i>
                    </div>
                  </div>
                </a>
                <button class="btn btn-link text-decoration-none favorite-toggle p-0 position-absolute top-50 end-0 translate-middle-y me-3" data-id="${id}" style="z-index: 10;">
                  <i class="bi ${starIcon} fs-5"></i>
                </button>
              </div>
            </div>`;
        }

        let colClass = 'col-sm-6 col-lg-4';
        let cardPadding = 'p-4';
        let iconSize = 'fs-2';

        if (viewMode === 'small-icons') {
          colClass = 'col-4 col-md-3 col-lg-2';
          cardPadding = 'p-2';
          iconSize = 'fs-3';
        } else if (viewMode === 'medium-icons') {
          colClass = 'col-6 col-md-4 col-lg-3';
          cardPadding = 'p-3';
          iconSize = 'fs-3';
        }

        const isSmall = viewMode === 'small-icons';
        const isMedium = viewMode === 'medium-icons';

        return `
          <div class="${colClass} fade-in">
            <div class="card h-100 border-0 shadow-sm card-hover position-relative">
              <button class="btn btn-link text-decoration-none favorite-toggle position-absolute top-0 end-0 p-2" data-id="${id}" style="z-index: 10;">
                <i class="bi ${starIcon} ${isSmall ? 'fs-7' : ''}"></i>
              </button>
              <a href="#${id}" class="text-decoration-none h-100 d-flex flex-column ${isSmall ? 'justify-content-center align-items-center' : ''}">
                <div class="card-body ${cardPadding} ${isSmall ? 'd-flex flex-column align-items-center' : ''}">
                  <div class="${isSmall ? 'mb-0' : 'mb-3'} ${iconSize} text-primary">
                    <i class="bi ${icon ?? 'bi-box'}"></i>
                  </div>
                  ${!isSmall ? `<h5 class="card-title fw-semibold ${isMedium ? 'fs-6' : ''} mb-0">${escapeText(label)}</h5>` : ''}
                  ${(!isSmall && !isMedium) ? `<p class="card-text text-body-secondary small mt-2 mb-0">${escapeText(description ?? '')}</p>` : ''}
                </div>
                ${!isSmall ? `
                <div class="card-footer bg-transparent border-0 pb-3 px-4 mt-auto">
                  <span class="small text-primary fw-medium">
                    Open <i class="bi bi-arrow-right"></i>
                  </span>
                </div>` : ''}
              </a>
            </div>
          </div>`;
      })
      .join('');

    container.innerHTML = `
      <style>
        .card-hover { transition: transform 0.15s ease, box-shadow 0.15s ease; }
        .card-hover:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,.15) !important; }
        .fade-in { opacity: 0; transform: translateY(20px); transition: opacity 0.6s ease, transform 0.6s ease; }
        .fade-in.visible { opacity: 1; transform: none; }
        .btn-check:checked + .btn-outline-primary { background-color: var(--bs-primary); color: white; }
        @media (max-width: 576px) {
          .row.g-4 > .col-sm-6, .row.g-4 > .col-6 {
            padding-left: 8px;
            padding-right: 8px;
          }
        }
      </style>

      <div class="mb-5 mt-5">
        <h1 class="fw-bold mb-1">Demo Hub</h1>
        <p class="text-body-secondary lead">
          A collection of small, self-contained widgets. Pick one below to get started.
        </p>
        
        <div class="d-flex flex-wrap gap-3 align-items-center mt-4">
          <div class="btn-group shadow-sm" role="group" aria-label="View mode">
            <input type="radio" class="btn-check" name="viewMode" id="viewLarge" value="large-icons" ${viewMode === 'large-icons' ? 'checked' : ''}>
            <label class="btn btn-outline-secondary border-0" for="viewLarge" title="Large Icons"><i class="bi bi-grid"></i></label>
            
            <input type="radio" class="btn-check" name="viewMode" id="viewMedium" value="medium-icons" ${viewMode === 'medium-icons' ? 'checked' : ''}>
            <label class="btn btn-outline-secondary border-0" for="viewMedium" title="Medium Icons"><i class="bi bi-grid-3x2"></i></label>

            <input type="radio" class="btn-check" name="viewMode" id="viewSmall" value="small-icons" ${viewMode === 'small-icons' ? 'checked' : ''}>
            <label class="btn btn-outline-secondary border-0" for="viewSmall" title="Small Icons"><i class="bi bi-grid-3x3-gap"></i></label>
            
            <input type="radio" class="btn-check" name="viewMode" id="viewList" value="list" ${viewMode === 'list' ? 'checked' : ''}>
            <label class="btn btn-outline-secondary border-0" for="viewList" title="List View"><i class="bi bi-list-ul"></i></label>
          </div>

          <div class="form-check form-switch shadow-sm bg-light rounded px-3 py-2 border">
            <input class="form-check-input ms-0 me-2" type="checkbox" role="switch" id="favFilter" ${showFavoritesOnly ? 'checked' : ''}>
            <label class="form-check-label small fw-medium" for="favFilter">Show Favorites Only</label>
          </div>
        </div>

        <p class="mt-4 small text-muted"><strong>Quick heads up: </strong>Your data is saved locally in this browser. Clearing cache will wipe it.</p>
      </div>

      <div class="row ${viewMode === 'list' ? 'g-2' : 'g-4'}">
        ${demoItems.length ? demoItems : '<div class="col-12"><p class="text-body-secondary text-center py-5">No demos found.</p></div>'}
      </div>`;

    // set up scroll-triggered fade-in for cards
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    container.querySelectorAll('.fade-in').forEach((el) => observer.observe(el));

    // Event Listeners
    container.querySelectorAll('input[name="viewMode"]').forEach((input) => {
      input.addEventListener('change', (e) => {
        viewMode = e.target.value;
        store.set('home-view-mode', viewMode);
        renderContent();
      });
    });

    container.querySelector('#favFilter').addEventListener('change', (e) => {
      showFavoritesOnly = e.target.checked;
      store.set('home-show-favorites-only', showFavoritesOnly);
      renderContent();
    });

    container.querySelectorAll('.favorite-toggle').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const id = btn.dataset.id;
        if (favorites.includes(id)) {
          favorites = favorites.filter((favId) => favId !== id);
        } else {
          favorites.push(id);
        }
        store.set('home-favorites', favorites);
        renderContent();
      });
    });
  };

  renderContent();
}

function escapeText(str) {
  const el = document.createElement('span');
  el.textContent = str;
  return el.innerHTML;
}
