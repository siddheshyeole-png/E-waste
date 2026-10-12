// backend/routes/pages.js
// Express Router to define application and informational API routes

const express = require('express');
const router = express.Router();

// Root route: Welcome message
router.get('/', (req, res) => {
  res.json({
    message: "Welcome to E-Waste Collection API"
  });
});

// About route: Basic project information
router.get('/api/about', (req, res) => {
  res.json({
    name: "EcoCycle",
    title: "E-Waste Collection & Recycling Management System",
    description: "EcoCycle connects citizens, collection centers, and recycling facilities to ensure responsible, verified disposal of electronic waste.",
    version: "1.0.0",
    academicProject: "Web Technologies Practical Project (Computer Engineering)",
    status: "Active - Backend Foundation Initialized"
  });
});

// Categories route: Standard e-waste categories list
router.get('/api/categories', (req, res) => {
  // Hardcoded categories list (will connect to database in future REST API stage)
  const categories = [
    "Mobile Phones",
    "Laptops",
    "Desktop Computers",
    "Monitors",
    "Televisions",
    "Printers",
    "Batteries",
    "Other Electronics"
  ];

  res.json(categories);
});

module.exports = router;
