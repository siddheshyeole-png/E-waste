// backend/controllers/requestController.js
// Controller: Handles collection request CRUD with strict role-based authorization

const requestModel = require('../models/requestModel');

// 1. GET ALL: Retrieve collection requests based on verified user identity
// - Admin: gets ALL requests in the database
// - Citizen: gets ONLY requests belonging to their user_id
const getAllRequests = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    let requests;
    if (user.role === 'admin') {
      requests = await requestModel.getAllRequests();
    } else {
      requests = await requestModel.getRequestsByUserId(user.id);
    }

    res.status(200).json(requests);
  } catch (error) {
    console.error('Error in getAllRequests:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// 2. GET BY ID: Retrieve a single collection request with ownership enforcement
const getRequestById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const request = await requestModel.getRequestById(id);

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    // Role check: Citizen can view ONLY their own request
    if (user.role !== 'admin' && String(request.user_id) !== String(user.id)) {
      return res.status(403).json({
        error: 'Access denied: you do not have permission to view this request.'
      });
    }

    res.status(200).json(request);
  } catch (error) {
    console.error('Error in getRequestById:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// 3. POST: Create a new collection request
// Security: Derives citizen identity (user_id, name, email) from verified JWT credentials
const createRequest = async (req, res) => {
  try {
    const user = req.user;
    const {
      phone,
      category,
      item_name,
      quantity,
      address,
      city,
      pickup_date,
      time_slot
    } = req.body;

    // Derived identity from authenticated JWT
    const user_name = user?.role === 'citizen' ? user.name : (req.body.user_name || user?.name);
    const email = user?.role === 'citizen' ? user.email : (req.body.email || user?.email);
    const user_id = user?.role === 'citizen' ? user.id : null;

    // Validate required fields
    if (
      !user_name ||
      !email ||
      !phone ||
      !category ||
      !item_name ||
      !address ||
      !city ||
      !pickup_date ||
      !time_slot
    ) {
      return res.status(400).json({
        error: 'All required fields must be provided.'
      });
    }

    // Validate phone number format (10 digits)
    const digitsOnly = String(phone).replace(/\D/g, '');
    if (digitsOnly.length !== 10) {
      return res.status(400).json({
        error: 'Mobile number must contain exactly 10 digits.'
      });
    }

    // Validate quantity is positive integer
    const parsedQuantity = Number(quantity);
    if (!parsedQuantity || parsedQuantity < 1) {
      return res.status(400).json({
        error: 'Quantity must be greater than 0.'
      });
    }

    // Insert request with authenticated owner user_id and initial Pending status
    const newRequest = await requestModel.createRequest({
      user_id,
      user_name,
      email,
      phone: String(phone).trim(),
      category: String(category).trim(),
      item_name: String(item_name).trim(),
      quantity: parsedQuantity,
      address: String(address).trim(),
      city: String(city).trim(),
      pickup_date,
      time_slot,
      status: 'Pending'
    });

    res.status(201).json(newRequest);
  } catch (error) {
    console.error('Error in createRequest:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// 4. PUT: Update an existing collection request
// - Admin: can update any fields and transition operational status (Approved, Scheduled, Recycled)
// - Citizen: can only cancel their own request if it is still Pending
const updateRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const existing = await requestModel.getRequestById(id);
    if (!existing) {
      return res.status(404).json({ error: 'Request not found' });
    }

    // Citizen authorization & business rules
    if (user.role !== 'admin') {
      // Must be owner
      if (String(existing.user_id) !== String(user.id)) {
        return res.status(403).json({
          error: 'Access denied: you do not have permission to modify this request.'
        });
      }

      // Citizen can only request cancellation
      const targetStatus = req.body.status;
      if (targetStatus && targetStatus.toLowerCase() !== 'cancelled') {
        return res.status(403).json({
          error: 'Citizens may only cancel requests. Status transitions are managed by administrators.'
        });
      }

      // Business rule: Can only cancel if current status is Pending
      if (existing.status.toLowerCase() !== 'pending') {
        return res.status(400).json({
          error: `Cannot cancel a request that is already ${existing.status}. Please contact support.`
        });
      }

      const updated = await requestModel.updateStatus(id, 'Cancelled');
      return res.status(200).json(updated);
    }

    // Administrator Update flow
    const updatedData = {
      user_name: req.body.user_name || existing.user_name,
      email: req.body.email || existing.email,
      phone: req.body.phone || existing.phone,
      category: req.body.category || existing.category,
      item_name: req.body.item_name || existing.item_name,
      quantity: req.body.quantity !== undefined ? Number(req.body.quantity) : existing.quantity,
      address: req.body.address || existing.address,
      city: req.body.city || existing.city,
      pickup_date: req.body.pickup_date || existing.pickup_date,
      time_slot: req.body.time_slot || existing.time_slot,
      status: req.body.status || existing.status
    };

    if (updatedData.quantity < 1) {
      return res.status(400).json({
        error: 'Quantity must be greater than 0'
      });
    }

    const updated = await requestModel.updateRequest(id, updatedData);
    res.status(200).json(updated);
  } catch (error) {
    console.error('Error in updateRequest:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// 5. DELETE: Remove a request (Administrator only)
const deleteRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    // Server-side role check
    if (user.role !== 'admin') {
      return res.status(403).json({
        error: 'Access forbidden: only administrators can delete pickup records.'
      });
    }

    const existing = await requestModel.getRequestById(id);
    if (!existing) {
      return res.status(404).json({ error: 'Request not found' });
    }

    await requestModel.deleteRequest(id);
    res.status(200).json({
      message: 'Request deleted successfully'
    });
  } catch (error) {
    console.error('Error in deleteRequest:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getAllRequests,
  getRequestById,
  createRequest,
  updateRequest,
  deleteRequest
};
