-- SmartAttend Database Schema
-- Run this in MySQL to create all tables for the attendance system

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
  date DATE NOT NULL,
  check_in TIME,
  check_out TIME,
  status ENUM('present', 'absent', 'late', 'half_day') NOT NULL DEFAULT 'absent',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_date (user_id, date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- QR Codes table
CREATE TABLE IF NOT EXISTS qr_codes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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
INSERT IGNORE INTO users (id, name, email, password, role) VALUES
  (1, 'Admin User', 'admin@smartattend.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MqrqQzBZN0UfGNEKjN3XqQ6Rzv1eKqG', 'admin');

-- Seed demo employees (password: employee123)
INSERT IGNORE INTO users (id, name, email, password, role) VALUES
  (2, 'John Doe', 'john@smartattend.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MqrqQzBZN0UfGNEKjN3XqQ6Rzv1eKqG', 'employee'),
  (3, 'Jane Smith', 'jane@smartattend.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MqrqQzBZN0UfGNEKjN3XqQ6Rzv1eKqG', 'employee'),
  (4, 'Bob Johnson', 'bob@smartattend.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MqrqQzBZN0UfGNEKjN3XqQ6Rzv1eKqG', 'employee'),
  (5, 'Alice Brown', 'alice@smartattend.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MqrqQzBZN0UfGNEKjN3XqQ6Rzv1eKqG', 'employee'),
  (6, 'Charlie Davis', 'charlie@smartattend.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MqrqQzBZN0UfGNEKjN3XqQ6Rzv1eKqG', 'employee'),
  (7, 'Diana Evans', 'diana@smartattend.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MqrqQzBZN0UfGNEKjN3XqQ6Rzv1eKqG', 'employee'),
  (8, 'Eve Foster', 'eve@smartattend.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MqrqQzBZN0UfGNEKjN3XqQ6Rzv1eKqG', 'employee'),
  (9, 'Frank Green', 'frank@smartattend.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MqrqQzBZN0UfGNEKjN3XqQ6Rzv1eKqG', 'employee'),
  (10, 'Grace Hill', 'grace@smartattend.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MqrqQzBZN0UfGNEKjN3XqQ6Rzv1eKqG', 'employee'),
  (11, 'Henry Irving', 'henry@smartattend.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MqrqQzBZN0UfGNEKjN3XqQ6Rzv1eKqG', 'employee'),
  (12, 'Ivy Jones', 'ivy@smartattend.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MqrqQzBZN0UfGNEKjN3XqQ6Rzv1eKqG', 'employee');

-- Seed demo attendance data (last 30 days)
-- This creates realistic attendance patterns for demo purposes
SET @today = CURDATE();

-- Insert attendance for employees 2-12 for the last 30 days
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS SeedAttendance()
BEGIN
  DECLARE i INT DEFAULT 0;
  DECLARE emp_id INT;
  DECLARE att_date DATE;
  DECLARE att_status VARCHAR(20);
  DECLARE checkin_time TIME;
  
  WHILE i < 30 DO
    SET att_date = DATE_SUB(@today, INTERVAL i DAY);
    
    -- Skip weekends
    IF DAYOFWEEK(att_date) NOT IN (1, 7) THEN
      SET emp_id = 2;
      WHILE emp_id <= 12 DO
        -- Randomize attendance status (80% present, 10% late, 5% absent, 5% half_day)
        SET @rand = RAND();
        IF @rand < 0.80 THEN
          SET att_status = 'present';
          SET checkin_time = SEC_TO_TIME(28800 + FLOOR(RAND() * 1800)); -- 08:00 - 08:30
        ELSEIF @rand < 0.90 THEN
          SET att_status = 'late';
          SET checkin_time = SEC_TO_TIME(34200 + FLOOR(RAND() * 3600)); -- 09:30 - 10:30
        ELSEIF @rand < 0.95 THEN
          SET att_status = 'absent';
          SET checkin_time = NULL;
        ELSE
          SET att_status = 'half_day';
          SET checkin_time = SEC_TO_TIME(46800 + FLOOR(RAND() * 1800)); -- 13:00 - 13:30
        END IF;
        
        INSERT IGNORE INTO attendance (user_id, date, check_in, status) 
        VALUES (emp_id, att_date, checkin_time, att_status);
        
        SET emp_id = emp_id + 1;
      END WHILE;
    END IF;
    
    SET i = i + 1;
  END WHILE;
END //
DELIMITER ;

CALL SeedAttendance();
DROP PROCEDURE IF EXISTS SeedAttendance;

