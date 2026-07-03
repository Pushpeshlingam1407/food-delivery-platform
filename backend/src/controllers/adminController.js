import crypto from "crypto";
import pool from "../config/db.js";

export async function verifyRestaurant(req, res) {
  if (!req.user || req.user.role !== "admin") {
    return res
      .status(403)
      .json({ status: "error", message: "Forbidden: Access denied" });
  }

  const { id } = req.params;
  const { is_verified } = req.body;

  if (is_verified === undefined) {
    return res
      .status(400)
      .json({ status: "error", message: "is_verified status is required" });
  }

  try {
    await pool.query("UPDATE restaurants SET is_verified = ? WHERE id = ?", [
      is_verified,
      id,
    ]);
    return res.status(200).json({
      status: "success",
      message: "Restaurant verification status updated",
    });
  } catch (error) {
    console.error("Verify restaurant error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
}

export async function getSystemAnalytics(req, res) {
  if (!req.user || req.user.role !== "admin") {
    return res
      .status(403)
      .json({ status: "error", message: "Forbidden: Access denied" });
  }

  try {
    const [userCount] = await pool.query(
      "SELECT COUNT(*) as count FROM users WHERE deleted_at IS NULL",
    );
    const [restCount] = await pool.query(
      "SELECT COUNT(*) as count FROM restaurants WHERE deleted_at IS NULL",
    );
    const [orderCount] = await pool.query(
      "SELECT COUNT(*) as count FROM orders",
    );
    const [salesStats] = await pool.query(
      'SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE payment_status = "completed"',
    );

    return res.status(200).json({
      status: "success",
      data: {
        total_users: userCount[0].count,
        total_restaurants: restCount[0].count,
        total_orders: orderCount[0].count,
        total_payments_captured: parseFloat(salesStats[0].total),
      },
    });
  } catch (error) {
    console.error("Get system stats error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
}

export async function createCoupon(req, res) {
  if (!req.user || req.user.role !== "admin") {
    return res
      .status(403)
      .json({ status: "error", message: "Forbidden: Access denied" });
  }

  const {
    code,
    discount_type,
    discount_value,
    max_discount_amount,
    min_order_amount = 0.0,
    start_date,
    end_date,
    usage_limit = null,
  } = req.body;

  if (
    !code ||
    !discount_type ||
    discount_value === undefined ||
    !start_date ||
    !end_date
  ) {
    return res
      .status(400)
      .json({ status: "error", message: "Missing required coupon fields" });
  }

  try {
    const id = crypto.randomUUID();
    await pool.query(
      `INSERT INTO coupons (id, code, discount_type, discount_value, max_discount_amount, min_order_amount, start_date, end_date, usage_limit, is_active) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE)`,
      [
        id,
        code,
        discount_type,
        discount_value,
        max_discount_amount || null,
        min_order_amount,
        start_date,
        end_date,
        usage_limit,
      ],
    );

    return res.status(201).json({
      status: "success",
      message: "Coupon created successfully",
      data: { id, code },
    });
  } catch (error) {
    console.error("Create coupon error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
}

export async function getCoupons(req, res) {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM coupons ORDER BY created_at DESC",
    );
    return res.status(200).json({ status: "success", data: rows });
  } catch (error) {
    console.error("Get coupons error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
}

export async function updateCoupon(req, res) {
  if (!req.user || req.user.role !== "admin") {
    return res
      .status(403)
      .json({ status: "error", message: "Forbidden: Access denied" });
  }

  const { id } = req.params;
  const { code, discount_value, is_active, usage_limit } = req.body;

  try {
    const updates = [];
    const params = [];

    if (code) {
      updates.push("code = ?");
      params.push(code);
    }
    if (discount_value !== undefined) {
      updates.push("discount_value = ?");
      params.push(discount_value);
    }
    if (is_active !== undefined) {
      updates.push("is_active = ?");
      params.push(is_active);
    }
    if (usage_limit !== undefined) {
      updates.push("usage_limit = ?");
      params.push(usage_limit);
    }

    if (updates.length === 0) {
      return res
        .status(400)
        .json({ status: "error", message: "No fields to update" });
    }

    params.push(id);
    await pool.query(
      `UPDATE coupons SET ${updates.join(", ")} WHERE id = ?`,
      params,
    );

    return res
      .status(200)
      .json({ status: "success", message: "Coupon updated successfully" });
  } catch (error) {
    console.error("Update coupon error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
}

export async function deleteCoupon(req, res) {
  if (!req.user || req.user.role !== "admin") {
    return res
      .status(403)
      .json({ status: "error", message: "Forbidden: Access denied" });
  }

  const { id } = req.params;

  try {
    await pool.query("DELETE FROM coupons WHERE id = ?", [id]);
    return res
      .status(200)
      .json({ status: "success", message: "Coupon deleted successfully" });
  } catch (error) {
    console.error("Delete coupon error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
}
