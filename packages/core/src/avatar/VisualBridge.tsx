'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useAgent } from '../components/AgenticProvider';
import gsap from 'gsap';

export const VisualBridge: React.FC = () => {
    const { state, send, bridge } = useAgent();
    const containerRef = useRef<HTMLDivElement>(null);
    const bubbleRef = useRef<HTMLDivElement>(null);
    const [displayText, setDisplayText] = useState('');

    useEffect(() => {
        if (containerRef.current) {
            bridge.setAvatarContainer(containerRef.current);
        }
    }, [bridge]);

    // Narrative Streaming Logic (Moved from NarrativeSynthesizer)
    useEffect(() => {
        if (state.matches('narrating')) {
            setDisplayText('');
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

                    if (!isCancelled) {
                        setTimeout(() => {
                            if (!isCancelled) send({ type: 'NARRATION_COMPLETE' });
                        }, 2000);
                    }
                } catch (err) {
                    console.error('AgenticZero: Narration failed', err);
                    setDisplayText('I had trouble analyzing this section...');
                    if (!isCancelled) {
                        setTimeout(() => {
                            if (!isCancelled) send({ type: 'NARRATION_COMPLETE' });
                        }, 3000);
                    }
                }
            };

            startStreaming();
            return () => { isCancelled = true; };
        }
    }, [state.value, state.context.currentCheckpoint, bridge, send]);

    // Animate Speech Bubble
    useEffect(() => {
        const isVisible = state.matches('narrating') || state.matches('thinking');
        if (isVisible) {
            gsap.to(bubbleRef.current, {
                opacity: 1,
                scale: 1,
                y: -20,
                duration: 0.4,
                ease: 'back.out(1.7)'
            });
        } else {
            gsap.to(bubbleRef.current, {
                opacity: 0,
                scale: 0.8,
                y: 0,
                duration: 0.3,
                ease: 'power2.in'
            });
        }
    }, [state.value]);

    const isThinking = state.matches('thinking');
    const isNarrating = state.matches('narrating');

    return (
        <div
            ref={containerRef}
            style={{
                position: 'fixed',
                top: '0',
                left: '0',
                width: '100px',
                height: '100px',
                pointerEvents: 'none',
                zIndex: 9999,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            {/* Speech Bubble */}
            <div
                ref={bubbleRef}
                style={{
                    position: 'absolute',
                    bottom: '110%',
                    width: '280px',
                    padding: '16px',
                    background: 'rgba(10, 10, 10, 0.9)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(74, 222, 128, 0.3)',
                    borderRadius: '16px',
                    color: '#fff',
                    fontSize: '14px',
                    lineHeight: '1.5',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                    opacity: 0,
                    transform: 'scale(0.8)',
                    textAlign: 'center',
                }}
            >
                {isThinking ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <div className="agent-pulse-dot" />
                        <span style={{ fontSize: '11px', letterSpacing: '1px', color: '#4ade80' }}>ANALYZING...</span>
                    </div>
                ) : (
                    displayText
                )}
                {/* Bubble Tail */}
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '0',
                    height: '0',
                    borderLeft: '10px solid transparent',
                    borderRight: '10px solid transparent',
                    borderTop: '10px solid rgba(74, 222, 128, 0.3)',
                }} />
            </div>

            {/* Marque SVG Avatar */}
            <div
                style={{
                    width: '80px',
                    height: '80px',
                    position: 'relative',
                    animation: (isThinking || isNarrating) ? 'agent-float 2s ease-in-out infinite' : 'none'
                }}
            >
                <svg width="100%" height="100%" viewBox="0 0 184 183" fill="none" xmlns="http://www.w3.org/2000/svg" style={{
                    filter: isThinking ? 'drop-shadow(0 0 15px #4ade80)' : 'none',
                    transition: 'filter 0.3s ease'
                }}>
                    <path d="M43.6665 51.6318H139.818C153.843 51.6318 165.161 63.1704 165.161 77.1948V103.216C165.161 131.494 142.084 154.8 113.577 154.8H69.6878C41.4099 154.8 18.1035 131.494 18.1035 103.216V77.1948C18.1035 63.1704 29.6421 51.6318 43.6665 51.6318Z" fill="white" fillOpacity="0.2" />
                    <path d="M159.51 126.524C171.956 122.223 180.78 110.464 180.78 96.4306C180.78 84.2133 173.993 73.5826 163.811 68.373C164.719 71.088 165.169 73.803 165.169 76.7471V102.989C165.16 111.363 163.124 119.508 159.51 126.524Z" fill="#13F584" />
                    <path d="M23.4004 127.778C10.9585 123.43 2.13817 111.544 2.13817 97.3598C2.13817 85.0109 8.92305 74.2657 19.1004 69C18.1928 71.7442 17.7434 74.4884 17.7434 77.4643V103.989C17.7522 112.453 19.7877 120.686 23.4004 127.778Z" fill="#13F584" />
                    <path d="M112.002 79.2306H71.2777C63.1328 79.2306 55.8958 75.1582 51.365 68.8203H49.0996V69.4991C52.9429 77.8731 61.5461 83.7526 71.2689 83.7526H111.993C121.945 83.7526 130.319 77.8731 134.163 69.4991V68.8203H131.897C127.613 75.1582 120.367 79.2306 112.002 79.2306Z" fill="#13F584" />
                    <path d="M69.2403 149.37C40.2836 149.37 16.748 125.843 16.748 96.8779V100.501C16.748 129.457 40.2748 152.993 69.2403 152.993H114.037C142.994 152.993 166.75 129.466 166.75 100.501V96.8779C166.75 125.835 142.994 149.37 114.037 149.37H69.2403Z" fill="#71FDB7" />
                    <path d="M68.7805 27.4268H114.485C139.37 27.4268 160.19 45.7528 164.033 69.5087C160.869 59.0984 151.137 51.6322 139.828 51.6322H43.6671C32.3577 51.6322 22.6261 59.0984 19.2324 69.5087C23.3049 45.7528 43.8963 27.4268 68.7805 27.4268Z" fill="#13F584" />
                    {/* Simplified some paths for cleaner SVG rendering */}
                    <path d="M91.6383 37.3794C95.9399 37.3794 99.7832 36.2511 103.177 34.4353Z" fill="black" />
                </svg>
            </div>

            <style>{`
                @keyframes agent-float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                .agent-pulse-dot {
                    width: 6px;
                    height: 6px;
                    background: #4ade80;
                    border-radius: 50%;
                    animation: agent-dot-pulse 1s infinite;
                }
                @keyframes agent-dot-pulse {
                    0% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.5); opacity: 0.5; }
                    100% { transform: scale(1); opacity: 1; }
                }
            `}</style>
        </div>
    );
};
