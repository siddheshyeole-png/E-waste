import React, { useState } from 'react';

// Reusable Top Navigation Bar with Authentication and Role-Based Controls
function Navbar({ currentPage, onNavigate, currentUser, onLogout }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (page) => {
    onNavigate(page);
    setMobileMenuOpen(false);
  };

  const handleLogoutClick = () => {
    setMobileMenuOpen(false);
    if (onLogout) onLogout();
  };

  const isCitizen = currentUser && currentUser.role === 'citizen';
  const isAdmin = currentUser && currentUser.role === 'admin';

  return (
    <header className="navbar">
      <div className="navbar-container">
        {/* Brand Logo & Title */}
        <div className="navbar-brand" onClick={() => handleNavClick('home')}>
          <img src="/logo.svg" alt="EcoCycle Logo" className="brand-logo" />
          <div className="brand-text">
            <span className="brand-title">EcoCycle</span>
            <span className="brand-subtitle">E-Waste Collection</span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="nav-links">
          <button
            className={`nav-link ${currentPage === 'home' ? 'active' : ''}`}
            onClick={() => handleNavClick('home')}
          >
            Home
          </button>

          {/* Citizen & Public Links */}
          {(!currentUser || isCitizen) && (
            <button
              className={`nav-link ${currentPage === 'request-pickup' ? 'active' : ''}`}
              onClick={() => handleNavClick('request-pickup')}
            >
              Request Pickup
            </button>
          )}

          {isCitizen && (
            <button
              className={`nav-link ${currentPage === 'my-requests' ? 'active' : ''}`}
              onClick={() => handleNavClick('my-requests')}
            >
              My Requests
            </button>
          )}

          {/* Admin Link */}
          {isAdmin && (
            <button
              className={`nav-link nav-admin ${currentPage === 'admin' ? 'active' : ''}`}
              onClick={() => handleNavClick('admin')}
            >
              <span className="material-symbols-outlined nav-icon">admin_panel_settings</span>
              Admin Console
            </button>
          )}

          {/* Unauthenticated Links */}
          {!currentUser && (
            <>
              <button
                className={`nav-link ${currentPage === 'login' ? 'active' : ''}`}
                onClick={() => handleNavClick('login')}
              >
                Login
              </button>
              <button
                className={`nav-link ${currentPage === 'register' ? 'active' : ''}`}
                onClick={() => handleNavClick('register')}
              >
                Register
              </button>
            </>
          )}
        </nav>

        {/* Right Action Area */}
        <div className="navbar-actions">
          {currentUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {/* User Badge */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.35rem 0.75rem',
                  background: isAdmin ? '#0f172a' : 'var(--primary-light)',
                  color: isAdmin ? '#ffffff' : 'var(--primary-hover)',
                  borderRadius: '20px',
                  fontSize: '0.82rem',
                  fontWeight: 600
                }}
                title={currentUser.email}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                  {isAdmin ? 'shield_person' : 'person'}
                </span>
                <span>{currentUser.name}</span>
                <span
                  style={{
                    fontSize: '0.7rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    opacity: 0.8,
                    background: isAdmin ? 'rgba(255,255,255,0.2)' : 'rgba(22,163,74,0.15)',
                    padding: '1px 6px',
                    borderRadius: '10px'
                  }}
                >
                  {currentUser.role}
                </span>
              </div>

              {/* Logout Button */}
              <button
                type="button"
                className="btn btn-secondary"
                style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}
                onClick={handleLogoutClick}
                title="Log Out"
              >
                <span className="material-symbols-outlined icon-inline" style={{ fontSize: '18px' }}>logout</span>
                Logout
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                className="btn btn-secondary"
                style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem' }}
                onClick={() => handleNavClick('login')}
              >
                Sign In
              </button>
              <button
                className="btn btn-primary"
                style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem' }}
                onClick={() => handleNavClick('register')}
              >
                Register
              </button>
            </div>
          )}

          {/* Mobile Hamburger Button */}
          <button
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            <span className="material-symbols-outlined">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Navigation */}
      {mobileMenuOpen && (
        <div className="mobile-nav-menu">
          <button
            className={`mobile-nav-link ${currentPage === 'home' ? 'active' : ''}`}
            onClick={() => handleNavClick('home')}
          >
            <span className="material-symbols-outlined">home</span>
            Home
          </button>

          {(!currentUser || isCitizen) && (
            <button
              className={`mobile-nav-link ${currentPage === 'request-pickup' ? 'active' : ''}`}
              onClick={() => handleNavClick('request-pickup')}
            >
              <span className="material-symbols-outlined">local_shipping</span>
              Request Pickup
            </button>
          )}

          {isCitizen && (
            <button
              className={`mobile-nav-link ${currentPage === 'my-requests' ? 'active' : ''}`}
              onClick={() => handleNavClick('my-requests')}
            >
              <span className="material-symbols-outlined">inventory_2</span>
              My Requests
            </button>
          )}

          {isAdmin && (
            <button
              className={`mobile-nav-link ${currentPage === 'admin' ? 'active' : ''}`}
              onClick={() => handleNavClick('admin')}
            >
              <span className="material-symbols-outlined">admin_panel_settings</span>
              Admin Console
            </button>
          )}

          {!currentUser ? (
            <>
              <button
                className={`mobile-nav-link ${currentPage === 'login' ? 'active' : ''}`}
                onClick={() => handleNavClick('login')}
              >
                <span className="material-symbols-outlined">login</span>
                Sign In
              </button>
              <button
                className={`mobile-nav-link ${currentPage === 'register' ? 'active' : ''}`}
                onClick={() => handleNavClick('register')}
              >
                <span className="material-symbols-outlined">person_add</span>
                Register
              </button>
            </>
          ) : (
            <button
              className="mobile-nav-link"
              onClick={handleLogoutClick}
              style={{ color: '#dc2626' }}
            >
              <span className="material-symbols-outlined">logout</span>
              Logout ({currentUser.name})
            </button>
          )}
        </div>
      )}
    </header>
  );
}

export default Navbar;
