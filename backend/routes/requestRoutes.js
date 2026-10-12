// backend/routes/requestRoutes.js
// Express Router defining REST endpoints for collection requests with authentication guards

const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');
const { authenticate, requireAdmin } = require('../middleware/authMiddleware');

// All request operations require a verified authentication credential
router.use(authenticate);

// GET /api/requests - Retrieve collection requests (Admin: all, Citizen: own)
router.get('/', requestController.getAllRequests);

// GET /api/requests/:id - Retrieve single request by ID (enforces ownership)
router.get('/:id', requestController.getRequestById);

// POST /api/requests - Create new collection request (derives citizen identity from token)
router.post('/', requestController.createRequest);

// PUT /api/requests/:id - Update request (Admin: all, Citizen: cancellation if Pending)
router.put('/:id', requestController.updateRequest);

// DELETE /api/requests/:id - Delete request (strictly admin only)
router.delete('/:id', requireAdmin, requestController.deleteRequest);

module.exports = router;
