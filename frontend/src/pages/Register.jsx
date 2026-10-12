import React, { useState } from 'react';
import Button from '../components/Button';

const AUTH_URL = 'http://localhost:5000/api/auth';

function Register({ onLoginSuccess, onNavigate }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
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

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required.';
    } else if (!/^[A-Za-z\s]+$/.test(formData.name.trim())) {
      newErrors.name = 'Name should contain only letters and spaces.';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email format (e.g. user@campus.edu).';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required.';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password.';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
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
      const response = await fetch(`${AUTH_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed. Email may already be in use.');
      }

      // Auto-authenticate citizen on successful registration
      onLoginSuccess(data.user, data.token);
    } catch (err) {
      setServerError(err.message || 'Unable to register citizen account.');
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
            Citizen Enrollment • <span className="font-mono">PUBLIC PORTAL</span>
          </div>
          <h1 className="page-title" style={{ fontSize: '2rem' }}>Register as Citizen</h1>
          <p className="page-desc" style={{ maxWidth: '480px', margin: '0 auto' }}>
            Create your EcoCycle account to schedule electronic waste pickups, track status, and contribute to responsible campus recycling.
          </p>
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
            <div className="step-badge" style={{ background: 'var(--primary)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '1.25rem', color: '#fff' }}>
                person_add
              </span>
            </div>
            <div>
              <h2 className="card-heading">Citizen Account Registration</h2>
              <span className="card-subheading">Public accounts are assigned the Citizen role</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-fields-grid" style={{ gridTemplateColumns: '1fr', gap: '1.25rem' }}>
              {/* Full Name */}
              <div className="form-group full-width">
                <label htmlFor="regName" className="form-label">
                  Full Name <span className="text-danger">*</span>
                </label>
                <div className="input-with-icon">
                  <span className="material-symbols-outlined input-icon">person</span>
                  <input
                    type="text"
                    id="regName"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Ananya Sharma"
                    className={`form-input ${errors.name ? 'input-error' : ''}`}
                    autoComplete="name"
                  />
                </div>
                {errors.name && (
                  <span className="field-error">
                    <span className="material-symbols-outlined text-xs">error</span>
                    {errors.name}
                  </span>
                )}
              </div>

              {/* Email Address */}
              <div className="form-group full-width">
                <label htmlFor="regEmail" className="form-label">
                  Email Address <span className="text-danger">*</span>
                </label>
                <div className="input-with-icon">
                  <span className="material-symbols-outlined input-icon">mail</span>
                  <input
                    type="email"
                    id="regEmail"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="e.g. ananya@campus.edu"
                    className={`form-input ${errors.email ? 'input-error' : ''}`}
                    autoComplete="email"
                  />
                </div>
                {errors.email ? (
                  <span className="field-error">
                    <span className="material-symbols-outlined text-xs">error</span>
                    {errors.email}
                  </span>
                ) : (
                  <span className="form-hint">Used for login and pickup notification receipts.</span>
                )}
              </div>

              {/* Password */}
              <div className="form-group full-width">
                <label htmlFor="regPassword" className="form-label">
                  Password <span className="text-danger">*</span>
                </label>
                <div className="input-with-icon">
                  <span className="material-symbols-outlined input-icon">key</span>
                  <input
                    type="password"
                    id="regPassword"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="At least 6 characters"
                    className={`form-input ${errors.password ? 'input-error' : ''}`}
                    autoComplete="new-password"
                  />
                </div>
                {errors.password && (
                  <span className="field-error">
                    <span className="material-symbols-outlined text-xs">error</span>
                    {errors.password}
                  </span>
                )}
              </div>

              {/* Confirm Password */}
              <div className="form-group full-width">
                <label htmlFor="regConfirmPassword" className="form-label">
                  Confirm Password <span className="text-danger">*</span>
                </label>
                <div className="input-with-icon">
                  <span className="material-symbols-outlined input-icon">lock_reset</span>
                  <input
                    type="password"
                    id="regConfirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-enter your password"
                    className={`form-input ${errors.confirmPassword ? 'input-error' : ''}`}
                    autoComplete="new-password"
                  />
                </div>
                {errors.confirmPassword && (
                  <span className="field-error">
                    <span className="material-symbols-outlined text-xs">error</span>
                    {errors.confirmPassword}
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
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined icon-inline">check_circle</span>
                      Complete Citizen Registration
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>

          {/* Login Link */}
          <div style={{ marginTop: '1.5rem', textAlign: 'center', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)' }}>
            <p className="text-sm text-muted">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => onNavigate('login')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--primary)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                Log in here
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
