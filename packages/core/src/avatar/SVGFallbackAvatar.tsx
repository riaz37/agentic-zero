/**
 * SVGFallbackAvatar — Lightweight 2D avatar for mobile/low-power devices.
 * 
 * Replaces the heavy Three.js WebGL avatar when:
 * - Device has limited GPU (navigator.hardwareConcurrency < 4)
 * - User prefers reduced motion
 * - WebGL context creation fails
 */
import React from 'react';

interface FallbackAvatarProps {
    state: 'idle' | 'thinking' | 'narrating' | 'interrupted' | string;
    size?: number;
}

export const SVGFallbackAvatar: React.FC<FallbackAvatarProps> = ({
    state,
    size = 80
}) => {
    const pulseSpeed = state === 'thinking' ? '0.8s' : state === 'narrating' ? '1.2s' : '3s';
    const glowIntensity = state === 'narrating' ? 15 : state === 'thinking' ? 10 : 5;

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 100 100"
            style={{ filter: `drop-shadow(0 0 ${glowIntensity}px #4ade80)` }}
        >
            <defs>
                <radialGradient id="avatarGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#4ade80" stopOpacity="0.9" />
                    <stop offset="60%" stopColor="#22c55e" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#16a34a" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="avatarCore" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#86efac" />
                    <stop offset="100%" stopColor="#4ade80" />
                </radialGradient>
            </defs>

            {/* Outer glow ring */}
            <circle cx="50" cy="50" r="45" fill="url(#avatarGlow)">
                <animate
                    attributeName="r"
                    values="42;48;42"
                    dur={pulseSpeed}
                    repeatCount="indefinite"
                />
                <animate
                    attributeName="opacity"
                    values="0.6;1;0.6"
                    dur={pulseSpeed}
                    repeatCount="indefinite"
                />
            </circle>

            {/* Core orb */}
            <circle cx="50" cy="50" r="20" fill="url(#avatarCore)" opacity="0.9">
                <animate
                    attributeName="r"
                    values="18;22;18"
                    dur={pulseSpeed}
                    repeatCount="indefinite"
                />
            </circle>

            {/* Inner highlight */}
            <circle cx="45" cy="45" r="8" fill="white" opacity="0.3" />

            {/* Orbit ring (visible during narrating) */}
            {(state === 'narrating' || state === 'thinking') && (
                <circle
                    cx="50" cy="50" r="35"
                    fill="none"
                    stroke="#4ade80"
                    strokeWidth="1.5"
                    strokeDasharray="8 6"
                    opacity="0.5"
                >
                    <animateTransform
                        attributeName="transform"
                        type="rotate"
                        from="0 50 50"
                        to="360 50 50"
                        dur="4s"
                        repeatCount="indefinite"
                    />
                </circle>
            )}
        </svg>
    );
};

/**
 * Detect whether the device should use the fallback avatar.
 */
export function shouldUseFallback(): boolean {
    if (typeof window === 'undefined') return true;

    // Check reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return true;

    // Check hardware concurrency (low-power device)
    if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) return true;

    // Check WebGL support
    try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
        if (!gl) return true;
    } catch {
        return true;
    }

    return false;
}
