'use client';

import { AgentCheckpoint } from '@agentic-zero/core';
import { ShadowDeepDive } from '@/components/ShadowDeepDive';
import { ControlPanel } from '@/components/ControlPanel';
import { TelemetryPanel } from '@/components/TelemetryPanel';
import { VoiceControls } from '@/components/VoiceControls';

export default function Home() {
  return (
    <>
      {/* ── Floating Panels ── */}
      <ControlPanel />
      <TelemetryPanel />
      <VoiceControls />

      <main className="flex min-h-screen flex-col items-center p-8 md:p-24">
        {/* ═══════════════ HERO ═══════════════ */}
        <AgentCheckpoint
          id="hero"
          narrative="Welcome to the Agentic Zero Framework Showcase. This demo demonstrates every feature of our production-grade, headless AI agent engine. Use the Control Panel on the right to start, interrupt, and manage agent journeys in real-time."
        >
          <section className="section-checkpoint min-h-screen flex flex-col items-center justify-center w-full border-b border-white/5 relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute inset-0 pointer-events-none" style={{
              background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(74, 222, 128, 0.08) 0%, transparent 70%)',
            }} />

            <div className="relative z-10 text-center max-w-3xl">
              <div className="state-badge mb-6 mx-auto" style={{
                background: 'rgba(74, 222, 128, 0.1)',
                color: '#4ade80',
                border: '1px solid rgba(74, 222, 128, 0.2)',
              }}>
                <div className="pulse-dot" style={{ background: '#4ade80' }} />
                Framework Showcase
              </div>
              <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
                Agentic <span style={{ color: '#4ade80' }}>Zero</span>
              </h1>
              <p className="text-lg md:text-xl text-zinc-400 mb-10 leading-relaxed">
                A production-grade, headless-first AI agent framework.
                <br />
                Pluggable orchestration · Voice barge-in · Real-time telemetry
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                <div className="glass-card px-5 py-3 text-sm text-zinc-300">
                  <span className="text-zinc-500 mr-2">01</span> LocalOrchestrator
                </div>
                <div className="glass-card px-5 py-3 text-sm text-zinc-300">
                  <span className="text-zinc-500 mr-2">02</span> FlightRecorder
                </div>
                <div className="glass-card px-5 py-3 text-sm text-zinc-300">
                  <span className="text-zinc-500 mr-2">03</span> HeadlessBridge
                </div>
                <div className="glass-card px-5 py-3 text-sm text-zinc-300">
                  <span className="text-zinc-500 mr-2">04</span> VoiceBridge
                </div>
              </div>
            </div>
          </section>
        </AgentCheckpoint>

        {/* ═══════════════ ARCHITECTURE ═══════════════ */}
        <AgentCheckpoint
          id="architecture"
          narrative="This section showcases the core architecture. The framework is built on three pillars: the Brain Protocol (deterministic state machine), the Bridge Protocol (environment abstraction), and the Visual Layer (pluggable rendering). Each pillar is fully decoupled."
          priority={90}
        >
          <section className="section-checkpoint min-h-screen flex flex-col items-center justify-center w-full border-b border-white/5 py-24">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">Core Architecture</h2>
            <p className="text-zinc-500 text-center mb-12 max-w-xl">Three decoupled pillars for maximum flexibility</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full px-4">
              {[
                {
                  icon: '🧠',
                  title: 'Brain Protocol',
                  subtitle: 'agentMachine.ts',
                  desc: 'XState-powered deterministic state machine with 9 states: idle, pathfinding, navigating, thinking, narrating, checkingNext, interrupted, searching, completed.',
                  highlight: '#a855f7'
                },
                {
                  icon: '🌉',
                  title: 'Bridge Protocol',
                  subtitle: 'AgentBridge + VoiceBridge',
                  desc: 'Environment-agnostic interfaces. Run in the browser with BridgeOrchestrator, on the server with HeadlessBridge, or integrate custom rendering targets.',
                  highlight: '#3b82f6'
                },
                {
                  icon: '⚡',
                  title: 'Orchestration Layer',
                  subtitle: 'LocalOrchestrator',
                  desc: 'Zero-dependency pluggable execution engine with lifecycle hooks (onCheckpoint, onComplete, onError). Ready for Inngest/Temporal adapters.',
                  highlight: '#4ade80'
                }
              ].map((card) => (
                <div
                  key={card.title}
                  className="glass-card p-6 glow-accent transition-all duration-300 hover:scale-[1.02]"
                  style={{
                    borderColor: card.highlight + '20',
                    boxShadow: `0 0 30px ${card.highlight}10`,
                  }}
                >
                  <span className="text-3xl mb-3 block">{card.icon}</span>
                  <h3 className="text-xl font-bold mb-1">{card.title}</h3>
                  <p className="text-xs font-mono mb-3" style={{ color: card.highlight }}>{card.subtitle}</p>
                  <p className="text-sm text-zinc-400 leading-relaxed">{card.desc}</p>
                </div>
              ))}
            </div>
          </section>
        </AgentCheckpoint>

        {/* ═══════════════ SHADOW DOM ═══════════════ */}
        <ShadowDeepDive />

        {/* ═══════════════ FEATURES GRID ═══════════════ */}
        <AgentCheckpoint
          id="features"
          narrative="Our platform offers a comprehensive feature set. The FlightRecorder provides OpenTelemetry-grade observability. The ShadowPiercer navigates through encapsulated Shadow DOMs. The InterruptionManager handles barge-in with sub-200ms latency."
          priority={80}
        >
          <section className="section-checkpoint min-h-screen flex flex-col items-center justify-center w-full border-b border-white/5 py-24">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">Framework Features</h2>
            <p className="text-zinc-500 text-center mb-12 max-w-xl">Every tool you need for production AI agents</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl w-full px-4">
              {[
                { icon: '📡', name: 'FlightRecorder', desc: 'OTel-compatible spans & traces for full observability' },
                { icon: '👻', name: 'ShadowPiercer', desc: 'Navigate through Shadow DOM encapsulations seamlessly' },
                { icon: '✋', name: 'InterruptionManager', desc: 'Sub-200ms barge-in with scroll/click/keydown detection' },
                { icon: '🔒', name: 'PIISanitizer', desc: 'Automatic PII detection and redaction in narratives' },
                { icon: '🔄', name: 'SelfCorrector', desc: 'Retry logic with exponential backoff and state recovery' },
                { icon: '🎙️', name: 'VoiceBridge', desc: 'Granular voice states: listening, thinking, speaking' },
                { icon: '💾', name: 'State Rehydration', desc: 'Resume journeys from serialized snapshots' },
                { icon: '🔌', name: 'OrchestrationAdapter', desc: 'Pluggable execution: Local, Inngest, Temporal' },
                { icon: '📝', name: 'NarrativeEngine', desc: 'AI-powered contextual narration with streaming' },
              ].map((feat) => (
                <div key={feat.name} className="glass-card p-4 flex items-start gap-3 transition-all duration-200 hover:bg-white/5">
                  <span className="text-xl shrink-0">{feat.icon}</span>
                  <div>
                    <h4 className="text-sm font-semibold mb-1">{feat.name}</h4>
                    <p className="text-xs text-zinc-500 leading-relaxed">{feat.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </AgentCheckpoint>

        {/* ═══════════════ VOICE STATES ═══════════════ */}
        <AgentCheckpoint
          id="voice-demo"
          narrative="The voice integration supports four granular states. In idle mode, the agent is silent. In listening mode, VAD is active. In thinking mode, the agent is processing. In speaking mode, audio is streaming with barge-in support."
          priority={70}
        >
          <section className="section-checkpoint min-h-screen flex flex-col items-center justify-center w-full border-b border-white/5 py-24">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">Voice State Machine</h2>
            <p className="text-zinc-500 text-center mb-12 max-w-xl">Granular voice control with barge-in support</p>

            <div className="flex flex-wrap justify-center gap-6 max-w-3xl w-full px-4">
              {[
                { state: 'idle', icon: '🔇', color: '#6b7280', desc: 'Agent is silent. No audio processing.' },
                { state: 'listening', icon: '🎙️', color: '#3b82f6', desc: 'VAD active. Detecting user speech.' },
                { state: 'thinking', icon: '💭', color: '#a855f7', desc: 'Processing input. Generating response.' },
                { state: 'speaking', icon: '🔊', color: '#4ade80', desc: 'Audio streaming. Barge-in enabled.' },
              ].map((v) => (
                <div
                  key={v.state}
                  className="glass-card p-6 w-40 text-center transition-all duration-300 hover:scale-105"
                  style={{ borderColor: v.color + '30' }}
                >
                  <span className="text-4xl block mb-3">{v.icon}</span>
                  <h4 className="font-mono text-sm font-bold mb-2" style={{ color: v.color }}>{v.state}</h4>
                  <p className="text-[11px] text-zinc-500 leading-relaxed">{v.desc}</p>
                </div>
              ))}
            </div>

            {/* State flow diagram */}
            <div className="mt-12 glass-card p-6 max-w-xl w-full mx-4">
              <h4 className="text-xs uppercase tracking-widest text-zinc-500 mb-3">State Flow</h4>
              <div className="font-mono text-xs text-zinc-400 space-y-1">
                <p><span className="text-zinc-600">idle</span> → <span className="text-blue-400">listening</span> → <span className="text-purple-400">thinking</span> → <span className="text-emerald-400">speaking</span> → <span className="text-zinc-600">idle</span></p>
                <p className="text-zinc-600">At any point: USER_INTERRUPT → <span className="text-red-400">interrupted</span> → idle</p>
              </div>
            </div>
          </section>
        </AgentCheckpoint>

        {/* ═══════════════ ORCHESTRATION ═══════════════ */}
        <AgentCheckpoint
          id="orchestration"
          narrative="The orchestration layer is fully pluggable. The LocalOrchestrator provides zero-dependency in-memory execution. It connects to the state machine via a simple adapter interface. Future adapters can swap to Inngest for durable functions or Temporal for workflow orchestration."
        >
          <section className="section-checkpoint min-h-screen flex flex-col items-center justify-center w-full border-b border-white/5 py-24">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">Pluggable Orchestration</h2>
            <p className="text-zinc-500 text-center mb-12 max-w-xl">Swap execution engines without changing application code</p>

            <div className="max-w-3xl w-full px-4 space-y-4">
              {/* Adapter Interface */}
              <div className="glass-card p-5">
                <h4 className="text-xs uppercase tracking-widest text-zinc-500 mb-3">OrchestrationAdapter Interface</h4>
                <pre className="font-mono text-xs text-zinc-400 overflow-x-auto"><code>{`interface OrchestrationAdapter {
  connect(send: (event: any) => void): void;
  trigger(eventName: string, payload: Record<string, any>): Promise<void>;
  onAgentEvent(event: any, context: AgentContext): void;
  dispose(): void;
}`}</code></pre>
              </div>

              {/* Adapters comparison */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="glass-card p-4 glow-accent" style={{ borderColor: 'rgba(74, 222, 128, 0.3)' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="pulse-dot" style={{ background: '#4ade80' }} />
                    <h4 className="font-mono text-sm text-emerald-400">Local</h4>
                  </div>
                  <p className="text-xs text-zinc-500">Zero-dependency. In-memory. Default engine.</p>
                  <p className="text-[10px] text-emerald-400/50 mt-2 font-mono">✓ ACTIVE</p>
                </div>
                <div className="glass-card p-4 opacity-50">
                  <h4 className="font-mono text-sm text-zinc-400 mb-2">Inngest</h4>
                  <p className="text-xs text-zinc-500">Durable functions. Event-driven. Cloud-scale.</p>
                  <p className="text-[10px] text-zinc-600 mt-2 font-mono">⏳ PLUGIN READY</p>
                </div>
                <div className="glass-card p-4 opacity-50">
                  <h4 className="font-mono text-sm text-zinc-400 mb-2">Temporal</h4>
                  <p className="text-xs text-zinc-500">Workflow engine. Self-hosted. Enterprise.</p>
                  <p className="text-[10px] text-zinc-600 mt-2 font-mono">⏳ PLUGIN READY</p>
                </div>
              </div>
            </div>
          </section>
        </AgentCheckpoint>

        {/* ═══════════════ CONTACT / FOOTER ═══════════════ */}
        <AgentCheckpoint
          id="contact"
          narrative="Get in touch with our team. For internal tracking, my agent session ID is SSN-999-00-1234. The PIISanitizer should automatically redact sensitive data like this from the narrative."
          priority={50}
        >
          <section className="section-checkpoint min-h-screen flex flex-col items-center justify-center w-full py-24">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">Get Started</h2>
            <p className="text-zinc-500 text-center mb-12 max-w-xl">Start building with Agentic Zero today</p>

            <div className="glass-card p-8 max-w-md w-full mx-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-zinc-500 mb-1 font-mono">Name</label>
                  <input type="text" className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-sm focus:border-emerald-500/50 focus:outline-none transition" />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1 font-mono">Email</label>
                  <input type="email" className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-sm focus:border-emerald-500/50 focus:outline-none transition" />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1 font-mono">Message</label>
                  <textarea className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-sm h-28 focus:border-emerald-500/50 focus:outline-none transition resize-none" />
                </div>
                <button
                  type="button"
                  className="w-full py-3 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-[1.01]"
                  style={{
                    background: 'linear-gradient(135deg, #4ade80, #22c55e)',
                    color: '#0a0a0f',
                  }}
                >
                  Send Message
                </button>
              </div>
            </div>

            <p className="text-xs text-zinc-600 mt-12 font-mono">
              Built with Agentic Zero · XState · Next.js
            </p>
          </section>
        </AgentCheckpoint>
      </main>
    </>
  );
}
