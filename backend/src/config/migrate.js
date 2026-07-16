import mysql from "mysql2/promise";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env
dotenv.config({ path: path.join(__dirname, "../../.env") });

const dbConfig = {
  host: process.env.DB_HOST || "127.0.0.1",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "Pushpesh@1407",
  database: process.env.DB_NAME || "food_delivery_platform",
  port: parseInt(process.env.DB_PORT || "3306", 10),
};

async function migrate() {
  console.log("Starting DB migrations...");
  const connection = await mysql.createConnection(dbConfig);
  try {
    // 1. Create driver_earnings_ledger table
    console.log("Creating driver_earnings_ledger table...");
    await connection.query(`
      CREATE TABLE IF NOT EXISTS driver_earnings_ledger (
        id VARCHAR(36) PRIMARY KEY,
        driver_id VARCHAR(36) NOT NULL,
        order_id VARCHAR(36) NULL,
        category VARCHAR(50) NOT NULL,
        type ENUM('credit', 'debit') NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        balance_after DECIMAL(10, 2) NOT NULL,
        remarks TEXT NULL,
        settlement_status ENUM('pending', 'processing', 'settled', 'failed') DEFAULT 'pending',
        payment_cycle VARCHAR(50) NULL,
        payout_reference VARCHAR(100) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_driver_ledger_driver (driver_id),
        INDEX idx_driver_ledger_created (created_at),
        FOREIGN KEY (driver_id) REFERENCES delivery_partners(id) ON DELETE CASCADE,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL
      ) ENGINE=InnoDB;
    `);

    // 2. Create driver_online_sessions table
    console.log("Creating driver_online_sessions table...");
    await connection.query(`
      CREATE TABLE IF NOT EXISTS driver_online_sessions (
        id VARCHAR(36) PRIMARY KEY,
        driver_id VARCHAR(36) NOT NULL,
        login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        logout_time TIMESTAMP NULL DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_driver_sessions_driver (driver_id),
        FOREIGN KEY (driver_id) REFERENCES delivery_partners(id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);

    console.log("DB migrations completed successfully.");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

migrate();
