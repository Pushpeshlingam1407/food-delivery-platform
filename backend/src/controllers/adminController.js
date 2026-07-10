import crypto from "crypto";
import bcrypt from "bcryptjs";
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
    await pool.query(
      "UPDATE restaurants SET is_verified = ?, status = ? WHERE id = ?",
      [is_verified, is_verified ? "open" : "closed", id],
    );
    return res.status(200).json({
      status: "success",
      message: "Restaurant verification status and opening state updated",
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

export async function getSystemSettings(req, res) {
  if (!req.user || req.user.role !== "admin") {
    return res
      .status(403)
      .json({ status: "error", message: "Forbidden: Access denied" });
  }
  try {
    const [rows] = await pool.query("SELECT * FROM system_settings");
    return res.status(200).json({ status: "success", data: rows });
  } catch (error) {
    console.error("Get settings error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
}

export async function updateSystemSettings(req, res) {
  if (!req.user || req.user.role !== "admin") {
    return res
      .status(403)
      .json({ status: "error", message: "Forbidden: Access denied" });
  }
  const { settings } = req.body;
  if (!Array.isArray(settings)) {
    return res
      .status(400)
      .json({ status: "error", message: "Invalid settings format" });
  }
  try {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      for (const item of settings) {
        await connection.query(
          "UPDATE system_settings SET value = ? WHERE key_name = ?",
          [item.value, item.key_name],
        );
      }
      await connection.commit();
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
    return res
      .status(200)
      .json({ status: "success", message: "Settings updated successfully" });
  } catch (error) {
    console.error("Update settings error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
}

// -------------------------------------------------------------
// Admin Restaurant CRUD
// -------------------------------------------------------------

export async function getRestaurants(req, res) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ status: "error", message: "Forbidden" });
  }
  try {
    const [rows] = await pool.query(
      "SELECT r.*, u.first_name, u.last_name, u.email as owner_email FROM restaurants r JOIN users u ON r.owner_id = u.id WHERE r.deleted_at IS NULL",
    );
    return res.status(200).json({ status: "success", data: rows });
  } catch (error) {
    console.error("Get restaurants error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
}

export async function createRestaurant(req, res) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ status: "error", message: "Forbidden" });
  }
  const {
    name,
    description,
    owner_id,
    banner_image_url = "",
    logo_url = "",
    commission_rate = 10.0,
    average_delivery_time = 30,
    opening_time = "08:00:00",
    closing_time = "22:00:00",
  } = req.body;

  if (!name || !owner_id) {
    return res
      .status(400)
      .json({ status: "error", message: "Name and owner_id are required" });
  }

  try {
    const id = crypto.randomUUID();
    await pool.query(
      "INSERT INTO restaurants (id, owner_id, name, description, banner_image_url, logo_url, commission_rate, average_delivery_time, opening_time, closing_time, is_active, is_verified, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE, TRUE, 'closed')",
      [
        id,
        owner_id,
        name,
        description,
        banner_image_url,
        logo_url,
        commission_rate,
        average_delivery_time,
        opening_time,
        closing_time,
      ],
    );
    return res
      .status(201)
      .json({ status: "success", message: "Restaurant created", data: { id } });
  } catch (error) {
    console.error("Create restaurant error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
}

export async function updateRestaurant(req, res) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ status: "error", message: "Forbidden" });
  }
  const { id } = req.params;
  const {
    name,
    description,
    banner_image_url,
    logo_url,
    commission_rate,
    average_delivery_time,
    is_active,
    is_verified,
    status,
    opening_time,
    closing_time,
  } = req.body;

  try {
    await pool.query(
      "UPDATE restaurants SET name = COALESCE(?, name), description = COALESCE(?, description), banner_image_url = COALESCE(?, banner_image_url), logo_url = COALESCE(?, logo_url), commission_rate = COALESCE(?, commission_rate), average_delivery_time = COALESCE(?, average_delivery_time), is_active = COALESCE(?, is_active), is_verified = COALESCE(?, is_verified), status = COALESCE(?, status), opening_time = COALESCE(?, opening_time), closing_time = COALESCE(?, closing_time) WHERE id = ?",
      [
        name,
        description,
        banner_image_url,
        logo_url,
        commission_rate,
        average_delivery_time,
        is_active,
        is_verified,
        status,
        opening_time,
        closing_time,
        id,
      ],
    );
    return res
      .status(200)
      .json({ status: "success", message: "Restaurant updated" });
  } catch (error) {
    console.error("Update restaurant error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
}

export async function deleteRestaurant(req, res) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ status: "error", message: "Forbidden" });
  }
  const { id } = req.params;
  try {
    await pool.query(
      "UPDATE restaurants SET deleted_at = CURRENT_TIMESTAMP, is_active = FALSE WHERE id = ?",
      [id],
    );
    return res
      .status(200)
      .json({ status: "success", message: "Restaurant deactivated" });
  } catch (error) {
    console.error("Delete restaurant error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
}

// -------------------------------------------------------------
// Admin Customer CRUD
// -------------------------------------------------------------

export async function getCustomers(req, res) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ status: "error", message: "Forbidden" });
  }
  try {
    const [rows] = await pool.query(
      "SELECT u.id, u.first_name, u.last_name, u.email, u.phone, u.status, u.is_verified, u.created_at, COALESCE(w.balance, 0) as wallet_balance FROM users u LEFT JOIN wallets w ON u.id = w.user_id WHERE u.role_id = 2 AND u.deleted_at IS NULL",
    );
    return res.status(200).json({ status: "success", data: rows });
  } catch (error) {
    console.error("Get customers error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
}

export async function updateCustomer(req, res) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ status: "error", message: "Forbidden" });
  }
  const { id } = req.params;
  const {
    first_name,
    last_name,
    email,
    phone,
    status,
    is_verified,
    wallet_balance,
  } = req.body;

  try {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      await connection.query(
        "UPDATE users SET first_name = COALESCE(?, first_name), last_name = COALESCE(?, last_name), email = COALESCE(?, email), phone = COALESCE(?, phone), status = COALESCE(?, status), is_verified = COALESCE(?, is_verified) WHERE id = ?",
        [first_name, last_name, email, phone, status, is_verified, id],
      );

      if (wallet_balance !== undefined) {
        const [wallets] = await connection.query(
          "SELECT id FROM wallets WHERE user_id = ?",
          [id],
        );
        if (wallets.length > 0) {
          await connection.query(
            "UPDATE wallets SET balance = ? WHERE user_id = ?",
            [parseFloat(wallet_balance), id],
          );
        } else {
          await connection.query(
            "INSERT INTO wallets (id, user_id, balance) VALUES (?, ?, ?)",
            [crypto.randomUUID(), id, parseFloat(wallet_balance)],
          );
        }
      }

      await connection.commit();
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }

    return res
      .status(200)
      .json({ status: "success", message: "Customer updated successfully" });
  } catch (error) {
    console.error("Update customer error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
}

export async function deleteCustomer(req, res) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ status: "error", message: "Forbidden" });
  }
  const { id } = req.params;
  try {
    await pool.query(
      "UPDATE users SET deleted_at = CURRENT_TIMESTAMP, status = 'inactive' WHERE id = ?",
      [id],
    );
    return res
      .status(200)
      .json({ status: "success", message: "Customer blocked/deleted" });
  } catch (error) {
    console.error("Delete customer error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
}

// -------------------------------------------------------------
// Admin Driver CRUD
// -------------------------------------------------------------

export async function getDrivers(req, res) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ status: "error", message: "Forbidden" });
  }
  try {
    const [rows] = await pool.query(
      "SELECT u.id, u.first_name, u.last_name, u.email, u.phone, u.status, u.is_verified, dp.vehicle_number, dp.vehicle_type, dp.license_number, dp.is_online, dp.status as driver_status FROM users u LEFT JOIN delivery_partners dp ON u.id = dp.id WHERE u.role_id = 4 AND u.deleted_at IS NULL",
    );
    return res.status(200).json({ status: "success", data: rows });
  } catch (error) {
    console.error("Get drivers error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
}

export async function updateDriver(req, res) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ status: "error", message: "Forbidden" });
  }
  const { id } = req.params;
  const {
    first_name,
    last_name,
    email,
    phone,
    status,
    is_verified,
    vehicle_number,
    vehicle_type,
    license_number,
    is_online,
    driver_status,
  } = req.body;

  try {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      await connection.query(
        "UPDATE users SET first_name = COALESCE(?, first_name), last_name = COALESCE(?, last_name), email = COALESCE(?, email), phone = COALESCE(?, phone), status = COALESCE(?, status), is_verified = COALESCE(?, is_verified) WHERE id = ?",
        [first_name, last_name, email, phone, status, is_verified, id],
      );

      const [partners] = await connection.query(
        "SELECT id FROM delivery_partners WHERE id = ?",
        [id],
      );
      if (partners.length > 0) {
        await connection.query(
          "UPDATE delivery_partners SET vehicle_number = COALESCE(?, vehicle_number), vehicle_type = COALESCE(?, vehicle_type), license_number = COALESCE(?, license_number), is_online = COALESCE(?, is_online), status = COALESCE(?, status) WHERE id = ?",
          [
            vehicle_number,
            vehicle_type,
            license_number,
            is_online,
            driver_status,
            id,
          ],
        );
      } else {
        await connection.query(
          "INSERT INTO delivery_partners (id, vehicle_number, vehicle_type, license_number, is_online, status) VALUES (?, ?, ?, ?, ?, ?)",
          [
            id,
            vehicle_number || "",
            vehicle_type || "bike",
            license_number || "",
            is_online || false,
            driver_status || "idle",
          ],
        );
      }

      await connection.commit();
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }

    return res
      .status(200)
      .json({ status: "success", message: "Driver updated successfully" });
  } catch (error) {
    console.error("Update driver error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
}

export async function deleteDriver(req, res) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ status: "error", message: "Forbidden" });
  }
  const { id } = req.params;
  try {
    await pool.query(
      "UPDATE users SET deleted_at = CURRENT_TIMESTAMP, status = 'inactive' WHERE id = ?",
      [id],
    );
    return res
      .status(200)
      .json({ status: "success", message: "Driver blocked/deleted" });
  } catch (error) {
    console.error("Delete driver error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
}

// -------------------------------------------------------------
// Admin Orders CRUD & Manual Rider Assignment
// -------------------------------------------------------------

export async function getOrders(req, res) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ status: "error", message: "Forbidden" });
  }
  try {
    const [rows] = await pool.query(
      `SELECT o.*, 
              CONCAT(u.first_name, ' ', u.last_name) as customer_name, u.email as customer_email,
              r.name as restaurant_name,
              CONCAT(d.first_name, ' ', d.last_name) as driver_name, d.phone as driver_phone
       FROM orders o
       JOIN users u ON o.user_id = u.id
       JOIN restaurants r ON o.restaurant_id = r.id
       LEFT JOIN users d ON o.delivery_partner_id = d.id
       ORDER BY o.placed_at DESC`,
    );
    return res.status(200).json({ status: "success", data: rows });
  } catch (error) {
    console.error("Get orders error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
}

export async function updateOrder(req, res) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ status: "error", message: "Forbidden" });
  }
  const { id } = req.params;
  const { status, delivery_partner_id, total_payable } = req.body;

  try {
    await pool.query(
      "UPDATE orders SET status = COALESCE(?, status), delivery_partner_id = ?, total_payable = COALESCE(?, total_payable) WHERE id = ?",
      [
        status,
        delivery_partner_id === "" ? null : delivery_partner_id,
        total_payable,
        id,
      ],
    );
    return res
      .status(200)
      .json({ status: "success", message: "Order updated successfully" });
  } catch (error) {
    console.error("Update order error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
}

export async function deleteOrder(req, res) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ status: "error", message: "Forbidden" });
  }
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM orders WHERE id = ?", [id]);
    return res
      .status(200)
      .json({ status: "success", message: "Order deleted from database" });
  } catch (error) {
    console.error("Delete order error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
}

// -------------------------------------------------------------
// Admin Menu Images CRUD
// -------------------------------------------------------------

export async function getMenuImages(req, res) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ status: "error", message: "Forbidden" });
  }
  try {
    const [rows] = await pool.query(
      `SELECT mi.*, m.name as menu_item_name, r.name as restaurant_name 
       FROM menu_images mi
       JOIN menus m ON mi.menu_id = m.id
       JOIN restaurants r ON m.restaurant_id = r.id`,
    );
    return res.status(200).json({ status: "success", data: rows });
  } catch (error) {
    console.error("Get menu images error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
}

export async function createMenuImage(req, res) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ status: "error", message: "Forbidden" });
  }
  const { menu_id, image_url, is_primary = false } = req.body;
  if (!menu_id || !image_url) {
    return res
      .status(400)
      .json({ status: "error", message: "menu_id and image_url are required" });
  }
  try {
    const id = crypto.randomUUID();
    await pool.query(
      "INSERT INTO menu_images (id, menu_id, image_url, is_primary) VALUES (?, ?, ?, ?)",
      [id, menu_id, image_url, is_primary],
    );
    return res
      .status(201)
      .json({ status: "success", message: "Menu image created", data: { id } });
  } catch (error) {
    console.error("Create menu image error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
}

export async function deleteMenuImage(req, res) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ status: "error", message: "Forbidden" });
  }
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM menu_images WHERE id = ?", [id]);
    return res
      .status(200)
      .json({ status: "success", message: "Menu image deleted" });
  } catch (error) {
    console.error("Delete menu image error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
}

// -------------------------------------------------------------
// Admin Restaurant Owners CRUD
// -------------------------------------------------------------

export async function getOwners(req, res) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ status: "error", message: "Forbidden" });
  }
  try {
    const [rows] = await pool.query(
      `SELECT u.id, u.first_name, u.last_name, u.email, u.phone, u.status, u.is_verified, u.created_at, 
              r.id as restaurant_id, r.name as restaurant_name 
       FROM users u 
       LEFT JOIN restaurants r ON u.id = r.owner_id AND r.deleted_at IS NULL
       WHERE u.role_id = 3 AND u.deleted_at IS NULL`,
    );
    return res.status(200).json({ status: "success", data: rows });
  } catch (error) {
    console.error("Get owners error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
}

export async function createOwner(req, res) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ status: "error", message: "Forbidden" });
  }
  const { first_name, last_name, email, phone, password } = req.body;
  if (!first_name || !last_name || !email || !phone || !password) {
    return res
      .status(400)
      .json({ status: "error", message: "All fields are required" });
  }

  try {
    const [existing] = await pool.query(
      "SELECT id FROM users WHERE email = ? OR phone = ?",
      [email, phone],
    );
    if (existing.length > 0) {
      return res.status(400).json({
        status: "error",
        message: "Owner email or phone already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = crypto.randomUUID();

    await pool.query(
      `INSERT INTO users (id, role_id, first_name, last_name, email, phone, password_hash, is_verified) 
       VALUES (?, 3, ?, ?, ?, ?, ?, TRUE)`,
      [userId, first_name, last_name, email, phone, hashedPassword],
    );

    return res.status(201).json({
      status: "success",
      message: "Restaurant owner registered successfully",
      data: { id: userId, email },
    });
  } catch (error) {
    console.error("Create owner error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
}

export async function updateOwner(req, res) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ status: "error", message: "Forbidden" });
  }
  const { id } = req.params;
  const { first_name, last_name, email, phone, status, is_verified } = req.body;

  try {
    await pool.query(
      `UPDATE users SET 
        first_name = COALESCE(?, first_name), 
        last_name = COALESCE(?, last_name), 
        email = COALESCE(?, email), 
        phone = COALESCE(?, phone), 
        status = COALESCE(?, status), 
        is_verified = COALESCE(?, is_verified) 
       WHERE id = ?`,
      [first_name, last_name, email, phone, status, is_verified, id],
    );
    return res
      .status(200)
      .json({ status: "success", message: "Owner profile updated" });
  } catch (error) {
    console.error("Update owner error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
}

export async function deleteOwner(req, res) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ status: "error", message: "Forbidden" });
  }
  const { id } = req.params;
  try {
    await pool.query(
      "UPDATE users SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?",
      [id],
    );
    return res
      .status(200)
      .json({ status: "success", message: "Owner deleted" });
  } catch (error) {
    console.error("Delete owner error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
}
