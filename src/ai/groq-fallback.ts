'use server';

import type { z, ZodObject, ZodSchema } from 'zod';

export async function callGroq<O extends ZodSchema>(promptText: string, outputSchema: O): Promise<z.infer<O>> {
    if (!process.env.GROQ_API_KEY) {
        throw new Error('Fallback failed: GROQ_API_KEY environment variable is not set.');
    }

    let schemaInstructions = 'Your response must be a JSON object.';
    // Check if it's a ZodObject to extract keys
    if (outputSchema._def.typeName === 'ZodObject') {
        const keys = Object.keys((outputSchema as ZodObject<any>).shape).map(k => `"${k}"`).join(', ');
        schemaInstructions = `IMPORTANT: Your response must be a valid JSON object with the following keys: ${keys}. Do not include any other text, reasoning, or markdown formatting. Respond only with the raw JSON object.`;
    }
    
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
                model: 'mixtral-8x7b-32768',
                messages: [
                    { "role": "system", "content": systemPrompt },
                    { "role": "user", "content": userPrompt }
                ],
                temperature: 0.1,
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
            throw new Error('Groq returned an invalid response structure.');
        }

        let jsonContent = result.choices[0].message.content;

        // Defensively extract JSON from the response string, in case it's wrapped in text or markdown
        const firstBrace = jsonContent.indexOf('{');
        const lastBrace = jsonContent.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
          jsonContent = jsonContent.substring(firstBrace, lastBrace + 1);
        }

        const parsedJson = JSON.parse(jsonContent);

        const validationResult = outputSchema.safeParse(parsedJson);
        if (!validationResult.success) {
            console.error("Groq response failed Zod validation:", validationResult.error.format());
            throw new Error(`Groq response failed Zod validation: ${validationResult.error.message}`);
        }

        return validationResult.data;
    } catch (error) {
        console.error('Error during Groq fallback:', error);
        throw new Error('The fallback AI service also failed. Please try again later.');
    }
}
