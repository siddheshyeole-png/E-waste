import React, { useState } from 'react';
import StatusBadge from '../components/StatusBadge';
import Button from '../components/Button';

function MyRequests({ requests = [], onNavigate, onCancelRequest, currentUser }) {
  // Filter and search states
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showEmptyDemo, setShowEmptyDemo] = useState(false);

  // TASK 4 & TASK 5: Filter requests by status and multi-field search (Request ID, Item, Category, City)
  // Uses Array.prototype.filter() with simple conditions
  const filteredRequests = requests.filter((req) => {
    // If the demo empty button is toggled, intentionally simulate an empty list
    if (showEmptyDemo) return false;

    // Task 5: Status Filter Match (handles All, Pending, Approved, Scheduled, Collected, Recycled, Cancelled)
    const matchesStatus =
      activeFilter === 'all' ||
      req.status.toLowerCase() === activeFilter.toLowerCase();

    // Task 4: Search Match (by Request ID, E-Waste Item, Category, City)
    const q = searchQuery.toLowerCase().trim();
    const requestId = String(req.id ?? '').toLowerCase();
    const itemName = (req.item || req.title || '').toLowerCase();
    const category = (req.category || '').toLowerCase();
    const city = (req.city || '').toLowerCase();
    const location = (req.location || req.address || '').toLowerCase();

    const matchesSearch =
      q === '' ||
      requestId.includes(q) ||
      itemName.includes(q) ||
      category.includes(q) ||
      city.includes(q) ||
      location.includes(q);

    return matchesStatus && matchesSearch;
  });

  // TASK 3: Using Array.prototype.find() to locate any active scheduled pickup for live tracking
  const activeScheduledRequest = requests.find((r) => r.status === 'Scheduled');

  // Helper using Array.prototype.filter() to count requests for status badge pills
  const getStatusCount = (statusName) => {
    return requests.filter(
      (r) => r.status.toLowerCase() === statusName.toLowerCase()
    ).length;
  };

  return (
    <div className="page-wrapper my-requests-page">
      <div className="section-container">
        {/* Header Section */}
        <div className="page-header-row">
          <div>
            <div className="status-pill-subtle">
              <span className="pulse-dot"></span>
              Citizen Portal • <span className="font-mono">{currentUser?.name ? `${currentUser.name} (${currentUser.email})` : 'Authenticated Session'}</span>
            </div>
            <h1 className="page-title">My Pickup Requests</h1>
            <p className="page-desc">
              Track real-time status, logistics personnel, and chain-of-custody verification for your
              institutional electronic waste recycling requests.
            </p>
          </div>

          <div className="header-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowEmptyDemo(!showEmptyDemo)}
            >
              <span className="material-symbols-outlined icon-inline">visibility</span>
              {showEmptyDemo ? 'Show Requests' : 'Demo Empty State'}
            </button>

            <Button
              variant="primary"
              onClick={() => onNavigate('request-pickup')}
              icon="add_circle"
            >
              New Pickup Request
            </Button>
          </div>
        </div>

        {/* Telemetry Bento Stats */}
        <div className="telemetry-grid">
          <div className="telemetry-card">
            <div className="telemetry-icon-box bg-surface-container text-primary">
              <span className="material-symbols-outlined">inventory_2</span>
            </div>
            <div>
              <span className="telemetry-label">Total Submissions</span>
              <div className="telemetry-val-row">
                <span className="telemetry-val">{requests.length}</span>
                <span className="telemetry-sub text-primary">100% campus audited</span>
              </div>
            </div>
          </div>

          <div className="telemetry-card">
            <div className="telemetry-icon-box bg-secondary-container text-primary">
              <span className="material-symbols-outlined">local_shipping</span>
            </div>
            <div>
              <span className="telemetry-label">Active In-Transit</span>
              <div className="telemetry-val-row">
                <span className="telemetry-val">
                  {getStatusCount('scheduled') + getStatusCount('approved')}
                </span>
                <span className="telemetry-sub text-secondary">Scheduled / Picked</span>
              </div>
            </div>
          </div>

          <div className="telemetry-card">
            <div className="telemetry-icon-box bg-tertiary-fixed text-on-tertiary-fixed">
              <span className="material-symbols-outlined">recycling</span>
            </div>
            <div>
              <span className="telemetry-label">Processed & Diverted</span>
              <div className="telemetry-val-row">
                <span className="telemetry-val">148 kg</span>
                <span className="telemetry-sub text-primary">Safe destruction</span>
              </div>
            </div>
          </div>

          <div className="telemetry-card">
            <div className="telemetry-icon-box bg-surface-variant text-primary">
              <span className="material-symbols-outlined">verified</span>
            </div>
            <div>
              <span className="telemetry-label">Certificates Issued</span>
              <div className="telemetry-val-row">
                <span className="telemetry-val">{getStatusCount('recycled') || 1}</span>
                <span className="telemetry-sub font-mono">ISO 14001</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="filter-controls-card">
          <div className="search-bar-row">
            <div className="search-input-wrapper">
              <span className="material-symbols-outlined search-icon">search</span>
              <input
                type="text"
                placeholder="Search by Request ID, Item Name, Category, or City..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)} // Updates immediately on keystroke
                className="search-input"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="clear-search-btn"
                  onClick={() => setSearchQuery('')}
                  title="Clear Search"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              )}
            </div>
          </div>

          {/* Filter Pills for All, Pending, Approved, Scheduled, Collected, Recycled, Cancelled */}
          <div className="filter-pills-row">
            {[
              { key: 'all', label: 'All Requests', count: requests.length },
              { key: 'Pending', label: 'Pending', count: getStatusCount('Pending') },
              { key: 'Approved', label: 'Approved', count: getStatusCount('Approved') },
              { key: 'Scheduled', label: 'Scheduled', count: getStatusCount('Scheduled') },
              { key: 'Collected', label: 'Collected', count: getStatusCount('Collected') },
              { key: 'Recycled', label: 'Recycled', count: getStatusCount('Recycled') },
              { key: 'Cancelled', label: 'Cancelled', count: getStatusCount('Cancelled') }
            ].map((pill) => (
              <button
                key={pill.key}
                type="button"
                className={`filter-pill ${activeFilter.toLowerCase() === pill.key.toLowerCase() ? 'active' : ''}`}
                onClick={() => {
                  setActiveFilter(pill.key);
                  setShowEmptyDemo(false);
                }}
              >
                {pill.label} <span className="pill-count">({pill.count})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Conditional Rendering: Empty State vs Data Views */}
        {filteredRequests.length === 0 ? (
          <div className="empty-state-card">
            <div className="empty-state-icon">
              <span className="material-symbols-outlined">inbox</span>
            </div>
            <h3 className="empty-state-title">No pickup requests found</h3>
            <p className="empty-state-desc">
              No e-waste collection requests match your search criteria or selected status filter.
            </p>
            <div className="empty-state-actions">
              <Button
                variant="secondary"
                onClick={() => {
                  setActiveFilter('all');
                  setSearchQuery('');
                  setShowEmptyDemo(false);
                }}
              >
                Reset Filters
              </Button>
              <Button
                variant="primary"
                onClick={() => onNavigate('request-pickup')}
                icon="add_circle"
              >
                Schedule a Pickup
              </Button>
            </div>
          </div>
        ) : (
          <div className="requests-data-container">
            {/* Desktop Table View (Rendered with Array.prototype.map) */}
            <div className="desktop-table-card">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Request ID</th>
                    <th>E-Waste Item & Category</th>
                    <th>Pickup Date & Slot</th>
                    <th>Pickup Address / City</th>
                    <th>Status</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map((req) => (
                    <tr key={req.id} className="request-table-row">
                      <td className="font-mono font-bold text-primary">
                        #{req.id}
                      </td>
                      <td>
                        <strong className="block text-dark">{req.item || req.title}</strong>
                        <span className="text-xs text-muted">
                          {req.category} • {req.quantityDesc || `${req.quantity} Units`}
                        </span>
                      </td>
                      <td>
                        <span className="block font-medium text-dark">{req.date}</span>
                        <span className="text-xs text-muted">{req.timeSlot}</span>
                      </td>
                      <td className="max-w-xs">
                        <span className="block text-sm text-dark truncate" title={req.location || req.address}>
                          {req.location || req.address}
                        </span>
                        {req.city && <span className="text-xs text-muted font-semibold">{req.city}</span>}
                      </td>
                      <td>
                        <StatusBadge status={req.status} />
                      </td>
                      <td className="text-right actions-cell">
                        <button
                          type="button"
                          className="table-action-btn view-btn"
                          onClick={() => setSelectedRequest(req)}
                        >
                          <span className="material-symbols-outlined icon-inline">visibility</span>
                          View
                        </button>
                        {req.status === 'Pending' && onCancelRequest && (
                          <button
                            type="button"
                            className="table-action-btn cancel-btn"
                            onClick={() => onCancelRequest(req.id)}
                            title="Cancel Request"
                          >
                            <span className="material-symbols-outlined icon-inline">cancel</span>
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="mobile-cards-list">
              {filteredRequests.map((req) => (
                <div key={req.id} className="request-card">
                  <div className="request-card-header">
                    <span className="font-mono font-bold text-primary">#{req.id}</span>
                    <StatusBadge status={req.status} />
                  </div>
                  <h4 className="request-card-title">{req.item || req.title}</h4>
                  <p className="request-card-sub">
                    {req.category} • {req.quantityDesc || `${req.quantity} Units`}
                  </p>
                  <div className="request-card-details">
                    <div className="detail-item">
                      <span className="material-symbols-outlined">schedule</span>
                      <span>{req.date} ({req.timeSlot})</span>
                    </div>
                    <div className="detail-item">
                      <span className="material-symbols-outlined">location_on</span>
                      <span className="truncate">{req.location || req.address}</span>
                    </div>
                    {req.city && (
                      <div className="detail-item">
                        <span className="material-symbols-outlined">location_city</span>
                        <span>City: {req.city}</span>
                      </div>
                    )}
                  </div>
                  <div className="request-card-footer" style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      style={{ flex: 1 }}
                      onClick={() => setSelectedRequest(req)}
                    >
                      View Details →
                    </button>
                    {req.status === 'Pending' && onCancelRequest && (
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        style={{ color: '#dc2626', borderColor: '#fca5a5' }}
                        onClick={() => onCancelRequest(req.id)}
                        title="Cancel Pending Request"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Live Scheduled Request Tracking (Demonstrating Array.prototype.find) */}
            {activeScheduledRequest && (
              <div className="tracking-preview-card">
                <div className="tracking-header">
                  <div>
                    <div className="tracking-tag">
                      <span className="pulse-dot"></span>
                      <span>Active Dispatch View</span>
                    </div>
                    <h3 className="tracking-title">
                      Live Tracking: #{activeScheduledRequest.id} • {activeScheduledRequest.item || activeScheduledRequest.title}
                    </h3>
                    <p className="tracking-subtitle">
                      Slot: {activeScheduledRequest.timeSlot} • Destination: {activeScheduledRequest.location || activeScheduledRequest.city}
                    </p>
                  </div>

                  <div className="assigned-driver-box">
                    <div className="text-right">
                      <strong className="block text-sm">GreenLogistics Team 4</strong>
                      <span className="font-mono text-xs text-muted">Van #KA-05-9921 • Marcus Vance</span>
                    </div>
                    <div className="van-icon-box">
                      <span className="material-symbols-outlined">local_shipping</span>
                    </div>
                  </div>
                </div>

                {/* 5-Step Visual Progress Stepper */}
                <div className="tracking-stepper">
                  <div className="stepper-line-bg"></div>
                  <div className="stepper-line-progress" style={{ width: '50%' }}></div>

                  <div className="stepper-nodes">
                    <div className="step-node completed">
                      <div className="node-circle">
                        <span className="material-symbols-outlined">done</span>
                      </div>
                      <span className="node-title">1. Submitted</span>
                      <span className="node-time">Done</span>
                    </div>

                    <div className="step-node completed">
                      <div className="node-circle">
                        <span className="material-symbols-outlined">done</span>
                      </div>
                      <span className="node-title">2. Approved</span>
                      <span className="node-time">Done</span>
                    </div>

                    <div className="step-node active">
                      <div className="node-circle pulse">
                        <span className="material-symbols-outlined">local_shipping</span>
                      </div>
                      <span className="node-title text-primary font-bold">3. Scheduled</span>
                      <span className="node-time text-primary">In-Transit</span>
                    </div>

                    <div className="step-node upcoming">
                      <div className="node-circle">
                        <span className="material-symbols-outlined">warehouse</span>
                      </div>
                      <span className="node-title">4. Collected</span>
                      <span className="node-time">Pending</span>
                    </div>

                    <div className="step-node upcoming">
                      <div className="node-circle">
                        <span className="material-symbols-outlined">recycling</span>
                      </div>
                      <span className="node-title">5. Recycled</span>
                      <span className="node-time">Pending</span>
                    </div>
                  </div>
                </div>

                {/* Telemetry Strip */}
                <div className="driver-telemetry-strip">
                  <div className="telemetry-info">
                    <span className="pulse-dot"></span>
                    <p className="text-sm">
                      <strong>Driver En Route:</strong> Van #KA-05-9921 is approaching collection zone in {activeScheduledRequest.city || 'Campus Area'}.
                    </p>
                  </div>
                  <div className="telemetry-actions">
                    <a href="tel:+917620470242" className="btn btn-secondary btn-sm">
                      <span className="material-symbols-outlined icon-inline">call</span>
                      Call Dispatcher
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal Dialog: Request Details */}
      {selectedRequest && (
        <div className="modal-overlay" onClick={() => setSelectedRequest(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-row">
                <h3 className="modal-title">#{selectedRequest.id}</h3>
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
              {/* Gate Pass Token Box */}
              <div className="token-card">
                <div className="token-qr-placeholder">
                  <span className="material-symbols-outlined qr-icon">qr_code_2</span>
                </div>
                <div>
                  <span className="token-label">Gate Clearance Token</span>
                  <div className="token-code font-mono">ECO-PASS-{selectedRequest.id}</div>
                  <p className="token-hint">Present this QR code to the driver upon van arrival.</p>
                </div>
              </div>

              {/* Request Info Fields */}
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
                    {selectedRequest.category} ({selectedRequest.quantityDesc || `${selectedRequest.quantity} Units`})
                  </span>
                </div>

                <div className="modal-detail-item full-width">
                  <span className="detail-label">Pickup Location</span>
                  <span className="detail-value text-sm">{selectedRequest.location || selectedRequest.address}</span>
                  {selectedRequest.city && <span className="text-xs text-muted block">City: {selectedRequest.city}</span>}
                </div>

                <div className="modal-detail-item">
                  <span className="detail-label">Assigned Date & Slot</span>
                  <span className="detail-value text-sm">
                    {selectedRequest.date} • {selectedRequest.timeSlot}
                  </span>
                </div>

                <div className="modal-detail-item">
                  <span className="detail-label">Condition Protocol</span>
                  <span className="detail-value text-sm">
                    {selectedRequest.condition || 'Decommissioned'}
                  </span>
                </div>
              </div>
            </div>

            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {selectedRequest.status === 'Pending' && onCancelRequest ? (
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ color: '#dc2626', borderColor: '#fca5a5' }}
                  onClick={() => {
                    onCancelRequest(selectedRequest.id);
                    setSelectedRequest(null);
                  }}
                >
                  <span className="material-symbols-outlined icon-inline">cancel</span>
                  Cancel Request
                </button>
              ) : (
                <span className="text-xs text-muted">
                  {selectedRequest.status === 'Cancelled'
                    ? 'Request has been cancelled'
                    : 'Cancellation locked once scheduled/processed'}
                </span>
              )}
              <Button
                variant="secondary"
                onClick={() => setSelectedRequest(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyRequests;
