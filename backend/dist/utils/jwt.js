"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAccessToken = generateAccessToken;
exports.generateRefreshToken = generateRefreshToken;
exports.verifyToken = verifyToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const JWT_SECRET = process.env.JWT_SECRET || "super_secret_jwt_key_123!@#";
const ACCESS_EXPIRATION = process.env.JWT_ACCESS_EXPIRATION || "15m";
const REFRESH_EXPIRATION = process.env.JWT_REFRESH_EXPIRATION || "7d";
function generateAccessToken(payload) {
  return jsonwebtoken_1.default.sign(payload, JWT_SECRET, {
    expiresIn: ACCESS_EXPIRATION,
  });
}
function generateRefreshToken(payload) {
  return jsonwebtoken_1.default.sign(payload, JWT_SECRET, {
    expiresIn: REFRESH_EXPIRATION,
  });
}
function verifyToken(token) {
  return jsonwebtoken_1.default.verify(token, JWT_SECRET);
}
