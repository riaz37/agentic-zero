import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Float } from '@react-three/drei';
import * as THREE from 'three';

interface AvatarProps {
    state: 'idle' | 'thinking' | 'narrating' | 'interrupted' | string;
}

export const HolographicAvatar: React.FC<AvatarProps> = ({ state }) => {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame((clock) => {
        if (!meshRef.current) return;

        // Base rotation
        meshRef.current.rotation.y += 0.01;

        // State-based behavior
        if (state === 'thinking') {
            meshRef.current.scale.setScalar(1 + Math.sin(clock.clock.elapsedTime * 10) * 0.05);
        } else if (state === 'narrating') {
            meshRef.current.scale.setScalar(1 + Math.sin(clock.clock.elapsedTime * 15) * 0.1);
        } else {
            meshRef.current.scale.setScalar(1);
        }
    });

    return (
        <Float speed={2} rotationIntensity={1} floatIntensity={1}>
            <Sphere ref={meshRef} args={[1, 64, 64]}>
                <MeshDistortMaterial
                    color="#4ade80"
                    speed={state === 'thinking' ? 5 : 2}
                    distort={0.4}
                    radius={1}
                    emissive="#22c55e"
                    emissiveIntensity={2}
                    transparent
                    opacity={0.8}
                />
            </Sphere>
        </Float>
    );
};
