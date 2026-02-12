/**
 * BridgeOrchestrator — The central nervous system that connects
 * all bridge modules to the XState machine.
 * 
 * This is a singleton service initialized by AgenticProvider.
 * It holds references to all bridge subsystems and provides
 * action handlers that the state machine invokes.
 */

import { SelfCorrector } from './SelfCorrector';
import { ShadowPiercer } from './ShadowPiercer';
import { InterruptionManager } from './InterruptionManager';
import { PIISanitizer } from './PIISanitizer';
import { FlightRecorder } from './FlightRecorder';
import { NarrativeEngine, NarrativeConfig } from './NarrativeEngine';
import gsap from 'gsap';

export interface BridgeConfig extends NarrativeConfig {
    scrollBehavior?: ScrollBehavior;
    interruptionThreshold?: number;
    idleTimeoutMs?: number;
    debug?: boolean;
}

export class BridgeOrchestrator {
    readonly selfCorrector: SelfCorrector;
    readonly shadowPiercer: ShadowPiercer;
    readonly interruptionManager: InterruptionManager;
    readonly sanitizer: PIISanitizer;
    readonly recorder: FlightRecorder;
    readonly narrativeEngine: NarrativeEngine;

    private sendEvent: ((event: any) => void) | null = null;
    private avatarContainer: HTMLElement | null = null;
    private config: BridgeConfig;

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
                // After idle, auto-resume
                this.sendEvent?.({ type: 'USER_RESUME' });
            },
        });
    }

    /**
     * Connect the orchestrator to the XState machine's send function.
     */
    connect(sendEvent: (event: any) => void) {
        this.sendEvent = sendEvent;
    }

    /**
     * Register the floating avatar container for GSAP animations.
     */
    setAvatarContainer(el: HTMLElement | null) {
        this.avatarContainer = el;
    }

    /**
     * Start monitoring user interactions (called on journey start).
     */
    startMonitoring() {
        this.interruptionManager.attach();
        this.recorder.record({ type: 'state_change', to: 'monitoring_started' });
    }

    /**
     * Stop monitoring (called on journey end or unmount).
     */
    stopMonitoring() {
        this.interruptionManager.detach();
        this.selfCorrector.reset();
    }

    // ─── Machine Action Handlers ───

    /**
     * Scroll the viewport to the target checkpoint element.
     * Uses ShadowPiercer for deep queries and SelfCorrector for verification.
     */
    async scrollToTarget(checkpointId: string): Promise<boolean> {
        this.recorder.record({
            type: 'bridge_action',
            target: checkpointId,
            metadata: { action: 'scroll_to_target' },
        });

        // Try standard query first, then deep-pierce
        let targetEl = document.getElementById(checkpointId);
        if (!targetEl) {
            const pierced = this.shadowPiercer.deepQuery(`#${checkpointId}`);
            if (pierced) {
                targetEl = pierced.element as HTMLElement;
                this.recorder.record({
                    type: 'bridge_action',
                    target: checkpointId,
                    metadata: { action: 'shadow_pierced', path: pierced.path },
                });
            }
        }

        if (!targetEl) {
            this.recorder.record({
                type: 'error',
                target: checkpointId,
                metadata: { reason: 'element_not_found' },
            });
            return false;
        }

        // Smooth scroll
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Wait for scroll to settle
        await new Promise((r) => setTimeout(r, 800));

        // Self-correct: verify the target is actually in view
        const verification = await this.selfCorrector.verifyTargetInView(checkpointId);
        if (verification.correctionApplied) {
            this.recorder.record({
                type: 'self_correct',
                target: checkpointId,
                metadata: { verification },
            });
        }

        return verification.success;
    }

    /**
     * Animate the avatar orb to fly to the target element's position.
     */
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

            this.recorder.record({
                type: 'bridge_action',
                target: checkpointId,
                metadata: { action: 'avatar_fly', x: targetX, y: targetY },
            });

            gsap.to(this.avatarContainer, {
                x: targetX,
                y: targetY - 90, // Float slightly above the center
                duration: 1.2,
                ease: 'expo.out',
                onComplete: () => {
                    this.interruptionManager.returnToAgentControl();
                    resolve();
                },
            });
        });
    }

    /**
     * Move the avatar to a non-intrusive corner when user takes control.
     */
    retreatAvatar() {
        if (!this.avatarContainer) return;

        this.recorder.record({
            type: 'bridge_action',
            metadata: { action: 'avatar_retreat' },
        });

        gsap.to(this.avatarContainer, {
            x: window.innerWidth - 100,
            y: window.innerHeight - 100,
            duration: 0.8,
            ease: 'power2.inOut',
        });
    }

    /**
     * Extract the narrative text for a checkpoint from the DOM attributes.
     */
    getNarrativeForCheckpoint(checkpointId: string): string {
        if (typeof document === 'undefined') return 'Let me tell you about this section...';
        const el = document.getElementById(checkpointId);
        if (!el) return 'Let me tell you about this section...';

        const narrative = el.getAttribute('data-agent-narrative');
        if (!narrative) return 'Let me tell you about this section...';

        // Sanitize the narrative through PII filter
        return this.sanitizer.sanitizeText(narrative);
    }

    /**
     * Kill all active GSAP animations (pause state).
     */
    killAllAnimations() {
        gsap.killTweensOf(this.avatarContainer);
        this.recorder.record({
            type: 'bridge_action',
            metadata: { action: 'animations_killed' },
        });
    }

    /**
     * Generate and stream a narrative for a checkpoint.
     */
    async streamNarrative(checkpointId: string): Promise<ReadableStream<string>> {
        const el = document.getElementById(checkpointId);
        const staticNarrative = el?.getAttribute('data-agent-narrative') || 'Let me tell you about this section...';

        // Pass the static narrative as context to the AI
        return this.narrativeEngine.generateStream(staticNarrative);
    }

    /**
     * Get the current flight log for debugging.
     */
    getFlightLog() {
        return this.recorder.export();
    }
}
