"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatWithStudyMaterial = void 0;
const groqService_1 = require("../services/groqService");
const chatWithStudyMaterial = async (req, res) => {
    try {
        const { subject_name, extracted_text, question, history } = req.body;
        if (!subject_name || !extracted_text || !question) {
            res.status(400).json({ error: "Missing required fields: subject_name, extracted_text, or question" });
            return;
        }
        const result = await (0, groqService_1.chatWithMaterial)({
            subject_name,
            extracted_text,
            question,
            history: history || [],
        });
        res.status(200).json(result);
    }
    catch (error) {
        console.error("Chat controller error:", error);
        res.status(500).json({ error: error.message || "Failed to process chat message" });
    }
};
exports.chatWithStudyMaterial = chatWithStudyMaterial;
