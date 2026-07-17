import crypto from "crypto";
import pool from "../config/db.js";

const ROLES = ["restaurant_owner", "delivery_partner"];
const STATUSES = ["pending", "approved", "rejected", "suspended"];

function clientIp(req) {
  return (req.headers["x-forwarded-for"] || req.ip || "unknown")
    .toString()
    .split(",")[0]
    .trim();
}

async function audit(
  connection,
  {
    applicationId,
    adminId = null,
    action,
    previousValue = null,
    newValue = null,
    ipAddress = null,
  },
) {
  await connection.query(
    `INSERT INTO verification_audit_logs (id, application_id, admin_id, action, previous_value, new_value, ip_address)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      crypto.randomUUID(),
      applicationId,
      adminId,
      action,
      previousValue && JSON.stringify(previousValue),
      newValue && JSON.stringify(newValue),
      ipAddress,
    ],
  );
}

async function notify(connection, userId, title, message, type) {
  await connection.query(
    "INSERT INTO notifications (id, user_id, title, message, type) VALUES (?, ?, ?, ?, ?)",
    [crypto.randomUUID(), userId, title, message, type],
  );
}

export async function submitApplication(req, res) {
  const { role, payload = {}, documents = [] } = req.body;
  if (!ROLES.includes(role) || req.user?.role !== role)
    return res.status(403).json({
      status: "error",
      message: "You can only submit your own verification application.",
    });
  if (!Array.isArray(documents))
    return res
      .status(400)
      .json({ status: "error", message: "Documents must be an array." });
  const required =
    role === "delivery_partner"
      ? ["government_id", "driving_license", "vehicle_details", "profile_photo"]
      : ["identity_proof", "business_document", "fssai_license"];
  const provided = new Set(documents.map((d) => d.type));
  const missing = required.filter((type) => !provided.has(type));
  if (missing.length)
    return res.status(400).json({
      status: "error",
      message: `Missing required documents: ${missing.join(", ")}.`,
    });

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [existing] = await connection.query(
      "SELECT id, status FROM verification_applications WHERE user_id = ? AND role = ? ORDER BY submitted_at DESC LIMIT 1",
      [req.user.userId, role],
    );
    let applicationId;
    if (existing[0]?.status === "approved")
      return res.status(409).json({
        status: "error",
        message: "This account is already verified.",
      });
    if (existing[0]) {
      applicationId = existing[0].id;
      await connection.query(
        "UPDATE verification_applications SET status = 'pending', payload = ?, rejection_reason = NULL, remarks = NULL, submitted_at = NOW() WHERE id = ?",
        [JSON.stringify(payload), applicationId],
      );
      await connection.query(
        "DELETE FROM verification_documents WHERE application_id = ?",
        [applicationId],
      );
    } else {
      applicationId = crypto.randomUUID();
      await connection.query(
        "INSERT INTO verification_applications (id, user_id, role, status, payload) VALUES (?, ?, ?, 'pending', ?)",
        [applicationId, req.user.userId, role, JSON.stringify(payload)],
      );
    }
    for (const doc of documents) {
      if (!doc.type || !doc.url)
        throw new Error("Each document requires a type and URL.");
      await connection.query(
        "INSERT INTO verification_documents (id, application_id, document_type, document_url, metadata) VALUES (?, ?, ?, ?, ?)",
        [
          crypto.randomUUID(),
          applicationId,
          doc.type,
          doc.url,
          JSON.stringify(doc.metadata || {}),
        ],
      );
    }
    await audit(connection, {
      applicationId,
      action: existing[0] ? "resubmitted" : "submitted",
      newValue: { role, payload },
      ipAddress: clientIp(req),
    });
    await notify(
      connection,
      req.user.userId,
      "Verification submitted",
      "Your application has been submitted successfully. We'll notify you once it has been reviewed.",
      "verification_pending",
    );
    await connection.commit();
    return res.status(201).json({
      status: "success",
      message: "Application submitted for review.",
      data: { id: applicationId, verificationStatus: "pending" },
    });
  } catch (error) {
    await connection.rollback();
    return res.status(400).json({
      status: "error",
      message: error.message || "Unable to submit application.",
    });
  } finally {
    connection.release();
  }
}

export async function getMyApplication(req, res) {
  const [rows] = await pool.query(
    `SELECT va.*, u.first_name, u.last_name, u.email, u.phone FROM verification_applications va JOIN users u ON u.id = va.user_id WHERE va.user_id = ? ORDER BY va.submitted_at DESC LIMIT 1`,
    [req.user.userId],
  );
  if (!rows[0]) return res.json({ status: "success", data: null });
  const [documents] = await pool.query(
    "SELECT id, document_type, document_url, metadata, verified_at FROM verification_documents WHERE application_id = ?",
    [rows[0].id],
  );
  res.json({ status: "success", data: { ...rows[0], documents } });
}

export async function listApplications(req, res) {
  if (req.user?.role !== "admin")
    return res
      .status(403)
      .json({ status: "error", message: "Admin access required." });
  const status = STATUSES.includes(req.query.status)
    ? req.query.status
    : "pending";
  const role = ROLES.includes(req.query.role) ? req.query.role : null;
  const params = [status];
  let filter = "va.status = ?";
  if (role) {
    filter += " AND va.role = ?";
    params.push(role);
  }
  const [rows] = await pool.query(
    `SELECT va.*, u.first_name, u.last_name, u.email, u.phone, u.created_at, CONCAT(a.first_name, ' ', a.last_name) AS verified_by_name, (SELECT COUNT(*) FROM verification_documents vd WHERE vd.application_id = va.id) AS documents_uploaded FROM verification_applications va JOIN users u ON u.id = va.user_id LEFT JOIN users a ON a.id = va.verified_by WHERE ${filter} ORDER BY va.submitted_at DESC`,
    params,
  );
  res.json({ status: "success", data: rows });
}

export async function getApplication(req, res) {
  if (req.user?.role !== "admin")
    return res
      .status(403)
      .json({ status: "error", message: "Admin access required." });
  const [rows] = await pool.query(
    `SELECT va.*, u.first_name, u.last_name, u.email, u.phone, u.created_at FROM verification_applications va JOIN users u ON u.id = va.user_id WHERE va.id = ?`,
    [req.params.id],
  );
  if (!rows[0])
    return res
      .status(404)
      .json({ status: "error", message: "Application not found." });
  const [documents] = await pool.query(
    "SELECT * FROM verification_documents WHERE application_id = ?",
    [req.params.id],
  );
  const [timeline] = await pool.query(
    "SELECT val.*, CONCAT(u.first_name, ' ', u.last_name) AS admin_name FROM verification_audit_logs val LEFT JOIN users u ON u.id = val.admin_id WHERE val.application_id = ? ORDER BY val.created_at DESC",
    [req.params.id],
  );
  res.json({ status: "success", data: { ...rows[0], documents, timeline } });
}

export async function updateApplicationStatus(req, res) {
  if (req.user?.role !== "admin")
    return res
      .status(403)
      .json({ status: "error", message: "Admin access required." });
  const { status, rejectionReason = null, remarks = null } = req.body;
  if (!STATUSES.includes(status))
    return res
      .status(400)
      .json({ status: "error", message: "Invalid verification status." });
  if (status === "rejected" && !rejectionReason?.trim())
    return res.status(400).json({
      status: "error",
      message: "A constructive rejection reason is required.",
    });
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [rows] = await connection.query(
      "SELECT * FROM verification_applications WHERE id = ? FOR UPDATE",
      [req.params.id],
    );
    const application = rows[0];
    if (!application)
      return res
        .status(404)
        .json({ status: "error", message: "Application not found." });
    await connection.query(
      "UPDATE verification_applications SET status = ?, verified_at = IF(? = 'approved', NOW(), verified_at), verified_by = ?, rejection_reason = ?, remarks = ? WHERE id = ?",
      [
        status,
        status,
        req.user.userId,
        rejectionReason,
        remarks,
        application.id,
      ],
    );
    await connection.query("UPDATE users SET is_verified = ? WHERE id = ?", [
      status === "approved",
      application.user_id,
    ]);
    if (application.role === "delivery_partner" && status !== "approved")
      await connection.query(
        "UPDATE delivery_partners SET is_online = FALSE WHERE id = ?",
        [application.user_id],
      );
    const messages = {
      approved: [
        "Verification approved",
        application.role === "restaurant_owner"
          ? "Congratulations! Your restaurant has been approved. You can now start accepting orders."
          : "Welcome aboard! Your delivery account is now active.",
      ],
      rejected: [
        "Verification needs updates",
        "Your verification request was not approved. Please review the feedback, update your information, and submit a new application.",
      ],
      suspended: [
        "Verification suspended",
        "Your account has been suspended. Please contact support for the next steps.",
      ],
      pending: ["Verification reopened", "Your application is pending review."],
    };
    await audit(connection, {
      applicationId: application.id,
      adminId: req.user.userId,
      action: `status_changed_to_${status}`,
      previousValue: { status: application.status },
      newValue: { status, rejectionReason, remarks },
      ipAddress: clientIp(req),
    });
    await notify(
      connection,
      application.user_id,
      messages[status][0],
      messages[status][1],
      `verification_${status}`,
    );
    await connection.commit();
    res.json({ status: "success", message: messages[status][0] });
  } catch (error) {
    await connection.rollback();
    res
      .status(500)
      .json({ status: "error", message: "Unable to update verification." });
  } finally {
    connection.release();
  }
}

export async function requireApprovedVerification(req, res, next) {
  if (req.user?.role === "admin" || !ROLES.includes(req.user?.role))
    return next();
  const [rows] = await pool.query(
    "SELECT status FROM verification_applications WHERE user_id = ? AND role = ? ORDER BY submitted_at DESC LIMIT 1",
    [req.user.userId, req.user.role],
  );
  if (rows[0]?.status !== "approved")
    return res.status(403).json({
      status: "error",
      code: "VERIFICATION_REQUIRED",
      message:
        "Your verification must be approved before this action is available.",
    });
  next();
}
