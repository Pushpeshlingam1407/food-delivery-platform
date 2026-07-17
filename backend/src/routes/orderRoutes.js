import { Router } from "express";
import {
  placeOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
} from "../controllers/orderController.js";
import { authenticateJWT } from "../middlewares/auth.js";
import { requireApprovedVerification } from "../controllers/verificationController.js";

const router = Router();

router.post("/", authenticateJWT, placeOrder);
router.get("/", authenticateJWT, getOrders);
router.get("/:id", authenticateJWT, getOrderById);
router.put(
  "/:id/status",
  authenticateJWT,
  requireApprovedVerification,
  updateOrderStatus,
);

export default router;
