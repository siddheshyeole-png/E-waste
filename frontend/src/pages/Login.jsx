import React, { useState } from 'react';
import Button from '../components/Button';

const AUTH_URL = 'http://localhost:5000/api/auth';

function Login({ onLoginSuccess, onNavigate }) {
  // Mode toggle: 'citizen' or 'admin'
  const [authRole, setAuthRole] = useState('citizen');
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (serverError) setServerError('');
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required.';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setServerError('');

    try {
      const response = await fetch(`${AUTH_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed. Please check your credentials.');
      }

      // Check if user role matches the tab they selected, or allow login and set role smoothly
      onLoginSuccess(data.user, data.token);
    } catch (err) {
      setServerError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper auth-page">
      <div className="section-container" style={{ maxWidth: '580px', margin: '0 auto' }}>
        {/* Header */}
        <div className="page-header-row text-center" style={{ flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
          <div className="status-pill-subtle" style={{ margin: '0 auto 0.75rem auto' }}>
            <span className="pulse-dot"></span>
            Role-Based Authentication • <span className="font-mono">JWT & BCRYPT</span>
          </div>
          <h1 className="page-title" style={{ fontSize: '2rem' }}>Welcome to EcoCycle</h1>
          <p className="page-desc" style={{ maxWidth: '480px', margin: '0 auto' }}>
            Sign in to access your recycling requests, schedule collections, or manage municipal operations.
          </p>
        </div>

        {/* Auth Role Selector Tabs */}
        <div className="auth-tab-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1.5rem', background: '#e2e8f0', padding: '4px', borderRadius: '12px' }}>
          <button
            type="button"
            className={`btn ${authRole === 'citizen' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ borderRadius: '8px', padding: '0.6rem 1rem', fontSize: '0.9rem', justifyContent: 'center' }}
            onClick={() => {
              setAuthRole('citizen');
              setServerError('');
            }}
          >
            <span className="material-symbols-outlined icon-inline">person</span>
            Citizen Portal
          </button>
          <button
            type="button"
            className={`btn ${authRole === 'admin' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ borderRadius: '8px', padding: '0.6rem 1rem', fontSize: '0.9rem', justifyContent: 'center' }}
            onClick={() => {
              setAuthRole('admin');
              setServerError('');
            }}
          >
            <span className="material-symbols-outlined icon-inline">admin_panel_settings</span>
            Admin Access
          </button>
        </div>

        {/* Server Error Alert */}
        {serverError && (
          <div className="api-error-banner" role="alert" style={{ marginBottom: '1.25rem' }}>
            <span className="material-symbols-outlined">error</span>
            <span>{serverError}</span>
            <button
              type="button"
              className="btn-close-banner"
              onClick={() => setServerError('')}
              aria-label="Dismiss"
            >
              &times;
            </button>
          </div>
        )}

        {/* Main Card */}
        <div className="form-card" style={{ padding: '2rem' }}>
          <div className="form-card-header" style={{ marginBottom: '1.5rem' }}>
            <div className="step-badge" style={{ background: authRole === 'admin' ? '#0f172a' : 'var(--primary)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '1.25rem', color: '#fff' }}>
                {authRole === 'admin' ? 'shield' : 'lock'}
              </span>
            </div>
            <div>
              <h2 className="card-heading">
                {authRole === 'admin' ? 'Administrator Login' : 'Citizen Login'}
              </h2>
              <span className="card-subheading">
                {authRole === 'admin'
                  ? 'Authorized campus and municipal operators only'
                  : 'Enter your credentials to manage pickup requests'}
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-fields-grid" style={{ gridTemplateColumns: '1fr', gap: '1.25rem' }}>
              {/* Email */}
              <div className="form-group full-width">
                <label htmlFor="loginEmail" className="form-label">
                  Email Address <span className="text-danger">*</span>
                </label>
                <div className="input-with-icon">
                  <span className="material-symbols-outlined input-icon">mail</span>
                  <input
                    type="email"
                    id="loginEmail"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder={authRole === 'admin' ? 'admin@ecocycle.org' : 'name@example.com'}
                    className={`form-input ${errors.email ? 'input-error' : ''}`}
                    autoComplete="email"
                  />
                </div>
                {errors.email && (
                  <span className="field-error">
                    <span className="material-symbols-outlined text-xs">error</span>
                    {errors.email}
                  </span>
                )}
              </div>

              {/* Password */}
              <div className="form-group full-width">
                <label htmlFor="loginPassword" className="form-label">
                  Password <span className="text-danger">*</span>
                </label>
                <div className="input-with-icon">
                  <span className="material-symbols-outlined input-icon">key</span>
                  <input
                    type="password"
                    id="loginPassword"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your secret password"
                    className={`form-input ${errors.password ? 'input-error' : ''}`}
                    autoComplete="current-password"
                  />
                </div>
                {errors.password && (
                  <span className="field-error">
                    <span className="material-symbols-outlined text-xs">error</span>
                    {errors.password}
                  </span>
                )}
              </div>

              {/* Submit Button */}
              <div className="full-width" style={{ marginTop: '0.5rem' }}>
                <Button
                  variant="primary"
                  type="submit"
                  disabled={loading}
                  className="full-width"
                  style={{ width: '100%', justifyContent: 'center', padding: '0.85rem' }}
                >
                  {loading ? (
                    <>
                      <span className="material-symbols-outlined spin-icon">sync</span>
                      Authenticating...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined icon-inline">login</span>
                      {authRole === 'admin' ? 'Sign In as Administrator' : 'Sign In to Citizen Portal'}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>

          {/* Citizen Registration Link */}
          {authRole === 'citizen' && (
            <div style={{ marginTop: '1.5rem', textAlign: 'center', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)' }}>
              <p className="text-sm text-muted">
                Don't have a citizen account yet?{' '}
                <button
                  type="button"
                  onClick={() => onNavigate('register')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--primary)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  Register here
                </button>
              </p>
            </div>
          )}

          {authRole === 'admin' && (
            <div style={{ marginTop: '1.5rem', textAlign: 'center', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)' }}>
              <p className="text-xs text-muted">
                <span className="material-symbols-outlined icon-inline" style={{ fontSize: '14px', verticalAlign: 'middle' }}>lock</span>
                Administrator credentials are configured securely in <code>backend/.env</code>. Public admin registration is disabled.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;
