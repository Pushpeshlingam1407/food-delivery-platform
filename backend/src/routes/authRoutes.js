import { Router } from "express";
import {
  register,
  login,
  sendOTP,
  verifyOTP,
  refreshToken,
  logout,
  getMe,
  registerDeviceToken,
} from "../controllers/authController.js";
import { authenticateJWT } from "../middlewares/auth.js";
import { rateLimit } from "../middlewares/security.js";

const router = Router();

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: "Too many authentication attempts. Please try again in 15 minutes." });
router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.post("/otp/send", authLimiter, sendOTP);
router.post("/otp/verify", authLimiter, verifyOTP);
router.post("/refresh", authLimiter, refreshToken);
router.post("/logout", logout);
router.get("/me", authenticateJWT, getMe);
router.post("/device-token", authenticateJWT, registerDeviceToken);

export default router;
