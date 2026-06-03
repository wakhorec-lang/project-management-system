const mysql = require("mysql2");
require("dotenv").config();

const {
  DB_HOST,
  DB_USER,
  DB_PASSWORD,
  DB_NAME,
  MYSQL_URL,
} = process.env;

// Pool instance that will be assigned once the database is ready and exported.
let pool;

function createTables() {
  const createUserTable = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role ENUM('admin', 'member') DEFAULT 'member',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  const createProjectTable = `
    CREATE TABLE IF NOT EXISTS projects (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(200) NOT NULL,
      description TEXT,
      deadline DATE,
      created_by INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users(id)
    )
  `;

  const createTaskTable = `
    CREATE TABLE IF NOT EXISTS tasks (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(200) NOT NULL,
      description TEXT,
      deadline DATE,
      assigned_to INT,
      project_id INT NOT NULL,
      priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
      status ENUM('pending', 'in progress', 'completed') DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (assigned_to) REFERENCES users(id),
      FOREIGN KEY (project_id) REFERENCES projects(id)
    )
  `;

  pool.query(createUserTable, (err) => {
    if (err) console.log("Error creating users table:", err);
  });

  pool.query(createProjectTable, (err) => {
    if (err) console.log("Error creating projects table:", err);
  });

  pool.query(createTaskTable, (err) => {
    if (err) console.log("Error creating tasks table:", err);
  });

  pool.query(
    "SHOW COLUMNS FROM tasks LIKE 'status'",
    (showErr, showResult) => {
      if (showErr) {
        console.log('Error checking tasks table columns:', showErr);
        return;
      }

      if (showResult.length === 0) {
        pool.query(
          "ALTER TABLE tasks ADD COLUMN status ENUM('pending', 'in progress', 'completed') DEFAULT 'pending'",
          (alterErr) => {
            if (alterErr) {
              console.log('Error adding tasks status column:', alterErr);
            }
          }
        );
      }
    }
  );
}

if (MYSQL_URL) {
  // When a full connection URL is provided, create the pool directly.
  pool = mysql.createPool({
    uri: MYSQL_URL,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  pool.getConnection((err, connection) => {
    if (err) {
      console.log("Database Connection Error");
      console.log(err);
      return;
    }
    connection.release();
    console.log("MySQL Connected Successfully using MYSQL_URL");
    createTables();
  });
} else {
  // When individual credentials are provided, first ensure the target database
  // exists using a temporary connection, then build the pool with the database
  // selected so all pooled connections start in the right schema.
  if (!DB_NAME) {
    console.log("DB_NAME is missing");
  } else {
    const tempConnection = mysql.createConnection({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASSWORD,
      multipleStatements: false,
    });

    tempConnection.connect((err) => {
      if (err) {
        console.log("Database Connection Error");
        console.log(err);
        return;
      }

      tempConnection.query(
        `CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
        (createErr) => {
          tempConnection.destroy();

          if (createErr) {
            console.log("Database creation error");
            console.log(createErr);
            return;
          }

          // Build the pool now that the database is guaranteed to exist.
          pool = mysql.createPool({
            host: DB_HOST,
            user: DB_USER,
            password: DB_PASSWORD,
            database: DB_NAME,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
            multipleStatements: false,
          });

          pool.getConnection((connErr, connection) => {
            if (connErr) {
              console.log("Database selection error");
              console.log(connErr);
              return;
            }
            connection.release();
            console.log("MySQL Connected Successfully");
            createTables();
          });
        }
      );
    });
  }
}

module.exports = {
  query: (...args) => pool.query(...args),
};