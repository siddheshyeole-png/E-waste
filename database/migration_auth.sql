-- ==========================================================
-- E-Waste Collection & Recycling Management System (EcoCycle)
-- Migration Script: migration_auth.sql
-- Step 2: Citizen & Admin Authentication Architecture
-- ==========================================================

USE e_waste_db;

-- 1. Create citizen user accounts table for Node.js / React authentication
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'citizen',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Add owner reference user_id to collection_requests if not already present
-- Preserves existing historical records by leaving user_id as NULL (Legacy records)
SET @dbname = DATABASE();
SET @tablename = "collection_requests";
SET @columnname = "user_id";
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  "SELECT 1",
  "ALTER TABLE collection_requests ADD COLUMN user_id INT NULL AFTER id"
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- 3. Add index on user_id for fast citizen queries
SET @indexname = "idx_collection_requests_user_id";
SET @preparedStatementIndex = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (index_name = @indexname)
  ) > 0,
  "SELECT 1",
  "CREATE INDEX idx_collection_requests_user_id ON collection_requests(user_id)"
));
PREPARE createIndexIfNotExists FROM @preparedStatementIndex;
EXECUTE createIndexIfNotExists;
DEALLOCATE PREPARE createIndexIfNotExists;
