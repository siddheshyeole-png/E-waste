// backend/controllers/authController.js
// Authentication Controller: Handles Citizen registration, Citizen/Admin login, and JWT generation

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

// Helper to generate signed JWT tokens
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  });
};

// 1. Citizen Registration
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // A. Input Presence Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        error: 'Full Name, Email, and Password are all required.'
      });
    }

    const trimmedName = String(name).trim();
    const trimmedEmail = String(email).toLowerCase().trim();

    // B. Security: Reject any attempt to self-assign administrator role
    if (role && role.toLowerCase() === 'admin') {
      return res.status(403).json({
        error: 'Public administrator registration is prohibited.'
      });
    }

    // C. Validation: Full Name format (letters and spaces only)
    if (!/^[A-Za-z\s]+$/.test(trimmedName)) {
      return res.status(400).json({
        error: 'Full Name must contain only letters and spaces.'
      });
    }

    // D. Validation: Email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return res.status(400).json({
        error: 'Please provide a valid email address.'
      });
    }

    // E. Validation: Password length
    if (String(password).length < 6) {
      return res.status(400).json({
        error: 'Password must be at least 6 characters long.'
      });
    }

    // F. Security: Disallow registering the configured admin email as a citizen
    const adminEmail = (process.env.ADMIN_EMAIL || '').toLowerCase().trim();
    if (adminEmail && trimmedEmail === adminEmail) {
      return res.status(400).json({
        error: 'An account with this email address already exists.'
      });
    }

    // G. Check for existing citizen email
    const existing = await userModel.findUserByEmail(trimmedEmail);
    if (existing) {
      return res.status(400).json({
        error: 'An account with this email address already exists.'
      });
    }

    // H. Hash password with bcrypt salt rounds = 10
    const hashedPassword = await bcrypt.hash(password, 10);

    // I. Insert citizen record
    const newUser = await userModel.createUser({
      name: trimmedName,
      email: trimmedEmail,
      password: hashedPassword,
      role: 'citizen'
    });

    // J. Generate JWT token
    const token = generateToken({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: 'citizen'
    });

    res.status(201).json({
      message: 'Citizen account registered successfully',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: 'citizen'
      }
    });
  } catch (err) {
    console.error('Registration error:', err.message);
    res.status(500).json({ error: 'Internal server error during registration' });
  }
};

// 2. Citizen / Administrator Login
const login = async (req, res) => {
  try {
    const { email, password, loginType } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required.'
      });
    }

    const trimmedEmail = String(email).toLowerCase().trim();
    const adminEmail = (process.env.ADMIN_EMAIL || '').toLowerCase().trim();
    const adminPassword = process.env.ADMIN_PASSWORD || '';

    // A. Check Administrator Authentication (Environment-variable configured)
    if (adminEmail && trimmedEmail === adminEmail) {
      // Validate administrator password
      if (password === adminPassword) {
        const token = generateToken({
          id: 'admin',
          name: 'System Administrator',
          email: adminEmail,
          role: 'admin'
        });

        return res.status(200).json({
          message: 'Administrator authentication successful',
          token,
          user: {
            id: 'admin',
            name: 'System Administrator',
            email: adminEmail,
            role: 'admin'
          }
        });
      } else {
        // Generic error message: do not disclose whether email or password was wrong
        return res.status(401).json({
          error: 'Invalid email or password.'
        });
      }
    }

    // If login was explicitly flagged as Admin Portal but email is not admin
    if (loginType === 'admin') {
      return res.status(401).json({
        error: 'Invalid email or password.'
      });
    }

    // B. Check Citizen Authentication (Database users table)
    const citizen = await userModel.findUserByEmail(trimmedEmail);

    if (!citizen) {
      return res.status(401).json({
        error: 'Invalid email or password.'
      });
    }

    // Compare supplied password with stored bcrypt hash
    const isPasswordMatch = await bcrypt.compare(password, citizen.password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        error: 'Invalid email or password.'
      });
    }

    // Generate authenticated citizen token
    const token = generateToken({
      id: citizen.id,
      name: citizen.name,
      email: citizen.email,
      role: citizen.role || 'citizen'
    });

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: citizen.id,
        name: citizen.name,
        email: citizen.email,
        role: citizen.role || 'citizen'
      }
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ error: 'Internal server error during login' });
  }
};

// 3. Current Authenticated User Info (GET /api/auth/me)
const getMe = (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  res.status(200).json({
    user: req.user
  });
};

module.exports = {
  register,
  login,
  getMe
};
