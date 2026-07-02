"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRestaurant = createRestaurant;
exports.getRestaurants = getRestaurants;
exports.getRestaurantById = getRestaurantById;
exports.updateRestaurant = updateRestaurant;
exports.deleteRestaurant = deleteRestaurant;
const crypto_1 = __importDefault(require("crypto"));
const db_js_1 = __importDefault(require("../config/db.js"));
async function createRestaurant(req, res) {
    if (!req.user) {
        return res.status(401).json({ status: "error", message: "Unauthorized" });
    }
    const { name, description, street_address, landmark, city, state, postal_code, latitude = 0, longitude = 0, opening_time, closing_time, commission_rate = 10.0, average_delivery_time = 30, categories = [], // Array of category IDs
     } = req.body;
    if (!name ||
        !street_address ||
        !city ||
        !state ||
        !postal_code ||
        !opening_time ||
        !closing_time) {
        return res
            .status(400)
            .json({ status: "error", message: "Missing required profile fields" });
    }
    try {
        const restaurantId = crypto_1.default.randomUUID();
        const addressId = crypto_1.default.randomUUID();
        const connection = await db_js_1.default.getConnection();
        try {
            await connection.beginTransaction();
            // 1. Insert address
            await connection.query(`INSERT INTO addresses (id, user_id, address_type, street_address, landmark, city, state, postal_code, latitude, longitude, is_default) 
         VALUES (?, ?, 'restaurant', ?, ?, ?, ?, ?, ?, ?, FALSE)`, [
                addressId,
                req.user.userId,
                street_address,
                landmark,
                city,
                state,
                postal_code,
                latitude,
                longitude,
            ]);
            // 2. Insert restaurant
            await connection.query(`INSERT INTO restaurants (id, owner_id, name, description, address_id, commission_rate, average_delivery_time, is_active, is_verified, status, opening_time, closing_time) 
         VALUES (?, ?, ?, ?, ?, ?, ?, TRUE, TRUE, 'open', ?, ?)`, [
                restaurantId,
                req.user.userId,
                name,
                description,
                addressId,
                commission_rate,
                average_delivery_time,
                opening_time,
                closing_time,
            ]);
            // 3. Map categories
            for (const catId of categories) {
                await connection.query("INSERT INTO restaurant_category_mapping (restaurant_id, category_id) VALUES (?, ?)", [restaurantId, catId]);
            }
            await connection.commit();
        }
        catch (err) {
            await connection.rollback();
            throw err;
        }
        finally {
            connection.release();
        }
        return res.status(201).json({
            status: "success",
            message: "Restaurant created successfully",
            data: { restaurantId, name, status: "open" },
        });
    }
    catch (error) {
        console.error("Create restaurant error:", error);
        return res
            .status(500)
            .json({ status: "error", message: "Internal server error" });
    }
}
async function getRestaurants(req, res) {
    const { search, categoryId, status } = req.query;
    try {
        let query = `
      SELECT r.*, a.street_address, a.city, a.latitude, a.longitude 
      FROM restaurants r 
      LEFT JOIN addresses a ON r.address_id = a.id 
      WHERE r.deleted_at IS NULL
    `;
        const params = [];
        if (status) {
            query += " AND r.status = ?";
            params.push(status);
        }
        if (categoryId) {
            query +=
                " AND r.id IN (SELECT restaurant_id FROM restaurant_category_mapping WHERE category_id = ?)";
            params.push(parseInt(categoryId, 10));
        }
        if (search) {
            query += " AND (r.name LIKE ? OR r.description LIKE ?)";
            params.push(`%${search}%`, `%${search}%`);
        }
        const [rows] = await db_js_1.default.query(query, params);
        return res.status(200).json({ status: "success", data: rows });
    }
    catch (error) {
        console.error("Get restaurants error:", error);
        return res
            .status(500)
            .json({ status: "error", message: "Internal server error" });
    }
}
async function getRestaurantById(req, res) {
    const { id } = req.params;
    try {
        const [restaurantRows] = await db_js_1.default.query(`SELECT r.*, a.street_address, a.landmark, a.city, a.state, a.postal_code, a.latitude, a.longitude 
       FROM restaurants r 
       LEFT JOIN addresses a ON r.address_id = a.id 
       WHERE r.id = ? AND r.deleted_at IS NULL`, [id]);
        const restaurants = restaurantRows;
        if (restaurants.length === 0) {
            return res
                .status(404)
                .json({ status: "error", message: "Restaurant not found" });
        }
        const restaurant = restaurants[0];
        // Fetch categories
        const [categoryRows] = await db_js_1.default.query(`SELECT rc.* FROM restaurant_categories rc
       JOIN restaurant_category_mapping rcm ON rc.id = rcm.category_id
       WHERE rcm.restaurant_id = ?`, [id]);
        return res.status(200).json({
            status: "success",
            data: {
                ...restaurant,
                categories: categoryRows,
            },
        });
    }
    catch (error) {
        console.error("Get restaurant by id error:", error);
        return res
            .status(500)
            .json({ status: "error", message: "Internal server error" });
    }
}
async function updateRestaurant(req, res) {
    if (!req.user) {
        return res.status(401).json({ status: "error", message: "Unauthorized" });
    }
    const { id } = req.params;
    const { name, description, status, opening_time, closing_time, average_delivery_time, } = req.body;
    try {
        // Check ownership
        const [rows] = await db_js_1.default.query("SELECT owner_id FROM restaurants WHERE id = ?", [id]);
        const restaurants = rows;
        if (restaurants.length === 0) {
            return res
                .status(404)
                .json({ status: "error", message: "Restaurant not found" });
        }
        if (restaurants[0].owner_id !== req.user.userId &&
            req.user.role !== "admin") {
            return res
                .status(403)
                .json({
                status: "error",
                message: "Forbidden: You do not own this restaurant",
            });
        }
        const updateFields = [];
        const params = [];
        if (name) {
            updateFields.push("name = ?");
            params.push(name);
        }
        if (description) {
            updateFields.push("description = ?");
            params.push(description);
        }
        if (status) {
            updateFields.push("status = ?");
            params.push(status);
        }
        if (opening_time) {
            updateFields.push("opening_time = ?");
            params.push(opening_time);
        }
        if (closing_time) {
            updateFields.push("closing_time = ?");
            params.push(closing_time);
        }
        if (average_delivery_time) {
            updateFields.push("average_delivery_time = ?");
            params.push(average_delivery_time);
        }
        if (updateFields.length === 0) {
            return res
                .status(400)
                .json({ status: "error", message: "No fields to update" });
        }
        params.push(id);
        await db_js_1.default.query(`UPDATE restaurants SET ${updateFields.join(", ")} WHERE id = ?`, params);
        return res
            .status(200)
            .json({ status: "success", message: "Restaurant updated successfully" });
    }
    catch (error) {
        console.error("Update restaurant error:", error);
        return res
            .status(500)
            .json({ status: "error", message: "Internal server error" });
    }
}
async function deleteRestaurant(req, res) {
    if (!req.user) {
        return res.status(401).json({ status: "error", message: "Unauthorized" });
    }
    const { id } = req.params;
    try {
        // Check ownership
        const [rows] = await db_js_1.default.query("SELECT owner_id FROM restaurants WHERE id = ?", [id]);
        const restaurants = rows;
        if (restaurants.length === 0) {
            return res
                .status(404)
                .json({ status: "error", message: "Restaurant not found" });
        }
        if (restaurants[0].owner_id !== req.user.userId &&
            req.user.role !== "admin") {
            return res
                .status(403)
                .json({ status: "error", message: "Forbidden: Access denied" });
        }
        await db_js_1.default.query("UPDATE restaurants SET deleted_at = NOW() WHERE id = ?", [
            id,
        ]);
        return res
            .status(200)
            .json({
            status: "success",
            message: "Restaurant soft-deleted successfully",
        });
    }
    catch (error) {
        console.error("Delete restaurant error:", error);
        return res
            .status(500)
            .json({ status: "error", message: "Internal server error" });
    }
}
