# Zera AI: Multimodal Deep Learning & Federated Learning Prototype

## Abstract Overview
Zera AI is a state-of-the-art conversational monitoring system designed for postpartum maternal care. Developed as a Postgraduate (PG) research prototype, it explores the intersection of **Multimodal Deep Learning** and **Federated Learning**. The system prioritizes data sovereignty by maintaining all sensitive health logs, biometric inferences, and chat histories within a **Local Node** (User's browser environment). By leveraging Google Gemini 2.5 Flash for nuanced natural language synthesis, Zera transforms daily dialogue into a clinical "Health Matrix."

## Introduction
The postpartum period, or the "fourth trimester," is a high-risk phase with limited continuous monitoring. Zera AI serves as a technological bridge, providing **Health Monitoring based on Conversations**. It doesn't just respond empathetically; it proactively analyzes user sentiment, reported symptoms, and activity trends to predict physiological status and trigger triage protocols when high-risk signals are detected.

## Architectural Pillar: Local-First Data Residency
A core requirement of this PG project is simulating a **Federated Learning** environment. 
*   **Persistence Layer**: The application utilizes a combination of `localStorage` and `IndexedDB` (simulated via robust local state management) to ensure all data residency is local.
*   **Privacy-Preserving Inference**: While the AI processing happens via cloud-based LLMs (Gemini/Llama), the context used is limited to the session, and the resulting structured biometrics are stored locally on the user's laptop/device.
*   **Identity Node**: Users must initialize a "Health Identity Profile" before monitoring begins, which acts as the anchor for all future clinical inferences.

## Technology Stack
*   **Next.js 15 (App Router)**: Drives a modular, full-stack React architecture.
*   **TypeScript**: Ensures type-safety for complex clinical JSON schemas.
*   **Google Genkit & Gemini 2.5 Flash**: Orchestrates the Multimodal "flows" and high-context reasoning.
*   **Groq Llama 3.3 (Fallback)**: Provides inference resilience and low-latency response backup.
*   **Recharts / Shadcn UI**: Powers the interactive "2070" style dashboards and Radar Charts.

## The Monitoring Engine: Inferred Biometrics
The system analyzes unstructured conversation to estimate:
*   **Heart Rate Trends**: Inferred from activity descriptions, stress cues, and physical comfort reports.
*   **Blood Pressure Category**: Estimated based on reported headache severity, vision changes, or baseline historical trends provided in the profile.
*   **Stress Sentiment**: A continuous deep-learning analysis of dialogue to classify current emotional states as "Stress" or "No Stress."
*   **Recovery Scoring**: A 1-10 radar score across Physical, Nutrition, Exercise, and Mental domains.

## PG Workflow
1.  **Initialization**: User creates a Local Profile (Identity Node).
2.  **Data Acquisition**: Through Daily Check-ins or free-form chat.
3.  **Neural Synthesis**: Genkit flows combine current input with local history.
4.  **Metric Prediction**: AI returns structured JSON containing predicted biometrics.
5.  **Visualization**: The Monitoring Dashboard renders interactive cards and radar charts for immediate user feedback.

## Security & Ethics
*   **Clinical Guardrails**: Zera is programmed with strict scope enforcement—it refuses off-topic requests and never prescribes medication.
*   **Emergency Triage**: A deterministic layer evaluates high-risk symptoms and triggers non-dismissible alerts.
*   **Data Minimization**: No sensitive personal data is transmitted to the server for long-term storage; all persistence is client-side.

---
*Zera AI is a research prototype developed for educational demonstration in the field of Multimodal Deep Learning for healthcare.*
