import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import reportWebVitals from './reportWebVitals';
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useLocation,
  useNavigate,
  Navigate,
} from 'react-router-dom';
import HomePage from './components/HomePage';
import FocusTracker from './components/FocusTracker';

function Header() {
  const location = useLocation();
  const navigate = useNavigate();

  const label = location.pathname === '/focus-tracker' ? 'Focus Tracker' : 'Home';

  const handleSelect = path => {
    navigate(path);
  };

  return (
    <header className="bg-light">
      <div className="container-fluid py-2 d-flex justify-content-between align-items-center">
        <span className="navbar-brand mb-0 h1">FocusApp</span>
        <div className="dropdown">
          <button
            className="btn btn-secondary dropdown-toggle"
            type="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            {label}
          </button>
          <ul className="dropdown-menu">
            <li>
              <button
                className="dropdown-item"
                onClick={() => handleSelect('/')}
              >
                Home
              </button>
            </li>
            <li>
              <button
                className="dropdown-item"
                onClick={() => handleSelect('/focus-tracker')}
              >
                Focus Tracker
              </button>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
}

function Root() {
  return (
    <BrowserRouter>
      <Header />
      <div className="container mt-4">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/focus-tracker" element={<FocusTracker />} />
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
