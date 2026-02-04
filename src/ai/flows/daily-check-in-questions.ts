'use server';

/**
 * @fileOverview A daily check-in AI agent for postpartum mothers.
 *
 * - dailyCheckIn - A function that handles the daily check-in process.
 * - DailyCheckInInput - The input type for the dailyCheckIn function.
 * - DailyCheckInOutput - The return type for the dailyCheckIn function.
 */

import {ai} from '@/ai/genkit';
import { questionPrompt } from '@/ai/prompts/question.prompt';
import {z} from 'genkit';
import { callGroq } from '../groq-fallback';
import Mustache from 'mustache';

const DailyCheckInInputSchema = z.object({
  previousResponses: z
    .string()
    .describe(
      'A string containing the new mother\'s previous responses.  If this is the first time, this should be an empty string.'
    ),
  currentDate: z
    .string()
    .describe(
      'The current date in ISO format.'
    ),
});
export type DailyCheckInInput = z.infer<typeof DailyCheckInInputSchema>;

const DailyCheckInOutputSchema = z.object({
  questions: z.array(z.string()).describe('An array of personalized daily check-in questions.'),
});
export type DailyCheckInOutput = z.infer<typeof DailyCheckInOutputSchema>;

export async function dailyCheckIn(input: DailyCheckInInput): Promise<DailyCheckInOutput> {
  return dailyCheckInFlow(input);
}

const prompt = ai.definePrompt({
  name: 'dailyCheckInPrompt',
  input: {schema: DailyCheckInInputSchema},
  output: {schema: DailyCheckInOutputSchema},
  prompt: questionPrompt,
});

const dailyCheckInFlow = ai.defineFlow(
  {
    name: 'dailyCheckInFlow',
    inputSchema: DailyCheckInInputSchema,
    outputSchema: DailyCheckInOutputSchema,
  },
  async input => {
    try {
      const {output} = await prompt(input);
      return output!;
    } catch (e: any) {
        if (e.message && (e.message.includes('429') || e.message.includes('rate limit'))) {
            console.warn('Gemini rate limit exceeded. Falling back to Groq for daily check-in.');
            const renderedPrompt = Mustache.render(questionPrompt, input);
            return await callGroq(renderedPrompt, DailyCheckInOutputSchema);
        } else {
            throw e;
        }
    }
  }
);
