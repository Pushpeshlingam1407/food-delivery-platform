import pool from '../config/db.js';

export async function toggleFavorite(req, res) {
  if (!req.user) {
    return res.status(401).json({ status: 'error', message: 'Unauthorized' });
  }

  const { menuId } = req.body;

  if (!menuId) {
    return res.status(400).json({ status: 'error', message: 'Menu ID is required' });
  }

  try {
    const [rows] = await pool.query(
      'SELECT * FROM favorites WHERE user_id = ? AND menu_id = ?',
      [req.user.userId, menuId]
    );

    const favorites = rows;
    if (favorites.length > 0) {
      await pool.query(
        'DELETE FROM favorites WHERE user_id = ? AND menu_id = ?',
        [req.user.userId, menuId]
      );
      return res.status(200).json({ status: 'success', message: 'Removed from favorites', isFavorite: false });
    } else {
      await pool.query(
        'INSERT INTO favorites (user_id, menu_id) VALUES (?, ?)',
        [req.user.userId, menuId]
      );
      return res.status(200).json({ status: 'success', message: 'Added to favorites', isFavorite: true });
    }
  } catch (error) {
    console.error('Toggle favorite error:', error);
    return res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
}

export async function getFavorites(req, res) {
  if (!req.user) {
    return res.status(401).json({ status: 'error', message: 'Unauthorized' });
  }

  try {
    const [rows] = await pool.query(
      `SELECT m.*, r.name as restaurant_name FROM favorites f
       JOIN menus m ON f.menu_id = m.id
       JOIN restaurants r ON m.restaurant_id = r.id
       WHERE f.user_id = ? AND m.deleted_at IS NULL`,
      [req.user.userId]
    );

    return res.status(200).json({ status: 'success', data: rows });
  } catch (error) {
    console.error('Get favorites error:', error);
    return res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
}
