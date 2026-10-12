// backend/app.js
// Main entry point for the E-Waste Collection & Recycling Management System backend

// 1. Load environment variables from .env file
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// 2. Import core packages and custom modules
const express = require('express');
const cors = require('cors');
const logger = require('./middleware/logger');
const pageRoutes = require('./routes/pages');
const requestRoutes = require('./routes/requestRoutes');
const authRoutes = require('./routes/authRoutes');
const db = require('./config/db');

// 3. Initialize the Express application
const app = express();
const PORT = process.env.PORT || 5000;

// 4. Configure CORS to allow requests from the React frontend across local development ports
app.use(cors({
  origin: [
    /^http:\/\/localhost(:\d+)?$/,
    /^http:\/\/127\.0\.0\.1(:\d+)?$/
  ]
}));

// 5. Built-in middleware for parsing incoming request bodies
// express.json() parses incoming requests with JSON payloads (e.g., from fetch or API tools)
app.use(express.json());

// express.urlencoded() parses URL-encoded bodies submitted from standard HTML forms
app.use(express.urlencoded({ extended: true }));

// 6. Custom logging middleware
// Intercepts every incoming HTTP request and logs timestamp, method, and URL
app.use(logger);

// 7. Static resources middleware
// Serves static assets (HTML, text, images, CSS) directly from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// 8. Mount REST API Routes
// Mount authentication routes under /api/auth
app.use('/api/auth', authRoutes);

// Mount collection requests CRUD routes under /api/requests
app.use('/api/requests', requestRoutes);

// Mount page/info routes under /
app.use('/', pageRoutes);

// 9. Custom 404 Not Found middleware
// Runs ONLY if no preceding route or static file matched the requested URL
app.use((req, res, next) => {
  res.status(404).json({
    error: "Route not found"
  });
});

// 10. Global Error-handling middleware
// Catches any unhandled errors thrown in route handlers and returns HTTP 500
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err.message);
  res.status(500).json({
    error: "Internal Server Error",
    message: err.message || "An unexpected error occurred on the server"
  });
});

// 11. Test MySQL Database Connection on server startup
async function testDbConnection() {
  try {
    const connection = await db.getConnection();
    console.log("MySQL database connected successfully");
    connection.release();
  } catch (err) {
    console.error("Database connection failed:", err.message);
  }
}

testDbConnection();

// 12. Start the HTTP server on Port 5000
app.listen(PORT, () => {
  console.log(`E-Waste backend server running on port ${PORT}`);
});
