/**
 * SelfCorrector — Predictive Verification Module
 * 
 * Addresses the "15% Gap": LLMs fail tool-calls ~15% of the time.
 * This module verifies the DOM state AFTER each bridge action and
 * self-corrects if the actual state doesn't match intent.
 */

export interface VerificationResult {
    success: boolean;
    expected: string;
    actual: string | null;
    correctionApplied: boolean;
}

export class SelfCorrector {
    private maxRetries = 3;
    private retryCount = 0;

    /**
     * Verify that after a scroll/focus action, the target element
     * is actually visible in the viewport.
     */
    async verifyTargetInView(targetId: string): Promise<VerificationResult> {
        const el = document.getElementById(targetId);

        if (!el) {
            return {
                success: false,
                expected: targetId,
                actual: null,
                correctionApplied: false,
            };
        }

        const rect = el.getBoundingClientRect();
        const inView =
            rect.top >= 0 &&
            rect.top < window.innerHeight &&
            rect.bottom > 0;

        if (inView) {
            this.retryCount = 0;
            return {
                success: true,
                expected: targetId,
                actual: targetId,
                correctionApplied: false,
            };
        }

        // Self-correct: scroll to the element
        if (this.retryCount < this.maxRetries) {
            this.retryCount++;
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });

            // Wait for scroll to settle, then re-verify
            await this.waitForIdle(600);
            const rectAfter = el.getBoundingClientRect();
            const nowInView = rectAfter.top >= 0 && rectAfter.top < window.innerHeight;

            return {
                success: nowInView,
                expected: targetId,
                actual: nowInView ? targetId : 'still-out-of-view',
                correctionApplied: true,
            };
        }

        return {
            success: false,
            expected: targetId,
            actual: 'max-retries-exceeded',
            correctionApplied: false,
        };
    }

    /**
     * Verify that a click action actually triggered a state change
     * (e.g., a modal opened, a class was added).
     */
    verifyDOMChange(selector: string, expectedAttribute: string, expectedValue: string): VerificationResult {
        const el = document.querySelector(selector);
        if (!el) {
            return { success: false, expected: expectedValue, actual: null, correctionApplied: false };
        }

        const actual = el.getAttribute(expectedAttribute);
        return {
            success: actual === expectedValue,
            expected: expectedValue,
            actual,
            correctionApplied: false,
        };
    }

    private waitForIdle(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    reset() {
        this.retryCount = 0;
    }
}
