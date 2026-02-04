'use server';

/**
 * @fileOverview Implements the emergency escalation flow for the MomLink app.
 *
 * - emergencyEscalation - A function that determines if a situation is an emergency and escalates it.
 * - EmergencyEscalationInput - The input type for the emergencyEscalation function.
 * - EmergencyEscalationOutput - The return type for the emergencyEscalation function.
 */

import {ai} from '@/ai/genkit';
import { emergencyEscalationPrompt } from '@/ai/prompts/emergency-escalation.prompt';
import {z} from 'genkit';

const EmergencyEscalationInputSchema = z.object({
  symptoms: z
    .string()
    .describe(
      'A detailed description of the patient symptoms, including severity, duration, and any other relevant information.'
    ),
  patientId: z.string().describe('The unique identifier for the patient.'),
  timestamp: z.string().describe('The timestamp of when the symptoms were reported.'),
});
export type EmergencyEscalationInput = z.infer<typeof EmergencyEscalationInputSchema>;

const EmergencyEscalationOutputSchema = z.object({
  isEmergency: z
    .boolean()
    .describe(
      'A boolean value indicating whether the reported symptoms constitute a medical emergency.'
    ),
  escalationMessage: z
    .string()
    .describe(
      'A message containing instructions for the user, or details about the escalation process. This message will be returned to the front end.'
    ),
});

export type EmergencyEscalationOutput = z.infer<typeof EmergencyEscalationOutputSchema>;

export async function emergencyEscalation(
  input: EmergencyEscalationInput
): Promise<EmergencyEscalationOutput> {
  return emergencyEscalationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'emergencyEscalationPrompt',
  input: {schema: EmergencyEscalationInputSchema},
  output: {schema: EmergencyEscalationOutputSchema},
  prompt: emergencyEscalationPrompt,
});

const emergencyEscalationFlow = ai.defineFlow(
  {
    name: 'emergencyEscalationFlow',
    inputSchema: EmergencyEscalationInputSchema,
    outputSchema: EmergencyEscalationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
