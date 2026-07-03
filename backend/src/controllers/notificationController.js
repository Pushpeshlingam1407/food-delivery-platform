import pool from "../config/db.js";

export async function getNotifications(req, res) {
  if (!req.user) {
    return res.status(401).json({ status: "error", message: "Unauthorized" });
  }

  try {
    const [rows] = await pool.query(
      "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 100",
      [req.user.userId],
    );
    return res.status(200).json({ status: "success", data: rows });
  } catch (error) {
    console.error("Get notifications error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
}

export async function markNotificationRead(req, res) {
  if (!req.user) {
    return res.status(401).json({ status: "error", message: "Unauthorized" });
  }

  const { id } = req.params;

  try {
    const [rows] = await pool.query(
      "SELECT user_id FROM notifications WHERE id = ?",
      [id],
    );
    if (rows.length === 0) {
      return res
        .status(404)
        .json({ status: "error", message: "Notification not found" });
    }

    if (rows[0].user_id !== req.user.userId && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ status: "error", message: "Forbidden: Access denied" });
    }

    await pool.query("UPDATE notifications SET is_read = TRUE WHERE id = ?", [
      id,
    ]);
    return res
      .status(200)
      .json({ status: "success", message: "Notification marked as read" });
  } catch (error) {
    console.error("Mark notification read error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
}
