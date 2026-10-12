import React, { useState, useEffect } from 'react';
import Button from '../components/Button';

function RequestPickup({ onNavigate, onAddRequest, currentUser }) {
  // 1. Form state to store user input
  const [formData, setFormData] = useState({
    fullName: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: '',
    category: '',
    quantity: '1',
    unit: 'Units',
    itemModel: '',
    condition: 'Non-Working / Broken',
    address: '',
    city: '',
    pincode: '',
    pickupDate: '',
    timeSlot: '',
    notes: '',
    agreement: false
  });

  // Sync user info if currentUser changes or logs in
  useEffect(() => {
    if (currentUser) {
      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName || currentUser.name || '',
        email: prev.email || currentUser.email || ''
      }));
    }
  }, [currentUser]);

  // 2. State to store validation errors for each field
  const [errors, setErrors] = useState({});

  // 3. State to store the ID of successfully submitted request
  const [submittedId, setSubmittedId] = useState(null);

  // 4. State to store submission failure error message
  const [submitError, setSubmitError] = useState('');

  // 5. State to indicate active backend network submission
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 6. State to hold submitted request modal details across refresh
  const [successModalData, setSuccessModalData] = useState(null);

  // Restore and display success popup modal if the page just refreshed after a successful submission
  useEffect(() => {
    const stored = sessionStorage.getItem('ecocycle_submitted_request');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setSuccessModalData(parsed);
        setSubmittedId(parsed.id);
      } catch (e) {
        console.error('Failed to parse submitted request data:', e);
      }
      sessionStorage.removeItem('ecocycle_submitted_request');
    }
  }, []);

  // Handle input changes and clear that specific field's error when user types
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: fieldValue
    }));

    if (submitError) {
      setSubmitError('');
    }

    // If an error exists for this field, clear it as soon as the user starts correcting it
    if (errors[name]) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: ''
      }));
    }
  };

  // Client-Side Validation Function (Returns { isValid, errors })
  const validateForm = () => {
    const newErrors = {};

    // Rule 1 & 2: Full Name cannot be empty and must have only letters and spaces
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full Name cannot be empty.';
    } else if (!/^[A-Za-z\s]+$/.test(formData.fullName.trim())) {
      newErrors.fullName = 'Full Name should contain only letters and spaces.';
    }

    // Rule 3: Email must have a valid basic email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email cannot be empty.';
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email format (e.g., student@campus.edu).';
    }

    // Rule 4: Mobile Number must contain exactly 10 digits
    const digitsOnly = formData.phone.trim().replace(/\D/g, '');
    if (!formData.phone.trim()) {
      newErrors.phone = 'Mobile number cannot be empty.';
    } else if (digitsOnly.length !== 10) {
      newErrors.phone = 'Mobile number must contain exactly 10 digits.';
    }

    // Rule 5: E-Waste Category must be selected
    if (!formData.category || formData.category.trim() === '') {
      newErrors.category = 'Please select an e-waste category.';
    }

    // Rule 6: Item Name cannot be empty
    if (!formData.itemModel.trim()) {
      newErrors.itemModel = 'Item Name cannot be empty.';
    }

    // Rule 7: Quantity must be at least 1
    if (!formData.quantity || Number(formData.quantity) < 1) {
      newErrors.quantity = 'Quantity must be at least 1.';
    }

    // Rule 8: Pickup Address cannot be empty
    if (!formData.address.trim()) {
      newErrors.address = 'Pickup Address cannot be empty.';
    }

    // Rule 9: City cannot be empty
    if (!formData.city.trim()) {
      newErrors.city = 'City cannot be empty.';
    }

    // Rule 10 & 11: Pickup Date cannot be empty and cannot be in the past
    if (!formData.pickupDate) {
      newErrors.pickupDate = 'Pickup Date cannot be empty.';
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // reset time to start of today
      const selected = new Date(formData.pickupDate + 'T00:00:00');

      if (selected < today) {
        newErrors.pickupDate = 'Pickup Date cannot be a past date.';
      }
    }

    // Rule 12: Preferred Time must be selected
    if (!formData.timeSlot || formData.timeSlot.trim() === '') {
      newErrors.timeSlot = 'Preferred Time must be selected.';
    }

    // Non-hazardous equipment declaration agreement
    if (!formData.agreement) {
      newErrors.agreement = 'Please confirm the non-hazardous equipment declaration.';
    }

    // Update state with any found errors
    setErrors(newErrors);

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors
    };
  };

  // Form Submission Handler
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent standard browser form submission

    // Run client-side validation
    const { isValid, errors: validationErrors } = validateForm();

    if (!isValid) {
      const errorKeys = Object.keys(validationErrors);
      const fieldLabels = {
        fullName: 'Full Name',
        email: 'Email Address',
        phone: 'Mobile Number (10 digits)',
        category: 'E-Waste Category',
        itemModel: 'Item Name & Description',
        quantity: 'Quantity / Weight',
        address: 'Pickup Address',
        city: 'City / Campus Zone',
        pickupDate: 'Preferred Pickup Date',
        timeSlot: 'Preferred Time Slot',
        agreement: 'Non-Hazardous Declaration Checkbox'
      };

      const missingList = errorKeys.map((k) => fieldLabels[k] || k).join('\n• ');
      alert(`⚠️ Please complete all required fields before submitting:\n\n• ${missingList}`);
      setSubmitError('Please complete all required fields marked with * before submitting.');

      // Scroll smoothly to the first error input field
      const firstKey = errorKeys[0];
      const targetEl = document.querySelector(`[name="${firstKey}"]`) || document.querySelector('.input-error');
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        if (targetEl.focus) targetEl.focus();
      }
      return;
    }

    // Map form fields to backend REST API / MySQL schema names
    const requestPayload = {
      user_name: formData.fullName.trim() || currentUser?.name || '',
      email: formData.email.trim() || currentUser?.email || '',
      phone: formData.phone.trim(),
      category: formData.category,
      item_name: formData.itemModel.trim(),
      quantity: Number(formData.quantity) || 1,
      address: formData.address.trim(),
      city: formData.city.trim(),
      pickup_date: formData.pickupDate,
      time_slot: formData.timeSlot,
      status: 'Pending'
    };

    setIsSubmitting(true);
    setSubmitError('');

    try {
      let created = null;

      // Add to database via API callback prop passed from App.jsx
      if (onAddRequest) {
        created = await onAddRequest(requestPayload);
      }

      // Ensure confirmed record creation before resetting form or showing success
      if (!created || !created.id) {
        throw new Error('Database insertion could not be confirmed.');
      }

      // Store in sessionStorage so the page refresh displays the celebratory modal popup
      const submissionInfo = {
        id: created.id,
        item: requestPayload.item_name,
        category: requestPayload.category,
        quantity: requestPayload.quantity,
        date: requestPayload.pickup_date,
        timeSlot: requestPayload.time_slot,
        address: requestPayload.address,
        city: requestPayload.city,
        name: requestPayload.user_name,
        email: requestPayload.email
      };
      sessionStorage.setItem('ecocycle_submitted_request', JSON.stringify(submissionInfo));

      // Show native popup confirmation dialog
      alert(`✅ Pickup Request Submitted Successfully!\n\nTracking ID: #${created.id}\nStatus: Pending\nItem: ${requestPayload.item_name}\nPickup Date: ${requestPayload.pickup_date}\nTime Slot: ${requestPayload.time_slot}\n\nYour collection request has been recorded in the database.`);

      // Refresh the page
      window.location.reload();
    } catch (err) {
      console.error('Submission failed:', err);
      setIsSubmitting(false);
      setSubmittedId(null);
      setSubmitError(err.message || 'Submission failed. Please check backend connection and try again.');
      alert(`⚠️ Failed to submit pickup request:\n${err.message || 'Server connection error. Please verify backend is running.'}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Reset form handler
  const handleReset = () => {
    setFormData({
      fullName: currentUser?.name || '',
      email: currentUser?.email || '',
      phone: '',
      category: '',
      quantity: '1',
      unit: 'Units',
      itemModel: '',
      condition: 'Non-Working / Broken',
      address: '',
      city: '',
      pincode: '',
      pickupDate: '',
      timeSlot: '',
      notes: '',
      agreement: false
    });
    setErrors({});
    setSubmittedId(null);
    setSubmitError('');
  };

  // Quick helper to fill sample data for quick demonstration
  const handleFillSample = () => {
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    setFormData({
      fullName: currentUser?.name || 'Rahul Patil',
      email: currentUser?.email || 'rahul.patil@campus.edu',
      phone: '9876543210',
      category: 'Computers & Laptops',
      quantity: '2',
      unit: 'Units',
      itemModel: 'Dell Inspiron 15 & Lenovo ThinkPad',
      condition: 'Non-Working / Broken',
      address: 'Hostel Block B, Room 204, North Campus',
      city: 'Pune',
      pincode: '411007',
      pickupDate: tomorrow,
      timeSlot: 'Afternoon (12:00 PM – 04:00 PM)',
      notes: 'Available after 1 PM.',
      agreement: true
    });
    setErrors({});
    setSubmitError('');
  };

  return (
    <div className="page-wrapper request-pickup-page">
      <div className="section-container">
        {/* Breadcrumb Navigation */}
        <nav className="breadcrumb">
          <button onClick={() => onNavigate('home')} className="breadcrumb-link" type="button">
            <span className="material-symbols-outlined icon-inline">home</span>
            Home
          </button>
          <span className="breadcrumb-separator material-symbols-outlined">chevron_right</span>
          <span className="breadcrumb-current">Request Pickup</span>
        </nav>

        {/* Page Header */}
        <div className="page-header-row">
          <div>
            <div className="status-pill-subtle">
              <span className="pulse-dot"></span>
              Doorstep Logistics Dispatch Ready
            </div>
            <h1 className="page-title">Schedule an E-Waste Pickup</h1>
            <p className="page-desc">
              Fill out the form below to request an institutional or doorstep collection for your
              decommissioned electronic scrap. Verified chain-of-custody guaranteed.
            </p>
          </div>

          <div className="dispatch-badge-card">
            <div className="dispatch-badge-icon">
              <span className="material-symbols-outlined">local_shipping</span>
            </div>
            <div>
              <span className="dispatch-badge-sub">Avg Campus Dispatch</span>
              <strong className="dispatch-badge-val">24–48 Hours</strong>
            </div>
          </div>
        </div>

        {/* Unauthenticated Alert Prompt */}
        {!currentUser && (
          <div className="callout-box" style={{ background: '#fef3c7', border: '1px solid #fde68a', color: '#92400e', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', padding: '1rem 1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span className="material-symbols-outlined" style={{ color: '#d97706', fontSize: '24px' }}>lock</span>
              <div>
                <strong>Authentication Required to Submit Requests</strong>
                <p style={{ margin: 0, fontSize: '0.85rem' }}>You must sign in with a Citizen account to book a pickup and track your recycling progress.</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="button" className="btn btn-secondary" style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem' }} onClick={() => onNavigate('login')}>
                Sign In
              </button>
              <button type="button" className="btn btn-primary" style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem' }} onClick={() => onNavigate('register')}>
                Register Citizen
              </button>
            </div>
          </div>
        )}

        {/* Conditional Rendering: Success Alert (Shown only after successful submission) */}
        {submittedId && (
          <div className="submission-success-banner">
            <div className="success-content">
              <span className="material-symbols-outlined success-icon">check_circle</span>
              <div>
                <h3 className="success-title">Pickup Booking Successfully Submitted!</h3>
                <p className="success-text">
                  Tracking ID <strong className="font-mono">{submittedId}</strong> has been registered with status <strong className="text-primary font-semibold">Pending</strong>.
                  The request is now visible in both My Requests and Admin Console.
                </p>
              </div>
            </div>
            <div className="success-actions">
              <Button
                variant="primary"
                onClick={() => onNavigate('my-requests')}
                icon="inventory_2"
              >
                View in My Requests
              </Button>
              <button
                type="button"
                className="btn-close"
                onClick={() => setSubmittedId(null)}
                aria-label="Close"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
          </div>
        )}

        {/* Conditional Rendering: Submission Failure Error Alert */}
        {submitError && (
          <div className="api-error-banner" role="alert" style={{ marginBottom: '1.5rem' }}>
            <span className="material-symbols-outlined">error</span>
            <span>{submitError}</span>
            <button
              type="button"
              className="btn-close-banner"
              onClick={() => setSubmitError('')}
              aria-label="Dismiss error"
            >
              &times;
            </button>
          </div>
        )}

        {/* Two-Column Layout */}
        <div className="form-layout-grid">
          {/* Main Form Column */}
          <div className="form-column">
            {/* noValidate disables standard browser bubble popups so our React validation errors show */}
            <form onSubmit={handleSubmit} noValidate className="pickup-form">
              {/* Form Intro Box */}
              <div className="form-card">
                <div className="form-card-header">
                  <div className="step-badge">1</div>
                  <div>
                    <h2 className="card-heading">Request Details</h2>
                    <span className="card-subheading">Step 1 of 1 • Campus Collection Intake</span>
                  </div>
                </div>
                <div className="callout-box">
                  <span className="material-symbols-outlined text-primary">info</span>
                  <p>
                    Please provide authentic contact and address coordinates. All fields marked with * are required.
                  </p>
                </div>
              </div>

              {/* 1. Personal & Contact Information */}
              <div className="form-card">
                <div className="form-card-title-row">
                  <span className="material-symbols-outlined text-primary">badge</span>
                  <h3 className="section-title">1. Personal & Contact Information</h3>
                </div>

                <div className="form-fields-grid">
                  {/* Full Name */}
                  <div className="form-group full-width">
                    <label htmlFor="fullName" className="form-label">
                      Full Name <span className="text-danger">*</span>
                    </label>
                    <div className="input-with-icon">
                      <span className="material-symbols-outlined input-icon">person</span>
                      <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="e.g. Rahul Patil"
                        className={`form-input ${errors.fullName ? 'input-error' : ''}`}
                      />
                    </div>
                    {/* Conditional Rendering: Validation error message */}
                    {errors.fullName ? (
                      <span className="field-error">
                        <span className="material-symbols-outlined text-xs">error</span>
                        {errors.fullName}
                      </span>
                    ) : (
                      <span className="form-hint">Only alphabetic characters and spaces allowed.</span>
                    )}
                  </div>

                  {/* Email Address */}
                  <div className="form-group">
                    <label htmlFor="email" className="form-label">
                      Email Address <span className="text-danger">*</span>
                    </label>
                    <div className="input-with-icon">
                      <span className="material-symbols-outlined input-icon">mail</span>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="e.g. rahul.patil@campus.edu"
                        className={`form-input ${errors.email ? 'input-error' : ''}`}
                      />
                    </div>
                    {errors.email ? (
                      <span className="field-error">
                        <span className="material-symbols-outlined text-xs">error</span>
                        {errors.email}
                      </span>
                    ) : (
                      <span className="form-hint">Confirmation manifest will be sent here.</span>
                    )}
                  </div>

                  {/* Mobile Number */}
                  <div className="form-group">
                    <label htmlFor="phone" className="form-label">
                      Mobile Number <span className="text-danger">*</span>
                    </label>
                    <div className="input-with-icon">
                      <span className="material-symbols-outlined input-icon">call</span>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="e.g. 9876543210 (10 digits)"
                        className={`form-input ${errors.phone ? 'input-error' : ''}`}
                      />
                    </div>
                    {errors.phone ? (
                      <span className="field-error">
                        <span className="material-symbols-outlined text-xs">error</span>
                        {errors.phone}
                      </span>
                    ) : (
                      <span className="form-hint">Enter a 10-digit mobile number.</span>
                    )}
                  </div>
                </div>
              </div>

              {/* 2. E-Waste Item Classification */}
              <div className="form-card">
                <div className="form-card-title-row">
                  <span className="material-symbols-outlined text-primary">devices</span>
                  <h3 className="section-title">2. E-Waste Item Classification</h3>
                </div>

                <div className="form-fields-grid">
                  {/* Category Selector */}
                  <div className="form-group">
                    <label htmlFor="category" className="form-label">
                      E-Waste Category <span className="text-danger">*</span>
                    </label>
                    <div className="select-wrapper">
                      <select
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className={`form-select ${errors.category ? 'input-error' : ''}`}
                      >
                        <option value="">Select Category...</option>
                        <option value="Computers & Laptops">Computers & Laptops</option>
                        <option value="Mobile Phones & Tablets">Mobile Phones & Tablets</option>
                        <option value="TVs & Monitors">TVs & Monitors (LCD/LED)</option>
                        <option value="Batteries & UPS">Batteries & UPS Units</option>
                        <option value="Printers & Scanners">Printers & Scanners</option>
                        <option value="Small Home Appliances">Small Home Appliances</option>
                        <option value="Others">Others / Mixed Cabling</option>
                      </select>
                      <span className="material-symbols-outlined select-arrow">expand_more</span>
                    </div>
                    {errors.category ? (
                      <span className="field-error">
                        <span className="material-symbols-outlined text-xs">error</span>
                        {errors.category}
                      </span>
                    ) : (
                      <span className="form-hint">Categorization ensures proper handling.</span>
                    )}
                  </div>

                  {/* Quantity and Unit */}
                  <div className="form-group">
                    <label htmlFor="quantity" className="form-label">
                      Quantity / Weight <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <input
                        type="number"
                        id="quantity"
                        name="quantity"
                        min="1"
                        value={formData.quantity}
                        onChange={handleChange}
                        className={`form-input ${errors.quantity ? 'input-error' : ''}`}
                      />
                      <select
                        name="unit"
                        value={formData.unit}
                        onChange={handleChange}
                        className="form-select unit-select"
                      >
                        <option value="Units">Units</option>
                        <option value="Kg">Kg</option>
                        <option value="Cartons">Cartons</option>
                      </select>
                    </div>
                    {errors.quantity ? (
                      <span className="field-error">
                        <span className="material-symbols-outlined text-xs">error</span>
                        {errors.quantity}
                      </span>
                    ) : (
                      <span className="form-hint">Must be at least 1 unit or kg.</span>
                    )}
                  </div>

                  {/* Item Description / Model */}
                  <div className="form-group full-width">
                    <label htmlFor="itemModel" className="form-label">
                      Item Name & Description <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      id="itemModel"
                      name="itemModel"
                      value={formData.itemModel}
                      onChange={handleChange}
                      placeholder="e.g. Dell Inspiron 15, HP LaserJet, Broken Tablet"
                      className={`form-input ${errors.itemModel ? 'input-error' : ''}`}
                    />
                    {errors.itemModel ? (
                      <span className="field-error">
                        <span className="material-symbols-outlined text-xs">error</span>
                        {errors.itemModel}
                      </span>
                    ) : (
                      <span className="form-hint">Mention item brand, model, or hardware type.</span>
                    )}
                  </div>

                  {/* Hardware Operational Condition */}
                  <div className="form-group full-width">
                    <label className="form-label">
                      Hardware Operational Condition
                    </label>
                    <div className="radio-cards-grid">
                      {['Working / Repairable', 'Non-Working / Broken', 'Scrap / Spare Parts'].map((cond) => (
                        <label
                          key={cond}
                          className={`radio-card ${formData.condition === cond ? 'active' : ''}`}
                        >
                          <input
                            type="radio"
                            name="condition"
                            value={cond}
                            checked={formData.condition === cond}
                            onChange={handleChange}
                          />
                          <div className="radio-card-content">
                            <span className="radio-title">{cond}</span>
                            <span className="radio-subtitle">
                              {cond.includes('Working')
                                ? 'Eligible for refurbishment'
                                : cond.includes('Non-Working')
                                ? 'Physical or internal defects'
                                : 'For raw material salvage'}
                            </span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Physical Pickup Location */}
              <div className="form-card">
                <div className="form-card-title-row">
                  <span className="material-symbols-outlined text-primary">location_on</span>
                  <h3 className="section-title">3. Physical Pickup Location</h3>
                </div>

                <div className="form-fields-grid">
                  <div className="form-group full-width">
                    <label htmlFor="address" className="form-label">
                      Pickup Address <span className="text-danger">*</span>
                    </label>
                    <textarea
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      rows="3"
                      placeholder="Street address, building/hall name, department, or room number"
                      className={`form-textarea ${errors.address ? 'input-error' : ''}`}
                    />
                    {errors.address && (
                      <span className="field-error">
                        <span className="material-symbols-outlined text-xs">error</span>
                        {errors.address}
                      </span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="city" className="form-label">
                      City / Campus Zone <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="e.g. Pune, Mumbai, North Campus"
                      className={`form-input ${errors.city ? 'input-error' : ''}`}
                    />
                    {errors.city && (
                      <span className="field-error">
                        <span className="material-symbols-outlined text-xs">error</span>
                        {errors.city}
                      </span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="pincode" className="form-label">
                      Postal Code / Pincode
                    </label>
                    <input
                      type="text"
                      id="pincode"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleChange}
                      placeholder="e.g. 411007"
                      className="form-input"
                    />
                    <span className="form-hint">Optional 6-digit postal code.</span>
                  </div>
                </div>
              </div>

              {/* 4. Schedule Preference */}
              <div className="form-card">
                <div className="form-card-title-row">
                  <span className="material-symbols-outlined text-primary">calendar_clock</span>
                  <h3 className="section-title">4. Schedule Preference</h3>
                </div>

                <div className="form-fields-grid">
                  {/* Preferred Pickup Date */}
                  <div className="form-group">
                    <label htmlFor="pickupDate" className="form-label">
                      Preferred Pickup Date <span className="text-danger">*</span>
                    </label>
                    <input
                      type="date"
                      id="pickupDate"
                      name="pickupDate"
                      value={formData.pickupDate}
                      onChange={handleChange}
                      className={`form-input ${errors.pickupDate ? 'input-error' : ''}`}
                    />
                    {errors.pickupDate ? (
                      <span className="field-error">
                        <span className="material-symbols-outlined text-xs">error</span>
                        {errors.pickupDate}
                      </span>
                    ) : (
                      <span className="form-hint">Choose today or a future date.</span>
                    )}
                  </div>

                  {/* Preferred Time Slot */}
                  <div className="form-group">
                    <label htmlFor="timeSlot" className="form-label">
                      Preferred Time <span className="text-danger">*</span>
                    </label>
                    <div className="select-wrapper">
                      <select
                        id="timeSlot"
                        name="timeSlot"
                        value={formData.timeSlot}
                        onChange={handleChange}
                        className={`form-select ${errors.timeSlot ? 'input-error' : ''}`}
                      >
                        <option value="">Select Time Slot...</option>
                        <option value="Morning (09:00 AM – 12:00 PM)">Morning (09:00 AM – 12:00 PM)</option>
                        <option value="Afternoon (12:00 PM – 04:00 PM)">Afternoon (12:00 PM – 04:00 PM)</option>
                        <option value="Evening (04:00 PM – 07:00 PM)">Evening (04:00 PM – 07:00 PM)</option>
                      </select>
                      <span className="material-symbols-outlined select-arrow">expand_more</span>
                    </div>
                    {errors.timeSlot ? (
                      <span className="field-error">
                        <span className="material-symbols-outlined text-xs">error</span>
                        {errors.timeSlot}
                      </span>
                    ) : (
                      <span className="form-hint">Select a convenient collection slot.</span>
                    )}
                  </div>
                </div>
              </div>

              {/* 5. Special Instructions & Declaration */}
              <div className="form-card">
                <div className="form-card-title-row">
                  <span className="material-symbols-outlined text-primary">chat_bubble_outline</span>
                  <h3 className="section-title">5. Special Instructions & Access Notes</h3>
                </div>

                <div className="form-group full-width">
                  <label htmlFor="notes" className="form-label">
                    Additional Message / Gate Pass Details (Optional)
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows="2"
                    placeholder="e.g. Ring bell twice, 2nd floor elevator access"
                    className="form-textarea"
                  />
                  <span className="form-hint">Special delivery notes for the collection driver.</span>
                </div>

                {/* Agreement Checkbox */}
                <div className="agreement-checkbox-row">
                  <input
                    type="checkbox"
                    id="agreement"
                    name="agreement"
                    checked={formData.agreement}
                    onChange={handleChange}
                    className="checkbox-input"
                  />
                  <label htmlFor="agreement" className="checkbox-label">
                    I declare that the equipment listed does not contain non-electronic hazardous bio-waste,
                    and I have detached sensitive credentials where feasible. <span className="text-danger">*</span>
                  </label>
                </div>
                {errors.agreement && (
                  <span className="field-error">
                    <span className="material-symbols-outlined text-xs">error</span>
                    {errors.agreement}
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="form-actions-row">
                <Button
                  type="submit"
                  variant="primary"
                  icon={isSubmitting ? "sync" : "send"}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting to Backend...' : 'Submit Pickup Request'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleReset}
                  icon="restart_alt"
                  disabled={isSubmitting}
                >
                  Reset Form
                </Button>
                <button
                  type="button"
                  onClick={handleFillSample}
                  className="btn btn-secondary btn-sm"
                  title="Demo helper: Auto-fills sample data for testing"
                  disabled={isSubmitting}
                >
                  <span className="material-symbols-outlined icon-inline text-primary">edit_note</span>
                  Demo Fill Sample
                </button>
              </div>
            </form>
          </div>

          {/* Right Sidebar Column */}
          <aside className="sidebar-column">
            {/* Guidelines Card */}
            <div className="sidebar-card">
              <div className="sidebar-card-header">
                <div className="sidebar-icon-box">
                  <span className="material-symbols-outlined">assignment_turned_in</span>
                </div>
                <h3 className="sidebar-heading">Pickup Guidelines</h3>
              </div>

              <div className="sidebar-free-pill">
                <span className="material-symbols-outlined icon-inline">verified</span>
                <span>100% Free Service for campus community</span>
              </div>

              {/* Prohibited Items */}
              <div className="sidebar-section">
                <h4 className="text-danger flex items-center gap-1 font-semibold text-sm">
                  <span className="material-symbols-outlined text-sm">do_not_disturb_on</span>
                  What We Do Not Accept
                </h4>
                <ul className="sidebar-list">
                  <li>Hazardous chemical or medical waste</li>
                  <li>Radioactive lab instrumentation</li>
                  <li>Leaking wet-cell car batteries</li>
                  <li>Contaminated bio-hazard components</li>
                </ul>
              </div>

              {/* Data Security */}
              <div className="sidebar-section">
                <h4 className="flex items-center gap-1 font-semibold text-sm text-dark">
                  <span className="material-symbols-outlined text-primary text-sm">shield</span>
                  Data Security Protocol
                </h4>
                <p className="text-xs text-muted leading-relaxed">
                  Please backup personal data, log out of cloud accounts, and perform a factory reset.
                  Hard drives undergo DoD 5220.22-M certified degaussing or mechanical shredding.
                </p>
              </div>
            </div>

            {/* Need Quick Help Card */}
            <div className="sidebar-card">
              <div className="sidebar-card-header">
                <div className="sidebar-icon-box">
                  <span className="material-symbols-outlined">support_agent</span>
                </div>
                <h3 className="sidebar-heading">Need Quick Help?</h3>
              </div>

              <div className="sidebar-contact-item">
                <span className="material-symbols-outlined text-primary">call</span>
                <div>
                  <span className="contact-label">Facility Helpline</span>
                  <a href="tel:+917620470242" className="contact-value">+91 7620470242</a>
                </div>
              </div>

              <div className="sidebar-contact-item">
                <span className="material-symbols-outlined text-primary">mail</span>
                <div>
                  <span className="contact-label">Email Dispatch</span>
                  <span className="contact-value text-sm font-normal">siddheshyeole44@gmail.com</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Modal Popup: Request Submitted Successfully (Shown after submission & refresh) */}
      {successModalData && (
        <div className="modal-overlay" onClick={() => setSuccessModalData(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-row">
                <span className="material-symbols-outlined" style={{ fontSize: '32px', color: '#16a34a' }}>check_circle</span>
                <div>
                  <h3 className="modal-title">Pickup Request Submitted!</h3>
                  <span className="text-xs text-muted">Successfully recorded in backend database</span>
                </div>
              </div>
              <button
                type="button"
                className="btn-close"
                onClick={() => setSuccessModalData(null)}
                aria-label="Close"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="modal-body">
              <div className="token-card" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                <div className="token-qr-placeholder" style={{ background: '#ffffff', borderColor: '#86efac' }}>
                  <span className="material-symbols-outlined qr-icon" style={{ color: '#16a34a' }}>local_shipping</span>
                </div>
                <div>
                  <span className="token-label" style={{ color: '#15803d' }}>Tracking Reference ID</span>
                  <div className="token-code font-mono" style={{ color: '#166534', fontSize: '1.35rem', fontWeight: 'bold' }}>
                    #REQ-{successModalData.id}
                  </div>
                  <p className="token-hint" style={{ color: '#15803d' }}>
                    Status: <strong>Pending Collection</strong> • Doorstep logistics dispatch assigned
                  </p>
                </div>
              </div>

              <div className="modal-details-grid">
                <div className="modal-detail-item">
                  <span className="detail-label">Requester</span>
                  <strong className="detail-value">{successModalData.name || 'Citizen'}</strong>
                  {successModalData.email && <span className="text-xs text-muted block">{successModalData.email}</span>}
                </div>

                <div className="modal-detail-item">
                  <span className="detail-label">Hardware Description</span>
                  <strong className="detail-value">{successModalData.item}</strong>
                  <span className="text-xs text-muted block">{successModalData.category} ({successModalData.quantity} Units)</span>
                </div>

                <div className="modal-detail-item">
                  <span className="detail-label">Scheduled Pickup Slot</span>
                  <strong className="detail-value">{successModalData.date}</strong>
                  <span className="text-xs text-muted block">{successModalData.timeSlot}</span>
                </div>

                <div className="modal-detail-item">
                  <span className="detail-label">Pickup Address</span>
                  <span className="detail-value text-sm">{successModalData.address}, {successModalData.city}</span>
                </div>
              </div>
            </div>

            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Button
                variant="secondary"
                onClick={() => setSuccessModalData(null)}
              >
                Book Another Pickup
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  setSuccessModalData(null);
                  onNavigate('my-requests');
                }}
                icon="inventory_2"
              >
                View in My Requests
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RequestPickup;
