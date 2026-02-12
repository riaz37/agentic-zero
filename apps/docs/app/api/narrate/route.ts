import { streamText } from 'ai'
import { openai } from '@ai-sdk/openai'

export const runtime = 'edge'

export async function POST(req: Request) {
    const { context, persona } = await req.json()

    const result = await streamText({
        model: openai('gpt-4o'),
        prompt: `You are a ${persona || 'helpful guide'}. 
             Context: "${context}". 
             Write a brief, engaging sentence explaining this section.`
    })

    return result.toTextStreamResponse()
}
