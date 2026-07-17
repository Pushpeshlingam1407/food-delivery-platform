import { Router } from "express";
import {
  toggleFavorite,
  getFavorites,
  addFavoriteRestaurant,
  removeFavoriteRestaurant,
} from "../controllers/favoriteController.js";
import { authenticateJWT } from "../middlewares/auth.js";

const router = Router();

router.post("/", authenticateJWT, toggleFavorite);
router.get("/", authenticateJWT, getFavorites);
router.post("/add", authenticateJWT, addFavoriteRestaurant);
router.post("/remove", authenticateJWT, removeFavoriteRestaurant);

export default router;
