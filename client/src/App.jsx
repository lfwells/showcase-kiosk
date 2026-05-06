import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Admin from './pages/Admin';
import Kiosk from './pages/Kiosk';
import Dashboard from './pages/Dashboard';
import Emulator from './pages/Emulator';
import './index.css';

function Navigation() {
  const location = useLocation();
  // Hide nav on the actual kiosk displays
  if (location.pathname.startsWith('/kiosk/')) return null;

  return (
    <nav className="nav">
      <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Admin</Link>
      <Link to="/dashboard" className={location.pathname === '/dashboard' ? 'active' : ''}>Dashboard</Link>
      <Link to="/emulator" className={location.pathname === '/emulator' ? 'active' : ''}>Emulator</Link>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <div className="container">
        <Navigation />
        <Routes>
          <Route path="/" element={<Admin />} />
          <Route path="/kiosk/:id" element={<Kiosk />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/emulator" element={<Emulator />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
