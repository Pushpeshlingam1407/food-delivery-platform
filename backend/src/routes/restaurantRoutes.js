import { Router } from "express";
import {
  createRestaurant,
  getRestaurants,
  getRestaurantById,
  updateRestaurant,
  deleteRestaurant,
} from "../controllers/restaurantController.js";
import {
  createMenuCategory,
  getMenuCategories,
  updateMenuCategory,
  deleteMenuCategory,
  createMenuItem,
  getMenuItems,
  updateMenuItem,
  deleteMenuItem,
} from "../controllers/menuController.js";
import { updateInventory } from "../controllers/inventoryController.js";
import { authenticateJWT, requireRole } from "../middlewares/auth.js";
import { requireApprovedVerification } from "../controllers/verificationController.js";

const router = Router();

router.post(
  "/",
  authenticateJWT,
  requireRole(["restaurant_owner", "admin"]),
  requireApprovedVerification,
  createRestaurant,
);
router.get("/", getRestaurants);
router.get("/:id", getRestaurantById);
router.put(
  "/:id",
  authenticateJWT,
  requireRole(["restaurant_owner", "admin"]),
  requireApprovedVerification,
  updateRestaurant,
);
router.delete(
  "/:id",
  authenticateJWT,
  requireRole(["restaurant_owner", "admin"]),
  requireApprovedVerification,
  deleteRestaurant,
);

router.post(
  "/categories",
  authenticateJWT,
  requireRole(["restaurant_owner", "admin"]),
  requireApprovedVerification,
  createMenuCategory,
);
router.get("/:restaurantId/categories", getMenuCategories);
router.put(
  "/categories/:id",
  authenticateJWT,
  requireRole(["restaurant_owner", "admin"]),
  requireApprovedVerification,
  updateMenuCategory,
);
router.delete(
  "/categories/:id",
  authenticateJWT,
  requireRole(["restaurant_owner", "admin"]),
  requireApprovedVerification,
  deleteMenuCategory,
);

router.post(
  "/items",
  authenticateJWT,
  requireRole(["restaurant_owner", "admin"]),
  requireApprovedVerification,
  createMenuItem,
);
router.get("/:restaurantId/items", getMenuItems);
router.put(
  "/items/:id",
  authenticateJWT,
  requireRole(["restaurant_owner", "admin"]),
  requireApprovedVerification,
  updateMenuItem,
);
router.delete(
  "/items/:id",
  authenticateJWT,
  requireRole(["restaurant_owner", "admin"]),
  requireApprovedVerification,
  deleteMenuItem,
);

router.put(
  "/items/:menuId/inventory",
  authenticateJWT,
  requireRole(["restaurant_owner", "admin"]),
  requireApprovedVerification,
  updateInventory,
);

export default router;
