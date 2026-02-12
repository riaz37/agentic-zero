'use client';

import React, { useState, useEffect } from 'react';
import { useAgent } from './AgenticProvider';
import gsap from 'gsap';

export const NarrativeSynthesizer: React.FC = () => {
    const { state, bridge } = useAgent();
    const [displayText, setDisplayText] = useState('');
    const containerRef = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (state.matches('narrating')) {
            setDisplayText('');

            // Animate container in
            gsap.fromTo(containerRef.current,
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
            );

            let isCancelled = false;

            const startStreaming = async () => {
                try {
                    const stream = await bridge.streamNarrative(state.context.currentCheckpoint!);
                    const reader = stream.getReader();

                    while (true) {
                        const { done, value } = await reader.read();
                        if (done || isCancelled) break;

                        setDisplayText((prev) => prev + value);
                    }
                } catch (err) {
                    console.error('AgenticZero: Narration failed', err);
                    setDisplayText('I had trouble analyzing this section...');
                }
            };

            startStreaming();

            return () => {
                isCancelled = true;
            };
        }
    }, [state.value, state.context.currentCheckpoint, bridge]);

    if (!state.matches('narrating') && !state.matches('thinking')) return null;

    return (
        <div
            ref={containerRef}
            style={{
                position: 'fixed',
                bottom: '40px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '80%',
                maxWidth: '600px',
                padding: '24px',
                background: 'rgba(20, 20, 20, 0.8)', // Darker background for readability
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                color: '#e0e0e0',
                fontFamily: 'system-ui, sans-serif',
                fontSize: '18px',
                lineHeight: '1.6',
                boxShadow: '0 10px 40px rgba(0,0,0,0.6)',
                zIndex: 10000,
                textAlign: 'center'
            }}
        >
            {state.matches('thinking') ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                    <span style={{ width: 8, height: 8, background: '#4ade80', borderRadius: '50%', animation: 'pulse 1s infinite' }}></span>
                    <span style={{ opacity: 0.7, fontSize: '14px', letterSpacing: '1px' }}>ANALYZING CONTEXT...</span>
                </div>
            ) : (
                displayText
            )}
            <style>{`
                @keyframes pulse {
                    0% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.5); opacity: 0.5; }
                    100% { transform: scale(1); opacity: 1; }
                }
            `}</style>
        </div>
    );
};
