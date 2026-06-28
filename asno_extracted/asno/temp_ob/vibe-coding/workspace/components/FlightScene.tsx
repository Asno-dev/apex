"use client";

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, PerspectiveCamera } from '@react-three/drei';
import { useRef } from 'react';
import * as THREE from 'three';

export default function FlightScene() {
  return (
    <div className="h-screen w-full fixed top-0 left-0 z-0">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 5]} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        <mesh>
          <coneGeometry args={[1, 2, 32]} />
          <meshStandardMaterial color="#3b82f6" wireframe />
        </mesh>
        <OrbitControls enableZoom={false} autoRotate />
      </Canvas>
    </div>
  );
}