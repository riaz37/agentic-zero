/**
 * Core interfaces for the @agentic-zero framework.
 * These interfaces decouple the state machine from specific platform implementations.
 */

export interface FlightEntry {
    timestamp: number;
    type: 'state_change' | 'bridge_action' | 'error' | 'user_interrupt' | 'self_correct';
    from?: string;
    to?: string;
    target?: string;
    metadata?: Record<string, unknown>;
}

export interface AgentBridge {
    scrollToTarget: (id: string) => Promise<boolean>;
    flyAvatarTo: (id: string) => Promise<void>;
    connect(send: (event: any) => void): void;

    // Core methods
    getNarrativeForCheckpoint(checkpointId: string): string;
    generateNarrative(checkpointId: string): Promise<string>;
    generateAnswer(question: string, context?: string): Promise<string>;
    streamNarrative(checkpointId: string): Promise<ReadableStream<string>>;
    registerCheckpoint(id: string, narrative: string): void;

    retreatAvatar: () => void;
    killAllAnimations: () => void;
    startMonitoring: () => void;
    stopMonitoring: () => void;
}

export interface VoiceBridge {
    /** Start listening for user input (VAD enabled) */
    startListening: () => void;
    /** Stop listening */
    stopListening: () => void;
    /** Speak a piece of text (supports streaming) */
    speak: (text: string) => Promise<void>;
    /** Immediately stop all audio output (for barge-in) */
    interrupt: () => void;
    /** Whether the agent is currently speaking */
    isSpeaking: boolean;
    /** Set personal handler for voice-related errors */
    setErrorHandler: (handler: (error: string) => void) => void;
}

export interface TelemetrySpan {
    end: () => void;
    setAttribute: (key: string, value: any) => void;
}

export interface TelemetryProvider {
    /** Start a new trace span (OpenTelemetry pattern) */
    startSpan: (name: string, parentContext?: any) => TelemetrySpan;
    /** Record an event with attributes */
    recordEvent: (name: string, attributes?: Record<string, any>) => void;
    /** Record an error */
    recordError: (error: Error | string, attributes?: Record<string, any>) => void;
}

/**
 * The configuration object for the Ingestion phase.
 */
export interface IngestionConfig {
    /** Source of the data (URL, JSON, API) */
    source: string;
    /** Validation schema name or Zod object */
    schema?: any;
    /** Transformation rules */
    transform?: (data: any) => any;
}
