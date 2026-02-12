'use client'

import { AgenticProvider } from '@agentic-zero/core'
import { ReactNode } from 'react'

export function Providers({ children }: { children: ReactNode }) {
    return (
        <AgenticProvider config={{ autoStart: true, debug: true, apiEndpoint: '/api/chat' }}>
            {children}
        </AgenticProvider>
    )
}
