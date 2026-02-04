'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating empathetic and supportive responses for new mothers.
 *
 * - `generateEmpatheticResponse` - A function that generates empathetic responses.
 * - `EmpatheticResponseInput` - The input type for the `generateEmpatheticResponse` function.
 * - `EmpatheticResponseOutput` - The output type for the `generateEmpatheticResponse` function.
 */

import {ai} from '@/ai/genkit';
import { mainPrompt } from '@/ai/prompts/main.prompt';
import {z} from 'genkit';
import { callGroq } from '../groq-fallback';
import Mustache from 'mustache';

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
  prompt: mainPrompt,
});

const empatheticResponseFlow = ai.defineFlow(
  {
    name: 'empatheticResponseFlow',
    inputSchema: EmpatheticResponseInputSchema,
    outputSchema: EmpatheticResponseOutputSchema,
  },
  async input => {
    try {
      const {output} = await prompt(input);
      return output!;
    } catch (e: any) {
        if (e.message && (e.message.includes('429') || e.message.includes('rate limit'))) {
            console.warn('Gemini rate limit exceeded. Falling back to Groq for empathetic response.');
            const renderedPrompt = Mustache.render(mainPrompt, input);
            return await callGroq(renderedPrompt, EmpatheticResponseOutputSchema);
        } else {
            throw e;
        }
    }
  }
);
