import bcrypt from "bcryptjs";
import pool from "./src/config/db.js";

async function main() {
  try {
    const hashedPassword = await bcrypt.hash("password123", 10);
    console.log("Generated hash for 'password123':", hashedPassword);

    // Update admin user password
    const [res] = await pool.query(
      "UPDATE users SET password_hash = ? WHERE email = ?",
      [hashedPassword, "admin@fooddelivery.com"],
    );
    console.log("Updated admin rows:", res.affectedRows);

    // Update other seeded users too so they can log in
    const [res2] = await pool.query(
      "UPDATE users SET password_hash = ? WHERE email IN (?, ?)",
      [hashedPassword, "rajesh.owner1@example.com", "priya.owner2@example.com"],
    );
    console.log("Updated restaurant owners rows:", res2.affectedRows);

    const [res3] = await pool.query(
      "UPDATE users SET password_hash = ? WHERE email IN (?, ?)",
      [
        hashedPassword,
        "amit.driver1@example.com",
        "vikram.driver2@example.com",
      ],
    );
    console.log("Updated delivery drivers rows:", res3.affectedRows);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

main();
