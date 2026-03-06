#  Luminary — AI-Powered Study Companion

> **Your notes, brought to life. Ask, listen, and learn like never before.**

Luminary is a premium, AI-powered study platform that transforms static PDF notes into an immersive, interactive tutoring experience. Upload your study materials and engage with them through a beautiful visual interface, intelligent chat, and a warm voice tutor that actually sounds human.

---

## Features

### Voice Tutor (Prof. Luminary)
Have a natural, hands-free conversation with your notes. Prof. Luminary listens to your questions, thinks through them in real-time, and speaks back the answers in plain English — all strictly grounded in your own study material.

### Interactive Book Interface
Experience a beautifully animated 3D book on the landing page. Hover over it to peek inside your uploaded notes, and click to upload a new subject — it's studying, but make it beautiful.

### Smart Chat with Citations
Ask deep questions about your notes and get answers with verbatim citations and a confidence score. Every response is scoped strictly to your material — no hallucinations, no off-topic rabbit holes.

### Practice Room
Challenge yourself with auto-generated MCQs and short-answer questions crafted directly from your notes. Reveal correct answers with hover interactions and track your understanding topic by topic.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | [Next.js 15](https://nextjs.org/) (App Router) |
| **Animation** | [Motion](https://motion.dev/) (Framer Motion) & [GSAP](https://gsap.com/) |
| **Styling** | [Tailwind CSS 4](https://tailwindcss.com/) |
| **Voice** | Web Speech API (STT + TTS) |
| **Backend** | [Node.js](https://nodejs.org/) + [Express.js](https://expressjs.com/) |
| **AI Engine** | [Groq Cloud](https://groq.com/) – Llama 3.1 8B Instant |
| **PDF Engine** | [pdf-parse](https://www.npmjs.com/package/pdf-parse) |
| **Persistence** | Local JSON session storage |

---

## Getting Started

### Prerequisites
- Node.js v18+
- A Groq API Key from [GroqCloud](https://console.groq.com/)

### Setup

```bash
# 1. Clone the repository
git clone https://github.com/Vansh0204/Askmynotes-Mavericks.git
cd Askmynotes-Mavericks

# 2. Start the Backend
cd backend
# Add GROQ_API_KEY to .env
npm install && npm run dev

# 3. Start the Frontend (new terminal)
cd frontend
npm install && npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```
/
├── frontend/          # Next.js App (UI, voice, chat, study room)
├── backend/           # Express server (AI bridge, PDF extraction)
└── ARCHITECTURE.md    # System design and data flow documentation
```

---

## Built for hackathons. Designed for humans.

> Speed, aesthetics, and intelligence — Luminary is ready to impress.
