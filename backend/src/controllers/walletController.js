import crypto from "crypto";
import pool from "../config/db.js";

export async function getWalletBalance(req, res) {
  if (!req.user) {
    return res.status(401).json({ status: "error", message: "Unauthorized" });
  }

  try {
    // 1. Get wallet metadata
    const [rows] = await pool.query("SELECT * FROM wallets WHERE user_id = ?", [
      req.user.userId,
    ]);
    const wallets = rows;
    if (wallets.length === 0) {
      return res
        .status(404)
        .json({ status: "error", message: "Wallet not found" });
    }

    const wallet = wallets[0];

    // 2. Get transaction history
    const [txRows] = await pool.query(
      "SELECT * FROM wallet_transactions WHERE wallet_id = ? ORDER BY created_at DESC LIMIT 50",
      [wallet.id],
    );

    return res.status(200).json({
      status: "success",
      data: {
        id: wallet.id,
        balance: parseFloat(wallet.balance),
        currency: wallet.currency,
        transactions: txRows,
      },
    });
  } catch (error) {
    console.error("Get wallet balance error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
}

export async function addWalletFunds(req, res) {
  if (!req.user) {
    return res.status(401).json({ status: "error", message: "Unauthorized" });
  }

  const { amount, description = "Funds Added" } = req.body;

  if (!amount || amount <= 0) {
    return res
      .status(400)
      .json({ status: "error", message: "Valid deposit amount is required" });
  }

  try {
    const [rows] = await pool.query(
      "SELECT id FROM wallets WHERE user_id = ?",
      [req.user.userId],
    );
    const wallets = rows;
    if (wallets.length === 0) {
      return res
        .status(404)
        .json({ status: "error", message: "Wallet not found" });
    }

    const walletId = wallets[0].id;
    const txId = crypto.randomUUID();

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      await connection.query(
        "UPDATE wallets SET balance = balance + ? WHERE id = ?",
        [amount, walletId],
      );
      await connection.query(
        `INSERT INTO wallet_transactions (id, wallet_id, amount, type, description, reference_type, reference_id) 
         VALUES (?, ?, ?, 'credit', ?, 'admin_adjustment', ?)`,
        [txId, walletId, amount, description, txId],
      );

      await connection.commit();
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }

    return res
      .status(200)
      .json({ status: "success", message: "Funds added successfully" });
  } catch (error) {
    console.error("Add wallet funds error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
}

export async function requestPayout(req, res) {
  if (!req.user) {
    return res.status(401).json({ status: "error", message: "Unauthorized" });
  }

  const { amount } = req.body;

  if (!amount || amount <= 0) {
    return res
      .status(400)
      .json({
        status: "error",
        message: "Valid withdrawal amount is required",
      });
  }

  try {
    const [rows] = await pool.query(
      "SELECT id, balance FROM wallets WHERE user_id = ?",
      [req.user.userId],
    );
    const wallets = rows;
    if (wallets.length === 0) {
      return res
        .status(404)
        .json({ status: "error", message: "Wallet not found" });
    }

    const wallet = wallets[0];
    if (parseFloat(wallet.balance) < amount) {
      return res
        .status(400)
        .json({
          status: "error",
          message: "Insufficient balance for withdrawal request",
        });
    }

    const txId = crypto.randomUUID();

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      await connection.query(
        "UPDATE wallets SET balance = balance - ? WHERE id = ?",
        [amount, wallet.id],
      );
      await connection.query(
        `INSERT INTO wallet_transactions (id, wallet_id, amount, type, description, reference_type, reference_id) 
         VALUES (?, ?, ?, 'debit', 'Wallet Withdrawal Payout', 'admin_adjustment', ?)`,
        [txId, wallet.id, -amount, txId],
      );

      await connection.commit();
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }

    return res
      .status(200)
      .json({
        status: "success",
        message: "Payout withdrawal completed successfully",
      });
  } catch (error) {
    console.error("Request payout error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
}
