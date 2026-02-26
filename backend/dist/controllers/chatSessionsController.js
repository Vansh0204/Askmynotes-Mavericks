"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteChat = exports.getAllChats = void 0;
const chatStore_1 = require("../services/chatStore");
const getAllChats = (req, res) => {
    try {
        const chats = chatStore_1.chatStore.getChats();
        res.status(200).json(chats);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to retrieve chats" });
    }
};
exports.getAllChats = getAllChats;
const deleteChat = (req, res) => {
    try {
        const { id } = req.params;
        chatStore_1.chatStore.deleteChat(id);
        res.status(200).json({ message: "Chat deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to delete chat" });
    }
};
exports.deleteChat = deleteChat;
