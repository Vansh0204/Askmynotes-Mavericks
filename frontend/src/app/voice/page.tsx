"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useFile } from "@/context/FileContext";
import { SmoothCursor } from "@/components/ui/smooth-cursor";
import { Persona, type PersonaState } from "@/components/ai-elements/persona";

// Type definitions for Web Speech API
interface SpeechRecognitionEvent {
    results: {
        [key: number]: { [key: number]: { transcript: string } };
    };
}
interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    onstart: () => void;
    onresult: (event: SpeechRecognitionEvent) => void;
    onerror: () => void;
    onend: () => void;
    start: () => void;
    stop: () => void;
}
declare global {
    interface Window {
        SpeechRecognition: new () => SpeechRecognition;
        webkitSpeechRecognition: new () => SpeechRecognition;
    }
}

// Animated waveform bars shown while listening or speaking
function Waveform({ active, color = "#6366f1" }: { active: boolean; color?: string }) {
    const heights = [0.5, 0.9, 0.6, 1.0, 0.7, 0.8, 0.4, 0.9, 0.6, 0.8, 0.5, 1.0, 0.7, 0.6, 0.8];
    return (
        <div className="flex items-center gap-[3px]">
            {heights.map((h, i) => (
                <motion.span
                    key={i}
                    className="inline-block rounded-full"
                    style={{ width: 3, backgroundColor: color }}
                    animate={active ? {
                        height: [`${h * 8}px`, `${h * 28}px`, `${h * 12}px`, `${h * 24}px`, `${h * 8}px`],
                    } : { height: "4px" }}
                    transition={{
                        duration: 0.9,
                        repeat: active ? Infinity : 0,
                        ease: "easeInOut",
                        delay: i * 0.06,
                    }}
                />
            ))}
        </div>
    );
}

