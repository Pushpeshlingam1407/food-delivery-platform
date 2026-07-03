import pool from '../config/db.js';

export async function toggleDriverStatus(req, res) {
  if (!req.user || req.user.role !== 'delivery_partner') {
    return res.status(403).json({ status: 'error', message: 'Forbidden: Delivery partner access required' });
  }

  const { is_online, vehicle_number, vehicle_type, license_number } = req.body;

  if (is_online === undefined) {
    return res.status(400).json({ status: 'error', message: 'is_online status is required' });
  }

  try {
    // 1. Fetch current profile
    const [rows] = await pool.query('SELECT * FROM delivery_partners WHERE id = ?', [req.user.userId]);
    const driver = rows;

    const updates = [];
    const params = [];

    updates.push('is_online = ?');
    params.push(is_online ? 1 : 0);

    if (vehicle_number) { updates.push('vehicle_number = ?'); params.push(vehicle_number); }
    if (vehicle_type) { updates.push('vehicle_type = ?'); params.push(vehicle_type); }
    if (license_number) { updates.push('license_number = ?'); params.push(license_number); }

    params.push(req.user.userId);

    if (driver.length === 0) {
      // Driver profile entry missing, let's create it
      if (!vehicle_number || !vehicle_type || !license_number) {
        return res.status(400).json({ status: 'error', message: 'Vehicle and license details are required to initialize profile' });
      }
      await pool.query(
        `INSERT INTO delivery_partners (id, vehicle_number, vehicle_type, license_number, is_online, status) 
         VALUES (?, ?, ?, ?, ?, 'idle')`,
        [req.user.userId, vehicle_number, vehicle_type, license_number, is_online ? 1 : 0]
      );
    } else {
      await pool.query(
        `UPDATE delivery_partners SET ${updates.join(', ')} WHERE id = ?`,
        params
      );
    }

    return res.status(200).json({ status: 'success', message: 'Delivery status updated successfully' });
  } catch (error) {
    console.error('Toggle driver status error:', error);
    return res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
}

export async function logDriverLocation(req, res) {
  if (!req.user || req.user.role !== 'delivery_partner') {
    return res.status(403).json({ status: 'error', message: 'Forbidden: Delivery partner access required' });
  }

  const { latitude, longitude, bearing } = req.body;

  if (latitude === undefined || longitude === undefined) {
    return res.status(400).json({ status: 'error', message: 'Coordinates are required' });
  }

  try {
    await pool.query(
      `INSERT INTO driver_locations (driver_id, latitude, longitude, bearing) 
       VALUES (?, ?, ?, ?)`,
      [req.user.userId, latitude, longitude, bearing || null]
    );

    return res.status(201).json({ status: 'success', message: 'Location coordinate logged successfully' });
  } catch (error) {
    console.error('Log driver location error:', error);
    return res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
}
