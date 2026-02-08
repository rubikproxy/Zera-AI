# Zera AI: Technical and Feature Overview

## 1. Introduction: What is Zera AI?

Zera is a specialized, AI-powered conversational assistant designed to provide empathetic, evidence-based support for new mothers during the critical postpartum period. Our mission is to offer a safe, private, and accessible resource for users to ask questions, track symptoms, and receive personalized guidance on their health and their newborn's well-being.

## 2. How Zera Works: The Technology Behind the Conversation

Zera is built on a modern, robust technical foundation to ensure a seamless and intelligent user experience.

-   **User Interaction**: A user interacts with Zera through a simple chat interface. They can type messages, select from suggested prompts, or even upload images.
-   **AI Orchestration**: Every user message is processed by **Google's Genkit**, an advanced AI orchestration framework. Genkit acts as the "brain," deciding which AI model to use and which specialized tool is needed to best answer the user's query.
-   **Structured Understanding**: Instead of just getting a text response, Genkit analyzes the user's input and structures it into meaningful data. For example, it can identify specific symptoms, determine the urgency of a situation, or categorize the topic of conversation. This allows Zera to perform specific actions, not just talk.
-   **Intelligent Response Generation**: Based on its understanding, Zera selects the appropriate AI flow to generate a response. This could be a simple empathetic chat message, a detailed analysis of a wound photo, or a critical emergency alert.

## 3. Core AI Models

To provide a highly available and reliable service, Zera uses a multi-model strategy:

-   **Primary Model: Google Gemini 2.5 Flash**: Our main AI model is Google's Gemini, a powerful and efficient model known for its speed and multimodal capabilities (understanding both text and images). All primary requests are routed to Gemini.
-   **Fallback Model: Groq Llama 3.1 70B**: In the rare event that the Gemini API is unavailable or experiences issues (like rate limiting), our system **automatically and seamlessly** switches to a powerful open-source model, Llama 3.1, served via the ultra-fast Groq API. This ensures Zera remains responsive and available 24/7. This fallback mechanism is a key feature for production-grade reliability.

## 4. Key Features: A Detailed Breakdown

Zera is equipped with several specialized capabilities to support postpartum mothers:

### a. Conversational AI Chat & Empathetic Responses
Zera is trained to be an empathetic and supportive conversational partner. It can discuss topics ranging from physical recovery and mental health to newborn care basics.

### b. Symptom Triage & Emergency Escalation
-   **How it works**: When a user describes a symptom (e.g., "I have a severe headache and my vision is blurry"), the `symptom-understanding` flow analyzes the text to determine an urgency level (`low`, `medium`, `high`).
-   **Emergency Protocol**: If the urgency is classified as `high`, the `emergency-escalation` flow is immediately triggered. This flow is specifically designed to recognize critical "red flag" symptoms of postpartum complications (like preeclampsia or hemorrhage).
-   **User Alert**: If an emergency is detected, the system bypasses a normal chat response and instead displays a full-screen **Urgent Health Alert**, instructing the user to seek immediate medical attention.

### c. Mental Health Screening (EPDS)
-   **How it works**: Users can initiate a mental health screening from the sidebar or by expressing feelings of sadness, anxiety, or being overwhelmed.
-   **Guided Questionnaire**: Zera presents the 10 questions from the clinically validated **Edinburgh Postnatal Depression Scale (EPDS)**, one at a time.
-   **Instant Assessment**: Once complete, the answers are scored locally within the application (not by the LLM, to ensure clinical accuracy). Zera then provides an immediate, AI-generated assessment based on the score, explaining what the score means and providing clear next steps, including crisis resources if a high risk is detected.

### d. Wound Image Analysis
-   **How it works**: A user can upload a photo of a C-section wound.
-   **AI Vision**: The image is sent to the **Google Gemini Vision model**, which is trained to analyze images.
-   **Structured Analysis**: The AI returns a structured analysis, assessing the healing stage, and identifying signs of infection (redness, swelling, discharge) with a severity score. It concludes with an overall assessment (`Normal Healing`, `Needs Monitoring`, `Requires Medical Attention`) and provides actionable recommendations.

### e. Personalized Advice & Dynamic Suggestions
-   **Personalized Advice**: Zera can synthesize the conversation history and other data points to provide tailored advice across physical recovery, nutrition, exercise, and mental well-being.
-   **Dynamic Suggestions**: After every response, Zera analyzes the context of the conversation and generates a new set of relevant follow-up questions for the user to click. This proactive guidance makes the conversation feel more natural and helps users explore topics they may not have thought to ask about. This is powered by the `generate-suggestions` flow.

## 5. Safety, Privacy, and Scope
-   **Safety First**: Zera is programmed with hard rules to prioritize user safety. It will always err on the side of caution and recommend professional medical evaluation when there is any uncertainty. It is explicitly designed NOT to provide a diagnosis but to offer support and triage.
-   **Privacy**: The conversation is handled securely. The application does not store conversation history long-term.
-   **Strict Scope**: Zera is strictly focused on postpartum maternal and infant care. It is programmed to refuse any off-topic questions (e.g., about politics, general knowledge, etc.) and gently guide the conversation back to its core purpose.

## 6. End of Session
A session with Zera is fluid. The user can start a new chat at any time by clicking the "New Chat" button, which clears the context and begins a fresh conversation. There is no formal "end" to a session, allowing users to return to their conversation at their convenience.
