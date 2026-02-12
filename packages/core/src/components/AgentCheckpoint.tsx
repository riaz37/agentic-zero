'use client';

import React from 'react';
import { useAgent } from './AgenticProvider';

interface AgentCheckpointProps {
    id: string;
    narrative: string;
    priority?: number;
    children: React.ReactNode;
}

export const AgentCheckpoint: React.FC<AgentCheckpointProps> = ({
    id,
    narrative,
    priority = 100,
    children
}) => {
    // We access the context just to ensure we are inside the provider,
    // but we don't strictly need to read state here for the basic functionality anymore.
    // The Provider scans for [data-agent-checkpoint] on mount.
    useAgent();

    return (
        <div
            id={id}
            data-agent-checkpoint={id}
            data-agent-narrative={narrative}
            data-agent-priority={priority}
            style={{ position: 'relative' }}
        >
            {children}
        </div>
    );
};
