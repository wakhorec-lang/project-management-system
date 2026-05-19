const mysql = require("mysql2");
require("dotenv").config();

const {
  DB_HOST,
  DB_USER,
  DB_PASSWORD,
  DB_NAME,
} = process.env;

const connection = mysql.createConnection({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  multipleStatements: false,
});

connection.connect((err) => {
  if (err) {
    console.log("Database Connection Error");
    console.log(err);
    return;
  }

  connection.query(
    `CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
    (createErr) => {
      if (createErr) {
        console.log("Database creation error");
        console.log(createErr);
        return;
      }

      connection.changeUser({ database: DB_NAME }, (changeErr) => {
        if (changeErr) {
          console.log("Database selection error");
          console.log(changeErr);
          return;
        }

        console.log("MySQL Connected Successfully");

        // Create tables if they don't exist
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

        connection.query(createUserTable, (err) => {
          if (err) console.log("Error creating users table:", err);
        });

        connection.query(createProjectTable, (err) => {
          if (err) console.log("Error creating projects table:", err);
        });

        connection.query(createTaskTable, (err) => {
          if (err) console.log("Error creating tasks table:", err);
        });

        connection.query(
          "SHOW COLUMNS FROM tasks LIKE 'status'",
          (showErr, showResult) => {
            if (showErr) {
              console.log('Error checking tasks table columns:', showErr);
              return;
            }

            if (showResult.length === 0) {
              connection.query(
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
      });
    }
  );
});

module.exports = connection;