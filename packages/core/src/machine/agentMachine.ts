import { createMachine, assign, fromPromise } from 'xstate';

export interface AgentContext {
    currentCheckpoint: string | null;
    journeyQueue: string[];
    userInterrupted: boolean;
    narrativeBuffer: string;
    errorCount: number;
}

export type AgentEvent =
    | { type: 'START_JOURNEY'; initialQueue: string[] }
    | { type: 'NEXT_MILESTONE' }
    | { type: 'USER_INTERRUPT' }
    | { type: 'USER_RESUME' }
    | { type: 'NARRATION_COMPLETE' }
    | { type: 'TARGET_REACHED' }
    | { type: 'TARGET_FAILED' }
    | { type: 'ERROR_OCCURRED' };

/**
 * Creates the agent machine with a reference to the BridgeOrchestrator.
 * This factory pattern lets us inject the live bridge at runtime.
 */
export function createAgentMachine(bridge: {
    scrollToTarget: (id: string) => Promise<boolean>;
    flyAvatarTo: (id: string) => Promise<void>;
    getNarrativeForCheckpoint: (id: string) => string;
    retreatAvatar: () => void;
    killAllAnimations: () => void;
    startMonitoring: () => void;
    stopMonitoring: () => void;
    recorder: { record: (entry: any) => void };
}) {
    return createMachine(
        {
            id: 'agentMind',
            initial: 'idle',
            context: {
                currentCheckpoint: null,
                journeyQueue: [],
                userInterrupted: false,
                narrativeBuffer: '',
                errorCount: 0,
            } as AgentContext,
            states: {
                idle: {
                    on: {
                        START_JOURNEY: {
                            target: 'pathfinding',
                            actions: [
                                assign({
                                    journeyQueue: ({ event }) => (event as any).initialQueue,
                                    errorCount: () => 0,
                                }),
                                () => bridge.startMonitoring(),
                                () => bridge.recorder.record({ type: 'state_change', from: 'idle', to: 'pathfinding' }),
                            ],
                        },
                    },
                },

                pathfinding: {
                    entry: [
                        assign({
                            currentCheckpoint: ({ context }) => context.journeyQueue[0] || null,
                            journeyQueue: ({ context }) => context.journeyQueue.slice(1),
                        }),
                        () => bridge.recorder.record({ type: 'state_change', to: 'pathfinding' }),
                    ],
                    after: {
                        300: { target: 'navigating' },
                    },
                },

                navigating: {
                    invoke: {
                        id: 'navigateToTarget',
                        src: fromPromise(async ({ input }: { input: { checkpointId: string } }) => {
                            // Run scroll and avatar flight in parallel
                            const [scrollSuccess] = await Promise.all([
                                bridge.scrollToTarget(input.checkpointId),
                                bridge.flyAvatarTo(input.checkpointId),
                            ]);
                            return scrollSuccess;
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
                            actions: () => bridge.recorder.record({ type: 'error', metadata: { reason: 'navigation_failed' } }),
                        },
                    },
                    on: {
                        USER_INTERRUPT: {
                            target: 'interrupted',
                            actions: () => bridge.recorder.record({ type: 'user_interrupt', metadata: { during: 'navigating' } }),
                        },
                    },
                },

                thinking: {
                    entry: [
                        assign({
                            narrativeBuffer: ({ context }) =>
                                bridge.getNarrativeForCheckpoint(context.currentCheckpoint!),
                        }),
                        () => bridge.recorder.record({ type: 'state_change', to: 'thinking' }),
                    ],
                    after: {
                        800: { target: 'narrating' },
                    },
                    on: {
                        USER_INTERRUPT: {
                            target: 'interrupted',
                            actions: () => bridge.recorder.record({ type: 'user_interrupt', metadata: { during: 'thinking' } }),
                        },
                    },
                },

                narrating: {
                    entry: [
                        () => bridge.recorder.record({ type: 'state_change', to: 'narrating' }),
                    ],
                    on: {
                        NARRATION_COMPLETE: {
                            target: 'checkingNext',
                            actions: () => bridge.recorder.record({ type: 'state_change', from: 'narrating', to: 'checkingNext' }),
                        },
                        USER_INTERRUPT: {
                            target: 'interrupted',
                            actions: () => bridge.recorder.record({ type: 'user_interrupt', metadata: { during: 'narrating' } }),
                        },
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
                        assign({ userInterrupted: () => true }),
                        () => bridge.recorder.record({ type: 'state_change', to: 'interrupted' }),
                    ],
                    on: {
                        USER_RESUME: {
                            target: 'pathfinding',
                            actions: [
                                assign({ userInterrupted: () => false }),
                                // Re-queue the current checkpoint since we didn't finish it
                                assign({
                                    journeyQueue: ({ context }) =>
                                        context.currentCheckpoint
                                            ? [context.currentCheckpoint, ...context.journeyQueue]
                                            : context.journeyQueue,
                                }),
                            ],
                        },
                        NEXT_MILESTONE: 'pathfinding',
                    },
                },

                searching: {
                    entry: [
                        assign({ errorCount: ({ context }) => context.errorCount + 1 }),
                        () => bridge.recorder.record({ type: 'state_change', to: 'searching' }),
                    ],
                    after: {
                        2000: [
                            {
                                target: 'navigating',
                                guard: ({ context }) => context.errorCount < 3,
                            },
                            {
                                target: 'checkingNext',
                                actions: () => bridge.recorder.record({ type: 'error', metadata: { reason: 'max_retries_exceeded' } }),
                            },
                        ],
                    },
                },

                completed: {
                    entry: [
                        () => bridge.stopMonitoring(),
                        () => bridge.recorder.record({ type: 'state_change', to: 'completed' }),
                    ],
                    type: 'final',
                },
            },
        }
    );
}

/**
 * Static machine for unit tests (no bridge dependency).
 */
export const agentMachine = createMachine(
    {
        id: 'agentMind',
        initial: 'idle',
        context: {
            currentCheckpoint: null,
            journeyQueue: [],
            userInterrupted: false,
            narrativeBuffer: '',
            errorCount: 0,
        } as AgentContext,
        states: {
            idle: {
                on: {
                    START_JOURNEY: {
                        target: 'pathfinding',
                        actions: assign({
                            journeyQueue: ({ event }) => (event as any).initialQueue,
                        }),
                    },
                },
            },
            pathfinding: {
                entry: [
                    assign({
                        currentCheckpoint: ({ context }) => context.journeyQueue[0] || null,
                        journeyQueue: ({ context }) => context.journeyQueue.slice(1),
                    }),
                ],
                after: { 300: { target: 'navigating' } },
            },
            navigating: {
                on: {
                    TARGET_REACHED: 'thinking',
                    USER_INTERRUPT: 'interrupted',
                    ERROR_OCCURRED: 'searching',
                },
            },
            thinking: {
                after: { 800: { target: 'narrating' } },
                on: { USER_INTERRUPT: 'interrupted' },
            },
            narrating: {
                on: {
                    NARRATION_COMPLETE: 'checkingNext',
                    USER_INTERRUPT: 'interrupted',
                },
            },
            checkingNext: {
                always: [
                    { target: 'pathfinding', guard: ({ context }) => context.journeyQueue.length > 0 },
                    { target: 'completed' },
                ],
            },
            interrupted: {
                on: {
                    USER_RESUME: 'pathfinding',
                    NEXT_MILESTONE: 'pathfinding',
                },
            },
            searching: {
                entry: assign({ errorCount: ({ context }) => context.errorCount + 1 }),
                after: {
                    2000: [
                        { target: 'navigating', guard: ({ context }) => context.errorCount < 3 },
                        { target: 'checkingNext' },
                    ],
                },
            },
            completed: { type: 'final' },
        },
    }
);
