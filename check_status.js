import pool from "./backend/src/config/db.js";

async function main() {
  try {
    const [users] = await pool.query("SELECT id, first_name, last_name, email, role_id FROM users");
    console.log("=== USERS ===");
    console.log(users);

    const [roles] = await pool.query("SELECT * FROM roles");
    console.log("=== ROLES ===");
    console.log(roles);

    const [partners] = await pool.query("SELECT * FROM delivery_partners");
    console.log("=== DELIVERY PARTNERS ===");
    console.log(partners);

    const [restaurants] = await pool.query("SELECT * FROM restaurants");
    console.log("=== RESTAURANTS ===");
    console.log(restaurants);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

main();
