import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const navLinks = [
  { to: '/', label: '🏠 Dashboard' },
  { to: '/quiz', label: '🧠 Quiz' },
  { to: '/learn', label: '📚 Learning Path' },
  { to: '/profile', label: '👤 Profile' }
];

export default function HamburgerMenu() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="hamburger-wrapper">
      <button
        className="hamburger-btn"
        onClick={() => setOpen(!open)}
        aria-label="Menu"
      >
        {open ? '✕' : '☰'}
      </button>

      {open && (
        <nav className="hamburger-drawer">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`drawer-link ${location.pathname === link.to ? 'drawer-active' : ''}`}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}
