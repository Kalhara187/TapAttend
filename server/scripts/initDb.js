import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const ADMIN_HASH = '$2a$10$N9qo8uLOickgx2ZMRZoMy.MqrqQzBZN0UfGNEKjN3XqQ6Rzv1eKqG';
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'smartattend';

async function columnExists(connection, tableName, columnName) {
  const [rows] = await connection.query(
    `SELECT COUNT(*) AS count
     FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [DB_NAME, tableName, columnName]
  );

  return rows[0].count > 0;
}

async function indexExists(connection, tableName, indexName) {
  const [rows] = await connection.query(
    `SELECT COUNT(*) AS count
     FROM INFORMATION_SCHEMA.STATISTICS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND INDEX_NAME = ?`,
    [DB_NAME, tableName, indexName]
  );

  return rows[0].count > 0;
}

async function main() {
  const root = await mysql.createConnection({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
  });

  await root.query(
    'CREATE DATABASE IF NOT EXISTS smartattend CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci'
  );
  await root.end();

  const db = await mysql.createConnection({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
  });

  await db.query(
    "CREATE TABLE IF NOT EXISTS users (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255) NOT NULL, email VARCHAR(255) NOT NULL UNIQUE, password VARCHAR(255) NOT NULL, role ENUM('admin','employee') NOT NULL DEFAULT 'employee', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"
  );

  await db.query(
    'CREATE TABLE IF NOT EXISTS departments (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(100) NOT NULL UNIQUE, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4'
  );

  await db.query(
    "CREATE TABLE IF NOT EXISTS attendance (id INT AUTO_INCREMENT PRIMARY KEY, user_id INT NOT NULL, date DATE NOT NULL, check_in TIME, check_out TIME, status ENUM('present','absent','late','half_day') NOT NULL DEFAULT 'absent', notes TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE, UNIQUE KEY unique_user_date (user_id, date)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"
  );

  const attendanceColumns = [
    'employee_id VARCHAR(50) NULL AFTER user_id',
    'attendance_date DATE NULL AFTER date',
    'check_in_time TIME NULL AFTER check_in',
    'check_out_time TIME NULL AFTER check_out',
  ];

  for (const definition of attendanceColumns) {
    const [columnName] = definition.split(' ');
    if (!(await columnExists(db, 'attendance', columnName))) {
      await db.query(`ALTER TABLE attendance ADD COLUMN ${definition}`);
    }
  }

  if (!(await indexExists(db, 'attendance', 'unique_employee_date'))) {
    await db.query(
      'ALTER TABLE attendance ADD UNIQUE KEY unique_employee_date (employee_id, attendance_date)'
    );
  }

  await db.query(
    'CREATE TABLE IF NOT EXISTS qr_codes (id INT AUTO_INCREMENT PRIMARY KEY, code VARCHAR(255) NOT NULL UNIQUE, expires_at TIMESTAMP NOT NULL, created_by INT NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4'
  );

  const qrColumns = [
    'employee_id VARCHAR(50) NULL AFTER id',
    'employee_name VARCHAR(255) NULL AFTER employee_id',
    'email VARCHAR(255) NULL AFTER employee_name',
    'department VARCHAR(150) NULL AFTER email',
    'location VARCHAR(255) NULL AFTER department',
    'role VARCHAR(50) NULL AFTER location',
    "attendance_type ENUM('Check-In','Check-Out') NOT NULL DEFAULT 'Check-In' AFTER role",
    'generated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER attendance_type',
    'qr_data LONGTEXT NULL AFTER generated_at',
    "status ENUM('active','expired','revoked') NOT NULL DEFAULT 'active' AFTER qr_data",
    'expires_at DATETIME NULL AFTER status',
    'created_by INT NULL AFTER expires_at',
  ];

  for (const definition of qrColumns) {
    const [columnName] = definition.split(' ');
    if (!(await columnExists(db, 'qr_codes', columnName))) {
      await db.query(`ALTER TABLE qr_codes ADD COLUMN ${definition}`);
    }
  }

  await db.query('ALTER TABLE qr_codes MODIFY COLUMN code VARCHAR(255) NOT NULL');

  if (!(await indexExists(db, 'qr_codes', 'idx_qr_employee'))) {
    await db.query(
      'CREATE INDEX idx_qr_employee ON qr_codes (employee_id, attendance_type, status, expires_at)'
    );
  }

  await db.query(
    "CREATE TABLE IF NOT EXISTS leaves (id INT AUTO_INCREMENT PRIMARY KEY, user_id INT NOT NULL, start_date DATE NOT NULL, end_date DATE NOT NULL, reason TEXT, status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"
  );

  await db.query(
    "INSERT IGNORE INTO departments (name) VALUES ('Engineering'), ('Marketing'), ('Sales'), ('Human Resources'), ('Finance'), ('Operations')"
  );

  await db.query(
    'INSERT IGNORE INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)',
    [1, 'Admin User', 'admin@smartattend.com', ADMIN_HASH, 'admin']
  );

  const employees = [
    [2, 'John Doe', 'john@smartattend.com'],
    [3, 'Jane Smith', 'jane@smartattend.com'],
    [4, 'Bob Johnson', 'bob@smartattend.com'],
    [5, 'Alice Brown', 'alice@smartattend.com'],
  ];

  for (const [id, name, email] of employees) {
    await db.query(
      'INSERT IGNORE INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)',
      [id, name, email, ADMIN_HASH, 'employee']
    );
  }

  const [employeeRows] = await db.query(
    "SELECT id FROM users WHERE role = 'employee' ORDER BY id ASC"
  );

  for (let dayOffset = 0; dayOffset < 14; dayOffset += 1) {
    const day = new Date();
    day.setDate(day.getDate() - dayOffset);
    const weekday = day.getDay();

    if (weekday === 0 || weekday === 6) {
      continue;
    }

    const date = day.toISOString().slice(0, 10);

    for (const employee of employeeRows) {
      const random = Math.random();
      const status =
        random < 0.78
          ? 'present'
          : random < 0.9
            ? 'late'
            : random < 0.96
              ? 'absent'
              : 'half_day';

      const checkIn =
        status === 'present'
          ? '08:15:00'
          : status === 'late'
            ? '09:45:00'
            : status === 'half_day'
              ? '13:05:00'
              : null;

      await db.query(
        'INSERT IGNORE INTO attendance (user_id, employee_id, date, attendance_date, check_in, check_in_time, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [employee.id, `EMP${String(employee.id).padStart(3, '0')}`, date, date, checkIn, checkIn, status]
      );
    }
  }

  const [dbInfo] = await db.query('SELECT DATABASE() AS db, USER() AS user');
  const [countInfo] = await db.query(
    "SELECT COUNT(*) AS employees FROM users WHERE role = 'employee'"
  );

  console.log({
    database: dbInfo[0].db,
    mysqlUser: dbInfo[0].user,
    employeeCount: countInfo[0].employees,
  });

  await db.end();
}

main().catch((error) => {
  console.error('INIT_DB_ERROR:', error.message);
  process.exit(1);
});
