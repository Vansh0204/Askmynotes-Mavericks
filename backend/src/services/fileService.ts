import { PDFParse } from "pdf-parse";
import fs from "fs";

export const extractTextFromPDF = async (filePath: string): Promise<string> => {
    try {
        const dataBuffer = fs.readFileSync(filePath);

        // pdf-parse v2.4.5 uses a class-based API
        const parser = new PDFParse({
            data: dataBuffer
        });

        const result = await parser.getText();
        return result.text;
    } catch (error) {
        console.error("Error extracting text from PDF:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to extract text from PDF: ${error.message}`);
        }
        throw new Error("Failed to extract text from PDF");
    }
};
