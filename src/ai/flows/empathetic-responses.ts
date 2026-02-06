'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating empathetic and supportive responses for new mothers.
 *
 * - `generateEmpatheticResponse` - A function that generates empathetic responses.
 * - `EmpatheticResponseInput` - The input type for the `generateEmpatheticResponse` function.
 * - `EmpatheticResponseOutput` - The output type for the `generateEmpatheticResponse` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { withGroqFallback } from '../groq-fallback';
import { empatheticResponseFallbackPrompt } from '@/ai/prompts/empathetic-response-fallback.prompt';

const EmpatheticResponseInputSchema = z.object({
  userInput: z.string().describe('The user input or message from the new mother.'),
  context: z
    .string()
    .optional()
    .describe('Additional context about the user or situation.'),
  language: z.string().optional().describe('The language for the response (e.g., "English", "Español").'),
});
export type EmpatheticResponseInput = z.infer<typeof EmpatheticResponseInputSchema>;

const EmpatheticResponseOutputSchema = z.object({
  response: z.string().describe('The empathetic and supportive response from the chatbot.'),
});
export type EmpatheticResponseOutput = z.infer<typeof EmpatheticResponseOutputSchema>;

export async function generateEmpatheticResponse(input: EmpatheticResponseInput): Promise<EmpatheticResponseOutput> {
  return empatheticResponseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'empatheticResponsePrompt',
  input: {schema: EmpatheticResponseInputSchema},
  output: {schema: EmpatheticResponseOutputSchema},
  prompt: empatheticResponseFallbackPrompt,
});

const promptWithFallback = withGroqFallback(
    prompt,
    empatheticResponseFallbackPrompt,
    EmpatheticResponseOutputSchema,
    'empatheticResponseFlow'
);

const empatheticResponseFlow = ai.defineFlow(
  {
    name: 'empatheticResponseFlow',
    inputSchema: EmpatheticResponseInputSchema,
    outputSchema: EmpatheticResponseOutputSchema,
  },
  async input => {
    const { output } = await promptWithFallback(input);
    return output!;
  }
);
