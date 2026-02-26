import { Request, Response } from "express";
import { analyzeStudyMaterial } from "../services/groqService";
import { extractTextFromPDF } from "../services/fileService";
import fs from "fs";
import { chatStore } from "../services/chatStore";

export const uploadStudyMaterial = async (req: Request, res: Response) => {
    try {
        const { subject_name, optional_description } = req.body;
        const file = req.file;

        if (!subject_name || !file) {
            res.status(400).json({ error: "Missing required fields: subject_name or file" });
            return;
        }

        const existingChat = chatStore.getChatBySubject(subject_name);

        if (!existingChat && chatStore.getChats().length >= 3) {
            res.status(400).json({ error: "Maximum of 3 unique subjects allowed. Please update an existing subject or delete one." });
            return;
        }

        let extractedText = "";
        if (file.mimetype === "application/pdf") {
            extractedText = await extractTextFromPDF(file.path);
        } else {
            extractedText = fs.readFileSync(file.path, "utf-8");
        }

        // Cumulative text for combined analysis
        const combinedText = existingChat
            ? `${existingChat.extracted_text}\n\n--- Document: ${file.originalname} ---\n${extractedText}`
            : extractedText;

        const analysisResult = await analyzeStudyMaterial({
            subject_name,
            optional_description: optional_description || existingChat?.description,
            file_name: existingChat ? `${existingChat.file_name}, ${file.originalname}` : file.originalname,
            extracted_text: combinedText,
        });

        let result;
        if (existingChat) {
            // Update existing subject
            result = chatStore.updateChat(existingChat.id, {
                ...analysisResult,
                extracted_text: combinedText,
                description: optional_description || existingChat.description
            });
        } else {
            // Store new subject in chatStore
            result = chatStore.addChat({
                ...analysisResult,
                description: optional_description || "",
                extracted_text: extractedText,
            });
        }

        // Clean up uploaded file
        fs.unlinkSync(file.path);

        res.status(200).json(result);
    } catch (error: any) {
        console.error("Upload controller error:", error);
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ error: error.message || "Failed to process upload" });
    }
};
