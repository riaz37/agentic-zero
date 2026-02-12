import { SelfCorrector } from './SelfCorrector';
import { ShadowPiercer } from './ShadowPiercer';
import { InterruptionManager } from './InterruptionManager';
import { PIISanitizer } from './PIISanitizer';
import { FlightRecorder } from './FlightRecorder';
import { NarrativeEngine, NarrativeConfig } from './NarrativeEngine';
import { AgentBridge } from '../types/bridge';
import gsap from 'gsap';

export interface BridgeConfig extends NarrativeConfig {
    scrollBehavior?: ScrollBehavior;
    interruptionThreshold?: number;
    idleTimeoutMs?: number;
    debug?: boolean;
}

export class BridgeOrchestrator implements AgentBridge {
    readonly selfCorrector: SelfCorrector;
    readonly shadowPiercer: ShadowPiercer;
    readonly interruptionManager: InterruptionManager;
    readonly sanitizer: PIISanitizer;
    readonly recorder: FlightRecorder;
    readonly narrativeEngine: NarrativeEngine;

    private sendEvent: ((event: any) => void) | null = null;
    private avatarContainer: HTMLElement | null = null;
    private config: BridgeConfig;
    private checkpoints = new Map<string, string>();

    constructor(config: BridgeConfig = {}) {
        this.config = config;
        this.selfCorrector = new SelfCorrector();
        this.shadowPiercer = new ShadowPiercer();
        this.sanitizer = new PIISanitizer();
        this.recorder = new FlightRecorder();
        this.narrativeEngine = new NarrativeEngine({
            model: config.model,
            apiEndpoint: config.apiEndpoint,
            persona: config.persona,
        });

        this.interruptionManager = new InterruptionManager({
            scrollVelocityThreshold: config.interruptionThreshold ?? 50,
            idleTimeoutMs: config.idleTimeoutMs ?? 3000,
            onUserTakeover: () => {
                this.recorder.record({ type: 'user_interrupt', metadata: { source: 'scroll' } });
                this.sendEvent?.({ type: 'USER_INTERRUPT' });
            },
            onUserIdle: () => {
                this.recorder.record({ type: 'state_change', from: 'interrupted', to: 'negotiating' });
                const visibleCheckpoint = this.findVisibleCheckpoint();
                this.sendEvent?.({ type: 'USER_RESUME', target: visibleCheckpoint });
            },
        });
    }

    private findVisibleCheckpoint(): string | undefined {
        if (typeof document === 'undefined') return undefined;
        // Check registered checkpoints first
        const candidates = Array.from(this.checkpoints.keys());

        // If checkpoints are empty, fallback to common structure (optional, but good for demo)
        if (candidates.length === 0) {
            // For now, assume if not registered, we can't find it accurately.
            // Or querySelectorAll('[id^="section-"]')?
            // Let's stick to registered ones for reliability.
            return undefined;
        }

        let bestCandidate = undefined;
        let minDistance = Infinity;
        const centerY = window.innerHeight / 2;

        for (const id of candidates) {
            const el = document.getElementById(id);
            if (el) {
                const rect = el.getBoundingClientRect();
                const distance = Math.abs(rect.top + rect.height / 2 - centerY);
                // Check if element is at least partially in viewport and closer than others
                if (distance < minDistance && distance < window.innerHeight) {
                    minDistance = distance;
                    bestCandidate = id;
                }
            }
        }
        return bestCandidate;
    }

    /**
     * Connect the orchestrator to the XState machine's send function.
     */
    connect(sendEvent: (event: any) => void) {
        this.sendEvent = sendEvent;
    }

    setAvatarContainer(el: HTMLElement | null) {
        this.avatarContainer = el;
    }

    startMonitoring() {
        this.interruptionManager.attach();
        this.recorder.recordEvent('monitoring_started');
    }

    stopMonitoring() {
        this.interruptionManager.detach();
        this.selfCorrector.reset();
    }

    // --- AgentBridge Implementation ---

    async scrollToTarget(checkpointId: string): Promise<boolean> {
        const span = this.recorder.startSpan('scroll_to_target');
        span.setAttribute('target', checkpointId);

        let targetEl = document.getElementById(checkpointId);
        if (!targetEl) {
            const pierced = this.shadowPiercer.deepQuery(`#${checkpointId}`);
            if (pierced) {
                targetEl = pierced.element as HTMLElement;
            }
        }

        if (!targetEl) {
            this.recorder.recordError(`Element not found: ${checkpointId}`);
            span.end();
            return false;
        }

        this.interruptionManager.pause();
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        await new Promise((r) => setTimeout(r, 800));

        const verification = await this.selfCorrector.verifyTargetInView(checkpointId);
        this.interruptionManager.resume();
        span.end();
        return verification.success;
    }

    flyAvatarTo(checkpointId: string): Promise<void> {
        return new Promise((resolve) => {
            const targetEl = document.getElementById(checkpointId);
            if (!targetEl || !this.avatarContainer) {
                resolve();
                return;
            }

            const rect = targetEl.getBoundingClientRect();
            const targetX = rect.left + rect.width / 2;
            const targetY = rect.top + rect.height / 2;

            gsap.to(this.avatarContainer, {
                x: targetX,
                y: targetY - 90,
                duration: 1.2,
                ease: 'expo.out',
                onComplete: () => {
                    this.interruptionManager.resume();
                    this.interruptionManager.returnToAgentControl();
                    resolve();
                },
            });
        });
    }

    retreatAvatar() {
        if (!this.avatarContainer) return;
        gsap.to(this.avatarContainer, {
            x: window.innerWidth - 100,
            y: window.innerHeight - 100,
            duration: 0.8,
            ease: 'power2.inOut',
        });
    }

    getNarrativeForCheckpoint(checkpointId: string): string {
        if (this.checkpoints.has(checkpointId)) {
            return this.sanitizer.sanitizeText(this.checkpoints.get(checkpointId)!);
        }
        if (typeof document === 'undefined') return 'Context unavailable.';
        const el = document.getElementById(checkpointId);
        const narrative = el?.getAttribute('data-agent-narrative') || 'Let me tell you about this section...';
        return this.sanitizer.sanitizeText(narrative);
    }

    registerCheckpoint(id: string, narrative: string) {
        this.checkpoints.set(id, narrative);
    }

    async generateNarrative(checkpointId: string): Promise<string> {
        const contextText = this.getNarrativeForCheckpoint(checkpointId);
        return this.narrativeEngine.generateNarrative(contextText, this.config.persona);
    }

    async generateAnswer(question: string, context?: string): Promise<string> {
        return this.narrativeEngine.generateAnswer(question, context);
    }

    async streamNarrative(checkpointId: string): Promise<ReadableStream<string>> {
        const contextText = this.getNarrativeForCheckpoint(checkpointId);
        return this.narrativeEngine.generateStream(contextText, this.config.persona);
    }

    killAllAnimations() {
        gsap.killTweensOf(this.avatarContainer);
    }

    getFlightLog() {
        return this.recorder.export();
    }
}
