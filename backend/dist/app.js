"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const authRoutes_js_1 = __importDefault(require("./routes/authRoutes.js"));
const restaurantRoutes_js_1 = __importDefault(require("./routes/restaurantRoutes.js"));
const favoriteRoutes_js_1 = __importDefault(require("./routes/favoriteRoutes.js"));
const app = (0, express_1.default)();
// Global Middlewares
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Routes Mount
app.use("/api/auth", authRoutes_js_1.default);
app.use("/api/restaurants", restaurantRoutes_js_1.default);
app.use("/api/favorites", favoriteRoutes_js_1.default);
// Health Check API
app.get("/health", (req, res) => {
    res.status(200).json({
        status: "success",
        message: "Food Delivery Platform Server is healthy",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});
exports.default = app;
