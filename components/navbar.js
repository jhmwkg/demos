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

  const homePage = pages.find((p) => p.id === 'home');
  const aboutPage = pages.find((p) => p.id === 'about');

  root.innerHTML = `
    <nav class="navbar border-bottom shadow-sm fixed-top bg-white px-3" style="z-index:1030;">
      <div class="container-fluid d-flex justify-content-between align-items-center">

        <!-- Brand -->
        <a class="navbar-brand py-0 me-0" href="#home">
          <i class="bi bi-grid-3x3-gap-fill text-primary"></i>
          <span class="d-none d-sm-inline ms-1 fw-semibold">Joseph King Demo Hub</span>
        </a>

        <!-- Nav links (always visible) -->
        <ul class="nav nav-pills align-items-center gap-1">

          <li class="nav-item">
            <a class="nav-link px-2 ${currentId === 'home' ? 'nav-active fw-bold' : ''}" href="#home" title="Home">
              <i class="bi ${homePage?.icon || 'bi-house'}"></i>
              <span class="d-none d-md-inline ms-1">Home</span>
            </a>
          </li>

          <li class="nav-item">
            <a class="nav-link px-2 ${currentId === 'about' ? 'nav-active fw-bold' : ''}" href="#about" title="About">
              <i class="bi ${aboutPage?.icon || 'bi-info-circle'}"></i>
              <span class="d-none d-md-inline ms-1">About</span>
            </a>
          </li>

        </ul>

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
