import pool from "./backend/src/config/db.js";

async function main() {
  try {
    // Let's check the delivery partner update query behavior in deliveryController
    // We can simulate req.user = { userId: '7f8035b1-888f-46ba-a755-cb6655d7b3a1', role: 'delivery_partner' }
    // body: { is_online: true }
    const userId = '7f8035b1-888f-46ba-a755-cb6655d7b3a1';
    const is_online = true;

    const [rows] = await pool.query(
      "SELECT * FROM delivery_partners WHERE id = ?",
      [userId]
    );
    console.log("Driver details from DB:", rows);

    const updates = [];
    const params = [];
    updates.push("is_online = ?");
    params.push(is_online ? 1 : 0);
    params.push(userId);

    const query = `UPDATE delivery_partners SET ${updates.join(", ")} WHERE id = ?`;
    console.log("Executing Query:", query, "with params:", params);

    const [result] = await pool.query(query, params);
    console.log("Update result:", result);

  } catch (err) {
    console.error("SQL Error during toggle simulation:", err);
  } finally {
    process.exit(0);
  }
}

main();
