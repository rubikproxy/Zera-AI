// groq-fallback.ts
import type { z, ZodObject, ZodSchema } from 'zod';
import Mustache from 'mustache';

type PromptFn<I, O> = (input: I) => Promise<{ output: O | null }>;

/**
 * A higher-order function that wraps a Genkit prompt function with fallback logic.
 * If the primary function fails due to rate limiting or other specific errors,
 * it retries the request using the Groq API.
 * @param originalPrompt The original Genkit prompt function.
 * @param promptTemplate The Mustache template string for the fallback prompt.
 * @param outputSchema The Zod schema for the output.
 * @param flowName A name for logging purposes.
 * @returns An async function with the same signature as the original, but with fallback logic.
 */
export function withGroqFallback<I extends object, O>(
  originalPrompt: PromptFn<I, O>,
  promptTemplate: string,
  outputSchema: ZodSchema<O>,
  flowName: string
) {
  return async (input: I): Promise<{ output: O | null }> => {
    try {
      const response = await originalPrompt(input);
      // Also trigger fallback if the primary service returns an empty or null output, which can happen with safety filters.
      if (response.output === null || response.output === undefined) {
          throw new Error('Primary AI service returned empty output.');
      }
      return response;
    } catch (e: any) {
      // Check for rate limit, server errors, or empty output errors from the primary service.
      if (
        (e.message && (e.message.includes('429') || e.message.includes('rate limit') || e.message.includes('503'))) ||
        (e.message && e.message.includes('Primary AI service returned empty output'))
      ) {
        console.warn(`Gemini API issue in ${flowName}. Falling back to Groq.`);
        try {
            const renderedPrompt = Mustache.render(promptTemplate, input);
            const fallbackOutput = await callGroq(renderedPrompt, outputSchema);
            return { output: fallbackOutput };
        } catch (fallbackError) {
            console.error(`Groq fallback for [${flowName}] also failed:`, fallbackError);
            const msg = fallbackError instanceof Error ? fallbackError.message : String(fallbackError);
            throw new Error(`The fallback AI service failed for ${flowName}: ${msg}`);

        }
      } else {
        // Re-throw any other unexpected errors.
        console.error(`An unexpected error occurred in ${flowName} that did not trigger fallback:`, e);
        throw e;
      }
    }
  };
}


export async function callGroq<O extends ZodSchema>(promptText: string, outputSchema: O): Promise<z.infer<O>> {
    if (!process.env.GROQ_API_KEY) {
        throw new Error('Fallback failed: GROQ_API_KEY environment variable is not set.');
    }

    let schemaInstructions = 'Your response must be a JSON object.';
    // Dynamically create instructions for the LLM based on the expected Zod schema.
    if (outputSchema._def.typeName === 'ZodObject') {
        const keys = Object.keys((outputSchema as ZodObject<any>).shape).map(k => `"${k}"`).join(', ');
        schemaInstructions = `IMPORTANT: Your response must be a valid JSON object with the following keys: ${keys}. Do not include any other text, reasoning, or markdown formatting. Respond only with the raw JSON object.`;
    }
    
    // Construct a clear system prompt and a simple user prompt.
    const systemPrompt = `${promptText}\n\n${schemaInstructions}`;
    const userPrompt = "Generate the response based on the instructions provided in the system prompt.";

    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    { "role": "system", "content": systemPrompt },
                    { "role": "user", "content": userPrompt }
                ],
                temperature: 0.1, // Lower temperature for more predictable, structured output
                response_format: { type: 'json_object' },
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Groq API request failed with status ${response.status}: ${errorText}`);
        }

        const result = await response.json();
        
        if (!result.choices || result.choices.length === 0 || !result.choices[0].message.content) {
            console.error('Groq response is missing expected content:', JSON.stringify(result, null, 2));
            throw new Error('Groq returned an invalid or empty response structure.');
        }

        let jsonContent = result.choices[0].message.content;

        // Defensively extract JSON from the response string, in case the model wraps it in markdown.
        const firstBrace = jsonContent.indexOf('{');
        const lastBrace = jsonContent.lastIndexOf('}');
        if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
            console.error('Groq response did not contain a valid JSON object string. Response:', jsonContent);
            throw new Error('Groq response was not in the expected JSON format.');
        }
        jsonContent = jsonContent.substring(firstBrace, lastBrace + 1);
        
        let parsedJson;
        try {
            parsedJson = JSON.parse(jsonContent);
        } catch (parseError: any) {
            console.error('Failed to parse JSON from Groq response. Raw content:', jsonContent);
            throw new Error(`JSON parsing failed: ${parseError.message}`);
        }

        // Validate the parsed JSON against the provided Zod schema.
        const validationResult = outputSchema.safeParse(parsedJson);
        if (!validationResult.success) {
            console.error("Groq response failed Zod validation:", validationResult.error.format());
            throw new Error(`Groq response failed data validation: ${validationResult.error.message}`);
        }

        return validationResult.data;
    } catch (error) {
        // The original error is now propagated up to `withGroqFallback`.
        // This preserves the specific error message (e.g., from an invalid API key, network issue, or bad response).
        throw error;
    }
}
