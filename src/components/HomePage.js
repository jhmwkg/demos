import React from 'react';
import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div className="text-center py-4">
      <h1>Home Page</h1>
      <p>Welcome to the focus tracker demo.</p>
      <Link to="/tracker" className="btn btn-primary">
        Go to Tracker
      </Link>
    </div>
  );
}
