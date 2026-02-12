'use client';

import { useAgent, FlightRecorder } from '@agentic-zero/core';
import { useDemoEvents } from '@/app/providers';
import { useEffect, useRef, useState } from 'react';

const STATE_COLORS: Record<string, string> = {
    idle: '#6b7280',
    pathfinding: '#f59e0b',
    navigating: '#3b82f6',
    thinking: '#a855f7',
    narrating: '#4ade80',
    interrupted: '#ef4444',
    searching: '#f97316',
    completed: '#10b981',
    checkingNext: '#06b6d4',
};

const VOICE_ICONS: Record<string, string> = {
    idle: '🔇',
    listening: '🎙️',
    thinking: '💭',
    speaking: '🔊',
};

export function ControlPanel() {
    const { state, send, bridge } = useAgent();
    const { events, pushEvent, clearEvents } = useDemoEvents();
    const feedRef = useRef<HTMLDivElement>(null);
    const [isExpanded, setIsExpanded] = useState(true);

    const currentState = typeof state.value === 'string' ? state.value : Object.keys(state.value)[0];
    const voiceState = state.context?.voiceState || 'idle';
    const checkpoint = state.context?.currentCheckpoint || '—';
    const queueLength = state.context?.journeyQueue?.length || 0;
    const errorCount = state.context?.errorCount || 0;

    // Log state transitions
    const prevStateRef = useRef(currentState);
    useEffect(() => {
        if (prevStateRef.current !== currentState) {
            pushEvent('STATE', `${prevStateRef.current} → ${currentState}`);
            prevStateRef.current = currentState;
        }
    }, [currentState, pushEvent]);

    const handleStart = () => {
        const checkpoints = Array.from(document.querySelectorAll('[data-agent-checkpoint]'))
            .map(el => el.getAttribute('id'))
            .filter(Boolean) as string[];

        // Also check shadow roots
        document.querySelectorAll('*').forEach(el => {
            if (el.shadowRoot) {
                el.shadowRoot.querySelectorAll('[data-agent-checkpoint]').forEach(inner => {
                    const id = inner.getAttribute('id');
                    if (id) checkpoints.push(id);
                });
            }
        });

        if (checkpoints.length > 0) {
            pushEvent('TRIGGER', `Starting journey with ${checkpoints.length} checkpoints`);
            send({ type: 'START_JOURNEY', initialQueue: checkpoints });
        } else {
            pushEvent('WARN', 'No checkpoints found on page');
        }
    };

    const handleCancel = () => {
        pushEvent('TRIGGER', 'Journey cancelled by user');
        send({ type: 'CANCEL_JOURNEY' });
    };

    const handleInterrupt = () => {
        pushEvent('TRIGGER', 'User interrupt (barge-in)');
        send({ type: 'USER_INTERRUPT' });
    };

    const handleResume = () => {
        pushEvent('TRIGGER', 'User resume');
        send({ type: 'USER_RESUME' });
    };

    const handleRehydrate = () => {
        pushEvent('TRIGGER', 'State rehydrated from snapshot');
        send({
            type: 'REHYDRATE_STATE',
            context: {
                journeyQueue: ['features', 'pricing', 'contact'],
                currentCheckpoint: null,
                errorCount: 0,
                userInterrupted: false,
            }
        });
    };

    const handleExportLog = () => {
        try {
            const recorder = (bridge as any).recorder as FlightRecorder;
            if (recorder) {
                const log = recorder.export();
                pushEvent('EXPORT', `Flight log: ${log.length} entries exported to console`);
                console.log('[FlightRecorder Export]', log);
            }
        } catch {
            pushEvent('WARN', 'FlightRecorder not available on bridge');
        }
    };

    const stateColor = STATE_COLORS[currentState] || '#6b7280';

    return (
        <div
            className="panel fixed top-4 right-4 z-50 rounded-2xl overflow-hidden transition-all duration-300"
            style={{ width: isExpanded ? 340 : 56 }}
        >
            {/* Toggle button */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="absolute top-3 left-3 z-10 w-8 h-8 rounded-lg flex items-center justify-center text-sm bg-white/5 hover:bg-white/10 transition"
                title={isExpanded ? 'Collapse' : 'Expand'}
            >
                {isExpanded ? '◁' : '▷'}
            </button>

            {!isExpanded && (
                <div className="flex flex-col items-center pt-14 pb-3 gap-3">
                    <div className="pulse-dot" style={{ background: stateColor }} />
                    <span className="text-xs" style={{ writingMode: 'vertical-rl' }}>{currentState}</span>
                </div>
            )}

            {isExpanded && (
                <div className="pt-14 pb-4 px-4">
                    {/* Header */}
                    <div className="mb-4">
                        <h3 className="text-xs uppercase tracking-widest text-zinc-500 mb-2">Agent Control Panel</h3>
                        <div className="flex items-center gap-3">
                            <div className="state-badge glow-accent" style={{ background: stateColor + '20', color: stateColor, border: `1px solid ${stateColor}40` }}>
                                <div className="pulse-dot" style={{ background: stateColor }} />
                                {currentState}
                            </div>
                            <span className="text-lg" title={`Voice: ${voiceState}`}>{VOICE_ICONS[voiceState]}</span>
                        </div>
                    </div>

                    {/* Context Info */}
                    <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
                        <div className="glass-card p-2">
                            <span className="text-zinc-500">Checkpoint</span>
                            <p className="font-mono text-zinc-300 truncate">{checkpoint}</p>
                        </div>
                        <div className="glass-card p-2">
                            <span className="text-zinc-500">Queue</span>
                            <p className="font-mono text-zinc-300">{queueLength} remaining</p>
                        </div>
                        <div className="glass-card p-2">
                            <span className="text-zinc-500">Errors</span>
                            <p className="font-mono text-zinc-300">{errorCount}</p>
                        </div>
                        <div className="glass-card p-2">
                            <span className="text-zinc-500">Voice</span>
                            <p className="font-mono text-zinc-300">{voiceState}</p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-2 mb-4">
                        <button
                            onClick={handleStart}
                            disabled={currentState !== 'idle'}
                            className="text-xs px-3 py-2 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-600/30 hover:bg-emerald-600/30 transition disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            ▶ Start Journey
                        </button>
                        <button
                            onClick={handleCancel}
                            disabled={currentState === 'idle' || currentState === 'completed'}
                            className="text-xs px-3 py-2 rounded-lg bg-red-600/20 text-red-400 border border-red-600/30 hover:bg-red-600/30 transition disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            ⏹ Cancel
                        </button>
                        <button
                            onClick={handleInterrupt}
                            disabled={currentState === 'idle' || currentState === 'interrupted' || currentState === 'completed'}
                            className="text-xs px-3 py-2 rounded-lg bg-amber-600/20 text-amber-400 border border-amber-600/30 hover:bg-amber-600/30 transition disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            ✋ Interrupt
                        </button>
                        <button
                            onClick={handleResume}
                            disabled={currentState !== 'interrupted'}
                            className="text-xs px-3 py-2 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-600/30 hover:bg-blue-600/30 transition disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            ▶ Resume
                        </button>
                        <button
                            onClick={handleRehydrate}
                            disabled={currentState !== 'idle'}
                            className="text-xs px-3 py-2 rounded-lg bg-purple-600/20 text-purple-400 border border-purple-600/30 hover:bg-purple-600/30 transition disabled:opacity-30 disabled:cursor-not-allowed col-span-2"
                        >
                            🔄 Rehydrate State (Resume from snapshot)
                        </button>
                    </div>

                    {/* Telemetry Export */}
                    <button
                        onClick={handleExportLog}
                        className="w-full text-xs px-3 py-2 rounded-lg bg-white/5 text-zinc-400 border border-white/10 hover:bg-white/10 transition mb-4"
                    >
                        📊 Export Flight Log to Console
                    </button>

                    {/* Live Event Feed */}
                    <div className="flex items-center justify-between mb-2">
                        <h4 className="text-xs uppercase tracking-widest text-zinc-500">Live Events</h4>
                        <button onClick={clearEvents} className="text-[10px] text-zinc-600 hover:text-zinc-400 transition">Clear</button>
                    </div>
                    <div ref={feedRef} className="max-h-52 overflow-y-auto space-y-1">
                        {events.length === 0 && (
                            <p className="text-xs text-zinc-600 italic">No events yet. Start a journey!</p>
                        )}
                        {events.map(e => (
                            <div key={e.id} className="slide-in text-[11px] font-mono flex gap-2 py-1 border-b border-white/5">
                                <span className="text-zinc-600 shrink-0">
                                    {new Date(e.timestamp).toLocaleTimeString('en-US', { hour12: false })}
                                </span>
                                <span className="text-amber-400 shrink-0 w-14">[{e.type}]</span>
                                <span className="text-zinc-400 truncate">{e.detail}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
