'use client';

import { useMemo } from 'react';
import { getPokemonGif } from '@/lib/utils';

interface ShinyWeeklyScene2DProps {
  pokemonSprites: string[];
}

export function ShinyWeeklyScene2D({ pokemonSprites }: ShinyWeeklyScene2DProps) {
  const monData = useMemo(() => {
    return pokemonSprites.slice(0, 12).map((sprite, i) => ({
      id: i,
      spriteUrl: sprite,
      startX: Math.random() * 80 + 10, // 10-90%
      startY: Math.random() * 60 + 20, // 20-80%
      duration: 8 + Math.random() * 4, // 8-12s
      delay: Math.random() * 2, // 0-2s delay
    }));
  }, [pokemonSprites]);

  return (
    <div className="shiny-weekly-scene">
      <div className="scene-2d-container">
        {/* Grid background */}
        <div className="scene-grid" />
        
        {/* Walking Pokémon */}
        {monData.map((mon) => (
          <div
            key={mon.id}
            className="walking-mon-2d"
            style={{
              '--start-x': `${mon.startX}%`,
              '--start-y': `${mon.startY}%`,
              '--duration': `${mon.duration}s`,
              '--delay': `${mon.delay}s`,
            } as React.CSSProperties}
          >
            <img
              src={mon.spriteUrl}
              alt="Pokémon"
              className="mon-sprite"
              onError={(e) => {
                // Hide broken images
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
