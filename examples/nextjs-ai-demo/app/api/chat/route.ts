import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

export async function POST(req: Request) {
    const { context, persona, type, question } = await req.json();

    let systemPrompt = '';

    if (type === 'answer') {
        systemPrompt = `You are a helpful expert guide. 
        Context from current page section: "${context}".
        User Question: "${question}".
        
        Answer the user's question directly and briefly. Be conversational. 
        If the answer isn't in the context, use your general knowledge but mention that it's general knowledge.`;
    } else {
        // Default: Narration
        systemPrompt = `You are a ${persona || 'helpful guide'}. 
        Context: "${context}". 
        Write a brief, engaging sentence explaining this section as if you are guiding the user through the site. Keep it under 2 sentences.`;
    }

    const result = streamText({
        model: openai('gpt-4o-mini'),
        prompt: systemPrompt,
    });

    return result.toTextStreamResponse();
}
