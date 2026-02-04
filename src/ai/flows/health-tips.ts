'use server';

/**
 * @fileOverview An AI agent for providing general postpartum health tips.
 * - getHealthTip - A function that provides a random health tip.
 * - HealthTipInput - The input for the function.
 * - HealthTipOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import { healthTipsPrompt } from '@/ai/prompts/health-tips.prompt';
import {z} from 'genkit';
import { callGroq } from '../groq-fallback';
import Mustache from 'mustache';

const HealthTipInputSchema = z.object({
  previousTips: z.array(z.string()).describe('A list of tips that have already been shown to the user to avoid repetition.'),
  daysPostpartum: z.number().describe('How many days have passed since delivery.'),
});
export type HealthTipInput = z.infer<typeof HealthTipInputSchema>;

const HealthTipOutputSchema = z.object({
  category: z.string().describe('The category of the tip (e.g., Nutrition, Exercise, Mental Well-being, Recovery).'),
  tip: z.string().describe('A single, actionable health tip relevant to the postpartum period.'),
});
export type HealthTipOutput = z.infer<typeof HealthTipOutputSchema>;

export async function getHealthTip(input: HealthTipInput): Promise<HealthTipOutput> {
  return healthTipFlow(input);
}

const prompt = ai.definePrompt({
  name: 'healthTipPrompt',
  input: {schema: HealthTipInputSchema},
  output: {schema: HealthTipOutputSchema},
  prompt: healthTipsPrompt,
});

const healthTipFlow = ai.defineFlow(
  {
    name: 'healthTipFlow',
    inputSchema: HealthTipInputSchema,
    outputSchema: HealthTipOutputSchema,
  },
  async input => {
    try {
      const {output} = await prompt(input);
      return output!;
    } catch (e: any) {
        if (e.message && (e.message.includes('429') || e.message.includes('rate limit'))) {
            console.warn('Gemini rate limit exceeded. Falling back to Groq for health tips.');
            const renderedPrompt = Mustache.render(healthTipsPrompt, input);
            return await callGroq(renderedPrompt, HealthTipOutputSchema);
        } else {
            throw e;
        }
    }
  }
);
