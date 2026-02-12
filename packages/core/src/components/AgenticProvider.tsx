'use client';

import React, { createContext, useContext, useEffect, useMemo, useRef } from 'react';
import { useMachine } from '@xstate/react';
import { createAgentMachine } from '../machine/agentMachine';
import { BridgeOrchestrator, BridgeConfig } from '../bridge/BridgeOrchestrator';

import { LocalOrchestrator } from '../orchestration/LocalOrchestrator';

import { WebSpeechVoiceBridge } from '../voice/WebSpeechVoiceBridge';
import { VoiceBridge } from '../types/bridge';

export interface AgentContextType {
    state: any;
    send: (event: any) => void;
    bridge: BridgeOrchestrator;
    voice?: VoiceBridge;
    orchestrator: LocalOrchestrator;
}

const AgentContext = createContext<AgentContextType | null>(null);

export interface AgenticProviderConfig {
    persona?: string;
    autoStart?: boolean;
    debug?: boolean;
    enableVoice?: boolean;
    apiEndpoint?: string;
    model?: any;
    bridge?: BridgeConfig;
}

export const AgenticProvider: React.FC<{
    children: React.ReactNode;
    config?: AgenticProviderConfig;
}> = ({ children, config }) => {
    // Create the bridge orchestrator once
    const bridge = useMemo(() => {
        return new BridgeOrchestrator({
            debug: config?.debug,
            persona: config?.persona,
            apiEndpoint: config?.apiEndpoint,
            model: config?.model,
            ...config?.bridge,
        });
    }, []);

    // Create the orchestration adapter (pluggable)
    const orchestrator = useMemo(() => new LocalOrchestrator(), []);

    // Create voice bridge if enabled
    const voice = useMemo(() => {
        return config?.enableVoice ? new WebSpeechVoiceBridge({
            lang: 'en-US',
            pitch: 1,
            rate: 1,
        }) : undefined;
    }, [config?.enableVoice]);

    // Create the machine with the live bridge and telemetry wired in
    const machine = useMemo(() => {
        return createAgentMachine(bridge, orchestrator, voice, bridge.recorder);
    }, [bridge, orchestrator, voice]);
    const [state, send] = useMachine(machine);

    const [mounted, setMounted] = React.useState(false);

    // Connect the bridge and orchestrator to the machine's send function
    useEffect(() => {
        setMounted(true);
        bridge.connect(send);
        orchestrator.connect(send);
        return () => orchestrator.dispose();
    }, [bridge, orchestrator, send]);

    // Auto-discover checkpoints and start journey
    useEffect(() => {
        if (!mounted) return;

        if (config?.autoStart) {
            setTimeout(() => {
                const findAllCheckpoints = (root: Document | ShadowRoot): string[] => {
                    let found: string[] = [];
                    // Find in current root
                    const elements = Array.from(root.querySelectorAll('[data-agent-checkpoint]'));
                    found.push(...elements.map(el => el.getAttribute('id') || ''));

                    // Recursive search into child shadow roots
                    const allEls = root.querySelectorAll('*');
                    allEls.forEach(el => {
                        if (el.shadowRoot) {
                            found.push(...findAllCheckpoints(el.shadowRoot));
                        }
                    });
                    return found;
                };

                const checkpoints = findAllCheckpoints(document);

                if (checkpoints.length > 0) {
                    orchestrator.trigger('journey.start', { checkpoints });
                }
            }, 1000);
        }

        return () => bridge.stopMonitoring();
    }, [config?.autoStart, send, bridge, mounted, orchestrator]);

    // Connect voice events
    useEffect(() => {
        if (!voice || !mounted) return;

        voice.setTranscriptHandler((text, isFinal) => {
            if (isFinal && text.trim().length > 0) {
                send({ type: 'USER_MESSAGE', text });
            }
        });

        voice.setErrorHandler((error) => {
            send({ type: 'VOICE_ERROR', error });
        });
    }, [voice, mounted, send]);

    if (!mounted) {
        return (
            <AgentContext.Provider value={{ state, send, bridge, voice, orchestrator }}>
                {children}
            </AgentContext.Provider>
        );
    }

    return (
        <AgentContext.Provider value={{ state, send, bridge, voice, orchestrator }}>
            {children}
        </AgentContext.Provider>
    );
};

export const useAgent = () => {
    const context = useContext(AgentContext);
    if (!context) {
        if (typeof window === 'undefined') {
            return {
                state: {
                    value: 'idle',
                    context: {},
                    matches: () => false
                },
                send: () => { },
                bridge: {
                    streamNarrative: async () => new ReadableStream()
                }
            } as any;
        }
        throw new Error('useAgent must be used within AgenticProvider');
    }
    return context;
};
