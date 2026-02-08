
# AI Zera: Postpartum Health Assistant

AI Zera is an advanced, AI-powered conversational assistant designed to provide empathetic, evidence-based support for new mothers during the critical postpartum period. Built with Next.js and Google's Genkit, Zera offers a safe, private, and accessible space for users to ask questions, track symptoms, and receive personalized guidance.

![AI Zera Screenshot](https://storage.googleapis.com/studioprompt-artefacts/clx7nvo7s0001m808oaqe6s5v/clx7nwp0y0002m8085s0x4awo.png)

## ✨ Key Features

- **Conversational AI Chat**: Real-time, natural language conversations with Zera, an AI persona specialized in postpartum care.
- **Symptom Triage & Emergency Escalation**: Intelligently analyzes user-described symptoms to identify high-urgency situations and provides clear instructions to seek medical help.
- **Mental Health Screening**: Integrates the Edinburgh Postnatal Depression Scale (EPDS) directly into the chat, allowing users to complete the screening and receive an immediate, AI-driven assessment.
- **Wound Image Analysis**: Users can upload a photo of a C-section wound, and the AI will analyze it for signs of infection and assess the healing progress.
- **Personalized Advice**: Delivers tailored advice across physical recovery, nutrition, exercise, and mental well-being based on conversation history.
- **Dynamic Suggestions**: Proactively suggests follow-up questions and actions to guide the user and make the conversation flow more naturally.
- **Robust Fallback System**: Automatically switches from Gemini to Groq's Llama models if the primary AI service is unavailable, ensuring high availability.
- **Multilingual Support**: Fully functional in English, Spanish, and French.

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, Server Actions)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **AI Orchestration**: [Genkit](https://firebase.google.com/docs/genkit)
- **AI Models**: [Google Gemini](https://deepmind.google/technologies/gemini/), [Groq Llama 3.1](https://groq.com/) (for fallback)
- **UI**: [React](https://react.dev/), [ShadCN UI](https://ui.shadcn.com/), [Tailwind CSS](https://tailwindcss.com/)
- **State Management**: React Hooks

## 🚀 Getting Started

Follow these instructions to get the project running locally for development and testing.

### Prerequisites

- [Node.js](https://nodejs.org/en) (v20 or later)
- An API key for Google AI Studio ([Gemini](https://aistudio.google.com/app/apikey))
- An API key for [Groq](https://console.groq.com/keys)

### 1. Clone the Repository

```bash
git clone https://github.com/your-repo/ai-zera.git
cd ai-zera
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a file named `.env` in the root of the project and add your API keys:

```env
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
GROQ_API_KEY="YOUR_GROQ_API_KEY"
```

### 4. Run the Development Servers

You need to run two processes in separate terminals: the Next.js web app and the Genkit AI flows.

**Terminal 1: Run the Next.js App**

```bash
npm run dev
```

This will start the web application, typically on `http://localhost:9002`.

**Terminal 2: Run the Genkit Flows**

```bash
npm run genkit:dev
```

This starts the Genkit development server, which makes the AI flows available for the Next.js app to call. This also opens the Genkit Developer UI, typically on `http://localhost:4000`, where you can inspect and test your flows.

You're all set! Open your browser to `http://localhost:9002` to start chatting with Zera.
