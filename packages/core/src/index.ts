'use client';

// ──── Developer-Facing Components ────
export { AgenticProvider, useAgent } from './components/AgenticProvider';
export { AgentCheckpoint } from './components/AgentCheckpoint';
// export { NarrativeSynthesizer } (Deleted)
// export { AgenticConsole } (Moved to Demo)

// ──── Visual Layer (MOVED TO DEMO) ────
// VisualBridge and SVGFallbackAvatar are now part of the consuming app's UI layer.

// ──── Core Brain ────
export { agentMachine, createAgentMachine } from './machine/agentMachine';
export type { AgentContext, AgentEvent } from './machine/agentMachine';

// ──── Bridge Protocol ────
export { BridgeOrchestrator } from './bridge/BridgeOrchestrator';
export type { BridgeConfig } from './bridge/BridgeOrchestrator';

export { NarrativeEngine } from './bridge/NarrativeEngine';
export type { NarrativeConfig } from './bridge/NarrativeEngine';

export { SelfCorrector } from './bridge/SelfCorrector';
export type { VerificationResult } from './bridge/SelfCorrector';

export { ShadowPiercer } from './bridge/ShadowPiercer';
export type { PiercedElement } from './bridge/ShadowPiercer';

export { InterruptionManager } from './bridge/InterruptionManager';
export type { InterruptionState } from './bridge/InterruptionManager';

export { PIISanitizer } from './bridge/PIISanitizer';
export type { SanitizedNode } from './bridge/PIISanitizer';

export { FlightRecorder } from './bridge/FlightRecorder';
export type { FlightEntry } from './types/bridge';

export { HeadlessBridge } from './bridge/HeadlessBridge';
export { IngestionManager } from './bridge/IngestionManager';
export { LocalOrchestrator } from './orchestration/LocalOrchestrator';
export type { OrchestrationAdapter } from './types/orchestration';
export type { VoiceBridge } from './types/bridge';

// ──── Voice ────
export { WebSpeechVoiceBridge } from './voice/WebSpeechVoiceBridge';
export type { WebSpeechConfig } from './voice/WebSpeechVoiceBridge';

// ──── Context Engine ────
export { ContextObserver } from './context/ContextObserver';
