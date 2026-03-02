
# Developer Documentation for AI Zera

This document provides a technical overview of the AI Zera application architecture, conventions, and guidelines.

## 🏛️ Project Architecture

The application is a modern Next.js project utilizing the App Router and a server-centric architecture.

- **`src/app`**: Contains the main application pages and layouts.
- **`src/components`**: Contains all React components.
- **`src/ai`**: The heart of the AI functionality, powered by Genkit.
- **`src/lib`**: Utility functions and services (e.g., Pushover notifications).

## 🤖 AI Flow and Data Structure

A typical user interaction follows this sequence:

1.  **User Action** in `chat.tsx`.
2.  **Server Action** in `app/actions.ts`.
3.  **Genkit Flow** in `ai/flows/`.
4.  **Prompt Execution** with Gemini.
5.  **Emergency Detection**: If an emergency is detected, the flow automatically calls the Pushover service.

## 🎨 Styling

- **Tailwind CSS**: Utility-first classes.
- **Typography**: Plus Jakarta Sans for headings (Bold Black), DM Sans for body.
- **Color Palette**: Minimalist light mode with Indigo accents.

## ⚙️ Environment Variables

The application requires the following environment variables:

- **`GEMINI_API_KEY`**: Required for the primary AI model (Google Gemini).
- **`GROQ_API_KEY`**: Required for the fallback AI model (Llama via Groq).
- **`PUSHOVER_TOKEN`**: (Optional but recommended) Pushover API Token for emergency alerts.
- **`PUSHOVER_USER_KEY`**: (Optional but recommended) Pushover User Key for emergency alerts.

The application will skip notifications if Pushover keys are missing, but Gemini keys are mandatory.

## 🚀 How to Add a New AI Feature

1.  **Define a Prompt** in `src/ai/prompts/`.
2.  **Create a Flow** in `src/ai/flows/`.
3.  **Create a Server Action** in `src/app/actions.ts`.
4.  **Integrate with UI** in a client component.
