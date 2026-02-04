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
import { analyzeWound } from '@/ai/flows/wound-analysis';
import type { WoundAnalysisInput } from '@/ai/flows/wound-analysis';
import { getEpdsAssessment } from '@/ai/flows/mental-health-screening';
import type { EPDSScoringInput } from '@/ai/flows/mental-health-screening';
import { getBreastfeedingSupport } from '@/ai/flows/breastfeeding-support';
import type { BreastfeedingSupportInput } from '@/ai/flows/breastfeeding-support';
import { getHealthTip } from '@/ai/flows/health-tips';
import type { HealthTipInput } from '@/ai/flows/health-tips';
import { generateSuggestions } from '@/ai/flows/generate-suggestions';
import type { GenerateSuggestionsInput } from '@/ai/flows/generate-suggestions';


export async function getDailyCheckIn(input: DailyCheckInInput) {
  return await dailyCheckIn(input);
}

export async function getSymptomUnderstanding(input: UnderstandSymptomsInput) {
  return await understandSymptoms(input);
}

export async function getEmpatheticResponse(input: EmpatheticResponseInput) {
  return await generateEmpatheticResponse(input);
}

export async function getEmergencyEscalation(input: EmergencyEscalationInput) {
  return await emergencyEscalation(input);
}

export async function getPersonalizedAdvice(input: PersonalizedAdviceInput) {
  return await personalizedAdvice(input);
}

export async function getWoundAnalysis(input: WoundAnalysisInput) {
  return await analyzeWound(input);
}

export async function getEPDSAssessment(input: EPDSScoringInput) {
    return await getEpdsAssessment(input);
}

export async function getBreastfeedingSupportAction(input: BreastfeedingSupportInput) {
    return await getBreastfeedingSupport(input);
}

export async function getHealthTipAction(input: HealthTipInput) {
    return await getHealthTip(input);
}

export async function getSuggestions(input: GenerateSuggestionsInput) {
    return await generateSuggestions(input);
}
