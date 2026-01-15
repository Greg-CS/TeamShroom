'use client';

import React, { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { UnifiedCard } from './UnifiedCard';
import { ShinyWeeklyScene2D as ShinyWeeklyScene } from './ShinyWeeklyScene2D';
import {
  getMemberSprite,
  getPokemonGif,
  prettifyPokemonName,
  type Member,
  type ShinyWeek,
  type ShinyWeeklyEntry
} from '@/lib/utils';

// Error boundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error('ShinyWeeklyScene error:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="shiny-weekly-scene" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: 'var(--text-muted)',
          fontSize: 'var(--font-small)'
        }}>
          3D Scene unavailable
        </div>
      );
    }

    return this.props.children;
  }
}

// Using 2D scene instead of Three.js to avoid errors

interface ShinyWeeklyPageProps {
  weeks: ShinyWeek[];
  members: Member[];
}

export function ShinyWeeklyPage({ weeks, members }: ShinyWeeklyPageProps) {
  const orderedWeeks = [...weeks].reverse();

  // Collect sprite URLs from the most recent week for the 3D scene
  const sceneSprites = useMemo(() => {
    if (orderedWeeks.length === 0) return [];
    const latestWeek = orderedWeeks[0];
    return latestWeek.shinies.map(s => getPokemonGif(s.name));
  }, [orderedWeeks]);

  return (
    <div id="shinyweekly-container">
      {/* 3D Scene with walking Pokémon */}
      {sceneSprites.length > 0 && (
        <ErrorBoundary>
          <ShinyWeeklyScene pokemonSprites={sceneSprites} />
        </ErrorBoundary>
      )}

      {orderedWeeks.map((week, index) => (
        <WeekCard
          key={week.week}
          week={week}
          members={members}
          defaultOpen={index === 0}
        />
      ))}
    </div>
  );
}

interface WeekCardProps {
  week: ShinyWeek;
  members: Member[];
  defaultOpen: boolean;
}

function WeekCard({ week, members, defaultOpen }: WeekCardProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const byMember: Record<string, ShinyWeeklyEntry[]> = {};
  week.shinies.forEach(s => {
    byMember[s.member] ??= [];
    byMember[s.member].push(s);
  });

  return (
    <div className="weekly-card">
      <div className="weekly-header" onClick={() => setIsOpen(!isOpen)}>
        <div className="weekly-title">{week.label || week.week}</div>
        <div className="weekly-meta">
          {week.shinies.length} Shinies •{' '}
          {new Set(week.shinies.map(s => s.member)).size} Hunters
        </div>
      </div>

      {isOpen && (
        <div className="weekly-body">
          <div className="dex-grid">
            {Object.entries(byMember).map(([member, shinies]) => (
              <MemberShinyToggle
                key={member}
                member={member}
                shinies={shinies}
                members={members}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface MemberShinyToggleProps {
  member: string;
  shinies: ShinyWeeklyEntry[];
  members: Member[];
}

function MemberShinyToggle({ member, shinies, members }: MemberShinyToggleProps) {
  const [state, setState] = useState(-1);

  const handleClick = () => {
    setState(prev => (prev + 1 >= shinies.length ? -1 : prev + 1));
  };

  if (state === -1) {
    return (
      <div onClick={handleClick}>
        <UnifiedCard
          name={member}
          img={getMemberSprite(member, members)}
          info={`Shinies: ${shinies.length}`}
          cardType="member"
        />
      </div>
    );
  }

  const mon = shinies[state];
  return (
    <div onClick={handleClick}>
      <UnifiedCard
        name={prettifyPokemonName(mon.name)}
        img={getPokemonGif(mon.name)}
        info=""
        cardType="pokemon"
        lost={mon.lost}
        symbols={{
          secret: mon.secret,
          safari: mon.safari,
          egg: mon.egg,
          event: mon.event,
          alpha: mon.alpha
        }}
      />
    </div>
  );
}
