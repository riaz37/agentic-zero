import { describe, it, expect } from 'vitest';
import { createActor } from 'xstate';
import { createAgentMachine } from './agentMachine';
import { HeadlessBridge } from '../bridge/HeadlessBridge';
import { LocalOrchestrator } from '../orchestration/LocalOrchestrator';

describe('agentMachine', () => {
    const bridge = new HeadlessBridge();
    const orchestrator = new LocalOrchestrator();

    it('should start in idle state', () => {
        const machine = createAgentMachine(bridge, orchestrator);
        const actor = createActor(machine).start();
        expect(actor.getSnapshot().value).toBe('idle');
    });

    it('should transition to pathfinding when START_JOURNEY is sent', () => {
        const machine = createAgentMachine(bridge, orchestrator);
        const actor = createActor(machine).start();
        actor.send({ type: 'START_JOURNEY', initialQueue: ['hero', 'features'] });
        expect(actor.getSnapshot().value).toBe('pathfinding');
        expect(actor.getSnapshot().context.journeyQueue).toEqual(['features']);
        expect(actor.getSnapshot().context.currentCheckpoint).toBe('hero');
    });

    it('should handle state rehydration', () => {
        const machine = createAgentMachine(bridge, orchestrator);
        const actor = createActor(machine).start();
        actor.send({
            type: 'REHYDRATE_STATE',
            context: { currentCheckpoint: 'features', errorCount: 1 }
        });
        expect(actor.getSnapshot().context.currentCheckpoint).toBe('features');
        expect(actor.getSnapshot().context.errorCount).toBe(1);
    });
});
