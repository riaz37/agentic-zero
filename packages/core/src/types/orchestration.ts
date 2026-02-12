import { AgentContext } from '../machine/agentMachine';

/**
 * OrchestrationAdapter — Interface for pluggable execution engines.
 * 
 * This allows the framework to remain agnostic to the specific
 * orchestration backend (Internal, Inngest, Temporal, etc.)
 */
export interface OrchestrationAdapter {
    /** 
     * Trigger a new journey or a specific event in the workflow 
     */
    trigger: (eventName: string, payload: Record<string, any>) => Promise<void>;

    /**
     * Map framework events to the orchestrator's internal tracking
     */
    onAgentEvent: (event: any, context: AgentContext) => void;

    /**
     * Handle cleanup
     */
    dispose: () => void;
}
