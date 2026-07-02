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

const router = Router();

router.post(
  "/",
  authenticateJWT,
  requireRole(["restaurant_owner", "admin"]),
  createRestaurant,
);
router.get("/", getRestaurants);
router.get("/:id", getRestaurantById);
router.put(
  "/:id",
  authenticateJWT,
  requireRole(["restaurant_owner", "admin"]),
  updateRestaurant,
);
router.delete(
  "/:id",
  authenticateJWT,
  requireRole(["restaurant_owner", "admin"]),
  deleteRestaurant,
);

router.post(
  "/categories",
  authenticateJWT,
  requireRole(["restaurant_owner", "admin"]),
  createMenuCategory,
);
router.get("/:restaurantId/categories", getMenuCategories);
router.put(
  "/categories/:id",
  authenticateJWT,
  requireRole(["restaurant_owner", "admin"]),
  updateMenuCategory,
);
router.delete(
  "/categories/:id",
  authenticateJWT,
  requireRole(["restaurant_owner", "admin"]),
  deleteMenuCategory,
);

router.post(
  "/items",
  authenticateJWT,
  requireRole(["restaurant_owner", "admin"]),
  createMenuItem,
);
router.get("/:restaurantId/items", getMenuItems);
router.put(
  "/items/:id",
  authenticateJWT,
  requireRole(["restaurant_owner", "admin"]),
  updateMenuItem,
);
router.delete(
  "/items/:id",
  authenticateJWT,
  requireRole(["restaurant_owner", "admin"]),
  deleteMenuItem,
);

router.put(
  "/items/:menuId/inventory",
  authenticateJWT,
  requireRole(["restaurant_owner", "admin"]),
  updateInventory,
);

export default router;
