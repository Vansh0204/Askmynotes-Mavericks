"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// POST /api/auth/signup  — create account
router.post("/signup", authController_1.signup);
// POST /api/auth/login   — obtain JWT
router.post("/login", authController_1.login);
// GET  /api/auth/me      — get current user (protected)
router.get("/me", authMiddleware_1.protect, authController_1.getMe);
exports.default = router;
