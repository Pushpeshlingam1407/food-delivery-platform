"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const restaurantController_js_1 = require("../controllers/restaurantController.js");
const menuController_js_1 = require("../controllers/menuController.js");
const inventoryController_js_1 = require("../controllers/inventoryController.js");
const auth_js_1 = require("../middlewares/auth.js");
const router = (0, express_1.Router)();
// Restaurant profile CRUD
router.post(
  "/",
  auth_js_1.authenticateJWT,
  (0, auth_js_1.requireRole)(["restaurant_owner", "admin"]),
  restaurantController_js_1.createRestaurant,
);
router.get("/", restaurantController_js_1.getRestaurants);
router.get("/:id", restaurantController_js_1.getRestaurantById);
router.put(
  "/:id",
  auth_js_1.authenticateJWT,
  (0, auth_js_1.requireRole)(["restaurant_owner", "admin"]),
  restaurantController_js_1.updateRestaurant,
);
router.delete(
  "/:id",
  auth_js_1.authenticateJWT,
  (0, auth_js_1.requireRole)(["restaurant_owner", "admin"]),
  restaurantController_js_1.deleteRestaurant,
);
// Menu Categories CRUD
router.post(
  "/categories",
  auth_js_1.authenticateJWT,
  (0, auth_js_1.requireRole)(["restaurant_owner", "admin"]),
  menuController_js_1.createMenuCategory,
);
router.get("/:restaurantId/categories", menuController_js_1.getMenuCategories);
router.put(
  "/categories/:id",
  auth_js_1.authenticateJWT,
  (0, auth_js_1.requireRole)(["restaurant_owner", "admin"]),
  menuController_js_1.updateMenuCategory,
);
router.delete(
  "/categories/:id",
  auth_js_1.authenticateJWT,
  (0, auth_js_1.requireRole)(["restaurant_owner", "admin"]),
  menuController_js_1.deleteMenuCategory,
);
// Menu Items CRUD
router.post(
  "/items",
  auth_js_1.authenticateJWT,
  (0, auth_js_1.requireRole)(["restaurant_owner", "admin"]),
  menuController_js_1.createMenuItem,
);
router.get("/:restaurantId/items", menuController_js_1.getMenuItems);
router.put(
  "/items/:id",
  auth_js_1.authenticateJWT,
  (0, auth_js_1.requireRole)(["restaurant_owner", "admin"]),
  menuController_js_1.updateMenuItem,
);
router.delete(
  "/items/:id",
  auth_js_1.authenticateJWT,
  (0, auth_js_1.requireRole)(["restaurant_owner", "admin"]),
  menuController_js_1.deleteMenuItem,
);
// Real-time Inventory management
router.put(
  "/items/:menuId/inventory",
  auth_js_1.authenticateJWT,
  (0, auth_js_1.requireRole)(["restaurant_owner", "admin"]),
  inventoryController_js_1.updateInventory,
);
exports.default = router;
