'use client';

import { useState, useMemo } from 'react';
import { UnifiedCard } from './UnifiedCard';
import {
  normalizePokemonName,
  prettifyPokemonName,
  getPokemonGif,
  type MemberShowcase,
  type PokemonData
} from '@/lib/utils';

interface HitlistPageProps {
  showcase: MemberShowcase[];
  pokemonData: PokemonData;
}

type Mode = 'hitlist' | 'living';

interface DexEntry {
  name: string;
  region: string;
  claimed: boolean;
  show: boolean;
}

function buildShinyDex(pokemonData: PokemonData, showcase: MemberShowcase[]): Record<string, DexEntry[]> {
  const claimedSet = new Set<string>();
  
  showcase.forEach(member => {
    member.shinies?.forEach(mon => {
      if (!mon.lost && !mon.sold) {
        claimedSet.add(normalizePokemonName(mon.name));
      }
    });
  });

  const regionMap: Record<string, DexEntry[]> = {};
  
  Object.entries(pokemonData.points).forEach(([name, points]) => {
    if (!points || !pokemonData.show[name]) return;
    
    const region = pokemonData.region[name] || 'Unknown';
    if (!regionMap[region]) {
      regionMap[region] = [];
    }
    
    regionMap[region].push({
      name,
      region,
      claimed: claimedSet.has(name),
      show: pokemonData.show[name]
    });
  });

  return regionMap;
}

function buildLivingCounts(showcase: MemberShowcase[], pokemonData: PokemonData): Record<string, number> {
  const counts: Record<string, number> = {};
  
  showcase.forEach(member => {
    member.shinies?.forEach(mon => {
      if (mon.lost || mon.sold) return;
      const pts = pokemonData.points[normalizePokemonName(mon.name)];
      if (!pts) return;
      const key = normalizePokemonName(mon.name);
      counts[key] = (counts[key] || 0) + 1;
    });
  });
  
  return counts;
}

export function HitlistPage({ showcase, pokemonData }: HitlistPageProps) {
  const [mode, setMode] = useState<Mode>('hitlist');
  const [filter, setFilter] = useState('');

  const shinyDex = useMemo(() => buildShinyDex(pokemonData, showcase), [pokemonData, showcase]);
  const livingCounts = useMemo(() => buildLivingCounts(showcase, pokemonData), [showcase, pokemonData]);

  const filteredDex = useMemo(() => {
    const result: Record<string, DexEntry[]> = {};
    const f = filter.toLowerCase();

    Object.entries(shinyDex).forEach(([region, entries]) => {
      const filtered = entries.filter(entry => {
        if (!f) return true;
        if (f === 'claimed') return entry.claimed;
        if (f === 'unclaimed') return !entry.claimed;
        if (entry.region.toLowerCase() === f) return true;
        return entry.name.toLowerCase().includes(f);
      });

      if (filtered.length) {
        result[region] = filtered;
      }
    });

    return result;
  }, [shinyDex, filter]);

  const totalShown = Object.values(filteredDex).reduce((sum, arr) => sum + arr.length, 0);

  return (
    <>
      <div className="search-controls  mt-[25dvh] md:mt-[10dvh]">
        <input
          type="text"
          placeholder="Search Pokémon or Region"
          value={filter}
          onChange={e => setFilter(e.target.value)}
        />
        <button
          className={`dex-tab ${mode === 'hitlist' ? 'active' : ''}`}
          onClick={() => setMode('hitlist')}
        >
          Hitlist
        </button>
        <button
          className={`dex-tab ${mode === 'living' ? 'active' : ''}`}
          onClick={() => setMode('living')}
        >
          Living Dex
        </button>
        <span className="result-count">{totalShown} Pokémon</span>
      </div>

      <div id="shiny-dex-container">
        {Object.entries(filteredDex).map(([region, entries]) => (
          <section key={region} className="region-section">
            <h2>{region}</h2>
            <div className="dex-grid">
              {entries.map(entry => (
                <UnifiedCard
                  key={entry.name}
                  name={prettifyPokemonName(entry.name)}
                  img={getPokemonGif(entry.name)}
                  info={
                    mode === 'hitlist'
                      ? entry.claimed ? 'Claimed' : 'Unclaimed'
                      : `Owned: ${livingCounts[entry.name] || 0}`
                  }
                  cardType="pokemon"
                  unclaimed={mode === 'hitlist' && !entry.claimed}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
