import { HeadlessBridge, LocalOrchestrator, createAgentMachine } from '../packages/core/src';
import { createActor } from 'xstate';

/**
 * Headless CLI Demo
 * 
 * Demonstrates the framework running in a zero-UI environment
 * with custom lifecycle hooks for terminal output.
 */
async function runDemo() {
    console.log('\n🚀 Starting Headless Agent Journey...\n');

    // 1. Setup Headless Infrastructure
    const bridge = new HeadlessBridge();

    const orchestrator = new LocalOrchestrator({
        onCheckpoint: (id) => {
            console.log(`📍 ARRIVED at checkpoint: ${id}`);
        },
        onComplete: () => {
            console.log('\n🏁 Journey finished successfully!\n');
            process.exit(0);
        },
        onError: (err) => {
            console.error(`❌ Journey error: ${err}`);
            process.exit(1);
        }
    });

    // 2. Initialize Agent Mind
    const machine = createAgentMachine(bridge, orchestrator);
    const actor = createActor(machine).start();

    // Connect orchestrator to the running actor
    orchestrator.connect(actor.send);

    // 3. Trigger Journey
    await orchestrator.trigger('journey.start', {
        checkpoints: ['hero_section', 'features_grid', 'pricing_table']
    });
}

runDemo().catch(console.error);
