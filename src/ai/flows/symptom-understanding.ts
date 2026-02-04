'use server';

/**
 * @fileOverview A symptom understanding AI agent.
 *
 * - understandSymptoms - A function that handles the symptom understanding process.
 * - UnderstandSymptomsInput - The input type for the understandSymptoms function.
 * - UnderstandSymptomsOutput - The return type for the understandSymptoms function.
 */

import {ai} from '@/ai/genkit';
import { symptomUnderstandingPrompt } from '@/ai/prompts/symptom-understanding.prompt';
import {z} from 'genkit';

const UnderstandSymptomsInputSchema = z.object({
  symptomsDescription: z
    .string()
    .describe('A description of the symptoms experienced by the user.'),
});
export type UnderstandSymptomsInput = z.infer<typeof UnderstandSymptomsInputSchema>;

const UnderstandSymptomsOutputSchema = z.object({
  symptomsSummary: z
    .string()
    .describe('A concise summary of the symptoms described by the user.'),
  symptomsKeywords: z
    .array(z.string())
    .describe('A list of keywords extracted from the symptoms description.'),
  urgencyLevel: z
    .enum(['low', 'medium', 'high'])
    .describe(
      'The urgency level of the symptoms, based on the description. low, medium, or high.'
    ),
});
export type UnderstandSymptomsOutput = z.infer<typeof UnderstandSymptomsOutputSchema>;

export async function understandSymptoms(input: UnderstandSymptomsInput): Promise<UnderstandSymptomsOutput> {
  return understandSymptomsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'understandSymptomsPrompt',
  input: {schema: UnderstandSymptomsInputSchema},
  output: {schema: UnderstandSymptomsOutputSchema},
  prompt: symptomUnderstandingPrompt,
});

const understandSymptomsFlow = ai.defineFlow(
  {
    name: 'understandSymptomsFlow',
    inputSchema: UnderstandSymptomsInputSchema,
    outputSchema: UnderstandSymptomsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
