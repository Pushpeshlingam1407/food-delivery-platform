import { Router } from "express";
import {
  verifyRestaurant,
  getSystemAnalytics,
  createCoupon,
  getCoupons,
  updateCoupon,
  deleteCoupon,
  getSystemSettings,
  updateSystemSettings,
  getRestaurants,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  getCustomers,
  updateCustomer,
  deleteCustomer,
  getDrivers,
  updateDriver,
  deleteDriver,
  getOrders,
  updateOrder,
  deleteOrder,
  getMenuImages,
  createMenuImage,
  deleteMenuImage,
  getOwners,
  createOwner,
  updateOwner,
  deleteOwner,
} from "../controllers/adminController.js";
import { authenticateJWT } from "../middlewares/auth.js";

const router = Router();

// Restaurants CRUD
router.get("/restaurants", authenticateJWT, getRestaurants);
router.post("/restaurants", authenticateJWT, createRestaurant);
router.put("/restaurants/:id", authenticateJWT, updateRestaurant);
router.delete("/restaurants/:id", authenticateJWT, deleteRestaurant);
router.put("/restaurants/:id/verify", authenticateJWT, verifyRestaurant);

// Customers CRUD
router.get("/customers", authenticateJWT, getCustomers);
router.put("/customers/:id", authenticateJWT, updateCustomer);
router.delete("/customers/:id", authenticateJWT, deleteCustomer);

// Owners CRUD
router.get("/owners", authenticateJWT, getOwners);
router.post("/owners", authenticateJWT, createOwner);
router.put("/owners/:id", authenticateJWT, updateOwner);
router.delete("/owners/:id", authenticateJWT, deleteOwner);

// Drivers CRUD
router.get("/drivers", authenticateJWT, getDrivers);
router.put("/drivers/:id", authenticateJWT, updateDriver);
router.delete("/drivers/:id", authenticateJWT, deleteDriver);

// Orders CRUD
router.get("/orders", authenticateJWT, getOrders);
router.put("/orders/:id", authenticateJWT, updateOrder);
router.delete("/orders/:id", authenticateJWT, deleteOrder);

// Menu Images CRUD
router.get("/menu-images", authenticateJWT, getMenuImages);
router.post("/menu-images", authenticateJWT, createMenuImage);
router.delete("/menu-images/:id", authenticateJWT, deleteMenuImage);

router.get("/analytics", authenticateJWT, getSystemAnalytics);
router.post("/coupons", authenticateJWT, createCoupon);
router.get("/coupons", getCoupons);
router.put("/coupons/:id", authenticateJWT, updateCoupon);
router.delete("/coupons/:id", authenticateJWT, deleteCoupon);
router.get("/settings", authenticateJWT, getSystemSettings);
router.put("/settings", authenticateJWT, updateSystemSettings);

export default router;
