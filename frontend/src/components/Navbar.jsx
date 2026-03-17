import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, isAuthenticated, isOwner, isAdmin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setDropdownOpen(false);
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardLink = () => {
    if (isAdmin) return '/admin';
    if (isOwner) return '/owner-dashboard';
    return '/dashboard';
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">
          <div className="navbar-logo-text">
            Stay<span>zone</span>
          </div>
        </Link>

        <div className={`navbar-links ${mobileOpen ? 'open' : ''}`}>
          <Link to="/" className={`navbar-link ${isActive('/') ? 'active' : ''}`}>
            Home
          </Link>
          <Link to="/properties" className={`navbar-link ${isActive('/properties') ? 'active' : ''}`}>
            Properties
          </Link>
          {isAuthenticated && (
            <Link to={getDashboardLink()} className={`navbar-link ${isActive(getDashboardLink()) ? 'active' : ''}`}>
              Dashboard
            </Link>
          )}
          {isOwner && (
            <Link to="/add-property" className={`navbar-link ${isActive('/add-property') ? 'active' : ''}`}>
              List Property
            </Link>
          )}
        </div>

        <div className="navbar-actions">
          {isAuthenticated ? (
            <div className="navbar-user" ref={dropdownRef} onClick={() => setDropdownOpen(!dropdownOpen)}>
              <div className="navbar-avatar">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <span className="navbar-username">{user?.name || 'User'}</span>
              {dropdownOpen && (
                <div className="navbar-dropdown">
                  <Link to={getDashboardLink()} className="navbar-dropdown-item">
                    📊 Dashboard
                  </Link>
                  <Link to="/dashboard" className="navbar-dropdown-item">
                    👤 My Profile
                  </Link>
                  {isOwner && (
                    <Link to="/add-property" className="navbar-dropdown-item">
                      🏠 Add Property
                    </Link>
                  )}
                  <div className="navbar-dropdown-divider" />
                  <div className="navbar-dropdown-item danger" onClick={handleLogout}>
                    🚪 Logout
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">Log in</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
            </>
          )}
        </div>

        <button
          className={`navbar-toggle ${mobileOpen ? 'active' : ''}`}
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </nav>
  );
}
