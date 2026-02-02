'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/empathetic-responses.ts';
import '@/ai/flows/emergency-escalation.ts';
import '@/ai/flows/daily-check-in-questions.ts';
import '@/ai/flows/personalized-advice.ts';
import '@/ai/flows/symptom-understanding.ts';
import '@/ai/flows/wound-analysis.ts';
import '@/ai/flows/mental-health-screening.ts';
