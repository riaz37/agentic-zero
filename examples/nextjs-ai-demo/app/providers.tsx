'use client'

import { AgenticProvider } from '@agentic-zero/core'
import { ReactNode, createContext, useContext, useState, useCallback } from 'react'

// ── Shared event feed for the demo ──
export interface DemoEvent {
    id: number;
    type: string;
    detail: string;
    timestamp: number;
}

interface DemoContextType {
    events: DemoEvent[];
    pushEvent: (type: string, detail: string) => void;
    clearEvents: () => void;
}

const DemoContext = createContext<DemoContextType>({
    events: [],
    pushEvent: () => { },
    clearEvents: () => { },
});

export const useDemoEvents = () => useContext(DemoContext);

let eventIdCounter = 0;

import { VisualBridge } from '../components/avatar/VisualBridge';
import { AgenticConsole } from '../components/agentic/AgenticConsole';

// ... existing code ...

export function Providers({ children }: { children: ReactNode }) {
    const [events, setEvents] = useState<DemoEvent[]>([]);

    const pushEvent = useCallback((type: string, detail: string) => {
        setEvents(prev => [
            { id: ++eventIdCounter, type, detail, timestamp: Date.now() },
            ...prev.slice(0, 49), // Keep last 50 events
        ]);
    }, []);

    const clearEvents = useCallback(() => setEvents([]), []);

    const config = {
        autoStart: false,
        debug: true, // Enable debug console for demo
        enableVoice: true,
        apiEndpoint: '/api/chat'
    };

    return (
        <DemoContext.Provider value={{ events, pushEvent, clearEvents }}>
            <AgenticProvider config={config}>
                {children}
                <VisualBridge />
                {config.debug && <AgenticConsole />}
            </AgenticProvider>
        </DemoContext.Provider>
    );
}
