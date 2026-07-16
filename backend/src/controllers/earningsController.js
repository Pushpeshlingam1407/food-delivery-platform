import pool from "../config/db.js";

export async function getEarningsLedger(req, res) {
  if (!req.user || req.user.role !== "delivery_partner") {
    return res.status(403).json({
      status: "error",
      message: "Forbidden: Delivery partner access required",
    });
  }

  const {
    preset = "all", // 'today', 'yesterday', 'week', 'month', 'all'
    startDate,
    endDate,
    category,
    page = 1,
    limit = 50,
  } = req.query;

  const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  const params = [req.user.userId];
  let query = `
    SELECT l.*, UPPER(SUBSTRING(REPLACE(l.order_id, '-', ''), 1, 8)) AS order_number
    FROM driver_earnings_ledger l
    WHERE l.driver_id = ?
  `;

  // Time filters
  if (preset === "today") {
    query += " AND DATE(l.created_at) = CURDATE()";
  } else if (preset === "yesterday") {
    query += " AND DATE(l.created_at) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)";
  } else if (preset === "week") {
    query += " AND l.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)";
  } else if (preset === "month") {
    query += " AND l.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)";
  } else if (startDate && endDate) {
    query += " AND l.created_at BETWEEN ? AND ?";
    params.push(startDate, endDate);
  }

  // Category filter
  if (category) {
    query += " AND l.category = ?";
    params.push(category);
  }

  // Order
  query += " ORDER BY l.created_at DESC LIMIT ? OFFSET ?";
  params.push(parseInt(limit, 10), offset);

  try {
    const [rows] = await pool.query(query, params);

    // Get total count
    const countParams = [req.user.userId];
    let countQuery = `
      SELECT COUNT(*) as total FROM driver_earnings_ledger l WHERE l.driver_id = ?
    `;
    if (preset === "today") {
      countQuery += " AND DATE(l.created_at) = CURDATE()";
    } else if (preset === "yesterday") {
      countQuery += " AND DATE(l.created_at) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)";
    } else if (preset === "week") {
      countQuery += " AND l.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)";
    } else if (preset === "month") {
      countQuery += " AND l.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)";
    } else if (startDate && endDate) {
      countQuery += " AND l.created_at BETWEEN ? AND ?";
      countParams.push(startDate, endDate);
    }
    if (category) {
      countQuery += " AND l.category = ?";
      countParams.push(category);
    }
    const [countRows] = await pool.query(countQuery, countParams);

    return res.status(200).json({
      status: "success",
      data: {
        transactions: rows,
        pagination: {
          total: countRows[0].total,
          page: parseInt(page, 10),
          limit: parseInt(limit, 10),
        },
      },
    });
  } catch (error) {
    console.error("Get earnings ledger error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
}

export async function getEarningsAnalytics(req, res) {
  if (!req.user || req.user.role !== "delivery_partner") {
    return res.status(403).json({
      status: "error",
      message: "Forbidden: Delivery partner access required",
    });
  }

  const driverId = req.user.userId;

  try {
    // 1. Total & category breakdown
    const [categoryRows] = await pool.query(
      `SELECT category, SUM(amount) as total, COUNT(*) as count 
       FROM driver_earnings_ledger 
       WHERE driver_id = ? AND type = 'credit'
       GROUP BY category`,
      [driverId],
    );

    const breakdown = {};
    let totalCredits = 0;
    categoryRows.forEach((row) => {
      breakdown[row.category] = parseFloat(row.total);
      totalCredits += parseFloat(row.total);
    });

    // 2. Online duration in hours
    const [sessionRows] = await pool.query(
      `SELECT login_time, logout_time FROM driver_online_sessions WHERE driver_id = ?`,
      [driverId],
    );
    let totalOnlineMs = 0;
    sessionRows.forEach((sess) => {
      const start = new Date(sess.login_time);
      const end = sess.logout_time ? new Date(sess.logout_time) : new Date();
      totalOnlineMs += end.getTime() - start.getTime();
    });
    const onlineHours = parseFloat((totalOnlineMs / (1000 * 60 * 60)).toFixed(2));

    // 3. Stats (AOV, Completion, Cancellations)
    const [orderStats] = await pool.query(
      `SELECT 
         COUNT(*) as total_assigned,
         SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as completed,
         SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled
       FROM orders 
       WHERE delivery_partner_id = ?`,
      [driverId],
    );

    const stats = orderStats[0];
    const totalAssigned = stats.total_assigned || 0;
    const completedCount = stats.completed || 0;
    const cancelledCount = stats.cancelled || 0;

    const completionRate = totalAssigned > 0 ? parseFloat(((completedCount / totalAssigned) * 100).toFixed(1)) : 100;
    const cancellationRate = totalAssigned > 0 ? parseFloat(((cancelledCount / totalAssigned) * 100).toFixed(1)) : 0;
    const acceptanceRate = 95.0; // Simulated constant for UI display

    // 4. Daily earnings trend (last 7 days)
    const [dailyTrendRows] = await pool.query(
      `SELECT DATE(created_at) as date, SUM(amount) as total 
       FROM driver_earnings_ledger 
       WHERE driver_id = ? AND type = 'credit' AND created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
       GROUP BY DATE(created_at)
       ORDER BY DATE(created_at) ASC`,
      [driverId],
    );

    const dailyTrend = dailyTrendRows.map((row) => ({
      date: row.date,
      amount: parseFloat(row.total),
    }));

    // 5. Zone coordinates heatmap simulation based on order delivery addresses
    const [zoneRows] = await pool.query(
      `SELECT a.city, COUNT(*) as count, SUM(de.total_earning) as total_earnings
       FROM orders o
       JOIN addresses a ON o.delivery_address_id = a.id
       JOIN delivery_earnings de ON de.order_id = o.id
       WHERE o.delivery_partner_id = ?
       GROUP BY a.city`,
      [driverId],
    );

    const heatmaps = zoneRows.map((row) => ({
      zone: row.city,
      count: row.count,
      earnings: parseFloat(row.total_earnings || 0),
    }));

    // 6. Hourly peak earning times (group by hour of day)
    const [hourlyRows] = await pool.query(
      `SELECT HOUR(created_at) as hour, SUM(amount) as total 
       FROM driver_earnings_ledger 
       WHERE driver_id = ? AND type = 'credit'
       GROUP BY HOUR(created_at)
       ORDER BY hour ASC`,
      [driverId],
    );

    const hourlyTrend = hourlyRows.map((row) => ({
      hour: `${row.hour}:00`,
      amount: parseFloat(row.total),
    }));

    return res.status(200).json({
      status: "success",
      data: {
        totalEarnings: totalCredits,
        onlineHours,
        idleHours: parseFloat(Math.max(0, onlineHours - (completedCount * 0.4)).toFixed(2)), // Idle calculation
        completionRate,
        cancellationRate,
        acceptanceRate,
        breakdown,
        dailyTrend,
        hourlyTrend,
        heatmaps,
      },
    });
  } catch (error) {
    console.error("Get earnings analytics error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
}
