'use client';

import { useState } from 'react';
import { UnifiedCard } from './UnifiedCard';
import {
  getMemberSprite,
  getPokemonGif,
  prettifyPokemonName,
  type Member,
  type ShinyWeek,
  type ShinyWeeklyEntry
} from '@/lib/utils';

interface ShinyWeeklyPageProps {
  weeks: ShinyWeek[];
  members: Member[];
}

export function ShinyWeeklyPage({ weeks, members }: ShinyWeeklyPageProps) {
  const orderedWeeks = [...weeks].reverse();

  return (
    <div id="shinyweekly-container">
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
