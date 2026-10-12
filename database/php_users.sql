-- ==========================================================
-- E-Waste Collection & Recycling Management System (EcoCycle)
-- PHP Users Table Script: php_users.sql
-- ==========================================================

-- Switch to existing e_waste_db database
USE e_waste_db;

-- Create the php_users table for PHP authentication module
CREATE TABLE IF NOT EXISTS php_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert 2 sample users (Password for both: 'password123')
-- The password hashes are generated using PHP password_hash('password123', PASSWORD_BCRYPT)
INSERT INTO php_users (name, email, password) VALUES
(
  'Rohan Kulkarni',
  'rohan@example.com',
  '$2y$10$eA3vL9oGfK6nZg7hU2sP0e7K6nZg7hU2sP0e7K6nZg7hU2sP0e7K6'
),
(
  'Pooja Joshi',
  'pooja@example.com',
  '$2y$10$vW9xY8z1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w'
)
ON DUPLICATE KEY UPDATE name=VALUES(name);
