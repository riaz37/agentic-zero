import { AgentBridge } from '../types/bridge';

/**
 * HeadlessBridge — Zero-UI Implementation
 * 
 * Used for server-side journeys, testing, or CLI-based agents.
 * Logs all actions but does not interact with the DOM or GSAP.
 */
export class HeadlessBridge implements AgentBridge {
    async scrollToTarget(id: string): Promise<boolean> {
        console.log(`[Headless] Navigating to target: ${id}`);
        return true;
    }

    async flyAvatarTo(id: string): Promise<void> {
        console.log(`[Headless] Avatar flying to: ${id}`);
    }

    getNarrativeForCheckpoint(id: string): string {
        return `[Headless] Narrative for checkpoint ${id}`;
    }

    retreatAvatar(): void {
        console.log(`[Headless] Avatar retreating`);
    }

    killAllAnimations(): void {
        console.log(`[Headless] Animations killed`);
    }

    startMonitoring(): void {
        console.log(`[Headless] Monitoring started`);
    }

    stopMonitoring(): void {
        console.log(`[Headless] Monitoring stopped`);
    }
}
