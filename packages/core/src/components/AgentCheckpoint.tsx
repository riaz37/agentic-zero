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
    // The Provider scans for [data-agent-checkpoint] on mount.
    // No need to verify context here to avoid SSR issues.


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
