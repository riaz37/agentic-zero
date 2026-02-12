import { describe, it, expect, vi } from 'vitest';
import { createActor } from 'xstate';
import { agentMachine } from './agentMachine';

describe('agentMachine', () => {
    it('should start in idle state', () => {
        const actor = createActor(agentMachine).start();
        expect(actor.getSnapshot().value).toBe('idle');
    });

    it('should transition to pathfinding when START_JOURNEY is sent', () => {
        const actor = createActor(agentMachine).start();
        actor.send({ type: 'START_JOURNEY', initialQueue: ['hero', 'features'] });
        expect(actor.getSnapshot().value).toBe('pathfinding');
        expect(actor.getSnapshot().context.journeyQueue).toEqual(['features']);
        expect(actor.getSnapshot().context.currentCheckpoint).toBe('hero');
    });
});
