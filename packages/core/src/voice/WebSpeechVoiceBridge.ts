/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Web Speech API types — not included in default TypeScript lib.
 * We declare minimal shapes here for type-safety without requiring
 * additional @types packages.
 */
declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}

import { VoiceBridge } from '../types/bridge';

export interface WebSpeechConfig {
    /** Language for speech recognition (default: 'en-US') */
    lang?: string;
    /** Speech rate for TTS (0.1–10, default: 1) */
    rate?: number;
    /** Speech pitch for TTS (0–2, default: 1) */
    pitch?: number;
    /** Preferred voice name (partial match) */
    voiceName?: string;
    /** Called when a transcript is received from STT */
    onTranscript?: (text: string, isFinal: boolean) => void;
    /** Called when TTS starts */
    onSpeakStart?: () => void;
    /** Called when TTS finishes */
    onSpeakEnd?: () => void;
    /** Called when listening state changes */
    onListeningChange?: (isListening: boolean) => void;
    /** Called when a voice-related error occurs */
    onVoiceError?: (error: string) => void;
}

/**
 * VoiceBridge implementation using the browser's native Web Speech API.
 *
 * - SpeechSynthesis for TTS (text-to-speech)
 * - SpeechRecognition for STT (speech-to-text)
 *
 * Gracefully degrades to no-op when APIs are unavailable.
 */
export class WebSpeechVoiceBridge implements VoiceBridge {
    private config: WebSpeechConfig;
    private recognition: any | null = null;
    private synth: SpeechSynthesis | null = null;
    private currentUtterance: SpeechSynthesisUtterance | null = null;
    private _isSpeaking = false;
    private _isListening = false;
    private _muted = false;
    private _lastNetworkErrorTime = 0;
    private _networkErrorCount = 0;
    private _networkErrorBackoff = 5000; // 5 seconds
    private _maxNetworkErrors = 3;
    private _isPausedForSpeech = false;

    get isSpeaking(): boolean {
        return this._isSpeaking;
    }

    get isListening(): boolean {
        return this._isListening;
    }

    get muted(): boolean {
        return this._muted;
    }

    constructor(config: WebSpeechConfig = {}) {
        this.config = config;

        // --- TTS Setup ---
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            this.synth = window.speechSynthesis;
            // Warm up voices
            this.synth.getVoices();
            if (this.synth.onvoiceschanged !== undefined) {
                this.synth.onvoiceschanged = () => this.synth?.getVoices();
            }
        }

