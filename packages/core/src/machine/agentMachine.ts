import { createMachine, assign, fromPromise } from 'xstate';
import { AgentBridge, VoiceBridge, TelemetryProvider } from '../types/bridge';
import { OrchestrationAdapter } from '../types/orchestration';

export interface AgentContext {
    currentCheckpoint: string | null;
    journeyQueue: string[];
    fullQueue: string[]; // Store full queue for random access
    userInterrupted: boolean;
    narrativeBuffer: string;
    errorCount: number;
    voiceState: 'idle' | 'listening' | 'thinking' | 'speaking';
    metadata: Record<string, any>;
    lastUserMessage?: string;
}

export type AgentEvent =
    | { type: 'START_JOURNEY'; initialQueue: string[] }
    | { type: 'CANCEL_JOURNEY' }
    | { type: 'NEXT_MILESTONE' }
    | { type: 'USER_INTERRUPT' }
    | { type: 'USER_RESUME'; target?: string }
    | { type: 'USER_MESSAGE'; text: string }
    | { type: 'NARRATION_COMPLETE' }
    | { type: 'TARGET_REACHED' }
    | { type: 'TARGET_FAILED' }
    | { type: 'ERROR_OCCURRED'; error?: any }
    | { type: 'VOICE_ERROR'; error?: string }
    | { type: 'REHYDRATE_STATE'; context: Partial<AgentContext> };

/**
 * Creates the production-grade agent machine.
 * Decoupled from visual implementation via AgentBridge and VoiceBridge.
 * Integrated with an OrchestrationAdapter for flow control.
 */
