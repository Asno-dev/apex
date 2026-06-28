'use client';

import React, { useRef, useState, useEffect } from 'react';
import { RotateCw, Move, Check } from 'lucide-react';

const loadScript = (id: string, url: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      resolve();
      return;
    }
    const existing = document.getElementById(id);
    if (existing) {
      // Check if already fully loaded
      if ((window as any).THREE && (id === 'three-js-cdn' || (window as any).THREE.OrbitControls)) {
        resolve();
      } else {
        // Wait for it
        const interval = setInterval(() => {
          if ((window as any).THREE && (id === 'three-js-cdn' || (window as any).THREE.OrbitControls)) {
            clearInterval(interval);
            resolve();
          }
        }, 100);
        setTimeout(() => {
          clearInterval(interval);
          resolve();
        }, 5000);
      }
      return;
    }
    const script = document.createElement('script');
    script.id = id;
    script.src = url;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script ${url}`));
    document.head.appendChild(script);
  });
};

export default function Dynamic3DScene({ presetType = 'cube', accentColor = '#4f46e5' }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [threeLoaded, setThreeLoaded] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [scale, setScale] = useState(1.0);
  const groupRef = useRef<any>(null);

  // Load Three.js & its OrbitControls from CDN dynamically to keep workspace lightweight and robust
  useEffect(() => {
    let active = true;
    const initThree = async () => {
      try {
        await loadScript('three-js-cdn', 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js');
        if (!active) return;
        await loadScript('three-orbit-controls', 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js');
        if (!active) return;
        
        if ((window as any).THREE) {
          setThreeLoaded(true);
        }
      } catch (err) {
        console.error('Three.js load error:', err);
      }
    };
    initThree();
    return () => {
      active = false;
    };
  }, []);

  // Sync zoom/scale state to the 3D scene group
  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.scale.set(scale, scale, scale);
    }
  }, [scale]);

  // Set up the scene elements
  useEffect(() => {
    if (!threeLoaded || !containerRef.current || !canvasRef.current) return;

    const THREE = (window as any).THREE;
    if (!THREE) return;

    const width = containerRef.current.clientWidth || 300;
    const height = containerRef.current.clientHeight || 200;

    // 1. Scene setup
    const scene = new THREE.Scene();
    scene.background = null; // Transparent background to blend nicely with PRESENT OS slide styles

    // 2. Camera setup (high focal distance for isometric projection effect)
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(5.5, 4.5, 6.5);

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // 4. OrbitControls initialization
    let controls: any = null;
    if (THREE.OrbitControls) {
      controls = new THREE.OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.maxPolarAngle = Math.PI / 2 - 0.05; // Lock camera from pivoting under the ground plane
      controls.minDistance = 3.5;
      controls.maxDistance = 15;
    }

    // 5. Lighting orchestration
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.35);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(accentColor || '#4f46e5', 1.0);
    dirLight1.position.set(6, 12, 4);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x06b6d4, 0.6); // Cool turquoise accents
    dirLight2.position.set(-6, 3, -4);
    scene.add(dirLight2);

    const pointLight = new THREE.PointLight(0xd946ef, 1.2, 10); // Warm neon violet flash
    pointLight.position.set(0, 1.5, 0);
    scene.add(pointLight);

    // 6. Anchor group containing meshes
    const group = new THREE.Group();
    group.scale.set(scale, scale, scale);
    groupRef.current = group;
    scene.add(group);

    // Store animated references
    const blinkingLayers: Array<{ mesh: any; blinkSpeed: number; originalColor: number; phase: number }> = [];
    let centralCore: any = null;
    let centralCoreOutline: any = null;
    const nodePoints: any[] = [];

    // 7. BUILD PROCEDURAL VISUALS BASED ON SLIDE CONTEXT (Datacenter / Solution vs Network/Hero)
    const isDatacenter = presetType === 'cube' || presetType === 'datacenter';
    const isNeural = presetType === 'neural' || presetType === 'network';

    if (isDatacenter) {
      // Create detailed 3D isometric server matrix
      // A: Ground spatial grid base
      const gridHelper = new THREE.GridHelper(7, 14, 0x4f46e5, 0x1f1f2e);
      gridHelper.position.y = -0.55;
      group.add(gridHelper);

      // B: Create server racks
      const rowGap = 1.3;
      const colGap = 0.95;
      const rackWidth = 0.52;
      const rackDepth = 0.52;
      const rackHeight = 1.6;

      for (let r = -1; r <= 1; r++) {
        for (let c = -1; c <= 1; c++) {
          // Skip center space to place a gorgeous central database processor hub
          if (r === 0 && c === 0) continue;

          const cabinetGroup = new THREE.Group();
          cabinetGroup.position.set(r * rowGap, -0.55, c * colGap);

          // Rack chassis mesh
          const cabinetGeo = new THREE.BoxGeometry(rackWidth, rackHeight, rackDepth);
          const cabinetMat = new THREE.MeshStandardMaterial({
            color: 0x09090c,
            roughness: 0.15,
            metalness: 0.85,
            transparent: true,
            opacity: 0.93,
          });
          const cabinetMesh = new THREE.Mesh(cabinetGeo, cabinetMat);
          cabinetMesh.position.y = rackHeight / 2;
          cabinetGroup.add(cabinetMesh);

          // Neon glowing server structure boundaries
          const edgesGeo = new THREE.EdgesGeometry(cabinetGeo);
          const lineSegments = new THREE.LineSegments(
            edgesGeo,
            new THREE.LineBasicMaterial({ color: 0x4f46e5, linewidth: 1.5 })
          );
          lineSegments.position.copy(cabinetMesh.position);
          cabinetGroup.add(lineSegments);

          // Stacked Server Blades
          const bladeCount = 7;
          const bladeHeight = (rackHeight - 0.15) / bladeCount;
          for (let b = 0; b < bladeCount; b++) {
            const bladeY = 0.08 + b * bladeHeight + bladeHeight / 2;

            // Blade enclosure
            const bladeGeo = new THREE.BoxGeometry(rackWidth - 0.04, bladeHeight - 0.03, rackDepth - 0.04);
            const bladeMat = new THREE.MeshStandardMaterial({
              color: 0x14141d,
              roughness: 0.4,
              metalness: 0.6,
            });
            const bladeMesh = new THREE.Mesh(bladeGeo, bladeMat);
            bladeMesh.position.set(0, bladeY, 0);
            cabinetGroup.add(bladeMesh);

            // Multicolored server LEDs
            const spacing = 0.11;
            const ledCount = 3;
            for (let l = 0; l < ledCount; l++) {
              const ledGeo = new THREE.SphereGeometry(0.015, 6, 6);
              // Random high-velocity cyber indicators: Green, Amber, Blue
              const colorsList = [0x00ff66, 0x00d2ff, 0xffbb00];
              const ledColor = colorsList[Math.floor(Math.random() * colorsList.length)];

              const ledMat = new THREE.MeshBasicMaterial({ color: ledColor });
              const ledMesh = new THREE.Mesh(ledGeo, ledMat);

              // Render LEDs on front-facing side (+Z panel)
              ledMesh.position.set(-0.16 + l * spacing, bladeY, rackDepth / 2 + 0.004);
              cabinetGroup.add(ledMesh);

              blinkingLayers.push({
                mesh: ledMesh,
                originalColor: ledColor,
                blinkSpeed: 1.5 + Math.random() * 3.5,
                phase: Math.random() * Math.PI * 2,
              });

              // Rear panel indicator mirroring
              const rearLed = ledMesh.clone();
              rearLed.position.z = -rackDepth / 2 - 0.004;
              cabinetGroup.add(rearLed);
              blinkingLayers.push({
                mesh: rearLed,
                originalColor: ledColor,
                blinkSpeed: 1.2 + Math.random() * 3.0,
                phase: Math.random() * Math.PI,
              });
            }
          }

          group.add(cabinetGroup);
        }
      }

      // C: Immersive central cyber database core console
      const hubGroup = new THREE.Group();
      hubGroup.position.set(0, -0.55, 0);

      const coreGeo = new THREE.IcosahedronGeometry(0.28, 1);
      const coreMat = new THREE.MeshBasicMaterial({
        color: 0x00ffff,
        wireframe: true,
        transparent: true,
        opacity: 0.85,
      });
      centralCore = new THREE.Mesh(coreGeo, coreMat);
      centralCore.position.y = 0.7;
      hubGroup.add(centralCore);

      const coreOutlineGeo = new THREE.SphereGeometry(0.38, 8, 8);
      const coreOutlineGeoEdges = new THREE.EdgesGeometry(coreOutlineGeo);
      centralCoreOutline = new THREE.LineSegments(
        coreOutlineGeoEdges,
        new THREE.LineBasicMaterial({ color: 0xd946ef, transparent: true, opacity: 0.5 })
      );
      centralCoreOutline.position.copy(centralCore.position);
      hubGroup.add(centralCoreOutline);

      // Connecting futuristic server cable nodes
      const linesMat = new THREE.LineBasicMaterial({
        color: 0x00ffff,
        transparent: true,
        opacity: 0.45,
      });

      const spokes = 8;
      for (let s = 0; s < spokes; s++) {
        const theta = (s * Math.PI * 2) / spokes;
        const radius = 1.3;
        const routePoints = [
          new THREE.Vector3(0, 0.02, 0),
          new THREE.Vector3(Math.cos(theta) * radius * 0.4, 0.02, Math.sin(theta) * radius * 0.4),
          new THREE.Vector3(Math.cos(theta) * radius, 0.02, Math.sin(theta) * radius),
        ];
        const splinePath = new THREE.CatmullRomCurve3(routePoints);
        const splinePoints = splinePath.getPoints(12);
        const splineGeo = new THREE.BufferGeometry().setFromPoints(splinePoints);
        const routeLine = new THREE.Line(splineGeo, linesMat);
        hubGroup.add(routeLine);
      }

      group.add(hubGroup);

    } else if (isNeural) {
      // Render floating high-fidelity neural networks sphere
      const nodesCount = 35;
      const sphereMat = new THREE.MeshStandardMaterial({
        color: accentColor,
        emissive: accentColor,
        emissiveIntensity: 0.7,
        roughness: 0.1,
        metalness: 0.9,
      });
      const nodeGeo = new THREE.SphereGeometry(0.065, 8, 8);

      for (let i = 0; i < nodesCount; i++) {
        const nodeMesh = new THREE.Mesh(nodeGeo, sphereMat);
        const radius = 1.6;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos((Math.random() * 2) - 1);

        nodeMesh.position.set(
          radius * Math.sin(phi) * Math.cos(theta),
          radius * Math.sin(phi) * Math.sin(theta),
          radius * Math.cos(phi)
        );

        group.add(nodeMesh);
        nodePoints.push(nodeMesh);
      }

      // Draw shiny network fibers
      const fiberMat = new THREE.LineBasicMaterial({
        color: accentColor || '#4f46e5',
        transparent: true,
        opacity: 0.38,
      });

      for (let i = 0; i < nodesCount; i++) {
        const posA = nodePoints[i].position;
        // Connect nodes to neighboring ones
        const distances = nodePoints.map((item, idx) => ({
          idx,
          d: posA.distanceTo(item.position),
        })).filter(o => o.idx !== i);

        distances.sort((a, b) => a.d - b.d);

        for (let j = 0; j < 3; j++) {
          const posB = nodePoints[distances[j].idx].position;
          const lineGeo = new THREE.BufferGeometry().setFromPoints([posA, posB]);
          const line = new THREE.Line(lineGeo, fiberMat);
          group.add(line);
        }
      }

    } else {
      // Dynamic glowing neon Torus presetting
      const torusGeo = new THREE.TorusKnotGeometry(0.85, 0.28, 120, 16);
      const torusMat = new THREE.MeshStandardMaterial({
        color: accentColor || '#4f46e5',
        roughness: 0.12,
        metalness: 0.9,
        emissive: accentColor,
        emissiveIntensity: 0.18,
      });
      const torusMesh = new THREE.Mesh(torusGeo, torusMat);
      centralCore = torusMesh;
      group.add(torusMesh);

      // Orbital Rings
      const ringGeo = new THREE.RingGeometry(1.55, 1.58, 64);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x00ffff,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.7,
      });
      const ring1 = new THREE.Mesh(ringGeo, ringMat);
      ring1.rotation.x = Math.PI / 2;
      group.add(ring1);
      centralCoreOutline = ring1;

      const ring2 = ring1.clone();
      ring2.rotation.y = Math.PI / 4;
      group.add(ring2);
    }

    // 8. ANIMATION LOOP FUNCTION
    let animationId: number;
    let lastTime = 0;

    const animate = (time: number) => {
      animationId = requestAnimationFrame(animate);

      const delta = (time - lastTime) / 1000;
      lastTime = time;

      // Handle continuous rotation
      if (autoRotate) {
        group.rotation.y += 0.15 * delta;
        group.rotation.x = Math.sin(time * 0.00035) * 0.06 + 0.08;
      }

      // Pulsing elements
      if (centralCore) {
        centralCore.rotation.x += 0.25 * delta;
        centralCore.rotation.y += 0.18 * delta;
      }
      if (centralCoreOutline) {
        centralCoreOutline.rotation.z -= 0.1 * delta;
      }

      // blinking LEDs
      blinkingLayers.forEach((item) => {
        const wave = Math.sin(time * item.blinkSpeed * 0.0012 + item.phase);
        // Switch between original emissive color and complete dark cabinet color
        if (wave > 0.1) {
          item.mesh.material.color.setHex(item.originalColor);
        } else {
          item.mesh.material.color.setHex(0x101018);
        }
      });

      // Flapping neural floating effect
      if (isNeural) {
        nodePoints.forEach((node, i) => {
          node.position.y += Math.sin(time * 0.001 + i) * 0.0006;
          node.position.x += Math.cos(time * 0.0008 + i * 2) * 0.0004;
        });
      }

      if (controls) {
        controls.update();
      }

      renderer.render(scene, camera);
    };

    animationId = requestAnimationFrame(animate);

    // 9. RESIZING RESPONSIVENESS
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(containerRef.current);

    return () => {
      cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
      if (controls) controls.dispose();
      renderer.dispose();
    };
  }, [threeLoaded, presetType, accentColor, autoRotate]);

  // Loading skeleton placeholder to preserve elegant negative space
  if (!threeLoaded) {
    return (
      <div className="relative w-full h-full flex flex-col items-center justify-center bg-black/30 border border-white/5 rounded-2xl overflow-hidden min-h-[176px]">
        <RotateCw className="h-5 w-5 text-indigo-400 animate-spin" />
        <span className="text-[10px] font-mono text-zinc-500 mt-2.5 uppercase tracking-wider">Mounting 3D WebGL Scene...</span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex flex-col bg-gradient-to-tr from-[#080812] via-[#0e0a1f] to-[#050508] border border-white/5 rounded-2.5xl overflow-hidden group min-h-[176px]">
      
      {/* HUD Info Controls Display Overlay */}
      <div className="absolute top-2.5 left-3 right-3 flex items-center justify-between z-10 select-none pointer-events-none">
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
          <span className="text-[10px] font-bold text-gray-200 capitalize font-mono tracking-tight">
            {presetType === 'cube' ? 'isometric server matrix' : `${presetType} interactive mesh`}
          </span>
        </div>
        
        <div className="flex items-center gap-1.5 pointer-events-auto">
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            title="Toggle Continuous Rotation"
            className={`p-1.5 rounded-lg border text-[10px] font-mono transition-all cursor-pointer ${
              autoRotate
                ? 'bg-indigo-600/20 text-indigo-400 border-indigo-500/20 hover:bg-indigo-600/30'
                : 'bg-white/5 text-gray-400 border-white/5 hover:bg-white/10 hover:text-white'
            }`}
          >
            <RotateCw size={11} className={autoRotate ? 'animate-spin-[14s]' : ''} />
          </button>
          <div className="bg-black/75 px-1.5 py-0.5 rounded text-[8px] font-mono text-gray-500 border border-white/5 uppercase font-medium">
            WebGL THREE.JS
          </div>
        </div>
      </div>

      {/* Orbit Interaction stage canvas container */}
      <div
        ref={containerRef}
        className="flex-1 cursor-grab active:cursor-grabbing w-full h-full min-h-[140px]"
      >
        <canvas ref={canvasRef} className="block w-full h-full" />
      </div>

      {/* Interactive Helper Hint footer */}
      <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none select-none z-10">
        <div className="flex items-center gap-1 text-[10px] text-gray-400 font-mono">
          <Move size={11} className="text-indigo-400" />
          <span>Click / Drag to Orbit Datacenter</span>
        </div>
        <div className="flex items-center gap-2 pointer-events-auto">
          <span className="text-[9px] text-zinc-500 font-mono">Zoom</span>
          <input
            type="range"
            min="0.6"
            max="1.5"
            step="0.05"
            value={scale}
            onChange={(e) => setScale(parseFloat(e.target.value))}
            className="w-14 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            title="Interactive Scale Matrix"
          />
        </div>
      </div>
    </div>
  );
}