        // --- STT Setup ---
        if (typeof window !== 'undefined') {
            const SpeechRecognitionAPI =
                (window as any).SpeechRecognition ||
                (window as any).webkitSpeechRecognition;

            if (SpeechRecognitionAPI) {
                this.recognition = new SpeechRecognitionAPI();
                this.recognition!.continuous = true;
                this.recognition!.interimResults = true;
                this.recognition!.lang = config.lang || 'en-US';

                this.recognition!.onresult = (event: any) => {
                    const last = event.results[event.results.length - 1];
                    const transcript = last[0].transcript.trim();
                    const isFinal = last.isFinal;
                    this.config.onTranscript?.(transcript, isFinal);
                };

                this.recognition!.onend = () => {
                    // Auto-restart if still listening (browser stops after silence)
                    if (this._isListening && !this._isPausedForSpeech) {
                        const now = Date.now();
                        const timeSinceNetworkError = now - this._lastNetworkErrorTime;

                        // Circuit Breaker: Stop trying after N failures
                        if (this._networkErrorCount >= this._maxNetworkErrors) {
                            console.warn('AgenticZero [Voice]: STT disabled after repeated network errors.');
                            this._isListening = false;
                            this.config.onListeningChange?.(false);
                            return;
                        }

                        // Prevent instant restart if we just had a network error
                        if (timeSinceNetworkError < this._networkErrorBackoff) {
                            console.log('AgenticZero [Voice]: STT backoff active...');
                            setTimeout(() => {
                                if (this._isListening && !this._isPausedForSpeech) this.startListening();
                            }, this._networkErrorBackoff - timeSinceNetworkError);
                            return;
                        }

                        try {
                            this.recognition!.start();
                        } catch {
                            // Already started, ignore
                        }
                    }
                };

                this.recognition!.onerror = (event: any) => {
                    const error = event.error;
                    if (error !== 'no-speech' && error !== 'aborted') {
                        console.warn('AgenticZero [Voice]: Recognition error:', error);

                        if (error === 'network') {
                            this._lastNetworkErrorTime = Date.now();
                            this._networkErrorCount++;
                            // If we hit the limit, don't even tell the machine to stop yet, 
                            // as the machine might transition and cause layout shifts.
                            // Just quiet the system down.
                        }

                        // Avoid spamming the machine if we are already in failure mode
                        if (this._networkErrorCount <= this._maxNetworkErrors) {
                            this.config.onVoiceError?.(error);
                        }
                    }
                };
            }
        }
    }

    /** Check if TTS is supported */
    get ttsSupported(): boolean {
        return this.synth !== null;
    }

    /** Check if STT is supported */
    get sttSupported(): boolean {
        return this.recognition !== null;
    }

    // ─── VoiceBridge Interface ────────────────────────────────────

    setErrorHandler(handler: (error: string) => void) {
        this.config.onVoiceError = handler;
    }

    startListening(): void {
        if (!this.recognition || this._isListening) return;

        try {
            // Ensure any previous session is dead
            this.recognition.abort();
            this.recognition.start();
            this._isListening = true;
            this.config.onListeningChange?.(true);
        } catch {
            // Already started or busy
        }
    }

    stopListening(): void {
        if (!this.recognition || !this._isListening) return;

        this._isListening = false;
        this.recognition.stop();
        this.config.onListeningChange?.(false);
    }

    setTranscriptHandler(handler: (text: string, isFinal: boolean) => void) {
        this.config.onTranscript = handler;
    }

    setListeningChangeHandler(handler: (isListening: boolean) => void) {
        this.config.onListeningChange = handler;
    }

    async speak(text: string): Promise<void> {
        if (!this.synth || this._muted || !text) return;

        // Cancel any in-progress speech
        this.synth.cancel();

        return new Promise<void>((resolve) => {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = this.config.rate ?? 1;
            utterance.pitch = this.config.pitch ?? 1;
            utterance.lang = this.config.lang || 'en-US';

            // Try to find preferred voice
            const voices = this.synth!.getVoices();
            if (this.config.voiceName) {
                const preferred = voices.find((v) =>
                    v.name.toLowerCase().includes(this.config.voiceName!.toLowerCase())
                );
                if (preferred) utterance.voice = preferred;
            } else {
                // Default to a natural English voice if available
                const natural = voices.find(
                    (v) => v.lang.startsWith('en') && v.name.includes('Google')
                ) || voices.find((v) => v.lang.startsWith('en'));
                if (natural) utterance.voice = natural;
            }

            utterance.onstart = () => {
                this._isSpeaking = true;
                this.config.onSpeakStart?.();
            };

            utterance.onend = () => {
                this._isSpeaking = false;
                this.currentUtterance = null;
                this.config.onSpeakEnd?.();

                // Resume listening if we paused for speech
                if (this._isPausedForSpeech) {
                    this._isPausedForSpeech = false;
                    this.startListening();
                }
                resolve();
            };

            utterance.onerror = (event) => {
                if (event.error !== 'interrupted' && event.error !== 'canceled') {
                    console.warn('AgenticZero [Voice]: Speech error:', event.error);
                }
                this._isSpeaking = false;
                this.currentUtterance = null;
                this._isPausedForSpeech = false;
                this.config.onSpeakEnd?.();
                resolve();
            };

            this.currentUtterance = utterance;

            // Pause recognition while speaking to avoid feedback and hardware contention
            if (this._isListening) {
                this._isPausedForSpeech = true;
                this.recognition?.stop();
            }

            // Chrome Hack: sometimes synthesis hangs until resume is called
            if (this.synth?.paused) {
                this.synth.resume();
            }
            this.synth!.speak(utterance);
        });
    }

    interrupt(): void {
        if (this.synth) {
            this.synth.cancel();
        }
        this._isSpeaking = false;
        this.currentUtterance = null;
    }

    // ─── Extended Controls ────────────────────────────────────────

    /** Toggle mute on/off for TTS */
    toggleMute(): boolean {
        this._muted = !this._muted;
        if (this._muted) {
            this.interrupt();
        }
        return this._muted;
    }

    /** Set mute state explicitly */
    setMuted(muted: boolean): void {
        this._muted = muted;
        if (muted) {
            this.interrupt();
        }
    }

    /** Dispose all resources */
    dispose(): void {
        this.stopListening();
        this.interrupt();
    }
}
