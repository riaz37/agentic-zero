'use client';

import React, { createContext, useContext, useEffect, useMemo, useRef } from 'react';
import { useMachine } from '@xstate/react';
import { createAgentMachine } from '../machine/agentMachine';
import { BridgeOrchestrator, BridgeConfig } from '../bridge/BridgeOrchestrator';
import { VisualBridge } from '../avatar/VisualBridge';
import { NarrativeSynthesizer } from './NarrativeSynthesizer';
import { AgenticConsole } from './AgenticConsole';

export interface AgentContextType {
    state: any;
    send: (event: any) => void;
    bridge: BridgeOrchestrator;
}

const AgentContext = createContext<AgentContextType | null>(null);

export interface AgenticProviderConfig {
    persona?: string;
    autoStart?: boolean;
    debug?: boolean;
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

    // Create the machine with the live bridge wired in
    const machine = useMemo(() => createAgentMachine(bridge), [bridge]);
    const [state, send] = useMachine(machine);

    const [mounted, setMounted] = React.useState(false);

    // Connect the bridge to the machine's send function
    useEffect(() => {
        setMounted(true);
        bridge.connect(send);
    }, [bridge, send]);

    // Auto-discover checkpoints and start journey
    useEffect(() => {
        if (!mounted) return;

        if (config?.autoStart) {
            setTimeout(() => {
                const checkpoints = Array.from(
                    document.querySelectorAll('[data-agent-checkpoint]')
                ).map((el) => el.getAttribute('id') || '');

                if (checkpoints.length > 0) {
                    send({ type: 'START_JOURNEY', initialQueue: checkpoints });
                }
            }, 1000);
        }

        return () => bridge.stopMonitoring();
    }, [config?.autoStart, send, bridge, mounted]);

    if (!mounted) {
        return <>{children}</>;
    }

    return (
        <AgentContext.Provider value={{ state, send, bridge }}>
            {children}
            <VisualBridge />
            <NarrativeSynthesizer />
            {config?.debug && <AgenticConsole />}
        </AgentContext.Provider>
    );
};

export const useAgent = () => {
    const context = useContext(AgentContext);
    if (!context) throw new Error('useAgent must be used within AgenticProvider');
    return context;
};
