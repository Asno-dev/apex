'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Play, Volume2, VolumeX, RotateCcw, Compass, Wind, Activity, Gauge, ShieldAlert, Eye, Zap, Award, HelpCircle, CheckCircle2, XCircle, Navigation } from 'lucide-react';

interface FlightSimulatorProps {
  onScoreChange?: (score: number) => void;
  onLandingSuccess?: () => void;
}

export default function FlightSimulator({ onScoreChange, onLandingSuccess }: FlightSimulatorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isEngineStarted, setIsEngineStarted] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [throttle, setThrottle] = useState(60);
  const [speed, setSpeed] = useState(220);
  const [altitude, setAltitude] = useState(800);
  const [flightStatus, setFlightStatus] = useState<'flying' | 'landed' | 'crashed'>('flying');

  useEffect(() => {
    if (!containerRef.current) return;
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x05050d);
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 12000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    containerRef.current.appendChild(renderer.domElement);

    const jet = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 10), new THREE.MeshStandardMaterial({ color: 0x334155 }));
    body.rotation.x = Math.PI / 2;
    jet.add(body);
    scene.add(jet);
    camera.position.set(0, 5, -20);
    camera.lookAt(0, 0, 0);

    const animate = () => {
      requestAnimationFrame(animate);
      if (isEngineStarted) {
        jet.position.z += 0.5;
        camera.position.z += 0.5;
      }
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, [isEngineStarted]);

  return (
    <div className="relative w-full h-[500px] bg-zinc-950 rounded-2xl overflow-hidden border border-zinc-800">
      <div ref={containerRef} className="w-full h-full" />
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        <button onClick={() => setIsEngineStarted(!isEngineStarted)} className="bg-indigo-600 px-4 py-2 rounded-lg text-xs font-bold text-white hover:bg-indigo-500 transition-colors">
          {isEngineStarted ? 'Stop Engine' : 'Start Engine'}
        </button>
      </div>
      <div className="absolute bottom-4 left-4 z-10 text-white font-mono text-xs bg-zinc-900/80 p-3 rounded-lg backdrop-blur">
        <p>ALT: {altitude}ft</p>
        <p>SPD: {speed}kts</p>
        <p>STATUS: {flightStatus.toUpperCase()}</p>
      </div>
    </div>
  );
}