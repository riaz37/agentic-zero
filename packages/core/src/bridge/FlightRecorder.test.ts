import { describe, it, expect } from 'vitest';
import { FlightRecorder } from './FlightRecorder';

describe('FlightRecorder', () => {
    it('should record and retrieve entries', () => {
        const recorder = new FlightRecorder();
        recorder.record({ type: 'state_change', from: 'idle', to: 'pathfinding' });
        recorder.record({ type: 'bridge_action', target: '#hero' });

        const entries = recorder.tail(2);
        expect(entries).toHaveLength(2);
        expect(entries[0].type).toBe('state_change');
        expect(entries[1].target).toBe('#hero');
    });

    it('should filter errors', () => {
        const recorder = new FlightRecorder();
        recorder.record({ type: 'state_change', from: 'idle', to: 'pathfinding' });
        recorder.record({ type: 'error', metadata: { reason: 'element not found' } });
        recorder.record({ type: 'bridge_action', target: '#features' });

        expect(recorder.errors()).toHaveLength(1);
        expect(recorder.errors()[0].metadata?.reason).toBe('element not found');
    });

    it('should export with a session ID', () => {
        const recorder = new FlightRecorder();
        recorder.record({ type: 'state_change', from: 'idle', to: 'narrating' });

        const exported = recorder.export();
        expect(exported.sessionId).toMatch(/^awf-/);
        expect(exported.entries).toHaveLength(1);
    });
});
