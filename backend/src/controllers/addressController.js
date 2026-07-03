import crypto from "crypto";
import pool from "../config/db.js";

export async function getAddresses(req, res) {
  if (!req.user) {
    return res.status(401).json({ status: "error", message: "Unauthorized" });
  }

  try {
    const [rows] = await pool.query(
      "SELECT * FROM addresses WHERE user_id = ? AND deleted_at IS NULL ORDER BY is_default DESC, created_at DESC",
      [req.user.userId],
    );
    return res.status(200).json({ status: "success", data: rows });
  } catch (error) {
    console.error("Get addresses error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
}

export async function createAddress(req, res) {
  if (!req.user) {
    return res.status(401).json({ status: "error", message: "Unauthorized" });
  }

  const {
    address_type,
    street_address,
    landmark,
    city,
    state,
    postal_code,
    latitude,
    longitude,
    is_default,
  } = req.body;

  if (
    !street_address ||
    !city ||
    !state ||
    !postal_code ||
    latitude === undefined ||
    longitude === undefined
  ) {
    return res
      .status(400)
      .json({ status: "error", message: "Missing required address fields" });
  }

  const addressId = crypto.randomUUID();
  const defaultFlag = is_default ? 1 : 0;

  try {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      if (defaultFlag === 1) {
        await connection.query(
          "UPDATE addresses SET is_default = FALSE WHERE user_id = ?",
          [req.user.userId],
        );
      }

      await connection.query(
        `INSERT INTO addresses (id, user_id, address_type, street_address, landmark, city, state, postal_code, latitude, longitude, is_default) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          addressId,
          req.user.userId,
          address_type || "home",
          street_address,
          landmark || null,
          city,
          state,
          postal_code,
          latitude,
          longitude,
          defaultFlag,
        ],
      );

      await connection.commit();
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }

    return res.status(201).json({
      status: "success",
      message: "Address created successfully",
      data: { id: addressId },
    });
  } catch (error) {
    console.error("Create address error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
}

export async function updateAddress(req, res) {
  if (!req.user) {
    return res.status(401).json({ status: "error", message: "Unauthorized" });
  }

  const { id } = req.params;
  const {
    address_type,
    street_address,
    landmark,
    city,
    state,
    postal_code,
    latitude,
    longitude,
    is_default,
  } = req.body;

  try {
    const [rows] = await pool.query(
      "SELECT user_id FROM addresses WHERE id = ? AND deleted_at IS NULL",
      [id],
    );
    if (rows.length === 0) {
      return res
        .status(404)
        .json({ status: "error", message: "Address not found" });
    }

    if (rows[0].user_id !== req.user.userId && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ status: "error", message: "Forbidden: Access denied" });
    }

    const updates = [];
    const params = [];

    if (address_type) {
      updates.push("address_type = ?");
      params.push(address_type);
    }
    if (street_address) {
      updates.push("street_address = ?");
      params.push(street_address);
    }
    if (landmark !== undefined) {
      updates.push("landmark = ?");
      params.push(landmark);
    }
    if (city) {
      updates.push("city = ?");
      params.push(city);
    }
    if (state) {
      updates.push("state = ?");
      params.push(state);
    }
    if (postal_code) {
      updates.push("postal_code = ?");
      params.push(postal_code);
    }
    if (latitude !== undefined) {
      updates.push("latitude = ?");
      params.push(latitude);
    }
    if (longitude !== undefined) {
      updates.push("longitude = ?");
      params.push(longitude);
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      if (is_default !== undefined) {
        const defaultFlag = is_default ? 1 : 0;
        if (defaultFlag === 1) {
          await connection.query(
            "UPDATE addresses SET is_default = FALSE WHERE user_id = ?",
            [req.user.userId],
          );
        }
        updates.push("is_default = ?");
        params.push(defaultFlag);
      }

      if (updates.length > 0) {
        params.push(id);
        await connection.query(
          `UPDATE addresses SET ${updates.join(", ")} WHERE id = ?`,
          params,
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
      .status(200)
      .json({ status: "success", message: "Address updated successfully" });
  } catch (error) {
    console.error("Update address error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
}

export async function deleteAddress(req, res) {
  if (!req.user) {
    return res.status(401).json({ status: "error", message: "Unauthorized" });
  }

  const { id } = req.params;

  try {
    const [rows] = await pool.query(
      "SELECT user_id FROM addresses WHERE id = ? AND deleted_at IS NULL",
      [id],
    );
    if (rows.length === 0) {
      return res
        .status(404)
        .json({ status: "error", message: "Address not found" });
    }

    if (rows[0].user_id !== req.user.userId && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ status: "error", message: "Forbidden: Access denied" });
    }

    await pool.query(
      "UPDATE addresses SET deleted_at = NOW(), is_default = FALSE WHERE id = ?",
      [id],
    );
    return res
      .status(200)
      .json({ status: "success", message: "Address deleted successfully" });
  } catch (error) {
    console.error("Delete address error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
}
