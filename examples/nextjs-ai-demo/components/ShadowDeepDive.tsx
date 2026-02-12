'use client';

import React, { useEffect, useRef } from 'react';
import { AgentCheckpoint } from '@agentic-zero/core';

export function ShadowDeepDive() {
    const hostRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!hostRef.current || hostRef.current.shadowRoot) return;

        const shadow = hostRef.current.attachShadow({ mode: 'open' });

        // Create a style block for the shadow DOM
        const style = document.createElement('style');
        style.textContent = `
            .shadow-container {
                padding: 40px;
                background: linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%);
                border: 2px solid #4ade80;
                border-radius: 20px;
                color: #fff;
                font-family: system-ui, sans-serif;
                margin: 40px 0;
                box-shadow: 0 0 30px rgba(74, 222, 128, 0.2);
            }
            .title {
                color: #4ade80;
                font-size: 24px;
                margin-bottom: 16px;
                letter-spacing: 2px;
            }
        `;
        shadow.appendChild(style);

        // Create the content
        const container = document.createElement('div');
        container.className = 'shadow-container';

        // Inside the container, we want a checkpoint.
        // Since React won't render into this Shadow Root easily without a portal,
        // we'll use a plain DOM element with the required data attribute.
        // The Agentic Zero framework is designed to detect these!

        container.innerHTML = `
            <div class="title">SHADOW REALM DETECTED</div>
            <p>I am nested deep inside a Shadow Root. Most agents can't see me, but Agentic Zero uses ShadowPiercer to navigate through these encapsulations.</p>
            <div 
                id="shadow-checkpoint" 
                data-agent-checkpoint="true" 
                data-agent-narrative="Impressive! I've successfully pierced through the Shadow DOM encapsulation. This section is hidden from standard DOM queries, but my ShadowPiercer module allows me to provide a seamless narrative even in complex, encapsulated component architectures."
                style="margin-top: 20px; padding: 10px; border-left: 4px solid #4ade80; font-style: italic; color: #888;"
            >
                [SHADOW_LEVEL_ENCRYPTED]
            </div>
        `;

        shadow.appendChild(container);
    }, []);

    return <div ref={hostRef} />;
}
