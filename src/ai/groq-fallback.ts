'use server';

import type { z, ZodSchema } from 'zod';

export async function callGroq<O extends ZodSchema>(promptText: string, outputSchema: O): Promise<z.infer<O>> {
    if (!process.env.GROQ_API_KEY) {
        throw new Error('Fallback failed: GROQ_API_KEY environment variable is not set.');
    }

    const systemPrompt = `You are a helpful assistant that responds in JSON format. Your task is to follow the user's request and provide a response that conforms to the provided Zod schema. Do not include any other text or formatting. Just the raw JSON object.`;
    
    const userPrompt = `
        User Request:
        ---
        ${promptText}
        ---
        
        Please provide a JSON response that validates against this Zod schema description:
        ${JSON.stringify(outputSchema.describe(), null, 2)}
    `;

    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
            },
            body: JSON.stringify({
                model: 'llama3-70b-8192', // Using a reliable Llama 3 model from Groq
                messages: [
                    { "role": "system", "content": systemPrompt },
                    { "role": "user", "content": userPrompt }
                ],
                temperature: 0.2, // Lower temperature for more predictable JSON output
                response_format: { type: 'json_object' },
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Groq API request failed with status ${response.status}: ${errorText}`);
        }

        const result = await response.json();
        const jsonContent = result.choices[0].message.content;
        const parsedJson = JSON.parse(jsonContent);

        const validationResult = outputSchema.safeParse(parsedJson);
        if (!validationResult.success) {
            console.error("Groq response failed Zod validation:", validationResult.error);
            throw new Error(`Groq response failed Zod validation: ${validationResult.error.message}`);
        }

        return validationResult.data;
    } catch (error) {
        console.error('Error during Groq fallback:', error);
        throw new Error('The fallback AI service also failed. Please try again later.');
    }
}
