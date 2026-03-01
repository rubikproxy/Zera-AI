'use server';
/**
 * @fileOverview This file contains the personalized advice flow, updated for health monitoring.
 */

import {ai} from '@/ai/genkit';
import { personalizedAdvicePrompt } from '@/ai/prompts/personalized-advice.prompt';
import {z} from 'genkit';
import { withGroqFallback } from '../groq-fallback';

const PersonalizedAdviceInputSchema = z.object({
  name: z.string().describe('User name'),
  age: z.number().describe('User age'),
  healthData: z.string().describe('Health details provided by user and conversation summary'),
  daysPostpartum: z.number().describe('Days since delivery'),
});
export type PersonalizedAdviceInput = z.infer<typeof PersonalizedAdviceInputSchema>;

const PersonalizedAdviceOutputSchema = z.object({
  recoveryAdvice: z.string(),
  nutritionAdvice: z.string(),
  exerciseAdvice: z.string(),
  mentalWellbeingAdvice: z.string(),
  metrics: z.object({
    heartRate: z.number().describe('Estimated resting heart rate based on reported symptoms/activity'),
    bloodPressure: z.string().describe('Estimated/Contextual blood pressure category (e.g., "118/78 mmHg")'),
    sleepHours: z.number().describe('Estimated daily sleep hours'),
    stressLevel: z.enum(['Stress', 'No Stress']).describe('Predicted stress level'),
    nutritionStatus: z.string().describe('Brief status of nutrition (e.g., "Optimal", "Needs Hydration")'),
  }),
  scores: z.object({
    physical: z.number().min(1).max(10),
    nutrition: z.number().min(1).max(10),
    exercise: z.number().min(1).max(10),
    mental: z.number().min(1).max(10),
  }),
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

const promptWithFallback = withGroqFallback(
    prompt,
    personalizedAdvicePrompt,
    PersonalizedAdviceOutputSchema,
    'personalizedAdviceFlow'
);

const personalizedAdviceFlow = ai.defineFlow(
  {
    name: 'personalizedAdviceFlow',
    inputSchema: PersonalizedAdviceInputSchema,
    outputSchema: PersonalizedAdviceOutputSchema,
  },
  async input => {
    const { output } = await promptWithFallback(input);
    return output!;
  }
);
