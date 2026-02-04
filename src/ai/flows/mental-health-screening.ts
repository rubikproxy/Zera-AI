'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EPDSScoringInputSchema = z.object({
  answers: z.array(z.number().min(0).max(3)).length(10).describe('An array of 10 numbers, where each number is the 0-indexed choice for the corresponding EPDS question.'),
});
export type EPDSScoringInput = z.infer<typeof EPDSScoringInputSchema>;

const EPDSScoringOutputSchema = z.object({
  score: z.number().describe('The calculated EPDS score.'),
  assessment: z.string().describe('An empathetic assessment based on the score.'),
  isHighRisk: z.boolean().describe('Whether the score indicates a high risk of PPD or self-harm.'),
});
export type EPDSScoringOutput = z.infer<typeof EPDSScoringOutputSchema>;

export async function getEpdsAssessment(input: EPDSScoringInput): Promise<EPDSScoringOutput> {
  return epdsScoringFlow(input);
}

const epdsScoringFlow = ai.defineFlow(
  {
    name: 'epdsScoringFlow',
    inputSchema: EPDSScoringInputSchema,
    outputSchema: EPDSScoringOutputSchema,
  },
  async input => {
    // Manually calculate score to ensure accuracy, as LLM can make mistakes with complex logic.
    const scores = input.answers.map((answerIndex, questionIndex) => {
      // Questions 1, 2, 4 (indices 0, 1, 3)
      if ([0, 1, 3].includes(questionIndex)) {
        return answerIndex;
      }
      // Questions 3, 5, 6, 7, 8, 9, 10 (indices 2, 4, 5, 6, 7, 8, 9)
      else {
        return 3 - answerIndex;
      }
    });
    const totalScore = scores.reduce((sum, score) => sum + score, 0);
    const selfHarmThought = input.answers[9] > 0;
    const isHighRisk = totalScore >= 13 || selfHarmThought;

    let assessment = '';
    if (isHighRisk) {
      assessment = `Thank you for completing this screening. Based on your responses, your score is ${totalScore}. A score of 13 or more suggests you may be experiencing symptoms of postpartum depression. This is a medical condition, you are NOT alone, and this is NOT your fault. It is very important that you speak with a healthcare provider. I will share these results with your provider.`;
      if (selfHarmThought) {
        assessment += " Most importantly, because you've had thoughts of harming yourself, it is critical to get help right away. Please call the National Maternal Mental Health Hotline at 1-833-943-5746 or call 911.";
      }
    } else {
      assessment = `Thank you for completing this screening. Your score is ${totalScore}. This score indicates you are not likely experiencing significant symptoms of postpartum depression right now, which is great news. However, please continue to monitor your feelings and reach out anytime if things change.`;
    }

    return {
      score: totalScore,
      assessment,
      isHighRisk,
    };
  }
);
