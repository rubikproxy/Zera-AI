'use server';

/**
 * @fileOverview An AI agent for providing general postpartum health tips.
 * - getHealthTip - A function that provides a random health tip.
 * - HealthTipInput - The input for the function.
 * - HealthTipOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

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
  prompt: `You are a postpartum health expert. Your task is to provide a single, actionable, and supportive health tip for a new mother. The tip should be relevant to her stage of recovery.

  Days Postpartum: {{{daysPostpartum}}}

  Avoid repeating these tips that have been shown before:
  {{#each previousTips}}
  - {{{this}}}
  {{/each}}

  Generate one new tip from one of the following categories: Nutrition, Exercise, Mental Well-being, or General Recovery. The tip should be concise and easy to understand.
`,
});

const healthTipFlow = ai.defineFlow(
  {
    name: 'healthTipFlow',
    inputSchema: HealthTipInputSchema,
    outputSchema: HealthTipOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
