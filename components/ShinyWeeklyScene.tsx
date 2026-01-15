'use client';

import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Check if THREE is available
const isThreeAvailable = typeof THREE !== 'undefined' && typeof THREE.Mesh !== 'undefined';

// Fallback component when Three.js isn't available
function SceneFallback() {
  return (
    <div 
      className="shiny-weekly-scene" 
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        color: 'var(--text-muted)',
        fontSize: 'var(--font-small)'
      }}
    >
      3D Scene loading...
    </div>
  );
}

// Simple plane component without drei
function GroundPlane() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
      <planeGeometry args={[14, 10]} />
      <meshStandardMaterial color="#1b2027" />
    </mesh>
  );
}

// Grid helper without drei
function GridHelper() {
  const gridRef = useRef<THREE.LineSegments>(null);
  
  useEffect(() => {
    if (!gridRef.current) return;
    
    const size = 14;
    const divisions = 14;
    const step = size / divisions;
    const color = 0x2a3040;
    
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    
    for (let i = -size/2; i <= size/2; i += step) {
      vertices.push(-size/2, 0.01, i);
      vertices.push(size/2, 0.01, i);
      vertices.push(i, 0.01, -size/2);
      vertices.push(i, 0.01, size/2);
    }
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    const material = new THREE.LineBasicMaterial({ color });
    const grid = new THREE.LineSegments(geometry, material);
    
    gridRef.current.add(grid);
    
    return () => {
      gridRef.current?.remove(grid);
    };
  }, []);
  
  return <lineSegments ref={gridRef} />;
}

interface WalkingMonProps {
  spriteUrl: string;
  startPosition: [number, number, number];
  speed: number;
  bounds: { x: number; z: number };
}

function WalkingMon({ spriteUrl, startPosition, speed, bounds }: WalkingMonProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  // Load texture with error handling
  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.load(
      spriteUrl,
      (loadedTexture) => {
        loadedTexture.magFilter = THREE.NearestFilter;
        loadedTexture.minFilter = THREE.NearestFilter;
        setTexture(loadedTexture);
      },
      undefined,
      (error) => {
        console.warn(`Failed to load texture: ${spriteUrl}`, error);
      }
    );
  }, [spriteUrl]);
  
  // Random walk direction
  const direction = useRef({
    x: (Math.random() - 0.5) * 2,
    z: (Math.random() - 0.5) * 2,
  });
  
  // Change direction periodically
  const nextDirectionChange = useRef(Math.random() * 3 + 2);
  const timeSinceChange = useRef(0);

  useFrame((_, delta) => {
    if (!meshRef.current) return;

    timeSinceChange.current += delta;
    
    // Change direction randomly
    if (timeSinceChange.current > nextDirectionChange.current) {
      direction.current = {
        x: (Math.random() - 0.5) * 2,
        z: (Math.random() - 0.5) * 2,
      };
      nextDirectionChange.current = Math.random() * 3 + 2;
      timeSinceChange.current = 0;
    }

    // Move the sprite
    meshRef.current.position.x += direction.current.x * speed * delta;
    meshRef.current.position.z += direction.current.z * speed * delta;

    // Bounce off bounds
    if (Math.abs(meshRef.current.position.x) > bounds.x) {
      direction.current.x *= -1;
      meshRef.current.position.x = Math.sign(meshRef.current.position.x) * bounds.x;
    }
    if (Math.abs(meshRef.current.position.z) > bounds.z) {
      direction.current.z *= -1;
      meshRef.current.position.z = Math.sign(meshRef.current.position.z) * bounds.z;
    }

    // Flip sprite based on movement direction
    meshRef.current.scale.x = direction.current.x < 0 ? -1 : 1;
  });

  if (!texture) {
    return null; // Don't render until texture is loaded
  }

  return (
    <mesh ref={meshRef} position={startPosition} rotation={[-Math.PI / 6, 0, 0]}>
      <planeGeometry args={[0.8, 0.8]} />
      <meshBasicMaterial map={texture} transparent alphaTest={0.5} side={THREE.DoubleSide} />
    </mesh>
  );
}

interface ShinyWeeklySceneProps {
  pokemonSprites: string[];
}

export function ShinyWeeklyScene({ pokemonSprites }: ShinyWeeklySceneProps) {
  // Return fallback if THREE isn't available
  if (!isThreeAvailable) {
    return <SceneFallback />;
  }

  const bounds = { x: 6, z: 4 };
  
  // Generate random starting positions for each mon
  const monData = useMemo(() => {
    return pokemonSprites.slice(0, 12).map((sprite, i) => ({
      spriteUrl: sprite,
      startPosition: [
        (Math.random() - 0.5) * bounds.x * 2,
        0.4,
        (Math.random() - 0.5) * bounds.z * 2,
      ] as [number, number, number],
      speed: 0.3 + Math.random() * 0.4,
    }));
  }, [pokemonSprites]);

  return (
    <div className="shiny-weekly-scene">
      <Canvas
        camera={{ position: [0, 8, 10], fov: 45 }}
        style={{ pointerEvents: 'none' }}
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 10, 5]} intensity={0.6} />
        
        {/* Ground plane */}
        <GroundPlane />

        {/* Grid lines on the plane */}
        <GridHelper />

        {/* Walking Pokémon */}
        {monData.map((mon, i) => (
          <WalkingMon
            key={i}
            spriteUrl={mon.spriteUrl}
            startPosition={mon.startPosition}
            speed={mon.speed}
            bounds={bounds}
          />
        ))}
      </Canvas>
    </div>
  );
}
