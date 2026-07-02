import crypto from "crypto";
import pool from "../config/db.js";
import { notifyOrderStatus } from "../config/socket.js";

export async function placeOrder(req, res) {
  if (!req.user) {
    return res.status(401).json({ status: "error", message: "Unauthorized" });
  }

  const { addressId, paymentMethod, couponCode, notes } = req.body;

  if (!addressId || !paymentMethod) {
    return res.status(400).json({
      status: "error",
      message: "Address and payment method are required",
    });
  }

  try {
    // 1. Fetch Cart Items & Totals (similar to getCart controller)
    const [cartRows] = await pool.query(
      "SELECT id, restaurant_id FROM carts WHERE user_id = ?",
      [req.user.userId],
    );
    const carts = cartRows;
    if (carts.length === 0) {
      return res
        .status(400)
        .json({ status: "error", message: "Active cart not found" });
    }

    const cart = carts[0];
    if (!cart.restaurant_id) {
      return res
        .status(400)
        .json({ status: "error", message: "Your cart is empty" });
    }

    const [itemRows] = await pool.query(
      `SELECT ci.menu_id, ci.quantity, ci.customization_notes, m.price 
       FROM cart_items ci
       JOIN menus m ON ci.menu_id = m.id
       WHERE ci.cart_id = ?`,
      [cart.id],
    );
    const items = itemRows;
    if (items.length === 0) {
      return res
        .status(400)
        .json({ status: "error", message: "Your cart has no items" });
    }

    let itemTotal = 0;
    for (const item of items) {
      itemTotal += item.price * item.quantity;
    }

    // Load checkout system settings
    const [settingsRows] = await pool.query(
      "SELECT key_name, value FROM system_settings",
    );
    const settingsMap = {};
    settingsRows.forEach((setting) => {
      settingsMap[setting.key_name] = parseFloat(setting.value);
    });

    const baseDelivery = settingsMap["base_delivery_charge"] || 40.0;
    const taxRate = settingsMap["tax_rate_percentage"] || 5.0;
    const freeDeliveryMin = settingsMap["min_free_delivery_threshold"] || 500.0;

    let deliveryCharges = itemTotal >= freeDeliveryMin ? 0 : baseDelivery;
    const taxAmount = parseFloat((itemTotal * (taxRate / 100)).toFixed(2));
    let discountAmount = 0.0;

    if (couponCode) {
      const [couponRows] = await pool.query(
        `SELECT * FROM coupons 
         WHERE code = ? AND is_active = TRUE AND NOW() BETWEEN start_date AND end_date`,
        [couponCode],
      );
      if (couponRows.length > 0) {
        const c = couponRows[0];
        if (itemTotal >= parseFloat(c.min_order_amount)) {
          if (c.discount_type === "percentage") {
            discountAmount = itemTotal * (parseFloat(c.discount_value) / 100);
            if (c.max_discount_amount) {
              discountAmount = Math.min(
                discountAmount,
                parseFloat(c.max_discount_amount),
              );
            }
          } else {
            discountAmount = parseFloat(c.discount_value);
          }
          discountAmount = parseFloat(discountAmount.toFixed(2));
        }
      }
    }

    const totalPayable = parseFloat(
      (itemTotal + deliveryCharges + taxAmount - discountAmount).toFixed(2),
    );

    // 2. Perform Order transaction checks
    const orderId = crypto.randomUUID();
    const paymentId = crypto.randomUUID();

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Verify stock level first
      for (const item of items) {
        const [invRows] = await connection.query(
          "SELECT available_quantity, unlimited FROM inventory WHERE menu_id = ? FOR UPDATE",
          [item.menu_id],
        );
        if (invRows.length === 0) {
          throw new Error(
            `Inventory mapping missing for menu ID: ${item.menu_id}`,
          );
        }
        const inv = invRows[0];
        if (!inv.unlimited && inv.available_quantity < item.quantity) {
          connection.release();
          return res.status(409).json({
            status: "error",
            message: `Item stock exhausted. Not enough quantity available for order.`,
          });
        }
        // Decrement stock
        if (!inv.unlimited) {
          await connection.query(
            "UPDATE inventory SET available_quantity = available_quantity - ? WHERE menu_id = ?",
            [item.quantity, item.menu_id],
          );
        }
      }

      // Check wallet balance if paymentMethod is wallet
      if (paymentMethod === "wallet") {
        const [walletRows] = await connection.query(
          "SELECT id, balance FROM wallets WHERE user_id = ? FOR UPDATE",
          [req.user.userId],
        );
        if (
          walletRows.length === 0 ||
          parseFloat(walletRows[0].balance) < totalPayable
        ) {
          connection.release();
          return res.status(400).json({
            status: "error",
            message: "Insufficient wallet balance for this purchase",
          });
        }
        // Deduct balance
        await connection.query(
          "UPDATE wallets SET balance = balance - ? WHERE user_id = ?",
          [totalPayable, req.user.userId],
        );
        // Log wallet transaction
        const txId = crypto.randomUUID();
        await connection.query(
          `INSERT INTO wallet_transactions (id, wallet_id, amount, type, description, reference_type, reference_id) 
           VALUES (?, ?, ?, 'debit', 'Order Payment Deducted', 'order_payment', ?)`,
          [txId, walletRows[0].id, -totalPayable, orderId],
        );
      }

      // 3. Save Order details
      await connection.query(
        `INSERT INTO orders (id, user_id, restaurant_id, delivery_address_id, status, item_total, delivery_charges, tax_amount, discount_amount, total_payable, coupon_code, notes) 
         VALUES (?, ?, ?, ?, 'placed', ?, ?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          req.user.userId,
          cart.restaurant_id,
          addressId,
          itemTotal,
          deliveryCharges,
          taxAmount,
          discountAmount,
          totalPayable,
          couponCode,
          notes,
        ],
      );

      // 4. Move items to order_items
      for (const item of items) {
        const orderItemId = crypto.randomUUID();
        await connection.query(
          `INSERT INTO order_items (id, order_id, menu_id, quantity, unit_price, total_price, customization_notes) 
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            orderItemId,
            orderId,
            item.menu_id,
            item.quantity,
            item.price,
            item.price * item.quantity,
            item.customization_notes,
          ],
        );
      }

      // 5. Create Payment record
      const paymentStatus =
        paymentMethod === "wallet" ? "completed" : "pending";
      await connection.query(
        "INSERT INTO payments (id, order_id, payment_method, payment_status, amount) VALUES (?, ?, ?, ?, ?)",
        [paymentId, orderId, paymentMethod, paymentStatus, totalPayable],
      );

      // 6. Clear shopping cart
      await connection.query("DELETE FROM cart_items WHERE cart_id = ?", [
        cart.id,
      ]);
      await connection.query(
        "UPDATE carts SET restaurant_id = NULL WHERE id = ?",
        [cart.id],
      );

      await connection.commit();
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }

    return res.status(201).json({
      status: "success",
      message: "Order placed successfully",
      data: {
        orderId,
        totalPayable,
        paymentStatus: paymentMethod === "wallet" ? "completed" : "pending",
      },
    });
  } catch (error) {
    console.error("Place order error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
}

export async function getOrders(req, res) {
  if (!req.user) {
    return res.status(401).json({ status: "error", message: "Unauthorized" });
  }

  try {
    let query = "";
    const params = [];

    if (req.user.role === "customer") {
      query = `
        SELECT o.*, r.name as restaurant_name 
        FROM orders o
        JOIN restaurants r ON o.restaurant_id = r.id
        WHERE o.user_id = ? 
        ORDER BY o.placed_at DESC
      `;
      params.push(req.user.userId);
    } else if (req.user.role === "restaurant_owner") {
      query = `
        SELECT o.*, r.name as restaurant_name 
        FROM orders o
        JOIN restaurants r ON o.restaurant_id = r.id
        WHERE r.owner_id = ? 
        ORDER BY o.placed_at DESC
      `;
      params.push(req.user.userId);
    } else if (req.user.role === "delivery_partner") {
      query = `
        SELECT o.*, r.name as restaurant_name 
        FROM orders o
        JOIN restaurants r ON o.restaurant_id = r.id
        WHERE o.delivery_partner_id = ? OR (o.status = 'ready_for_pickup' AND o.delivery_partner_id IS NULL)
        ORDER BY o.placed_at DESC
      `;
      params.push(req.user.userId);
    } else {
      // Admin
      query = `
        SELECT o.*, r.name as restaurant_name 
        FROM orders o
        JOIN restaurants r ON o.restaurant_id = r.id
        ORDER BY o.placed_at DESC
      `;
    }

    const [rows] = await pool.query(query, params);
    return res.status(200).json({ status: "success", data: rows });
  } catch (error) {
    console.error("Get orders error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
}

export async function getOrderById(req, res) {
  if (!req.user) {
    return res.status(401).json({ status: "error", message: "Unauthorized" });
  }

  const { id } = req.params;

  try {
    const [orderRows] = await pool.query(
      `SELECT o.*, r.name as restaurant_name, a.street_address, a.city, a.postal_code 
       FROM orders o
       JOIN restaurants r ON o.restaurant_id = r.id
       JOIN addresses a ON o.delivery_address_id = a.id
       WHERE o.id = ?`,
      [id],
    );

    const orders = orderRows;
    if (orders.length === 0) {
      return res
        .status(404)
        .json({ status: "error", message: "Order not found" });
    }

    const order = orders[0];

    // Fetch items
    const [itemRows] = await pool.query(
      `SELECT oi.*, m.name as item_name 
       FROM order_items oi
       JOIN menus m ON oi.menu_id = m.id
       WHERE oi.order_id = ?`,
      [id],
    );

    return res.status(200).json({
      status: "success",
      data: {
        ...order,
        items: itemRows,
      },
    });
  } catch (error) {
    console.error("Get order by id error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
}

export async function updateOrderStatus(req, res) {
  if (!req.user) {
    return res.status(401).json({ status: "error", message: "Unauthorized" });
  }

  const { id } = req.params;
  const { status, driverId } = req.body; // status: ENUM

  if (!status) {
    return res
      .status(400)
      .json({ status: "error", message: "Status is required" });
  }

  try {
    // 1. Fetch current order state
    const [rows] = await pool.query(
      `SELECT o.*, r.owner_id, r.commission_rate 
       FROM orders o 
       JOIN restaurants r ON o.restaurant_id = r.id 
       WHERE o.id = ?`,
      [id],
    );
    const orders = rows;
    if (orders.length === 0) {
      return res
        .status(404)
        .json({ status: "error", message: "Order not found" });
    }

    const order = orders[0];

    // Ownership and validation updates depending on status values
    let acceptedAt = order.accepted_at;
    let deliveredAt = order.delivered_at;
    let assignedDriverId = order.delivery_partner_id;

    if (status === "accepted") {
      if (
        req.user.role !== "restaurant_owner" ||
        order.owner_id !== req.user.userId
      ) {
        return res.status(403).json({
          status: "error",
          message: "Only the restaurant owner can accept the order",
        });
      }
      acceptedAt = new Date();
    } else if (status === "ready_for_pickup") {
      if (
        req.user.role !== "restaurant_owner" ||
        order.owner_id !== req.user.userId
      ) {
        return res
          .status(403)
          .json({ status: "error", message: "Forbidden: Access denied" });
      }
    } else if (status === "out_for_delivery") {
      // Driver accepts / starts transit
      assignedDriverId = req.user.userId;
      // Mark driver status in delivery_partners
      await pool.query(
        'UPDATE delivery_partners SET status = "delivering" WHERE id = ?',
        [req.user.userId],
      );
    } else if (status === "delivered") {
      if (
        order.delivery_partner_id !== req.user.userId &&
        req.user.role !== "admin"
      ) {
        return res.status(403).json({
          status: "error",
          message: "Only the assigned driver can complete this delivery",
        });
      }
      deliveredAt = new Date();
      // Free driver status
      await pool.query(
        'UPDATE delivery_partners SET status = "idle" WHERE id = ?',
        [req.user.userId],
      );
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Update order status
      await connection.query(
        `UPDATE orders 
         SET status = ?, accepted_at = ?, delivered_at = ?, delivery_partner_id = ? 
         WHERE id = ?`,
        [status, acceptedAt, deliveredAt, assignedDriverId, id],
      );

      // On delivery success, compute restaurant and driver payouts
      if (status === "delivered") {
        // Calculate restaurant earnings
        const commRate = parseFloat(order.commission_rate);
        const commAmt = parseFloat(
          (parseFloat(order.item_total) * (commRate / 100)).toFixed(2),
        );
        const netEarning = parseFloat(
          (parseFloat(order.item_total) - commAmt).toFixed(2),
        );
        const restEarningId = crypto.randomUUID();

        await connection.query(
          `INSERT INTO restaurant_earnings (id, restaurant_id, order_id, order_total, commission_amount, net_earning, is_paid) 
           VALUES (?, ?, ?, ?, ?, ?, FALSE)`,
          [
            restEarningId,
            order.restaurant_id,
            id,
            order.item_total,
            commAmt,
            netEarning,
          ],
        );

        // Calculate delivery earnings
        if (assignedDriverId) {
          const devEarningId = crypto.randomUUID();
          const deliveryFee = parseFloat(order.delivery_charges);
          await connection.query(
            `INSERT INTO delivery_earnings (id, driver_id, order_id, delivery_fee, tip_amount, total_earning, is_paid) 
             VALUES (?, ?, ?, ?, 0.00, ?, FALSE)`,
            [devEarningId, assignedDriverId, id, deliveryFee, deliveryFee],
          );

          // Credit driver wallet balance
          await connection.query(
            "UPDATE wallets SET balance = balance + ? WHERE user_id = ?",
            [deliveryFee, assignedDriverId],
          );

          const txId = crypto.randomUUID();
          const [walletRows] = await connection.query(
            "SELECT id FROM wallets WHERE user_id = ?",
            [assignedDriverId],
          );
          if (walletRows.length > 0) {
            await connection.query(
              `INSERT INTO wallet_transactions (id, wallet_id, amount, type, description, reference_type, reference_id) 
               VALUES (?, ?, ?, 'credit', 'Delivery Earning Deposited', 'delivery_payout', ?)`,
              [txId, walletRows[0].id, deliveryFee, id],
            );
          }
        }
      }

      await connection.commit();
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }

    // Emit live WebSocket notification
    notifyOrderStatus(id, status);

    return res.status(200).json({
      status: "success",
      message: `Order status updated to ${status}`,
    });
  } catch (error) {
    console.error("Update order status error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
}
