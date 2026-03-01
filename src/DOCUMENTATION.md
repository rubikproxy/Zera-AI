# Zera AI: Multimodal Deep Learning for Postpartum Health Monitoring

## Abstract Overview
Zera AI is an advanced conversational system designed for postpartum health monitoring, developed as a Postgraduate (PG) research prototype. The system leverages **Multimodal Deep Learning** to analyze user-generated text and historical conversation data to predict physiological and psychological states. A core architectural principle is the simulated use of **Federated Learning** techniques, where sensitive health information is prioritized for local processing and persistence. By combining Google's Gemini 2.5 Flash for high-context natural language understanding with deterministic clinical rule-sets, Zera AI provides a robust, empathetic, and safety-first monitoring matrix for new mothers.

## Introduction
The "fourth trimester"—the first 6–12 weeks after delivery—is a period of high clinical risk often neglected by traditional healthcare infrastructure. Zera AI serves as a technological intervention to bridge this gap. Unlike standard chatbots, Zera is engineered to perform **Health Monitoring based on Conversations**. It doesn't just respond; it synthesizes continuous streams of dialogue into actionable health indices, inferred clinical metrics (like heart rate and stress signals), and structured recovery plans.

## Technology Stack & Rationale
The system utilizes a modern, server-centric architecture to ensure performance, security, and developer efficiency.

*   **Next.js 15 (App Router)**: Enables a unified Full-Stack architecture where AI logic is securely handled via Server Actions.
*   **TypeScript**: Ensures strict data integrity for complex JSON structures returned by the AI models.
*   **Google Genkit & Gemini 2.5 Flash**: Orchestrates the AI "flows." Gemini 2.5 Flash was selected for its exceptional Multimodal reasoning and ability to handle long-context conversation history.
*   **Groq Fallback (Llama 3.3 70B)**: Provides high-availability resilience. If the primary Gemini service experiences latency or rate-limiting, the system seamlessly redirects requests to Groq's low-latency inference engine.
*   **Local Persistence (Simulated Federated Learning)**: User health data and chat histories are persisted in `localStorage`. This architectural decision simulates a decentralized data model where the user's sensitive "Health Matrix" remains on their device.

## AI/ML Model Architecture: The Monitoring Engine
Zera AI operates through a series of specialized, interconnected AI flows:

1.  **Sentiment-Based Clinical Inference**: The system analyzes conversation data to predict clinical metrics:
    *   **Heart Rate & BP Trends**: Inferred based on reported activity levels, fatigue, and pain descriptions.
    *   **Stress Signal Monitoring**: A deep sentiment analysis of user check-ins to distinguish between "Routine Overwhelm" and "High Stress."
2.  **Multimodal Integration**: The AI processes multiple data points—form inputs, daily check-in responses, and recent dialogue—to create a unified **Radar Score** for Physical, Nutrition, Exercise, and Mental domains.
3.  **Structured Output via Zod**: Every AI response is enforced to return as structured JSON. This transforms the LLM into a predictable data source that drives the application's interactive charts and dashboards.

## System Features
*   **Conversational Monitoring Dashboard**: A real-time chat interface that serves as the primary data collection point.
*   **Daily Check-in Monitoring**: Proactive check-ins that guide the user through physical and emotional status updates.
*   **Health Status Portal**: A dedicated consultation workspace where users provide clinical context for deep synthesis.
*   **Interactive Recovery Matrix**: A visual dashboard utilizing Radar Charts and Inferred Metric cards to show health status trends.
*   **Emergency Symptom Triage**: A safety-first module that identifies "High Urgency" signals and triggers immediate escalation protocols.

## PG Workflow: From Dialogue to Data
1.  **Data Acquisition**: User interacts with Zera via the Chat or Daily Check-in.
2.  **Context Assembly**: The system retrieves the local conversation history (`localStorage`) and combines it with current inputs.
3.  **Neural Synthesis**: The Genkit flow invokes Gemini 2.5 Flash, instructing it to analyze the context for recovery signals.
4.  **Metric Prediction**: The AI generates a structured "Health Matrix," including scores and predicted clinical categories.
5.  **Visualization**: The frontend parses this JSON to render interactive charts and status indicators on the Results dashboard.

## Security & Safety Protocols
*   **Privacy-First Design**: By relying on local storage for persistence, the app minimizes the server-side footprint of sensitive health logs.
*   **Clinical Guardrails**: Zera is explicitly programmed to refuse off-topic requests and avoid prescribing medication. Its primary role is education, triage, and support.
*   **Emergency Escalation**: A non-AI deterministic layer handles "High Urgency" symptoms, ensuring that safety alerts are reliable and non-dismissible.

---
*Zera AI is a research prototype developed for educational and demonstration purposes in the field of Multimodal Deep Learning for healthcare.*