import { Router } from "express";
import {
  placeOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
} from "../controllers/orderController.js";
import { authenticateJWT } from "../middlewares/auth.js";

const router = Router();

router.post("/", authenticateJWT, placeOrder);
router.get("/", authenticateJWT, getOrders);
router.get("/:id", authenticateJWT, getOrderById);
router.put("/:id/status", authenticateJWT, updateOrderStatus);

export default router;
