import { loadShowcase, loadPokemonData } from '@/lib/data';
import { HitlistPage } from '@/components/HitlistPage';

export default async function Hitlist() {
  const [showcase, pokemonData] = await Promise.all([
    loadShowcase(),
    loadPokemonData()
  ]);
  
  return <HitlistPage showcase={showcase} pokemonData={pokemonData} />;
}
