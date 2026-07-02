import express from "express";
import cors from "cors";
import helmet from "helmet";
import authRoutes from "./routes/authRoutes.js";
import restaurantRoutes from "./routes/restaurantRoutes.js";
import favoriteRoutes from "./routes/favoriteRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/cart", cartRoutes);

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Food Delivery Platform Server is healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

export default app;
