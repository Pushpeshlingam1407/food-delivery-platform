import crypto from "crypto";
import pool from "../config/db.js";

export async function submitRating(req, res) {
  if (!req.user) {
    return res.status(401).json({ status: "error", message: "Unauthorized" });
  }

  const {
    orderId,
    restaurantRating,
    deliveryRating,
    restaurantReview,
    deliveryReview,
  } = req.body;

  if (!orderId) {
    return res
      .status(400)
      .json({ status: "error", message: "Order ID is required" });
  }

  try {
    // Verify order exists, belongs to user, and is delivered
    const [orderRows] = await pool.query(
      "SELECT status, user_id FROM orders WHERE id = ?",
      [orderId],
    );
    const orders = orderRows;
    if (orders.length === 0) {
      return res
        .status(404)
        .json({ status: "error", message: "Order not found" });
    }

    if (orders[0].user_id !== req.user.userId) {
      return res.status(403).json({
        status: "error",
        message: "Forbidden: You did not place this order",
      });
    }

    if (orders[0].status !== "delivered") {
      return res.status(400).json({
        status: "error",
        message: "You can only rate completed deliveries",
      });
    }

    const ratingId = crypto.randomUUID();
    const reviewId = crypto.randomUUID();

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Check if rating already exists
      const [existing] = await connection.query(
        "SELECT id FROM ratings WHERE order_id = ?",
        [orderId],
      );
      if (existing.length > 0) {
        connection.release();
        return res.status(409).json({
          status: "error",
          message: "You have already rated this order",
        });
      }

      await connection.query(
        `INSERT INTO ratings (id, order_id, user_id, restaurant_rating, delivery_rating) 
         VALUES (?, ?, ?, ?, ?)`,
        [
          ratingId,
          orderId,
          req.user.userId,
          restaurantRating || null,
          deliveryRating || null,
        ],
      );

      if (restaurantReview || deliveryReview) {
        await connection.query(
          `INSERT INTO reviews (id, rating_id, restaurant_review, delivery_review) 
           VALUES (?, ?, ?, ?)`,
          [
            reviewId,
            ratingId,
            restaurantReview || null,
            deliveryReview || null,
          ],
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
      .json({ status: "success", message: "Rating submitted successfully" });
  } catch (error) {
    console.error("Submit rating error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
}

export async function getRestaurantRatings(req, res) {
  const { restaurantId } = req.params;
  try {
    const [rows] = await pool.query(
      `SELECT r.restaurant_rating, r.delivery_rating, rev.restaurant_review, rev.delivery_review, r.created_at, u.first_name, u.last_name
       FROM ratings r
       JOIN orders o ON r.order_id = o.id
       LEFT JOIN reviews rev ON rev.rating_id = r.id
       JOIN users u ON r.user_id = u.id
       WHERE o.restaurant_id = ?
       ORDER BY r.created_at DESC`,
      [restaurantId]
    );

    const ratingsCount = rows.filter(item => item.restaurant_rating !== null).length;
    const ratingsSum = rows.reduce((sum, item) => sum + (parseFloat(item.restaurant_rating) || 0), 0);
    const averageRating = ratingsCount > 0 ? parseFloat((ratingsSum / ratingsCount).toFixed(1)) : 0;

    return res.status(200).json({
      status: "success",
      data: {
        reviews: rows,
        average_rating: averageRating,
        total_reviews: rows.length
      }
    });
  } catch (error) {
    console.error("Get restaurant ratings error:", error);
    return res.status(500).json({ status: "error", message: "Internal server error" });
  }
}
