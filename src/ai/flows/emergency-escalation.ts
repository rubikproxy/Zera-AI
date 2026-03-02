'use server';

/**
 * @fileOverview Implements the emergency escalation flow with Pushover notification support.
 */

import {ai} from '@/ai/genkit';
import { emergencyEscalationPrompt } from '@/ai/prompts/emergency-escalation.prompt';
import {z} from 'genkit';
import { withGroqFallback } from '../groq-fallback';
import { sendPushoverNotification } from '@/lib/pushover';

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
      'A message containing instructions for the user, or details about the escalation process.'
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

const promptWithFallback = withGroqFallback(
    prompt,
    emergencyEscalationPrompt,
    EmergencyEscalationOutputSchema,
    'emergencyEscalationFlow'
);

const emergencyEscalationFlow = ai.defineFlow(
  {
    name: 'emergencyEscalationFlow',
    inputSchema: EmergencyEscalationInputSchema,
    outputSchema: EmergencyEscalationOutputSchema,
  },
  async input => {
    const { output } = await promptWithFallback(input);
    
    // Trigger Pushover notification for confirmed emergencies
    if (output?.isEmergency) {
      await sendPushoverNotification(
        `Emergency Escalation Triggered for Patient ${input.patientId}. Symptoms: ${input.symptoms.substring(0, 100)}...`,
        '🚨 ZERA: SYSTEM ESCALATION'
      );
    }
    
    return output!;
  }
);
