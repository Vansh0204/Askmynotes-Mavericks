"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatStore = void 0;
const uuid_1 = require("uuid");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class ChatStore {
    constructor() {
        this.chats = [];
        this.MAX_CHATS = 3;
        this.storagePath = path_1.default.join(process.cwd(), "chats.json");
        this.loadChats();
    }
    loadChats() {
        try {
            if (fs_1.default.existsSync(this.storagePath)) {
                const data = fs_1.default.readFileSync(this.storagePath, "utf-8");
                const parsed = JSON.parse(data);
                // Convert string dates back to Date objects
                this.chats = parsed.map((chat) => ({
                    ...chat,
                    created_at: new Date(chat.created_at)
                }));
                console.log(`📂 Loaded ${this.chats.length} chats from persistence.`);
            }
        }
        catch (error) {
            console.error("Error loading chats from storage:", error);
            this.chats = [];
        }
    }
    saveChats() {
        try {
            fs_1.default.writeFileSync(this.storagePath, JSON.stringify(this.chats, null, 2), "utf-8");
        }
        catch (error) {
            console.error("Error saving chats to storage:", error);
        }
    }
    getChats() {
        return this.chats;
    }
    getChat(id) {
        return this.chats.find(c => c.id === id);
    }
    getChatBySubject(subject) {
        return this.chats.find(c => c.subject.toLowerCase() === subject.toLowerCase());
    }
    addChat(sessionData) {
        // Validation moved to controller to allow cumulative updates for existing subjects
        const newChat = {
            ...sessionData,
            id: (0, uuid_1.v4)(),
            created_at: new Date(),
        };
        this.chats.push(newChat);
        this.saveChats();
        return newChat;
    }
    updateChat(id, updates) {
        const index = this.chats.findIndex(c => c.id === id);
        if (index !== -1) {
            this.chats[index] = { ...this.chats[index], ...updates };
            this.saveChats();
            return this.chats[index];
        }
        return null;
    }
    deleteChat(id) {
        this.chats = this.chats.filter(c => c.id !== id);
        this.saveChats();
    }
}
exports.chatStore = new ChatStore();
