import { Router } from "express";
import { submitRating } from "../controllers/ratingController.js";
import { authenticateJWT } from "../middlewares/auth.js";

const router = Router();

router.post("/", authenticateJWT, submitRating);

export default router;
