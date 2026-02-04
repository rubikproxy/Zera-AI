'use server';

/**
 * @fileOverview An AI agent for generating dynamic suggested user prompts.
 * - generateSuggestions - A function that provides suggested questions based on conversation history.
 * - GenerateSuggestionsInput - The input for the function.
 * - GenerateSuggestionsOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import { generateSuggestionsPrompt } from '@/ai/prompts/generate-suggestions.prompt';
import {z} from 'genkit';

const GenerateSuggestionsInputSchema = z.object({
  conversationHistory: z.string().describe("A summary of the recent conversation between the user and the AI."),
});
export type GenerateSuggestionsInput = z.infer<typeof GenerateSuggestionsInputSchema>;

const GenerateSuggestionsOutputSchema = z.object({
  suggestions: z.array(z.string()).describe('An array of 3-4 suggested questions or actions for the user.'),
});
export type GenerateSuggestionsOutput = z.infer<typeof GenerateSuggestionsOutputSchema>;


export async function generateSuggestions(input: GenerateSuggestionsInput): Promise<GenerateSuggestionsOutput> {
  return generateSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSuggestionsPrompt',
  input: {schema: GenerateSuggestionsInputSchema},
  output: {schema: GenerateSuggestionsOutputSchema},
  prompt: generateSuggestionsPrompt,
});

const generateSuggestionsFlow = ai.defineFlow(
  {
    name: 'generateSuggestionsFlow',
    inputSchema: GenerateSuggestionsInputSchema,
    outputSchema: GenerateSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
