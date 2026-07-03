import express from "express";
import cors from "cors";
import helmet from "helmet";
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

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Food Delivery Platform Server is healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

export default app;
