import React from 'react';

// StatusBadge displays a color-coded indicator pill for request statuses
function StatusBadge({ status }) {
  // Normalize status name for CSS class (e.g. "Pending" -> "pending")
  const statusKey = (status || 'pending').toLowerCase();

  return (
    <span className={`status-badge status-${statusKey}`}>
      <span className="status-dot"></span>
      {status}
    </span>
  );
}

export default StatusBadge;
