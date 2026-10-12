// backend/models/requestModel.js
// Database Model: Handles all direct SQL queries for collection requests
// Uses parameterized queries with '?' to protect against SQL Injection

const db = require('../config/db');

// 1. Retrieve all collection requests (Administrator access)
const getAllRequests = async () => {
  const [rows] = await db.execute(
    'SELECT * FROM collection_requests ORDER BY id DESC'
  );
  return rows;
};

// 2. Retrieve requests belonging to a specific citizen (Ownership filter)
const getRequestsByUserId = async (userId) => {
  const [rows] = await db.execute(
    'SELECT * FROM collection_requests WHERE user_id = ? ORDER BY id DESC',
    [userId]
  );
  return rows;
};

// 3. Retrieve a single collection request by primary key ID
const getRequestById = async (id) => {
  const [rows] = await db.execute(
    'SELECT * FROM collection_requests WHERE id = ?',
    [id]
  );
  return rows[0] || null;
};

// 4. Insert a new collection request bound to authenticated user_id
const createRequest = async (data) => {
  const {
    user_id,
    user_name,
    email,
    phone,
    category,
    item_name,
    quantity,
    address,
    city,
    pickup_date,
    time_slot,
    status
  } = data;

  const requestStatus = status || 'Pending';

  const [result] = await db.execute(
    `INSERT INTO collection_requests 
      (user_id, user_name, email, phone, category, item_name, quantity, address, city, pickup_date, time_slot, status) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      user_id || null,
      user_name,
      email,
      phone,
      category,
      item_name,
      quantity,
      address,
      city,
      pickup_date,
      time_slot,
      requestStatus
    ]
  );

  return getRequestById(result.insertId);
};

// 5. Update an existing collection request by ID
const updateRequest = async (id, data) => {
  const {
    user_name,
    email,
    phone,
    category,
    item_name,
    quantity,
    address,
    city,
    pickup_date,
    time_slot,
    status
  } = data;

  const [result] = await db.execute(
    `UPDATE collection_requests 
     SET user_name = ?, email = ?, phone = ?, category = ?, item_name = ?, quantity = ?, address = ?, city = ?, pickup_date = ?, time_slot = ?, status = ?
     WHERE id = ?`,
    [
      user_name,
      email,
      phone,
      category,
      item_name,
      quantity,
      address,
      city,
      pickup_date,
      time_slot,
      status,
      id
    ]
  );

  if (result.affectedRows === 0) {
    return null;
  }

  return getRequestById(id);
};

// 6. Update only status (Atomic status transition)
const updateStatus = async (id, newStatus) => {
  const [result] = await db.execute(
    'UPDATE collection_requests SET status = ? WHERE id = ?',
    [newStatus, id]
  );

  if (result.affectedRows === 0) {
    return null;
  }

  return getRequestById(id);
};

// 7. Delete a collection request by ID (Admin only)
const deleteRequest = async (id) => {
  const [result] = await db.execute(
    'DELETE FROM collection_requests WHERE id = ?',
    [id]
  );
  return result.affectedRows > 0;
};

module.exports = {
  getAllRequests,
  getRequestsByUserId,
  getRequestById,
  createRequest,
  updateRequest,
  updateStatus,
  deleteRequest
};
