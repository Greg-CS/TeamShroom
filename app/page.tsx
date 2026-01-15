import { loadMembers, loadShowcase, loadPokemonData } from '@/lib/data';
import { ShowcaseGallery } from '@/components/ShowcaseGallery';

export default async function ShowcasePage() {
  const [members, showcase, pokemonData] = await Promise.all([
    loadMembers(),
    loadShowcase(),
    loadPokemonData()
  ]);

  const activeMembers = members.filter(m => m.active);

  return (
    <ShowcaseGallery
      members={activeMembers}
      showcase={showcase}
      pokemonData={pokemonData}
      allMembers={members}
    />
  );
}
