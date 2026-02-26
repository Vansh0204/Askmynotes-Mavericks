"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.login = exports.signup = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const uuid_1 = require("uuid");
const userStore_1 = require("../models/userStore");
const JWT_SECRET = process.env.JWT_SECRET || "supersecret_change_in_prod";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
// ─── helpers ──────────────────────────────────────────────────────────────────
// jwt v9 uses a branded "StringValue" type for expiresIn — cast is safe.
const generateToken = (userId) => jsonwebtoken_1.default.sign({ id: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
// ─── SIGN UP ──────────────────────────────────────────────────────────────────
const signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        // Basic validation
        if (!name || !email || !password) {
            res.status(400).json({ success: false, message: "All fields are required." });
            return;
        }
        if (password.length < 6) {
            res.status(400).json({ success: false, message: "Password must be at least 6 characters." });
            return;
        }
        // Check duplicate email
        if ((0, userStore_1.findUserByEmail)(email)) {
            res.status(409).json({ success: false, message: "Email already in use." });
            return;
        }
        const passwordHash = await bcryptjs_1.default.hash(password, 12);
        const newUser = (0, userStore_1.createUser)({
            id: (0, uuid_1.v4)(),
            name,
            email,
            passwordHash,
            createdAt: new Date(),
        });
        const token = generateToken(newUser.id);
        res.status(201).json({
            success: true,
            message: "Account created successfully.",
            token,
            user: { id: newUser.id, name: newUser.name, email: newUser.email },
        });
    }
    catch (err) {
        console.error("Signup error:", err);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
};
exports.signup = signup;
// ─── LOGIN ────────────────────────────────────────────────────────────────────
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ success: false, message: "Email and password are required." });
            return;
        }
        const user = (0, userStore_1.findUserByEmail)(email);
        if (!user) {
            res.status(401).json({ success: false, message: "Invalid credentials." });
            return;
        }
        const passwordMatch = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!passwordMatch) {
            res.status(401).json({ success: false, message: "Invalid credentials." });
            return;
        }
        const token = generateToken(user.id);
        res.status(200).json({
            success: true,
            message: "Logged in successfully.",
            token,
            user: { id: user.id, name: user.name, email: user.email },
        });
    }
    catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
};
exports.login = login;
// ─── GET ME (protected) ───────────────────────────────────────────────────────
const getMe = async (req, res) => {
    try {
        const payload = req.user;
        const user = (0, userStore_1.findUserById)(payload.id);
        if (!user) {
            res.status(404).json({ success: false, message: "User not found." });
            return;
        }
        res.status(200).json({
            success: true,
            user: { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt },
        });
    }
    catch (err) {
        console.error("GetMe error:", err);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
};
exports.getMe = getMe;
