/**
 * components/footer.js
 *
 * Renders a simple site-wide footer with social links.
 */

/**
 * @returns {void}
 */
export function renderFooter() {
  const root = document.getElementById('footer-root');
  if (!root) return;

  root.innerHTML = `
    <footer class="py-3 text-center text-muted small">
      <div>
        <a href="https://www.linkedin.com/in/joseph-king-swfl/" target="_blank" rel="noopener noreferrer">
          LinkedIn
        </a>
        &nbsp;|&nbsp;
        <a href="https://www.instagram.com/whidone" target="_blank" rel="noopener noreferrer">
          Instagram
        </a>
      </div>
    </footer>
  `;
}
