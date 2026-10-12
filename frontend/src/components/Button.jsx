import React from 'react';

// Reusable Button Component with customizable variant and icon
function Button({
  children,
  variant = 'primary',
  onClick,
  type = 'button',
  icon,
  disabled = false,
  className = ''
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`btn btn-${variant} ${className}`}
    >
      {icon && <span className="material-symbols-outlined btn-icon">{icon}</span>}
      {children}
    </button>
  );
}

export default Button;
