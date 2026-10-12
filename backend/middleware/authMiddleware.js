// backend/middleware/authMiddleware.js
// Authentication & Role-Based Authorization Middleware using JSON Web Tokens (JWT)

const jwt = require('jsonwebtoken');

// 1. Authenticate Middleware: Verifies the JWT token from Authorization header
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Authentication required. Please log in to continue.'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Attach authenticated identity to req.user (id, name, email, role)
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      error: 'Invalid or expired authentication token. Please log in again.'
    });
  }
};

// 2. Role-Based Authorization Middleware: Restricts access to specific roles
const requireRole = (allowedRole) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required'
      });
    }

    if (req.user.role !== allowedRole) {
      return res.status(403).json({
        error: `Access forbidden: this action requires ${allowedRole} privileges.`
      });
    }

    next();
  };
};

// Helper shortcut for admin-only endpoints
const requireAdmin = requireRole('admin');

module.exports = {
  authenticate,
  requireRole,
  requireAdmin
};
