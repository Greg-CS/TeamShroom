'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { UnifiedCard } from './UnifiedCard';
import {
  getMemberSprite,
  normalizePokemonName,
  type Member,
  type MemberShowcase,
  type PokemonData
} from '@/lib/utils';

interface ShowcaseGalleryProps {
  members: Member[];
  showcase: MemberShowcase[];
  pokemonData: PokemonData;
  allMembers: Member[];
}

type SortMode = 'alphabetical' | 'shinies' | 'scoreboard';

function getMemberPoints(
  member: Member,
  showcase: MemberShowcase[],
  pokemonData: PokemonData
): number {
  const entry = showcase.find(m => m.name.toLowerCase() === member.name.toLowerCase());
  if (!entry?.shinies) return 0;

  return entry.shinies
    .filter(mon => !mon.lost && !mon.sold)
    .reduce((sum, mon) => {
      if (mon.alpha) return sum + 50;
      const pts = pokemonData.points[normalizePokemonName(mon.name)];
      return sum + (pts || 0);
    }, 0);
}

function getMemberShinyCount(member: Member, showcase: MemberShowcase[]): number {
  const entry = showcase.find(m => m.name.toLowerCase() === member.name.toLowerCase());
  return entry?.shinies?.filter(s => !s.lost && !s.sold).length || 0;
}

interface GroupedMembers {
  header: string | number;
  members: Member[];
}

function groupAlphabetically(members: Member[]): GroupedMembers[] {
  const map: Record<string, Member[]> = {};
  members.forEach(m => {
    const k = m.name[0].toUpperCase();
    map[k] ??= [];
    map[k].push(m);
  });
  return Object.keys(map)
    .sort()
    .map(k => ({
      header: k,
      members: map[k].sort((a, b) => a.name.localeCompare(b.name))
    }));
}

function groupByCount(members: Member[], showcase: MemberShowcase[]): GroupedMembers[] {
  const map: Record<number, Member[]> = {};
  members.forEach(m => {
    const k = getMemberShinyCount(m, showcase);
    map[k] ??= [];
    map[k].push(m);
  });
  return Object.keys(map)
    .map(Number)
    .sort((a, b) => b - a)
    .map(k => ({
      header: k,
      members: map[k]
    }));
}

function groupByPoints(
  members: Member[],
  showcase: MemberShowcase[],
  pokemonData: PokemonData
): GroupedMembers[] {
  const map: Record<number, Member[]> = {};
  members.forEach(m => {
    const pts = getMemberPoints(m, showcase, pokemonData);
    map[pts] ??= [];
    map[pts].push(m);
  });
  return Object.keys(map)
    .map(Number)
    .sort((a, b) => b - a)
    .map(k => ({
      header: k,
      members: map[k]
    }));
}

export function ShowcaseGallery({
  members,
  showcase,
  pokemonData,
  allMembers
}: ShowcaseGalleryProps) {
  const [search, setSearch] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('alphabetical');

  const filteredMembers = useMemo(() => {
    return members.filter(m =>
      m.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [members, search]);

  const groups = useMemo(() => {
    if (sortMode === 'shinies') {
      return groupByCount(filteredMembers, showcase);
    } else if (sortMode === 'scoreboard') {
      return groupByPoints(filteredMembers, showcase, pokemonData);
    }
    return groupAlphabetically(filteredMembers);
  }, [filteredMembers, sortMode, showcase, pokemonData]);

  return (
    <>
      <div className="showcase-search-controls mt-[25dvh] md:mt-[10dvh]">
        <input
          type="text"
          placeholder="Search Member"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          value={sortMode}
          onChange={e => setSortMode(e.target.value as SortMode)}
        >
          <option value="alphabetical">Alphabetical</option>
          <option value="shinies">Total Shinies</option>
          <option value="scoreboard">Total Points</option>
        </select>
        <span>{filteredMembers.length} Members</span>
      </div>

      <div id="showcase-gallery-container">
        {groups.map(group => (
          <div key={group.header}>
            <div className="showcase-category-header">{group.header}</div>
            <div className="showcase-gallery">
              {group.members.map(member => (
                <Link
                  key={member.key}
                  href={`/showcase/${encodeURIComponent(member.key)}`}
                  style={{ textDecoration: 'none' }}
                >
                  <UnifiedCard
                    name={member.name}
                    img={getMemberSprite(member.name, allMembers)}
                    info={
                      sortMode === 'scoreboard'
                        ? `Points: ${getMemberPoints(member, showcase, pokemonData)}`
                        : `Shinies: ${getMemberShinyCount(member, showcase)}`
                    }
                    cardType="member"
                  />
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
