// lib/utils.ts
// Centralized normalization & display helpers

/* ---------------------------------------------------------
   POKÉMON NAME HELPERS
--------------------------------------------------------- */

export function normalizePokemonName(name: string): string {
  if (!name) return "";
  return name
    .toLowerCase()
    .replace(/♀/g, "-f")
    .replace(/♂/g, "-m")
    .replace(/[\s.'']/g, "");
}

export function prettifyPokemonName(input: string): string {
  if (!input) return "";

  const raw = input.toLowerCase();

  if (raw === "nidoran-f" || raw === "nidoranf") return "Nidoran♀";
  if (raw === "nidoran-m" || raw === "nidoranm") return "Nidoran♂";
  if (raw === "mr.mime" || raw === "mrmime") return "Mr. Mime";
  if (raw === "mime-jr" || raw === "mimejr") return "Mime Jr.";
  if (raw === "type-null" || raw === "typenull") return "Type: Null";
  if (raw === "porygon-z" || raw === "porygonz") return "Porygon-Z";

  return raw
    .replace(/-/g, " ")
    .replace(/\b\w/g, c => c.toUpperCase());
}

/* ---------------------------------------------------------
   MEMBER NAME HELPERS
--------------------------------------------------------- */

export function normalizeMemberName(name: string): string {
  if (!name) return "";
  return name.trim().toLowerCase().replace(/\s+/g, "");
}

export function prettifyMemberName(name: string): string {
  if (!name) return "";
  return name.replace(/\b\w/g, c => c.toUpperCase());
}

/* ---------------------------------------------------------
   SPRITE HELPERS
--------------------------------------------------------- */

export function getPokemonGif(name: string): string {
  const n = name.replace(/[\s.''\-]/g, '').toLowerCase();
  const overrides: Record<string, string> = {
    mrmime: 'mr-mime',
    mimejr: 'mime-jr',
    nidoranf: 'nidoran-f',
    nidoranm: 'nidoran-m',
    typenull: 'type-null',
    porygonz: 'porygon-z'
  };
  const key = overrides[n] || normalizePokemonName(name);
  return `https://img.pokemondb.net/sprites/black-white/anim/shiny/${key}.gif`;
}

export function getMemberSprite(memberName: string, membersData: Member[] = []): string {
  const base = normalizeMemberName(memberName);

  const entry = membersData.find(
    m => normalizeMemberName(m.name) === base
  );

  if (!entry || entry.sprite === 'none' || !entry.sprite) {
    return '/img/membersprites/examplesprite.png';
  }

  return `/img/membersprites/${base}sprite.${entry.sprite}`;
}

/* ---------------------------------------------------------
   TYPES
--------------------------------------------------------- */

export interface Member {
  name: string;
  key: string;
  active: boolean;
  sprite: string | null;
  role: string;
}

export interface Donator {
  date: string;
  name: string;
  donation: string;
  value: string;
}

export interface ShinyEntry {
  name: string;
  lost?: boolean;
  sold?: boolean;
  secret?: boolean;
  safari?: boolean;
  egg?: boolean;
  event?: boolean;
  alpha?: boolean;
  clip?: string;
}

export interface MemberShowcase {
  name: string;
  shinies: ShinyEntry[];
  sprite?: string;
}

export interface ShinyWeeklyEntry {
  week: string;
  member: string;
  pokemon: string;
  name: string;
  ot?: string;
  date?: string;
  lost?: boolean;
  secret?: boolean;
  safari?: boolean;
  egg?: boolean;
  event?: boolean;
  alpha?: boolean;
}

export interface ShinyWeek {
  week: string;
  label: string;
  shinies: ShinyWeeklyEntry[];
}

export interface PokemonData {
  points: Record<string, number>;
  tier: Record<string, string>;
  region: Record<string, string>;
  rarity: Record<string, string>;
  show: Record<string, boolean>;
  families: Record<string, string[]>;
  tierFamilies: Record<string, string[]>;
}

export const TIER_POINTS: Record<string, number> = {
  'Tier 6': 2,
  'Tier 5': 3,
  'Tier 4': 6,
  'Tier 3': 10,
  'Tier 2': 15,
  'Tier 1': 25,
  'Tier 0': 30,
  'Tier LM': 100
};
