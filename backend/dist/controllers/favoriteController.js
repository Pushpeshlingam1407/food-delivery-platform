"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleFavorite = toggleFavorite;
exports.getFavorites = getFavorites;
const db_js_1 = __importDefault(require("../config/db.js"));
async function toggleFavorite(req, res) {
    if (!req.user) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized' });
    }
    const { menuId } = req.body;
    if (!menuId) {
        return res.status(400).json({ status: 'error', message: 'Menu ID is required' });
    }
    try {
        // Check if it's already a favorite
        const [rows] = await db_js_1.default.query('SELECT * FROM favorites WHERE user_id = ? AND menu_id = ?', [req.user.userId, menuId]);
        const favorites = rows;
        if (favorites.length > 0) {
            // Remove favorite
            await db_js_1.default.query('DELETE FROM favorites WHERE user_id = ? AND menu_id = ?', [req.user.userId, menuId]);
            return res.status(200).json({ status: 'success', message: 'Removed from favorites', isFavorite: false });
        }
        else {
            // Add favorite
            await db_js_1.default.query('INSERT INTO favorites (user_id, menu_id) VALUES (?, ?)', [req.user.userId, menuId]);
            return res.status(200).json({ status: 'success', message: 'Added to favorites', isFavorite: true });
        }
    }
    catch (error) {
        console.error('Toggle favorite error:', error);
        return res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
}
async function getFavorites(req, res) {
    if (!req.user) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized' });
    }
    try {
        const [rows] = await db_js_1.default.query(`SELECT m.*, r.name as restaurant_name FROM favorites f
       JOIN menus m ON f.menu_id = m.id
       JOIN restaurants r ON m.restaurant_id = r.id
       WHERE f.user_id = ? AND m.deleted_at IS NULL`, [req.user.userId]);
        return res.status(200).json({ status: 'success', data: rows });
    }
    catch (error) {
        console.error('Get favorites error:', error);
        return res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
}
