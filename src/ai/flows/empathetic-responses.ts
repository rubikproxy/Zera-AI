'use server';

/**
 * @fileOverview Core Chat Engine for Zera AI.
 * This flow implements the "Health Monitoring based on Conversation" technique.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { withGroqFallback } from '../groq-fallback';
import { mainPrompt } from '@/ai/prompts/main.prompt';
import { sendPushoverNotification } from '@/lib/pushover';

const CoreChatInputSchema = z.object({
  userInput: z.string().describe('The message from the user.'),
  context: z.string().optional().describe('Serialized conversation history or health context.'),
  language: z.string().default('English').describe('The response language.'),
});
export type CoreChatInput = z.infer<typeof CoreChatInputSchema>;

const CoreChatOutputSchema = z.object({
  route: z.object({
    in_scope: z.boolean(),
    topic: z.string(),
    urgency: z.enum(['routine', 'monitor', 'appointment_24_48h', 'urgent_today', 'emergency_now']),
    risk_score: z.number().min(0).max(10),
    recommended_next_step: z.string(),
    safety_signals: z.array(z.string()),
    inferred_metrics: z.object({
      stress_level: z.enum(['Stress', 'No Stress', 'unknown']),
      physical_score: z.number().nullable(),
      mental_score: z.number().nullable(),
      urgency_flag: z.boolean(),
    }),
    next_question: z.string(),
  }).describe('Internal routing and clinical metadata.'),
  response: z.string().describe('The user-facing empathetic response.'),
});
export type CoreChatOutput = z.infer<typeof CoreChatOutputSchema>;

export async function generateEmpatheticResponse(input: CoreChatInput): Promise<CoreChatOutput> {
  return coreChatFlow(input);
}

const prompt = ai.definePrompt({
  name: 'coreChatPrompt',
  input: {schema: CoreChatInputSchema},
  output: {schema: CoreChatOutputSchema},
  prompt: `
${mainPrompt}

INSTRUCTION OVERRIDE: 
Combine Block A and Block B into the specified JSON output schema.
The "response" field must contain the empathetic Block B text.
The "route" field must contain all metadata from Block A.
`,
});

const promptWithFallback = withGroqFallback(
    prompt,
    mainPrompt,
    CoreChatOutputSchema,
    'coreChatFlow'
);

const coreChatFlow = ai.defineFlow(
  {
    name: 'coreChatFlow',
    inputSchema: CoreChatInputSchema,
    outputSchema: CoreChatOutputSchema,
  },
  async input => {
    const { output } = await promptWithFallback(input);
    
    // Trigger Pushover notification for emergencies
    if (output?.route?.urgency === 'emergency_now') {
      await sendPushoverNotification(
        `Critical postpartum emergency detected: ${output.route.topic}. Response: ${output.response.substring(0, 100)}...`,
        '🚨 ZERA: EMERGENCY DETECTED'
      );
    }
    
    return output!;
  }
);
