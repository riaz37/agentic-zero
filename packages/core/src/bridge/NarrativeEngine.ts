/**
 * NarrativeEngine - The Voice of the Agent
 * 
 * Manages LLM streaming using Vercel AI SDK. 
 * Converts raw text streams into typewriter-ready character buffers.
 */

import { generateText, streamText } from 'ai';

export interface NarrativeConfig {
    model?: any; // Vercel AI SDK model instance
    apiEndpoint?: string; // Optional server-side endpoint
    persona?: string;
}

export class NarrativeEngine {
    private config: NarrativeConfig;

    constructor(config: NarrativeConfig = {}) {
        this.config = config;
    }

    /**
     * Generates a full narrative string (non-streaming).
     * Useful for TTS which often requires the full text upfront.
     */
    async generateNarrative(contextText: string, persona?: string): Promise<string> {
        // 1. Client-side model
        if (this.config.model) {
            const { text } = await generateText({
                model: this.config.model,
                prompt: `You are a ${persona || this.config.persona || 'helpful guide'}. 
                 Context: "${contextText}". 
                 Write a brief, engaging sentence explaining this section. Keep it under 2 sentences.`,
            });
            return text;
        }

        // 2. Server-side API bridge
        if (this.config.apiEndpoint) {
            try {
                const response = await fetch(this.config.apiEndpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        context: contextText,
                        persona: persona || this.config.persona,
                        stream: false // Hint to API to return full text
                    }),
                });

                if (response.ok) {
                    const text = await response.text();
                    return text || contextText;
                }
            } catch (error) {
                console.warn('AgenticZero: API generation failed, falling back to raw text', error);
            }
        }

        // 3. Fallback: Return raw text (maybe slightly cleaned)
        return contextText;
    }

    /**
     * Generates an answer to a user question.
     */
    async generateAnswer(question: string, context?: string): Promise<string> {
        if (this.config.model) {
            const { text } = await generateText({
                model: this.config.model,
                prompt: `You are a helpful guide.
                 Context: "${context || 'General Framework Knowledge'}".
                 User Question: "${question}".
                 Answer briefly and helpfully.`,
            });
            return text;
        }


        // 2. Server-side API bridge
        if (this.config.apiEndpoint) {
            try {
                const response = await fetch(this.config.apiEndpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        question,
                        context,
                        type: 'answer' // Distinguish from narrative generation
                    }),
                });

                if (response.ok) {
                    const text = await response.text();
                    return text;
                }
            } catch (error) {
                console.warn('AgenticZero: API answer generation failed', error);
            }
        }

        // Pseudo-answers for demo/mock (Fallback)
        return `That's a great question about ${question}. As an AI agent, I can help explain this section further.`;
    }

    /**
     * Generates a narrative stream for a specific checkpoint.
     * Order of preference:
     * 1. Real model instance (client-side, requires keys in browser)
     * 2. API Endpoint (server-side, secure)
     * 3. Fallback: Mock stream from static attribute
     */
    async generateStream(contextText: string, persona?: string): Promise<ReadableStream<string>> {
        // 1. Client-side model (if provided)
        if (this.config.model) {
            const { textStream } = await streamText({
                model: this.config.model,
                prompt: `You are a ${persona || this.config.persona || 'helpful guide'}. 
                 Context: "${contextText}". 
                 Write a brief, engaging sentence explaining this section.`,
            });

            return new ReadableStream({
                async start(controller) {
                    for await (const chunk of textStream) {
                        controller.enqueue(chunk);
                    }
                    controller.close();
                }
            });
        }

        // 2. Server-side API bridge (Secure)
        if (this.config.apiEndpoint) {
            const response = await fetch(this.config.apiEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    context: contextText,
                    persona: persona || this.config.persona
                }),
            });

            if (response.ok && response.body) {
                return response.body.pipeThrough(new TextDecoderStream());
            }
        }

        // 3. Fallback: Mock stream from static attribute
        return this.createMockStream(contextText);
    }

    /**
     * Creates a mock stream that emits the static text in chunks
     * to simulate an LLM being generated.
     */
    private createMockStream(text: string): ReadableStream<string> {
        const chunks = text.match(/.{1,5}/g) || []; // Split into 5-char chunks

        return new ReadableStream({
            async start(controller) {
                for (const chunk of chunks) {
                    controller.enqueue(chunk);
                    await new Promise(r => setTimeout(r, 50)); // Simulate network latency
                }
                controller.close();
            }
        });
    }
}
