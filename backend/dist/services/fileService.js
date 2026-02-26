"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractTextFromPDF = void 0;
const pdf_parse_1 = require("pdf-parse");
const fs_1 = __importDefault(require("fs"));
const extractTextFromPDF = async (filePath) => {
    try {
        const dataBuffer = fs_1.default.readFileSync(filePath);
        // pdf-parse v2.4.5 uses a class-based API
        const parser = new pdf_parse_1.PDFParse({
            data: dataBuffer
        });
        const result = await parser.getText();
        return result.text;
    }
    catch (error) {
        console.error("Error extracting text from PDF:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to extract text from PDF: ${error.message}`);
        }
        throw new Error("Failed to extract text from PDF");
    }
};
exports.extractTextFromPDF = extractTextFromPDF;
