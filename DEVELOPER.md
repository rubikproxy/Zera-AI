
# Developer Documentation for AI Zera

This document provides a technical overview of the AI Zera application architecture, conventions, and guidelines for developers.

## 🏛️ Project Architecture

The application is a modern Next.js project utilizing the App Router and a server-centric architecture.

- **`src/app`**: Contains the main application pages and layouts. The UI is built with Server Components by default, with interactivity delegated to Client Components (`'use client'`).
  - **`layout.tsx`**: The root layout, which sets up the base HTML structure, fonts, and global styles.
  - **`page.tsx`**: The main entry point for the chat interface, containing the sidebar and chat panel layout.
  - **`actions.ts`**: A collection of Next.js Server Actions. This is the bridge between the client-side UI and the server-side Genkit flows.

- **`src/components`**: Contains all React components.
  - **`ui/`**: Holds the base components from the ShadCN UI library.
  - **`chat.tsx`**: The core interactive component. It manages the conversation state, handles user input, calls Server Actions, and renders messages.
  - **`header.tsx`**: The fixed top header.
  - **`emergency-dialog.tsx`**: The modal dialog for urgent health alerts.

- **`src/ai`**: The heart of the AI functionality, powered by Genkit.
  - **`genkit.ts`**: Initializes and configures the main Genkit instance and specifies the primary AI model (Gemini).
  - **`flows/`**: Each file in this directory defines a specific AI capability (e.g., `symptom-understanding.ts`, `daily-check-in-questions.ts`).
  - **`prompts/`**: Contains the string templates for the AI prompts, written in Handlebars format. This separation makes prompts easy to manage.
  - **`groq-fallback.ts`**: A higher-order function (`withGroqFallback`) that wraps a Genkit prompt. It provides a resilient fallback mechanism, automatically retrying a failed Gemini request with the Groq API.

## 🤖 AI Flow and Data Structure

A typical user interaction follows this sequence:

1.  **User Action** (e.g., sends a message) in `chat.tsx`.
2.  The component calls a **Server Action** from `app/actions.ts` (e.g., `getSymptomUnderstanding`).
3.  The Server Action calls the corresponding **Genkit Flow** from `ai/flows/` (e.g., `understandSymptoms`).
4.  The Genkit flow executes a **Prompt**, sending the user input and prompt template to the configured AI model (Gemini).
5.  If the Gemini API call fails (e.g., due to rate limits), the `withGroqFallback` wrapper automatically retries the request using the Groq API.
6.  The AI response, structured by a Zod schema, is returned back up the chain to the `chat.tsx` component.
7.  The `chat.tsx` component updates its state, and React renders the new message or UI element.

### Zod Schemas

We use [Zod](https://zod.dev/) extensively to define the input and output shapes for our AI flows. This provides strong typing and runtime validation, forcing the LLM to return structured JSON that our application can reliably use.

## 🎨 Styling

- **Tailwind CSS**: Used for all styling. Utility-first classes are preferred.
- **ShadCN UI**: Provides the unstyled, accessible base components in `src/components/ui`.
- **Theme**: The application's color palette and theme are defined using CSS variables in `src/app/globals.css`, following ShadCN conventions.

## 📝 How to Add a New AI Feature

Follow this pattern to add a new capability to Zera:

1.  **Define a Prompt**: Create a new file in `src/ai/prompts/` (e.g., `new-feature.prompt.ts`). Write a clear, concise prompt for the LLM. Use `{{{variable}}}` for Mustache-style templating.

2.  **Create a Flow**: Create a new file in `src/ai/flows/` (e.g., `new-feature.ts`).
    - Import `ai` from `../genkit`.
    - Define Zod schemas for the `Input` and `Output` of your flow. These schemas are crucial for structured data.
    - Create a `definePrompt` object, linking to your new prompt file and schemas.
    - Wrap the prompt with `withGroqFallback` to ensure resilience.
    - Create a `defineFlow` object that calls your wrapped prompt.
    - Export an async wrapper function that calls the flow. This is what the Server Action will use.

3.  **Create a Server Action**: In `src/app/actions.ts`, add a new `async` function that imports and calls the flow's wrapper function from the previous step.

4.  **Integrate with UI**: In `src/components/chat.tsx` or another client component:
    - Import the new Server Action.
    - Call the action and handle the returned data.
    - Create a new component to render the structured output if necessary.

## ⚙️ Environment Variables

- **`GEMINI_API_KEY`**: Required for the primary AI model (Google Gemini).
- **`GROQ_API_KEY`**: Required for the fallback AI model (Llama via Groq).

The application will fail if these are not set in the `.env` file.
