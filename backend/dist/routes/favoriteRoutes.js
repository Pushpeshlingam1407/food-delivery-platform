"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const favoriteController_js_1 = require("../controllers/favoriteController.js");
const auth_js_1 = require("../middlewares/auth.js");
const router = (0, express_1.Router)();
router.post(
  "/",
  auth_js_1.authenticateJWT,
  favoriteController_js_1.toggleFavorite,
);
router.get(
  "/",
  auth_js_1.authenticateJWT,
  favoriteController_js_1.getFavorites,
);
exports.default = router;
