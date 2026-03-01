'use server';
/**
 * @fileOverview This file contains the personalized advice flow, updated for health monitoring and trend detection.
 */

import {ai} from '@/ai/genkit';
import { personalizedAdvicePrompt } from '@/ai/prompts/personalized-advice.prompt';
import {z} from 'genkit';
import { withGroqFallback } from '../groq-fallback';

const PersonalizedAdviceInputSchema = z.object({
  name: z.string().describe('User name'),
  age: z.number().describe('User age'),
  healthData: z.string().describe('Current health details provided by user'),
  historyData: z.string().optional().describe('Serialized 7-day health history for trend analysis'),
  daysPostpartum: z.number().describe('Days since delivery'),
});
export type PersonalizedAdviceInput = z.infer<typeof PersonalizedAdviceInputSchema>;

const TrendAlertSchema = z.object({
  severity: z.enum(['low', 'medium', 'high', 'emergency']),
  title: z.string(),
  message: z.string(),
  action: z.string(),
});

const PersonalizedAdviceOutputSchema = z.object({
  recoveryAdvice: z.string(),
  nutritionAdvice: z.string(),
  exerciseAdvice: z.string(),
  mentalWellbeingAdvice: z.string(),
  trendAlerts: z.array(TrendAlertSchema).describe('Detected health patterns or red flags over time'),
  metrics: z.object({
    heartRate: z.number().describe('Estimated/Predicted resting heart rate'),
    bloodPressure: z.string().describe('Estimated/Predicted blood pressure'),
    sleepHours: z.number().describe('Estimated/Predicted daily sleep'),
    steps: z.number().describe('Predicted/Target step count'),
    stressLevel: z.enum(['Stress', 'No Stress']).describe('Predicted stress level'),
    nutritionStatus: z.string().describe('Brief status of nutrition'),
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