export function createAgentMachine(
    bridge: AgentBridge,
    orchestrator?: OrchestrationAdapter,
    voice?: VoiceBridge,
    telemetry?: TelemetryProvider
) {
    return createMachine(
        {
            id: 'agentMind',
            initial: 'idle',
            context: {
                currentCheckpoint: null,
                journeyQueue: [],
                fullQueue: [],
                userInterrupted: false,
                narrativeBuffer: '',
                errorCount: 0,
                voiceState: 'idle',
                metadata: {},
            } as AgentContext,
            entry: [
                ({ context, event }) => orchestrator?.onAgentEvent(event, context)
            ],
            states: {
                idle: {
                    on: {
                        START_JOURNEY: {
                            target: 'pathfinding',
                            actions: [
                                assign({
                                    journeyQueue: ({ event }) => (event as any).initialQueue,
                                    fullQueue: ({ event }) => (event as any).initialQueue,
                                    errorCount: () => 0,
                                }),
                                () => bridge.startMonitoring(),
                                () => telemetry?.recordEvent('journey_start', { queue: (event as any).initialQueue }),
                            ],
                        },
                        REHYDRATE_STATE: {
                            actions: assign(({ event }) => (event as any).context),
                        }
                    },
                },

                pathfinding: {
                    entry: [
                        assign({
                            currentCheckpoint: ({ context }) => context.journeyQueue[0] || null,
                            journeyQueue: ({ context }) => context.journeyQueue.slice(1),
                            voiceState: 'idle' as const
                        }),
                    ],
                    after: {
                        300: { target: 'navigating' },
                    },
                },

                navigating: {
                    invoke: {
                        id: 'navigateToTarget',
                        src: fromPromise(async ({ input }: { input: { checkpointId: string } }) => {
                            const span = telemetry?.startSpan('navigation');
                            span?.setAttribute('checkpoint', input.checkpointId);
                            try {
                                const [scrollSuccess] = await Promise.all([
                                    bridge.scrollToTarget(input.checkpointId),
                                    bridge.flyAvatarTo(input.checkpointId),
                                ]);
                                span?.end();
                                return scrollSuccess;
                            } catch (e) {
                                span?.end();
                                throw e;
                            }
                        }),
                        input: ({ context }: { context: AgentContext }) => ({
                            checkpointId: context.currentCheckpoint!,
                        }),
                        onDone: [
                            {
                                target: 'thinking',
                                guard: ({ event }: any) => event.output === true,
                            },
                            {
                                target: 'searching',
                            },
                        ],
                        onError: {
                            target: 'searching',
                        },
                    },
                    on: {
                        USER_INTERRUPT: {
                            target: 'interrupted',
                        },
                    },
                },

                thinking: {
                    entry: assign({ voiceState: 'thinking' as const }),
                    invoke: {
                        src: fromPromise(async ({ input }: { input: { checkpointId: string } }) => {
                            return bridge.generateNarrative(input.checkpointId);
                        }),
                        input: ({ context }: { context: AgentContext }) => ({
                            checkpointId: context.currentCheckpoint!
                        }),
                        onDone: {
                            target: 'narrating',
                            actions: assign({
                                narrativeBuffer: ({ event }) => event.output,
                                voiceState: 'idle' as const // Will immediately switch to speaking in next state
                            })
                        },
                        onError: {
                            target: 'narrating',
                            actions: assign({
                                narrativeBuffer: ({ context }) =>
                                    bridge.getNarrativeForCheckpoint(context.currentCheckpoint!), // Fallback to raw text
                                errorCount: ({ context }) => context.errorCount + 1
                            })
                        }
                    },
                    on: {
                        USER_INTERRUPT: {
                            target: 'interrupted',
                        },
                    },
                },

                narrating: {
                    entry: assign({ voiceState: 'speaking' as const }),
                    invoke: {
                        src: fromPromise(async ({ input }: { input: { text: string } }) => {
                            if (voice) {
                                await voice.speak(input.text);
                            } else {
                                // Fallback: simulate reading time (50ms per char, min 2s)
                                const duration = Math.max(2000, input.text.length * 50);
                                await new Promise(resolve => setTimeout(resolve, duration));
                            }
                        }),
                        input: ({ context }: { context: AgentContext }) => ({
                            text: context.narrativeBuffer
                        }),
                        onDone: {
                            target: 'listening', // Transition to listening instead of checkingNext
                        },
                        onError: {
                            target: 'listening',
                        }
                    },
                    on: {
                        USER_INTERRUPT: {
                            target: 'interrupted',
                        },
                    },
                    exit: [
                        assign({ voiceState: 'idle' as const }),
                        () => voice?.interrupt()
                    ]
                },

                listening: {
                    entry: [
                        assign({ voiceState: 'listening' as const }),
                        () => voice?.startListening(),
                    ],
                    exit: [
                        () => voice?.stopListening(),
                    ],
                    on: {
                        USER_MESSAGE: {
                            target: 'processing_input',
                        },
                        USER_INTERRUPT: {
                            target: 'interrupted',
                        },
                        VOICE_ERROR: {
                            target: 'checkingNext', // Move on if voice fails
                            actions: assign({
                                errorCount: ({ context }) => context.errorCount + 1
                            })
                        }
                    },
                    after: {
                        8000: { target: 'checkingNext' },
                    },
                },

                processing_input: {
                    entry: assign({ voiceState: 'thinking' as const }),
                    invoke: {
                        src: fromPromise(async ({ input }: { input: { text: string } }) => {
                            const text = input.text.toLowerCase();
                            if (text.includes('next') || text.includes('move on') || text.includes('continue')) {
                                return { intent: 'NEXT' };
                            }
                            if (text.includes('stop') || text.includes('wait')) {
                                return { intent: 'STOP' };
                            }
                            return { intent: 'QUESTION', text: input.text };
                        }),
                        input: ({ event }: any) => ({ text: event.text }),
                        onDone: [
                            {
                                target: 'checkingNext',
                                guard: ({ event }) => event.output.intent === 'NEXT',
                            },
                            {
                                target: 'interrupted',
                                guard: ({ event }) => event.output.intent === 'STOP',
                            },
                            {
                                target: 'answering',
                                actions: assign({
                                    lastUserMessage: ({ event }) => event.output.text
                                })
                            },
                        ],
                    },
                },

                answering: {
                    entry: assign({ voiceState: 'thinking' as const }),
                    invoke: {
                        src: fromPromise(async ({ input }: { input: { question: string, checkpointId: string } }) => {
                            const contextText = bridge.getNarrativeForCheckpoint(input.checkpointId);
                            return bridge.generateAnswer(input.question, contextText);
                        }),
                        input: ({ context }: { context: AgentContext }) => ({
                            question: context.lastUserMessage!,
                            checkpointId: context.currentCheckpoint!
                        }),
                        onDone: {
                            target: 'narrating', // Loop back to narrating state to speak the answer
                            actions: assign({
                                narrativeBuffer: ({ event }) => event.output,
                                voiceState: 'idle' as const
                            })
                        },
                        onError: {
                            target: 'listening', // Fail silently back to listening
                        }
                    },
                },


                checkingNext: {
                    always: [
                        {
                            target: 'pathfinding',
                            guard: ({ context }) => context.journeyQueue.length > 0,
                        },
                        { target: 'completed' },
                    ],
                },

                interrupted: {
                    entry: [
                        () => bridge.killAllAnimations(),
                        () => bridge.retreatAvatar(),
                        () => voice?.interrupt(),
                        assign({ userInterrupted: true, voiceState: 'idle' as const }),
                    ],
                    on: {
                        USER_RESUME: {
                            target: 'pathfinding',
                            actions: [
                                assign({ userInterrupted: false }),
                                assign({
                                    journeyQueue: ({ context, event }) => {
                                        // If resume event has a target (user scrolled to a specific section),
                                        // rebuild the queue starting from that target.
                                        if (event.type === 'USER_RESUME' && event.target) {
                                            const idx = context.fullQueue.indexOf(event.target);
                                            if (idx !== -1) {
                                                return context.fullQueue.slice(idx);
                                            }
                                        }
                                        // Otherwise, resume current flow
                                        return context.currentCheckpoint
                                            ? [context.currentCheckpoint, ...context.journeyQueue]
                                            : context.journeyQueue;
                                    },
                                }),
                            ],
                        },
                        NEXT_MILESTONE: 'pathfinding',
                    },
                },

                searching: {
                    entry: [
                        assign({ errorCount: ({ context }) => context.errorCount + 1 }),
                    ],
                    after: {
                        2000: [
                            {
                                target: 'navigating',
                                guard: ({ context }) => context.errorCount < 3,
                            },
                            {
                                target: 'checkingNext',
                            },
                        ],
                    },
                },

                completed: {
                    entry: [
                        () => bridge.stopMonitoring(),
                        () => telemetry?.recordEvent('journey_completed'),
                    ],
                    type: 'final',
                },
            },
            on: {
                // Global event monitoring for orchestrator
                '*': {
                    actions: [
                        ({ context, event }) => orchestrator?.onAgentEvent(event, context)
                    ]
                },
                CANCEL_JOURNEY: {
                    target: '.completed',
                    actions: [
                        () => bridge.killAllAnimations(),
                        () => voice?.interrupt(),
                    ]
                }
            }
        }
    );
}

/**
 * Static machine for unit tests (no bridge dependency).
 */
export const agentMachine = createMachine({ id: 'agentMind', initial: 'idle', states: { idle: {} } } as any);
