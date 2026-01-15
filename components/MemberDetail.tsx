'use client';

import Link from 'next/link';
import { UnifiedCard } from './UnifiedCard';
import {
  getMemberSprite,
  getPokemonGif,
  normalizePokemonName,
  prettifyPokemonName,
  type Member,
  type MemberShowcase,
  type PokemonData,
  type ShinyEntry
} from '@/lib/utils';

interface MemberDetailProps {
  member: Member;
  showcase: MemberShowcase[];
  pokemonData: PokemonData;
  allMembers: Member[];
}

function getPointsForPokemon(
  name: string,
  extra: ShinyEntry,
  pokemonData: PokemonData
): number {
  if (extra?.alpha) return 50;
  const pts = pokemonData.points[normalizePokemonName(name)];
  return pts || 0;
}

function getMemberPoints(
  member: Member,
  showcase: MemberShowcase[],
  pokemonData: PokemonData
): number {
  const entry = showcase.find(m => m.name.toLowerCase() === member.name.toLowerCase());
  if (!entry?.shinies) return 0;

  return entry.shinies
    .filter(mon => !mon.lost && !mon.sold)
    .reduce(
      (sum, mon) => sum + getPointsForPokemon(mon.name, mon, pokemonData),
      0
    );
}

export function MemberDetail({
  member,
  showcase,
  pokemonData,
  allMembers
}: MemberDetailProps) {
  const entry = showcase.find(m => m.name.toLowerCase() === member.name.toLowerCase());
  const shinies = entry?.shinies || [];
  const activeCount = shinies.filter(s => !s.lost && !s.sold).length;

  return (
    <>
      <Link href="/" className="back-btn">
        Back
      </Link>

      <div className="member-nameplate">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="member-sprite"
          src={getMemberSprite(member.name, allMembers)}
          alt=""
        />
        <span className="member-name">{member.name}</span>
        <span className="shiny-count">Shinies: {activeCount}</span>
        <span className="point-count">
          Points: {getMemberPoints(member, showcase, pokemonData)}
        </span>
      </div>

      <div className="dex-grid">
        {shinies.map((mon, idx) => (
          <UnifiedCard
            key={`${mon.name}-${idx}`}
            name={prettifyPokemonName(mon.name)}
            img={getPokemonGif(mon.name)}
            info={
              mon.sold
                ? 'Sold'
                : mon.lost
                ? 'Lost'
                : `${getPointsForPokemon(mon.name, mon, pokemonData)} Points`
            }
            cardType="pokemon"
            lost={mon.lost || mon.sold}
            symbols={{
              secret: mon.secret,
              safari: mon.safari,
              egg: mon.egg,
              event: mon.event,
              alpha: mon.alpha,
              clip: !!mon.clip
            }}
            clip={mon.clip}
            onClick={mon.clip ? () => window.open(mon.clip, '_blank') : undefined}
          />
        ))}
      </div>
    </>
  );
}
