// backend/models/userModel.js
// Database Model: Handles user account queries using parameterized prepared statements

const db = require('../config/db');

// 1. Create a new citizen user
const createUser = async ({ name, email, password, role = 'citizen' }) => {
  const [result] = await db.execute(
    'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
    [name, email, password, role]
  );

  return findUserById(result.insertId);
};

// 2. Find user by email (used for login and duplicate check)
const findUserByEmail = async (email) => {
  const [rows] = await db.execute(
    'SELECT * FROM users WHERE email = ?',
    [email]
  );
  return rows[0] || null;
};

// 3. Find user by ID (excludes password hash for safety)
const findUserById = async (id) => {
  const [rows] = await db.execute(
    'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
    [id]
  );
  return rows[0] || null;
};

module.exports = {
  createUser,
  findUserByEmail,
  findUserById
};
