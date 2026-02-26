"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadStudyMaterial = void 0;
const groqService_1 = require("../services/groqService");
const fileService_1 = require("../services/fileService");
const fs_1 = __importDefault(require("fs"));
const chatStore_1 = require("../services/chatStore");
const uploadStudyMaterial = async (req, res) => {
    try {
        const { subject_name, optional_description } = req.body;
        const file = req.file;
        if (!subject_name || !file) {
            res.status(400).json({ error: "Missing required fields: subject_name or file" });
            return;
        }
        const existingChat = chatStore_1.chatStore.getChatBySubject(subject_name);
        if (!existingChat && chatStore_1.chatStore.getChats().length >= 3) {
            res.status(400).json({ error: "Maximum of 3 unique subjects allowed. Please update an existing subject or delete one." });
            return;
        }
        let extractedText = "";
        if (file.mimetype === "application/pdf") {
            extractedText = await (0, fileService_1.extractTextFromPDF)(file.path);
        }
        else {
            extractedText = fs_1.default.readFileSync(file.path, "utf-8");
        }
        // Cumulative text for combined analysis
        const combinedText = existingChat
            ? `${existingChat.extracted_text}\n\n--- Document: ${file.originalname} ---\n${extractedText}`
            : extractedText;
        const analysisResult = await (0, groqService_1.analyzeStudyMaterial)({
            subject_name,
            optional_description: optional_description || (existingChat === null || existingChat === void 0 ? void 0 : existingChat.description),
            file_name: existingChat ? `${existingChat.file_name}, ${file.originalname}` : file.originalname,
            extracted_text: combinedText,
        });
        let result;
        if (existingChat) {
            // Update existing subject
            result = chatStore_1.chatStore.updateChat(existingChat.id, {
                ...analysisResult,
                extracted_text: combinedText,
                description: optional_description || existingChat.description
            });
        }
        else {
            // Store new subject in chatStore
            result = chatStore_1.chatStore.addChat({
                ...analysisResult,
                description: optional_description || "",
                extracted_text: extractedText,
            });
        }
        // Clean up uploaded file
        fs_1.default.unlinkSync(file.path);
        res.status(200).json(result);
    }
    catch (error) {
        console.error("Upload controller error:", error);
        if (req.file && fs_1.default.existsSync(req.file.path)) {
            fs_1.default.unlinkSync(req.file.path);
        }
        res.status(500).json({ error: error.message || "Failed to process upload" });
    }
};
exports.uploadStudyMaterial = uploadStudyMaterial;
