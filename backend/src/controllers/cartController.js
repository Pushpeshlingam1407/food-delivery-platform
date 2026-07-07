import crypto from "crypto";
import pool from "../config/db.js";

async function getOrCreateCart(userId) {
  const [rows] = await pool.query("SELECT id FROM carts WHERE user_id = ?", [
    userId,
  ]);
  const carts = rows;
  if (carts.length > 0) {
    return carts[0].id;
  }
  const newCartId = crypto.randomUUID();
  await pool.query("INSERT INTO carts (id, user_id) VALUES (?, ?)", [
    newCartId,
    userId,
  ]);
  return newCartId;
}

export async function getCart(req, res) {
  if (!req.user) {
    return res.status(401).json({ status: "error", message: "Unauthorized" });
  }

  const { coupon } = req.query;

  try {
    const cartId = await getOrCreateCart(req.user.userId);

    const [cartRows] = await pool.query(
      `SELECT c.id, c.restaurant_id, r.name as restaurant_name 
       FROM carts c 
       LEFT JOIN restaurants r ON c.restaurant_id = r.id 
       WHERE c.id = ?`,
      [cartId],
    );
    const cartMeta = cartRows[0];

    const [itemRows] = await pool.query(
      `SELECT ci.id as cart_item_id, ci.menu_id, ci.quantity, ci.customization_notes, 
              m.name, m.price, m.is_veg, m.is_available 
       FROM cart_items ci
       JOIN menus m ON ci.menu_id = m.id
       WHERE ci.cart_id = ?`,
      [cartId],
    );
    const items = itemRows;

    let itemTotal = 0;
    for (const item of items) {
      itemTotal += item.price * item.quantity;
    }

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
    if (itemTotal === 0) {
      deliveryCharges = 0;
    }

    const taxAmount = parseFloat((itemTotal * (taxRate / 100)).toFixed(2));
    let discountAmount = 0.0;
    let couponDetails = null;

    if (coupon && itemTotal > 0) {
      const [couponRows] = await pool.query(
        `SELECT * FROM coupons 
         WHERE code = ? AND is_active = TRUE AND CURDATE() BETWEEN DATE(start_date) AND DATE(end_date)`,
        [coupon],
      );
      const coupons = couponRows;
      if (coupons.length > 0) {
        const c = coupons[0];
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
          couponDetails = {
            code: c.code,
            discount_type: c.discount_type,
            discount_value: c.discount_value,
          };
        }
      }
    }

    const totalPayable = parseFloat(
      (itemTotal + deliveryCharges + taxAmount - discountAmount).toFixed(2),
    );

    return res.status(200).json({
      status: "success",
      data: {
        cartId,
        restaurant_id: cartMeta.restaurant_id,
        restaurant_name: cartMeta.restaurant_name,
        items,
        totals: {
          item_total: itemTotal,
          delivery_charges: deliveryCharges,
          tax_amount: taxAmount,
          discount_amount: discountAmount,
          total_payable: Math.max(0, totalPayable),
        },
        couponApplied: couponDetails,
      },
    });
  } catch (error) {
    console.error("Get cart error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
}

export async function addToCart(req, res) {
  if (!req.user) {
    return res.status(401).json({ status: "error", message: "Unauthorized" });
  }

  const { menuId, quantity = 1, customizationNotes } = req.body;

  if (!menuId || quantity <= 0) {
    return res.status(400).json({
      status: "error",
      message: "Valid menu ID and quantity are required",
    });
  }

  try {
    const cartId = await getOrCreateCart(req.user.userId);

    const [menuRows] = await pool.query(
      "SELECT restaurant_id, price, is_available FROM menus WHERE id = ?",
      [menuId],
    );
    const menus = menuRows;
    if (menus.length === 0) {
      return res
        .status(404)
        .json({ status: "error", message: "Menu item not found" });
    }

    const menuItem = menus[0];
    if (!menuItem.is_available) {
      return res.status(400).json({
        status: "error",
        message: "Menu item is currently unavailable",
      });
    }

    const [cartRows] = await pool.query(
      "SELECT restaurant_id FROM carts WHERE id = ?",
      [cartId],
    );
    const cart = cartRows[0];

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      if (cart.restaurant_id && cart.restaurant_id !== menuItem.restaurant_id) {
        connection.release();
        return res.status(409).json({
          status: "conflict",
          message:
            "Your cart contains items from another restaurant. Would you like to clear your cart and start a new order?",
        });
      }

      if (!cart.restaurant_id) {
        await connection.query(
          "UPDATE carts SET restaurant_id = ? WHERE id = ?",
          [menuItem.restaurant_id, cartId],
        );
      }

      const [existingItemRows] = await connection.query(
        "SELECT id, quantity FROM cart_items WHERE cart_id = ? AND menu_id = ?",
        [cartId, menuId],
      );
      const existingItems = existingItemRows;

      if (existingItems.length > 0) {
        const newQty = existingItems[0].quantity + quantity;
        await connection.query(
          "UPDATE cart_items SET quantity = ? WHERE id = ?",
          [newQty, existingItems[0].id],
        );
      } else {
        const cartItemId = crypto.randomUUID();
        await connection.query(
          "INSERT INTO cart_items (id, cart_id, menu_id, quantity, customization_notes) VALUES (?, ?, ?, ?, ?)",
          [cartItemId, cartId, menuId, quantity, customizationNotes],
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
      .json({ status: "success", message: "Item added to cart successfully" });
  } catch (error) {
    console.error("Add to cart error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
}

export async function updateCartItem(req, res) {
  if (!req.user) {
    return res.status(401).json({ status: "error", message: "Unauthorized" });
  }

  const { itemId } = req.params;
  const { quantity } = req.body;

  if (quantity === undefined || quantity < 0) {
    return res
      .status(400)
      .json({ status: "error", message: "Valid quantity is required" });
  }

  try {
    const cartId = await getOrCreateCart(req.user.userId);

    const [rows] = await pool.query(
      "SELECT * FROM cart_items WHERE id = ? AND cart_id = ?",
      [itemId, cartId],
    );
    const cartItems = rows;
    if (cartItems.length === 0) {
      return res
        .status(404)
        .json({ status: "error", message: "Item not found in your cart" });
    }

    if (quantity === 0) {
      await pool.query("DELETE FROM cart_items WHERE id = ?", [itemId]);
    } else {
      await pool.query("UPDATE cart_items SET quantity = ? WHERE id = ?", [
        quantity,
        itemId,
      ]);
    }

    const [countRows] = await pool.query(
      "SELECT COUNT(*) as count FROM cart_items WHERE cart_id = ?",
      [cartId],
    );
    if (countRows[0].count === 0) {
      await pool.query("UPDATE carts SET restaurant_id = NULL WHERE id = ?", [
        cartId,
      ]);
    }

    return res
      .status(200)
      .json({ status: "success", message: "Cart item updated" });
  } catch (error) {
    console.error("Update cart item error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
}

export async function removeFromCart(req, res) {
  if (!req.user) {
    return res.status(401).json({ status: "error", message: "Unauthorized" });
  }

  const { itemId } = req.params;

  try {
    const cartId = await getOrCreateCart(req.user.userId);

    const [rows] = await pool.query(
      "SELECT id FROM cart_items WHERE id = ? AND cart_id = ?",
      [itemId, cartId],
    );
    if (rows.length === 0) {
      return res
        .status(404)
        .json({ status: "error", message: "Item not found in your cart" });
    }

    await pool.query("DELETE FROM cart_items WHERE id = ?", [itemId]);

    const [countRows] = await pool.query(
      "SELECT COUNT(*) as count FROM cart_items WHERE cart_id = ?",
      [cartId],
    );
    if (countRows[0].count === 0) {
      await pool.query("UPDATE carts SET restaurant_id = NULL WHERE id = ?", [
        cartId,
      ]);
    }

    return res
      .status(200)
      .json({ status: "success", message: "Item removed from cart" });
  } catch (error) {
    console.error("Remove from cart error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
}

export async function clearCart(req, res) {
  if (!req.user) {
    return res.status(401).json({ status: "error", message: "Unauthorized" });
  }

  try {
    const cartId = await getOrCreateCart(req.user.userId);

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      await connection.query("DELETE FROM cart_items WHERE cart_id = ?", [
        cartId,
      ]);
      await connection.query(
        "UPDATE carts SET restaurant_id = NULL WHERE id = ?",
        [cartId],
      );

      await connection.commit();
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }

    return res
      .status(200)
      .json({ status: "success", message: "Cart cleared successfully" });
  } catch (error) {
    console.error("Clear cart error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
}
