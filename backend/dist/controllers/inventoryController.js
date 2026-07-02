"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateInventory = updateInventory;
const db_js_1 = __importDefault(require("../config/db.js"));
async function updateInventory(req, res) {
  if (!req.user) {
    return res.status(401).json({ status: "error", message: "Unauthorized" });
  }
  const { menuId } = req.params;
  const { available_quantity, unlimited } = req.body;
  if (available_quantity === undefined && unlimited === undefined) {
    return res
      .status(400)
      .json({ status: "error", message: "Missing update fields" });
  }
  try {
    // 1. Verify restaurant ownership for the menu item
    const [rows] = await db_js_1.default.query(
      `SELECT m.restaurant_id, r.owner_id FROM menus m 
       JOIN restaurants r ON m.restaurant_id = r.id 
       WHERE m.id = ?`,
      [menuId],
    );
    const records = rows;
    if (records.length === 0) {
      return res
        .status(404)
        .json({ status: "error", message: "Menu item not found" });
    }
    if (records[0].owner_id !== req.user.userId && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ status: "error", message: "Forbidden: Access denied" });
    }
    // 2. Perform updates
    const updates = [];
    const params = [];
    if (available_quantity !== undefined) {
      updates.push("available_quantity = ?");
      params.push(available_quantity);
    }
    if (unlimited !== undefined) {
      updates.push("unlimited = ?");
      params.push(unlimited);
    }
    params.push(menuId);
    await db_js_1.default.query(
      `UPDATE inventory SET ${updates.join(", ")} WHERE menu_id = ?`,
      params,
    );
    return res
      .status(200)
      .json({ status: "success", message: "Inventory updated successfully" });
  } catch (error) {
    console.error("Update inventory error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
}
