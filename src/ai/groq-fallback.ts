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
                model: 'llama3-70b-8192', // Using a powerful, known model
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
            throw new Error('Groq returned an invalid or empty response structure.');
        }

        let jsonContent = result.choices[0].message.content;

        // Defensively extract JSON from the response string
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

        const validationResult = outputSchema.safeParse(parsedJson);
        if (!validationResult.success) {
            console.error("Groq response failed Zod validation:", validationResult.error.format());
            throw new Error(`Groq response failed data validation: ${validationResult.error.message}`);
        }

        return validationResult.data;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Error during Groq fallback:', errorMessage);
        throw new Error(`The fallback AI service also failed. Please try again later.`);
    }
}
