// backend/middleware/logger.js
// Custom logging middleware to track incoming HTTP requests

const logger = (req, res, next) => {
  // Format current timestamp as YYYY-MM-DD HH:MM:SS
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  const timestamp = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

  // Print timestamp, HTTP method (GET, POST, etc.) and requested URL
  console.log(`[${timestamp}] ${req.method} ${req.url}`);

  // CRITICAL: next() passes control to the next middleware function or route handler in the stack.
  // If next() is omitted, the request will hang indefinitely and the client will never receive a response.
  next();
};

module.exports = logger;
