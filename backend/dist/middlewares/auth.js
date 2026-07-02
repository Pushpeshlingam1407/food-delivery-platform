"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateJWT = authenticateJWT;
exports.requireRole = requireRole;
const jwt_js_1 = require("../utils/jwt.js");
function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      status: "error",
      message: "Access token is missing or invalid",
    });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = (0, jwt_js_1.verifyToken)(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({
      status: "error",
      message: "Access token is expired or corrupted",
    });
  }
}
function requireRole(allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized: User authentication required",
      });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        status: "error",
        message:
          "Forbidden: You do not have permission to access this resource",
      });
    }
    next();
  };
}
