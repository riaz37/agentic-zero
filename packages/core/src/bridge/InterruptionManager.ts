/**
 * InterruptionManager — "Tug-of-War" Logic
 * 
 * Detects when the user takes manual control (scrolling, clicking)
 * and gracefully transitions the agent to a passive state.
 * Re-engages after a configurable idle timeout.
 */

export type InterruptionState = 'agent-control' | 'user-control' | 'negotiating';

interface InterruptionConfig {
    scrollVelocityThreshold: number;   // px/100ms — above this = user override
    idleTimeoutMs: number;             // how long to wait before re-engaging
    onUserTakeover: () => void;
    onUserIdle: () => void;
}

export class InterruptionManager {
    private state: InterruptionState = 'agent-control';
    private lastScrollY = 0;
    private lastScrollTime = 0;
    private idleTimer: ReturnType<typeof setTimeout> | null = null;
    private config: InterruptionConfig;
    private cleanup: (() => void)[] = [];
    private _isPaused = false;

    constructor(config: InterruptionConfig) {
        this.config = config;
    }

    /**
     * Start monitoring user interactions.
     */
    attach() {
        const handleScroll = () => {
            if (this._isPaused) return;
            const now = Date.now();
            const dt = now - this.lastScrollTime;
            const dy = Math.abs(window.scrollY - this.lastScrollY);

            if (dt > 0) {
                const velocity = (dy / dt) * 100; // px per 100ms

                if (velocity > this.config.scrollVelocityThreshold && this.state === 'agent-control') {
                    this.enterUserControl();
                }
            }

            this.lastScrollY = window.scrollY;
            this.lastScrollTime = now;
            this.resetIdleTimer();
        };

        const handleClick = () => {
            if (this._isPaused) return;
            if (this.state === 'agent-control') {
                this.enterUserControl();
            }
            this.resetIdleTimer();
        };

        const handleKeydown = (e: KeyboardEvent) => {
            if (this._isPaused) return;
            // Tab, arrows, space = navigation intent
            if (['Tab', 'ArrowDown', 'ArrowUp', ' '].includes(e.key)) {
                if (this.state === 'agent-control') {
                    this.enterUserControl();
                }
                this.resetIdleTimer();
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('click', handleClick, { passive: true });
        window.addEventListener('keydown', handleKeydown, { passive: true });

        this.cleanup.push(
            () => window.removeEventListener('scroll', handleScroll),
            () => window.removeEventListener('click', handleClick),
            () => window.removeEventListener('keydown', handleKeydown),
        );
    }

    private enterUserControl() {
        this.state = 'user-control';
        this.config.onUserTakeover();
    }

    private resetIdleTimer() {
        if (this.idleTimer) clearTimeout(this.idleTimer);
        this.idleTimer = setTimeout(() => {
            if (this.state === 'user-control') {
                this.state = 'negotiating';
                this.config.onUserIdle();
            }
        }, this.config.idleTimeoutMs);
    }

    /**
     * Called by the agent when it resumes after idle.
     */
    returnToAgentControl() {
        this.state = 'agent-control';
        this._isPaused = false;
    }

    /**
     * Temporarily ignore all interactions (e.g. during automated scroll)
     */
    pause() {
        this._isPaused = true;
    }

    /**
     * Resume monitoring after pause
     */
    resume() {
        this._isPaused = false;
        // Reset scroll position tracking to avoid velocity spike after resume
        this.lastScrollY = window.scrollY;
        this.lastScrollTime = Date.now();
    }

    getState(): InterruptionState {
        return this.state;
    }

    detach() {
        this.cleanup.forEach((fn) => fn());
        this.cleanup = [];
        if (this.idleTimer) clearTimeout(this.idleTimer);
    }
}
