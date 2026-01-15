// lib/data.ts
// Data loading and transformation

import { fetchCSV } from './csv';
import {
  normalizePokemonName,
  normalizeMemberName,
  TIER_POINTS,
  type Member,
  type Donator,
  type MemberShowcase,
  type ShinyEntry,
  type ShinyWeeklyEntry,
  type ShinyWeek,
  type PokemonData
} from './utils';

// CSV URLs
const CSV_BASE = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTB6vHVjwL9_F3DVIVgXxP8rtWEDQyZaDTnG2yAw96j4_1DXU7317lBFaY0N5JnDhdvUnkvgAvb6p8o/pub';

export const CSV_URLS = {
  SHINY_WEEKLY: `${CSV_BASE}?gid=0&single=true&output=csv`,
  DONATORS: `${CSV_BASE}?gid=2068008843&single=true&output=csv`,
  MEMBERS: `${CSV_BASE}?gid=1649506714&single=true&output=csv`,
  SHINY_SHOWCASE: `${CSV_BASE}?gid=1708435858&single=true&output=csv`,
  POKEMON: `${CSV_BASE}?gid=890281184&single=true&output=csv`,
};

/* ---------------------------------------------------------
   MEMBERS
--------------------------------------------------------- */

export async function loadMembers(): Promise<Member[]> {
  const rows = await fetchCSV(CSV_URLS.MEMBERS);
  
  return rows
    .filter(r => r.name)
    .map(r => ({
      name: r.name.trim(),
      key: normalizeMemberName(r.name),
      active: String(r.active).toUpperCase() === 'TRUE',
      sprite: (r.sprite || '').trim().toLowerCase() || null,
      role: (r.role || '').trim()
    }));
}

/* ---------------------------------------------------------
   DONATORS
--------------------------------------------------------- */

export async function loadDonators(): Promise<Donator[]> {
  const rows = await fetchCSV(CSV_URLS.DONATORS);
  
  return rows
    .filter(r => r.name)
    .map(r => ({
      date: r.date || '',
      name: r.name.trim(),
      donation: (r.donation || '').trim(),
      value: r.value || '0'
    }));
}

/* ---------------------------------------------------------
   SHINY SHOWCASE
--------------------------------------------------------- */

export async function loadShowcase(): Promise<MemberShowcase[]> {
  const rows = await fetchCSV(CSV_URLS.SHINY_SHOWCASE);
  
  const memberMap: Record<string, ShinyEntry[]> = {};
  
  rows.forEach(row => {
    const memberName = row.member || row.ot;
    if (!memberName || !row.pokemon) return;
    
    const key = normalizeMemberName(memberName);
    if (!memberMap[key]) {
      memberMap[key] = [];
    }
    
    memberMap[key].push({
      name: row.pokemon,
      lost: String(row.lost).toUpperCase() === 'TRUE',
      sold: String(row.sold).toUpperCase() === 'TRUE',
      secret: String(row.secret).toUpperCase() === 'TRUE',
      safari: String(row.safari).toUpperCase() === 'TRUE',
      egg: String(row.egg).toUpperCase() === 'TRUE',
      event: String(row.event).toUpperCase() === 'TRUE',
      alpha: String(row.alpha).toUpperCase() === 'TRUE',
      clip: row.clip || undefined
    });
  });
  
  return Object.entries(memberMap).map(([key, shinies]) => {
    const firstRow = rows.find(r => normalizeMemberName(r.member || r.ot) === key);
    return {
      name: firstRow?.member || firstRow?.ot || key,
      shinies
    };
  });
}

/* ---------------------------------------------------------
   SHINY WEEKLY
--------------------------------------------------------- */

export async function loadShinyWeekly(): Promise<ShinyWeek[]> {
  const rows = await fetchCSV(CSV_URLS.SHINY_WEEKLY);
  
  const weekMap: Record<string, ShinyWeeklyEntry[]> = {};
  
  rows.forEach(row => {
    if (!row.ot || !row.pokemon) return;
    
    const weekKey = row.week || 'Unknown';
    if (!weekMap[weekKey]) {
      weekMap[weekKey] = [];
    }
    
    weekMap[weekKey].push({
      week: weekKey,
      member: row.ot,
      pokemon: row.pokemon,
      name: row.pokemon,
      ot: row.ot,
      date: row.date,
      lost: String(row.lost).toUpperCase() === 'TRUE',
      secret: String(row.secret).toUpperCase() === 'TRUE',
      safari: String(row.safari).toUpperCase() === 'TRUE',
      egg: String(row.egg).toUpperCase() === 'TRUE',
      event: String(row.event).toUpperCase() === 'TRUE',
      alpha: String(row.alpha).toUpperCase() === 'TRUE',
    });
  });
  
  return Object.entries(weekMap).map(([week, shinies]) => ({
    week,
    label: week,
    shinies
  }));
}

/* ---------------------------------------------------------
   POKEMON DATA
--------------------------------------------------------- */

export async function loadPokemonData(): Promise<PokemonData> {
  const rows = await fetchCSV(CSV_URLS.POKEMON);
  
  const data: PokemonData = {
    points: {},
    tier: {},
    region: {},
    rarity: {},
    show: {},
    families: {},
    tierFamilies: {}
  };
  
  rows.forEach(row => {
    const tier = row.tier;
    if (!tier || !TIER_POINTS[tier]) return;
    
    const familyRaw = row.family;
    if (!familyRaw) return;
    
    const family = familyRaw
      .split(',')
      .map(s => normalizePokemonName(s))
      .filter(Boolean);
    
    if (!family.length) return;
    
    const familyBase = family[0];
    
    if (!data.tierFamilies[tier]) {
      data.tierFamilies[tier] = [];
    }
    if (!data.tierFamilies[tier].includes(familyBase)) {
      data.tierFamilies[tier].push(familyBase);
    }
    
    family.forEach(name => {
      data.families[name] = [...family];
      data.points[name] = TIER_POINTS[tier];
      data.tier[name] = tier;
      data.region[name] = row.region || '';
      data.rarity[name] = row.rarity || '';
      data.show[name] = row.show !== 'FALSE';
    });
  });
  
  return data;
}
