-- SmartAttend Database Schema
-- Run this in MySQL to create all tables for the attendance system

CREATE DATABASE IF NOT EXISTS smartattend
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE smartattend;

-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  employee_id VARCHAR(50),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  department VARCHAR(150) NOT NULL DEFAULT 'Operations',
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'employee') NOT NULL DEFAULT 'employee',
  account_status ENUM('Active', 'Inactive', 'On Leave') NOT NULL DEFAULT 'Active',
  qr_token VARCHAR(255) UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Departments table
CREATE TABLE IF NOT EXISTS departments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Attendance table
CREATE TABLE IF NOT EXISTS attendance (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  employee_id VARCHAR(50) NOT NULL,
  date DATE NOT NULL,
  attendance_date DATE NOT NULL,
  check_in TIME,
  check_in_time TIME,
  check_out TIME,
  check_out_time TIME,
  status ENUM('present', 'absent', 'late', 'half_day') NOT NULL DEFAULT 'absent',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_date (user_id, date),
  UNIQUE KEY unique_employee_date (employee_id, attendance_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- QR Codes table
CREATE TABLE IF NOT EXISTS qr_codes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id VARCHAR(50) NOT NULL,
  employee_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  department VARCHAR(150) NOT NULL,
  location VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  attendance_type ENUM('Check-In', 'Check-Out') NOT NULL DEFAULT 'Check-In',
  code VARCHAR(255) NOT NULL UNIQUE,
  qr_data LONGTEXT NOT NULL,
  status ENUM('active', 'expired', 'revoked') NOT NULL DEFAULT 'active',
  generated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME NOT NULL,
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_qr_employee ON qr_codes (employee_id, attendance_type, status, expires_at);

-- Leaves table
CREATE TABLE IF NOT EXISTS leaves (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT,
  status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed demo departments
INSERT IGNORE INTO departments (name) VALUES
  ('Engineering'),
  ('Marketing'),
  ('Sales'),
  ('Human Resources'),
  ('Finance'),
  ('Operations');

-- Seed demo admin user (password: admin123)
INSERT IGNORE INTO users (id, username, name, email, password, role) VALUES
  (1, 'admin', 'Admin User', 'admin@smartattend.com', '$2b$10$CsroTq5qW3v2IE1jZDyAgOelDhIikOlbsyzFTg69585wl.zx5w28y', 'admin');

