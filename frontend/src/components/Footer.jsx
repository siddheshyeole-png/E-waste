import React from 'react';

// Reusable Footer Component
function Footer({ onNavigate }) {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Main Footer Grid */}
        <div className="footer-grid">
          {/* Column 1: Brand & About */}
          <div className="footer-col">
            <div className="footer-brand">
              <img src="/logo.svg" alt="EcoCycle Logo" className="brand-logo" />
              <span className="brand-title">EcoCycle</span>
            </div>
            <p className="footer-description">
              An institutional e-waste collection and auditing platform engineered to ensure
              responsible disposal, safe logistics, and verified campus sustainability throughput.
            </p>
            <div className="footer-badge">
              <span className="status-dot"></span>
              <span>Campus Recycling Protocol</span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="footer-col">
            <h4 className="footer-heading">Quick Navigation</h4>
            <ul className="footer-links">
              <li>
                <button onClick={() => onNavigate('home')} className="footer-link-btn">
                  Home
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('request-pickup')} className="footer-link-btn">
                  Book a Pickup
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('my-requests')} className="footer-link-btn">
                  Track Requests
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('admin')} className="footer-link-btn">
                  Admin Portal
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: E-Waste Guidelines */}
          <div className="footer-col">
            <h4 className="footer-heading">E-Waste Guidelines</h4>
            <ul className="footer-guidelines">
              <li>Computers, Laptops & Servers</li>
              <li>Lithium-Ion & Lead Acid Batteries</li>
              <li>Display Monitors & CRT Panels</li>
              <li>Lab Equipment & Peripherals</li>
              <li>Consumer Electronics & Cabling</li>
            </ul>
          </div>

          {/* Column 4: Support & Facility */}
          <div className="footer-col">
            <h4 className="footer-heading">Support & Facility</h4>
            <p className="footer-contact-item">
              Central Operations Dock 4, Sustainability Pavilion, North Campus
            </p>
            <p className="footer-contact-item">
              Email: <strong>recycle@ecocycle-campus.edu</strong>
            </p>
            <p className="footer-contact-item">
              Dispatch Hotline: <strong>+1 (555) 019-3283</strong>
            </p>
          </div>
        </div>

        {/* Bottom Credits */}
        <div className="footer-bottom">
          <p>© 2026 EcoCycle Recycling Management System. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
