import React, { useState } from 'react';
import StatusBadge from '../components/StatusBadge';
import Button from '../components/Button';

function Admin({ requests = [], onUpdateRequest, onDeleteRequest, onNavigate, currentUser }) {
  // Access control guard: verify admin privileges
  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="page-wrapper">
        <div className="section-container" style={{ maxWidth: '600px', margin: '4rem auto', textAlign: 'center' }}>
          <div className="form-card" style={{ padding: '3rem 2rem' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '36px' }}>admin_panel_settings</span>
            </div>
            <h2 style={{ fontSize: '1.75rem', marginBottom: '0.75rem', color: '#0f172a' }}>Administrator Access Required</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
              This portal is restricted to authorized campus and municipal e-waste recycling administrators.
              Citizens cannot view municipal operational data or change management statuses.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <Button variant="secondary" onClick={() => onNavigate('home')}>
                Return to Home
              </Button>
              <Button variant="primary" onClick={() => onNavigate('login')}>
                Sign In as Administrator
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal and toast state
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Helper function to trigger a temporary toast message
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Filter requests according to search query, category, and status
  // Uses Array.prototype.filter()
  const filteredRequests = requests.filter((req) => {
    // Search match across ID, requester name, item name, city, location
    const q = searchQuery.toLowerCase().trim();
    const requestId = String(req.id ?? '').toLowerCase();
    const citizenName = (req.name || req.citizen || '').toLowerCase();
    const itemName = (req.item || req.title || '').toLowerCase();
    const city = (req.city || '').toLowerCase();
    const location = (req.location || req.address || '').toLowerCase();
    const phone = (req.phone || '').toLowerCase();

    const matchesSearch =
      q === '' ||
      requestId.includes(q) ||
      citizenName.includes(q) ||
      itemName.includes(q) ||
      city.includes(q) ||
      location.includes(q) ||
      phone.includes(q);

    // Category match
    const matchesCategory =
      categoryFilter === 'ALL' ||
      (req.category && req.category.toLowerCase().includes(categoryFilter.toLowerCase()));

    // Status match
    const matchesStatus =
      statusFilter === 'ALL' ||
      req.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Action handlers calling the props passed from App.jsx
  const handleStatusChange = (id, newStatus) => {
    if (onUpdateRequest) {
      onUpdateRequest(id, newStatus);
      showToast(`Request #${id} updated to "${newStatus}"`);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm(`Are you sure you want to delete request #${id}?`)) {
      if (onDeleteRequest) {
        onDeleteRequest(id);
        showToast(`Request #${id} removed from audit records`);
      }
    }
  };

  // Dynamically calculate operational stats from the current shared requests array
  const totalCount = requests.length;
  const pendingCount = requests.filter((r) => r.status === 'Pending').length;
  const scheduledCount = requests.filter((r) => r.status === 'Scheduled').length;
  const completedCount = requests.filter((r) => r.status === 'Recycled' || r.status === 'Collected').length;

  return (
    <div className="page-wrapper admin-page">
      <div className="section-container">
        {/* Admin Top Header */}
        <div className="admin-header-row">
          <div>
            <div className="status-pill-subtle">
              <span className="pulse-dot"></span>
              Admin Console • Authenticated Session ({currentUser.email})
            </div>
            <h1 className="page-title">Central E-Waste Operations</h1>
            <p className="page-desc">
              Municipal & Regional Logistics Console — Department of Environmental Operations
            </p>
          </div>

          <div className="admin-header-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => showToast('Requests table refreshed')}
            >
              <span className="material-symbols-outlined icon-inline">refresh</span>
              Refresh
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => onNavigate('request-pickup')}
            >
              <span className="material-symbols-outlined icon-inline">add_circle</span>
              + New Intake
            </button>
          </div>
        </div>

        {/* Operational Stats Grid (Dynamic counts from requests array) */}
        <div className="admin-stats-grid">
          <div className="admin-stat-card">
            <div className="stat-card-top">
              <span className="stat-title">Total Pickups</span>
              <div className="stat-icon-wrapper bg-secondary-container text-primary">
                <span className="material-symbols-outlined">inbox</span>
              </div>
            </div>
            <div className="stat-number">{totalCount}</div>
            <div className="stat-footer">
              <span className="stat-trend text-primary">Live In-Memory</span>
              <span className="stat-meta">Active Records</span>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="stat-card-top">
              <span className="stat-title">Pending Review</span>
              <div className="stat-icon-wrapper bg-amber-100 text-amber-800">
                <span className="material-symbols-outlined">pending</span>
              </div>
            </div>
            <div className="stat-number text-amber-700">{pendingCount}</div>
            <div className="stat-footer">
              <span className="stat-trend text-amber-800">Needs Action</span>
              <span className="stat-meta">Gate pass queue</span>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="stat-card-top">
              <span className="stat-title">Scheduled Routes</span>
              <div className="stat-icon-wrapper bg-surface-container text-secondary">
                <span className="material-symbols-outlined">local_shipping</span>
              </div>
            </div>
            <div className="stat-number">{scheduledCount}</div>
            <div className="stat-footer">
              <span className="stat-trend text-secondary">Active Logistics</span>
              <span className="stat-meta">En-route</span>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="stat-card-top">
              <span className="stat-title">Processed & Recycled</span>
              <div className="stat-icon-wrapper bg-primary-fixed text-on-primary-fixed">
                <span className="material-symbols-outlined">recycling</span>
              </div>
            </div>
            <div className="stat-number text-primary">{completedCount}</div>
            <div className="stat-footer">
              <span className="stat-trend text-primary">Zero Landfill</span>
              <span className="stat-meta">Certified Safe</span>
            </div>
          </div>
        </div>

        {/* Toolbar: Search & Filters */}
        <div className="admin-toolbar-card">
          <div className="toolbar-search">
            <span className="material-symbols-outlined search-icon">search</span>
            <input
              type="text"
              placeholder="Filter by ID, citizen name, item, city, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="toolbar-filters">
            <div className="filter-select-group">
              <label htmlFor="catFilter" className="filter-label">Category:</label>
              <select
                id="catFilter"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="form-select select-compact"
              >
                <option value="ALL">All Categories</option>
                <option value="Computers">Computers & Laptops</option>
                <option value="Phones">Phones & Tablets</option>
                <option value="Batteries">Batteries & UPS</option>
                <option value="Monitors">Monitors & Displays</option>
                <option value="Printers">Printers & Scanners</option>
                <option value="Small Home">Small Home Appliances</option>
              </select>
            </div>

            <div className="filter-select-group">
              <label htmlFor="statFilter" className="filter-label">Status:</label>
              <select
                id="statFilter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="form-select select-compact"
              >
                <option value="ALL">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Collected">Collected</option>
                <option value="Recycled">Recycled</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <button
              type="button"
              className="btn btn-secondary btn-icon-only"
              onClick={() => {
                setSearchQuery('');
                setCategoryFilter('ALL');
                setStatusFilter('ALL');
              }}
              title="Reset Filters"
            >
              <span className="material-symbols-outlined">filter_alt_off</span>
            </button>
          </div>
        </div>

        {/* Main Intake Table */}
        <div className="admin-table-card">
          <div className="table-header-strip">
            <div className="flex items-center gap-2">
              <strong className="text-dark">Collection Intake Stream</strong>
              <span className="badge-tag">Showing {filteredRequests.length} records</span>
            </div>
            <div className="text-xs text-muted flex items-center gap-1 font-mono">
              <span className="pulse-dot"></span>
              Synchronized Shared State (App.jsx)
            </div>
          </div>

          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>Citizen / User</th>
                  <th>E-Waste Item & Qty</th>
                  <th>Scheduled Date</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {/* Conditional Rendering: Show message when no records match */}
                {filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-muted">
                      No collection requests match your filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map((req) => (
                    <tr key={req.id} className="admin-row">
                      <td className="font-mono font-bold text-primary">
                        #{req.id}
                      </td>
                      <td>
                        <strong className="block text-dark">{req.name || req.citizen || 'Campus User'}</strong>
                        <span className="text-xs text-muted">
                          {req.email || req.phone ? `${req.email || ''} ${req.phone ? '• ' + req.phone : ''}` : 'Contact logged'}
                        </span>
                      </td>
                      <td>
                        <span className="block font-medium text-dark">{req.item || req.title}</span>
                        <span className="text-xs text-muted">
                          {req.category} • {req.quantityDesc || `${req.quantity} Units`}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-1 text-sm text-dark">
                          <span className="material-symbols-outlined text-xs text-muted">calendar_today</span>
                          {req.date}
                        </div>
                      </td>
                      <td>
                        <StatusBadge status={req.status} />
                      </td>
                      <td className="text-right admin-actions-cell">
                        {/* View Details Button */}
                        <button
                          type="button"
                          className="table-action-icon-btn"
                          onClick={() => setSelectedRequest(req)}
                          title="View Details"
                        >
                          <span className="material-symbols-outlined">visibility</span>
                        </button>

                        {/* TASK 8: Conditional Rendering of Action Buttons based on status */}
                        {req.status === 'Pending' && (
                          <button
                            type="button"
                            className="btn-status-action btn-approve"
                            onClick={() => handleStatusChange(req.id, 'Approved')}
                            title="Approve this pickup request"
                          >
                            Approve
                          </button>
                        )}

                        {req.status === 'Approved' && (
                          <button
                            type="button"
                            className="btn-status-action btn-schedule"
                            onClick={() => handleStatusChange(req.id, 'Scheduled')}
                            title="Assign to logistics schedule"
                          >
                            Schedule
                          </button>
                        )}

                        {req.status === 'Scheduled' && (
                          <button
                            type="button"
                            className="btn-status-action btn-complete"
                            onClick={() => handleStatusChange(req.id, 'Recycled')}
                            title="Mark as completed & recycled"
                          >
                            Complete
                          </button>
                        )}

                        {/* Delete Action Button */}
                        <button
                          type="button"
                          className="table-action-icon-btn btn-delete"
                          onClick={() => handleDelete(req.id)}
                          title="Delete Request"
                        >
                          <span className="material-symbols-outlined">delete</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Operational Overview: Campus Hub Capacity & Material Recovery */}
        <div className="admin-two-cols-grid">
          {/* Left Column: Hub Capacity */}
          <div className="operational-card">
            <div className="card-header-row">
              <div>
                <h3 className="section-title">Collection Hub Capacity</h3>
                <p className="card-subheading">Real-time bin volume levels across campus facilities</p>
              </div>
              <span className="badge-tag">Sensor Mesh Active</span>
            </div>

            <div className="capacity-bars-list">
              {/* North Hub */}
              <div className="capacity-bar-item">
                <div className="capacity-label-row">
                  <span className="hub-name">North Academic Annex (Tech Hub)</span>
                  <span className="hub-pct text-amber-700 font-bold">78% Full</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill bg-amber" style={{ width: '78%' }}></div>
                </div>
                <div className="capacity-meta-row">
                  <span>Capacity: 800 kg</span>
                  <span>Current: 624 kg</span>
                </div>
              </div>

              {/* South Hub */}
              <div className="capacity-bar-item">
                <div className="capacity-label-row">
                  <span className="hub-name">South Engineering Workshops</span>
                  <span className="hub-pct text-primary font-bold">45% Full</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill bg-green" style={{ width: '45%' }}></div>
                </div>
                <div className="capacity-meta-row">
                  <span>Capacity: 1,200 kg</span>
                  <span>Current: 540 kg</span>
                </div>
              </div>

              {/* East Hub */}
              <div className="capacity-bar-item">
                <div className="capacity-label-row">
                  <span className="hub-name">East Residential Precinct</span>
                  <span className="hub-pct text-danger font-bold">90% Full • Critical</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill bg-red" style={{ width: '90%' }}></div>
                </div>
                <div className="capacity-meta-row">
                  <span>Capacity: 500 kg</span>
                  <span>Current: 450 kg (Urgent Dispatch)</span>
                </div>
              </div>
            </div>

            <div className="card-footer-strip">
              <span className="text-xs text-muted">Total Campus Storage: 2,500 kg max capacity</span>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => showToast('Priority collection van dispatched to East Precinct Hub')}
              >
                Dispatch Evacuation
              </button>
            </div>
          </div>

          {/* Right Column: Recycling Output Breakdown */}
          <div className="operational-card">
            <div className="card-header-row">
              <div>
                <h3 className="section-title">Recycling Output Breakdown</h3>
                <p className="card-subheading">Recovered raw elemental resources from processed intake</p>
              </div>
              <span className="badge-tag">ISO 14001 Audit</span>
            </div>

            {/* Segmented bar */}
            <div className="segmented-bar">
              <div className="segment bg-primary" style={{ width: '42%' }} title="Metals 42%"></div>
              <div className="segment bg-secondary-fixed" style={{ width: '35%' }} title="Plastics 35%"></div>
              <div className="segment bg-surface-variant" style={{ width: '15%' }} title="Circuit Glass 15%"></div>
              <div className="segment bg-amber" style={{ width: '8%' }} title="Hazardous Neutralized 8%"></div>
            </div>

            <div className="materials-grid">
              <div className="material-pill">
                <span className="material-indicator bg-primary"></span>
                <div>
                  <strong className="block text-base">42%</strong>
                  <span className="text-xs text-muted">Metals (Cu, Au, Al)</span>
                </div>
              </div>
              <div className="material-pill">
                <span className="material-indicator bg-secondary-fixed"></span>
                <div>
                  <strong className="block text-base">35%</strong>
                  <span className="text-xs text-muted">Thermoplastics</span>
                </div>
              </div>
              <div className="material-pill">
                <span className="material-indicator bg-surface-variant"></span>
                <div>
                  <strong className="block text-base">15%</strong>
                  <span className="text-xs text-muted">Circuit Glass / Si</span>
                </div>
              </div>
              <div className="material-pill">
                <span className="material-indicator bg-amber"></span>
                <div>
                  <strong className="block text-base">8%</strong>
                  <span className="text-xs text-muted">Neutralized Waste</span>
                </div>
              </div>
            </div>

            <div className="card-footer-strip">
              <span className="text-xs text-muted">Verified partners: 4 Smelters • 2 Polymer Refiners</span>
              <span className="text-xs text-primary font-semibold">Zero Landfill Policy</span>
            </div>
          </div>
        </div>
      </div>

      {/* Admin View Details Modal */}
      {selectedRequest && (
        <div className="modal-overlay" onClick={() => setSelectedRequest(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-row">
                <h3 className="modal-title">Admin Audit: #{selectedRequest.id}</h3>
                <StatusBadge status={selectedRequest.status} />
              </div>
              <button
                type="button"
                className="btn-close"
                onClick={() => setSelectedRequest(null)}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="modal-body">
              <div className="modal-details-grid">
                <div className="modal-detail-item">
                  <span className="detail-label">Citizen / Requester</span>
                  <strong className="detail-value">{selectedRequest.name || selectedRequest.citizen || 'Campus Requester'}</strong>
                  {selectedRequest.email && (
                    <span className="text-xs text-muted block">{selectedRequest.email}</span>
                  )}
                  {selectedRequest.phone && (
                    <span className="text-xs text-muted block">{selectedRequest.phone}</span>
                  )}
                </div>

                <div className="modal-detail-item">
                  <span className="detail-label">Hardware Description</span>
                  <strong className="detail-value">{selectedRequest.item || selectedRequest.title}</strong>
                  <span className="text-xs text-muted block">
                    Category: {selectedRequest.category} ({selectedRequest.quantityDesc || `${selectedRequest.quantity} Units`})
                  </span>
                </div>

                <div className="modal-detail-item full-width">
                  <span className="detail-label">Pickup Location</span>
                  <span className="detail-value text-sm">{selectedRequest.location || selectedRequest.address}</span>
                  {selectedRequest.city && <span className="text-xs text-muted block">City: {selectedRequest.city}</span>}
                </div>

                <div className="modal-detail-item">
                  <span className="detail-label">Scheduled Date</span>
                  <span className="detail-value text-sm">
                    {selectedRequest.date} • {selectedRequest.timeSlot}
                  </span>
                </div>

                <div className="modal-detail-item">
                  <span className="detail-label">Hardware Condition</span>
                  <span className="detail-value text-sm">
                    {selectedRequest.condition || 'Decommissioned'}
                  </span>
                </div>

                {selectedRequest.notes && (
                  <div className="modal-detail-item full-width">
                    <span className="detail-label">Access Notes</span>
                    <span className="detail-value text-xs text-muted">{selectedRequest.notes}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <Button
                variant="secondary"
                onClick={() => setSelectedRequest(null)}
              >
                Dismiss
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  showToast(`Gate pass token dispatched for #${selectedRequest.id}`);
                  setSelectedRequest(null);
                }}
              >
                Issue Digital Gate Pass
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="toast-notification">
          <span className="material-symbols-outlined text-primary">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

export default Admin;
