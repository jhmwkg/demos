import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useLocation,
  Navigate,
} from 'react-router-dom';
import HomePage from './components/HomePage';
import FocusTracker from './components/FocusTracker';

function Header() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const toggle = () => setOpen(o => !o);
  const close = () => setOpen(false);

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">
          FocusApp
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          aria-label="Toggle navigation"
          onClick={toggle}
        >
          <span className="navbar-toggler-icon" />
        </button>
        <div
          className={
            'collapse navbar-collapse' + (open ? ' show' : '')
          }
          id="navbarNav"
        >
          <ul className="navbar-nav">
            <li className="nav-item">
              <Link
                className={
                  'nav-link' + (location.pathname === '/' ? ' active' : '')
                }
                to="/"
                onClick={close}
              >
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className={
                  'nav-link' + (location.pathname === '/tracker' ? ' active' : '')
                }
                to="/tracker"
                onClick={close}
              >
                Tracker
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

function Root() {
  return (
    <BrowserRouter>
      <Header />
      <div className="container mt-4">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/tracker" element={<FocusTracker />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);

// performance measurement (unchanged)
reportWebVitals();
