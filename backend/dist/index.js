"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const uploadRoutes_1 = __importDefault(require("./routes/uploadRoutes"));
const chatRoutes_1 = __importDefault(require("./routes/chatRoutes"));
const multer_1 = __importDefault(require("multer"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// ─── Multer Config ────────────────────────────────────────────────────────────
const upload = (0, multer_1.default)({ dest: "uploads/" });
// ─── Middleware ───────────────────────────────────────────────────────────────
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// ─── Routes ───────────────────────────────────────────────────────────────────
app.get("/", (_req, res) => {
    res.json({ message: "AskMyNotes API running 🚀" });
});
// Health check
app.get("/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});
// Auth routes — /api/auth/signup  /api/auth/login  /api/auth/me
app.use("/api/auth", authRoutes_1.default);
// Upload & Analysis routes
app.use("/api/upload", uploadRoutes_1.default);
// Chat routes
app.use("/api/chat", chatRoutes_1.default);
// Study routes
const studyRoutes_1 = __importDefault(require("./routes/studyRoutes"));
app.use("/api/study", studyRoutes_1.default);
// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`✅  Server running on http://localhost:${PORT}`);
});
