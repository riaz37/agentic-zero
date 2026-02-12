'use client';

// ──── Developer-Facing Components ────
export { AgenticProvider, useAgent } from './components/AgenticProvider';
export { AgentCheckpoint } from './components/AgentCheckpoint';
export { NarrativeSynthesizer } from './components/NarrativeSynthesizer';
export { AgenticConsole } from './components/AgenticConsole';

// ──── Visual Layer ────
export { HolographicAvatar } from './avatar/HolographicAvatar';
export { VisualBridge } from './avatar/VisualBridge';
export { SVGFallbackAvatar, shouldUseFallback } from './avatar/SVGFallbackAvatar';

// ──── Core Brain ────
export { agentMachine } from './machine/agentMachine';
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
export type { FlightEntry } from './bridge/FlightRecorder';

// ──── Context Engine ────
export { ContextObserver } from './context/ContextObserver';