export default function VoicePage() {
    const { selectedFile } = useFile();
    const [isRecording, setIsRecording] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [aiResponse, setAiResponse] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const transcriptRef = useRef<string>("");

    const personaState: PersonaState = isRecording
        ? "listening"
        : isProcessing
            ? "thinking"
            : isSpeaking
                ? "speaking"
                : "idle";

    const [extractedText] = useState("");
    const [subjectName, setSubjectName] = useState("Your Study Material");

    useEffect(() => {
        if (selectedFile) setSubjectName(selectedFile.name);
    }, [selectedFile]);

    const handleSend = async (question: string) => {
        if (!question.trim()) return;
        setIsProcessing(true);
        setAiResponse("");
        try {
            const apiUrl = "https://askmynotes-mavericks.onrender.com";
            const response = await fetch(`${apiUrl}/api/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    subject_name: subjectName,
                    extracted_text: extractedText || "This is a placeholder context for the voice teacher interaction.",
                    question,
                    history: [],
                }),
            });
            if (!response.ok) throw new Error("Chat failed");
            const result = await response.json();
            const cleaned = (result.answer || "")
                .replace(/<\/?u>/g, "")
                .replace(/\(\s*(?:File|Source)\s*:.*?\)/gi, "")
                .replace(/\[\s*(?:File|Source)\s*:.*?\]/gi, "")
                .replace(/\[\d+\]/g, "")
                .replace(/\*\*|__/g, "")
                .replace(/\s+/g, " ")
                .trim();
            setAiResponse(cleaned);
            speak(cleaned);
        } catch {
            const err = "I'm having trouble connecting right now. Please try again.";
            setAiResponse(err);
            speak(err);
        } finally {
            setIsProcessing(false);
        }
    };

    const speak = (text: string) => {
        const utterance = new SpeechSynthesisUtterance(text.replace(/\[.*?\]/g, ""));
        utterance.rate = 0.95;
        utterance.pitch = 1.0;
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
    };

    const startRecording = () => {
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SR) { alert("Speech Recognition not supported in this browser."); return; }
        const recognition: SpeechRecognition = new SR();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = "en-US";
        recognition.onstart = () => {
            setIsRecording(true);
            setTranscript("");
            transcriptRef.current = "";
            window.speechSynthesis.cancel();
        };
        recognition.onresult = (e) => {
            const t = Array.from(Object.values(e.results)).map(r => r[0].transcript).join("");
            setTranscript(t);
            transcriptRef.current = t;
        };
        recognition.onend = () => {
            setIsRecording(false);
            if (transcriptRef.current.trim()) handleSend(transcriptRef.current);
        };
        recognition.start();
        recognitionRef.current = recognition;
    };

    const stopRecording = () => recognitionRef.current?.stop();

    // Dynamic label & colors per state
    const stateConfig = {
        idle: {
            label: "Ready to help",
            sublabel: "Tap the button and start speaking",
            bg: "from-slate-50 to-white",
            accent: "#6366f1",
        },
        listening: {
            label: "Listening…",
            sublabel: transcript || "Go ahead, I'm all ears",
            bg: "from-rose-50 to-white",
            accent: "#ef4444",
        },
        thinking: {
            label: "Thinking…",
            sublabel: "Searching through your notes",
            bg: "from-amber-50 to-white",
            accent: "#f59e0b",
        },
        speaking: {
            label: "Speaking",
            sublabel: aiResponse,
            bg: "from-indigo-50 to-white",
            accent: "#6366f1",
        },
    };
    const cfg = stateConfig[personaState];

    return (
        <div
            className={cn("min-h-screen flex flex-col bg-gradient-to-br transition-all duration-700", cfg.bg)}
            style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
            <SmoothCursor />

            {/* ─── Header ─── */}
            <header className="flex items-center justify-between px-6 sm:px-10 py-4 border-b border-black/5 bg-white/70 backdrop-blur-md sticky top-0 z-30">
                <Link href="/" className="flex items-center gap-2 group">
                    <img src="/logo.png" alt="Luminary" style={{ height: "28px", width: "auto", objectFit: "contain" }} />
                    <span className="font-extrabold text-[1rem] text-[#1a1825] tracking-tight" style={{ fontFamily: "'DM Sans', sans-serif" }}>Luminary</span>
                </Link>
                <div className="flex items-center gap-3 text-right">
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-black/30 hidden sm:block">Voice Tutor</p>
                        <p className="text-sm font-bold text-indigo-600 truncate max-w-[180px] sm:max-w-xs">{subjectName}</p>
                    </div>
                    {/* Live dot */}
                    <motion.span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: cfg.accent }}
                        animate={{ scale: personaState !== "idle" ? [1, 1.4, 1] : 1, opacity: personaState !== "idle" ? [1, 0.5, 1] : 0.6 }}
                        transition={{ duration: 1.2, repeat: Infinity }}
                    />
                </div>
            </header>

            {/* ─── Main ─── */}
            <main className="flex-1 flex flex-col items-center justify-between py-10 px-6 gap-8 max-w-lg mx-auto w-full">

                {/* ---- Persona Orb ---- */}
                <div className="flex flex-col items-center gap-5 flex-1 justify-center">
                    {/* Drop shadow ring that pulses on state change */}
                    <motion.div
                        className="relative"
                        animate={{ scale: personaState !== "idle" ? [1, 1.03, 1] : 1 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                        {/* Glow halo ring */}
                        {personaState !== "idle" && (
                            <motion.div
                                className="absolute inset-[-16px] rounded-full blur-2xl"
                                style={{ backgroundColor: cfg.accent + "33" }}
                                animate={{ opacity: [0.4, 0.8, 0.4], scale: [0.95, 1.05, 0.95] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            />
                        )}
                        {/* The Persona orb — white card bg so it pops on light bg */}
                        <motion.div
                            className="relative bg-white rounded-full shadow-2xl p-4 sm:p-6"
                            style={{ boxShadow: `0 24px 64px ${cfg.accent}22, 0 4px 16px rgba(0,0,0,0.08)` }}
                            layout
                        >
                            <Persona
                                variant="opal"
                                state={personaState}
                                className="size-[200px] sm:size-[240px]"
                            />
                        </motion.div>
                    </motion.div>

                    {/* State Label */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={personaState}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.3 }}
                            className="flex flex-col items-center gap-1 text-center"
                        >
                            <span
                                className="text-xs font-black uppercase tracking-[0.3em]"
                                style={{ color: cfg.accent }}
                            >
                                {cfg.label}
                            </span>

                            {/* Waveform only when listening/speaking */}
                            {(isRecording || isSpeaking) ? (
                                <Waveform active={true} color={cfg.accent} />
                            ) : (
                                <p className="text-sm sm:text-base text-[#1a1825]/60 font-medium max-w-[280px] leading-snug mt-1">
                                    {cfg.sublabel}
                                </p>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* ---- AI Response Card ---- */}
                <AnimatePresence>
                    {aiResponse && !isRecording && !isProcessing && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="w-full bg-white rounded-3xl border border-black/5 shadow-sm p-5 sm:p-6 flex flex-col gap-3"
                        >
                            <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-black/30">Luminary says</span>
                            </div>
                            <p className="text-sm sm:text-base text-[#1a1825] leading-relaxed font-medium">
                                {aiResponse}
                            </p>
                            {!isSpeaking && (
                                <button
                                    onClick={() => speak(aiResponse)}
                                    className="self-start flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:text-indigo-600 transition-colors mt-1"
                                >
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                                        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                                    </svg>
                                    Replay
                                </button>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ---- Mic Button ---- */}
                <div className="flex flex-col items-center gap-3 pb-4">
                    <motion.button
                        onClick={isRecording ? stopRecording : startRecording}
                        whileHover={{ scale: 1.06 }}
                        whileTap={{ scale: 0.94 }}
                        className={cn(
                            "w-[72px] h-[72px] rounded-full flex items-center justify-center shadow-xl transition-colors duration-500 focus:outline-none focus:ring-4 focus:ring-offset-2",
                            isRecording
                                ? "bg-red-500 focus:ring-red-300"
                                : "bg-[#1a1825] hover:bg-indigo-600 focus:ring-indigo-300"
                        )}
                        aria-label={isRecording ? "Stop" : "Start speaking"}
                    >
                        {isRecording ? (
                            <motion.span
                                className="block w-6 h-6 rounded-lg bg-white"
                                animate={{ scale: [1, 0.8, 1] }}
                                transition={{ duration: 0.8, repeat: Infinity }}
                            />
                        ) : (
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                                <line x1="12" y1="19" x2="12" y2="23" />
                                <line x1="8" y1="23" x2="16" y2="23" />
                            </svg>
                        )}
                    </motion.button>
                    <p className="text-[10px] font-bold text-black/30 uppercase tracking-[0.25em]">
                        {isRecording ? "Tap to stop" : isProcessing ? "Please wait…" : "Tap to speak"}
                    </p>
                </div>
            </main>

            {/* ─── Footer ─── */}
            <footer className="py-4 text-center border-t border-black/5 bg-white/60">
                <p className="text-[10px] font-medium text-black/25 uppercase tracking-widest">
                    Luminary AI · Answers grounded in your notes
                </p>
            </footer>
        </div>
    );
}
