'use server';

/**
 * @fileOverview An AI agent for providing breastfeeding support.
 * - getBreastfeedingSupport - A function that provides advice on breastfeeding.
 * - BreastfeedingSupportInput - The input for the function.
 * - BreastfeedingSupportOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import { breastfeedingSupportPrompt } from '@/ai/prompts/breastfeeding-support.prompt';
import {z} from 'genkit';

const BreastfeedingSupportInputSchema = z.object({
  problemDescription: z.string().describe('The user\'s description of their breastfeeding problem (e.g., "my nipples are sore", "baby won\'t latch").'),
});
export type BreastfeedingSupportInput = z.infer<typeof BreastfeedingSupportInputSchema>;

const BreastfeedingSupportOutputSchema = z.object({
  assessment: z.string().describe("A summary of the likely issue based on the user's description."),
  immediateRelief: z.array(z.string()).describe('A list of steps the user can take for immediate relief.'),
  longTermSolutions: z.array(z.string()).describe('A list of long-term solutions, like improving latch.'),
  whenToCallProvider: z.string().describe('Specific signs that indicate the user should contact a healthcare provider.'),
});
export type BreastfeedingSupportOutput = z.infer<typeof BreastfeedingSupportOutputSchema>;


export async function getBreastfeedingSupport(input: BreastfeedingSupportInput): Promise<BreastfeedingSupportOutput> {
  return breastfeedingSupportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'breastfeedingSupportPrompt',
  input: {schema: BreastfeedingSupportInputSchema},
  output: {schema: BreastfeedingSupportOutputSchema},
  prompt: breastfeedingSupportPrompt,
});

const breastfeedingSupportFlow = ai.defineFlow(
  {
    name: 'breastfeedingSupportFlow',
    inputSchema: BreastfeedingSupportInputSchema,
    outputSchema: BreastfeedingSupportOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
