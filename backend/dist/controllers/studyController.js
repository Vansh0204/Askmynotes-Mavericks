"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPracticeQuestions = void 0;
const groqService_1 = require("../services/groqService");
const getPracticeQuestions = async (req, res) => {
    try {
        const { subject_name, topic, extracted_text } = req.body;
        if (!subject_name || !extracted_text) {
            res.status(400).json({ error: "Missing subject_name or extracted_text" });
            return;
        }
        const result = await (0, groqService_1.generatePracticeQuestions)({
            subject_name,
            topic,
            extracted_text,
        });
        res.status(200).json(result);
    }
    catch (error) {
        console.error("Practice generation error:", error);
        res.status(500).json({ error: error.message || "Failed to generate questions" });
    }
};
exports.getPracticeQuestions = getPracticeQuestions;
