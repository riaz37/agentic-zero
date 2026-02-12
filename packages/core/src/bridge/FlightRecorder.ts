/**
 * FlightRecorder — Observability & Debugging Module
 * 
 * Records agent state transitions, bridge actions, and errors
 * for post-mortem debugging. Integrates with external analytics.
 */

export interface FlightEntry {
    timestamp: number;
    type: 'state_change' | 'bridge_action' | 'error' | 'user_interrupt' | 'self_correct';
    from?: string;
    to?: string;
    target?: string;
    metadata?: Record<string, unknown>;
}

export class FlightRecorder {
    private log: FlightEntry[] = [];
    private maxEntries = 500;
    private sessionId: string;

    constructor() {
        this.sessionId = this.generateSessionId();
    }

    record(entry: Omit<FlightEntry, 'timestamp'>) {
        const full: FlightEntry = { ...entry, timestamp: Date.now() };
        this.log.push(full);

        // Ring buffer: keep last N entries
        if (this.log.length > this.maxEntries) {
            this.log = this.log.slice(-this.maxEntries);
        }

        // Console output in dev mode
        if (process.env.NODE_ENV === 'development') {
            console.log(`[FlightRecorder] ${entry.type}`, entry);
        }
    }

    /**
     * Export the full log for debugging or analytics.
     */
    export(): { sessionId: string; entries: FlightEntry[] } {
        return {
            sessionId: this.sessionId,
            entries: [...this.log],
        };
    }

    /**
     * Get the last N entries (for quick debugging).
     */
    tail(n = 10): FlightEntry[] {
        return this.log.slice(-n);
    }

    /**
     * Get all errors in the current session.
     */
    errors(): FlightEntry[] {
        return this.log.filter((e) => e.type === 'error');
    }

    /**
     * Clear the log (e.g., on page unload).
     */
    clear() {
        this.log = [];
    }

    private generateSessionId(): string {
        return `awf-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    }
}
