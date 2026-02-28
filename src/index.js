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
        <div className="dropdown">
          <button
            className="btn btn-secondary dropdown-toggle"
            type="button"
            onClick={toggle}
            aria-expanded={open}
          >
            Navigate
          </button>
          <ul className={
            'dropdown-menu' + (open ? ' show' : '')
          }>
            <li>
              <Link
                className={
                  'dropdown-item' + (location.pathname === '/' ? ' active' : '')
                }
                to="/"
                onClick={close}
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                className={
                  'dropdown-item' + (location.pathname === '/tracker' ? ' active' : '')
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
