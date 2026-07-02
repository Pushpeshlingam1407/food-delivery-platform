import { Router } from "express";
import {
  getRestaurantSalesReport,
  getDriverEarningsReport,
} from "../controllers/reportController.js";
import { authenticateJWT } from "../middlewares/auth.js";

const router = Router();

router.get(
  "/restaurant/:restaurantId",
  authenticateJWT,
  getRestaurantSalesReport,
);
router.get("/driver", authenticateJWT, getDriverEarningsReport);

export default router;
