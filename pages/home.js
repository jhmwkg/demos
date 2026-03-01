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
  // Filter out 'home' itself
  const demos = pages.filter((p) => p.id !== 'home');

  const cards = demos
    .map(
      ({ id, label, description, icon }) => `
      <div class="col-sm-6 col-lg-4 fade-in">
        <a href="#${id}" class="text-decoration-none">
          <div class="card h-100 border-0 shadow-sm card-hover">
            <div class="card-body p-4">
              <div class="mb-3 fs-2 text-primary">
                <i class="bi ${icon ?? 'bi-box'}"></i>
              </div>
              <h5 class="card-title fw-semibold">${escapeText(label)}</h5>
              <p class="card-text text-body-secondary small">${escapeText(description ?? '')}</p>
            </div>
            <div class="card-footer bg-transparent border-0 pb-3 px-4">
              <span class="small text-primary fw-medium">
                Open <i class="bi bi-arrow-right"></i>
              </span>
            </div>
          </div>
        </a>
      </div>`
    )
    .join('');

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

  // wait for DOM update then observe
  setTimeout(() => {
    container.querySelectorAll('.fade-in').forEach((el) => observer.observe(el));
  }, 0);

  container.innerHTML = `
    <style>
      .card-hover { transition: transform 0.15s ease, box-shadow 0.15s ease; }
      .card-hover:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,.15) !important; }
      .fade-in { opacity: 0; transform: translateY(20px); transition: opacity 0.6s ease, transform 0.6s ease; }
      .fade-in.visible { opacity: 1; transform: none; }
      @media (max-width: 576px) {
        /* add 4px horizontal spacing on phone-sized cards */
        .row.g-4 > .col-sm-6 {
          padding-left: 4px;
          padding-right: 4px;
        }
      }
    </style>

    <div class="mb-5 mt-5">
      <h1 class="fw-bold mb-1">Demo Hub</h1>
      <p class="text-body-secondary lead">
        A collection of small, self-contained widgets. Pick one below to get started.
      </p>
      <p><strong>Quick heads up before you dive in: </strong>Your data is saved locally in this browser. Clearing your cache, switching browsers, or using private/incognito mode will wipe it.</p>
    </div>

    <div class="row g-4">
      ${cards.length ? cards : '<p class="text-body-secondary">No demos added yet.</p>'}
    </div>`;
}

function escapeText(str) {
  const el = document.createElement('span');
  el.textContent = str;
  return el.innerHTML;
}
