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

const prompt = ai.definePrompt({
  name: 'epdsScoringPrompt',
  input: {schema: EPDSScoringInputSchema},
  output: {schema: EPDSScoringOutputSchema},
  prompt: `You are an AI assistant specialized in postpartum mental health. Your task is to score the Edinburgh Postnatal Depression Scale (EPDS) and provide an empathetic assessment.

  The user has provided 10 answers, indexed 0-3 corresponding to options A, B, C, D.

  **Scoring Rules:**
  - For questions 1, 2, and 4 (indices 0, 1, 3 in the answers array): The score for each is its index (0, 1, 2, or 3).
  - For questions 3, 5, 6, 7, 8, 9, 10 (indices 2, 4, 5, 6, 7, 8, 9): The score is reversed. If the answer index is 0, the score is 3; index 1 is score 2; index 2 is score 1; index 3 is score 0.
  - Calculate the total score by summing the scores for all 10 questions.

  **Assessment Guidelines:**
  - A total score of 13 or more suggests a high probability of depression.
  - An answer greater than 0 for question 10 (index 9) indicates suicidal thoughts and is a critical red flag, regardless of the total score. The options for Q10 are 'Never', 'Hardly Ever', 'Sometimes', 'Yes, quite often', so any answer other than 'Never' (index 0) is a concern.

  **Your Response:**
  1.  Calculate the total score based on the rules above.
  2.  Set \`isHighRisk\` to \`true\` if the total score is 13 or more, OR if the answer to question 10 (index 9) is greater than 0. Otherwise, set it to \`false\`.
  3.  Write an \`assessment\` message based on the result:
      -   **If high risk:** Start with "Thank you for completing this screening. Based on your responses, your score is [score]. A score of 13 or more suggests you may be experiencing symptoms of postpartum depression. This is a medical condition, you are NOT alone, and this is NOT your fault. It is very important that you speak with a healthcare provider. I will share these results with your provider." If it was high risk due to question 10, add: "Most importantly, because you've had thoughts of harming yourself, it is critical to get help right away. Please call the National Maternal Mental Health Hotline at 1-833-943-5746 or call 911."
      -   **If not high risk:** Start with "Thank you for completing this screening. Your score is [score]. This score indicates you are not likely experiencing significant symptoms of postpartum depression right now, which is great news. However, please continue to monitor your feelings and reach out anytime if things change."

  **Patient Answers (0-indexed choices):**
  {{{JSON.stringify(answers)}}}
  `,
});

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
