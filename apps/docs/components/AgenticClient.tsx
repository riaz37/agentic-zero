'use client';

import dynamic from 'next/dynamic';
import React from 'react';

// Use dynamic import with ssr: false to completely bypass 
// server-side execution for the agentic layer.
const AgenticProvider = dynamic(
    () => import('@agentic-zero/core').then((mod) => mod.AgenticProvider),
    { ssr: false }
);

export function AgenticClient({ children }: { children: React.ReactNode }) {
    return (
        <AgenticProvider config={{
            autoStart: true,
            debug: true,
            apiEndpoint: '/api/narrate'
        }}>
            {children}
        </AgenticProvider>
    );
}
