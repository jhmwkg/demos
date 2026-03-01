/**
 * components/navbar.js
 *
 * Builds and mounts the top navigation bar.
 * To add a new demo: push an entry into the `pages` array in app.js —
 * the navbar reads that config and rebuilds automatically.
 */

/**
 * @param {Array<{id: string, label: string}>} pages
 * @param {string} currentId  — currently active page id
 */
export function renderNavbar(pages, currentId) {
  const root = document.getElementById('navbar-root');
  if (!root) return;

  // Build dropdown items from pages config
  const dropdownItems = pages
    .map(({ id, label }) => {
      const isActive = id === currentId;
      return `
        <li>
          <a
            class="dropdown-item ${isActive ? 'active' : ''}"
            href="#${id}"
            data-page="${id}"
          >
            ${escapeText(label)}
          </a>
        </li>`;
    })
    .join('');

  root.innerHTML = `
    <nav class="navbar navbar-expand-md border-bottom shadow-sm fixed-top bg-white" style="z-index:1030;">
      <div class="container">

        <!-- Brand -->
        <a class="navbar-brand" href="#home">
          <i class="bi bi-grid-3x3-gap-fill me-2 text-primary"></i>
          <span>Joseph King Demo Hub</span>
        </a>

        <!-- Mobile toggle -->
        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNav"
          aria-controls="mainNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span class="navbar-toggler-icon"></span>
        </button>

        <!-- Nav links -->
        <div class="collapse navbar-collapse" id="mainNav">
          <ul class="navbar-nav ms-auto align-items-md-center gap-md-1">

            <li class="nav-item">
              <a class="nav-link ${currentId === 'home' ? 'nav-active' : ''}" href="#home">
                Home
              </a>
            </li>

            <!-- Projects dropdown -->
            <li class="nav-item dropdown">
              <a
                class="nav-link dropdown-toggle"
                href="#"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <i class="bi bi-collection me-1"></i>Projects
              </a>
              <ul class="dropdown-menu dropdown-menu-end">
                ${dropdownItems}
              </ul>
            </li>

          </ul>
        </div>

      </div>
    </nav>`;
}

/**
 * Safely escape text for display (prevents XSS from page labels).
 * @param {string} str
 * @returns {string}
 */
function escapeText(str) {
  const el = document.createElement('span');
  el.textContent = str;
  return el.innerHTML;
}
