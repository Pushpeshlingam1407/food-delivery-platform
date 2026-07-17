import pool from "../config/db.js";

export async function toggleFavorite(req, res) {
  if (!req.user) {
    return res.status(401).json({ status: "error", message: "Unauthorized" });
  }

  const { menuId } = req.body;

  if (!menuId) {
    return res
      .status(400)
      .json({ status: "error", message: "Menu ID is required" });
  }

  try {
    const [rows] = await pool.query(
      "SELECT * FROM favorites WHERE user_id = ? AND menu_id = ?",
      [req.user.userId, menuId],
    );

    const favorites = rows;
    if (favorites.length > 0) {
      await pool.query(
        "DELETE FROM favorites WHERE user_id = ? AND menu_id = ?",
        [req.user.userId, menuId],
      );
      return res.status(200).json({
        status: "success",
        message: "Removed from favorites",
        isFavorite: false,
      });
    } else {
      await pool.query(
        "INSERT INTO favorites (user_id, menu_id) VALUES (?, ?)",
        [req.user.userId, menuId],
      );
      return res.status(200).json({
        status: "success",
        message: "Added to favorites",
        isFavorite: true,
      });
    }
  } catch (error) {
    console.error("Toggle favorite error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
}

export async function getFavorites(req, res) {
  if (!req.user) {
    return res.status(401).json({ status: "error", message: "Unauthorized" });
  }

  try {
    const [rows] = await pool.query(
      `SELECT m.*, r.name as restaurant_name FROM favorites f
       JOIN menus m ON f.menu_id = m.id
       JOIN restaurants r ON m.restaurant_id = r.id
       WHERE f.user_id = ? AND m.deleted_at IS NULL`,
      [req.user.userId],
    );

    return res.status(200).json({ status: "success", data: rows });
  } catch (error) {
    console.error("Get favorites error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
}

export async function addFavoriteRestaurant(req, res) {
  if (!req.user) {
    return res.status(401).json({ status: "error", message: "Unauthorized" });
  }

  const { restaurant_id } = req.body;

  if (!restaurant_id) {
    return res
      .status(400)
      .json({ status: "error", message: "Restaurant ID is required" });
  }

  try {
    const [menuItems] = await pool.query(
      "SELECT id FROM menus WHERE restaurant_id = ? AND deleted_at IS NULL LIMIT 1",
      [restaurant_id],
    );

    if (menuItems.length === 0) {
      return res
        .status(404)
        .json({ status: "error", message: "No menu items found for this restaurant" });
    }

    const menuId = menuItems[0].id;
    await pool.query(
      "INSERT IGNORE INTO favorites (user_id, menu_id) VALUES (?, ?)",
      [req.user.userId, menuId],
    );

    return res.status(200).json({ status: "success", message: "Restaurant added to favorites" });
  } catch (error) {
    console.error("Add favorite restaurant error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
}

export async function removeFavoriteRestaurant(req, res) {
  if (!req.user) {
    return res.status(401).json({ status: "error", message: "Unauthorized" });
  }

  const { restaurant_id } = req.body;

  if (!restaurant_id) {
    return res
      .status(400)
      .json({ status: "error", message: "Restaurant ID is required" });
  }

  try {
    await pool.query(
      `DELETE f FROM favorites f
       JOIN menus m ON f.menu_id = m.id
       WHERE f.user_id = ? AND m.restaurant_id = ?`,
      [req.user.userId, restaurant_id],
    );

    return res.status(200).json({ status: "success", message: "Restaurant removed from favorites" });
  } catch (error) {
    console.error("Remove favorite restaurant error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
}
