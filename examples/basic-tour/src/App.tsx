import React from 'react';
import { AgenticProvider, AgentCheckpoint, useAgent } from '@agentic-zero/core';

/* ─── Controls Panel ─── */
const DemoControls: React.FC = () => {
    const { state, send } = useAgent();

    const startTour = () => {
        send({ type: 'START_JOURNEY', initialQueue: ['hero', 'features', 'pricing', 'cta'] });
    };

    return (
        <div style={{
            position: 'fixed', top: 16, right: 16, zIndex: 10001,
            background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)',
            border: '1px solid rgba(74,222,128,0.3)', borderRadius: 12,
            padding: '16px 20px', display: 'flex', gap: 12, alignItems: 'center',
        }}>
            <span style={{ color: '#4ade80', fontSize: 13, fontFamily: 'monospace' }}>
                State: {String(state.value)}
            </span>
            <button onClick={startTour} style={{
                background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: 'white',
                border: 'none', borderRadius: 8, padding: '8px 18px', cursor: 'pointer',
                fontWeight: 600, fontSize: 14,
            }}>
                ▶ Start Tour
            </button>
        </div>
    );
};

/* ─── Sections ─── */
const sectionStyle = (bg: string): React.CSSProperties => ({
    minHeight: '100vh', display: 'flex', flexDirection: 'column',
    justifyContent: 'center', alignItems: 'center', padding: '80px 40px',
    background: bg, position: 'relative',
});

const App: React.FC = () => {
    return (
        <AgenticProvider config={{ persona: 'concierge', autoStart: false }}>
            <DemoControls />

            <div style={{ fontFamily: "'Inter', system-ui, sans-serif", color: 'white' }}>
                {/* Hero */}
                <AgentCheckpoint id="hero" narrative="Welcome to our product! I'll be your guide today. Let me show you around.">
                    <section style={sectionStyle('linear-gradient(180deg, #0a0a0a, #1a1a2e)')}>
                        <h1 style={{ fontSize: 64, fontWeight: 700, marginBottom: 16, background: 'linear-gradient(135deg, #4ade80, #22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            Agentic Web Framework
                        </h1>
                        <p style={{ fontSize: 22, opacity: 0.7, maxWidth: 600, textAlign: 'center', lineHeight: 1.6 }}>
                            The first SDK that transforms your website into an autonomous concierge.
                        </p>
                    </section>
                </AgentCheckpoint>

                {/* Features */}
                <AgentCheckpoint id="features" narrative="Here are our three pillars. Each one is designed for maximum impact with minimal developer effort.">
                    <section style={sectionStyle('linear-gradient(180deg, #1a1a2e, #0f172a)')}>
                        <h2 style={{ fontSize: 42, marginBottom: 48 }}>Core Features</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, maxWidth: 900 }}>
                            {['🧠 AI Brain', '🎭 3D Avatar', '🌐 Zero-Config'].map((title, i) => (
                                <div key={i} style={{
                                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: 16, padding: 32, textAlign: 'center',
                                }}>
                                    <h3 style={{ fontSize: 24, marginBottom: 12 }}>{title}</h3>
                                    <p style={{ opacity: 0.6, fontSize: 14 }}>
                                        {i === 0 && 'XState-powered state machine for flawless journey orchestration.'}
                                        {i === 1 && 'WebGL holographic orb that physically guides users through your site.'}
                                        {i === 2 && 'Just add data attributes. The agent finds them automatically.'}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>
                </AgentCheckpoint>

                {/* Pricing */}
                <AgentCheckpoint id="pricing" narrative="Our pricing scales with your needs. Most teams start with the free tier.">
                    <section style={sectionStyle('linear-gradient(180deg, #0f172a, #1e1b4b)')}>
                        <h2 style={{ fontSize: 42, marginBottom: 48 }}>Pricing</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, maxWidth: 900 }}>
                            {[
                                { name: 'Starter', price: 'Free', desc: 'For personal projects' },
                                { name: 'Pro', price: '$49/mo', desc: 'For growing teams' },
                                { name: 'Enterprise', price: 'Custom', desc: 'For scale' },
                            ].map((plan, i) => (
                                <div key={i} style={{
                                    background: i === 1 ? 'rgba(74,222,128,0.1)' : 'rgba(255,255,255,0.05)',
                                    border: `1px solid ${i === 1 ? 'rgba(74,222,128,0.4)' : 'rgba(255,255,255,0.1)'}`,
                                    borderRadius: 16, padding: 32, textAlign: 'center',
                                }}>
                                    <h3 style={{ fontSize: 20, marginBottom: 8 }}>{plan.name}</h3>
                                    <p style={{ fontSize: 36, fontWeight: 700, color: '#4ade80', marginBottom: 8 }}>{plan.price}</p>
                                    <p style={{ opacity: 0.6, fontSize: 14 }}>{plan.desc}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                </AgentCheckpoint>

                {/* CTA */}
                <AgentCheckpoint id="cta" narrative="That's the tour! Ready to get started? Click that button and you'll be up and running in 60 seconds.">
                    <section style={sectionStyle('linear-gradient(180deg, #1e1b4b, #0a0a0a)')}>
                        <h2 style={{ fontSize: 48, marginBottom: 24 }}>Ready to Ship?</h2>
                        <button style={{
                            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                            color: 'white', border: 'none', borderRadius: 12,
                            padding: '18px 48px', fontSize: 20, fontWeight: 700, cursor: 'pointer',
                            boxShadow: '0 0 40px rgba(34,197,94,0.4)',
                        }}>
                            Get Started →
                        </button>
                    </section>
                </AgentCheckpoint>
            </div>
        </AgenticProvider>
    );
};

export default App;
