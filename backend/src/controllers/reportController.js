import pool from "../config/db.js";

export async function getRestaurantSalesReport(req, res) {
  if (!req.user) {
    return res.status(401).json({ status: "error", message: "Unauthorized" });
  }

  const { restaurantId } = req.params;

  try {
    // Verify ownership
    const [rows] = await pool.query(
      "SELECT owner_id FROM restaurants WHERE id = ?",
      [restaurantId],
    );
    if (rows.length === 0) {
      return res
        .status(404)
        .json({ status: "error", message: "Restaurant not found" });
    }

    if (rows[0].owner_id !== req.user.userId && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ status: "error", message: "Forbidden: Access denied" });
    }

    // Aggregate statistics
    const [salesRows] = await pool.query(
      `SELECT 
        COUNT(*) as total_orders,
        COALESCE(SUM(order_total), 0) as gross_sales,
        COALESCE(SUM(commission_amount), 0) as total_commissions,
        COALESCE(SUM(net_earning), 0) as net_earnings
       FROM restaurant_earnings 
       WHERE restaurant_id = ?`,
      [restaurantId],
    );

    const [earningsRows] = await pool.query(
      "SELECT * FROM restaurant_earnings WHERE restaurant_id = ? ORDER BY created_at DESC LIMIT 100",
      [restaurantId],
    );

    return res.status(200).json({
      status: "success",
      data: {
        summary: salesRows[0],
        ledger: earningsRows,
      },
    });
  } catch (error) {
    console.error("Restaurant sales report error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
}

export async function getDriverEarningsReport(req, res) {
  if (!req.user) {
    return res.status(401).json({ status: "error", message: "Unauthorized" });
  }

  try {
    const [driverRows] = await pool.query(
      "SELECT id FROM delivery_partners WHERE id = ?",
      [req.user.userId],
    );
    if (driverRows.length === 0) {
      return res
        .status(404)
        .json({ status: "error", message: "Driver profile not found" });
    }

    // Aggregate statistics
    const [earningStats] = await pool.query(
      `SELECT 
        COUNT(*) as total_deliveries,
        COALESCE(SUM(delivery_fee), 0) as total_delivery_fees,
        COALESCE(SUM(tip_amount), 0) as total_tips,
        COALESCE(SUM(total_earning), 0) as total_earnings
       FROM delivery_earnings 
       WHERE driver_id = ?`,
      [req.user.userId],
    );

    const [earningRows] = await pool.query(
      "SELECT * FROM delivery_earnings WHERE driver_id = ? ORDER BY created_at DESC LIMIT 100",
      [req.user.userId],
    );

    return res.status(200).json({
      status: "success",
      data: {
        summary: earningStats[0],
        ledger: earningRows,
      },
    });
  } catch (error) {
    console.error("Driver earnings report error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
}
