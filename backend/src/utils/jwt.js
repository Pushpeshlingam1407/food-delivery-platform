import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "super_secret_jwt_key_123!@#";
const ACCESS_EXPIRATION = process.env.JWT_ACCESS_EXPIRATION || "15m";
const REFRESH_EXPIRATION = process.env.JWT_REFRESH_EXPIRATION || "7d";

export function generateAccessToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_EXPIRATION });
}

export function generateRefreshToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: REFRESH_EXPIRATION });
}

export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}
