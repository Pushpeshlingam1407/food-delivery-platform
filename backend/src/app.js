import express from "express";
import cors from "cors";
import helmet from "helmet";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import authRoutes from "./routes/authRoutes.js";
import restaurantRoutes from "./routes/restaurantRoutes.js";
import favoriteRoutes from "./routes/favoriteRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import walletRoutes from "./routes/walletRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import ratingRoutes from "./routes/ratingRoutes.js";
import addressRoutes from "./routes/addressRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import deliveryRoutes from "./routes/deliveryRoutes.js";
import cmsRoutes from "./routes/cmsRoutes.js";
import refundRoutes from "./routes/refundRoutes.js";
import verificationRoutes from "./routes/verificationRoutes.js";
import pool from "./config/db.js";
import { authenticateJWT } from "./middlewares/auth.js";
import {
  enforceHttps,
  getClientIp,
  rateLimit,
} from "./middlewares/security.js";

const app = express();

app.use(
  helmet({
    contentSecurityPolicy: false, // API-only service; CSP belongs to each frontend origin.
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
    hsts:
      process.env.NODE_ENV === "production"
        ? { maxAge: 31536000, includeSubDomains: true, preload: true }
        : false,
  }),
);
app.set("trust proxy", 1);
const configuredOrigins = (
  process.env.CORS_ORIGINS ||
  "http://localhost:5173,http://localhost:5174,http://localhost:5175"
)
  .split(",")
  .map((origin) => origin.trim());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || configuredOrigins.includes(origin))
        return callback(null, true);
      callback(new Error("CORS origin is not allowed"));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    maxAge: 86400,
  }),
);
app.use(enforceHttps);
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 900,
    message: "Too many requests. Please try again shortly.",
  }),
);
app.use(express.json({ limit: "6mb" }));
app.use(express.urlencoded({ limit: "6mb", extended: false }));

// Ensure uploads folder exists
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads", { recursive: true });
}

// Serve uploaded images statically
app.use("/uploads", express.static("uploads"));

// Base64 Image Upload Endpoint
app.post(
  "/api/upload",
  authenticateJWT,
  rateLimit({
    windowMs: 60 * 1000,
    max: 20,
    message: "Too many upload attempts. Please wait a moment.",
  }),
  (req, res) => {
    const { image } = req.body;
    if (!image) {
      return res
        .status(400)
        .json({ status: "error", message: "No image payload provided" });
    }

    try {
      const matches = image.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        return res
          .status(400)
          .json({ status: "error", message: "Invalid base64 image encoding" });
      }

      const extension = matches[1].toLowerCase();
      const allowedExtensions = new Set(["jpeg", "jpg", "png", "webp"]);
      if (!allowedExtensions.has(extension))
        return res.status(415).json({
          status: "error",
          message: "Only JPEG, PNG, and WebP images are accepted.",
        });
      const dataBuffer = Buffer.from(matches[2], "base64");
      if (!dataBuffer.length || dataBuffer.length > 5 * 1024 * 1024)
        return res.status(413).json({
          status: "error",
          message: "Image must be smaller than 5 MB.",
        });
      const safeExtension = extension === "jpeg" ? "jpg" : extension;
      const filename = `${crypto.randomUUID()}.${safeExtension}`;
      const filePath = path.join("uploads", filename);

      fs.writeFileSync(filePath, dataBuffer);

      return res.status(200).json({
        status: "success",
        url: `http://localhost:5000/uploads/${filename}`,
      });
    } catch (err) {
      console.error("File upload runtime error:", err);
      return res
        .status(500)
        .json({ status: "error", message: "Failed to upload image file" });
    }
  },
);

app.use("/api/auth", authRoutes);
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/wallets", walletRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/ratings", ratingRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/delivery", deliveryRoutes);
app.use("/api/cms", cmsRoutes);
app.use("/api/admin/refunds", refundRoutes);
app.use("/api/verification", verificationRoutes);

app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Food Delivery Platform Backend API is running successfully.",
    port: process.env.PORT || 5000,
  });
});

const healthHandler = async (req, res) => {
  let dbStatus = "disconnected";
  try {
    const connection = await pool.getConnection();
    dbStatus = "connected";
    connection.release();
  } catch (error) {
    dbStatus = "failed";
  }

  res.status(200).json({
    status: "success",
    server_port: process.env.PORT || 5000,
    database: dbStatus,
    database_port: parseInt(process.env.DB_PORT || "3306", 10),
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
};

app.get("/health", healthHandler);
app.get("/api/health", healthHandler);

// Custom 404 fallback handler
app.use((req, res, next) => {
  res.status(404).json({
    status: "error",
    message: `API Route '${req.originalUrl}' (method: ${req.method}) not found.`,
  });
});

// Global error handler middleware
app.use((err, req, res, next) => {
  console.error("Unhandled API Error:", err);
  res.status(err.status || 500).json({
    status: "error",
    message: err.message || "Internal server error occurred on the backend.",
  });
});

export default app;
