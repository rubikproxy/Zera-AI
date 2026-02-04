'use server';

/**
 * @fileOverview An image analysis AI agent for postpartum wound assessment.
 *
 * - analyzeWound - A function that handles the wound analysis process.
 * - WoundAnalysisInput - The input type for the analyzeWound function.
 * - WoundAnalysisOutput - The return type for the analyzeWound function.
 */

import {ai} from '@/ai/genkit';
import { woundAnalysisPrompt } from '@/ai/prompts/wound-analysis.prompt';
import {z} from 'genkit';

const WoundAnalysisInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a C-section wound, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  daysPostSurgery: z.number().describe('How many days have passed since the surgery.')
});
export type WoundAnalysisInput = z.infer<typeof WoundAnalysisInputSchema>;

const WoundAnalysisOutputSchema = z.object({
  healingStage: z.string().describe('The stage of healing (e.g., early, intermediate, advanced).'),
  infectionSigns: z.object({
    redness: z.object({
      present: z.boolean(),
      severity: z.number().min(0).max(5).optional().describe('Severity from 1 to 5, if present.'),
    }),
    swelling: z.object({
        present: z.boolean(),
        severity: z.number().min(0).max(5).optional().describe('Severity from 1 to 5, if present.'),
    }),
    discharge: z.object({
        present: z.boolean(),
        type: z.string().optional().describe('Type of discharge (e.g., serous, purulent), if present.'),
    }),
  }),
  overallAssessment: z.enum(['Normal Healing', 'Needs Monitoring', 'Requires Medical Attention']),
  recommendations: z.string().describe('Actionable recommendations for the user.'),
});
export type WoundAnalysisOutput = z.infer<typeof WoundAnalysisOutputSchema>;

export async function analyzeWound(input: WoundAnalysisInput): Promise<WoundAnalysisOutput> {
  return woundAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'woundAnalysisPrompt',
  input: {schema: WoundAnalysisInputSchema},
  output: {schema: WoundAnalysisOutputSchema},
  prompt: woundAnalysisPrompt,
});

const woundAnalysisFlow = ai.defineFlow(
  {
    name: 'woundAnalysisFlow',
    inputSchema: WoundAnalysisInputSchema,
    outputSchema: WoundAnalysisOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
