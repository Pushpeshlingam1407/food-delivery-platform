import { Router } from "express";
import {
  verifyRestaurant,
  getSystemAnalytics,
  createCoupon,
  getCoupons,
  updateCoupon,
  deleteCoupon,
} from "../controllers/adminController.js";
import { authenticateJWT } from "../middlewares/auth.js";

const router = Router();

router.put("/restaurants/:id/verify", authenticateJWT, verifyRestaurant);
router.get("/analytics", authenticateJWT, getSystemAnalytics);
router.post("/coupons", authenticateJWT, createCoupon);
router.get("/coupons", getCoupons);
router.put("/coupons/:id", authenticateJWT, updateCoupon);
router.delete("/coupons/:id", authenticateJWT, deleteCoupon);

export default router;
