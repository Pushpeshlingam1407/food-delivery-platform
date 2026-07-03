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
