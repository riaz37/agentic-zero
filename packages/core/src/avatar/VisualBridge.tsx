import React, { useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { HolographicAvatar } from './HolographicAvatar';
import { useAgent } from '../components/AgenticProvider';

export const VisualBridge: React.FC = () => {
    const { state, bridge } = useAgent();
    // The bridge orchestrator now manages the container ref for GSAP animations
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (containerRef.current) {
            bridge.setAvatarContainer(containerRef.current);
        }
    }, [bridge]);

    // Initial positioning: center screen, bottom
    // The bridge will take over from here
    return (
        <div
            ref={containerRef}
            style={{
                position: 'fixed',
                top: '90%',
                left: '90%',
                width: '150px',
                height: '150px',
                pointerEvents: 'none',
                zIndex: 9999,
                transform: 'translate(-50%, -50%)',
            }}
        >
            <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} />
                <HolographicAvatar state={state.value as string} />
            </Canvas>
        </div>
    );
};
