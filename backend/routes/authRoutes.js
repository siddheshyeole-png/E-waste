// backend/routes/authRoutes.js
// Express Router defining authentication endpoints

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');

// POST /api/auth/register - Citizen self-registration
router.post('/register', authController.register);

// POST /api/auth/login - Citizen / Administrator login
router.post('/login', authController.login);

// GET /api/auth/me - Validate current session token
router.get('/me', authenticate, authController.getMe);

module.exports = router;
