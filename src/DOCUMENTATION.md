# Zera AI: Technical and Feature Overview

## Abstract Overview
Zera AI is a specialized conversational assistant providing empathetic, evidence-based support for postpartum mothers. It leverages a dual-AI model strategy (Google Gemini and Groq Llama) for high availability, offering features like emergency symptom triage, mental health screening, and C-section wound analysis to ensure user safety and well-being.

## Introduction
Zera is an AI-powered companion designed for the critical postpartum period. It offers new mothers a safe, private, and accessible space to ask questions, track symptoms, and receive personalized guidance on their health and their newborn's well-being. The core mission is to provide reliable support, prioritize user safety, and escalate critical health issues to medical professionals when necessary.

## Technology Stack
The application is built on a modern, robust technical foundation:
*   **Framework**: Next.js (App Router)
*   **Language**: TypeScript
*   **AI Orchestration**: Google Genkit
*   **UI Components**: React, ShadCN UI
*   **Styling**: Tailwind CSS
*   **State Management**: React Hooks & Server Actions

## AI/ML Models
Zera employs a resilient, multi-model strategy to ensure a highly available service:
*   **Primary Model: Google Gemini 2.5 Flash**: Our main AI model is Google's Gemini, a powerful and efficient model known for its speed and multimodal capabilities (understanding both text and images). All primary requests are routed to Gemini.
*   **Fallback Model: Groq Llama 3.1 70B**: In the event that the Gemini API is unavailable or experiences issues (like rate limiting), our system automatically and seamlessly switches to a powerful open-source model, Llama 3.1, served via the ultra-fast Groq API. This ensures Zera remains responsive and available 24/7.

## Architecture
The application architecture is designed for performance, scalability, and maintainability.
1.  **Frontend (Client-Side)**: Built with Next.js and React, the user interface is composed of server components for fast initial loads, with interactive "client components" (like the chat window) that handle user input and state.
2.  **Backend (Server-Side)**: We use Next.js Server Actions as the bridge between the client and our AI logic. When a user sends a message, a Server Action is called, which then executes the appropriate AI function on the server.
3.  **AI Layer (Genkit)**: All AI functionality is managed by Google's Genkit. Genkit orchestrates "flows"—specialized AI tasks that define which prompt to use, what data to expect, and how to structure the output. This is where the logic for symptom analysis, empathetic responses, and other features lives.

## Features
Zera is equipped with several specialized capabilities:
*   **Conversational AI Chat**: Empathetic, supportive conversations on topics ranging from physical recovery and mental health to newborn care basics.
*   **Symptom Triage & Emergency Escalation**: The AI analyzes user-described symptoms to determine an urgency level. For "high" urgency, it triggers an **Urgent Health Alert**, instructing the user to seek immediate medical attention for red-flag symptoms (like preeclampsia or hemorrhage).
*   **Mental Health Screening (EPDS)**: Zera guides the user through the clinically validated Edinburgh Postnatal Depression Scale (EPDS). The score is calculated locally (for accuracy), and the AI provides an immediate assessment and clear next steps, including crisis resources if high risk is detected.
*   **Wound Image Analysis**: Users can upload a photo of a C-section wound. The Gemini Vision model analyzes it for healing stage and signs of infection, returning a structured assessment and actionable recommendations.
*   **Personalized Advice & Dynamic Suggestions**: Zera provides tailored advice based on conversation history and generates relevant follow-up questions after each response to guide the user naturally.

## Workflow
A typical user interaction follows a clear, secure workflow:
1.  **User Action**: The user types a message or uploads an image in the chat interface.
2.  **Server Action Called**: The chat component calls a secure Next.js Server Action.
3.  **Genkit Flow Execution**: The Server Action invokes the relevant Genkit AI flow on the server (e.g., `understandSymptoms` or `analyzeWound`).
4.  **AI Model Invocation**: The Genkit flow formats the user's input into a prompt and sends it to the primary AI model (Gemini).
5.  **Fallback Mechanism**: If the Gemini API fails, the `withGroqFallback` wrapper automatically retries the request using the Groq Llama model, ensuring the user always gets a response.
6.  **Structured Response**: The AI model returns a structured JSON object (validated by Zod), not just plain text.
7.  **UI Update**: The structured response is sent back to the chat component, which updates its state and renders the new message or UI element (like the emergency alert or wound analysis card).

## Security and Safety
User safety and data privacy are foundational principles of Zera.
*   **Safety-First Protocol**: Zera is programmed to prioritize user safety above all. It is explicitly designed **NOT** to provide a diagnosis but to offer support and triage. It will always err on the side of caution and recommend professional medical evaluation when there is any uncertainty.
*   **Scope Enforcement**: Zera is strictly focused on postpartum maternal and infant care. It is programmed to refuse any off-topic questions (e.g., about politics, general knowledge) and gently guide the conversation back to its core purpose. This prevents misuse and prompt injection.
*   **Privacy**: Conversations are handled securely on the server. The application does not request sensitive personal identifiers and is designed to process information without long-term storage of chat logs.
*   **Clinical Guardrails**: For features like the EPDS screening, clinical scoring logic is hard-coded into the application and is not performed by the LLM, ensuring 100% accuracy and adherence to clinical standards. Emergency protocols are similarly rule-based to ensure they always trigger when needed.
