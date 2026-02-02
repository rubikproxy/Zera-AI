'use server';

/**
 * @fileOverview A daily check-in AI agent for postpartum mothers.
 *
 * - dailyCheckIn - A function that handles the daily check-in process.
 * - DailyCheckInInput - The input type for the dailyCheckIn function.
 * - DailyCheckInOutput - The return type for the dailyCheckIn function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

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
  prompt: `You are a supportive and helpful AI assistant designed to check in on new mothers during the postpartum period.

  Today\'s Date: {{{currentDate}}}

  Based on the previous responses from the mother, formulate a few (2-4) personalized questions to check in on her physical and mental well-being.

  Previous Responses: {{{previousResponses}}}

  The questions should be open-ended and designed to encourage the mother to share how she is feeling. Focus on key areas such as mood, sleep, pain levels, bleeding, and any concerns she may have.

  Output ONLY an array of questions.
  `,
});

const dailyCheckInFlow = ai.defineFlow(
  {
    name: 'dailyCheckInFlow',
    inputSchema: DailyCheckInInputSchema,
    outputSchema: DailyCheckInOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
