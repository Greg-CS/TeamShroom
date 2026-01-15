'use client';

import { useEffect, useRef, useState } from 'react';

interface WalkingMon {
  id: number;
  spriteUrl: string;
  memberName: string;
  x: number;
  y: number;
  speed: number;
  direction: number;
  wobble: boolean;
  wobblePhase: number;
  isDragging: boolean;
  zIndex: number;
}

interface ShinyWeeklyScene2DProps {
  pokemonSprites: string[];
  shinyData?: { name: string; member: string }[];
}

export function ShinyWeeklyScene2D({ pokemonSprites, shinyData }: ShinyWeeklyScene2DProps) {
  const [mons, setMons] = useState<WalkingMon[]>([]);
  const [nextZIndex, setNextZIndex] = useState(100);
  const animationRef = useRef<number>();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize walking Pokémon
    const initialMons: WalkingMon[] = pokemonSprites.slice(0, 12).map((sprite, i) => {
      const x = 15 + Math.random() * 70;
      const y = 25 + Math.random() * 50;
      const shinyEntry = shinyData?.[i];
      return {
        id: i,
        spriteUrl: sprite,
        memberName: shinyEntry?.member || `Trainer ${i + 1}`,
        x,
        y,
        speed: 0.0001,
        direction: Math.random() * Math.PI * 2,
        wobble: Math.random() > 0.5,
        wobblePhase: Math.random() * Math.PI * 2,
        isDragging: false,
        zIndex: i,
      };
    });
    setMons(initialMons);

    // Animation loop
    const animate = () => {
      setMons(prevMons => 
        prevMons.map(mon => {
          // Skip animation if being dragged
          if (mon.isDragging) {
            return {
              ...mon,
              wobblePhase: mon.wobblePhase + 0.05,
            };
          }

          let newX = mon.x;
          let newY = mon.y;
          let newDirection = mon.direction;
          let newWobblePhase = mon.wobblePhase + 0.05;

          // Random direction change tick
          if (Math.random() < 0.003) { // 0.3% chance per frame to change direction (less frequent)
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

  // Drag handlers
  const handleMouseDown = (monId: number) => (e: React.MouseEvent) => {
    e.preventDefault();
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const startX = e.clientX - rect.left;
    const startY = e.clientY - rect.top;

    setMons(prevMons => 
      prevMons.map(mon => 
        mon.id === monId 
          ? { ...mon, isDragging: true, zIndex: nextZIndex }
          : mon
      )
    );
    setNextZIndex(prev => prev + 1);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const currentX = moveEvent.clientX - rect.left;
      const currentY = moveEvent.clientY - rect.top;
      
      const xPercent = (currentX / rect.width) * 100;
      const yPercent = (currentY / rect.height) * 100;

      setMons(prevMons => 
        prevMons.map(mon => 
          mon.id === monId 
            ? { 
                ...mon, 
                x: Math.max(5, Math.min(95, xPercent)),
                y: Math.max(10, Math.min(90, yPercent)),
                direction: Math.atan2(
                  currentY - startY,
                  currentX - startX
                )
              }
            : mon
        )
      );
    };

    const handleMouseUp = () => {
      setMons(prevMons => 
        prevMons.map(mon => 
          mon.id === monId 
            ? { ...mon, isDragging: false }
            : mon
        )
      );
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div className="shiny-weekly-scene">
      <div ref={containerRef} className="scene-2d-container">
        {/* Background image with 3D depth layers */}
        <div className="scene-background" />
        <div className="scene-background-layer-2" />
        <div className="scene-background-layer-3" />
        
        {/* Grid overlay */}
        <div className="scene-grid" />
        
        {/* Walking Pokémon */}
        {mons.map((mon) => (
          <div
            key={mon.id}
            className={`walking-mon-2d ${mon.wobble ? 'wobble' : ''} ${mon.isDragging ? 'dragging' : ''}`}
            style={{
              left: `${mon.x}%`,
              top: `${mon.y}%`,
              transform: `translate(-50%, -50%) scaleX(${mon.direction > Math.PI/2 || mon.direction < -Math.PI/2 ? -1 : 1}) rotate(${mon.wobble ? Math.sin(mon.wobblePhase) * 2 : 0}deg) scale(${mon.isDragging ? 1.2 : 1})`,
              zIndex: mon.zIndex,
              cursor: mon.isDragging ? 'grabbing' : 'grab',
            }}
            onMouseDown={handleMouseDown(mon.id)}
          >
            <img
              src={mon.spriteUrl}
              alt="Pokémon"
              className="mon-sprite"
              draggable={false}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            {/* Member name label */}
            <div className="mon-label" style={{
              transform: `translateX(-50%) scaleX(${mon.direction > Math.PI/2 || mon.direction < -Math.PI/2 ? -1 : 1})`
            }}>
              {mon.memberName}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
