
# Developer Documentation for AI Zera

This document provides a technical overview of the AI Zera application architecture, conventions, and guidelines.

## 🤖 Emergency Notification System (Pushover)

Zera includes an external escalation layer using the Pushover API. This is used to notify medical providers or emergency contacts when the AI detects a life-threatening situation.

### Setup Instructions:
1.  **Download Pushover**: Install the Pushover app on your iOS/Android device.
2.  **Create Application**: Log in to [pushover.net](https://pushover.net) and create a new "Application/API Token".
3.  **Environment Variables**: Add these to your `.env` file:
    ```env
    PUSHOVER_TOKEN="your_app_token_here"
    PUSHOVER_USER_KEY="your_user_key_here"
    ```

### How to Test:
Type an emergency symptom in the chat, for example:
> *"I'm bleeding very heavily, I've soaked through two pads in the last hour and I feel very dizzy and faint."*

- **On Screen**: The Zera UI will show the "Bold Black" Emergency Dialog.
- **In Terminal**: You will see `[Pushover] Emergency notification sent successfully`.
- **On Phone**: You will receive a loud, high-priority emergency alert.

## 🏛️ Project Architecture

The application is a modern Next.js project utilizing the App Router and a server-centric architecture.

- **`src/app`**: Contains the main application pages and layouts.
- **`src/components`**: Contains all React components.
- **`src/ai`**: The heart of the AI functionality, powered by Genkit.
- **`src/lib`**: Utility functions and services (e.g., Pushover notifications).

## 🎨 Styling

- **Tailwind CSS**: Utility-first classes.
- **Typography**: Plus Jakarta Sans for headings (Bold Black), DM Sans for body.
- **Color Palette**: Minimalist light mode with Indigo accents.

## ⚙️ Environment Variables

The application requires the following environment variables:

- **`GEMINI_API_KEY`**: Required for the primary AI model (Google Gemini).
- **`GROQ_API_KEY`**: Required for the fallback AI model (Llama via Groq).
- **`PUSHOVER_TOKEN`**: Pushover API Token for emergency alerts.
- **`PUSHOVER_USER_KEY`**: Pushover User Key for emergency alerts.
