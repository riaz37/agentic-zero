import { TelemetryProvider, TelemetrySpan, FlightEntry } from '../types/bridge';

/**
 * FlightRecorder — Observability & Telemetry Module
 * 
 * Implements industry-standard tracing patterns with support for 
 * Spans, Traces, and semantic AI conventions.
 */
export class FlightRecorder implements TelemetryProvider {
    private log: FlightEntry[] = [];
    private maxEntries = 1000;
    private sessionId: string;

    constructor() {
        this.sessionId = this.generateSessionId();
    }

    /**
     * Legacy record method (maintained for compatibility)
     */
    record(entry: Omit<FlightEntry, 'timestamp'>) {
        const full: FlightEntry = { ...entry, timestamp: Date.now() };
        this.log.push(full);

        if (this.log.length > this.maxEntries) {
            this.log = this.log.slice(-this.maxEntries);
        }

        if (process.env.NODE_ENV === 'development') {
            console.log(`[Telemetry] ${entry.type}`, entry);
        }
    }

    // --- TelemetryProvider Implementation ---

    startSpan(name: string, parentContext?: any): TelemetrySpan {
        const spanId = Math.random().toString(36).slice(2, 9);
        const startTime = Date.now();

        this.recordEvent(`span_start:${name}`, { spanId, parentContext });

        return {
            setAttribute: (key: string, value: any) => {
                this.recordEvent(`span_attr:${name}`, { spanId, [key]: value });
            },
            end: () => {
                const duration = Date.now() - startTime;
                this.recordEvent(`span_end:${name}`, { spanId, duration });
            }
        };
    }

    recordEvent(name: string, attributes?: Record<string, any>) {
        this.record({
            type: 'bridge_action',
            metadata: { event: name, ...attributes }
        });
    }

    recordError(error: Error | string, attributes?: Record<string, any>) {
        this.record({
            type: 'error',
            metadata: {
                message: error instanceof Error ? error.message : error,
                stack: error instanceof Error ? error.stack : undefined,
                ...attributes
            }
        });
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

    tail(n = 10): FlightEntry[] {
        return this.log.slice(-n);
    }

    errors(): FlightEntry[] {
        return this.log.filter((e) => e.type === 'error');
    }

    clear() {
        this.log = [];
    }

    private generateSessionId(): string {
        return `az-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    }
}
