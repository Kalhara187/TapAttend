-- SmartAttend Database Schema
-- Run this in MySQL to create the users table for JWT authentication

CREATE DATABASE IF NOT EXISTS smartattend
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE smartattend;

-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'employee') NOT NULL DEFAULT 'employee',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

