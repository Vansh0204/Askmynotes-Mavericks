"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
}

export default function ChatPage() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "1",
            role: "assistant",
            content: "Hello! I'm your note assistant. Upload your notes or ask me anything about your knowledge base.",
        },
    ]);
    const [input, setInput] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = () => {
        if (!input.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: input,
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput("");

        // Simulate AI response
        setTimeout(() => {
            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: "I'm currently in demo mode. In a real application, I would process your notes and answer based on their content!",
            };
            setMessages((prev) => [...prev, aiMessage]);
        }, 1000);
    };

    return (
        <div className="flex h-screen bg-[#fdfcfb] overflow-hidden font-['DM_Sans']">
            {/* Sidebar */}
            <div className="w-72 bg-white border-r border-black/5 flex flex-col p-6 hidden md:flex">
                <Link href="/" className="flex items-center gap-2 mb-10 group">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold group-hover:scale-110 transition-transform">
                        A
                    </div>
                    <span className="font-bold text-xl tracking-tight text-[#1a1825]">AskMyNotes</span>
                </Link>

                <button className="w-full py-3 px-4 bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors mb-8">
                    <span>+</span> New Chat
                </button>

                <div className="flex-1 overflow-y-auto space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-black/30 mb-4">Recent Chats</p>
                    <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100/50 text-sm font-medium text-indigo-900 cursor-pointer">
                        Design Philosophy Prep
                    </div>
                    <div className="p-3 hover:bg-black/5 rounded-xl text-sm font-medium text-black/60 cursor-pointer transition-colors">
                        Lecture 12: Microservices
                    </div>
                    <div className="p-3 hover:bg-black/5 rounded-xl text-sm font-medium text-black/60 cursor-pointer transition-colors">
                        Thesis References
                    </div>
                </div>

                <div className="mt-auto pt-6 border-t border-black/5 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                        U
                    </div>
                    <div>
                        <p className="text-sm font-bold text-black">User Account</p>
                        <p className="text-[10px] text-black/40">Premium Plan</p>
                    </div>
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col relative">
                {/* Header */}
                <header className="h-20 border-bottom border-black/5 flex items-center justify-between px-8 bg-white/50 backdrop-blur-md sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <h2 className="font-bold text-lg text-black">Design Philosophy Prep</h2>
                        <span className="px-2 py-0.5 bg-indigo-100 text-indigo-600 text-[10px] font-bold rounded-lg uppercase tracking-wider">Active</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="text-sm font-bold text-black/60 hover:text-black transition-colors">Share</button>
                        <div className="h-4 w-px bg-black/10" />
                        <button className="text-sm font-bold text-black/60 hover:text-black transition-colors">Export</button>
                    </div>
                </header>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide">
                    <AnimatePresence initial={false}>
                        {messages.map((message) => (
                            <motion.div
                                key={message.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={cn(
                                    "flex max-w-[80%]",
                                    message.role === "user" ? "ml-auto" : "mr-auto"
                                )}
                            >
                                <div
                                    className={cn(
                                        "p-5 rounded-2xl text-sm leading-relaxed shadow-sm",
                                        message.role === "user"
                                            ? "bg-indigo-600 text-white rounded-tr-none"
                                            : "bg-white text-black border border-black/5 rounded-tl-none"
                                    )}
                                >
                                    {message.content}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-8 pt-4">
                    <div className="max-w-4xl mx-auto relative bg-white rounded-2xl shadow-xl shadow-black/5 border border-black/5 p-2 flex items-center">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSend()}
                            placeholder="Ask anything about your notes..."
                            className="flex-1 bg-transparent px-4 py-3 outline-none text-sm text-black placeholder:text-black/30"
                        />
                        <button
                            onClick={handleSend}
                            className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
                        >
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <path d="M15.8333 2.5L2.5 9.16667L8.33333 11.6667L10.8333 17.5L17.5 4.16667L15.8333 2.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                    </div>
                    <p className="text-[10px] text-center mt-4 text-black/20 font-medium">
                        AskMyNotes AI can make mistakes. Verify important information.
                    </p>
                </div>
            </div>
        </div>
    );
}
