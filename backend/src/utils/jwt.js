import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
const ACCESS_EXPIRATION = process.env.JWT_ACCESS_EXPIRATION || "15m";
const REFRESH_EXPIRATION = process.env.JWT_REFRESH_EXPIRATION || "7d";
const ISSUER = process.env.JWT_ISSUER || "bites-api";
const AUDIENCE = process.env.JWT_AUDIENCE || "bites-platform";

if (process.env.NODE_ENV === "production" && (!ACCESS_SECRET || !REFRESH_SECRET || ACCESS_SECRET.length < 32 || REFRESH_SECRET.length < 32)) {
  throw new Error("JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must each be at least 32 characters in production.");
}

export function generateAccessToken(payload) {
  return jwt.sign(payload, ACCESS_SECRET || "development-only-access-secret-change-me", { expiresIn: ACCESS_EXPIRATION, algorithm: "HS256", issuer: ISSUER, audience: AUDIENCE });
}

export function generateRefreshToken(payload) {
  return jwt.sign(payload, REFRESH_SECRET || "development-only-refresh-secret-change-me", { expiresIn: REFRESH_EXPIRATION, algorithm: "HS256", issuer: ISSUER, audience: AUDIENCE });
}

export function verifyToken(token) {
  return jwt.verify(token, ACCESS_SECRET || "development-only-access-secret-change-me", { algorithms: ["HS256"], issuer: ISSUER, audience: AUDIENCE });
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, REFRESH_SECRET || "development-only-refresh-secret-change-me", { algorithms: ["HS256"], issuer: ISSUER, audience: AUDIENCE });
}
