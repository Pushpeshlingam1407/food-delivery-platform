import { Router } from "express";
import {
  toggleDriverStatus,
  logDriverLocation,
} from "../controllers/deliveryController.js";
import {
  getEarningsLedger,
  getEarningsAnalytics,
} from "../controllers/earningsController.js";
import { authenticateJWT } from "../middlewares/auth.js";

const router = Router();

router.put("/status", authenticateJWT, toggleDriverStatus);
router.post("/location", authenticateJWT, logDriverLocation);
router.get("/earnings/ledger", authenticateJWT, getEarningsLedger);
router.get("/earnings/analytics", authenticateJWT, getEarningsAnalytics);

export default router;
