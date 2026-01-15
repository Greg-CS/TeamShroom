'use client';

import { useEffect, useRef, useState } from 'react';

interface WalkingMon {
  id: number;
  spriteUrl: string;
  x: number;
  y: number;
  speed: number;
  direction: number;
  wobble: boolean;
  wobblePhase: number;
}

interface ShinyWeeklyScene2DProps {
  pokemonSprites: string[];
}

export function ShinyWeeklyScene2D({ pokemonSprites }: ShinyWeeklyScene2DProps) {
  const [mons, setMons] = useState<WalkingMon[]>([]);
  const animationRef = useRef<number>();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize walking Pokémon
    const initialMons: WalkingMon[] = pokemonSprites.slice(0, 12).map((sprite, i) => {
      const x = 15 + Math.random() * 70;
      const y = 25 + Math.random() * 50;
      return {
        id: i,
        spriteUrl: sprite,
        x,
        y,
        speed: 0.0001,
        direction: Math.random() * Math.PI * 2,
        wobble: Math.random() > 0.5,
        wobblePhase: Math.random() * Math.PI * 2,
      };
    });
    setMons(initialMons);

    // Animation loop
    const animate = () => {
      setMons(prevMons => 
        prevMons.map(mon => {
          let newX = mon.x;
          let newY = mon.y;
          let newDirection = mon.direction;
          let newWobblePhase = mon.wobblePhase + 0.05;

          // Random direction change tick
          if (Math.random() < 0.01) { // 1% chance per frame to change direction
            newDirection = Math.random() * Math.PI * 2;
          }

          // Move in current direction with momentum
          const moveX = Math.cos(newDirection) * mon.speed * 100;
          const moveY = Math.sin(newDirection) * mon.speed * 100;
          
          // Move smoothly in current direction
          newX += moveX;
          newY += moveY;

          // Bounce off boundaries and reverse direction
          if (newX <= 10 || newX >= 90) {
            newDirection = Math.PI - newDirection; // Reverse horizontal direction
            newX = Math.max(10, Math.min(90, newX));
          }
          if (newY <= 20 || newY >= 80) {
            newDirection = -newDirection; // Reverse vertical direction
            newY = Math.max(20, Math.min(80, newY));
          }

          // Occasional slight direction adjustments
          if (Math.random() < 0.05) {
            newDirection += (Math.random() - 0.5) * 0.3;
          }

          return {
            ...mon,
            x: newX,
            y: newY,
            direction: newDirection,
            wobblePhase: newWobblePhase,
          };
        })
      );

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [pokemonSprites]);

  return (
    <div className="shiny-weekly-scene">
      <div ref={containerRef} className="scene-2d-container">
        {/* Background image */}
        <div className="scene-background" />
        
        {/* Grid overlay */}
        <div className="scene-grid" />
        
        {/* Walking Pokémon */}
        {mons.map((mon) => (
          <div
            key={mon.id}
            className={`walking-mon-2d ${mon.wobble ? 'wobble' : ''}`}
            style={{
              left: `${mon.x}%`,
              top: `${mon.y}%`,
              transform: `translate(-50%, -50%) scaleX(${mon.direction > Math.PI/2 || mon.direction < -Math.PI/2 ? -1 : 1}) rotate(${mon.wobble ? Math.sin(mon.wobblePhase) * 2 : 0}deg)`,
            }}
          >
            <img
              src={mon.spriteUrl}
              alt="Pokémon"
              className="mon-sprite"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
