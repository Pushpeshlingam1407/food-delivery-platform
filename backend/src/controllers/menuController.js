import crypto from "crypto";
import pool from "../config/db.js";

async function verifyRestaurantOwner(userId, restaurantId) {
  const [rows] = await pool.query(
    "SELECT owner_id FROM restaurants WHERE id = ?",
    [restaurantId],
  );
  const restaurants = rows;
  return restaurants.length > 0 && restaurants[0].owner_id === userId;
}

export async function createMenuCategory(req, res) {
  if (!req.user) {
    return res.status(401).json({ status: "error", message: "Unauthorized" });
  }

  const { restaurant_id, name, sort_order = 0 } = req.body;

  if (!restaurant_id || !name) {
    return res.status(400).json({
      status: "error",
      message: "Restaurant ID and category name are required",
    });
  }

  try {
    const isOwner = await verifyRestaurantOwner(req.user.userId, restaurant_id);
    if (!isOwner && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ status: "error", message: "Forbidden: Access denied" });
    }

    const id = crypto.randomUUID();
    await pool.query(
      "INSERT INTO menu_categories (id, restaurant_id, name, sort_order, is_active) VALUES (?, ?, ?, ?, TRUE)",
      [id, restaurant_id, name, sort_order],
    );

    return res.status(201).json({ status: "success", data: { id, name } });
  } catch (error) {
    console.error("Create menu category error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
}

export async function getMenuCategories(req, res) {
  const { restaurantId } = req.params;

  try {
    const [rows] = await pool.query(
      "SELECT * FROM menu_categories WHERE restaurant_id = ? AND deleted_at IS NULL ORDER BY sort_order ASC",
      [restaurantId],
    );
    return res.status(200).json({ status: "success", data: rows });
  } catch (error) {
    console.error("Get menu categories error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
}

export async function updateMenuCategory(req, res) {
  if (!req.user) {
    return res.status(401).json({ status: "error", message: "Unauthorized" });
  }

  const { id } = req.params;
  const { name, sort_order, is_active } = req.body;

  try {
    const [rows] = await pool.query(
      "SELECT restaurant_id FROM menu_categories WHERE id = ?",
      [id],
    );
    const categories = rows;
    if (categories.length === 0) {
      return res
        .status(404)
        .json({ status: "error", message: "Category not found" });
    }

    const isOwner = await verifyRestaurantOwner(
      req.user.userId,
      categories[0].restaurant_id,
    );
    if (!isOwner && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ status: "error", message: "Forbidden: Access denied" });
    }

    const updates = [];
    const params = [];

    if (name) {
      updates.push("name = ?");
      params.push(name);
    }
    if (sort_order !== undefined) {
      updates.push("sort_order = ?");
      params.push(sort_order);
    }
    if (is_active !== undefined) {
      updates.push("is_active = ?");
      params.push(is_active);
    }

    if (updates.length === 0) {
      return res
        .status(400)
        .json({ status: "error", message: "No fields to update" });
    }

    params.push(id);
    await pool.query(
      `UPDATE menu_categories SET ${updates.join(", ")} WHERE id = ?`,
      params,
    );

    return res.status(200).json({
      status: "success",
      message: "Menu category updated successfully",
    });
  } catch (error) {
    console.error("Update menu category error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
}

export async function deleteMenuCategory(req, res) {
  if (!req.user) {
    return res.status(401).json({ status: "error", message: "Unauthorized" });
  }

  const { id } = req.params;

  try {
    const [rows] = await pool.query(
      "SELECT restaurant_id FROM menu_categories WHERE id = ?",
      [id],
    );
    const categories = rows;
    if (categories.length === 0) {
      return res
        .status(404)
        .json({ status: "error", message: "Category not found" });
    }

    const isOwner = await verifyRestaurantOwner(
      req.user.userId,
      categories[0].restaurant_id,
    );
    if (!isOwner && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ status: "error", message: "Forbidden: Access denied" });
    }

    await pool.query(
      "UPDATE menu_categories SET deleted_at = NOW() WHERE id = ?",
      [id],
    );
    return res.status(200).json({
      status: "success",
      message: "Menu category soft-deleted successfully",
    });
  } catch (error) {
    console.error("Delete menu category error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
}

export async function createMenuItem(req, res) {
  if (!req.user) {
    return res.status(401).json({ status: "error", message: "Unauthorized" });
  }

  const {
    restaurant_id,
    category_id,
    name,
    description,
    price,
    is_veg = true,
    preparation_time = 15,
    available_quantity = 0,
    unlimited = true,
    image_url,
  } = req.body;

  if (!restaurant_id || !category_id || !name || price === undefined) {
    return res
      .status(400)
      .json({ status: "error", message: "Missing required menu fields" });
  }

  try {
    const isOwner = await verifyRestaurantOwner(req.user.userId, restaurant_id);
    if (!isOwner && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ status: "error", message: "Forbidden: Access denied" });
    }

    const menuId = crypto.randomUUID();
    const inventoryId = crypto.randomUUID();

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      await connection.query(
        `INSERT INTO menus (id, restaurant_id, category_id, name, description, price, is_veg, is_available, preparation_time) 
         VALUES (?, ?, ?, ?, ?, ?, ?, TRUE, ?)`,
        [
          menuId,
          restaurant_id,
          category_id,
          name,
          description,
          price,
          is_veg,
          preparation_time,
        ],
      );

      await connection.query(
        "INSERT INTO inventory (id, menu_id, available_quantity, unlimited) VALUES (?, ?, ?, ?)",
        [inventoryId, menuId, available_quantity, unlimited],
      );

      if (image_url) {
        const imageId = crypto.randomUUID();
        await connection.query(
          "INSERT INTO menu_images (id, menu_id, image_url, is_primary) VALUES (?, ?, ?, TRUE)",
          [imageId, menuId, image_url],
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
      .status(201)
      .json({ status: "success", data: { menuId, name, price } });
  } catch (error) {
    console.error("Create menu item error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
}

export async function getMenuItems(req, res) {
  const { restaurantId } = req.params;
  const { categoryId, isVeg } = req.query;

  try {
    let query = `
      SELECT m.*, i.available_quantity, i.unlimited, mi.image_url 
      FROM menus m 
      LEFT JOIN inventory i ON m.id = i.menu_id 
      LEFT JOIN menu_images mi ON m.id = mi.menu_id AND mi.is_primary = TRUE 
      WHERE m.restaurant_id = ? AND m.deleted_at IS NULL
    `;
    const params = [restaurantId];

    if (categoryId) {
      query += " AND m.category_id = ?";
      params.push(categoryId);
    }

    if (isVeg !== undefined) {
      query += " AND m.is_veg = ?";
      params.push(isVeg === "true" ? 1 : 0);
    }

    const [rows] = await pool.query(query, params);
    return res.status(200).json({ status: "success", data: rows });
  } catch (error) {
    console.error("Get menu items error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
}

export async function updateMenuItem(req, res) {
  if (!req.user) {
    return res.status(401).json({ status: "error", message: "Unauthorized" });
  }

  const { id } = req.params;
  const { name, description, price, is_veg, is_available, preparation_time } =
    req.body;

  try {
    const [rows] = await pool.query(
      "SELECT restaurant_id FROM menus WHERE id = ?",
      [id],
    );
    const menus = rows;
    if (menus.length === 0) {
      return res
        .status(404)
        .json({ status: "error", message: "Menu item not found" });
    }

    const isOwner = await verifyRestaurantOwner(
      req.user.userId,
      menus[0].restaurant_id,
    );
    if (!isOwner && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ status: "error", message: "Forbidden: Access denied" });
    }

    const updates = [];
    const params = [];

    if (name) {
      updates.push("name = ?");
      params.push(name);
    }
    if (description) {
      updates.push("description = ?");
      params.push(description);
    }
    if (price !== undefined) {
      updates.push("price = ?");
      params.push(price);
    }
    if (is_veg !== undefined) {
      updates.push("is_veg = ?");
      params.push(is_veg);
    }
    if (is_available !== undefined) {
      updates.push("is_available = ?");
      params.push(is_available);
    }
    if (preparation_time !== undefined) {
      updates.push("preparation_time = ?");
      params.push(preparation_time);
    }

    if (updates.length === 0) {
      return res
        .status(400)
        .json({ status: "error", message: "No fields to update" });
    }

    params.push(id);
    await pool.query(
      `UPDATE menus SET ${updates.join(", ")} WHERE id = ?`,
      params,
    );

    return res
      .status(200)
      .json({ status: "success", message: "Menu item updated successfully" });
  } catch (error) {
    console.error("Update menu item error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
}

export async function deleteMenuItem(req, res) {
  if (!req.user) {
    return res.status(401).json({ status: "error", message: "Unauthorized" });
  }

  const { id } = req.params;

  try {
    const [rows] = await pool.query(
      "SELECT restaurant_id FROM menus WHERE id = ?",
      [id],
    );
    const menus = rows;
    if (menus.length === 0) {
      return res
        .status(404)
        .json({ status: "error", message: "Menu item not found" });
    }

    const isOwner = await verifyRestaurantOwner(
      req.user.userId,
      menus[0].restaurant_id,
    );
    if (!isOwner && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ status: "error", message: "Forbidden: Access denied" });
    }

    await pool.query("UPDATE menus SET deleted_at = NOW() WHERE id = ?", [id]);
    return res.status(200).json({
      status: "success",
      message: "Menu item soft-deleted successfully",
    });
  } catch (error) {
    console.error("Delete menu item error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
}
