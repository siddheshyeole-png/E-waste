-- ==========================================================
-- E-Waste Collection & Recycling Management System (EcoCycle)
-- Database Script: e_waste.sql
-- ==========================================================

-- 1. Create database if it does not already exist
CREATE DATABASE IF NOT EXISTS e_waste_db;

-- 2. Switch to / Select the database
USE e_waste_db;

-- 3. Create the collection_requests table
CREATE TABLE IF NOT EXISTS collection_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  phone VARCHAR(15) NOT NULL,
  category VARCHAR(50) NOT NULL,
  item_name VARCHAR(100) NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  address TEXT NOT NULL,
  city VARCHAR(50) NOT NULL,
  pickup_date DATE NOT NULL,
  time_slot VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Insert 3 realistic sample records with different statuses
INSERT INTO collection_requests (
  user_name, email, phone, category, item_name, quantity, address, city, pickup_date, time_slot, status
) VALUES
(
  'Rahul Patil',
  'rahul.patil@example.com',
  '9876543210',
  'Laptops',
  'Dell Inspiron 15',
  1,
  'Flat 402, Green Woods, Kothrud',
  'Pune',
  '2026-10-10',
  'Morning (9:00 AM - 12:00 PM)',
  'Pending'
),
(
  'Sneha Deshmukh',
  'sneha.d@example.com',
  '9822011223',
  'Mobile Phones',
  'Samsung Galaxy S9',
  2,
  'Row House 12, Baner Road',
  'Pune',
  '2026-10-12',
  'Afternoon (12:00 PM - 3:00 PM)',
  'Scheduled'
),
(
  'Amit Sharma',
  'amit.sharma@example.com',
  '9890123456',
  'Printers',
  'HP LaserJet 1020',
  1,
  'Office 301, Viman Nagar',
  'Pune',
  '2026-10-02',
  'Evening (3:00 PM - 6:00 PM)',
  'Recycled'
);
