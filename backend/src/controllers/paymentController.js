import crypto from "crypto";
import pool from "../config/db.js";
import { notifyOrderStatus } from "../config/socket.js";

export async function verifyPayment(req, res) {
  const { orderId, gatewayTransactionId, gatewayResponse = {} } = req.body;

  if (!orderId || !gatewayTransactionId) {
    return res.status(400).json({
      status: "error",
      message: "Order ID and Gateway Transaction ID are required",
    });
  }

  try {
    // 1. Fetch payment record
    const [rows] = await pool.query(
      "SELECT * FROM payments WHERE order_id = ?",
      [orderId],
    );
    const payments = rows;
    if (payments.length === 0) {
      return res
        .status(404)
        .json({ status: "error", message: "Payment record not found" });
    }

    const payment = payments[0];

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // 2. Update payment status to completed
      await connection.query(
        'UPDATE payments SET payment_status = "completed" WHERE id = ?',
        [payment.id],
      );

      // 3. Create payment transaction entry
      const txId = crypto.randomUUID();
      await connection.query(
        `INSERT INTO payment_transactions (id, payment_id, gateway_transaction_id, gateway_response, status) 
         VALUES (?, ?, ?, ?, 'captured')`,
        [
          txId,
          payment.id,
          gatewayTransactionId,
          JSON.stringify(gatewayResponse),
        ],
      );

      await connection.commit();
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }

    // Trigger websocket notify
    notifyOrderStatus(orderId, "accepted");

    return res.status(200).json({
      status: "success",
      message: "Payment verified and transaction logged successfully",
    });
  } catch (error) {
    console.error("Verify payment error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
}
