import React, { useState, useEffect } from 'react';
import { useAgent } from './AgenticProvider';
import { FlightEntry } from '../bridge/FlightRecorder';

export const AgenticConsole: React.FC = () => {
    const { state, bridge } = useAgent();
    const [isOpen, setIsOpen] = useState(false);
    const [logs, setLogs] = useState<FlightEntry[]>([]);
    const [activeTab, setActiveTab] = useState<'status' | 'timeline' | 'logs' | 'context'>('status');

    useEffect(() => {
        if (!isOpen) return;
        const interval = setInterval(() => {
            setLogs(bridge.getFlightLog().entries.slice().reverse()); // Newest first
        }, 1000);
        return () => clearInterval(interval);
    }, [isOpen, bridge]);

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                style={{
                    position: 'fixed',
                    bottom: 20,
                    right: 20,
                    background: '#000',
                    color: '#4ade80',
                    border: '1px solid #4ade80',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontFamily: 'monospace',
                    cursor: 'pointer',
                    zIndex: 10001,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                }}
            >
                AGENT_DEBUG
            </button>
        );
    }

    return (
        <div style={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            width: '400px',
            height: '500px',
            background: 'rgba(10, 10, 10, 0.95)',
            border: '1px solid #333',
            borderRadius: '12px',
            display: 'flex',
            flexDirection: 'column',
            fontFamily: 'monospace',
            fontSize: '12px',
            color: '#e0e0e0',
            zIndex: 10001,
            boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
            backdropFilter: 'blur(10px)',
        }}>
            {/* Header */}
            <div style={{
                padding: '12px',
                borderBottom: '1px solid #333',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: '#111',
                borderTopLeftRadius: '12px',
                borderTopRightRadius: '12px',
            }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: state.matches('idle') ? '#666' : '#4ade80' }} />
                    <span style={{ fontWeight: 'bold' }}>AGENT_CONSOLE</span>
                </div>
                <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer' }}>✕</button>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid #333' }}>
                {['status', 'timeline', 'logs', 'context'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        style={{
                            flex: 1,
                            padding: '8px',
                            background: activeTab === tab ? '#222' : 'transparent',
                            border: 'none',
                            color: activeTab === tab ? '#4ade80' : '#888',
                            cursor: 'pointer',
                            borderBottom: activeTab === tab ? '2px solid #4ade80' : 'none',
                        }}
                    >
                        {tab.toUpperCase()}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
                {activeTab === 'status' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <StatusRow label="State" value={typeof state.value === 'string' ? state.value : JSON.stringify(state.value)} />
                        <StatusRow label="Checkpoint" value={state.context.currentCheckpoint || 'None'} />
                        <StatusRow label="Queue" value={`${state.context.journeyQueue.length} items`} />
                        <StatusRow label="Interrupted" value={state.context.userInterrupted ? 'YES' : 'NO'} color={state.context.userInterrupted ? '#ef4444' : '#4ade80'} />
                        <StatusRow label="Errors" value={String(state.context.errorCount)} color={state.context.errorCount > 0 ? '#ef4444' : '#888'} />

                        <div style={{ marginTop: '12px', padding: '8px', background: '#1a1a1a', borderRadius: '4px' }}>
                            <div style={{ color: '#888', marginBottom: '4px' }}>NARRATIVE BUFFER</div>
                            <div style={{ opacity: 0.7, fontStyle: 'italic' }}>
                                {state.context.narrativeBuffer?.slice(0, 100) || '(Empty)'}...
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'timeline' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {state.context.currentCheckpoint && (
                            <TimelineItem label={state.context.currentCheckpoint} active />
                        )}
                        {state.context.journeyQueue.map((id: string) => (
                            <TimelineItem key={id} label={id} />
                        ))}
                        {state.context.journeyQueue.length === 0 && !state.context.currentCheckpoint && (
                            <div style={{ textAlign: 'center', color: '#666', padding: '20px' }}>Journey queue empty</div>
                        )}
                    </div>
                )}

                {activeTab === 'logs' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {logs.map((log, i) => (
                            <div key={i} style={{ display: 'flex', gap: '8px', opacity: 0.8 }}>
                                <span style={{ color: '#666' }}>{new Date(log.timestamp).toLocaleTimeString().split(' ')[0]}</span>
                                <span style={{
                                    color: log.type === 'error' ? '#ef4444' :
                                        log.type === 'state_change' ? '#3b82f6' :
                                            log.type === 'bridge_action' ? '#a855f7' : '#e0e0e0'
                                }}>
                                    [{log.type}]
                                </span>
                                <span>{log.target || (log.metadata as any)?.action || (log as any).to || ''}</span>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'context' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ color: '#888', fontSize: '11px', marginBottom: '4px' }}>
                            LIVE AGENT MEMORY (AML MOCK)
                        </div>
                        {['hero', 'about', 'features', 'pricing'].map((section) => (
                            <div key={section} style={{
                                padding: '8px',
                                border: '1px solid #333',
                                background: state.context.currentCheckpoint === section ? 'rgba(74, 222, 128, 0.1)' : 'transparent',
                                color: state.context.currentCheckpoint === section ? '#4ade80' : '#666',
                                fontFamily: 'monospace'
                            }}>
                                &lt;section id="{section}"&gt;
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const StatusRow: React.FC<{ label: string; value: string; color?: string }> = ({ label, value, color }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ color: '#888' }}>{label}:</span>
        <span style={{ color: color || '#e0e0e0', fontWeight: 'bold' }}>{value}</span>
    </div>
);

const TimelineItem: React.FC<{ label: string; active?: boolean }> = ({ label, active }) => (
    <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px',
        background: active ? 'rgba(74, 222, 128, 0.1)' : '#1a1a1a',
        border: active ? '1px solid #4ade80' : '1px solid #333',
        borderRadius: '4px'
    }}>
        <div style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: active ? '#4ade80' : '#666'
        }} />
        <span style={{ color: active ? '#fff' : '#888' }}>{label}</span>
    </div>
);
