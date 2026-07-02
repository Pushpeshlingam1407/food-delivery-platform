"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
exports.sendOTP = sendOTP;
exports.verifyOTP = verifyOTP;
exports.refreshToken = refreshToken;
exports.logout = logout;
exports.getMe = getMe;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = __importDefault(require("crypto"));
const db_js_1 = __importDefault(require("../config/db.js"));
const jwt_js_1 = require("../utils/jwt.js");
// Helper to query roles
async function getRoleIdByName(name) {
    const [rows] = await db_js_1.default.query("SELECT id FROM roles WHERE name = ?", [
        name,
    ]);
    const roles = rows;
    return roles.length > 0 ? roles[0].id : null;
}
async function register(req, res) {
    const { first_name, last_name, email, phone, password, role = "customer", } = req.body;
    if (!first_name || !last_name || !email || !phone || !password) {
        return res
            .status(400)
            .json({ status: "error", message: "All fields are required" });
    }
    try {
        // 1. Get role_id
        const roleId = await getRoleIdByName(role);
        if (!roleId) {
            return res
                .status(400)
                .json({ status: "error", message: `Invalid role specified: ${role}` });
        }
        // 2. Hash password
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const userId = crypto_1.default.randomUUID();
        // 3. Insert user inside transaction
        const connection = await db_js_1.default.getConnection();
        try {
            await connection.beginTransaction();
            // Check if user already exists
            const [existingUsers] = await connection.query("SELECT id FROM users WHERE email = ? OR phone = ?", [email, phone]);
            if (existingUsers.length > 0) {
                connection.release();
                return res.status(409).json({
                    status: "error",
                    message: "User with this email or phone number already exists",
                });
            }
            await connection.query(`INSERT INTO users (id, role_id, first_name, last_name, email, phone, password_hash, is_verified) 
         VALUES (?, ?, ?, ?, ?, ?, ?, TRUE)`, [userId, roleId, first_name, last_name, email, phone, hashedPassword]);
            // Create wallet for customers and delivery partners
            if (role === "customer" || role === "delivery_partner") {
                const walletId = crypto_1.default.randomUUID();
                await connection.query('INSERT INTO wallets (id, user_id, balance, currency) VALUES (?, ?, 0.00, "INR")', [walletId, userId]);
            }
            // If delivery partner, create delivery_partner profile
            if (role === "delivery_partner") {
                await connection.query(`INSERT INTO delivery_partners (id, vehicle_number, vehicle_type, license_number, is_online, status) 
           VALUES (?, 'PENDING', 'bike', 'PENDING', FALSE, 'idle')`, [userId]);
            }
            await connection.commit();
        }
        catch (err) {
            await connection.rollback();
            throw err;
        }
        finally {
            connection.release();
        }
        return res.status(201).json({
            status: "success",
            message: "User registered successfully",
            data: { userId, first_name, last_name, email, phone, role },
        });
    }
    catch (error) {
        console.error("Registration error:", error);
        return res
            .status(500)
            .json({ status: "error", message: "Internal server error" });
    }
}
async function login(req, res) {
    const { email, password } = req.body;
    if (!email || !password) {
        return res
            .status(400)
            .json({ status: "error", message: "Email and password are required" });
    }
    try {
        // Get user with role name
        const [rows] = await db_js_1.default.query(`SELECT u.*, r.name as role_name FROM users u 
       JOIN roles r ON u.role_id = r.id 
       WHERE u.email = ? AND u.deleted_at IS NULL`, [email]);
        const users = rows;
        if (users.length === 0) {
            return res
                .status(401)
                .json({ status: "error", message: "Invalid credentials" });
        }
        const user = users[0];
        if (user.status !== "active") {
            return res
                .status(403)
                .json({ status: "error", message: `Your account is ${user.status}` });
        }
        // Verify Password
        const passwordMatch = await bcryptjs_1.default.compare(password, user.password_hash);
        if (!passwordMatch) {
            return res
                .status(401)
                .json({ status: "error", message: "Invalid credentials" });
        }
        // Generate tokens
        const payload = {
            userId: user.id,
            role: user.role_name,
            email: user.email,
        };
        const accessToken = (0, jwt_js_1.generateAccessToken)(payload);
        const refreshToken = (0, jwt_js_1.generateRefreshToken)(payload);
        // Save refresh token to DB
        const tokenId = crypto_1.default.randomUUID();
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
        await db_js_1.default.query("INSERT INTO refresh_tokens (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)", [tokenId, user.id, refreshToken, expiresAt]);
        return res.status(200).json({
            status: "success",
            message: "Login successful",
            data: {
                accessToken,
                refreshToken,
                user: {
                    id: user.id,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    email: user.email,
                    phone: user.phone,
                    role: user.role_name,
                },
            },
        });
    }
    catch (error) {
        console.error("Login error:", error);
        return res
            .status(500)
            .json({ status: "error", message: "Internal server error" });
    }
}
async function sendOTP(req, res) {
    const { phone, purpose = "login" } = req.body;
    if (!phone) {
        return res
            .status(400)
            .json({ status: "error", message: "Phone number is required" });
    }
    try {
        // Generate a 6-digit code
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins expiry
        // Save OTP to DB
        await db_js_1.default.query("INSERT INTO otp_verifications (phone, otp_code, purpose, expires_at) VALUES (?, ?, ?, ?)", [phone, code, purpose, expiresAt]);
        // Simulated SMS dispatch
        console.log(`[SMS Gateway Mock] Dispatched OTP ${code} to ${phone} for purpose: ${purpose}`);
        return res.status(200).json({
            status: "success",
            message: "OTP sent successfully (Simulated)",
            // Return code in development for testing convenience
            code: process.env.NODE_ENV === "development" ? code : undefined,
        });
    }
    catch (error) {
        console.error("Send OTP error:", error);
        return res
            .status(500)
            .json({ status: "error", message: "Internal server error" });
    }
}
async function verifyOTP(req, res) {
    const { phone, code } = req.body;
    if (!phone || !code) {
        return res
            .status(400)
            .json({ status: "error", message: "Phone and OTP code are required" });
    }
    try {
        // Check code in DB
        const [rows] = await db_js_1.default.query(`SELECT * FROM otp_verifications 
       WHERE phone = ? AND otp_code = ? AND is_used = FALSE AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1`, [phone, code]);
        const otps = rows;
        if (otps.length === 0) {
            return res
                .status(400)
                .json({ status: "error", message: "Invalid or expired OTP" });
        }
        const otpRecord = otps[0];
        // Mark OTP as used
        await db_js_1.default.query("UPDATE otp_verifications SET is_used = TRUE WHERE id = ?", [otpRecord.id]);
        // Check if user exists
        const [userRows] = await db_js_1.default.query(`SELECT u.*, r.name as role_name FROM users u 
       JOIN roles r ON u.role_id = r.id 
       WHERE u.phone = ? AND u.deleted_at IS NULL`, [phone]);
        const users = userRows;
        let user;
        if (users.length === 0) {
            // Auto-signup as customer if user doesn't exist
            const userId = crypto_1.default.randomUUID();
            const roleId = await getRoleIdByName("customer");
            const connection = await db_js_1.default.getConnection();
            try {
                await connection.beginTransaction();
                await connection.query(`INSERT INTO users (id, role_id, first_name, last_name, email, phone, is_verified) 
           VALUES (?, ?, 'OTP', 'User', ?, ?, TRUE)`, [userId, roleId, `otp_${phone}@temporary.com`, phone]);
                const walletId = crypto_1.default.randomUUID();
                await connection.query('INSERT INTO wallets (id, user_id, balance, currency) VALUES (?, ?, 0.00, "INR")', [walletId, userId]);
                await connection.commit();
            }
            catch (err) {
                await connection.rollback();
                throw err;
            }
            finally {
                connection.release();
            }
            // Fetch newly created user
            const [newUserRows] = await db_js_1.default.query(`SELECT u.*, r.name as role_name FROM users u 
         JOIN roles r ON u.role_id = r.id 
         WHERE u.id = ?`, [userId]);
            user = newUserRows[0];
        }
        else {
            user = users[0];
        }
        if (user.status !== "active") {
            return res
                .status(403)
                .json({ status: "error", message: `Your account is ${user.status}` });
        }
        // Generate tokens
        const payload = {
            userId: user.id,
            role: user.role_name,
            email: user.email,
        };
        const accessToken = (0, jwt_js_1.generateAccessToken)(payload);
        const refreshToken = (0, jwt_js_1.generateRefreshToken)(payload);
        // Save refresh token
        const tokenId = crypto_1.default.randomUUID();
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        await db_js_1.default.query("INSERT INTO refresh_tokens (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)", [tokenId, user.id, refreshToken, expiresAt]);
        return res.status(200).json({
            status: "success",
            message: "OTP verified successfully",
            data: {
                accessToken,
                refreshToken,
                user: {
                    id: user.id,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    email: user.email,
                    phone: user.phone,
                    role: user.role_name,
                },
            },
        });
    }
    catch (error) {
        console.error("Verify OTP error:", error);
        return res
            .status(500)
            .json({ status: "error", message: "Internal server error" });
    }
}
async function refreshToken(req, res) {
    const { token } = req.body;
    if (!token) {
        return res
            .status(400)
            .json({ status: "error", message: "Refresh token is required" });
    }
    try {
        const [rows] = await db_js_1.default.query(`SELECT rt.*, u.email, r.name as role_name FROM refresh_tokens rt
       JOIN users u ON rt.user_id = u.id
       JOIN roles r ON u.role_id = r.id
       WHERE rt.token = ? AND rt.is_revoked = FALSE AND rt.expires_at > NOW()`, [token]);
        const tokens = rows;
        if (tokens.length === 0) {
            return res
                .status(403)
                .json({ status: "error", message: "Invalid or expired refresh token" });
        }
        const dbToken = tokens[0];
        const payload = {
            userId: dbToken.user_id,
            role: dbToken.role_name,
            email: dbToken.email,
        };
        const accessToken = (0, jwt_js_1.generateAccessToken)(payload);
        return res.status(200).json({
            status: "success",
            message: "Token refreshed successfully",
            data: { accessToken },
        });
    }
    catch (error) {
        console.error("Refresh token error:", error);
        return res
            .status(500)
            .json({ status: "error", message: "Internal server error" });
    }
}
async function logout(req, res) {
    const { token } = req.body;
    if (!token) {
        return res
            .status(400)
            .json({ status: "error", message: "Token is required" });
    }
    try {
        await db_js_1.default.query("UPDATE refresh_tokens SET is_revoked = TRUE WHERE token = ?", [token]);
        return res
            .status(200)
            .json({ status: "success", message: "Logged out successfully" });
    }
    catch (error) {
        console.error("Logout error:", error);
        return res
            .status(500)
            .json({ status: "error", message: "Internal server error" });
    }
}
async function getMe(req, res) {
    if (!req.user) {
        return res.status(401).json({ status: "error", message: "Unauthorized" });
    }
    try {
        const [rows] = await db_js_1.default.query(`SELECT id, first_name, last_name, email, phone, status, is_verified, created_at 
       FROM users WHERE id = ?`, [req.user.userId]);
        const users = rows;
        if (users.length === 0) {
            return res
                .status(404)
                .json({ status: "error", message: "User not found" });
        }
        return res.status(200).json({
            status: "success",
            data: {
                ...users[0],
                role: req.user.role,
            },
        });
    }
    catch (error) {
        console.error("Get profile error:", error);
        return res
            .status(500)
            .json({ status: "error", message: "Internal server error" });
    }
}
