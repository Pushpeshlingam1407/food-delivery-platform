import { Router } from "express";
import {
  submitRating,
  getRestaurantRatings,
} from "../controllers/ratingController.js";
import { authenticateJWT } from "../middlewares/auth.js";

const router = Router();

router.post("/", authenticateJWT, submitRating);
router.get("/restaurant/:restaurantId", getRestaurantRatings);

export default router;
