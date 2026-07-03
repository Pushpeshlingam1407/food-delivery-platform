import crypto from "crypto";
import pool from "../config/db.js";

export async function processRefund(req, res) {
  if (!req.user || req.user.role !== "admin") {
    return res
      .status(403)
      .json({ status: "error", message: "Forbidden: Access denied" });
  }

  const { orderId, reason } = req.body;

  if (!orderId || !reason) {
    return res.status(400).json({
      status: "error",
      message: "Order ID and refund reason are required",
    });
  }

  try {
    // 1. Fetch order & payment records
    const [orderRows] = await pool.query(
      "SELECT user_id, status, total_payable FROM orders WHERE id = ?",
      [orderId],
    );
    if (orderRows.length === 0) {
      return res
        .status(404)
        .json({ status: "error", message: "Order not found" });
    }

    const order = orderRows[0];

    const [paymentRows] = await pool.query(
      "SELECT id, payment_status, amount FROM payments WHERE order_id = ?",
      [orderId],
    );
    if (paymentRows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Payment record not found for this order",
      });
    }

    const payment = paymentRows[0];
    if (payment.payment_status !== "completed") {
      return res.status(400).json({
        status: "error",
        message: "Only fully completed payments can be refunded",
      });
    }

    // 2. Perform Refund transaction
    const refundId = crypto.randomUUID();
    const txId = crypto.randomUUID();

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Update Order Status to cancelled
      await connection.query(
        "UPDATE orders SET status = 'cancelled', cancellation_reason = ? WHERE id = ?",
        [reason, orderId],
      );

      // Update Payment Status to refunded
      await connection.query(
        "UPDATE payments SET payment_status = 'refunded' WHERE id = ?",
        [payment.id],
      );

      // Insert Refund record
      await connection.query(
        `INSERT INTO refunds (id, order_id, payment_id, amount, reason, status) 
         VALUES (?, ?, ?, ?, ?, 'processed')`,
        [refundId, orderId, payment.id, payment.amount, reason],
      );

      // Fetch user's wallet (create if missing)
      const [walletRows] = await connection.query(
        "SELECT id FROM wallets WHERE user_id = ? FOR UPDATE",
        [order.user_id],
      );
      let walletId;
      if (walletRows.length === 0) {
        walletId = crypto.randomUUID();
        await connection.query(
          "INSERT INTO wallets (id, user_id, balance) VALUES (?, ?, ?)",
          [walletId, order.user_id, payment.amount],
        );
      } else {
        walletId = walletRows[0].id;
        await connection.query(
          "UPDATE wallets SET balance = balance + ? WHERE id = ?",
          [payment.amount, walletId],
        );
      }

      // Log wallet transaction
      await connection.query(
        `INSERT INTO wallet_transactions (id, wallet_id, amount, type, description, reference_type, reference_id) 
         VALUES (?, ?, ?, 'credit', 'Order Refund Credited', 'refund', ?)`,
        [txId, walletId, payment.amount, refundId],
      );

      await connection.commit();
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }

    return res.status(200).json({
      status: "success",
      message:
        "Order refunded successfully. Refunded amount credited to customer wallet.",
    });
  } catch (error) {
    console.error("Process refund error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
}
