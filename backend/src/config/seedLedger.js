import mysql from "mysql2/promise";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env
dotenv.config({ path: path.join(__dirname, "../../.env") });

const dbConfig = {
  host: process.env.DB_HOST || "127.0.0.1",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "Pushpesh@1407",
  database: process.env.DB_NAME || "food_delivery_platform",
  port: parseInt(process.env.DB_PORT || "3306", 10),
};

const drivers = [
  "u0000000-0000-0000-0000-000000000006", // Amit
  "u0000000-0000-0000-0000-000000000007", // Vikram
];

const categories = [
  "base_pay",
  "distance_pay",
  "time_pay",
  "waiting_charges",
  "pickup_bonus",
  "peak_hour_bonus",
  "rain_bonus",
  "night_bonus",
  "zone_multiplier_bonus",
  "surge_incentive",
  "tip",
];

async function seed() {
  console.log("Seeding driver earnings ledger historical data...");
  const connection = await mysql.createConnection(dbConfig);

  try {
    // Clear any existing ledger entries & sessions to ensure clean seed
    await connection.query("DELETE FROM driver_earnings_ledger");
    await connection.query("DELETE FROM driver_online_sessions");

    const now = new Date();

    for (const driverId of drivers) {
      console.log(`Seeding data for driver ${driverId}...`);

      // 1. Seed 8 days of online sessions
      for (let dayOffset = 0; dayOffset < 8; dayOffset++) {
        const sessionDate = new Date(now);
        sessionDate.setDate(now.getDate() - dayOffset);

        // Session 1: Lunch peak (11:30 AM - 3:30 PM)
        const login1 = new Date(sessionDate);
        login1.setHours(11, 30, 0, 0);
        const logout1 = new Date(sessionDate);
        logout1.setHours(15, 30, 0, 0);

        await connection.query(
          "INSERT INTO driver_online_sessions (id, driver_id, login_time, logout_time) VALUES (?, ?, ?, ?)",
          [crypto.randomUUID(), driverId, login1, logout1],
        );

        // Session 2: Dinner peak (6:30 PM - 10:30 PM)
        const login2 = new Date(sessionDate);
        login2.setHours(18, 30, 0, 0);
        const logout2 = new Date(sessionDate);
        logout2.setHours(22, 30, 0, 0);

        await connection.query(
          "INSERT INTO driver_online_sessions (id, driver_id, login_time, logout_time) VALUES (?, ?, ?, ?)",
          [crypto.randomUUID(), driverId, login2, logout2],
        );
      }

      // Fetch or initialize driver's wallet
      let driverWalletId;
      const [walletRows] = await connection.query(
        "SELECT id, balance FROM wallets WHERE user_id = ?",
        [driverId],
      );
      if (walletRows.length === 0) {
        driverWalletId = crypto.randomUUID();
        await connection.query(
          "INSERT INTO wallets (id, user_id, balance, currency) VALUES (?, ?, 0.00, 'INR')",
          [driverWalletId, driverId],
        );
      } else {
        driverWalletId = walletRows[0].id;
      }

      // Reset wallet balance to start fresh
      await connection.query("UPDATE wallets SET balance = 0.00 WHERE id = ?", [
        driverWalletId,
      ]);

      let runningBalance = 0;

      // Seed 25 historical delivery groups (each delivery has multiple category payouts)
      for (let i = 0; i < 25; i++) {
        const orderDate = new Date(now);
        orderDate.setDate(now.getDate() - Math.floor(i / 3)); // distributed over past ~8 days
        orderDate.setHours(
          [12, 13, 14, 19, 20, 21][i % 6],
          Math.floor(Math.random() * 60),
          0,
          0,
        );

        // Simulate orderId
        const orderId = null; // Can remain null since order mapping is optional in schema

        // Generate base_pay (₹30) & distance_pay (₹12 - ₹60)
        const base = 30.0;
        const dist = parseFloat((12.0 + Math.random() * 48.0).toFixed(2));
        const time = 15.0;
        const wait = Math.random() > 0.6 ? 5.0 : 0.0;
        const pickup = 5.0;
        const peak = orderDate.getHours() >= 19 ? 20.0 : 0.0;
        const rain = Math.random() > 0.8 ? 25.0 : 0.0;
        const night = orderDate.getHours() >= 23 ? 30.0 : 0.0;
        const zoneMult = parseFloat(((base + dist) * 0.1).toFixed(2)); // 1.1x zone mult
        const surge = peak > 0 ? 10.0 : 0.0;
        const tip = Math.random() > 0.5 ? 20.0 : 0.0;

        const payouts = {
          base_pay: base,
          distance_pay: dist,
          time_pay: time,
          waiting_charges: wait,
          pickup_bonus: pickup,
          peak_hour_bonus: peak,
          rain_bonus: rain,
          night_bonus: night,
          zone_multiplier_bonus: zoneMult,
          surge_incentive: surge,
          tip: tip,
        };

        for (const [category, amount] of Object.entries(payouts)) {
          if (amount > 0) {
            runningBalance += amount;
            const ledgerTxId = crypto.randomUUID();
            const remarks = `Credit for ${category.replace(/_/g, " ")} on delivery #${i + 1000}`;

            await connection.query(
              `INSERT INTO driver_earnings_ledger 
               (id, driver_id, order_id, category, type, amount, balance_after, remarks, settlement_status, payment_cycle, created_at) 
               VALUES (?, ?, ?, ?, 'credit', ?, ?, ?, 'settled', 'daily', ?)`,
              [
                ledgerTxId,
                driverId,
                orderId,
                category,
                amount,
                runningBalance,
                remarks,
                orderDate,
              ],
            );

            // Record inside wallet transactions
            const wTxId = crypto.randomUUID();
            await connection.query(
              `INSERT INTO wallet_transactions (id, wallet_id, amount, type, description, reference_type, reference_id, created_at) 
               VALUES (?, ?, ?, 'credit', ?, 'delivery_payout', ?, ?)`,
              [wTxId, driverWalletId, amount, remarks, ledgerTxId, orderDate],
            );
          }
        }
      }

      // Update wallets with final seeded balance
      await connection.query(
        "UPDATE wallets SET balance = ? WHERE id = ?",
        [runningBalance, driverWalletId],
      );
      console.log(
        `Final wallet balance for driver ${driverId} set to ₹${runningBalance.toFixed(2)}`,
      );
    }

    console.log("Seeding driver earnings historical ledger data completed.");
  } catch (error) {
    console.error("Seeding failed:", error);
  } finally {
    await connection.end();
  }
}

seed();
