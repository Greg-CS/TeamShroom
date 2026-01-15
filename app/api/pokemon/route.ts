import { NextResponse } from 'next/server';
import { loadPokemonData } from '@/lib/data';

export async function GET() {
  try {
    const pokemonData = await loadPokemonData();
    return NextResponse.json(pokemonData);
  } catch (error) {
    console.error('Failed to load pokemon data:', error);
    return NextResponse.json({ error: 'Failed to load pokemon data' }, { status: 500 });
  }
}
