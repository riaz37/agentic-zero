'use client';

import React from 'react';

/**
 * NarrativeSynthesizer is now deprecated in favor of 
 * the SpeechBubble integrated within VisualBridge.
 * 
 * We keep this as a no-op to avoid breaking apps that 
 * still import it, but it renders nothing.
 */
export const NarrativeSynthesizer: React.FC = () => {
    return null;
};
