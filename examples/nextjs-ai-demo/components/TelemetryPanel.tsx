'use client';

import { useAgent, FlightRecorder } from '@agentic-zero/core';
import { useState } from 'react';

interface FlightEntry {
    type: string;
    timestamp: number;
    from?: string;
    to?: string;
    metadata?: Record<string, any>;
}

export function TelemetryPanel() {
    const { bridge } = useAgent();
    const [entries, setEntries] = useState<FlightEntry[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    const refreshLog = () => {
        try {
            const recorder = (bridge as any).recorder as FlightRecorder;
            if (recorder) {
                const log = recorder.export();
                setEntries(log as FlightEntry[]);
            }
        } catch {
            setEntries([]);
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'state_change': return '#3b82f6';
            case 'user_interrupt': return '#ef4444';
            case 'error': return '#f97316';
            case 'bridge_action': return '#a855f7';
            default: return '#6b7280';
        }
    };

    return (
        <div className="fixed bottom-4 left-4 z-50">
            <button
                onClick={() => { setIsOpen(!isOpen); if (!isOpen) refreshLog(); }}
                className="panel px-4 py-2 rounded-xl text-xs font-mono text-zinc-400 hover:text-zinc-200 transition flex items-center gap-2"
            >
                <span>📡</span>
                <span>Telemetry</span>
                {entries.length > 0 && (
                    <span className="bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full text-[10px]">
                        {entries.length}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="panel rounded-2xl mt-2 p-4 w-[420px] max-h-[400px] overflow-hidden flex flex-col">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xs uppercase tracking-widest text-zinc-500">Flight Recorder — Traces</h3>
                        <button
                            onClick={refreshLog}
                            className="text-[10px] text-zinc-500 hover:text-zinc-300 transition"
                        >
                            ↻ Refresh
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-1">
                        {entries.length === 0 && (
                            <p className="text-xs text-zinc-600 italic">No telemetry entries. Start a journey and refresh.</p>
                        )}
                        {entries.map((entry, i) => (
                            <div
                                key={i}
                                className="glass-card p-2 flex items-start gap-3 text-[11px] font-mono"
                            >
                                {/* Timeline dot */}
                                <div className="flex flex-col items-center mt-1">
                                    <div
                                        className="w-2 h-2 rounded-full shrink-0"
                                        style={{ background: getTypeColor(entry.type) }}
                                    />
                                    {i < entries.length - 1 && (
                                        <div className="w-px h-full bg-white/5 mt-1" />
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span
                                            className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase"
                                            style={{
                                                background: getTypeColor(entry.type) + '20',
                                                color: getTypeColor(entry.type)
                                            }}
                                        >
                                            {entry.type}
                                        </span>
                                        <span className="text-zinc-600">
                                            {new Date(entry.timestamp).toLocaleTimeString('en-US', {
                                                hour12: false,
                                                fractionalSecondDigits: 3
                                            })}
                                        </span>
                                    </div>
                                    {entry.from && entry.to && (
                                        <p className="text-zinc-500 mt-1">
                                            {entry.from} <span className="text-zinc-600">→</span> {entry.to}
                                        </p>
                                    )}
                                    {entry.metadata && Object.keys(entry.metadata).length > 0 && (
                                        <p className="text-zinc-600 mt-0.5 truncate">
                                            {JSON.stringify(entry.metadata)}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
