'use server';
/**
 * @fileOverview This file contains the personalized advice flow, which provides tailored advice to new mothers on recovery progress, nutrition, exercise, and mental well-being.
 *
 * - personalizedAdvice - A function that takes input related to a mother's health and provides personalized advice.
 * - PersonalizedAdviceInput - The input type for the personalizedAdvice function.
 * - PersonalizedAdviceOutput - The return type for the personalizedAdvice function.
 */

import {ai} from '@/ai/genkit';
import { personalizedAdvicePrompt } from '@/ai/prompts/personalized-advice.prompt';
import {z} from 'genkit';

const PersonalizedAdviceInputSchema = z.object({
  healthData: z.string().describe('A summary of the mother’s current physical and mental health data, including symptoms, vital signs, and mood.'),
  recoveryProgress: z.string().describe('Description of the mother’s recovery progress.'),
  nutritionPreferences: z.string().optional().describe('The mother’s nutrition preferences, if available.'),
  exerciseLevel: z.string().optional().describe('The mother’s current exercise level, if available.'),
  mentalWellbeing: z.string().describe('Information about the mother’s mental and emotional wellbeing.'),
});
export type PersonalizedAdviceInput = z.infer<typeof PersonalizedAdviceInputSchema>;

const PersonalizedAdviceOutputSchema = z.object({
  recoveryAdvice: z.string().describe('Advice related to physical recovery.'),
  nutritionAdvice: z.string().describe('Advice related to nutrition and hydration.'),
  exerciseAdvice: z.string().describe('Advice related to safe, gentle exercise.'),
  mentalWellbeingAdvice: z.string().describe('Advice related to mental and emotional well-being.'),
});
export type PersonalizedAdviceOutput = z.infer<typeof PersonalizedAdviceOutputSchema>;

export async function personalizedAdvice(input: PersonalizedAdviceInput): Promise<PersonalizedAdviceOutput> {
  return personalizedAdviceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedAdvicePrompt',
  input: {schema: PersonalizedAdviceInputSchema},
  output: {schema: PersonalizedAdviceOutputSchema},
  prompt: personalizedAdvicePrompt,
});

const personalizedAdviceFlow = ai.defineFlow(
  {
    name: 'personalizedAdviceFlow',
    inputSchema: PersonalizedAdviceInputSchema,
    outputSchema: PersonalizedAdviceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
