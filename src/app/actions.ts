'use server';

import { dailyCheckIn } from '@/ai/flows/daily-check-in-questions';
import type { DailyCheckInInput } from '@/ai/flows/daily-check-in-questions';
import { emergencyEscalation } from '@/ai/flows/emergency-escalation';
import type { EmergencyEscalationInput } from '@/ai/flows/emergency-escalation';
import { generateEmpatheticResponse } from '@/ai/flows/empathetic-responses';
import type { EmpatheticResponseInput } from '@/ai/flows/empathetic-responses';
import { personalizedAdvice } from '@/ai/flows/personalized-advice';
import type { PersonalizedAdviceInput } from '@/ai/flows/personalized-advice';
import { understandSymptoms } from '@/ai/flows/symptom-understanding';
import type { UnderstandSymptomsInput } from '@/ai/flows/symptom-understanding';
import { getEpdsAssessment } from '@/ai/flows/mental-health-screening';
import type { EPDSScoringInput } from '@/ai/flows/mental-health-screening';
import { getBreastfeedingSupport } from '@/ai/flows/breastfeeding-support';
import type { BreastfeedingSupportInput } from '@/ai/flows/breastfeeding-support';
import { getHealthTip } from '@/ai/flows/health-tips';
import type { HealthTipInput } from '@/ai/flows/health-tips';
import { generateSuggestions } from '@/ai/flows/generate-suggestions';
import type { GenerateSuggestionsInput } from '@/ai/flows/generate-suggestions';

function checkApiKeys() {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("Configuration error: GEMINI_API_KEY is not set.");
    }
}

export async function getDailyCheckIn(input: DailyCheckInInput) {
  checkApiKeys();
  return await dailyCheckIn(input);
}

export async function getSymptomUnderstanding(input: UnderstandSymptomsInput) {
  checkApiKeys();
  return await understandSymptoms(input);
}

export async function getEmpatheticResponse(input: EmpatheticResponseInput) {
  checkApiKeys();
  return await generateEmpatheticResponse(input);
}

export async function getEmergencyEscalation(input: EmergencyEscalationInput) {
  checkApiKeys();
  return await emergencyEscalation(input);
}

export async function getPersonalizedAdvice(input: PersonalizedAdviceInput) {
  checkApiKeys();
  return await personalizedAdvice(input);
}

export async function getEPDSAssessment(input: EPDSScoringInput) {
    return await getEpdsAssessment(input);
}

export async function getBreastfeedingSupportAction(input: BreastfeedingSupportInput) {
    checkApiKeys();
    return await getBreastfeedingSupport(input);
}

export async function getHealthTipAction(input: HealthTipInput) {
    checkApiKeys();
    return await getHealthTip(input);
}

export async function getSuggestions(input: GenerateSuggestionsInput) {
    checkApiKeys();
    return await generateSuggestions(input);
}