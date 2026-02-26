import { AnalysisResult } from "./groqService";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";

export interface ChatSession extends AnalysisResult {
    id: string;
    description: string;
    extracted_text: string;
    created_at: Date;
}

class ChatStore {
    private chats: ChatSession[] = [];
    private MAX_CHATS = 3;
    private storagePath = path.join(process.cwd(), "chats.json");

    constructor() {
        this.loadChats();
    }

    private loadChats() {
        try {
            if (fs.existsSync(this.storagePath)) {
                const data = fs.readFileSync(this.storagePath, "utf-8");
                const parsed = JSON.parse(data);
                // Convert string dates back to Date objects
                this.chats = parsed.map((chat: any) => ({
                    ...chat,
                    created_at: new Date(chat.created_at)
                }));
                console.log(`📂 Loaded ${this.chats.length} chats from persistence.`);
            }
        } catch (error) {
            console.error("Error loading chats from storage:", error);
            this.chats = [];
        }
    }

    private saveChats() {
        try {
            fs.writeFileSync(this.storagePath, JSON.stringify(this.chats, null, 2), "utf-8");
        } catch (error) {
            console.error("Error saving chats to storage:", error);
        }
    }

    getChats() {
        return this.chats;
    }

    getChat(id: string) {
        return this.chats.find(c => c.id === id);
    }

    getChatBySubject(subject: string) {
        return this.chats.find(c => c.subject.toLowerCase() === subject.toLowerCase());
    }

    addChat(sessionData: Omit<ChatSession, "id" | "created_at">) {
        // Validation moved to controller to allow cumulative updates for existing subjects
        const newChat: ChatSession = {
            ...sessionData,
            id: uuidv4(),
            created_at: new Date(),
        };
        this.chats.push(newChat);
        this.saveChats();
        return newChat;
    }

    updateChat(id: string, updates: Partial<ChatSession>) {
        const index = this.chats.findIndex(c => c.id === id);
        if (index !== -1) {
            this.chats[index] = { ...this.chats[index], ...updates };
            this.saveChats();
            return this.chats[index];
        }
        return null;
    }

    deleteChat(id: string) {
        this.chats = this.chats.filter(c => c.id !== id);
        this.saveChats();
    }
}

export const chatStore = new ChatStore();
