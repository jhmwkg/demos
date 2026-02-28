import React from 'react';
import ReactDOM from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import reportWebVitals from './reportWebVitals';
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  useNavigate,
  Navigate,
} from 'react-router-dom';
import HomePage from './components/HomePage';
import FocusTracker from './components/FocusTracker';
import GroceryList from './components/GroceryList';

function Header() {
  const location = useLocation();
  const navigate = useNavigate();

  const go = path => () => navigate(path);

  return (
    <header className="bg-light py-2">
      <div className="container d-flex gap-2">
        <button
          className={
            'btn btn-secondary' + (location.pathname === '/' ? ' active' : '')
          }
          onClick={go('/')}
        >
          Home
        </button>
        <button
          className={
            'btn btn-secondary' +
            (location.pathname === '/focus-tracker' ? ' active' : '')
          }
          onClick={go('/focus-tracker')}
        >
          Focus Tracker
        </button>
        <button
          className={
            'btn btn-secondary' +
            (location.pathname === '/grocery' ? ' active' : '')
          }
          onClick={go('/grocery')}
        >
          Grocery List
        </button>
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
          <Route path="/grocery" element={<GroceryList />} />
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
