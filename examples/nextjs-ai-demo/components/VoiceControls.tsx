'use client';

import React, { useEffect, useState } from 'react';
import { useAgent } from '@agentic-zero/core';

export const VoiceControls: React.FC = () => {
    const { state, voice } = useAgent();
    // Use any cast to access methods not on the strict interface
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const webVoice = voice as any;

    const [isListening, setIsListening] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [supported, setSupported] = useState(false);

    useEffect(() => {
        if (webVoice) {
            setSupported(webVoice.ttsSupported || webVoice.sttSupported);
            setIsMuted(webVoice.muted);
        }
    }, [webVoice]);

    // Sync with machine state
    useEffect(() => {
        const machineState = state.context.voiceState;
        if (machineState === 'listening') {
            setIsListening(true);
        } else if (machineState === 'idle' || machineState === 'thinking') {
            setIsListening(false);
        }
    }, [state.context.voiceState]);

    const toggleListening = () => {
        if (!webVoice) return;
        if (isListening) {
            webVoice.stopListening();
            setIsListening(false);
        } else {
            webVoice.startListening();
            setIsListening(true);
        }
    };

    const toggleMute = () => {
        if (!webVoice) return;
        const newMuted = webVoice.toggleMute();
        setIsMuted(newMuted);
    };

    if (!supported || !voice) return null;

    const voiceState = state.context.voiceState;
    const isActive = voiceState === 'listening' || voiceState === 'speaking';

    return (
        <div className="fixed bottom-6 right-6 flex flex-col gap-2 z-50">
            {/* Main Mic Button */}
            <button
                onClick={toggleListening}
                className={`
                    w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all duration-300
                    ${isListening
                        ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                        : 'bg-emerald-500 hover:bg-emerald-600'
                    }
                    ${voiceState === 'speaking' ? 'ring-4 ring-emerald-500/30' : ''}
                `}
                title={isListening ? 'Stop Listening' : 'Start Voice Interaction'}
            >
                <span className="text-2xl">
                    {isListening ? '🛑' : '🎙️'}
                </span>
            </button>

            {/* Mute Toggle (Mini) */}
            <button
                onClick={toggleMute}
                className={`
                    w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all
                    ${isMuted ? 'bg-zinc-700 text-red-400' : 'bg-zinc-800 text-zinc-400 hover:text-white'}
                `}
                title={isMuted ? 'Unmute TTS' : 'Mute TTS'}
            >
                <span className="text-sm">
                    {isMuted ? '🔇' : '🔊'}
                </span>
            </button>

            {/* State Badge */}
            <div className={`
                absolute right-16 top-2 px-3 py-1 rounded-full text-xs font-mono
                bg-zinc-900/90 border border-zinc-700 text-zinc-300 whitespace-nowrap
                transition-opacity duration-300
                ${isActive ? 'opacity-100' : 'opacity-0 hover:opacity-100'}
            `}>
                {voiceState.toUpperCase()}
            </div>
        </div>
    );
};
