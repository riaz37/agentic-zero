import { OrchestrationAdapter } from '../types/orchestration';
import { AgentContext } from '../machine/agentMachine';

export interface LocalOrchestratorConfig {
    onCheckpoint?: (checkpointId: string, context: AgentContext) => void;
    onComplete?: (context: AgentContext) => void;
    onError?: (error: any, context: AgentContext) => void;
}

/**
 * LocalOrchestrator — The zero-dependency default.
 * 
 * Simple event-to-trigger mapping for in-memory journeys.
 */
export class LocalOrchestrator implements OrchestrationAdapter {
    private sendEvent: ((event: any) => void) | null = null;
    private config: LocalOrchestratorConfig;

    constructor(config: LocalOrchestratorConfig = {}) {
        this.config = config;
    }

    connect(sendEvent: (event: any) => void) {
        this.sendEvent = sendEvent;
    }

    async trigger(eventName: string, payload: Record<string, any>): Promise<void> {
        console.log(`[LocalOrchestrator] Triggering ${eventName}`, payload);

        if (eventName === 'journey.start') {
            this.sendEvent?.({
                type: 'START_JOURNEY',
                initialQueue: payload.checkpoints || []
            });
        }
    }

    onAgentEvent(event: any, context: AgentContext) {
        // Local mode maps events to developer callbacks
        if (event.type === 'TARGET_REACHED' || (event.type.includes('done.actor.navigateToTarget') && event.output === true)) {
            if (context.currentCheckpoint) {
                this.config.onCheckpoint?.(context.currentCheckpoint, context);
            }
        }

        if (event.type === 'journey_completed' || event.type === 'CANCEL_JOURNEY') {
            this.config.onComplete?.(context);
        }

        if (event.type === 'ERROR_OCCURRED' || event.type === 'TARGET_FAILED') {
            this.config.onError?.(event.error, context);
        }

        console.log(`[LocalOrchestrator] Event: ${event.type}`);
    }

    dispose() {
        this.sendEvent = null;
    }
}
