import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

export async function POST(req: Request) {
    const { context, persona } = await req.json();

    const result = streamText({
        model: openai('gpt-4o-mini'),
        prompt: `You are a ${persona || 'helpful guide'}. 
             Context: "${context}". 
             Write a brief, engaging sentence explaining this section as if you are guiding the user through the site.`,
    });

    return result.toTextStreamResponse();
}
